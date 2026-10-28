<?php
// CTU E-Clinic AI assistant endpoint.
// Tries each configured FREE provider in order and falls back to the next on rate-limit/outage.
// Local XAMPP API keys are kept in the git-ignored api/secret.php file.
if (file_exists(__DIR__ . '/secret.php')) require __DIR__ . '/secret.php';
session_start(); // reuse the login session (login.php sets user_id); no DB needed here
header('Content-Type: application/json');

function fail(int $code, string $msg): void {
    http_response_code($code);
    echo json_encode(['error' => $msg]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail(405, 'Only POST requests are allowed.');

// 1) Only logged-in users may use the clinic assistant.
if (empty($_SESSION['user_id'])) {
    fail(401, 'Please log in to use the clinic assistant.');
}

// 2) Simple per-session rate limit (10 messages / 60 s) so one user can't drain the free tier.
$now = time();
$_SESSION['chat_hits'] = array_values(array_filter($_SESSION['chat_hits'] ?? [], fn($t) => $now - $t < 60));
if (count($_SESSION['chat_hits']) >= 10) fail(429, 'You are sending messages too fast. Please wait a moment.');
$_SESSION['chat_hits'][] = $now;
session_write_close(); // don't hold the session lock during the (slow) AI call

$data     = json_decode(file_get_contents('php://input'), true) ?: [];
$question = trim((string)($data['question'] ?? ''));
$history  = is_array($data['history'] ?? null) ? $data['history'] : [];
if ($question === '') fail(400, 'A question is required.');
if (mb_strlen($question) > 600) fail(400, 'Please keep your message under 600 characters.');

// 3) Emergencies are answered locally, instantly, without involving an AI.
if (preg_match('/\b(chest pain|can\'?t breathe|cannot breathe|difficulty breathing|unconscious|seizure|severe bleeding|overdose|suicid|kill myself|want to die|heart attack|stroke)\b/i', $question)) {
    echo json_encode(['reply' => "This sounds urgent. Please go to the clinic right away or call your local emergency number (911 in the Philippines) now. If you are with someone, ask them to stay with you. I can't help with emergencies through chat."]);
    exit;
}

// 4) System prompt = role + rules + the clinic facts from clinic_info.php.
$info  = require __DIR__ . '/clinic_info.php';
$facts = '';
foreach ($info as $k => $v) $facts .= "- " . str_replace('_', ' ', $k) . ": $v\n";

$system = "You are the CTU E-Clinic assistant for students of Cebu Technological University.\n"
  . "You help with: booking appointments, submitting queries, clinic hours/location, and account access.\n"
  . "Rules:\n"
  . "- Use ONLY the clinic facts below for clinic-specific answers. If a fact is missing or says TODO, say you don't have that information and suggest asking the clinic desk. Never invent hours, names, prices or procedures.\n"
  . "- Never diagnose, recommend medicines or doses, or interpret symptoms. For any health concern, encourage booking an appointment or visiting the clinic. For emergencies, tell them to go to the clinic or call emergency services immediately.\n"
  . "- You cannot see or change anyone's records or appointments; don't claim to.\n"
  . "- Don't ask students to share passwords or medical details in chat.\n"
  . "- Be warm, concise (under 120 words), and reply in the language the student writes in.\n\n"
  . "Clinic facts:\n$facts";

$messages = [['role' => 'system', 'content' => $system]];
// History comes from the browser, so treat it as untrusted: user/assistant roles only, capped in count and size.
foreach (array_slice($history, -8) as $e) {
    if (!is_array($e) || !isset($e['role'], $e['content'])) continue;
    $role = strtolower((string)$e['role']);
    if (!in_array($role, ['user', 'assistant'], true)) continue;
    $messages[] = ['role' => $role, 'content' => mb_substr((string)$e['content'], 0, 600)];
}
$messages[] = ['role' => 'user', 'content' => $question];

// 5) Providers: all speak the OpenAI-compatible /chat/completions format. Models are env-overridable
// because free-tier model names change; check each provider's console if one starts failing.
$providers = [];
if ($k = getenv('GEMINI_API_KEY'))     $providers[] = ['Gemini',     'https://generativelanguage.googleapis.com/v1beta/openai', $k, getenv('GEMINI_MODEL')     ?: 'gemini-2.5-flash'];
if ($k = getenv('GROQ_API_KEY'))       $providers[] = ['Groq',       'https://api.groq.com/openai/v1',                          $k, getenv('GROQ_MODEL')       ?: 'llama-3.3-70b-versatile'];
if ($k = getenv('OPENROUTER_API_KEY')) $providers[] = ['OpenRouter', 'https://openrouter.ai/api/v1',                            $k, getenv('OPENROUTER_MODEL') ?: 'meta-llama/llama-3.3-70b-instruct:free'];
if ($k = getenv('OPENAI_API_KEY'))     $providers[] = ['OpenAI',     getenv('OPENAI_BASE_URL') ?: 'https://api.openai.com/v1',   $k, getenv('AI_MODEL')         ?: 'gpt-4o-mini']; // legacy, paid
if (!$providers) fail(503, 'AI API key missing. Set GEMINI_API_KEY (or GROQ_API_KEY / OPENROUTER_API_KEY) on the server.');

foreach ($providers as [$name, $base, $key, $model]) {
    $headers = ['Content-Type: application/json', 'Authorization: Bearer ' . $key];
    if ($name === 'OpenRouter') { $headers[] = 'HTTP-Referer: ' . (getenv('APP_URL') ?: 'http://localhost'); $headers[] = 'X-Title: CTU E-Clinic'; }

    $ch = curl_init(rtrim($base, '/') . '/chat/completions');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode(['model' => $model, 'messages' => $messages, 'temperature' => 0.4, 'max_tokens' => 400]),
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 25,
        CURLOPT_CONNECTTIMEOUT => 8,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    $response = curl_exec($ch);
    $code     = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err      = curl_error($ch);
    curl_close($ch);

    $result = $response ? json_decode($response, true) : null;
    $reply  = $result['choices'][0]['message']['content'] ?? null;

    if ($code === 200 && $reply) { echo json_encode(['reply' => trim($reply), 'provider' => $name]); exit; }

    // Log details server-side only; never send provider errors or keys to the browser.
    error_log("Chatbot provider $name failed (HTTP $code) $err " . substr((string)$response, 0, 200));
    // Fall through to the next provider (rate limit, outage, bad model name, etc.).
}

fail(503, 'The assistant is busy right now. Please try again in a minute or contact the clinic desk.');