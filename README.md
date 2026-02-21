# Patient Ecosystem POC

A local proof-of-concept for a patient management system with file upload capability and JWT-based patient self-service authentication.

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
| Auth        | JWT + bcrypt     | Patient self-service auth |
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

```bash
psql -U postgres -f database/schema.sql
psql -U postgres -d patient_ecosystem -f database/migrations/001_add_password_hash.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL credentials and JWT secret
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

## Authentication

The API uses **JWT-based patient self-service authentication**. Each patient registers with email and password and can only access their own record and documents.

### How it works

1. **Register** — `POST /api/auth/register` creates a patient account and returns a JWT
2. **Login** — `POST /api/auth/login` verifies credentials and returns a JWT
3. **Protected requests** — include the token as `Authorization: Bearer <token>`
4. **Token expiry** — 7 days

Passwords are hashed with bcrypt (cost factor 12). The `password_hash` field is never returned in API responses.

### Environment variables

Add the following to `backend/.env`:

```
JWT_SECRET=your-secret-key-change-in-prod
JWT_EXPIRES_IN=7d
```

### Quick test

```bash
# Register
curl -s -X POST http://localhost:3001/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"first_name":"Jane","last_name":"Smith","date_of_birth":"1985-06-20","email":"jane@example.com","password":"password123"}'

# Login and capture token
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"jane@example.com","password":"password123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

# Access own profile
curl -s http://localhost:3001/api/patients \
  -H "Authorization: Bearer $TOKEN"
```

---

## API Endpoints

### Public

| Method | Endpoint              | Description   |
|--------|-----------------------|---------------|
| GET    | /api/health           | Health check  |
| POST   | /api/auth/register    | Create account and receive JWT |
| POST   | /api/auth/login       | Login and receive JWT |

### Protected (require `Authorization: Bearer <token>`)

All protected endpoints are scoped to the authenticated patient — patients can only read and modify their own data.

| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| GET    | /api/patients                   | Get own profile          |
| GET    | /api/patients/:id               | Get patient by ID (own only) |
| PUT    | /api/patients/:id               | Update patient (own only) |
| DELETE | /api/patients/:id               | Delete patient (own only) |
| GET    | /api/patients/:id/documents     | List own documents       |
| POST   | /api/patients/:id/documents     | Upload document          |
| GET    | /api/documents/:id/download     | Download document (own only) |
| DELETE | /api/documents/:id              | Delete document (own only) |

Cross-account access returns `403 Access denied`.

---

## Postman Collection

Import `postman/patient-ecosystem.postman_collection.json` into Postman. The **Register** and **Login** requests include test scripts that automatically save the token and `patientId` as collection variables — run either one first and all subsequent requests will be authenticated.

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
│       │   ├── auth.js       # Register / login
│       │   ├── patients.js   # Patient CRUD routes (auth-protected)
│       │   └── documents.js  # Document upload/download routes (auth-protected)
│       └── middleware/
│           ├── auth.js       # JWT requireAuth middleware
│           └── upload.js     # Multer file upload config
├── frontend/
│   ├── package.json
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── components/
│       │   ├── AuthPage.jsx  # Login / register UI
│       │   ├── PatientForm.jsx
│       │   ├── PatientList.jsx
│       │   └── FileUpload.jsx
│       └── services/
│           └── api.js        # Axios API client with JWT interceptors
├── database/
│   ├── schema.sql            # Table definitions
│   ├── seed.sql              # Sample data
│   └── migrations/
│       └── 001_add_password_hash.sql
├── postman/
│   └── patient-ecosystem.postman_collection.json
├── uploads/                  # Uploaded files (gitignored)
└── README.md
```
