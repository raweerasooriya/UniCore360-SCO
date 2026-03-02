# 🏛️ UniCore 360 - Smart Campus Operations Hub

[![Java](https://img.shields.io/badge/Java-17-blue)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.1.5-green)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)](https://www.mysql.com/)

## 📋 Project Overview
UniCore 360 is a comprehensive campus management system developed for the IT3030 - Programming Applications and Frameworks assignment. It provides a unified platform for managing facility bookings, incident ticketing, and campus operations.

## 👥 Team Members
| Name | IT Number | Role |
|------|-----------|------|
| Subashanth | IT23358270 | Facilities & Resources |
| Oditha | IT23626560 | Bookings & Scheduling |
| Dilhani | IT23862258 | Incident Ticketing |
| Rashaan | IT23168190 | Security, Notifications & DevOps |

## 🚀 Features

### User Dashboard
- Browse and book facilities
- View booking status
- Report incidents with image attachments
- Receive notifications

### Technician Dashboard
- View assigned tickets
- Update ticket status (OPEN → IN_PROGRESS → RESOLVED)
- Add resolution notes

### Admin Dashboard
- Approve/reject bookings
- Manage facility resources
- Assign tickets to technicians
- View analytics (top resources, peak hours)

## 🛠️ Technology Stack

### Backend
- Java 17
- Spring Boot 3.1.5
- Spring Security
- Spring Data JPA
- MySQL 8.0
- Maven

### Frontend
- React 18
- Material-UI
- Axios
- React Router

## 🔧 Setup Instructions

### Prerequisites
- Java 17
- Node.js 18+
- MySQL 8.0
- Maven

### Backend Setup
```bash
cd unicore360-backend
# Configure MySQL in application.properties
mvn clean install
mvn spring-boot:run

Frontend Setup
bash
cd unicore360-frontend
npm install
npm start

📝 License
This project is created for educational purposes as part of the SLIIT IT3030 assignment.

👨‍💻 Contributors
Rashaan (IT23168190) - Team Lead, Security & Notifications

Subashanth (IT23358270) - Facilities Module

Oditha (IT23626560) - Bookings Module

Dilhani (IT23862258) - Ticketing Module