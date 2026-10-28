<?php
// Facts the chatbot is allowed to state. EDIT THESE with your real clinic details.
// The AI is told to say "I don't know, please ask the clinic desk" for anything not listed here,
// so unfilled items never become made-up answers.
return [
    'clinic_name'      => 'CTU E-Clinic',
    'hours'            => 'TODO: e.g. Monday-Friday, 8:00 AM - 5:00 PM',
    'location'         => 'TODO: e.g. Ground floor, Clinic Building, CTU Main Campus',
    'contact'          => 'TODO: clinic phone / email',
    'appointment_help' => 'Students log in, open the Appointments section, choose a date and time, describe the concern, and submit. Status starts as Pending and the clinic Approves or Rejects it; admin notes may appear on the appointment.',
    'query_help'       => 'Students open the Queries section, choose a type, write the message, and submit. The clinic responds there and marks it Resolved.',
    'account_help'     => 'Students can update their password in Account Settings. Forgotten passwords must be reset by the clinic admin.',
];