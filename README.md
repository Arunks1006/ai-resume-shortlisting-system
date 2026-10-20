# 📄 AI Resume Shortlisting System

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.8%2B-blue?style=for-the-badge&logo=python&logoColor=white" alt="Python Version" />
  <img src="https://img.shields.io/badge/FastAPI-0.104.1-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/MongoDB-4.6.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Sentence--BERT-all--MiniLM--L6--v2-orange?style=for-the-badge&logo=huggingface&logoColor=white" alt="Sentence-BERT" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</p>

<p align="center">
  <strong>An enterprise-grade, multi-tenant AI talent screening platform that automates resume evaluation, semantic job-profile matching, skill gap discovery, and candidate pipeline management.</strong>
</p>

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-key-features">Key Features</a> •
  <a href="#-system-architecture">Architecture</a> •
  <a href="#-ai-scoring-engine">AI Scoring Engine</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-project-structure">Project Structure</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-api-endpoints">API Reference</a> •
  <a href="#-environment-variables">Environment Variables</a> •
  <a href="#-production-deployment">Deployment</a>
</p>

---

## 🌟 Overview

The **AI Resume Shortlisting System** addresses high-volume talent acquisition bottlenecks by fusing state-of-the-art Natural Language Processing (**Sentence-BERT** embeddings + cosine similarity) with contextual technical keyword extraction.

Built with a high-performance **FastAPI** asynchronous backend, a reactive **React 18** Material UI frontend, and a scalable **MongoDB** multi-tenant data store, the platform enables recruiting teams and hiring organizations to evaluate hundreds of candidate profiles in seconds with full data isolation, transparency, and actionable skill-gap insights.

---

## ✨ Key Features

- 🏢 **Multi-Tenant Architecture**: Strict organizational data isolation enforced via company tokens (`companyId`), ensuring HR teams never cross boundaries.
- 🧠 **Hybrid AI Evaluation**: Combines deep semantic representation (`all-MiniLM-L6-v2`) with weighted domain keyword matching to eliminate false positives and resume keyword stuffing.
- 📊 **Multifactor Weighted Scoring**:
  - **Skills Match (60%)**: Semantic vector similarity + technology keyword overlap.
  - **Experience (20%)**: Tenure parsing, career velocity indicators, and seniority role detection.
  - **Tools & Frameworks (15%)**: Hard-skill and toolset matching against job requirements.
  - **Education & Credentials (5%)**: Degree hierarchy (PhD/Master/Bachelor), domain alignment, and verified certifications.
- 🔍 **Technical Skill Gap Analysis**: Automatically pinpoints missing mission-critical competencies between the candidate profile and job description.
- 📂 **Multi-Format Ingestion**: High-fidelity text extraction supporting **PDF** (`PyMuPDF`) and **DOCX** (`docx2txt`) documents.
- 🚦 **Intelligent Auto-Decision Engine**:
  - `Shortlist` (Final Score $\ge 40\%$)
  - `Hold` (Final Score $\ge 25\%$)
  - `Reject` (Final Score $< 25\%$)
  - HR manual override workflow (`Approved`, `Rejected`, `Pending`).
- 📈 **Recruiter Analytics & Reporting**: Real-time pipeline dashboards, hiring conversion metrics, and one-click **CSV report exports**.
- 🔐 **Enterprise Security**: Token-based JWT authentication with cryptographically hashed passwords and fine-grained role gating.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND CLIENT (React 18)                      │
│   ┌───────────────┐  ┌───────────────┐  ┌───────────────────────────┐  │
│   │ Auth Context  │  │ Recruiter UI  │  │ Interactive KPI Analytics │  │
│   │ (JWT Storage) │  │  (Upload/Ops) │  │   (MUI Charts & Tables)   │  │
│   └───────┬───────┘  └───────┬───────┘  └─────────────┬─────────────┘  │
└───────────┼──────────────────┼────────────────────────┼────────────────┘
            │                  │                        │
            │  REST Requests + Bearer Token Header      │
            ▼                  ▼                        ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        BACKEND ENGINE (FastAPI)                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                      REST API Routers                          │   │
│   │   • /api/auth   • /api/resume   • /api/candidates   • /api/reports│   │
│   └───────────────────────────────┬────────────────────────────────┘   │
│                                   │                                    │
│   ┌───────────────────────────────┴────────────────────────────────┐   │
│   │                      Core Processing Pipeline                  │   │
│   │   1. Document Parser (PyMuPDF / docx2txt)                      │   │
│   │   2. Text Preprocessing & Token Normalization                  │   │
│   │   3. Sentence-BERT Semantic Encoder (all-MiniLM-L6-v2)         │   │
│   │   4. Technical Skill Gap & Multi-Metric Aggregator             │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
│                                   │                                    │
│   ┌───────────────────────────────┴────────────────────────────────┐   │
│   │                   Multi-Tenant Data Access Layer               │   │
│   │   • Scoped Queries (companyId isolation)                       │   │
│   │   • PyMongo Driver with Automated Connection Pooling          │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
└───────────────────────────────────┼────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                           DATABASE (MongoDB)                           │
│   ┌───────────────┐  ┌───────────────┐  ┌───────────────────────────┐  │
│   │  companies    │  │   hr_users    │  │   candidate_evaluations   │  │
│   └───────────────┘  └───────────────┘  └───────────────────────────┘  │
│   ┌──────────────────────────────────┐  ┌───────────────────────────┐  │
│   │         job_descriptions         │  │    evaluation_reports     │  │
│   └──────────────────────────────────┘  └───────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🧠 AI Scoring Engine

The matching core evaluates resumes across four holistic dimensions, ensuring a fair, comprehensive, and non-biased evaluation:

$$\text{Final Score} = (S_{\text{skill}} \times 0.60) + (S_{\text{exp}} \times 0.20) + (S_{\text{tools}} \times 0.15) + (S_{\text{edu}} \times 0.05)$$

```
┌────────────────────────────────────────────────────────────────────────┐
│                         EVALUATION PIPELINE                            │
│                                                                        │
│   Resume (PDF/DOCX) + Job Description                                 │
│           │                                                            │
│           ├───► SBERT Embeddings ────► Cosine Similarity (60%) ──┐     │
│           │                                                      │     │
│           ├───► Experience Parsing ──► Tenure & Roles (20%) ─────┼─► Σ │
│           │                                                      │   │ │
│           ├───► Toolset Intersection ─► Hard Skills (15%) ───────┤   │ │
│           │                                                      │   ▼ │
│           └───► Education & Certs ───► Credentials (5%) ────────┘ Final│
│                                                                   Score│
│                                                                      │ │
│                                                                      ▼ │
│   [Score >= 40: Shortlist]  │  [25 <= Score < 40: Hold]  │  [Score < 25: Reject]
└────────────────────────────────────────────────────────────────────────┘
```

1. **Semantic Similarity ($S_{\text{skill}}$)**:
   - Uses `sentence-transformers` (`all-MiniLM-L6-v2`) to produce dense 384-dimensional vector embeddings.
   - Calculates cosine similarity against the job description.
   - Blends semantic match with direct keyword density: $\max(0.6 \cdot \text{Semantic} + 0.4 \cdot \text{Keywords}, \text{Keywords})$.
2. **Experience Relevance ($S_{\text{exp}}$)**:
   - Scans explicit tenure patterns (`X years of experience`).
   - Identifies active impact action verbs (`developed`, `managed`, `led`, `architected`).
   - Rewards seniority designations (`senior`, `lead`, `manager`, `architect`).
3. **Tools & Tech Stack ($S_{\text{tools}}$)**:
   - Cross-references 30+ standardized tooling taxonomies (Cloud, DevOps, Databases, Frameworks).
4. **Education & Certifications ($S_{\text{edu}}$)**:
   - Evaluates degree levels (Doctorate, Master's, Bachelor's), STEM field relevance, accredited institutions, and industry certifications (AWS, Azure, GCP, Cisco).

---

## 💻 Tech Stack

### Backend

| Technology                | Version | Purpose                                         |
| :------------------------ | :------ | :---------------------------------------------- |
| **Python**                | 3.8+    | Core server runtime                             |
| **FastAPI**               | 0.104.1 | Asynchronous REST API framework                 |
| **Uvicorn**               | 0.24.0  | High-performance ASGI web server                |
| **Sentence-Transformers** | 2.7.0   | NLP deep learning model (`all-MiniLM-L6-v2`)    |
| **Scikit-Learn**          | 1.3.2   | Cosine similarity & ML processing               |
| **PyMuPDF (fitz)**        | 1.23.8  | High-speed PDF parsing & text extraction        |
| **docx2txt**              | 0.8     | DOCX document extraction                        |
| **PyMongo**               | 4.6.0   | Official MongoDB database driver                |
| **Python-Jose**           | 3.3.0   | Cryptographic JWT token encoding & verification |
| **Passlib (Bcrypt)**      | 1.7.4   | Enterprise password hashing                     |

### Frontend

| Technology            | Version | Purpose                                           |
| :-------------------- | :------ | :------------------------------------------------ |
| **React**             | 18.2.0  | Component-based UI library                        |
| **Material UI (MUI)** | 5.18.0  | Modern design system and accessible UI components |
| **MUI X Charts**      | 6.19.8  | Interactive visualizations & data analytics       |
| **React Router**      | 6.20.0  | Client-side routing and protected routes          |
| **Axios**             | 1.6.2   | Promise-based HTTP client with interceptors       |

---

## 📁 Project Structure

```
AI-Resume-Shortlisting-System/
├── .gitignore                      # Git ignore patterns for Python, Node, & secrets
├── README.md                       # Comprehensive project documentation
├── docs/                           # Extended technical specifications
│   ├── api_endpoints.md            # Detailed API contract documentation
│   ├── architecture.md             # System architecture & scalability guidelines
│   ├── conversion_guide.md         # Architecture migration notes
│   └── database_design.md          # MongoDB schema structures & indices
│
├── backend/                        # FastAPI Backend Application
│   ├── api/                        # Route controllers
│   │   ├── auth_api.py             # Login, company registration, token validation
│   │   ├── candidate_api.py        # Candidate pipeline & status decisions
│   │   ├── job_api.py              # Job profile persistence
│   │   ├── report_api.py           # Analytics summary & CSV export
│   │   └── resume_api.py           # Resume ingestion & AI evaluation
│   ├── core/                       # NLP & Machine Learning Engine
│   │   ├── matcher.py              # Sentence-BERT & hybrid scoring algorithms
│   │   ├── parser.py               # PDF/DOCX file extractors
│   │   └── text_preprocessing.py   # Text normalization & cleaning
│   ├── database/                   # Database access layer
│   │   └── mongodb_manager.py      # Multi-tenant isolated queries & CRUD
│   ├── models/                     # Pydantic data schemas
│   │   ├── auth_models.py          # Auth validation schemas
│   │   ├── candidate_models.py     # Candidate payloads & state models
│   │   └── resume_models.py        # Resume evaluation response models
│   ├── utils/                      # Helper utilities
│   │   └── security.py             # JWT generation, validation & auth guards
│   ├── .env.example                # Backend environment variable template
│   ├── main.py                     # Application entry point & middleware config
│   └── requirements.txt            # Python dependencies
│
└── frontend/                       # React 18 Frontend Application
    ├── public/                     # Static assets & HTML template
    ├── src/                        # React source code
    │   ├── components/             # Reusable UI widgets & Navbar
    │   ├── context/                # Global AuthContext & state providers
    │   ├── pages/                  # Page views (Dashboard, Upload, Candidates, etc.)
    │   ├── services/               # Axios API client integrations
    │   ├── App.js                  # Root application router & route guards
    │   └── index.js                # React DOM render entry point
    ├── .env.example                # Frontend environment variable template
    ├── package.json                # NPM package definitions & scripts
    └── package-lock.json           # Locked dependency tree
```

---

## 🚀 Getting Started

### 📋 Prerequisites

Ensure the following runtimes and databases are installed on your machine:

- **Python**: `v3.8` or newer ([Download Python](https://www.python.org/downloads/))
- **Node.js**: `v16.0` or newer ([Download Node.js](https://nodejs.org/))
- **MongoDB**: Local MongoDB Community instance running on `localhost:27017` or a [MongoDB Atlas](https://www.mongodb.com/atlas) cloud URI.

---

### 1️⃣ Backend Setup

1. **Navigate to the backend directory**:

   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   - **Windows (Command Prompt / PowerShell)**:
     ```powershell
     python -m venv .venv
     .venv\Scripts\activate
     ```
   - **Linux / macOS**:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. **Install dependencies**:

   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   Create a `.env` file in the `backend/` directory (or copy from `.env.example`):

   ```bash
   cp .env.example .env
   ```

   _Verify your `.env` contains_:

   ```env
   MONGODB_URI=mongodb://localhost:27017/
   JWT_SECRET_KEY=your-super-secret-key-change-in-production-min-32-chars
   HOST=0.0.0.0
   PORT=8000
   ```

5. **Start the FastAPI application**:
   ```bash
   python main.py
   ```
   _The backend will boot up at `http://localhost:8000` with hot-reload enabled._

---

### 2️⃣ Frontend Setup

1. **Open a new terminal and navigate to the frontend directory**:

   ```bash
   cd frontend
   ```

2. **Install Node packages**:

   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the `frontend/` directory (or copy from `.env.example`):

   ```bash
   cp .env.example .env
   ```

   _Ensure the API endpoint points to the backend_:

   ```env
   REACT_APP_API_URL=http://localhost:8000/api
   ```

4. **Launch the development server**:
   ```bash
   npm start
   ```
   _The application will automatically launch in your browser at `http://localhost:3000`._

---

## 📡 API Endpoints

Once the backend is running, full interactive API documentation is accessible at:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc UI**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Core Route Summary

| Method | Endpoint                        | Description                                              | Auth Required |
| :----- | :------------------------------ | :------------------------------------------------------- | :-----------: |
| `POST` | `/api/auth/register`            | Register a new company and primary HR account            |     ❌ No     |
| `POST` | `/api/auth/login`               | Authenticate HR user and issue JWT bearer token          |     ❌ No     |
| `GET`  | `/api/auth/verify`              | Validate current user token and return profile           |    ✅ Yes     |
| `POST` | `/api/resume/evaluate`          | Upload resume (PDF/DOCX) & evaluate against JD           |    ✅ Yes     |
| `GET`  | `/api/candidates/`              | List all evaluated candidates for current company        |    ✅ Yes     |
| `GET`  | `/api/candidates/{id}`          | Retrieve comprehensive candidate evaluation card         |    ✅ Yes     |
| `POST` | `/api/candidates/{id}/decision` | Update HR final hiring decision (Approved/Rejected/Hold) |    ✅ Yes     |
| `GET`  | `/api/candidates/stats/summary` | Retrieve aggregated pipeline statistics                  |    ✅ Yes     |
| `GET`  | `/api/reports/`                 | List all historical evaluation reports                   |    ✅ Yes     |
| `POST` | `/api/reports/generate`         | Generate and snapshot a new evaluation summary           |    ✅ Yes     |
| `GET`  | `/api/reports/export/csv`       | Download candidate evaluations as a CSV file             |    ✅ Yes     |
| `GET`  | `/health`                       | Application health and status check                      |     ❌ No     |

---

## ⚙️ Environment Variables

### Backend Configuration (`backend/.env`)

| Variable         | Default Value                 | Description                                   |
| :--------------- | :---------------------------- | :-------------------------------------------- |
| `MONGODB_URI`    | `mongodb://localhost:27017/`  | Connection URI for MongoDB database           |
| `JWT_SECRET_KEY` | _(Set a secure 32+ char key)_ | Secret key used to sign and verify JWT tokens |
| `HOST`           | `0.0.0.0`                     | Network binding interface for ASGI server     |
| `PORT`           | `8000`                        | Port on which the FastAPI server listens      |

### Frontend Configuration (`frontend/.env`)

| Variable            | Default Value               | Description                                               |
| :------------------ | :-------------------------- | :-------------------------------------------------------- |
| `REACT_APP_API_URL` | `http://localhost:8000/api` | Base URL used by Axios client to communicate with FastAPI |

---

## 🔒 Security & Data Isolation

1. **Stateless JWT Authorization**: User credentials never persist across stateless requests. Each token contains the authenticated user's `userId` and `companyId`.
2. **Strict Multi-Tenancy**: Every database transaction is scoped at the database query level with `{"companyId": current_user["companyId"]}` to prevent unauthorized cross-tenant data leaks.
3. **Password Security**: Passwords are protected using standard Bcrypt / SHA-256 password hashing.
4. **CORS Security**: Configured to restrict origin requests according to deployment specifications.

---

## 🚀 Production Deployment

### Production ASGI Backend (Gunicorn + Uvicorn)

```bash
cd backend
pip install gunicorn
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Production Frontend Build

```bash
cd frontend
npm run build
# Serve the resulting 'build/' folder with Nginx, Caddy, or an AWS S3/CloudFront distribution
```

---
