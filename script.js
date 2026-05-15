let students = [];
let appointments = [];
let selectedStudentId = null;
let selectedAppointmentId = null;
let role = sessionStorage.getItem('role');
let studentId = sessionStorage.getItem('studentId');
let activityChart = null;

const currentDashboardPage = window.location.pathname.split('/').pop();
if (currentDashboardPage === 'dashboard.html') {
    if (role === 'admin') {
        window.location.replace('admin-dashboard.html');
    } else if (role === 'student') {
        window.location.replace('student-dashboard.html');
    }
}

window.addEventListener('error', (event) => {
    if (event.message && event.message.includes('Canvas is already in use')) {
        const chartError = document.getElementById('chartErrorMessage');
        if (chartError) {
            chartError.textContent = 'Chart could not be rendered because the dashboard chart is already active. Please refresh the page if it does not appear.';
            chartError.style.display = 'block';
        }
        event.preventDefault();
        return true;
    }
});

function showError(message) {
    alert(message);
    console.error(message);
}

function getWeeklyAppointments() {
    const weekData = [0, 0, 0, 0, 0, 0, 0];
    appointments.forEach(a => {
        const day = new Date(a.date).getDay();
        weekData[day === 0 ? 6 : day - 1]++;
    });
    return weekData;
}

function setStudentFormMode(editMode) {
    const addButton = document.querySelector('.student-form button[onclick="addStudent()"]');
    const updateButton = document.querySelector('.student-form button[onclick="updateStudent()"]');
    if (addButton) addButton.style.display = editMode ? 'none' : 'inline-block';
    if (updateButton) updateButton.style.display = editMode ? 'inline-block' : 'none';
}

function setAppointmentMode(editMode) {
    const button = document.querySelector('.appointment-form button');
    if (!button) return;
    button.textContent = editMode ? 'Update Appointment' : 'Schedule';
}

function clearStudentForm() {
    document.getElementById('name').value = '';
    document.getElementById('idNumber').value = '';
    document.getElementById('course').value = '';
    document.getElementById('section').value = '';
    selectedStudentId = null;
    setStudentFormMode(false);
}

function clearAppointmentForm() {
    document.getElementById('studentName').value = '';
    document.getElementById('studentId').value = role === 'student' ? studentId || '' : '';
    document.getElementById('appointmentDate').value = '';
    document.getElementById('appointmentTime').value = '';
    document.getElementById('concern').value = '';
    selectedAppointmentId = null;
    setAppointmentMode(false);
}

function addActivity(action) {
    const tbody = document.getElementById('activityTable');
    if (!tbody) return;
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${sessionStorage.getItem('currentUser') || 'User'}</td>
        <td>${action}</td>
        <td>${new Date().toLocaleString()}</td>
    `;
    tbody.prepend(tr);
}

function updateDashboard() {
    document.getElementById('totalStudents').innerText = students.length;
    document.getElementById('totalQueries').innerText = document.querySelectorAll('#activityTable tr').length;
    document.getElementById('totalAppointments').innerText = appointments.length;
    const today = new Date().toISOString().split('T')[0];
    const todayCount = appointments.filter(a => a.date === today).length;
    document.getElementById('todayAppointments').innerText = todayCount;

    if (activityChart) {
        activityChart.data.datasets[0].data = getWeeklyAppointments();
        activityChart.update();
    }
}

async function loadData() {
    try {
        if (role === 'admin') {
            const studentsRes = await fetch('api/students.php', { credentials: 'same-origin' });
            if (!studentsRes.ok) {
                throw new Error('Unable to load students');
            }
            students = await studentsRes.json();
        } else {
            students = [];
        }

        const appointmentsRes = await fetch('api/appointments.php', { credentials: 'same-origin' });
        if (!appointmentsRes.ok) {
            throw new Error('Unable to load appointments');
        }
        appointments = await appointmentsRes.json();

        renderStudentTable();
        renderAppointmentTable();

        try {
            initializeChart();
        } catch (chartError) {
            console.warn('Chart initialization failed:', chartError);
            const chartErrorElem = document.getElementById('chartErrorMessage');
            if (chartErrorElem) {
                chartErrorElem.textContent = 'The activity chart could not be displayed. It may already be in use or failed to load.';
                chartErrorElem.style.display = 'block';
            }
        }

        updateDashboard();

        if (role === 'student') {
            const studentIdInput = document.getElementById('studentId');
            if (studentIdInput) {
                studentIdInput.value = studentId || '';
            }
        }
    } catch (error) {
        showError('Error loading data: ' + error.message);
    }
}

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

async function addStudent() {
    if (role !== 'admin') {
        alert('Unauthorized');
        return;
    }

    const name = document.getElementById('name').value.trim();
    const idNumber = document.getElementById('idNumber').value.trim();
    const course = document.getElementById('course').value.trim();
    const section = document.getElementById('section').value.trim();

    if (!name || !idNumber || !course || !section) {
        alert('Please fill all fields');
        return;
    }

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
        await loadData();
        addActivity(`Student ${name} added.`);
        clearStudentForm();
    } catch (error) {
        showError(error.message);
    }
}

async function updateStudent() {
    if (role !== 'admin' || !selectedStudentId) return;

    const name = document.getElementById('name').value.trim();
    const idNumber = document.getElementById('idNumber').value.trim();
    const course = document.getElementById('course').value.trim();
    const section = document.getElementById('section').value.trim();

    if (!name || !idNumber || !course || !section) {
        alert('Please fill all fields');
        return;
    }

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
        await loadData();
        addActivity(`Student ${name} updated.`);
        clearStudentForm();
    } catch (error) {
        showError(error.message);
    }
}

async function deleteStudent(id) {
    if (role !== 'admin') {
        alert('Unauthorized');
        return;
    }
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
        const response = await fetch(`api/students.php?id=${id}`, { credentials: 'same-origin', method: 'DELETE' });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete student');
        }
        await loadData();
        addActivity('Student deleted.');
    } catch (error) {
        showError(error.message);
    }
}

async function addAppointment() {
    const name = document.getElementById('studentName').value.trim();
    const id = document.getElementById('studentId').value.trim();
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;
    const concern = document.getElementById('concern').value;

    if (!name || !id || !date || !time || !concern) {
        alert('Please fill all fields');
        return;
    }

    if (role !== 'admin' && id !== studentId) {
        alert('You can only book appointments for yourself');
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
        await loadData();
        addActivity(`Appointment scheduled for ${name} on ${date}`);
        clearAppointmentForm();
    } catch (error) {
        showError(error.message);
    }
}

function editStudent(id) {
    const student = students.find(s => s.id == id);
    if (!student) return;

    selectedStudentId = id;
    document.getElementById('name').value = student.name;
    document.getElementById('idNumber').value = student.student_id;
    document.getElementById('course').value = student.course;
    document.getElementById('section').value = student.section;
    setStudentFormMode(true);
}

function renderStudentTable() {
    const tbody = document.getElementById('studentTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    students.forEach((s) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${s.name}</td>
            <td>${s.student_id}</td>
            <td>${s.course}</td>
            <td>${s.section}</td>
            <td>
                <button onclick="editStudent(${s.id})">Edit</button>
                <button onclick="deleteStudent(${s.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function editAppointment(id) {
    const appointment = appointments.find(a => a.id == id);
    if (!appointment) return;
    if (role !== 'admin' && appointment.student_id !== studentId) {
        alert('Unauthorized');
        return;
    }

    selectedAppointmentId = id;
    document.getElementById('studentName').value = appointment.name;
    document.getElementById('studentId').value = appointment.student_id;
    document.getElementById('appointmentDate').value = appointment.date;
    document.getElementById('appointmentTime').value = appointment.time;
    document.getElementById('concern').value = appointment.concern;
    setAppointmentMode(true);
}

async function updateAppointment() {
    if (!selectedAppointmentId) return;

    const name = document.getElementById('studentName').value.trim();
    const id = document.getElementById('studentId').value.trim();
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;
    const concern = document.getElementById('concern').value;

    if (!name || !id || !date || !time || !concern) {
        alert('Please fill all fields');
        return;
    }

    if (role !== 'admin' && id !== studentId) {
        alert('You can only update your own appointments');
        return;
    }

    try {
        const response = await fetch('api/appointments.php', {
            credentials: 'same-origin',
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: selectedAppointmentId, name, id, date, time, concern })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update appointment');
        }
        await loadData();
        addActivity(`Appointment updated for ${name} on ${date}`);
        clearAppointmentForm();
    } catch (error) {
        showError(error.message);
    }
}

async function saveAppointment() {
    if (selectedAppointmentId) {
        await updateAppointment();
    } else {
        await addAppointment();
    }
}

async function deleteAppointment(id) {
    const appointment = appointments.find(a => a.id == id);
    if (!appointment) return;
    if (role !== 'admin' && appointment.student_id !== studentId) {
        alert('Unauthorized');
        return;
    }
    if (!confirm(`Are you sure you want to delete the appointment for ${appointment.name} on ${appointment.date}?`)) return;

    try {
        const response = await fetch(`api/appointments.php?id=${id}`, { credentials: 'same-origin', method: 'DELETE' });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete appointment');
        }
        await loadData();
        addActivity(`Appointment for ${appointment.name} on ${appointment.date} deleted.`);
        clearAppointmentForm();
    } catch (error) {
        showError(error.message);
    }
}

function renderAppointmentTable() {
    const tbody = document.querySelector('#appointmentTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    appointments.forEach((a) => {
        const canEdit = role === 'admin' || a.student_id === studentId;
        const editBtn = canEdit ? `<button onclick="editAppointment(${a.id})">Edit</button>` : '';
        const deleteBtn = canEdit ? `<button onclick="deleteAppointment(${a.id})">Delete</button>` : '';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${a.name}</td>
            <td>${a.student_id}</td>
            <td>${a.date}</td>
            <td>${a.time}</td>
            <td>${a.concern}</td>
            <td>${editBtn} ${deleteBtn}</td>
        `;
        tbody.appendChild(tr);
    });
}

function initializeChart() {
    const chartElement = document.getElementById('activityChart');
    if (!chartElement) return;
    const ctx = chartElement.getContext('2d');
    if (!ctx) return;

    if (activityChart) {
        activityChart.destroy();
        activityChart = null;
    }

    activityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Appointments',
                data: getWeeklyAppointments(),
                borderColor: 'blue',
                backgroundColor: 'rgba(0, 123, 255, 0.2)',
                fill: true,
                tension: 0.4
            }]
        },
        options: { responsive: true }
    });
}

function editAppointment(id) {
    const appointment = appointments.find(a => a.id == id);
    if (!appointment) return;
    if (role !== 'admin' && appointment.student_id !== studentId) {
        alert('Unauthorized');
        return;
    }

    selectedAppointmentId = id;
    document.getElementById('studentName').value = appointment.name;
    document.getElementById('studentId').value = appointment.student_id;
    document.getElementById('appointmentDate').value = appointment.date;
    document.getElementById('appointmentTime').value = appointment.time;
    document.getElementById('concern').value = appointment.concern;
    setAppointmentMode(true);
}

function init() {
    if (sessionStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'landing.html';
        return;
    }

    if (role !== 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }

    setStudentFormMode(false);
    setAppointmentMode(false);

    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', (event) => {
            event.preventDefault();
            logout();
        });
    }

    loadData();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

window.logout = logout;
window.addStudent = addStudent;
window.updateStudent = updateStudent;
window.saveAppointment = saveAppointment;
window.editStudent = editStudent;
window.deleteStudent = deleteStudent;
window.editAppointment = editAppointment;
window.deleteAppointment = deleteAppointment;
