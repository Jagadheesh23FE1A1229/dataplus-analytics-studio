# 📊 Full Stack Business Analytics Dashboard Builder
### Comprehensive Architecture & Technical Blueprint (Final Year B.Tech IT Project)

## 1. System Architecture
The application follows a decoupled client-server architecture with secure RESTful APIs:

```
┌────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                  │
│              React 18 + Vite + Tailwind CSS + Chart.js                 │
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
│                   MongoDB (Atlas / Local Mongoose)                     │
│                                                                        │
│ ┌──────────────┐ ┌───────────────────────────────┐ ┌─────────────────┐ │
│ │ Users        │ │ Datasets                      │ │ Dashboards      │ │
│ │ Email, Hash  │ │ Schema, Headers, Rows, Owner  │ │ Layout, Widgets │ │
│ └──────────────┘ └───────────────────────────────┘ └─────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

## 2. Directory Structure
```
full stack/
├── client/                     # Frontend Single Page App (React + Vite)
│   ├── public/
│   │   └── sample_sales_data.csv # Sample dataset for fast demo
│   ├── src/
│   │   ├── api/                # API client with JWT bearer interceptors
│   │   ├── components/         # Reusable UI widgets, Navbar, Sidebar, Modals
│   │   ├── context/            # AuthContext and Notification/ToastContext
│   │   ├── pages/              # Landing, Auth, Datasets, Builder, Viewer
│   │   ├── utils/              # Aggregation engine (SUM, AVG, MIN, MAX, Grouping)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── server/                     # Backend REST API Server (Node + Express)
│   ├── config/                 # Database connection with graceful fallback
│   ├── controllers/            # Business logic for auth, datasets, dashboards
│   ├── middleware/             # Auth JWT guard, multer upload, error handler
│   ├── models/                 # Mongoose schemas (User, Dataset, Dashboard)
│   ├── routes/                 # Express route definitions
│   ├── sample_data/            # Sample CSV dataset on the server
│   ├── .env.example            # Environment variables template
│   ├── server.js               # Entry point
│   └── package.json
└── README.md                   # Complete documentation and viva guide
```
