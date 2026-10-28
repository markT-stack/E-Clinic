# CTU E-Clinic - XAMPP Setup Guide

## Overview
This is a professional E-Clinic website system for Cebu Technological University, featuring role-based dashboards for both administrators and students.

## System Architecture

### Two User Roles
1. **Admin** - Full system access, can manage students, appointments, and queries
2. **Student** - Limited access, can manage own appointments and medical information

### Login Flow
- Users log in via `login.html`
- Upon successful login, they are redirected based on their role:
  - Admin → `admin-dashboard.html`
  - Student → `student-dashboard.html`

## Directory Structure

```
CTU-E-Clinic/
├── login.html                 # Login/Signup page
├── landing.html              # Home page
├── admin-dashboard.html      # Admin dashboard (role=admin)
├── student-dashboard.html    # Student dashboard (role=student)
├── login.css                 # Login styling
├── landing.css               # Landing page styling
├── style.css                 # Dashboard styling (professional design)
├── script-enhanced.js        # Enhanced JavaScript (notifications, validation)
├── create_tables.sql         # Database table creation script
└── api/
    ├── config.php           # Database configuration
    ├── login.php            # Login API endpoint
    ├── logout.php           # Logout API endpoint
    ├── signup.php           # User signup API endpoint
    ├── students.php         # Student management API
    ├── appointments.php     # Appointment management API
    ├── queries.php          # Student query management API
    └── student_profile.php  # Student profile API
```

## Database Setup

### XAMPP local setup

1. Copy the project into XAMPP's `htdocs` directory.
2. Start **Apache** and **MySQL** in the XAMPP Control Panel.
3. In phpMyAdmin (`http://localhost/phpmyadmin`), import the repository's `create_tables.sql`. It creates the `eclinic` database, tables, and a database-backed admin account.
4. Open `http://localhost/<project-folder>/login.html` through Apache. Do not use `file://` or Live Server when signing in with real accounts.

The seeded admin credentials are username `admin` and password `admin1232026`. Student accounts are created through **Sign Up**, using a student ID already present in the database's `students` table. The signup endpoint stores a password hash in MySQL; the login endpoint verifies it and starts the PHP session used by protected APIs, including the clinic assistant.

## Configuration

### Database Configuration (api/config.php)

`api/config.php` uses these XAMPP defaults:

```text
Host: localhost
Port: 3306
Database: eclinic
Username: root
Password: (empty by default in XAMPP)
```

If you have set a MySQL password or changed the port, update the corresponding values in `api/config.php`. Keep AI provider keys in the local, git-ignored `api/secret.php` file; never add keys to frontend files or commit them.

## Features

### Admin Dashboard
✓ View clinic statistics (total students, appointments, queries, today's appointments)  
✓ Weekly activity chart showing appointment trends  
✓ Manage all student profiles (add, edit, delete)  
✓ Schedule and manage appointments  
✓ View and respond to student queries  
✓ Recent activity log  

### Student Dashboard
✓ Update personal information and medical history  
✓ Schedule new appointments  
✓ View appointment history  
✓ Submit health-related queries  
✓ Track query responses  
✓ Change password  

### Professional UI Features
✓ Responsive design (works on desktop, tablet, mobile)  
✓ Modern color scheme with blue/teal gradient  
✓ Toast notifications for user feedback  
✓ Form validation with helpful error messages  
✓ Smooth animations and transitions  
✓ Status badges for appointments  
✓ Professional typography and spacing  

## Usage Guide

### For Admin Users

1. **Access Dashboard**: Login with admin credentials
2. **Manage Students**:
   - Click "Students Log" in navigation
   - Fill form to add new student
   - Click "Edit" to modify student info
   - Click "Delete" to remove student

3. **Schedule Appointments**:
   - Click "Appointments" section
   - Fill appointment details
   - Click "Schedule Appointment"

4. **View Queries**:
   - Check "Student Queries" section
   - View all student submissions
   - Mark as read and provide responses

### For Student Users

1. **Update Profile**:
   - Click "My Information"
   - Enter personal and medical history
   - Click "Save Information"

2. **Schedule Appointment**:
   - Click "My Appointments"
   - Select date, time, and concern
   - Click "Schedule Appointment"

3. **Submit Query**:
   - Click "My Queries"
   - Select query type and describe issue
   - Click "Submit Query"

## API Endpoints

### Authentication
- `POST /api/login.php` - User login
- `POST /api/logout.php` - User logout
- `POST /api/signup.php` - User registration

### Students
- `GET /api/students.php` - Get all students (admin only)
- `POST /api/students.php` - Add student
- `PUT /api/students.php` - Update student
- `DELETE /api/students.php?id=X` - Delete student

### Appointments
- `GET /api/appointments.php` - Get appointments
- `POST /api/appointments.php` - Create appointment
- `PUT /api/appointments.php` - Update appointment
- `DELETE /api/appointments.php?id=X` - Delete appointment

## Local verification

- [ ] Database imported in phpMyAdmin
- [ ] Apache and MySQL are running in XAMPP
- [ ] Site opened from `http://localhost/<project-folder>/login.html`
- [ ] Admin login and student signup tested
- [ ] Appointment and query workflows tested

## Security Notes

⚠️ **Important Security Recommendations:**

1. **Change Default Admin Password** - Change it after the first login
2. **Database** - Set a MySQL password if the local machine is shared
3. **Input Validation** - Validate inputs on the server as well as the client
4. **Password Hashing** - Passwords are hashed using PHP's password hashing functions

## Troubleshooting

### Login Issues
- Verify database connection in `api/config.php`
- Check if admin account exists in users table
- Clear browser cache and try again

### Chart Not Displaying
- Ensure Chart.js library is loaded: `https://cdn.jsdelivr.net/npm/chart.js`
- Check browser console for errors
- Refresh the page

### Appointments Not Showing
- Verify API endpoint is accessible: `api/appointments.php`
- Check database connection
- Ensure user has correct role

### Styling Issues
- Verify `style.css` is in same directory as HTML files
- Clear browser cache (Ctrl+Shift+Del)
- Check that CSS file is loading (F12 Network tab)

## Support

For technical support or issues, please contact:
- Email: support@ctu.edu.ph
- Documentation: See API endpoints section

## Version Info

- Version: 1.0.0 Professional Release
- Last Updated: May 2026
- Compatibility: PHP 7.4+, MySQL 5.7+, Modern Browsers
