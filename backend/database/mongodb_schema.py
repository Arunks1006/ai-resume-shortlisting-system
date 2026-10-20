# MongoDB Collection Schema Design
from datetime import datetime
from typing import Dict, List, Optional

# Collection: companies
COMPANY_SCHEMA = {
    "_id": "ObjectId",
    "companyId": "string",  # Unique identifier (e.g., "CTS", "TCS", "INFOSYS")
    "companyName": "string",  # Full company name
    "createdAt": "datetime",
    "isActive": "boolean"
}

# Sample Company Document
SAMPLE_COMPANY = {
    "_id": "ObjectId('...')",
    "companyId": "CTS",
    "companyName": "Cognizant Technology Solutions",
    "createdAt": datetime.now(),
    "isActive": True
}

# Collection: hr_users
HR_USER_SCHEMA = {
    "_id": "ObjectId",
    "userId": "string",  # Unique user ID
    "companyId": "string",  # Reference to company
    "hrName": "string",
    "email": "string",
    "password": "string",  # Hashed password
    "createdAt": "datetime",
    "lastLogin": "datetime",
    "isActive": "boolean"
}

# Sample HR User Document
SAMPLE_HR_USER = {
    "_id": "ObjectId('...')",
    "userId": "hr_cts_001",
    "companyId": "CTS",
    "hrName": "John Smith",
    "email": "john.smith@cts.com",
    "password": "hashed_password_here",
    "createdAt": datetime.now(),
    "lastLogin": datetime.now(),
    "isActive": True
}

# Collection: job_descriptions
JOB_DESCRIPTION_SCHEMA = {
    "_id": "ObjectId",
    "jobId": "string",  # Unique job ID
    "companyId": "string",  # Company isolation
    "jobTitle": "string",
    "jobDescription": "string",
    "requiredSkills": "array",
    "createdBy": "string",  # HR user ID
    "createdAt": "datetime",
    "isActive": "boolean"
}

# Sample Job Description Document
SAMPLE_JOB_DESCRIPTION = {
    "_id": "ObjectId('...')",
    "jobId": "JOB_CTS_001",
    "companyId": "CTS",
    "jobTitle": "Senior Python Developer",
    "jobDescription": "Looking for experienced Python developer with Django, REST APIs...",
    "requiredSkills": ["Python", "Django", "REST API", "PostgreSQL"],
    "createdBy": "hr_cts_001",
    "createdAt": datetime.now(),
    "isActive": True
}

# Collection: candidate_evaluations
CANDIDATE_EVALUATION_SCHEMA = {
    "_id": "ObjectId",
    "candidateId": "string",  # Unique candidate ID
    "companyId": "string",  # Company isolation
    "jobId": "string",  # Reference to job
    "candidateName": "string",
    "resumeFileName": "string",
    "scores": {
        "skillMatch": "float",
        "experience": "float", 
        "tools": "float",
        "education": "float",
        "finalScore": "float"
    },
    "decision": "string",  # Shortlist, Hold, Reject
    "matchedSkills": "array",
    "missingSkills": "array",
    "evaluatedBy": "string",  # HR user ID
    "evaluatedAt": "datetime",
    "hrDecision": "string",  # Approved, Rejected, Pending
    "hrDecisionAt": "datetime"
}

# Sample Candidate Evaluation Document
SAMPLE_CANDIDATE_EVALUATION = {
    "_id": "ObjectId('...')",
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
    "evaluatedAt": datetime.now(),
    "hrDecision": "Pending",
    "hrDecisionAt": None
}

# Collection: evaluation_reports
EVALUATION_REPORT_SCHEMA = {
    "_id": "ObjectId",
    "reportId": "string",
    "companyId": "string",  # Company isolation
    "jobId": "string",
    "reportType": "string",  # "full_evaluation", "shortlisted_only"
    "totalCandidates": "int",
    "shortlistedCount": "int",
    "generatedBy": "string",  # HR user ID
    "generatedAt": "datetime",
    "candidateIds": "array"  # List of candidate IDs in this report
}

# Sample Evaluation Report Document
SAMPLE_EVALUATION_REPORT = {
    "_id": "ObjectId('...')",
    "reportId": "RPT_CTS_001",
    "companyId": "CTS",
    "jobId": "JOB_CTS_001",
    "reportType": "full_evaluation",
    "totalCandidates": 25,
    "shortlistedCount": 8,
    "generatedBy": "hr_cts_001",
    "generatedAt": datetime.now(),
    "candidateIds": ["CAND_CTS_001", "CAND_CTS_002", "..."]
}