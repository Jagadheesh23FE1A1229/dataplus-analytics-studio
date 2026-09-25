# 📊 Full Stack Business Analytics Dashboard Builder
> **Comprehensive Enterprise Analytics & Interactive Dashboard Platform**  
> *Final Year B.Tech IT Capstone Project / Full Stack Engineering Portfolio*

[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.x-FF6384?logo=chart.js&logoColor=white)](https://www.chartjs.org/)

---

## 🌟 Executive Summary

**DataPulse** is a modern, full-stack Business Intelligence (BI) and analytics dashboard builder. It empowers analysts, managers, and executives to transform raw CSV business datasets into high-impact, interactive KPI cards and visual dashboards in seconds.

### Key Highlights:
- **Instant CSV Ingestion & Type Inference**: Automatically analyzes column headers, sample distributions, and infers datatypes (`numeric`, `date`, `categorical`).
- **Interactive Drag-and-Drop Visual Builder**: Configure custom KPI cards (Revenue, Orders, Growth, Averages) and rich charts (Vertical Bar, Horizontal Bar, Line, Pie, Doughnut).
- **Dynamic Multi-Dimensional Slicing**: Real-time date range filters and categorical filtering across all widgets simultaneously.
- **Executive Presentation & Report Mode**: Dedicated fullscreen viewer for board presentations with 1-click print-optimized PDF generation and filtered CSV exports.
- **Dual Persistence Architecture**: Production-ready MongoDB Atlas cloud integration backed by an intelligent in-memory store fallback.

---

## 🏗️ Architecture & Technology Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                  │
│              React 19 + Vite 8 + Tailwind CSS + Chart.js               │
│                                                                        │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────────────┐ │
│ │  Auth & JWT  │ │ CSV Uploader │ │ Data Engine  │ │ Dashboard Grid  │ │
│ │  Context UI  │ │ & PapaParse  │ │ Aggregations │ │ Charts & KPIs   │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ └─────────────────┘ │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │ REST API (Bearer JWT / Axios)
┌───────────────────────────────────▼────────────────────────────────────┐
│                              BACKEND                                   │
│                  Node.js + Express.js + Mongoose                       │
│                                                                        │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────────────┐ │
│ │ Auth Routes  │ │ Dataset API  │ │Dashboard API │ │ Error & Upload  │ │
│ │ bcrypt + JWT │ │ Multer + CSV │ │ Full CRUD    │ │ Middleware      │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ └─────────────────┘ │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                              DATABASE                                  │
│              MongoDB Atlas Cloud (with Resilient Fallback)             │
│                                                                        │
│ ┌──────────────┐ ┌───────────────────────────────┐ ┌─────────────────┐ │
│ │ Users        │ │ Datasets                      │ │ Dashboards      │ │
│ │ Email, Hash  │ │ Schema, Headers, Rows, Owner  │ │ Layout, Widgets │ │
│ └──────────────┘ └───────────────────────────────┘ └─────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### Stack Breakdown
- **Frontend**: React 19, Vite 8, Tailwind CSS v4, Lucide React, Chart.js 4, React-Chartjs-2, PapaParse.
- **Backend**: Node.js (ES Modules), Express.js 4, Multer (Memory Storage), CSV-Parser (Stream Parsing), JSON Web Token (JWT), Bcrypt.js.
- **Database**: MongoDB Atlas / Mongoose 8 with indexing on compound user relations and graceful in-memory fallback.

---

## 📁 Repository Directory Structure

```
full stack/
├── package.json                # Project-wide script orchestrator
├── ARCHITECTURE.md             # Architecture blueprint and design patterns
├── README.md                   # Comprehensive project documentation
├── sample_data/                # Pre-packaged global superstore sample dataset
│   └── global_superstore_sample.csv
├── client/                     # Frontend Single Page Application
│   ├── public/
│   │   ├── favicon.svg
│   │   └── sample_sales_data.csv
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js       # Centralized REST API client with Bearer auth
│   │   ├── components/
│   │   │   ├── ChartWidget.jsx # Chart.js wrapper (Bar, Line, Pie, Doughnut)
│   │   │   ├── DatasetUploadModal.jsx # Drag-and-drop CSV uploader with preview
│   │   │   ├── KPICard.jsx     # High-impact metric card with ambient glow
│   │   │   ├── Navbar.jsx      # Navigation header with user profile menu
│   │   │   ├── Sidebar.jsx     # Workspace drawer with quick demo data loader
│   │   │   └── WidgetModal.jsx # Visual builder modal for KPI/Chart customization
│   │   ├── context/
│   │   │   ├── AuthContext.jsx # JWT state & persistent session management
│   │   │   └── ToastContext.jsx # Glassmorphic animated alerts & toasts
│   │   ├── pages/
│   │   │   ├── DashboardBuilder.jsx # Interactive drag-and-drop widget layout
│   │   │   ├── DashboardOverview.jsx # Analytics workspace overview & KPI cards
│   │   │   ├── DashboardViewer.jsx  # Presentation mode with print & export
│   │   │   ├── DatasetsPage.jsx # Dataset manager & spreadsheet inspector
│   │   │   ├── LandingPage.jsx  # Marketing hero with live preview highlights
│   │   │   ├── LoginPage.jsx    # User authentication with demo 1-click login
│   │   │   └── RegisterPage.jsx # Secure user onboarding
│   │   ├── utils/
│   │   │   └── analyticsEngine.js # High-performance client-side aggregation
│   │   ├── App.jsx             # Main router shell and route guard
│   │   ├── index.css           # Tailwind v4 directives and print styles
│   │   └── main.jsx            # React root entry
│   ├── package.json
│   └── vite.config.js
└── server/                     # Backend REST API Server
    ├── config/
    │   └── db.js               # Mongoose Atlas connection with resilient retry
    ├── controllers/
    │   ├── authController.js   # JWT login, register, and /me verification
    │   ├── dashboardController.js # Dashboard CRUD, duplication & stats
    │   └── datasetController.js   # CSV streaming upload & column analyzer
    ├── middleware/
    │   ├── authMiddleware.js   # Bearer JWT verification guard
    │   ├── errorMiddleware.js  # Centralized error handler
    │   └── uploadMiddleware.js # Multer file interceptor
    ├── models/
    │   ├── Dashboard.js        # Dashboard schema & widget definitions
    │   ├── Dataset.js          # Dataset schema & column metadata
    │   └── User.js             # User credentials & bcrypt hashing hooks
    ├── routes/
    │   ├── authRoutes.js
    │   ├── dashboardRoutes.js
    │   └── datasetRoutes.js
    ├── utils/
    │   └── memoryStore.js      # Resilient fallback memory store
    ├── .env                    # Environment credentials
    ├── .env.example
    ├── server.js               # Express application entry
    └── package.json
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)

### 2. Start the Backend API Server
```bash
cd server
npm install
npm run dev
```
*The server will start on `http://localhost:5000` and automatically connect to MongoDB Atlas.*

### 3. Start the Frontend Client
In a new terminal window:
```bash
cd client
npm install
npm run dev
```
*The client will start on `http://localhost:5173`.*

### 4. Or Run from Root
```bash
# Start backend
npm run dev:server

# Start frontend
npm run dev:client
```

---

## 📡 Complete REST API Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user account (name, email, password) |
| `POST` | `/api/auth/login` | Public | Login with email/password and receive JWT token |
| `GET` | `/api/auth/me` | Private | Retrieve active user profile and token validation |

### 📂 Datasets (`/api/datasets`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/datasets/upload` | Private | Upload CSV file via multipart/form-data |
| `POST` | `/api/datasets/sample` | Private | Seed pre-packaged Global Superstore sample dataset |
| `GET` | `/api/datasets` | Private | Retrieve all datasets uploaded by authenticated user |
| `GET` | `/api/datasets/:id` | Private | Retrieve full dataset with rows and inferred schema |
| `DELETE` | `/api/datasets/:id` | Private | Delete dataset and cascade delete linked dashboards |

### 📊 Dashboards (`/api/dashboards`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/dashboards/stats/overview` | Private | Summary statistics (counts of datasets, dashboards, widgets) |
| `POST` | `/api/dashboards` | Private | Create a new custom dashboard configuration |
| `GET` | `/api/dashboards` | Private | List all saved dashboards for current user |
| `GET` | `/api/dashboards/:id` | Private | Get single dashboard with configured widgets & filters |
| `PUT` | `/api/dashboards/:id` | Private | Update dashboard title, description, or widgets |
| `POST` | `/api/dashboards/:id/duplicate` | Private | Clone existing dashboard into a copy |
| `DELETE` | `/api/dashboards/:id` | Private | Remove a dashboard |

---

## 🎯 Viva & Technical Defense Questions & Answers

### Q1: What problem does this system solve?
> **Answer**: Most non-technical business professionals lack the technical skills to query SQL databases or program Python charts (Matplotlib/Seaborn). DataPulse provides an intuitive, web-based self-service visual platform where users can drag, configure, filter, and present interactive multi-dimensional dashboards directly from standard spreadsheet CSV files without writing a single line of code.

### Q2: How does the CSV column analysis and datatype inference work?
> **Answer**: In `datasetController.js` and `analyticsEngine.js`, the uploaded CSV stream is analyzed column by column. The engine examines the values across sample rows, strips currency symbols (`$`, `€`, `%`), tests for numeric validity (`!isNaN(Number(val))`), and tests for date patterns (`Date.parse()`). If 80%+ of valid entries conform to numeric values, the column is classified as `number`; otherwise, if date-formatted, classified as `date`; else `string` (categorical).

### Q3: Why is Chart.js and React-Chartjs-2 used instead of static image rendering?
> **Answer**: Chart.js renders high-performance HTML5 `<canvas>` elements that support real-time user interactions, tooltips, responsive dynamic animations, and dynamic re-computation without expensive server round-trips. When interactive filters (date range or category) are modified, the aggregations update in-memory and re-render within milliseconds.

### Q4: How is security handled for API endpoints?
> **Answer**: All private routes use the `protect` middleware (`authMiddleware.js`). Requests must include an `Authorization: Bearer <jwt_token>` header. The token is cryptographically verified using `jwt.verify` with HMAC SHA-256. Additionally, all database queries enforce row-level ownership: `user: req.user._id`, preventing unauthorized access across user accounts.

### Q5: What is the purpose of the in-memory fallback store (`memoryStore.js`)?
> **Answer**: If external network connectivity is restricted, or MongoDB Atlas experiences network timeouts during evaluation/examinations, the server automatically and transparently switches to the in-memory database store (`MemoryStore`). This guarantees 100% uptime and testability in offline viva environments without failing the demonstration.

---

## 📜 License
This project is open-source and released under the [MIT License](LICENSE).
