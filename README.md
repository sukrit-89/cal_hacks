# Cal Hacks - Hackathon Management Platform

A comprehensive platform for hosting, managing, and participating in hackathons with AI-powered evaluation.

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/sukrit-89/cal_hacks.git
cd cal_hacks

# Backend setup
cd backend
npm install
cp .env.minimal .env  # Configure with your Firebase credentials
npm run dev

# Frontend setup (in new terminal)
cd frontend
npm install
cp .env.example .env  # Configure with your Firebase credentials
npm run dev
```

Open `http://localhost:5173` in your browser.

## 📖 Full Documentation

**[→ Complete Setup Guide](./SETUP_GUIDE.md)** - Detailed step-by-step instructions

## ✨ Features

- **For Organizers:**
  - Create & manage hackathons
  - AI-powered project evaluation
  - Team management & scoring
  - Analytics dashboard

- **For Participants:**
  - Browse & join hackathons
  - Team formation with invite system
  - Project submission
  - Real-time notifications
  - Statistics & leaderboards

## 🛠 Tech Stack

- **Frontend:** React, Vite, TailwindCSS, Zustand
- **Backend:** Node.js, Express
- **Database:** Firebase Firestore
- **Storage:** Firebase Storage
- **AI:** Axicov Integration

## 📁 Project Structure

```
├── backend/          # Express API server
├── frontend/         # React application
├── SETUP_GUIDE.md   # Detailed setup instructions
└── README.md        # This file
```

## 🔧 Prerequisites

- Node.js v18+
- Firebase account
- npm or yarn

## 📚 API Documentation

See [SETUP_GUIDE.md](./SETUP_GUIDE.md#9-api-endpoints-reference) for complete API reference.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Support

For setup help, see [SETUP_GUIDE.md](./SETUP_GUIDE.md#8-troubleshooting)

---

**Built with ❤️ for hackathon enthusiasts**
