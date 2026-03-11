# 🚀 Civic Pressure Engine

A geo-tagged civic complaint platform that allows citizens to report public infrastructure problems and track their resolution through an automated escalation workflow.

The system improves transparency in civic issue management by enabling complaint tracking, location-based reporting, and role-based administration.

---

# 🧠 Problem Statement

In many cities:

- Civic complaints are difficult to track
- Issues often remain unresolved for long periods
- Citizens lack visibility into complaint progress
- Authorities lack structured data for issue management

Civic Pressure Engine introduces **structured reporting, transparency, and escalation mechanisms** to improve civic accountability.

---

# ⚙️ Core Features

## 1️⃣ User Authentication
- Secure **JWT-based authentication**
- User registration and login
- Password hashing using **bcrypt**
- Role-based authorization

Roles:
- **Citizen**
- **Admin**

---

## 2️⃣ Complaint Reporting
Users can submit civic complaints including:

- Category (12+ issue types)
- Description
- Location (latitude & longitude)
- Timestamp

Each complaint is linked to the reporting user.

---

## 3️⃣ Complaint Lifecycle Management

Complaints follow a structured workflow:

Features:

- Status tracking
- Admin updates
- Audit history logging
- Escalation of unresolved issues

---

## 4️⃣ Automated Escalation System

Complaints that remain unresolved for a predefined period are automatically escalated.

Example logic:

- If complaint remains **Pending for X days**
- Status changes to **Escalated**

This ensures issues are not silently ignored.

---

## 5️⃣ Admin Dashboard

Admins can:

- View all complaints
- Filter complaints by status
- Update complaint status
- Mark complaints as resolved

Role-based middleware ensures only admins can perform these operations.

---

# 🏗️ Backend Architecture

Tech Stack:

- **Node.js**
- **Express.js**
- **PostgreSQL**
- **JWT Authentication**

All protected routes require **JWT authentication**.


# 🔐 Security Features

- Password hashing with **bcrypt**
- **JWT authentication**
- Role-based access control
- Request validation middleware
- Input sanitization
- Parameterized SQL queries (SQL injection prevention)


# 🚀 Future Enhancements

Possible improvements:

- Image upload for complaint evidence
- Real-time notifications
- Geo-location auto detection
- AI-based complaint categorization
- Docker deployment
- Government department routing
- Analytics dashboard
