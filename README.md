# SkillSphere — Hyperlocal Freelance Marketplace

> A full-stack freelance marketplace connecting clients and freelancers with real-time chat, escrow payments, and AI-powered job matching.

## 🌐 Live Demo
| Service | URL |
|---------|-----|
| Frontend | https://skillsphere.vercel.app |
| Backend API | https://skillsphere-api.onrender.com |
| Health Check | https://skillsphere-api.onrender.com/health |

### Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@skillsphere.com | Admin@123 |

## 🛠 Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Redux Toolkit, React Router v7 |
| Styling | Tailwind CSS v4 |
| Backend | Node.js, Express 4 |
| Database | MongoDB Atlas + Mongoose |
| Real-time | Socket.IO |
| Payments | Razorpay (Escrow) |
| File Storage | Cloudinary |
| Auth | JWT + Google OAuth 2.0 |
| Deployment | Vercel (frontend) + Render (backend) |

## ✨ Features
- **Multi-role Auth** — Client / Freelancer / Admin with JWT + Google OAuth
- **Real-time Chat** — Socket.IO powered messaging with typing indicators
- **Escrow Payments** — Razorpay integration with milestone-based release
- **Admin Dashboard** — Analytics, user management, dispute resolution
- **AI Job Matching** — Smart skill-based gig recommendations
- **Review & Reputation** — Rating system with verified reviews
- **Notifications** — Real-time in-app + email notifications

## 🚀 Local Setup

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)

### Backend
```bash
cd server
cp .env.example .env
# Fill in your credentials in .env
npm install
npm run seed:admin   # Creates admin user
npm run dev
```

### Frontend
```bash
cd client
cp .env.example .env
# Fill in VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

App runs at: http://localhost:5173

## 📁 Project Structure
```
skillsphere/
├── client/          # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   └── utils/
│   ├── vercel.json
│   └── vite.config.js
└── server/          # Express backend
    ├── controllers/
    ├── models/
    ├── routes/
    ├── socket/
    ├── scripts/
    ├── seeders/
    └── server.js
```

## 🔐 Environment Variables
See [`server/.env.example`](server/.env.example) and [`client/.env.example`](client/.env.example)

## 📦 Production Deployment
- **Backend → Render**: See [`server/render.yaml`](server/render.yaml)
- **Frontend → Vercel**: See [`client/vercel.json`](client/vercel.json)
- **Database → MongoDB Atlas**: Whitelist `0.0.0.0/0` for Render's dynamic IPs

## 📄 License
MIT
