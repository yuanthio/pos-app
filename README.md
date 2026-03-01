# Point of Sale (POS) Application

A modern web-based Point of Sale application built with Laravel (Backend) and React (Frontend) for restaurant and cafe management.

---

## 🚀 Tech Stack

### 🖥️ Frontend
- **React**
- **TypeScript**
- **Redux Toolkit** (State Management)
- **Tailwind CSS**
- **shadcn/ui**
- **Vite**

### ⚙️ Backend
- **PHP**
- **Laravel**
- **Laravel Sanctum** (Authentication)
- **Laravel DomPDF** (Receipt PDF Generator)

### 🗄️ Database
- **MySQL**

### 🔐 Authentication
- **Laravel Sanctum (Token-based API Authentication)**

### 📄 PDF Generation
- **Laravel DomPDF**

---

## � Login Credentials

### Default Login Accounts

#### 👨‍💼 Admin
- **Email:** `admin@pos.com`
- **Password:** `password`

#### 🧑 Kasir
- **Email:** `kasir1@pos.com`
- **Password:** `password`

#### 🧍 Pelayan
- **Email:** `pelayan1@pos.com`
- **Password:** `password`

---

## �📋 Prerequisites

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

---

## 🛠️ Installation Guide

### 1. Clone Repository

```bash
git clone https://github.com/yuanthio/pos-app.git
cd pos-app
```

---

## 2. Backend Installation (Laravel)

### 2.1 Install Dependencies

```bash
cd backend
composer install
```

### 2.2 Environment Configuration

```bash
cp .env.example .env
```

### 2.3 Update Environment Variables

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

### 2.4 Generate Application Key

```bash
php artisan key:generate
```

### 2.5 Create Database

```sql
CREATE DATABASE pos_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2.6 Run Migrations

```bash
php artisan migrate
```

### 2.7 Seed Database

```bash
php artisan db:seed
```

### 2.8 Start Backend Server

```bash
php artisan serve
```

Backend will be available at:

```
http://localhost:8000
```

---

## 3. Frontend Installation (React + TypeScript)

### 3.1 Install Dependencies

```bash
cd ../frontend
npm install
```

### 3.2 Environment Configuration

Create `.env` file in frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=POS Application
```

### 3.3 Start Frontend Development Server

```bash
npm run dev
```

Frontend will be available at:

```
http://localhost:5173
```

---

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
│   │   └── views/           # PDF Blade Templates
│   └── ...
├── frontend/                # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   ├── pelayan/
│   │   │   ├── kasir/
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── pelayan/
│   │   │   ├── kasir/
│   │   │   └── Login.tsx
│   │   ├── store/           # Redux Toolkit Store
│   │   ├── utils/
│   │   ├── types/
│   │   └── ...
│   ├── public/
│   └── ...
└── .gitignore
```

---

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

---

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

---

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

---

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=POS Application
```
