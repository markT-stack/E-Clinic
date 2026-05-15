# CTU E-Clinic - Professional Healthcare Portal

A professional, feature-rich clinic management system built for Cebu Technological University.

## 🚀 Quick Start

### Prerequisites
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Web server (Apache, Nginx, etc.)
- Modern web browser

### Installation Steps

1. **Import Database**
   ```bash
   mysql -u root -p eclinic < create_tables.sql
   ```

2. **Configure Database**
   - Edit `api/config.php`
   - Update host, database name, user, and password

3. **Access the Website**
   ```
   http://localhost/CTU-E-Clinic/landing.html
   ```

4. **Default Admin Login**
   - Username: `admin`
   - Password: `admin123`
   - ⚠️ Change immediately after first login!

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
├── DEPLOYMENT_GUIDE.md     # Detailed setup guide
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

For detailed setup instructions, see `DEPLOYMENT_GUIDE.md`

### Useful Resources
- Dashboard Documentation: See DEPLOYMENT_GUIDE.md
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

**Ready to deploy!** For full setup instructions, refer to `DEPLOYMENT_GUIDE.md`
