# InterviewIQ — AI-Based Interview Question Generator

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/Styles-Tailwind%20CSS-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![SQLite](https://img.shields.io/badge/Database-SQLite%20%2B%20SQLAlchemy-003B57.svg?logo=sqlite&logoColor=white)](https://sqlite.org)
[![LLM API](https://img.shields.io/badge/AI%20Engine-Gemini%20%7C%20OpenAI%20%7C%20Groq-8A2BE2.svg)](https://aistudio.google.com)
[![Tests](https://img.shields.io/badge/Tests-19%20Pytest%20%7C%208%20Vitest%20Passed-brightgreen.svg)](#running-tests)
[![Hardware](https://img.shields.io/badge/Hardware-8GB%20RAM%20Compatible-blue.svg)](#performance-and-8-gb-ram-compatibility)

**InterviewIQ** is an enterprise-grade AI web application that generates role-specific technical and HR interview questions, model answers, difficulty levels, evaluation rubrics, and scoring criteria based on a candidate's job role, experience level, skills, and interview requirements.

---

## Table of Contents
1. [Key Features](#key-features)
2. [Technology Stack](#technology-stack)
3. [Architecture and Request Flow](#architecture-and-request-flow)
4. [Screenshots](#screenshots)
5. [Prerequisites](#prerequisites)
6. [Quick Start Guide](#quick-start-guide)
   - [macOS / Linux](#macos--linux-setup)
   - [Windows (PowerShell)](#windows-powershell-setup)
7. [Environment Variable Configuration](#environment-variable-configuration)
8. [Obtaining an LLM API Key](#obtaining-an-llm-api-key)
9. [Database & Seed Data](#database--seed-data)
10. [Running the Application](#running-the-application)
11. [Running Tests](#running-tests)
12. [API Documentation (Swagger)](#api-documentation)
13. [Troubleshooting & FAQ](#troubleshooting--faq)
14. [Deployment Readiness & Security](#deployment-readiness--security)

---

## 1. Key Features

- **Role-Calibrated AI Generation**: Tailors depth to seniorities (Fresher, Entry, Mid, Senior) and domains (Python, Go, React, DevOps, Data, HR, etc.).
- **Granular Scoring Rubrics**: Every generated question includes explicit evaluation criteria whose maximum point allocations mathematically sum to the question's total score (e.g., 4 + 3 + 3 = 10 pts).
- **Behavioral Signal Detection**: Outlines observable indicators for strong answers as well as critical red flags and misconceptions.
- **Interactive Candidate Scoring**: Interviewers can score live candidate answers against individual rubric criteria, calculate automatic totals, and record evaluation notes.
- **Multi-Format Professional Exports**: Export interview sets as clean printable PDFs (via ReportLab), CSV spreadsheets, or JSON objects.
- **Single Question AI Regeneration**: Refine or regenerate an individual question using custom prompts without touching the rest of the interview set.
- **Secure Authentication & Isolation**: JWT token authentication, bcrypt password hashing, and user data isolation.
- **Light & Dark Themes**: Modern purple/indigo SaaS aesthetic with persistent dark mode support.
- **8 GB RAM Friendly**: Powered by cloud LLM inference and SQLite with zero heavy local daemons or Docker requirements.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Icons**: Lucide React
- **Routing**: React Router v6
- **Testing**: Vitest + React Testing Library + JSDOM

### Backend
- **Framework**: Python 3.12 + FastAPI
- **Data Validation**: Pydantic v2 + Pydantic-Settings
- **ORM & Database**: SQLAlchemy 2.0 with SQLite
- **Security**: PyJWT + Bcrypt password hashing
- **HTTP Client**: HTTPX (async client with retries)
- **PDF Generation**: ReportLab
- **Testing**: Pytest + Pytest-AsyncIO + Starlette TestClient

---

## 3. Architecture and Request Flow

```mermaid
flowchart TD
    User["Recruiter / Interviewer Browser"] -->|React + Vite SPA| Frontend["Frontend (Port 5173)"]
    Frontend -->|JWT Authenticated REST| API["FastAPI Backend (Port 8000)"]
    API -->|Auth & Ownership Check| AuthMiddleware["Auth & Rate Limiting"]
    AuthMiddleware -->|CRUD & History| SQLite["SQLite DB (interviewiq.db)"]
    AuthMiddleware -->|Prompt Synthesis| LLMService["LLM Provider Layer (Gemini / OpenAI / Groq)"]
    LLMService -->|Structured JSON Output| PydanticValidator["Pydantic Schema & Rubric Sum Validator"]
    PydanticValidator -->|Verified Output| SQLite
    PydanticValidator -->|Stream / Return| Frontend
    API -->|ReportLab Generator| PDFExport["Printable PDF / CSV / JSON Exports"]
```

---

## 4. Screenshots

> *Placeholder: Screenshots of the InterviewIQ dashboard, interactive rubric cards, generator form, and candidate evaluator.*

| Screen | Description |
|---|---|
| **Landing Page** | Hero, interactive live preview, feature highlights, and workflow. |
| **Interview Generator** | Role presets, skill matrix, difficulty slider, and duration settings. |
| **Question & Rubric View** | Expandable model answers, follow-up questions, and rubric table. |
| **Live Candidate Evaluator**| Criterion sliders, total point computation, and interviewer notes. |
| **History & Export** | Search, filter, duplication, and instant PDF/CSV/JSON downloads. |

---

## 5. Prerequisites

- **Python**: Version 3.10+ (Python 3.12 recommended)
- **Node.js**: Version 18+ (Node.js 20 or 24 recommended)
- **npm**: Version 9+
- **RAM**: Minimum 4 GB (runs comfortably on 8 GB laptops)
- **OS**: macOS, Linux, or Windows

---

## 6. Quick Start Guide

### macOS / Linux Setup

```bash
# 1. Clone or navigate to the repository
cd InterviewIQ

# 2. Setup Backend Virtual Environment
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# 3. Create .env file
cp .env.example .env

# 4. Seed Database with Demo User and Initial Interview Set
python -m app.db.seed

# 5. Start Backend Server (runs on port 8000)
uvicorn app.main:app --reload --port 8000
```

In a second terminal window, launch the frontend:

```bash
# In project root
cd frontend
npm install
npm run dev
```

Open your browser at `http://localhost:5173`.

---

### Windows (PowerShell) Setup

```powershell
# 1. Navigate to backend
cd backend

# 2. Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# 3. Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 4. Setup environment file
Copy-Item .env.example .env

# 5. Seed initial database
python -m app.db.seed

# 6. Start Backend Server
uvicorn app.main:app --reload --port 8000
```

In a new PowerShell window:

```powershell
cd frontend
npm install
npm run dev
```

---

## 7. Environment Variable Configuration

The backend configuration is managed in `backend/.env`. Placeholders are listed in `backend/.env.example`:

| Variable | Default Value | Description |
|---|---|---|
| `LLM_PROVIDER` | `gemini` | AI Provider: `gemini`, `openai`, `groq`, or `mock` |
| `LLM_API_KEY` | *(empty)* | Your LLM API key |
| `LLM_MODEL` | `gemini-2.5-flash` | Model identifier (`gemini-2.5-flash`, `gpt-4o-mini`, etc.) |
| `LLM_BASE_URL` | *(optional)* | Base URL for OpenAI-compatible providers (e.g. Groq) |
| `DATABASE_URL` | `sqlite:///./interviewiq.db` | SQLite database connection string |
| `JWT_SECRET_KEY` | *(secure string)* | Secret key for signing authentication JWT tokens |
| `ACCESS_TOKEN_EXPIRE_MINUTES`| `1440` | JWT expiration time (24 hours) |
| `RATE_LIMIT_GENERATE_PER_MINUTE` | `15` | Maximum AI generation calls per user per minute |
| `CORS_ORIGINS` | `http://localhost:5173` | Allowed frontend origins |

---

## 8. Obtaining an LLM API Key

### Google Gemini (Recommended — Free Tier Available)
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with your Google Account and click **"Create API Key"**.
3. Open `backend/.env` and configure:
   ```bash
   LLM_PROVIDER=gemini
   LLM_API_KEY=AIzaSy...your_gemini_key...
   LLM_MODEL=gemini-2.5-flash
   ```

### OpenAI / Groq
1. For OpenAI: Obtain key at [OpenAI Platform](https://platform.openai.com/api-keys).
2. Open `backend/.env` and configure:
   ```bash
   LLM_PROVIDER=openai
   LLM_API_KEY=sk-proj-...
   LLM_MODEL=gpt-4o-mini
   ```
3. For Groq (Ultra-fast Llama models):
   ```bash
   LLM_PROVIDER=openai
   LLM_BASE_URL=https://api.groq.com/openai/v1
   LLM_API_KEY=gsk_...
   LLM_MODEL=llama-3.3-70b-versatile
   ```

*Note: If no API key is configured, InterviewIQ provides a **Simulated Demo Mode** that produces high-fidelity, dynamic questions based on your input without throwing errors.*

---

## 9. Database & Seed Data

The database uses SQLite (`backend/interviewiq.db`) which requires no external server or background daemon.

To seed the initial demo account:
```bash
cd backend
python -m app.db.seed
```

**Pre-seeded Credentials:**
- **Email:** `demo@interviewiq.ai`
- **Password:** `demo123456`
*(You can also use the one-click "Fill Demo Credentials" button on the login screen).*

---

## 10. Running Tests

Both backend and frontend test suites are fully automated and use mocked LLM responses so no API credits are consumed.

### Run Backend Pytest Suite (19 tests)
```bash
cd backend
venv/bin/pytest -v
```
**Test coverage includes:**
- User registration & login verification
- Duplicate email prevention
- Invalid password handling
- Protected route authentication
- Input validation (e.g. question count limits)
- Rubric score sum consistency (rubric points equal max_score)
- Prompt injection protection
- User ownership data isolation (User A cannot access or delete User B's records)
- PDF, CSV, and JSON export validation
- Single question regeneration
- Interview set duplication and deletion

### Run Frontend Vitest Suite (8 tests)
```bash
cd frontend
npm test
```
**Test coverage includes:**
- Form validation
- Login and quick-fill interactions
- Question card rendering and badge validation
- Show/hide model answer toggle
- Evaluation rubric criteria display

---

## 11. API Documentation

When the backend is running, interactive API documentation is available at:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## 12. Troubleshooting & FAQ

#### 1. "LLM API Key Not Configured" Warning
- **Cause**: The `LLM_API_KEY` variable in `backend/.env` is empty.
- **Solution**: Paste your Gemini or OpenAI API key into `backend/.env` and restart the backend, or check the "Demo / Simulation Mode" checkbox in the Generator form to test locally without an API key.

#### 2. CORS Error in Browser Console
- Ensure the frontend URL (`http://localhost:5173`) is listed in `CORS_ORIGINS` in `backend/.env`.

#### 3. SQLite Database Locked
- SQLite handles concurrent reads and serial writes cleanly. For high-volume production deployments with multiple backend replicas, change `DATABASE_URL` to PostgreSQL (e.g. `postgresql://user:pass@host:5432/interviewiq`).

---

## 13. Deployment Readiness & Security

- **Security Headers**: Includes `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and `X-XSS-Protection`.
- **Password Security**: Passwords hashed with Bcrypt using individual salts.
- **Ephemeral Storage Warning**: On serverless platforms (e.g. Heroku, Render free tier), the SQLite database file is ephemeral. Use a persistent disk mount or managed PostgreSQL database for production deployments.
- **Production Build Command**:
  ```bash
  # Frontend production build
  cd frontend && npm run build
  
  # Backend production start
  cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
  ```

---

## License

MIT License. Engineered for fair, structured, and consistent candidate evaluation.
