# 🏃‍♂️ AthlNet - Athletic Social Network Platform

<div align="center">
  
![AthlNet Logo](https://via.placeholder.com/120x120/3B82F6/FFFFFF?text=AthlNet)

**A modern social networking platform connecting athletes, coaches, and sports enthusiasts worldwide**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-athlnet.web.app-blue?style=for-the-badge)](https://athlnet.web.app)
[![Firebase](https://img.shields.io/badge/Firebase-FF6C37?style=for-the-badge&logo=firebase&logoColor=white)](https://firebase.google.com/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

## 🌟 **Features Overview**

### 🔐 **Authentication & User Management**
- **Secure Authentication** - Firebase Auth with email/password and social login
- **Profile Management** - Comprehensive user profiles with personal information, achievements, and media
- **Role-based Access** - Separate interfaces for Athletes and Coaches
- **Account Settings** - Profile editing, privacy controls, and account management

### 🏠 **Social Feed & Discovery**
- **Dynamic Home Feed** - Personalized content stream with posts, achievements, and updates
- **Content Creation** - Rich text posts with image/video uploads and media optimization
- **Trending Panel** - Popular content, hashtags, and trending topics
- **Advanced Search** - Find athletes, coaches, and content with powerful filtering

### 🤝 **Social Connections**
- **Connection System** - Send and receive connection requests with real-time updates
- **Follow/Following** - Build your network with follow functionality
- **Connection Discovery** - Suggested connections based on interests and location
- **Social Graph** - View mutual connections and network insights

### 💬 **Real-time Messaging**
- **Direct Messaging** - Private conversations between users
- **Real-time Chat** - Instant messaging with Firebase real-time database
- **Message History** - Persistent conversation history and search
- **Media Sharing** - Share images, videos, and files in conversations

### 🔔 **Notification System**
- **Real-time Notifications** - Instant alerts for all social interactions
- **Notification Types**:
  - 🤝 New connection requests
  - 👥 New followers
  - 💬 New messages
  - ❤️ Post likes and interactions
- **Notification Center** - Centralized notification management with read/unread status
- **Push Notifications** - Browser push notifications for important updates

### 👨‍🏫 **Coach Dashboard & Features**
- **Coach Profile** - Specialized profiles showcasing expertise and credentials
- **Coaching Programs** - Create and manage training programs
- **Analytics Dashboard** - Track engagement, reach, and coaching metrics
- **Student Management** - Manage coached athletes and their progress

### 📊 **Analytics & Insights**
- **Profile Analytics** - View profile visits, engagement metrics
- **Content Performance** - Track post reach, likes, and interactions
- **Connection Growth** - Monitor network expansion over time
- **Interactive Charts** - Data visualization with D3.js and Recharts

### 🎨 **Modern UI/UX**
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Dark/Light Mode** - Theme switching with system preference detection
- **Smooth Animations** - Framer Motion powered transitions and micro-interactions
- **Accessible Design** - WCAG compliant with keyboard navigation and screen reader support

---

## 🛠 **Technology Stack**

### **Frontend**
- **React 18** - Modern React with hooks, suspense, and concurrent features
- **Vite** - Lightning-fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework with custom design system
- **Framer Motion** - Production-ready motion library for animations
- **Lucide React** - Beautiful, customizable SVG icons

### **Backend & Database**
- **Firebase Firestore** - NoSQL document database with real-time sync
- **Firebase Authentication** - Secure user authentication and management
- **Firebase Storage** - Scalable file storage for images and media
- **Firebase Security Rules** - Server-side security and data validation

### **State Management & Routing**
- **Redux Toolkit** - Simplified Redux for predictable state management
- **React Router v6** - Declarative routing with nested routes
- **React Hook Form** - Performant forms with minimal re-renders

### **Data Visualization & Charts**
- **Recharts** - Composable charting library built on React components
- **D3.js** - Data-driven documents for advanced visualizations

---

## � **Getting Started**

### **Prerequisites**
- Node.js (v16.x or higher)
- npm or yarn
- Firebase project with Firestore, Authentication, and Storage enabled

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/Gouthaman11/AthlNet.git
   cd AthlNet/athlnet-1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a `.env` file in the root directory
   - Add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

---

## 📁 **Project Structure**

```
athlnet-1/
├── public/                     # Static assets
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Core UI components
│   │   └── ...                 # Feature-specific components
│   ├── pages/                  # Page components
│   │   ├── home-feed/          # Home feed and social features
│   │   ├── messaging/          # Chat and messaging
│   │   ├── user-profile/       # Profile management
│   │   ├── search-and-discovery/ # Search and discovery
│   │   ├── dashboard-analytics/ # Analytics and insights
│   │   └── ...                 # Other pages
│   ├── contexts/               # React contexts (Auth, Theme)
│   ├── utils/                  # Utility functions and helpers
│   │   ├── firestoreSocialApi.js # Social media functions
│   │   ├── notificationUtils.js  # Notification management
│   │   └── ...                 # Other utilities
│   ├── styles/                 # Global styles and Tailwind config
│   ├── firebaseClient.js       # Firebase configuration
│   ├── App.jsx                 # Main application component
│   └── Routes.jsx              # Application routing
├── firebase.json               # Firebase configuration
├── firestore.rules            # Firestore security rules
├── storage.rules              # Storage security rules
└── ...
```

---

## 🔧 **Key Features Implementation**

### **Real-time Notifications**
```javascript
// notificationUtils.js - Notification system
export const sendNewConnectionNotification = async (fromUserId, toUserId) => {
  // Creates real-time notifications for connection requests
};

export const sendNewMessageNotification = async (fromUserId, toUserId, message) => {
  // Handles message notifications with real-time updates
};
```

### **Social Connections**
```javascript
// firestoreSocialApi.js - Social features
export const connectWithUser = async (currentUserId, targetUserId) => {
  // Handles connection requests with transaction-based operations
};

export const followUser = async (currentUserId, targetUserId) => {
  // Manages following relationships with real-time updates
};
```

### **Responsive Design**
```jsx
// Mobile-first responsive components
<div className="flex flex-col md:flex-row lg:grid lg:grid-cols-3 gap-4">
  <div className="w-full md:w-2/3 lg:col-span-2">
    {/* Main content */}
  </div>
  <div className="w-full md:w-1/3 lg:col-span-1">
    {/* Sidebar */}
  </div>
</div>
```

---

## 📱 **Responsive Design**

AthlNet is built with a mobile-first approach:

- **Mobile (< 768px)**: Touch-optimized interface with bottom navigation
- **Tablet (768px - 1024px)**: Adaptive layout with collapsible sidebars
- **Desktop (> 1024px)**: Full-featured layout with multi-column design
- **4K/Ultra-wide**: Scaled layouts with maximum content width constraints

---

## 🚀 **Deployment**

### **Firebase Hosting**
```bash
# Build the project
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

### **Environment Variables**
Ensure all required environment variables are set for production:
- Firebase configuration
- API endpoints
- Feature flags

---

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## � **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## � **Acknowledgments**

- **Firebase** - Backend infrastructure and real-time capabilities
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide** - Beautiful icon library
- **React Community** - Amazing ecosystem and community support

---

## � **Contact & Support**

- **Live Demo**: [athlnet.web.app](https://athlnet.web.app)
- **GitHub Issues**: [Report bugs and feature requests](https://github.com/Gouthaman11/AthlNet/issues)
- **Email**: gouthamanarasu2005@gmail.com

---

<div align="center">

**Built with ❤️ for the athletic community**

[⭐ Star this repo](https://github.com/Gouthaman11/AthlNet) • [🐛 Report Bug](https://github.com/Gouthaman11/AthlNet/issues) • [✨ Request Feature](https://github.com/Gouthaman11/AthlNet/issues)

</div>
