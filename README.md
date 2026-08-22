<div align="center">

# 🏡 ApnaStay
### **Next-Generation Luxury Co-Living & Zero-Brokerage Rental Platform**

[![Live Demo](https://img.shields.io/badge/LIVE_DEMO-apnastay--eight.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://apnastay-eight.vercel.app)
[![CI / CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/amannex/apnastay/actions)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Next.js 15+](https://img.shields.io/badge/Next.js_15+-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![Oxlint](https://img.shields.io/badge/Linted_by-Oxlint-FF6B6B?style=for-the-badge)](https://oxc.rs/)

<p align="center">
  <b>ApnaStay</b> redefines urban residential rentals by combining <b>immersive Three.js 3D architectural walkthroughs</b>, an intelligent <b>AI Lifestyle Matchmaker</b>, and <b>100% zero-brokerage verified listings</b> across India's premier technology hubs.
</p>

---

</div>

## 🌟 Why ApnaStay?

Traditional real estate rental platforms are plagued by fake photos, hidden brokerage commissions, and poor neighborhood transparency. **ApnaStay** solves this with:

- **Zero Brokerage Guaranteed**: Direct-to-owner and managed residential rentals with transparent pricing formatted natively in Indian Rupees (`₹`).
- **Real-Time Acoustics & Wi-Fi Audits**: Every listing is inspected for decibel levels (quiet WFH certification) and verified broadband fiber Wi-Fi speeds.
- **Interactive 3D Architectural Walkthroughs**: WebGL-powered 3D models and interactive room explorers built with Three.js and `@react-three/fiber`.

---

## ✨ Key Features & Capabilities

### 🎮 Immersive Three.js 3D & Virtual Walkthroughs
- **Interactive Architectural Viewer**: Explore room layouts, spatial depth, and lighting with real-time camera orbit controls and interactive hotspots.
- **Cinematic Hero Experiences**: Features Foster architectural scenes, 2D/3D floor plan toggles, and ambient day/night lighting modes.

### 🤖 AI Lifestyle Matchmaker
- **Custom Lifestyle Profiling**: Multi-step interactive assistant that matches tenants based on quiet WFH acoustics, fiber Wi-Fi speeds, metro proximity, and natural lighting preferences.
- **Smart Scoring Engine**: Ranks listings dynamically against personalized lifestyle and budget criteria.

### ⚖️ Side-by-Side Property Comparison Matrix
- **100% Aligned Row-by-Row Table**: Structured HTML comparison table guaranteeing horizontal alignment across prices, security deposits, Wi-Fi speeds, transit distances, and ApnaStay audit scores.
- **Indian Rupee (`₹`) Localization**: Standardized Indian currency formatting across all rental cards, modals, and comparison tables (e.g., `₹0 Brokerage`, `₹15,800/mo`, `₹30,000 Refundable`).

### 🏙️ Multi-City Explorer & Tech Hubs
- **Curated Tech Neighborhoods**: Filter and explore verified properties across Gurgaon, Bengaluru, Mumbai, Pune, Hyderabad, and Delhi NCR.
- **Live City Statistics**: Dynamic property counts, average monthly rentals, and neighborhood lifestyle scores.

### 📰 Headless WordPress CMS & Journal
- **Dynamic Content Ingestion**: Fetches live editorial articles, market insights, and co-living guides via the WordPress REST API (`wordpressCms.js`).
- **Static Resilient Fallbacks**: Guarantees zero downtime with built-in fallback articles if external CMS endpoints are unreachable.

---

## 🏗️ System Architecture & Component Map

```
                     +-----------------------------------+
                     |         ApnaStay Web App           |
                     |         (Next.js 15+ & TS)        |
                     +-----------------+-----------------+
                                       |
          +----------------------------+----------------------------+
          |                            |                            |
+---------v---------+        +---------v---------+        +---------v---------+
|   3D WebGL Core   |        |  AI & Matchmaking |        |  Property Matrix  |
|   (Three.js/Drei) |        |    Engine Modal   |        |  (CompareDrawer)  |
+---------+---------+        +---------+---------+        +---------+---------+
          |                            |                            |
          v                            v                            v
 FosterArchitecturalScene     Lifestyle Multi-Step UI      HTML Table Grid Layout
    BuildingScene             Custom Weighted Scoring      ₹ Currency Formatting
```

---

## 🛠️ Technology Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 15+ (App Router)** + **React 19** + **TypeScript 5.x** | Static & dynamic SEO-optimized routing with full type safety and server/client components |
| **Styling & UI Design** | **Tailwind CSS** + **Lucide Icons** | Utility-first styling with responsive glassmorphic cards and badges |
| **3D & WebGL Engine** | **Three.js** + `@react-three/fiber` | High-performance 3D canvas rendering and camera animations |
| **Animation Library** | **GSAP** (GreenSock) | Smooth scroll-triggered animations and UI transitions |
| **Linting & Quality** | **Oxlint** (`npm run lint`) | Ultra-fast Rust-based linter enforcing strict React Rules of Hooks |
| **CI / CD Automation** | **GitHub Actions** + **Vercel** | Automated PR verification checks and zero-downtime production deployments |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: Version `18.x`, `20.x` (LTS recommended), or higher
- **npm**: Version `9.x` or higher

### 1. Clone the Repository
```bash
git clone https://github.com/amannex/apnastay.git
cd apnastay
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your web browser to explore the application locally.

---

## 🧪 Code Quality & Build Verification

ApnaStay enforces automated continuous integration checks. Before committing changes or submitting a Pull Request, run:

```bash
# Run the Oxlint linter (verifies React hooks, syntax, and unused variables)
npm run lint

# Build production bundle and verify zero bundling errors
npm run build
```

---

## 📁 Repository Structure

```
apnastay/
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI workflow (Oxlint + Next.js Build)
├── src/
│   ├── app/                   # Next.js 15+ App Router layouts & route handlers
│   │   ├── properties/        # Dynamic SEO property routes & listings
│   │   ├── cities/            # Tech hubs & city directory routes
│   │   ├── journal/           # Blog & legal articles routes
│   │   ├── why-apnastay/       # Zero-brokerage mission page
│   │   ├── layout.tsx         # Root layout with metadata & fonts
│   │   └── page.tsx           # Home page route handler
│   ├── components/
│   │   ├── ai/                # AI Lifestyle Matchmaker modal & scoring logic
│   │   ├── auth/              # Authentication & User Role modals
│   │   ├── hero3d/            # Interactive Three.js 3D scenes & architectural viewers
│   │   ├── layout/            # AppShell, Navbar, Footer, and interactive drawers
│   │   ├── properties/        # Featured properties, PropertyModal, CompareDrawer
│   │   └── sections/          # AppLaunchBanner, ExploreCities, BlogSection
│   ├── context/               # Global AppContext state provider
│   ├── types/                 # TypeScript interfaces and type definitions
│   ├── views/                 # Reusable page views (HomePage, PropertiesPage, etc.)
│   └── services/              # WordPress REST API client & static fallbacks
├── next.config.ts             # Next.js 15+ compiler & bundle configuration
├── tsconfig.json              # TypeScript 5.x compiler options
└── tailwind.config.js         # Custom theme tokens, fonts, and animation utilities
```

---

## 🌐 Live Deployment
- **Live Production URL**: [https://apnastay-eight.vercel.app](https://apnastay-eight.vercel.app)
- **Deployment Platform**: Vercel
- **Continuous Deployment**: Deploys automatically upon merging Pull Requests into the `main` branch.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m "feat: add amazing feature"`)
4. Verify code quality (`npm run lint && npm run build`)
5. Push to your branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request on GitHub

---

## 📄 License
© 2026 **ApnaStay**. All rights reserved. Built with precision for modern luxury co-living.
