<div align="center">

# 🎉 HackHub

### **AI-Powered Hackathon Management & Evaluation Platform**

A modern, full-stack hackathon platform that streamlines the entire hackathon lifecycle from registration to results, powered by AI-based evaluations.

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.16.0-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.8.0-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-5.1.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

[Live Demo](#) • [Documentation](#-features) • [Tech Stack](#-tech-stack) • [Deployment](#-deployment)

</div>

---

## 📸 Screenshots

<div align="center">
  <img src="https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/Frontend-Vercel-black?style=for-the-badge&logo=vercel" alt="Vercel">
  <img src="https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render" alt="Render">
</div>

---

## ✨ Features

### 🔐 **Smart Authentication & Authorization**
- 🔑 Firebase Email/Password authentication
- 👤 Role-based access control (Participant/Organizer)
- 🛡️ JWT token-based sessions with auto-refresh
- 🚪 Protected routes and custom user claims

### 👥 **Participant Experience**

#### Browse & Discover
- 🔍 Browse hackathons with real-time updates
- 🎯 Filter by status, dates, and categories
- 📋 View detailed hackathon information
- 📊 Track application status dashboard

#### Team Management
- 👥 Create teams with unique 6-character codes
- 🤝 Join teams using invite codes
- 📄 Upload resumes, PPTs, and GitHub links
- 💬 Add team bios and member profiles
- 📱 Generate QR codes for RSVP

#### Project Submission
- 📤 Submit final projects with GitHub links
- 📝 Add project descriptions and documentation
- 🏆 View AI-generated evaluation scores
- 🎖️ Track team rankings and HackHealth scores

### 🎯 **Organizer Dashboard**

#### Hackathon Creation
- ✏️ Create and manage hackathons
- 📅 Set registration deadlines and event dates
- ⚙️ Configure AI evaluation weights
- 🎨 Customize hackathon themes and descriptions

#### Team Management
- 👀 View all registered teams
- ✅ Accept/Reject/Waitlist applications
- 📊 Monitor team progress and submissions
- 📧 Send automated email notifications

#### AI-Powered Evaluation
- 🤖 Trigger AI pre-evaluations for teams
- 📈 View HackHealth scores (0-100 scale)
- 🏅 Rank teams based on multiple criteria
- 🔍 Analyze GitHub repos, resumes, and ideas

### 🤖 **AI Evaluation System**

#### Pre-Evaluation Criteria
- 💻 **GitHub Analysis**: Code quality, commits, documentation
- 📄 **Resume Scoring**: Skills match, experience level
- 💡 **Idea Assessment**: Innovation, feasibility, impact
- 👤 **Bio Evaluation**: Team diversity, complementary skills

#### Final Evaluation
- 🔬 Code quality and architecture analysis
- 📚 Documentation completeness
- 🎯 Problem-solving approach
- ⚡ Performance and scalability

#### Configurable Weights
Organizers can customize scoring weights:
- GitHub: 0-100%
- Resume: 0-100%
- Idea: 0-100%
- Bio: 0-100%

### 📨 **Notification System**
- 📬 Real-time in-app notifications
- 📧 Email notifications for:
  - Team acceptance/rejection
  - Mentor assignments
  - Deadline reminders
  - RSVP confirmations

### 📱 **QR Code Integration**
- 🎫 Generate QR codes for RSVP
- 📸 Scan QR codes for check-in
- ✅ Track attendance in real-time

---

## 🛠️ Tech Stack

### **Frontend**
```
React 18.3.1          - UI library
Vite 5.1.4            - Build tool & dev server
TailwindCSS 3.4.1     - Utility-first CSS
Zustand 4.5.0         - State management
React Router 6.22.0   - Client-side routing
Axios 1.6.7           - HTTP client
Firebase 10.8.0       - Authentication & Firestore
QRCode 1.5.3          - QR generation
Lucide React 0.344.0  - Icons
```

### **Backend**
```
Node.js 22.16.0          - JavaScript runtime
Express 4.18.2           - Web framework
Firebase Admin 12.0.0    - Backend Firebase SDK
Google Gemini 0.24.1     - AI evaluations
Cloudinary 2.8.0         - File storage
Nodemailer 7.0.12        - Email service
Multer 1.4.5             - File uploads
NanoID 5.0.5             - Unique ID generation
```

### **Database & Storage**
```
Firebase Firestore       - NoSQL database
Firebase Storage         - Secure file storage
Cloudinary              - CDN file delivery
```

### **Cloud & DevOps**
```
Vercel                  - Frontend hosting
Render                  - Backend hosting
GitHub                  - Version control & CI/CD
```

[📄 View Complete Tech Stack →](./TECH_STACK.md)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 22.16.0+
- npm 10+
- Firebase project
- Cloudinary account (optional)
- Gmail App Password (for emails)

### 1️⃣ Clone Repository
```bash
git clone https://github.com/sukrit-89/cal_hacks.git
cd cal_hacks
```

### 2️⃣ Backend Setup
```bash
cd backend
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your Firebase and API credentials

# Start development server
npm run dev
```

Backend runs on: `http://localhost:5000`

### 3️⃣ Frontend Setup
```bash
cd frontend
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your Firebase client config

# Start development server
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## ⚙️ Configuration

### Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Email/Password authentication
   - Create Firestore database
   - Enable Storage

2. **Get Configuration**
   - **Frontend**: Project Settings → General → Web App Config
   - **Backend**: Project Settings → Service Accounts → Generate Private Key

3. **Configure Environment Variables**

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Backend `.env`:**
```env
# Firebase Admin
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project.appspot.com

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Service
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# App Config
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Email Setup (Gmail)
1. Enable 2-Step Verification on your Google Account
2. Go to Security → App passwords
3. Generate app password for "Mail"
4. Use generated password in `EMAIL_PASSWORD`

---

## 📂 Project Structure

```
hackathon-platform/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   │   ├── auth/       # Login, Signup
│   │   │   ├── participant/# Participant views
│   │   │   └── organizer/  # Organizer views
│   │   ├── stores/         # Zustand state management
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   └── config/         # Firebase config
│   ├── public/             # Static assets
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/         # API routes
│   │   │   ├── auth.js
│   │   │   ├── hackathons.js
│   │   │   ├── teams.js
│   │   │   ├── uploads.js
│   │   │   └── ai.js
│   │   ├── services/       # Business logic
│   │   │   ├── firestore.js
│   │   │   ├── storage.js
│   │   │   └── emailService.js
│   │   ├── config/         # Configuration
│   │   │   └── firebase.js
│   │   └── server.js       # Express app
│   └── package.json
│
├── render.yaml             # Render deployment config
└── README.md
```

---

## 🌐 API Documentation

### Authentication
```http
POST /api/auth/signup       # Register new user
POST /api/auth/login        # Sign in user
GET  /api/auth/me           # Get current user
```

### Hackathons
```http
GET    /api/hackathons           # List all hackathons
POST   /api/hackathons           # Create hackathon (organizer)
GET    /api/hackathons/:id       # Get hackathon details
PATCH  /api/hackathons/:id       # Update hackathon
```

### Teams
```http
GET    /api/teams                # List teams
POST   /api/teams                # Create team
POST   /api/teams/join           # Join team with code
PATCH  /api/teams/:id            # Update team
```

### File Uploads
```http
POST   /api/uploads/resume       # Upload resume
POST   /api/uploads/ppt          # Upload presentation
POST   /api/uploads/profile      # Upload profile picture
```

### AI Evaluation
```http
POST   /api/ai/evaluate          # Trigger AI evaluation
GET    /api/ai/scores/:hackathonId  # Get evaluation scores
```

[📚 Complete API Reference →](./API_DOCS.md)

---

## 🚢 Deployment

### Frontend (Vercel)

1. **Connect GitHub Repository**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import `sukrit-89/cal_hacks`

2. **Configure Build Settings**
   ```
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```

3. **Add Environment Variables**
   - Add all `VITE_*` variables from `.env`

4. **Deploy** 🚀

### Backend (Render)

1. **Connect GitHub Repository**
   - Go to [render.com/new](https://render.com/new)
   - Select Web Service
   - Import `sukrit-89/cal_hacks`

2. **Configure Service**
   ```
   Root Directory: backend
   Build Command: npm install
   Start Command: npm start
   ```

3. **Add Environment Variables**
   - Add all Firebase, Cloudinary, and Email variables

4. **Deploy** 🚀

[📖 Detailed Deployment Guide →](./DEPLOYMENT.md)

---

## 🧪 Testing

### Run Frontend
```bash
cd frontend
npm run dev
```

### Run Backend
```bash
cd backend
npm run dev
```

### Test Health Endpoint
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-12-29T19:05:00.000Z"
}
```

---

## 🎯 Use Cases

### For Colleges & Universities
- Host department hackathons
- Manage inter-college competitions
- Track student participation

### For Tech Communities
- Organize community hackathons
- Evaluate team performance objectively
- Streamline registration process

### For Corporate Events
- Internal innovation challenges
- Recruitment hackathons
- Team building events

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Sukrit Goswami**
**Druhin Mitra**
**Surya Chakraborty**

- GitHub: [@SukritGoswami](https://github.com/sukrit-89),[@DruhinMitra](https://github.com/DruhinMitra),[@SuryaChakraborty](https://github.com/surya-chakraborty)
- LinkedIn: [Sukrit Goswami](https://www.linkedin.com/in/sukrit-goswami-5b1b6b211/)

---

## 🙏 Acknowledgments

- **Firebase** - Authentication & Database
- **Google Gemini** - AI Evaluations
- **Cloudinary** - File Storage
- **Vercel & Render** - Hosting

---

<div align="center">

### ⭐ Star this repo if you find it helpful!

**Built with ❤️ for the Hackathon Community**

[⬆ Back to Top](#-hackhub)

</div>
