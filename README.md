# 🏥 DocLink – Healthcare Management System

## 📌 Project Overview

DocLink is a full-stack healthcare management system designed to improve access to healthcare services by connecting patients and doctors through a centralized digital platform.

In Canada, patients often face challenges such as long wait times to see doctors, difficulty booking appointments quickly, and fragmented healthcare communication systems. DocLink aims to solve these issues by digitizing and simplifying healthcare access.

---

## 🎯 Problem Statement

Healthcare accessibility in Canada can be inefficient due to:

- Long waiting times for appointments  
- Difficulty finding available doctors  
- Lack of centralized healthcare communication systems  

DocLink addresses these issues by providing a unified platform where patients and doctors can connect efficiently.

---

## 🚀 Key Features

- 👨‍⚕️ Find and connect with doctors  
- 📅 Book and manage appointments  
- 💊 Manage prescriptions  
- 🛒 Order medicines  
- 🔐 Secure authentication system  
- 📊 Role-based access (Patient / Doctor)  

This project is built using:

* **Frontend:** React (Vite + Tailwind)
* **Backend:** Node.js + Express
* **Database:** PostgreSQL (via Prisma ORM)

---

## 🚀 Tech Stack

| Layer          | Technology                |
| -------------- | ------------------------- |
| Frontend       | React, Vite, Tailwind CSS |
| Backend        | Node.js, Express          |
| Database       | PostgreSQL                |
| ORM            | Prisma                    |
| Authentication | JWT + bcrypt              |

---

## 🔐 Authentication & Authorization (Checkpoint 4)

This project implements secure authentication using **JWT (JSON Web Tokens)** and **bcrypt password hashing**.

---

## 🔑 Authentication Approach

* Users receive a **JWT token** after login/register
* Token contains:

  * user id
  * email
  * role
* Token is sent in headers:

```http
Authorization: Bearer <token>
```

### Why JWT?

* Stateless and scalable
* No server-side session storage needed
* Ideal for REST APIs

---

## 🔒 Password Security

* Passwords are hashed using **bcrypt**
* Plain text passwords are never stored
* During login, passwords are verified securely using bcrypt

---

## 🚪 Authentication Endpoints

### Register

```http
POST /auth/register
```

```json
{
  "email": "user@example.com",
  "password": "123456",
  "role": "PATIENT"
}
```

---

### Login

```http
POST /auth/login
```

```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

**Response:**

```json
{
  "success": true,
  "token": "JWT_TOKEN"
}
```

---

### Logout

```http
POST /auth/logout
```

* JWT-based logout is handled on the client side
* The token is removed from storage

---

## 🔐 Protected Routes

| Endpoint           | Description                |
| ------------------ | -------------------------- |
| GET /users/me      | Get current logged-in user |
| GET /appointments  | Get user appointments      |
| POST /appointments | Create appointment         |

---

## 🚫 Unauthorized Access Handling

### No token

```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### Invalid token

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

---

## 🛡️ Security Measures

* Password hashing using bcrypt
* JWT authentication
* Protected API routes
* Input validation (required fields enforced)
* No sensitive data returned (password hidden)
* Proper HTTP status codes (401, 403, 400, 500)

---

## 🧪 Testing

All APIs were tested using:

* VS Code REST Client (`request.rest`)

---

## 🗃️ Database Design

* PostgreSQL with Prisma ORM
* UUID-based IDs
* Relations:

  * User ↔ Doctor
  * User ↔ Appointment
  * Doctor ↔ Appointment

Prisma ensures:

* safe queries
* schema consistency
* easy migrations

---

## ⚙️ Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Setup environment variables

Create `.env` file:

```env
DATABASE_URL=your_database_url
JWT_SECRET=your_secret
PORT=5000
```

### 3. Run migrations

```bash
npx prisma migrate dev
```

### 4. Seed database

```bash
node prisma/seed.js
```

### 5. Start backend

```bash
node src/app.js
```

---

## 📌 Checkpoint 4 Summary

This implementation satisfies all requirements:

* Authentication implemented (JWT)
* Passwords securely hashed
* Protected routes enforced
* Proper error handling
* No sensitive data exposure
* API documentation updated

---

## 📂 Submission Details

* GitHub repository submitted
* Release tag: `checkpoint_4`
* Project zip uploaded

---

## 👨‍💻 Author
Bhanwarpreet Kaur
Vishwa Gosai
Parth Joshi
Arshdeep Singh

Algoma University
COSC 4806 – Web Data Management