# CTU E-Clinic Website - Deployment & Setup Guide

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
    └── test.php             # API testing endpoint
```

## Database Setup

### Create Database and Tables

1. Open phpMyAdmin or MySQL command line
2. Run the SQL commands in `create_tables.sql`:

```sql
-- Users table (stores login credentials)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(100),
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'student') DEFAULT 'student',
    student_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students table (student profile information)
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    name VARCHAR(100) NOT NULL,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    course VARCHAR(100),
    section VARCHAR(50),
    email VARCHAR(100),
    contact VARCHAR(20),
    allergies TEXT,
    medications TEXT,
    medical_conditions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Appointments table
CREATE TABLE appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    concern VARCHAR(255) NOT NULL,
    notes TEXT,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Queries/Requests table
CREATE TABLE queries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id VARCHAR(50) NOT NULL,
    student_name VARCHAR(100),
    query_type VARCHAR(100),
    message TEXT NOT NULL,
    response TEXT,
    status ENUM('new', 'read', 'responded') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Create Admin Account

1. Access the signup page or run this SQL directly:

```sql
-- Insert admin user
INSERT INTO users (username, email, password, role, student_id) 
VALUES ('admin', 'admin@ctu.edu.ph', '$2y$10$WDpAr.QVwNfwxsNPnXHVqOqRnJGsX4dFzDXvpLYVH7x6c0OQ0c2c6', 'admin', 'ADMIN001');
```

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

⚠️ **Important**: Change the default password immediately after login!

## Configuration

### Database Configuration (api/config.php)

Update the database connection settings:

```php
<?php
$host = 'localhost';      // Your database host
$db = 'eclinic';          // Your database name
$user = 'root';           // Your database user
$pass = '';               // Your database password

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}
?>
```

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

## Deployment Checklist

- [ ] Database created and configured
- [ ] Admin account created
- [ ] `api/config.php` updated with correct database credentials
- [ ] All files uploaded to server
- [ ] Test admin login
- [ ] Test student signup
- [ ] Test appointment scheduling
- [ ] Verify email notifications (if configured)
- [ ] Check responsive design on mobile devices
- [ ] Test all CRUD operations

## Security Notes

⚠️ **Important Security Recommendations:**

1. **Change Default Admin Password** - Do this immediately
2. **Use HTTPS** - Always use SSL/TLS in production
3. **Database** - Use strong database passwords
4. **Session Management** - Enable session timeout
5. **Input Validation** - All inputs are validated on client and server
6. **Password Hashing** - Passwords are hashed using bcrypt
7. **CORS Policy** - Configure appropriate CORS headers for APIs

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
