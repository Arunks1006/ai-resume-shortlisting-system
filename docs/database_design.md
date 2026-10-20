# Database Design

## Database: MongoDB

Database Name: `resume_shortlisting_db`

## Collections

### 1. companies

**Purpose:** Store company information

**Schema:**
```javascript
{
  _id: ObjectId,
  companyId: String,        // Unique identifier (e.g., "CTS", "TCS")
  companyName: String,      // Full company name
  createdAt: DateTime,
  isActive: Boolean
}
```

**Indexes:**
- `companyId` (unique)

**Sample Document:**
```json
{
  "_id": ObjectId("..."),
  "companyId": "CTS",
  "companyName": "Cognizant Technology Solutions",
  "createdAt": ISODate("2024-01-15T10:00:00Z"),
  "isActive": true
}
```

---

### 2. hr_users

**Purpose:** Store HR user credentials and information

**Schema:**
```javascript
{
  _id: ObjectId,
  userId: String,           // Unique user ID (e.g., "hr_cts_001")
  companyId: String,        // Reference to company (ISOLATION KEY)
  hrName: String,
  email: String,
  password: String,         // SHA-256 hashed
  createdAt: DateTime,
  lastLogin: DateTime,
  isActive: Boolean
}
```

**Indexes:**
- `userId` (unique)
- `(companyId, email)` (compound unique)

**Sample Document:**
```json
{
  "_id": ObjectId("..."),
  "userId": "hr_cts_001",
  "companyId": "CTS",
  "hrName": "John Smith",
  "email": "john@cts.com",
  "password": "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
  "createdAt": ISODate("2024-01-15T10:00:00Z"),
  "lastLogin": ISODate("2024-01-15T14:30:00Z"),
  "isActive": true
}
```

---

### 3. job_descriptions

**Purpose:** Store job postings and requirements

**Schema:**
```javascript
{
  _id: ObjectId,
  jobId: String,            // Unique job ID (e.g., "JOB_CTS_001")
  companyId: String,        // ISOLATION KEY
  jobTitle: String,
  jobDescription: String,   // Full JD text
  requiredSkills: Array,    // List of required skills
  createdBy: String,        // HR user ID
  createdAt: DateTime,
  isActive: Boolean
}
```

**Indexes:**
- `(companyId, jobId)` (compound)

**Sample Document:**
```json
{
  "_id": ObjectId("..."),
  "jobId": "JOB_CTS_001",
  "companyId": "CTS",
  "jobTitle": "Senior Python Developer",
  "jobDescription": "Looking for experienced Python developer with Django...",
  "requiredSkills": ["Python", "Django", "REST API", "PostgreSQL"],
  "createdBy": "hr_cts_001",
  "createdAt": ISODate("2024-01-15T10:00:00Z"),
  "isActive": true
}
```

---

### 4. candidate_evaluations

**Purpose:** Store candidate resume evaluations and AI scores

**Schema:**
```javascript
{
  _id: ObjectId,
  candidateId: String,      // Unique candidate ID (e.g., "CAND_CTS_001")
  companyId: String,        // ISOLATION KEY
  jobId: String,            // Reference to job
  candidateName: String,
  resumeFileName: String,
  scores: {
    skillMatch: Float,      // 0-100
    experience: Float,      // 0-100
    tools: Float,           // 0-100
    education: Float,       // 0-100
    finalScore: Float       // Weighted average
  },
  decision: String,         // "Shortlist", "Hold", "Reject"
  matchedSkills: Array,
  missingSkills: Array,
  evaluatedBy: String,      // HR user ID
  evaluatedAt: DateTime,
  hrDecision: String,       // "Approved", "Rejected", "Pending"
  hrDecisionAt: DateTime
}
```

**Indexes:**
- `(companyId, candidateId)` (compound)
- `(companyId, jobId)` (compound)

**Sample Document:**
```json
{
  "_id": ObjectId("..."),
  "candidateId": "CAND_CTS_001",
  "companyId": "CTS",
  "jobId": "JOB_CTS_001",
  "candidateName": "Alice Johnson",
  "resumeFileName": "alice_johnson_resume.pdf",
  "scores": {
    "skillMatch": 85.5,
    "experience": 70.0,
    "tools": 90.0,
    "education": 80.0,
    "finalScore": 82.1
  },
  "decision": "Shortlist",
  "matchedSkills": ["Python", "Django", "REST API"],
  "missingSkills": ["PostgreSQL", "Docker"],
  "evaluatedBy": "hr_cts_001",
  "evaluatedAt": ISODate("2024-01-15T11:30:00Z"),
  "hrDecision": "Pending",
  "hrDecisionAt": null
}
```

---

### 5. evaluation_reports

**Purpose:** Store generated evaluation reports

**Schema:**
```javascript
{
  _id: ObjectId,
  reportId: String,         // Unique report ID (e.g., "RPT_CTS_001")
  companyId: String,        // ISOLATION KEY
  jobId: String,
  reportType: String,       // "full_evaluation", "shortlisted_only"
  totalCandidates: Integer,
  shortlistedCount: Integer,
  generatedBy: String,      // HR user ID
  generatedAt: DateTime,
  candidateIds: Array       // List of candidate IDs in report
}
```

**Indexes:**
- `(companyId, reportId)` (compound)

**Sample Document:**
```json
{
  "_id": ObjectId("..."),
  "reportId": "RPT_CTS_001",
  "companyId": "CTS",
  "jobId": "JOB_CTS_001",
  "reportType": "full_evaluation",
  "totalCandidates": 25,
  "shortlistedCount": 8,
  "generatedBy": "hr_cts_001",
  "generatedAt": ISODate("2024-01-15T14:30:00Z"),
  "candidateIds": ["CAND_CTS_001", "CAND_CTS_002", "..."]
}
```

---

## Multi-Tenant Data Isolation

**Strategy:** Company-based isolation using `companyId` field

**Implementation:**
- Every collection (except `companies`) has `companyId` field
- All queries MUST include `companyId` filter
- Backend validates company ownership via JWT token
- No cross-company data access possible

**Example Query:**
```python
# Always filter by companyId
candidates = db.candidate_evaluations.find({
    "companyId": current_user["company_id"]
})
```

## Relationships

```
companies (1) ──── (N) hr_users
    │
    │
    ├──── (N) job_descriptions
    │
    └──── (N) candidate_evaluations
              │
              └──── (N) evaluation_reports
```

## Data Flow

1. **Company Registration:**
   - Create document in `companies`
   - Create first HR user in `hr_users`

2. **Resume Evaluation:**
   - HR uploads resume
   - AI processes and scores
   - Create document in `candidate_evaluations`

3. **Report Generation:**
   - Aggregate candidates by company
   - Create document in `evaluation_reports`

## Indexes for Performance

**Critical Indexes:**
```javascript
// companies
db.companies.createIndex({ "companyId": 1 }, { unique: true })

// hr_users
db.hr_users.createIndex({ "userId": 1 }, { unique: true })
db.hr_users.createIndex({ "companyId": 1, "email": 1 }, { unique: true })

// candidate_evaluations
db.candidate_evaluations.createIndex({ "companyId": 1, "candidateId": 1 })
db.candidate_evaluations.createIndex({ "companyId": 1, "jobId": 1 })

// evaluation_reports
db.evaluation_reports.createIndex({ "companyId": 1, "reportId": 1 })
```

## Data Validation

**MongoDB Schema Validation (Optional):**
```javascript
db.createCollection("candidate_evaluations", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["candidateId", "companyId", "candidateName", "scores"],
      properties: {
        candidateId: { bsonType: "string" },
        companyId: { bsonType: "string" },
        scores: {
          bsonType: "object",
          required: ["finalScore"],
          properties: {
            finalScore: { bsonType: "double", minimum: 0, maximum: 100 }
          }
        }
      }
    }
  }
})
```

## Backup Strategy

**Recommended:**
- Daily automated backups
- Point-in-time recovery enabled
- Backup retention: 30 days
- Test restore procedures monthly

## Scaling Considerations

1. **Sharding:**
   - Shard key: `companyId`
   - Ensures company data stays together
   - Easy horizontal scaling

2. **Read Replicas:**
   - Use for reporting queries
   - Reduce load on primary

3. **Archival:**
   - Move old evaluations to archive collection
   - Keep active data lean

## Security

1. **Authentication:**
   - MongoDB authentication enabled
   - Strong passwords
   - Limited user permissions

2. **Encryption:**
   - Encryption at rest
   - TLS for connections

3. **Access Control:**
   - Role-based access
   - Principle of least privilege

## Connection String

**Local Development:**
```
mongodb://localhost:27017/
```

**MongoDB Atlas (Production):**
```
mongodb+srv://<username>:<password>@cluster.mongodb.net/resume_shortlisting_db
```

## Sample Data Setup

Run `setup_database.py` to create sample companies and users:

```python
# Creates:
# - 3 companies (CTS, TCS, INFOSYS)
# - 1 HR user per company
# - Sample credentials for testing
```
