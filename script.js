let students = JSON.parse(localStorage.getItem("students")) || [];
let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
let selectedIndex = null;

if (sessionStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    renderStudentTable();
    renderAppointmentTable();
    initializeChart();
    updateDashboard();
});

let activityChart;
function initializeChart() {
    const ctx = document.getElementById('activityChart').getContext('2d');
    activityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
            datasets: [{
                label: 'Appointments',
                data: getWeeklyAppointments(),
                borderColor: 'blue',
                fill: false,
                tension: 0.4
            }]
        },
        options: { responsive: true }
    });
}

function getWeeklyAppointments() {
    const weekData = [0,0,0,0,0,0,0];
    appointments.forEach(a => {
        const day = new Date(a.date).getDay();
        weekData[day === 0 ? 6 : day - 1]++;
    });
    return weekData;
}

function addStudent() {
    const name = document.getElementById("name").value.trim();
    const idNumber = document.getElementById("idNumber").value.trim();
    const course = document.getElementById("course").value.trim();
    const section = document.getElementById("section").value.trim();

    if (!name || !idNumber || !course || !section) {
        alert("Please fill in all fields.");
        return;
    }

    const duplicate = students.find(s => s.idNumber === idNumber);
    if (duplicate) {
        alert("ID Number already exists.");
        return;
    }

    const newStudent = { name, idNumber, course, section };
    students.push(newStudent);
    saveStudents();
    renderStudentTable();
    addActivity(`Student ${name} added.`);
    updateDashboard();
    clearStudentForm();
}

function updateStudent() {
    if (selectedIndex === null) {
        alert("Please select a record to update.");
        return;
    }

    const name = document.getElementById("name").value.trim();
    const idNumber = document.getElementById("idNumber").value.trim();
    const course = document.getElementById("course").value.trim();
    const section = document.getElementById("section").value.trim();

    if (!name || !idNumber || !course || !section) {
        alert("Please fill in all fields.");
        return;
    }

    students[selectedIndex] = { name, idNumber, course, section };
    saveStudents();
    renderStudentTable();
    addActivity(`Student ${name} updated.`);
    updateDashboard();
    clearStudentForm();
    selectedIndex = null;
}

function editStudent(index) {
    selectedIndex = index;
    const student = students[index];
    document.getElementById("name").value = student.name;
    document.getElementById("idNumber").value = student.idNumber;
    document.getElementById("course").value = student.course;
    document.getElementById("section").value = student.section;
}

function deleteStudent(index) {
    if (!confirm("Are you sure you want to delete this student?")) return;
    const name = students[index].name;
    students.splice(index,1);
    saveStudents();
    renderStudentTable();
    addActivity(`Student ${name} deleted.`);
    updateDashboard();
}

function saveStudents() {
    localStorage.setItem("students", JSON.stringify(students));
}

function clearStudentForm() {
    document.getElementById("name").value = "";
    document.getElementById("idNumber").value = "";
    document.getElementById("course").value = "";
    document.getElementById("section").value = "";
    selectedIndex = null;
}

function renderStudentTable() {
    const tbody = document.getElementById("studentTableBody");
    if(!tbody) return;
    tbody.innerHTML = "";
    students.forEach((s,i)=>{
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${s.name}</td>
            <td>${s.idNumber}</td>
            <td>${s.course}</td>
            <td>${s.section}</td>
            <td>
                <button onclick="editStudent(${i})">Edit</button>
                <button onclick="deleteStudent(${i})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function addAppointment() {
    const name = document.getElementById("studentName").value.trim();
    const id = document.getElementById("studentId").value.trim();
    const date = document.getElementById("appointmentDate").value;
    const time = document.getElementById("appointmentTime").value;
    const concern = document.getElementById("concern").value;

    if(!name || !id || !date || !time || !concern) {
        alert("Please fill all fields");
        return;
    }

    const newAppointment = { name, id, date, time, concern };
    appointments.push(newAppointment);
    saveAppointments();
    renderAppointmentTable();
    addActivity(`Appointment scheduled for ${name} on ${date}`);
    updateDashboard();
    clearAppointmentForm();
}

function deleteAppointment(index) {
    if(!confirm("Delete this appointment?")) return;
    const name = appointments[index].name;
    appointments.splice(index,1);
    saveAppointments();
    renderAppointmentTable();
    addActivity(`Appointment for ${name} deleted.`);
    updateDashboard();
}

function renderAppointmentTable() {
    const tbody = document.getElementById("appointmentTable").getElementsByTagName("tbody")[0];
    tbody.innerHTML = "";
    appointments.forEach((a,i)=>{
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${a.name}</td>
            <td>${a.id}</td>
            <td>${a.date}</td>
            <td>${a.time}</td>
            <td>${a.concern}</td>
            <td>
                <button onclick="deleteAppointment(${i})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function saveAppointments() {
    localStorage.setItem("appointments", JSON.stringify(appointments));
}

function clearAppointmentForm() {
    document.getElementById("studentName").value = "";
    document.getElementById("studentId").value = "";
    document.getElementById("appointmentDate").value = "";
    document.getElementById("appointmentTime").value = "";
    document.getElementById("concern").value = "";
}

function addActivity(action) {
    const tbody = document.getElementById('activityTable');
    if (!tbody) return;

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>Admin</td>
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

    if(activityChart) {
        activityChart.data.datasets[0].data = getWeeklyAppointments();
        activityChart.update();
    }
}