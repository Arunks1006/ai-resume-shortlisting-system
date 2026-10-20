# Step-by-Step Conversion Guide

## From Streamlit to React + FastAPI

This document explains how the Streamlit application was converted to a full-stack architecture.

---

## Phase 1: Backend API Creation (FastAPI)

### Step 1: Project Structure Setup

Created organized backend structure:
```
backend/
├── api/              # API routes (NEW)
├── core/             # AI logic (COPIED AS-IS)
├── database/         # MongoDB (COPIED AS-IS)
├── models/           # Pydantic schemas (NEW)
├── utils/            # Security helpers (NEW)
└── main.py          # FastAPI app (NEW)
```

### Step 2: Copy Existing Logic

**NO CHANGES to core AI logic:**
```bash
# Copied files without modification:
- utils/parser.py → backend/core/parser.py
- utils/matcher.py → backend/core/matcher.py
- utils/text_preprocessing.py → backend/core/text_preprocessing.py
- database/mongodb_manager.py → backend/database/mongodb_manager.py
```

### Step 3: Create API Routes

**Converted Streamlit UI logic to REST APIs:**

**Before (Streamlit):**
```python
# app.py
uploaded_file = st.file_uploader("Upload Resume")
if uploaded_file:
    text = extract_text(uploaded_file)
    score = calculate_skill_match(text, jd)
    st.write(f"Score: {score}")
```

**After (FastAPI):**
```python
# api/resume_api.py
@router.post("/evaluate")
async def evaluate_resume(resume: UploadFile, ...):
    text = extract_text(resume)
    score = calculate_skill_match(text, jd)
    return {"score": score}
```

### Step 4: Add Authentication

**Created JWT-based authentication:**
```python
# utils/security.py
def create_access_token(data: Dict) -> str:
    # Generate JWT token
    
def verify_token(credentials) -> Dict:
    # Verify and decode token
```

### Step 5: Define Pydantic Models

**Created request/response schemas:**
```python
# models/auth_models.py
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    user: UserResponse
```

---

## Phase 2: Frontend Creation (React)

### Step 6: React App Setup

```bash
# Created React app structure:
frontend/
├── src/
│   ├── components/    # Reusable UI
│   ├── pages/         # Main screens
│   ├── services/      # API calls
│   ├── context/       # State management
│   └── App.js
```

### Step 7: Create API Service Layer

**Abstracted all API calls:**
```javascript
// services/resumeService.js
export const resumeService = {
  evaluateResume: async (formData) => {
    const response = await api.post('/resume/evaluate', formData);
    return response.data;
  }
};
```

### Step 8: Build React Components

**Converted Streamlit widgets to React components:**

**Before (Streamlit):**
```python
st.text_input("Candidate Name")
st.file_uploader("Resume")
st.text_area("Job Description")
if st.button("Evaluate"):
    # Process
```

**After (React):**
```jsx
<input value={name} onChange={e => setName(e.target.value)} />
<input type="file" onChange={handleFileChange} />
<textarea value={jd} onChange={e => setJd(e.target.value)} />
<button onClick={handleSubmit}>Evaluate</button>
```

### Step 9: Implement Authentication Context

**Global auth state management:**
```javascript
// context/AuthContext.js
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // Login, logout, state management
};
```

### Step 10: Create Protected Routes

**Route guards for authentication:**
```javascript
// components/ProtectedRoute.jsx
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return children;
};
```

---

## Phase 3: Integration

### Step 11: Connect Frontend to Backend

**Configure API base URL:**
```javascript
// services/api.js
const API_BASE_URL = 'http://localhost:8000/api';

// Add auth token to all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Step 12: Handle File Uploads

**Convert file handling from Streamlit to FormData:**

**Before (Streamlit):**
```python
uploaded_file = st.file_uploader("Resume")
text = extract_text(uploaded_file)
```

**After (React + FastAPI):**
```javascript
// Frontend
const formData = new FormData();
formData.append('resume', file);
await api.post('/resume/evaluate', formData);

// Backend
@router.post("/evaluate")
async def evaluate_resume(resume: UploadFile):
    text = extract_text(resume)
```

### Step 13: Maintain Multi-Tenant Architecture

**Ensured company isolation:**
```python
# Backend - All queries filtered by company
@router.get("/candidates/")
def get_candidates(current_user: Dict = Depends(verify_token)):
    # JWT contains company_id
    candidates = db.get_company_candidates(current_user["company_id"])
    return candidates
```

---

## Key Conversion Patterns

### Pattern 1: Session State → JWT + LocalStorage

**Before:**
```python
st.session_state.user_id = user_id
st.session_state.company_id = company_id
```

**After:**
```javascript
// Store in JWT token (backend)
token_data = {"user_id": user_id, "company_id": company_id}
token = create_access_token(token_data)

// Store in localStorage (frontend)
localStorage.setItem('access_token', token);
```

### Pattern 2: Streamlit Forms → React Forms + API

**Before:**
```python
with st.form("login"):
    email = st.text_input("Email")
    password = st.text_input("Password", type="password")
    if st.form_submit_button("Login"):
        user = authenticate(email, password)
```

**After:**
```javascript
// React
const handleSubmit = async (e) => {
  e.preventDefault();
  await authService.login(email, password);
};

// FastAPI
@router.post("/login")
def login(request: LoginRequest):
    user = authenticate(request.email, request.password)
    return {"token": create_token(user)}
```

### Pattern 3: Streamlit Tabs → React Router

**Before:**
```python
tab1, tab2 = st.tabs(["Upload", "Candidates"])
with tab1:
    # Upload UI
with tab2:
    # Candidates UI
```

**After:**
```javascript
<Routes>
  <Route path="/upload" element={<UploadResume />} />
  <Route path="/candidates" element={<CandidateList />} />
</Routes>
```

### Pattern 4: Direct Function Calls → REST API

**Before:**
```python
# Direct function call
score = calculate_skill_match(resume_text, jd_text)
```

**After:**
```javascript
// Frontend: API call
const result = await resumeService.evaluateResume(formData);

// Backend: Wraps function in API endpoint
@router.post("/evaluate")
def evaluate(resume: UploadFile):
    text = extract_text(resume)
    score = calculate_skill_match(text, jd)  # Same function!
    return {"score": score}
```

---

## What Changed vs What Stayed

### ✅ UNCHANGED (Core Logic)

1. **AI Matching Algorithm** (`matcher.py`)
   - Sentence-BERT model
   - Scoring calculations
   - Skills gap analysis

2. **Resume Parsing** (`parser.py`)
   - PDF/DOCX extraction
   - Text processing

3. **Text Preprocessing** (`text_preprocessing.py`)
   - Cleaning functions
   - Keyword extraction

4. **Database Operations** (`mongodb_manager.py`)
   - CRUD operations
   - Multi-tenant queries

### 🔄 CHANGED (Architecture)

1. **UI Layer**
   - Streamlit → React components
   - Server-side rendering → Client-side rendering

2. **Communication**
   - Direct function calls → REST API
   - Session state → JWT tokens

3. **Deployment**
   - Single app → Separate frontend/backend
   - Streamlit server → FastAPI + React dev server

4. **Authentication**
   - Streamlit session → JWT authentication
   - Form-based → Token-based

---

## Benefits of Conversion

### 1. Separation of Concerns
- Frontend and backend can be developed independently
- Different teams can work on each layer

### 2. Scalability
- Frontend and backend can scale independently
- Can deploy multiple backend instances

### 3. Flexibility
- Can create mobile app using same API
- Can integrate with other systems

### 4. Modern Architecture
- Industry-standard REST API
- JWT authentication
- Microservices-ready

### 5. Better Performance
- React's virtual DOM
- FastAPI's async capabilities
- Client-side caching

---

## Testing the Conversion

### 1. Test Backend Independently
```bash
# Start backend
cd backend
python main.py

# Test API
curl http://localhost:8000/health
```

### 2. Test Frontend Independently
```bash
# Start frontend
cd frontend
npm start

# Opens http://localhost:3000
```

### 3. Test Integration
1. Register new company
2. Login with credentials
3. Upload resume
4. View candidates
5. Generate report

---

## Deployment Checklist

### Backend
- [ ] Update CORS origins for production
- [ ] Change JWT secret key
- [ ] Configure production MongoDB
- [ ] Set up environment variables
- [ ] Use production ASGI server (Gunicorn)

### Frontend
- [ ] Update API base URL
- [ ] Build production bundle (`npm run build`)
- [ ] Configure web server (Nginx)
- [ ] Set up SSL certificate
- [ ] Enable caching

### Database
- [ ] Create production database
- [ ] Set up backups
- [ ] Configure indexes
- [ ] Enable authentication
- [ ] Set up monitoring

---

## Troubleshooting

### CORS Errors
```python
# backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update for production
)
```

### Authentication Errors
```javascript
// Check token in localStorage
console.log(localStorage.getItem('access_token'));

// Check token expiration
// Tokens expire after 24 hours by default
```

### File Upload Errors
```python
# Ensure Content-Type is multipart/form-data
# Check file size limits
# Verify file extensions (.pdf, .docx)
```

---

## Conclusion

The conversion maintains all original AI logic while providing a modern, scalable architecture suitable for production deployment and future enhancements.
