# 🏡 OwnStay – Luxury Co-Living & Zero-Brokerage Rentals

[![Live Demo](https://img.shields.io/badge/Live_Demo-ownstay--eight.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://ownstay-eight.vercel.app)
[![CI / CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/amannex/ownstay/actions)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)

**OwnStay** is a next-generation residential leasing and luxury co-living web application designed to eliminate real estate friction. Featuring immersive **3D virtual walkthroughs**, an intelligent **AI Lifestyle Matchmaker**, and **100% zero-brokerage verified listings** across India's top tech hubs.

---

## 🌟 Key Features

### 🎮 Immersive 3D & Virtual Walkthroughs
- **Interactive Three.js Canvas**: Explore architectural models and room layouts with fluid camera animations and interactive hotspots.
- **2D/3D Floor Plans**: Toggle seamlessly between cinematic room previews, interactive floor plans, and live noise/acoustics audits.

### 🤖 AI Lifestyle Matchmaker
- **Custom Lifestyle Profiling**: Matches properties based on quiet WFH acoustics, fiber Wi-Fi speeds, metro proximity, and natural lighting preferences.
- **Smart Scoring Engine**: Ranks listings dynamically against personalized lifestyle and budget criteria.

### ⚖️ Side-by-Side Property Comparison Matrix
- **100% Aligned Row-by-Row Table**: Structured HTML comparison table guaranteeing horizontal alignment across prices, security deposits, Wi-Fi speeds, transit distances, and OwnStay audit scores.
- **Indian Rupee (`₹`) Localization**: Standardized Indian currency formatting across all rental cards, modals, and comparison tables.

### 🏙️ Multi-City Explorer & Neighborhood Audits
- **Curated Tech Hubs**: Filter listings across Gurgaon, Bengaluru, Mumbai, Pune, Hyderabad, and Delhi NCR.
- **Real-Time Acoustics & Wi-Fi Audits**: Every listing is independently inspected for decibel levels and verified broadband speeds.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + Vite 6 | Lightning-fast component architecture and HMR dev server |
| **Styling & UI** | Tailwind CSS + Lucide Icons | Utility-first styling with responsive glassmorphic cards and badges |
| **3D & Animation** | Three.js + `@react-three/fiber` | High-performance WebGL rendering and interactive 3D hero scenes |
| **Linting & Code Quality** | Oxlint (`npm run lint`) | Ultra-fast Rust-based linter enforcing React Rules of Hooks |
| **CI / CD Pipeline** | GitHub Actions + Vercel | Automated PR verification checks and zero-downtime production deployments |

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/amannex/ownstay.git
cd ownstay
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the app locally.

---

## 🧪 Build & Code Verification

OwnStay enforces strict code quality and build verification before any pull request is merged:

```bash
# Run ultra-fast Oxlint check (verifies React hooks, unused variables, syntax)
npm run lint

# Build production bundle for Vercel
npm run build
```

---

## 📁 Project Structure

```
ownstay/
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI workflow (Oxlint + Vite Build)
├── src/
│   ├── components/
│   │   ├── ai/                # AI Lifestyle Matchmaker modal & logic
│   │   ├── auth/              # Authentication & User Role modals
│   │   ├── hero3d/            # 3D interactive Three.js scenes & architectural viewers
│   │   ├── layout/            # Navbar, Footer, and navigation drawers
│   │   ├── properties/        # Featured properties, cards, PropertyModal, CompareDrawer
│   │   └── sections/          # ExploreCities, BlogSection, ManagedServicesShowcase
│   ├── pages/                 # HomePage, PropertiesPage, JournalPage, WhyOwnStayPage
│   ├── services/              # WordPress CMS blog client & static fallbacks
│   ├── App.jsx                # Router & root modal state providers
│   └── main.jsx               # Application entry point
├── index.html                 # Root HTML & meta tags
├── tailwind.config.js         # Custom theme colors, fonts, and animation utilities
└── vite.config.js             # Vite bundler & React plugin configuration
```

---

## 🌐 Live Deployment
- **Production URL**: [https://ownstay-eight.vercel.app](https://ownstay-eight.vercel.app)
- **Host**: Vercel
- **Continuous Deployment**: Automatically deploys when Pull Requests are merged into the `main` branch.

---

## 📄 License
© 2026 OwnStay. All rights reserved. Built with precision for modern co-living.
