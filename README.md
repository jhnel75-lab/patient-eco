# Patient Ecosystem POC

A local proof-of-concept for a patient management system with file upload capability.

## Architecture

```
Browser (Patient UI)
    └── React Frontend  (http://localhost:5173)
            └── Node.js Backend API  (http://localhost:3001)
                    ├── PostgreSQL Database  (localhost:5432)
                    └── Local File Storage  (./uploads/)
```

## Stack

| Layer       | Technology       | Purpose                  |
|-------------|------------------|--------------------------|
| Frontend    | React + Vite     | Patient UI               |
| Backend     | Node.js/Express  | REST API                 |
| Database    | PostgreSQL        | Persistent data store    |
| File Store  | Local filesystem | Patient document uploads |
| DB GUI      | pgAdmin 4        | Database management      |
| API Testing | Postman          | API development/testing  |
| Version Ctrl| Git              | Source control           |
| IDE         | VS Code          | Development              |

---

## Prerequisites

- Node.js >= 18
- PostgreSQL >= 14 (running locally)
- pgAdmin 4 (optional, for DB GUI)
- Git

---

## Setup

### 1. PostgreSQL – Create database and schema

Open pgAdmin or psql and run:

```sql
-- Run database/schema.sql
```

Or from terminal:
```bash
psql -U postgres -f database/schema.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL credentials
npm install
npm run dev
```

Backend runs at: http://localhost:3001

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

---

## API Endpoints

| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| GET    | /api/health                     | Health check             |
| GET    | /api/patients                   | List all patients        |
| POST   | /api/patients                   | Register new patient     |
| GET    | /api/patients/:id               | Get patient by ID        |
| PUT    | /api/patients/:id               | Update patient           |
| DELETE | /api/patients/:id               | Delete patient           |
| GET    | /api/patients/:id/documents     | List patient documents   |
| POST   | /api/patients/:id/documents     | Upload document          |
| GET    | /api/documents/:id/download     | Download document        |
| DELETE | /api/documents/:id              | Delete document          |

---

## Postman Collection

Import `postman/patient-ecosystem.postman_collection.json` into Postman to test all endpoints.

---

## Project Structure

```
patient-ecosystem-poc/
├── backend/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── index.js          # Express app entry point
│       ├── config/
│       │   └── database.js   # PostgreSQL pool config
│       ├── routes/
│       │   ├── patients.js   # Patient CRUD routes
│       │   └── documents.js  # Document upload/download routes
│       └── middleware/
│           └── upload.js     # Multer file upload config
├── frontend/
│   ├── package.json
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── components/
│       │   ├── PatientForm.jsx
│       │   ├── PatientList.jsx
│       │   └── FileUpload.jsx
│       └── services/
│           └── api.js        # Axios API client
├── database/
│   ├── schema.sql            # Table definitions
│   └── seed.sql              # Sample data
├── postman/
│   └── patient-ecosystem.postman_collection.json
├── uploads/                  # Uploaded files (gitignored)
└── README.md
```
