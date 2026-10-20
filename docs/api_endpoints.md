# API Endpoints Documentation

Base URL: `http://localhost:8000/api`

## Authentication Endpoints

### 1. Login

**Endpoint:** `POST /auth/login`

**Description:** Authenticate HR user and receive JWT token

**Request Body:**
```json
{
  "email": "hr@company.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "userId": "hr_cts_001",
    "companyId": "CTS",
    "companyName": "Cognizant Technology Solutions",
    "hrName": "John Smith",
    "email": "hr@company.com"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials

---

### 2. Register

**Endpoint:** `POST /auth/register`

**Description:** Register new company and HR user

**Request Body:**
```json
{
  "companyId": "CTS",
  "companyName": "Cognizant Technology Solutions",
  "hrName": "John Smith",
  "email": "hr@company.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response (200 OK):**
```json
{
  "message": "Registration successful",
  "userId": "hr_cts_001"
}
```

**Error Responses:**
- `400 Bad Request` - Passwords don't match or email exists
- `500 Internal Server Error` - Failed to create company

---

### 3. Verify Token

**Endpoint:** `GET /auth/verify`

**Description:** Verify JWT token validity

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "valid": true,
  "user": {
    "user_id": "hr_cts_001",
    "company_id": "CTS",
    "email": "hr@company.com"
  }
}
```

---

## Resume Evaluation Endpoints

### 4. Evaluate Resume

**Endpoint:** `POST /resume/evaluate`

**Description:** Upload and evaluate resume against job description using AI

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
- `resume` (file): PDF or DOCX file
- `candidateName` (string): Candidate's name
- `jobDescription` (string): Job description text

**Response (200 OK):**
```json
{
  "candidateId": "CAND_CTS_001",
  "candidateName": "Alice Johnson",
  "resumeFileName": "alice_resume.pdf",
  "scores": {
    "skillMatch": 85.5,
    "experience": 70.0,
    "tools": 90.0,
    "education": 80.0,
    "finalScore": 82.1
  },
  "decision": "Shortlist",
  "missingSkills": ["Docker", "Kubernetes"]
}
```

**Error Responses:**
- `400 Bad Request` - Invalid file type or extraction failed
- `500 Internal Server Error` - Processing error

---

## Candidate Management Endpoints

### 5. Get All Candidates

**Endpoint:** `GET /candidates/`

**Description:** Retrieve all candidates for the logged-in company

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "candidateId": "CAND_CTS_001",
    "candidateName": "Alice Johnson",
    "resumeFileName": "alice_resume.pdf",
    "scores": {
      "skillMatch": 85.5,
      "experience": 70.0,
      "tools": 90.0,
      "education": 80.0,
      "finalScore": 82.1
    },
    "decision": "Shortlist",
    "missingSkills": ["Docker", "Kubernetes"],
    "hrDecision": "Pending",
    "evaluatedAt": "2024-01-15T10:30:00"
  }
]
```

---

### 6. Get Candidate by ID

**Endpoint:** `GET /candidates/{candidate_id}`

**Description:** Retrieve specific candidate details

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "candidateId": "CAND_CTS_001",
  "candidateName": "Alice Johnson",
  "resumeFileName": "alice_resume.pdf",
  "scores": {
    "skillMatch": 85.5,
    "experience": 70.0,
    "tools": 90.0,
    "education": 80.0,
    "finalScore": 82.1
  },
  "decision": "Shortlist",
  "missingSkills": ["Docker", "Kubernetes"],
  "hrDecision": "Pending",
  "evaluatedAt": "2024-01-15T10:30:00"
}
```

**Error Responses:**
- `404 Not Found` - Candidate not found

---

### 7. Update HR Decision

**Endpoint:** `POST /candidates/{candidate_id}/decision`

**Description:** Update HR decision for a candidate

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "hrDecision": "Approved"
}
```

**Valid values:** `Approved`, `Rejected`, `Pending`

**Response (200 OK):**
```json
{
  "message": "HR decision updated successfully",
  "candidateId": "CAND_CTS_001"
}
```

**Error Responses:**
- `404 Not Found` - Candidate not found or update failed

---

### 8. Get Candidate Statistics

**Endpoint:** `GET /candidates/stats/summary`

**Description:** Get statistics for the company

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "totalJobs": 5,
  "totalCandidates": 25,
  "shortlistedCandidates": 8,
  "totalReports": 3
}
```

---

## Report Endpoints

### 9. Get All Reports

**Endpoint:** `GET /reports/`

**Description:** Retrieve all reports for the logged-in company

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "reportId": "RPT_CTS_001",
    "reportType": "full_evaluation",
    "totalCandidates": 25,
    "shortlistedCount": 8,
    "generatedAt": "2024-01-15T14:30:00"
  }
]
```

---

### 10. Generate Report

**Endpoint:** `POST /reports/generate`

**Description:** Generate a new evaluation report

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Report generated successfully",
  "reportId": "RPT_CTS_002"
}
```

**Error Responses:**
- `404 Not Found` - No candidates found to generate report

---

### 11. Export Candidates to CSV

**Endpoint:** `GET /reports/export/csv`

**Description:** Export all candidates to CSV file

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
- Content-Type: `text/csv`
- File download with candidate data

**CSV Format:**
```
Candidate ID,Name,Resume File,Skill Match (%),Experience (%),Tools (%),Education (%),Final Score (%),AI Decision,HR Decision,Evaluated At
CAND_CTS_001,Alice Johnson,alice_resume.pdf,85.5,70.0,90.0,80.0,82.1,Shortlist,Pending,2024-01-15 10:30:00
```

---

## Error Response Format

All error responses follow this format:

```json
{
  "detail": "Error message description"
}
```

## Authentication

All endpoints except `/auth/login` and `/auth/register` require JWT authentication.

**Header Format:**
```
Authorization: Bearer <your_jwt_token>
```

## Rate Limiting

Currently no rate limiting implemented. Consider adding in production.

## CORS

CORS is enabled for `http://localhost:3000` (React dev server).

Update in production to match your frontend domain.

## Testing with cURL

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"hr@company.com","password":"password123"}'
```

**Get Candidates:**
```bash
curl -X GET http://localhost:8000/api/candidates/ \
  -H "Authorization: Bearer <your_token>"
```

**Upload Resume:**
```bash
curl -X POST http://localhost:8000/api/resume/evaluate \
  -H "Authorization: Bearer <your_token>" \
  -F "resume=@resume.pdf" \
  -F "candidateName=John Doe" \
  -F "jobDescription=Looking for Python developer..."
```

## Swagger Documentation

Interactive API documentation available at:
- http://localhost:8000/docs (Swagger UI)
- http://localhost:8000/redoc (ReDoc)
