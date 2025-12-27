# Hackathon Platform - HackHub

A comprehensive hackathon hosting and participation platform with AI-powered evaluation system.

## 🚀 Tech Stack

**Frontend:**
- React.js (Vite)
- Tailwind CSS
- Zustand (State Management)
- React Router
- Firebase Client SDK

**Backend:**
- Node.js
- Express.js
- Firebase Admin SDK
- Firestore
- Firebase Storage

**AI Integration:**
- Axicov AI agents (external)

## 📁 Project Structure

```
hackathon-platform/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── stores/        # Zustand stores
│   │   ├── services/      # API services
│   │   └── utils/         # Helper functions
│   └── package.json
│
└── backend/           # Express API server
    ├── src/
    │   ├── config/        # Configuration files
    │   ├── middleware/    # Auth & role middleware
    │   ├── routes/        # API routes
    │   └── services/      # Business logic
    └── package.json
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Firebase project created
- Firebase service account JSON

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (use `.env.example` as template):
```bash
cp .env.example .env
```

4. Configure environment variables:
- Add Firebase credentials
- Add Axicov API endpoints (when available)
- Set CORS origin to frontend URL

5. Start the server:
```bash
npm run dev
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with Firebase config:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🔐 Firebase Configuration

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password)
4. Create Firestore database
5. Enable Storage

### 2. Get Configuration
- **Frontend:** Get web app config from Project Settings
- **Backend:** Download service account JSON from Project Settings → Service Accounts

### 3. Set Security Rules

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🤖 AI Integration (Axicov)

The platform uses external Axicov AI agents for evaluation:

**Pre-Evaluation Agent:**
- Analyzes GitHub profiles
- Reviews resumes
- Evaluates idea presentations
- Assesses team composition

**Final Evaluation Agent:**
- Analyzes GitHub repository
- Reviews code quality
- Evaluates project completeness
- Assesses documentation

### Configuration
Update `.env` in backend with Axicov credentials:
```env
AXICOV_PRE_EVAL_URL=your_pre_eval_endpoint
AXICOV_FINAL_EVAL_URL=your_final_eval_endpoint
AXICOV_API_KEY=your_api_key
```

Currently using **mock implementation** until actual credentials are provided.

## 👥 User Roles

### Participant
- Browse hackathons
- Create/join teams
- Submit registrations
- Upload files (resume, PPT, code)
- View evaluation results
- RSVP for events

### Organizer
- Create hackathons
- Configure AI evaluation weights
- Review applications
- Trigger AI evaluations
- Accept/reject/waitlist teams
- View analytics

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register user
- `GET /api/auth/me` - Get current user

### Hackathons
- `GET /api/hackathons` - List all hackathons
- `GET /api/hackathons/:id` - Get hackathon details
- `POST /api/hackathons` - Create hackathon (organizer)
- `PUT /api/hackathons/:id` - Update hackathon (organizer)

### Teams
- `POST /api/teams` - Create team
- `POST /api/teams/join` - Join team with code
- `GET /api/teams/:id` - Get team details
- `POST /api/teams/:id/submit` - Submit registration
- `POST /api/teams/:id/rsvp` - RSVP for hackathon
- `POST /api/teams/:id/final-submit` - Final submission

### File Uploads
- `POST /api/uploads/resume` - Upload resume
- `POST /api/uploads/ppt` - Upload presentation
- `POST /api/uploads/executable` - Upload project files

### AI Evaluation
- `POST /api/ai/pre-evaluate/:hackathonId` - Trigger pre-evaluation (organizer)
- `POST /api/ai/final-evaluate/:hackathonId` - Trigger final evaluation (organizer)
- `GET /api/ai/scores/:teamId` - Get team scores

## 🎨 Features

✅ AI-powered team evaluation  
✅ Role-based access control  
✅ Firebase authentication  
✅ File uploads to Firebase Storage  
✅ Real-time team management  
✅ Custom AI scoring weights  
✅ QR code generation for RSVP  
✅ Dark theme UI  
✅ Responsive design  
✅ Team collaboration with codes  

## 🚧 Development Notes

- No TypeScript (JavaScript only as requested)
- No test files included
- Mock AI implementation (replace with actual Axicov integration)
- Production-ready code structure
- Environment-based configuration
- Secure backend-only AI communication

## 📝 License

MIT License - feel free to use for your hackathon platform!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

---

Built with ❤️ for the hackathon community
