# SmartLib

Library Management System

A full-stack Library Management System (MERN) with two integrated machine learning features:
- **Book Recommendation Engine** — content-based recommendations per member
- **Late-Return Risk Prediction** — flags loans likely to be returned late

## Project Structure

```
library-management-system/
├── client/          React frontend
├── server/          Express/Node.js REST API + MongoDB models
├── ml-service/       Python (Flask) ML microservice
└── docs/            Project documentation, diagrams, schema docs
```

## Tech Stack

- **Frontend:** React, Tailwind CSS
- **Backend:** Express.js, Node.js
- **Database:** MongoDB (Mongoose)
- **ML Service:** Python, Flask, scikit-learn / XGBoost

## Getting Started

### 1. Clone and install dependencies

```bash
git clone <your-repo-url>
cd library-management-system

# Backend
cd server
npm install

# Frontend
cd ../client
npm install

# ML service
cd ../ml-service
pip install -r requirements.txt
```

### 2. Environment variables

Copy `server/.env.example` to `server/.env` and fill in your values:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ML_SERVICE_URL=http://localhost:5001
PORT=5000
```

### 3. Run each service (separate terminals)

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev

# Terminal 3 — ML service
cd ml-service && python app.py
```

## Team

| Role | Name |
|---|---|
| Project Leader | |
| Backend/Database | |
| Frontend | |
| ML | |
| Integration/QA | |

## Documentation

See `/docs` for the full system architecture, database schema, and process flow documentation.
