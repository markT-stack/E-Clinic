# CTU E-Clinic - Professional Healthcare Portal

A professional, feature-rich clinic management system built for Cebu Technological University.

## 🚀 Quick Start

### Run locally with XAMPP (real accounts)

1. Make sure the project folder is in XAMPP's `htdocs` directory (for this setup: `C:\xampp\htdocs\CTU-DB E-Clinic`).
2. Start **Apache** and **MySQL** in the XAMPP Control Panel.
3. Open phpMyAdmin at `http://localhost/phpmyadmin`, select **Import**, and import `create_tables.sql`. This creates the `eclinic` database and its tables.
4. Open the login page through Apache, for example `http://localhost/CTU-DB%20E-Clinic/login.html` (use the folder name you copied into `htdocs`).
5. Sign in with an account stored in the MySQL `users` table.

The SQL setup seeds a database-backed admin account: username `admin`, password `admin1232026`. Students can use **Sign Up** with a student ID already registered in the database's `students` table; their password is stored as a hash. The login API creates a PHP session that the clinic assistant uses to verify the signed-in user.

The AI assistant also requires a provider API key configured on the PHP server. Do not put provider keys in frontend code.

### Prerequisites
- PHP 7.4 or higher
- MySQL 5.7 or higher
- XAMPP with Apache and MySQL
- Modern web browser

### Installation Steps

Follow the XAMPP steps above. `api/config.php` connects to host `localhost`, port `3306`, database `eclinic`, user `root`, and an empty password. If your MySQL settings differ, update those values in `api/config.php`.

## 📋 Features

### For Administrators
- Dashboard with clinic statistics
- Manage student profiles
- Schedule and track appointments
- Monitor student queries
- View clinic activity logs
- Weekly appointment trends chart

### For Students
- Update personal and medical information
- Schedule clinic appointments
- View appointment history
- Submit health-related queries
- Track query responses
- Manage account settings

### Design Excellence
- Modern, professional UI design
- Responsive layout for all devices
- Smooth animations and transitions
- Real-time notifications
- Comprehensive form validation
- Accessibility-first approach

## 📁 File Structure

```
CTU-E-Clinic/
├── login.html              # User authentication
├── admin-dashboard.html    # Admin portal
├── student-dashboard.html  # Student portal
├── style.css               # Professional styling
├── script-enhanced.js      # Enhanced JavaScript with notifications
├── create_tables.sql       # Database schema
├── XAMPP_SETUP.md          # Local XAMPP setup guide
└── api/                    # Backend APIs
    ├── config.php
    ├── login.php
    ├── students.php
    ├── appointments.php
    └── ...
```

## 🔐 Security Features

✓ Password hashing with bcrypt  
✓ SQL injection prevention  
✓ Session-based authentication  
✓ Role-based access control  
✓ Input validation  
✓ CSRF protection ready  

## 🎨 Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: PHP 7.4+
- **Database**: MySQL 5.7+
- **Chart Library**: Chart.js
- **UI Framework**: Custom responsive CSS

## 📞 Support

For detailed setup instructions, see `XAMPP_SETUP.md`

### Useful Resources
- XAMPP setup: See XAMPP_SETUP.md
- API Reference: Check api/ directory
- Database Schema: See create_tables.sql

## ✨ Latest Updates (v1.0.0)

- Professional dashboard redesign
- Enhanced notification system
- Form validation improvements
- Mobile-responsive design
- Activity tracking
- Weekly statistics chart
- Role-based access control

## 📝 License

This project is for Cebu Technological University use.

---

**Ready to run locally with XAMPP!** For setup instructions, refer to `XAMPP_SETUP.md`.
