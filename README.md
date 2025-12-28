# 🎉 Hackathon Platform  
### **AI-Powered Hackathon Management & Evaluation System**

A full-stack, production-ready hackathon platform that handles **registrations, team management, AI-based evaluations, QR check-ins, and organizer workflows** — end to end.

---

## ✅ Platform Status: **READY**

The platform is fully implemented and tested locally.  
Only **Firebase configuration** is required to deploy.

---

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
npm install
# Configure .env and Firebase service account
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
# Configure Firebase client env
npm run dev
```

### Local URLs
| Service | URL |
|------|----|
| 🌐 Frontend | http://localhost:5173 |
| 🔌 Backend API | http://localhost:5000 |

---

## ✨ Features Overview

### 🔐 Authentication & Authorization
- Firebase Email/Password authentication
- Role-based access (**Participant / Organizer**)
- Protected routes
- JWT token management

---

### 👥 Participant Features
- Browse hackathons with filters
- View hackathon details
- Create or join teams using **unique 6-character codes**
- Upload resumes, PPTs, GitHub links & bios
- Track application status
- RSVP with **QR code generation**
- Submit final projects
- Dashboard with stats & notifications

---

### 🎯 Organizer Features
- Create and manage hackathons
- Configure **AI evaluation weights**
- View all registered teams
- Trigger AI **pre-evaluation**
- View HackHealth scores & rankings
- Accept / Reject / Waitlist teams
- Organizer dashboard with analytics

---

### 🤖 AI Evaluation System
- Pre-Evaluation: GitHub, Resume, Idea & Bio analysis
- Final Evaluation: Code quality & Documentation
- Configurable scoring weights
- HackHealth score (0–100)
- Mock implementation (Axicov-ready)

---

## 📂 Project Structure

```
hackathon-platform/
├── frontend/
└── backend/
```

---

## 🔧 Firebase Configuration

Frontend `.env`
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Backend:
```
backend/src/config/serviceAccountkey.json
```

---

## 🚢 Deployment Ready
- Works locally
- Cloud deployable (Vercel + Render)
- Axicov AI integration supported

---

## 🎊 Final Note
Built for **hackathons, colleges, and innovation programs**.

Happy Hacking 🚀
