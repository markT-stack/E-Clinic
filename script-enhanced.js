// ============================================================================
// CTU E-Clinic - Professional Dashboard JavaScript
// ============================================================================

// Global variables
let students = [];
let appointments = [];
let queries = [];
let selectedStudentId = null;
let selectedAppointmentId = null;
let role = sessionStorage.getItem('role');
let studentId = sessionStorage.getItem('studentId');
let activityChart = null;

// ============================================================================
// NOTIFICATION SYSTEM - Professional Toast Notifications
// ============================================================================

function showNotification(message, type = 'info', duration = 3500) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.display = 'block';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, duration);
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'error');
    console.error(message);
}

function showWarning(message) {
    showNotification(message, 'warning');
}

function showInfo(message) {
    showNotification(message, 'info');
}

// ============================================================================
// FORM VALIDATION
// ============================================================================

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    return /^[\d\s\-\+\(\)]{7,}$/.test(phone);
}

function validateDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date instanceof Date && !isNaN(date) && date >= today;
}

function validateStudentForm() {
    const name = document.getElementById('name')?.value.trim();
    const idNumber = document.getElementById('idNumber')?.value.trim();
    const course = document.getElementById('course')?.value.trim();
    const section = document.getElementById('section')?.value.trim();

    if (!name || !idNumber || !course || !section) {
        showWarning('Please fill in all required fields');
        return false;
    }
    return true;
}

function getAppointmentFormValues() {
    const date = document.getElementById('appointmentDate')?.value;
    const time = document.getElementById('appointmentTime')?.value;
    const concern = document.getElementById('concern')?.value;
    const notes = document.getElementById('appointmentNotes')?.value.trim() || '';

    let name = '';
    let id = '';

    if (role === 'admin') {
        name = document.getElementById('studentName')?.value.trim() || '';
        id = document.getElementById('studentId')?.value.trim() || '';
    } else {
        name = document.getElementById('fullName')?.value.trim() || sessionStorage.getItem('currentUser') || '';
        id = document.getElementById('studentIdInput')?.value.trim() || studentId || '';
    }

    return { name, id, date, time, concern, notes };
}

function validateAppointmentForm() {
    const { name, id, date, time, concern } = getAppointmentFormValues();

    if (!name || !id || !date || !time || !concern) {
        showWarning('Please fill in all required fields');
        return false;
    }

    if (!validateDate(date)) {
        showWarning('Please select a future date');
        return false;
    }

    return true;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getWeeklyAppointments() {
    const weekData = [0, 0, 0, 0, 0, 0, 0];
    appointments.forEach(a => {
        if (a.date) {
            const day = new Date(a.date).getDay();
            weekData[day === 0 ? 6 : day - 1]++;
        }
    });
    return weekData;
}

function formatDate(dateString) {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function formatTime(timeString) {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

function formatDateTime(dateString, timeString) {
    return `${formatDate(dateString)} at ${formatTime(timeString)}`;
}

// ============================================================================
// FORM CLEARING FUNCTIONS
// ============================================================================

function clearStudentForm() {
    const form = document.querySelector('.student-form');
    if (form) {
        form.querySelectorAll('input').forEach(input => input.value = '');
    }
    selectedStudentId = null;
    setStudentFormMode(false);
}

function clearAppointmentForm() {
    const form = document.querySelector('.appointment-form');
    if (form) {
        form.querySelectorAll('input:not([readonly])').forEach(input => input.value = '');
        form.querySelectorAll('select').forEach(select => select.value = '');
        form.querySelectorAll('textarea').forEach(textarea => textarea.value = '');
    }
    if (role === 'student' && document.getElementById('studentId')) {
        document.getElementById('studentId').value = studentId || '';
    }
    selectedAppointmentId = null;
    setAppointmentMode(false);
}

function clearStudentInfoForm() {
    const form = document.querySelector('.student-info-form');
    if (form) {
        form.querySelectorAll('input:not([readonly])').forEach(input => input.value = '');
        form.querySelectorAll('textarea').forEach(textarea => textarea.value = '');
    }
}

function getStudentProfileKey() {
    return `ctu_eclinic_profile_${studentId || 'guest'}`;
}

function getQueryStorageKey() {
    return 'ctu_eclinic_queries';
}

function getCurrentUserDisplayName() {
    return document.getElementById('fullName')?.value.trim() || sessionStorage.getItem('currentUser') || 'Student';
}

function loadStudentProfile() {
    const profile = JSON.parse(localStorage.getItem(getStudentProfileKey()) || '{}');

    const fields = [
        'fullName',
        'course',
        'section',
        'contactNumber',
        'emailAddress',
        'allergies',
        'medications',
        'medicalConditions'
    ];

    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.value = profile[field] || element.value || '';
        }
    });

    const studentIdInput = document.getElementById('studentIdInput');
    if (studentIdInput) {
        studentIdInput.value = studentId || '';
    }

    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        usernameInput.value = sessionStorage.getItem('currentUser') || '';
    }
}

function saveStudentInfo() {
    const fullName = document.getElementById('fullName')?.value.trim();
    const course = document.getElementById('course')?.value.trim();
    const section = document.getElementById('section')?.value.trim();
    const contactNumber = document.getElementById('contactNumber')?.value.trim();
    const emailAddress = document.getElementById('emailAddress')?.value.trim();
    const allergies = document.getElementById('allergies')?.value.trim();
    const medications = document.getElementById('medications')?.value.trim();
    const medicalConditions = document.getElementById('medicalConditions')?.value.trim();

    if (!fullName || !course || !section || !contactNumber || !emailAddress) {
        showWarning('Please complete all required personal information fields.');
        return;
    }

    if (!validateEmail(emailAddress)) {
        showWarning('Please enter a valid email address.');
        return;
    }

    if (!validatePhone(contactNumber)) {
        showWarning('Please enter a valid contact number.');
        return;
    }

    const profile = {
        fullName,
        course,
        section,
        contactNumber,
        emailAddress,
        allergies,
        medications,
        medicalConditions
    };

    localStorage.setItem(getStudentProfileKey(), JSON.stringify(profile));
    showSuccess('Personal information saved locally.');
}

async function loadQueries() {
    try {
        const url = role === 'admin' ? 'api/queries.php' : `api/queries.php?student_id=${studentId}`;
        const response = await fetch(url);
        if (response.ok) {
            queries = await response.json();
        } else {
            console.error('Failed to load queries');
            queries = [];
        }
    } catch (error) {
        console.error('Error loading queries:', error);
        queries = [];
    }
}

// saveQueries is no longer needed with API
function saveQueries() {
    // Data is saved via API calls
}

function renderQueriesTable() {
    const tbody = document.getElementById('queriesTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const displayQueries = role === 'admin' ? queries : queries.filter(q => q.student_id === studentId);

    if (displayQueries.length === 0) {
        const colspan = role === 'admin' ? 7 : 6;
        tbody.innerHTML = `<tr><td colspan="${colspan}" style="text-align:center; padding: 20px;">No queries found</td></tr>`;
        return;
    }

    displayQueries.forEach(query => {
        const submittedAt = query.submitted_at
            ? `${formatDate(query.submitted_at.split(' ')[0])} ${new Date(query.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : 'Unknown';
        const actionButtons = role === 'admin'
            ? `<button class="edit" onclick="resolveQuery(${query.id})">Resolve</button><button class="delete" onclick="deleteQueryEntry(${query.id})">Delete</button>`
            : `<button class="delete" onclick="deleteQueryEntry(${query.id})">Cancel</button>`;

        if (role === 'admin') {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${query.student_name || 'Student'}</td>
                <td>${query.student_id || ''}</td>
                <td>${query.type}</td>
                <td>${query.message}</td>
                <td>${submittedAt}</td>
                <td><span class="status-badge ${query.status === 'Resolved' ? 'resolved' : 'pending'}">${query.status}</span></td>
                <td>${actionButtons}</td>
            `;
            tbody.appendChild(tr);
        } else {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${submittedAt}</td>
                <td>${query.type}</td>
                <td>${query.message}</td>
                <td><span class="status-badge ${query.status === 'Resolved' ? 'resolved' : 'pending'}">${query.status}</span></td>
                <td>${query.response || 'No response yet'}</td>
                <td>${actionButtons}</td>
            `;
            tbody.appendChild(tr);
        }
    });
}

async function submitQuery() {
    const queryType = document.getElementById('queryType')?.value;
    const queryMessage = document.getElementById('queryMessage')?.value.trim();

    if (!queryType || !queryMessage) {
        showWarning('Please provide a query type and message.');
        return;
    }

    try {
        const response = await fetch('api/queries.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                student_id: studentId,
                student_name: getCurrentUserDisplayName(),
                type: queryType,
                message: queryMessage
            })
        });

        const result = await response.json();
        if (result.success) {
            showSuccess('Query submitted successfully.');
            document.getElementById('queryType').value = '';
            document.getElementById('queryMessage').value = '';
            await loadQueries();
            renderQueriesTable();
        } else {
            showError(result.message || 'Failed to submit query');
        }
    } catch (error) {
        showError('Error submitting query: ' + error.message);
    }
}

async function resolveQuery(id) {
    try {
        const response = await fetch('api/queries.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: id,
                status: 'Resolved',
                response: 'Your query has been reviewed. The clinic staff will follow up shortly.'
            })
        });

        const result = await response.json();
        if (result.success) {
            showSuccess('Query marked as resolved.');
            await loadQueries();
            renderQueriesTable();
        } else {
            showError(result.message || 'Failed to resolve query');
        }
    } catch (error) {
        showError('Error resolving query: ' + error.message);
    }
}

async function deleteQueryEntry(id) {
    const query = queries.find(q => q.id === id);
    if (!query) {
        showWarning('Query not found');
        return;
    }

    if (role !== 'admin' && query.student_id !== studentId) {
        showWarning('Unauthorized');
        return;
    }

    if (!confirm('Are you sure you want to delete this query?')) {
        return;
    }

    try {
        const response = await fetch(`api/queries.php?id=${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        if (result.success) {
            showSuccess('Query deleted successfully.');
            await loadQueries();
            renderQueriesTable();
        } else {
            showError(result.message || 'Failed to delete query');
        }
    } catch (error) {
        showError('Error deleting query: ' + error.message);
    }
}

function updatePassword() {
    const currentPassword = document.getElementById('currentPassword')?.value.trim();
    const newPassword = document.getElementById('newPassword')?.value.trim();
    const confirmPassword = document.getElementById('confirmPassword')?.value.trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
        showWarning('Please fill in all password fields.');
        return;
    }

    if (newPassword !== confirmPassword) {
        showWarning('New password and confirmation do not match.');
        return;
    }

    if (newPassword.length < 6) {
        showWarning('Password must be at least 6 characters.');
        return;
    }

    showSuccess('Password updated locally. Backend password changes are not configured yet.');
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

// ============================================================================
// FORM MODE HANDLERS
// ============================================================================

function setStudentFormMode(editMode) {
    const addButton = document.querySelector('.student-form button[onclick="addStudent()"]');
    const updateButton = document.querySelector('.student-form button[onclick="updateStudent()"]');
    if (addButton) addButton.style.display = editMode ? 'none' : 'inline-block';
    if (updateButton) updateButton.style.display = editMode ? 'inline-block' : 'none';
}

function setAppointmentMode(editMode) {
    const button = document.querySelector('.appointment-form button[onclick="saveAppointment()"]');
    if (button) {
        button.textContent = editMode ? 'Update Appointment' : 'Schedule Appointment';
    }
}

// ============================================================================
// ACTIVITY TRACKING
// ============================================================================

function addActivity(action) {
    const tbody = document.getElementById('activityTable');
    if (!tbody) return;
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${sessionStorage.getItem('currentUser') || 'System'}</td>
        <td>${action}</td>
        <td>${new Date().toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
    `;
    tbody.prepend(tr);
    // Keep only last 10 activities
    while (tbody.children.length > 10) {
        tbody.removeChild(tbody.lastChild);
    }
}

// ============================================================================
// DASHBOARD UPDATES
// ============================================================================

function updateDashboard() {
    const totalStudentsEl = document.getElementById('totalStudents');
    const totalQueriesEl = document.getElementById('totalQueries');
    const totalAppointmentsEl = document.getElementById('totalAppointments');
    const todayAppointmentsEl = document.getElementById('todayAppointments');

    if (totalStudentsEl) totalStudentsEl.innerText = students.length;
    if (totalQueriesEl) totalQueriesEl.innerText = role === 'admin' ? queries.length : queries.filter(q => q.student_id === studentId).length || 0;
    if (totalAppointmentsEl) {
        const approvedCount = appointments.filter(a => a.status === 'Approved').length;
        totalAppointmentsEl.innerText = role === 'admin' ? approvedCount : appointments.filter(a => a.student_id === studentId && a.status === 'Approved').length;
    }

    if (todayAppointmentsEl) {
        if (role === 'admin') {
            const pendingCount = appointments.filter(a => a.status === 'Pending').length;
            todayAppointmentsEl.innerText = pendingCount;
        } else {
            const today = new Date().toISOString().split('T')[0];
            const todayCount = appointments.filter(a => a.date === today && a.status === 'Approved').length;
            todayAppointmentsEl.innerText = todayCount;
        }
    }

    if (activityChart) {
        try {
            activityChart.data.datasets[0].data = getWeeklyAppointments();
            activityChart.update();
        } catch (e) {
            console.warn('Chart update failed:', e);
        }
    }
}

// ============================================================================
// API CALLS - LOAD DATA
// ============================================================================

async function loadData() {
    try {
        // Load students (admin only)
        if (role === 'admin') {
            const studentsRes = await fetch('api/students.php', { credentials: 'same-origin' });
            if (!studentsRes.ok) {
                console.warn('Students API returned:', studentsRes.status);
            } else {
                students = await studentsRes.json() || [];
            }
        } else {
            students = [];
        }

        // Load appointments
        const appointmentsRes = await fetch('api/appointments.php', { credentials: 'same-origin' });
        if (!appointmentsRes.ok) {
            console.warn('Appointments API returned:', appointmentsRes.status);
        } else {
            appointments = await appointmentsRes.json() || [];
        }

        // Render tables
        renderStudentTable();
        renderAppointmentTable();

        // Initialize chart
        try {
            initializeChart();
        } catch (chartError) {
            console.warn('Chart initialization failed:', chartError);
            const chartErrorElem = document.getElementById('chartErrorMessage');
            if (chartErrorElem) {
                chartErrorElem.textContent = 'Chart could not be displayed at this time.';
                chartErrorElem.style.display = 'block';
            }
        }

        loadStudentProfile();
        await loadQueries();
        renderQueriesTable();

        updateDashboard();

        // Set student ID if applicable
        if (role === 'student') {
            const studentIdInputs = document.querySelectorAll('#studentIdInput, [name="studentId"]');
            studentIdInputs.forEach(input => {
                if (input && input.hasAttribute('readonly')) {
                    input.value = studentId || '';
                }
            });
        }
    } catch (error) {
        showError('Error loading data: ' + error.message);
    }
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

async function logout() {
    try {
        await fetch('api/logout.php', { credentials: 'same-origin' });
    } catch (error) {
        console.error('Logout API failed:', error);
    } finally {
        sessionStorage.clear();
        window.location.href = 'landing.html';
    }
}

// ============================================================================
// STUDENT MANAGEMENT (ADMIN)
// ============================================================================

async function addStudent() {
    if (role !== 'admin') {
        showWarning('Unauthorized');
        return;
    }

    if (!validateStudentForm()) return;

    const name = document.getElementById('name').value.trim();
    const idNumber = document.getElementById('idNumber').value.trim();
    const course = document.getElementById('course').value.trim();
    const section = document.getElementById('section').value.trim();

    try {
        const response = await fetch('api/students.php', {
            credentials: 'same-origin',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, idNumber, course, section })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to add student');
        }

        showSuccess(`Student "${name}" added successfully`);
        await loadData();
        addActivity(`Added student: ${name}`);
        clearStudentForm();
    } catch (error) {
        showError(error.message);
    }
}

async function updateStudent() {
    if (role !== 'admin' || !selectedStudentId) return;

    if (!validateStudentForm()) return;

    const name = document.getElementById('name').value.trim();
    const idNumber = document.getElementById('idNumber').value.trim();
    const course = document.getElementById('course').value.trim();
    const section = document.getElementById('section').value.trim();

    try {
        const response = await fetch('api/students.php', {
            credentials: 'same-origin',
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: selectedStudentId, name, idNumber, course, section })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update student');
        }

        showSuccess(`Student "${name}" updated successfully`);
        await loadData();
        addActivity(`Updated student: ${name}`);
        clearStudentForm();
    } catch (error) {
        showError(error.message);
    }
}

function editStudent(id) {
    const student = students.find(s => s.id == id);
    if (!student) {
        showWarning('Student not found');
        return;
    }

    selectedStudentId = id;
    document.getElementById('name').value = student.name;
    document.getElementById('idNumber').value = student.student_id;
    document.getElementById('course').value = student.course;
    document.getElementById('section').value = student.section;
    setStudentFormMode(true);
    window.scrollTo(0, 0);
}

async function deleteStudent(id) {
    if (role !== 'admin') {
        showWarning('Unauthorized');
        return;
    }

    const student = students.find(s => s.id == id);
    if (!student) {
        showWarning('Student not found');
        return;
    }

    if (!confirm(`Are you sure you want to delete ${student.name}? This action cannot be undone.`)) {
        return;
    }

    try {
        const response = await fetch(`api/students.php?id=${id}`, {
            credentials: 'same-origin',
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete student');
        }

        showSuccess(`Student "${student.name}" deleted successfully`);
        await loadData();
        addActivity(`Deleted student: ${student.name}`);
    } catch (error) {
        showError(error.message);
    }
}

function renderStudentTable() {
    const tbody = document.getElementById('studentTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">No students found</td></tr>';
        return;
    }

    students.forEach((s) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${s.name}</td>
            <td>${s.student_id}</td>
            <td>${s.course}</td>
            <td>${s.section}</td>
            <td>
                <button class="edit" onclick="editStudent(${s.id})">Edit</button>
                <button class="delete" onclick="deleteStudent(${s.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ============================================================================
// APPOINTMENT MANAGEMENT
// ============================================================================

async function saveAppointment() {
    if (selectedAppointmentId) {
        await updateAppointment();
    } else {
        await addAppointment();
    }
}

async function addAppointment() {
    if (!validateAppointmentForm()) return;

    const { name, id, date, time, concern } = getAppointmentFormValues();

    if (role !== 'admin' && id !== studentId) {
        showWarning('You can only book appointments for yourself');
        return;
    }

    try {
        const response = await fetch('api/appointments.php', {
            credentials: 'same-origin',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, id, date, time, concern })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to schedule appointment');
        }

        showSuccess(`Appointment scheduled for ${formatDateTime(date, time)}`);
        await loadData();
        addActivity(`Scheduled appointment for ${name} on ${formatDate(date)}`);
        clearAppointmentForm();
    } catch (error) {
        showError(error.message);
    }
}

async function updateAppointment() {
    if (!selectedAppointmentId) return;

    if (!validateAppointmentForm()) return;

    const { name, id, date, time, concern } = getAppointmentFormValues();

    if (role !== 'admin' && id !== studentId) {
        showWarning('You can only update your own appointments');
        return;
    }

    try {
        const response = await fetch('api/appointments.php', {
            credentials: 'same-origin',
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: selectedAppointmentId, name, student_id: id, date, time, concern })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update appointment');
        }

        showSuccess('Appointment updated successfully');
        await loadData();
        addActivity(`Updated appointment for ${name}`);
        clearAppointmentForm();
    } catch (error) {
        showError(error.message);
    }
}

function editAppointment(id) {
    const appointment = appointments.find(a => a.id == id);
    if (!appointment) {
        showWarning('Appointment not found');
        return;
    }

    if (role !== 'admin' && appointment.student_id !== studentId) {
        showWarning('Unauthorized');
        return;
    }

    selectedAppointmentId = id;
    document.getElementById('appointmentDate').value = appointment.date;
    document.getElementById('appointmentTime').value = appointment.time;
    document.getElementById('concern').value = appointment.concern;

    if (role === 'admin') {
        const studentNameInput = document.getElementById('studentName');
        const studentIdInput = document.getElementById('studentId');
        if (studentNameInput) studentNameInput.value = appointment.name;
        if (studentIdInput) studentIdInput.value = appointment.student_id;
    } else {
        const fullNameInput = document.getElementById('fullName');
        const studentIdInput = document.getElementById('studentIdInput');
        if (fullNameInput) fullNameInput.value = appointment.name;
        if (studentIdInput) studentIdInput.value = appointment.student_id;
    }

    setAppointmentMode(true);
    window.scrollTo(0, 0);
}

async function deleteAppointment(id) {
    const appointment = appointments.find(a => a.id == id);
    if (!appointment) {
        showWarning('Appointment not found');
        return;
    }

    if (role !== 'admin' && appointment.student_id !== studentId) {
        showWarning('Unauthorized');
        return;
    }

    if (!confirm(`Are you sure you want to delete the appointment for ${appointment.name} on ${formatDate(appointment.date)}?`)) {
        return;
    }

    try {
        const response = await fetch(`api/appointments.php?id=${id}`, {
            credentials: 'same-origin',
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete appointment');
        }

        showSuccess('Appointment deleted successfully');
        await loadData();
        addActivity(`Deleted appointment for ${appointment.name}`);
        clearAppointmentForm();
    } catch (error) {
        showError(error.message);
    }
}

async function updateAppointmentStatus(id, status) {
    if (role !== 'admin') {
        showError('Unauthorized');
        return;
    }

    const adminNotes = status === 'Rejected' ? prompt('Enter reason for rejection (optional):') : '';

    try {
        const response = await fetch('api/appointments.php', {
            credentials: 'same-origin',
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status, admin_notes: adminNotes })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update appointment status');
        }

        showSuccess(`Appointment ${status.toLowerCase()} successfully`);
        await loadData();
    } catch (error) {
        showError(error.message);
    }
}

function renderAppointmentTable() {
    const tbody = document.querySelector('#appointmentTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const displayAppointments = role === 'admin' ? appointments : appointments.filter(a => a.student_id === studentId);
    const isAdminTable = role === 'admin';

    if (displayAppointments.length === 0) {
        const columnCount = isAdminTable ? 7 : 5;
        tbody.innerHTML = `<tr><td colspan="${columnCount}" style="text-align:center; padding: 20px;">No appointments found</td></tr>`;
        return;
    }

    displayAppointments.forEach((a) => {
        const canEdit = role === 'admin' || (a.student_id === studentId && a.status === 'Pending');
        const editBtn = canEdit ? `<button class="edit" onclick="editAppointment(${a.id})">Edit</button>` : '';
        const deleteBtn = canEdit ? `<button class="delete" onclick="deleteAppointment(${a.id})">Delete</button>` : '';
        let actionButtons = `${editBtn} ${deleteBtn}`.trim();
        
        // Add approve/reject buttons for admin
        if (role === 'admin' && a.status === 'Pending') {
            actionButtons += ` <button class="approve" onclick="updateAppointmentStatus(${a.id}, 'Approved')">Approve</button>`;
            actionButtons += ` <button class="reject" onclick="updateAppointmentStatus(${a.id}, 'Rejected')">Reject</button>`;
        }
        
        const statusClass = a.status === 'Approved' ? 'resolved' : (a.status === 'Rejected' ? 'error' : 'pending');
        const statusBadge = `<span class="status-badge ${statusClass}">${a.status}</span>`;

        const tr = document.createElement('tr');
        if (isAdminTable) {
            tr.innerHTML = `
                <td>${a.name}</td>
                <td>${a.student_id}</td>
                <td>${formatDate(a.date)}</td>
                <td>${formatTime(a.time)}</td>
                <td>${a.concern}</td>
                <td>${statusBadge}</td>
                <td>${actionButtons}</td>
            `;
        } else {
            tr.innerHTML = `
                <td>${formatDate(a.date)}</td>
                <td>${formatTime(a.time)}</td>
                <td>${a.concern}</td>
                <td>${statusBadge}</td>
                <td>${actionButtons}</td>
            `;
        }

        tbody.appendChild(tr);
    });
}

// ============================================================================
// CHART INITIALIZATION
// ============================================================================

function initializeChart() {
    const chartElement = document.getElementById('activityChart');
    if (!chartElement) return;

    const ctx = chartElement.getContext('2d');
    if (!ctx) return;

    if (activityChart) {
        try {
            activityChart.destroy();
        } catch (e) {
            console.warn('Chart destroy failed:', e);
        }
        activityChart = null;
    }

    activityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            datasets: [{
                label: 'Appointments',
                data: getWeeklyAppointments(),
                borderColor: '#1e88e5',
                backgroundColor: 'rgba(30, 136, 229, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#1e88e5',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

async function init() {
    // Check if logged in
    if (sessionStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // Ensure user is on the correct dashboard based on role
    const currentPage = window.location.pathname.split('/').pop();
    if (role === 'admin' && currentPage === 'student-dashboard.html') {
        window.location.href = 'admin-dashboard.html';
        return;
    } else if (role === 'student' && currentPage === 'admin-dashboard.html') {
        window.location.href = 'student-dashboard.html';
        return;
    }

    // Hide admin-only elements for non-admin users
    if (role !== 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }

    // Initialize form modes
    setStudentFormMode(false);
    setAppointmentMode(false);

    // Setup logout
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', (event) => {
            event.preventDefault();
            logout();
        });
    }

    // Load data
    await loadData();

    // Prevent double initialization
    window.initComplete = true;
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init());
} else {
    init();
}


// ============================================================================
// EXPORT FUNCTIONS TO GLOBAL SCOPE
// ============================================================================

// Core functions
window.logout = logout;
window.showSuccess = showSuccess;
window.showError = showError;
window.showWarning = showWarning;

// Student management
window.addStudent = addStudent;
window.updateStudent = updateStudent;
window.editStudent = editStudent;
window.deleteStudent = deleteStudent;

// Appointment management
window.saveAppointment = saveAppointment;
window.addAppointment = addAppointment;
window.updateAppointment = updateAppointment;
window.editAppointment = editAppointment;
window.deleteAppointment = deleteAppointment;

// Form utilities
window.clearStudentForm = clearStudentForm;
window.clearAppointmentForm = clearAppointmentForm;
window.clearStudentInfoForm = clearStudentInfoForm;
window.saveStudentInfo = saveStudentInfo;
window.submitQuery = submitQuery;
window.updatePassword = updatePassword;
window.resolveQuery = resolveQuery;
window.deleteQueryEntry = deleteQueryEntry;
