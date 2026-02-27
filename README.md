# Point of Sale (POS) Application

A modern web-based Point of Sale application built with Laravel (Backend) and React (Frontend) for restaurant and cafe management.

## 🚀 Features

### Core Features
- **Table Management**: Manage restaurant tables with booking and order tracking
- **Order Management**: Complete order workflow from creation to completion
- **Menu Management**: Food and beverage menu with pricing
- **User Management**: Role-based access (Admin, Pelayan, Kasir)
- **Real-time Updates**: Live status updates across all devices

### Advanced Features
- **Smart Booking System**: Automatic table status transitions
- **Order Tracking**: Complete order lifecycle management
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Data Analytics**: Sales and performance reporting
- **Receipt Generation**: Professional receipt printing

## 📋 Prerequisites

### Required Software
- **PHP** >= 8.1
- **Composer** >= 2.0
- **Node.js** >= 16.0
- **npm** >= 8.0
- **MySQL** >= 8.0 or **MariaDB** >= 10.3
- **Git**

### Development Tools (Recommended)
- **VS Code** or any modern IDE
- **Postman** for API testing
- **MySQL Workbench** or **phpMyAdmin**

## 🛠️ Installation Guide

### 1. Clone Repository
```bash
git clone https://github.com/yuanthio/pos-app.git
cd pos-app
```

### 2. Backend Installation (Laravel)

#### 2.1 Install Dependencies
```bash
cd backend
composer install
```

#### 2.2 Environment Configuration
```bash
cp .env.example .env
```

#### 2.3 Update Environment Variables
Edit `.env` file with your database and application settings:

```env
# Application
APP_NAME="POS Application"
APP_ENV=local
APP_KEY=base64:YOUR_GENERATED_KEY_HERE
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pos_app
DB_USERNAME=root
DB_PASSWORD=your_password

# Mail Configuration (Optional)
MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"
```

#### 2.4 Generate Application Key
```bash
php artisan key:generate
```

#### 2.5 Create Database
```sql
CREATE DATABASE pos_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 2.6 Run Migrations
```bash
php artisan migrate
```

#### 2.7 Seed Database (Optional)
```bash
php artisan db:seed
```

#### 2.8 Start Backend Server
```bash
php artisan serve
```
Backend will be available at `http://localhost:8000`

### 3. Frontend Installation (React)

#### 3.1 Install Dependencies
```bash
cd ../frontend
npm install
```

#### 3.2 Environment Configuration
Create `.env` file in frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=POS Application
```

#### 3.3 Start Frontend Development Server
```bash
npm run dev
```
Frontend will be available at `http://localhost:5173`

## 🗂️ Project Structure

```
pos-app/
├── backend/                 # Laravel Backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   └── Api/
│   │   │   │       ├── AdminController.php
│   │   │   │       ├── PelayanController.php
│   │   │   │       ├── KasirController.php
│   │   │   │       └── AuthController.php
│   │   │   └── ...
│   │   ├── Models/
│   │   │   ├── User.php
│   │   │   ├── Meja.php
│   │   │   ├── Makanan.php
│   │   │   ├── Pesanan.php
│   │   │   └── ...
│   │   └── ...
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── resources/
│   │   └── views/
│   └── ...
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   ├── pelayan/
│   │   │   ├── kasir/
│   │   │   └── common/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── pelayan/
│   │   │   ├── kasir/
│   │   │   └── Login.tsx
│   │   ├── store/
│   │   ├── utils/
│   │   ├── types/
│   │   └── ...
│   ├── public/
│   └── ...
├── README.md              # This file
└── .gitignore
```

## 👥 User Roles & Permissions

### Admin
- Full system access
- User management
- Menu management
- System configuration
- Reports and analytics

### Pelayan (Waiter)
- Table management
- Order creation and management
- Booking management
- Customer service

### Kasir (Cashier)
- Order processing
- Payment handling
- Receipt generation
- Sales reporting

## 🔧 Development Commands

### Backend Commands
```bash
# Start development server
php artisan serve

# Run migrations
php artisan migrate

# Fresh migration with seeding
php artisan migrate:fresh --seed

# Create new migration
php artisan make:migration create_table_name

# Create new controller
php artisan make:controller ControllerName

# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

### Frontend Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Install dependencies
npm install

# Add new dependency
npm install package-name
```

## 🧪 Testing

### Backend Testing
```bash
# Run all tests
php artisan test

# Run specific test
php artisan test --filter TestName

# Generate test coverage
php artisan test --coverage
```

### Frontend Testing
```bash
# Run tests (if configured)
npm test

# Run tests with coverage
npm run test:coverage
```

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user info

### Table Management
- `GET /api/meja` - Get all tables
- `POST /api/meja/book` - Book a table
- `PUT /api/meja/{id}/status` - Update table status
- `DELETE /api/meja/{id}` - Delete table

### Order Management
- `GET /api/pesanan` - Get all orders
- `POST /api/pesanan` - Create new order
- `PUT /api/pesanan/{id}` - Update order
- `DELETE /api/pesanan/{id}` - Delete order

### Menu Management
- `GET /api/makanan` - Get all menu items
- `POST /api/makanan` - Add new menu item
- `PUT /api/makanan/{id}` - Update menu item
- `DELETE /api/makanan/{id}` - Delete menu item

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Error
```bash
# Check database credentials in .env
# Ensure MySQL/MariaDB is running
# Verify database exists
```

#### 2. CORS Issues
```bash
# Check CORS configuration in backend
# Verify frontend API URL in .env
```

#### 3. Migration Errors
```bash
# Clear migrations table
php artisan migrate:fresh

# Check database permissions
```

#### 4. Frontend Build Errors
```bash
# Clear node modules
rm -rf node_modules package-lock.json
npm install

# Clear cache
npm run build --reset-cache
```

### Debug Mode
Enable debug mode in `.env`:
```env
APP_DEBUG=true
```

## 📝 Environment Variables

### Backend (.env)
```env
APP_NAME=POS Application
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pos_app
DB_USERNAME=root
DB_PASSWORD=

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=POS Application
```

## 🚀 Production Deployment

### Backend Deployment
```bash
# Install production dependencies
composer install --optimize-autoloader --no-dev

# Optimize configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set production environment
APP_ENV=production
APP_DEBUG=false

# Run production migrations
php artisan migrate --force
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy build files to web server
# Configure web server to serve static files
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in GitHub
- Email: support@example.com
- Documentation: [Wiki](https://github.com/yuanthio/pos-app/wiki)

## 🔄 Version History

- **v1.0.0** - Initial release with core POS functionality
- **v1.1.0** - Enhanced table management and booking system
- **v1.2.0** - Improved UI/UX and mobile responsiveness
- **v1.3.0** - Advanced reporting and analytics

---

**Built with ❤️ using Laravel and React**
