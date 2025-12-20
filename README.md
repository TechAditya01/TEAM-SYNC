# 🚨 Nagar Alert Hub

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Twilio](https://img.shields.io/badge/Twilio-F22F46?style=for-the-badge&logo=twilio&logoColor=white)](https://www.twilio.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> Team SYNC presents : A whatsapp + webapp Real-time community alert system empowering neighborhoods with instant notifications about local disruptions.

## 🌟 Overview

Nagar Alert Hub : This platform enables residents to report and receive real-time alerts about local disruptions such as road blocks, water outages, power failures, and community events. With integrated WhatsApp, SMS, and AI-powered features, it ensures no one in your neighborhood misses critical updates.

## ✨ Features

### 🚀 Core Functionality
- **WhatsApp based Real-Time Alerts**: Instant notifications about community disruptions
- **Interactive Maps**: Visualize alerts geographically with Leaflet integration
- **Community Reporting**: Easy-to-use interface for submitting verified reports
- **Multi-Channel Notifications**: WhatsApp, SMS, and in-app alerts
- **AI-Powered Insights**: Intelligent alert categorization and prioritization

### 👨‍💼 Admin Dashboard
- **Analytics Dashboard**: Comprehensive statistics and trends
- **Alert Management**: Verify, resolve, and moderate community reports
- **WhatsApp Integration**: Direct messaging for critical alerts
- **User Management**: Profile and permission controls

### 🎨 User Experience
- **Dark/Light Mode**: Seamless theme switching
- **Responsive Design**: Optimized for mobile and desktop
- **Progressive Web App**: Installable PWA with offline capabilities
- **Location Services**: GPS-based alert filtering and reporting

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework for production
- **React 19** - UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component library
- **Leaflet** - Interactive maps
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Server-side type safety
- **Firebase** - PostgreSQL database with real-time subscriptions
- **Twilio** - SMS and WhatsApp API
- **AI Services** - Intelligent alert processing

### DevOps & Tools
- **Vite** - Fast build tool
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **GitHub Actions** - CI/CD pipelines

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm
- FIrebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/nagar-alert-hub.git
   cd nagar-alert-hub
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment files
   cp frontend/.env.example frontend/.env.local
   cp backend/.env.example backend/.env
   ```

   > Configure the  environment variables:

4. **Database Setup**
   ```bash
   # Run database migrations
   cd backend
   npm run db:migrate
   ```

5. **Start the application**
   ```bash
   # Start backend (in one terminal)
   cd backend
   npm run dev

   # Start frontend (in another terminal)
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📖 Usage

### For Users
1. **Sign Up/Login**: Create an account or log in
2. **View Alerts**: Browse current community alerts on the map or list view
3. **Report Issues**: Submit new alerts with location and details
4. **Receive Notifications**: Get real-time updates via SMS/WhatsApp

### For Admins
1. **Access Dashboard**: Navigate to `/admin`
2. **Manage Alerts**: Verify, edit, or resolve reported issues
3. **View Analytics**: Monitor community engagement and alert trends
4. **Configure Notifications**: Set up automated messaging rules

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 👥 Team

- **Lead Developer**: [Aditya]
- **UI/UX Designer**: [Mayank]
- **Backend Engineer**: [Priyanshu]
- **DevOps Engineer**: [Manish]

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Special thanks to [TECHSPRINT ft. GDG RCET] organizers
- Icons by [Lucide React](https://lucide.dev/)
- UI components by [Radix UI](https://www.radix-ui.com/)
- Maps powered by [Leaflet](https://leafletjs.com/)

---

<div align="center">
  <p>Made with ❤️ by Team SYNC for safer communities</p>
  <p>
    <a href="#features">Features</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#contributing">Contributing</a> •
    <a href="#license">License</a>
  </p>
</div>
