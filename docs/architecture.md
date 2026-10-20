# System Architecture

## Overview

The AI Resume Shortlisting System follows a modern three-tier architecture with complete separation of concerns.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React JS)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Login   │  │Dashboard │  │  Upload  │  │Candidates│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         API Services (Axios)                       │    │
│  │  - authService  - resumeService  - reportService   │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API (JSON)
                       │ JWT Authentication
┌──────────────────────▼──────────────────────────────────────┐
│                   BACKEND (FastAPI)                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │              API Routes                             │    │
│  │  /auth  /resume  /candidates  /reports             │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Core AI Logic (UNCHANGED)                   │    │
│  │  - parser.py (Resume extraction)                    │    │
│  │  - matcher.py (Sentence-BERT scoring)              │    │
│  │  - text_preprocessing.py (Text cleaning)           │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Database Layer                              │    │
│  │  - mongodb_manager.py (CRUD operations)            │    │
│  │  - Multi-tenant isolation (companyId)              │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────────────┘
                       │ MongoDB Driver
┌──────────────────────▼──────────────────────────────────────┐
│                   DATABASE (MongoDB)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  companies   │  │  hr_users    │  │job_descriptions│    │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ candidates   │  │   reports    │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend Layer (React)

**Technology Stack:**
- React 18.2
- React Router v6 (routing)
- Axios (HTTP client)
- Context API (state management)

**Key Components:**
- `AuthContext` - Global authentication state
- `ProtectedRoute` - Route guards
- `Navbar` - Top navigation
- `CandidateCard` - Candidate display

**Pages:**
- Login/Register - Authentication
- Dashboard - Statistics overview
- UploadResume - Resume evaluation
- CandidateList - Candidate management
- Reports - Report generation

### Backend Layer (FastAPI)

**Technology Stack:**
- FastAPI 0.104
- Uvicorn (ASGI server)
- Pydantic (validation)
- Python-Jose (JWT)

**API Structure:**
```
/api
├── /auth
│   ├── POST /login
│   ├── POST /register
│   └── GET /verify
├── /resume
│   └── POST /evaluate
├── /candidates
│   ├── GET /
│   ├── GET /{id}
│   ├── POST /{id}/decision
│   └── GET /stats/summary
└── /reports
    ├── GET /
    ├── POST /generate
    └── GET /export/csv
```

**Core AI Logic (Reused):**
- `parser.py` - PDF/DOCX text extraction
- `matcher.py` - Sentence-BERT semantic matching
- `text_preprocessing.py` - Text cleaning

### Database Layer (MongoDB)

**Collections:**

1. **companies**
   - companyId (unique)
   - companyName
   - createdAt

2. **hr_users**
   - userId (unique)
   - companyId (isolation)
   - email, password (hashed)
   - hrName

3. **candidate_evaluations**
   - candidateId (unique)
   - companyId (isolation)
   - scores (skill, experience, tools, education)
   - decision (Shortlist/Hold/Reject)
   - hrDecision (Approved/Rejected/Pending)

4. **evaluation_reports**
   - reportId (unique)
   - companyId (isolation)
   - totalCandidates, shortlistedCount

## Data Flow

### Resume Evaluation Flow

```
1. User uploads resume (Frontend)
   ↓
2. FormData sent to /api/resume/evaluate (REST API)
   ↓
3. Backend extracts text (parser.py)
   ↓
4. Text cleaned (text_preprocessing.py)
   ↓
5. AI scoring (matcher.py - Sentence-BERT)
   ↓
6. Save to MongoDB (mongodb_manager.py)
   ↓
7. Return JSON response
   ↓
8. Display results (Frontend)
```

### Authentication Flow

```
1. User enters credentials (Frontend)
   ↓
2. POST /api/auth/login (REST API)
   ↓
3. Validate credentials (MongoDB)
   ↓
4. Generate JWT token (python-jose)
   ↓
5. Return token + user info
   ↓
6. Store in localStorage (Frontend)
   ↓
7. Include in Authorization header for all requests
```

## Multi-Tenant Architecture

**Data Isolation Strategy:**
- Every MongoDB query includes `companyId` filter
- JWT token contains `company_id` claim
- Backend validates company ownership on every request
- No cross-company data access possible

**Example:**
```python
# All queries filtered by company
candidates = db.get_company_candidates(current_user["company_id"])
```

## Security Measures

1. **Authentication**
   - JWT tokens with expiration
   - Password hashing (SHA-256)
   - Secure token storage

2. **Authorization**
   - Protected routes (frontend)
   - Token verification (backend)
   - Company-based access control

3. **Data Protection**
   - CORS configuration
   - Input validation (Pydantic)
   - SQL injection prevention (MongoDB)

## Scalability Considerations

1. **Horizontal Scaling**
   - Stateless backend (JWT)
   - MongoDB sharding support
   - Load balancer ready

2. **Performance**
   - Database indexing
   - Async operations (FastAPI)
   - Caching opportunities

3. **Deployment**
   - Docker containerization ready
   - Environment-based configuration
   - Production server (Gunicorn)

## Technology Choices

**Why FastAPI?**
- High performance (async)
- Automatic API documentation
- Type validation
- Easy integration with existing Python code

**Why React?**
- Component reusability
- Virtual DOM performance
- Large ecosystem
- Modern development experience

**Why MongoDB?**
- Flexible schema
- Easy multi-tenant implementation
- Good Python support
- Scalable

**Why Sentence-BERT?**
- Better semantic understanding than TF-IDF
- Pre-trained models available
- Efficient inference
- Production-ready
