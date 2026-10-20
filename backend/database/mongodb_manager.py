import pymongo
from pymongo import MongoClient
from datetime import datetime
import bcrypt
import os
from typing import Dict, List, Optional


def _hash_password(password: str) -> str:
    """Hash a password with bcrypt. Works for any password length."""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def _verify_password(password: str, hashed: str) -> bool:
    """Verify a bcrypt-hashed password."""
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False


class MongoDBManager:
    def __init__(self, connection_string: str = None):
        """Initialize MongoDB connection"""
        if connection_string is None:
            connection_string = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')

        self.client = MongoClient(connection_string)
        self.db = self.client['resume_shortlisting_db']

        # Collections
        self.companies = self.db['companies']
        self.hr_users = self.db['hr_users']
        self.job_descriptions = self.db['job_descriptions']
        self.candidate_evaluations = self.db['candidate_evaluations']
        self.evaluation_reports = self.db['evaluation_reports']

        # Create indexes for better performance
        self._create_indexes()

    def _create_indexes(self):
        """Create database indexes for performance"""
        # Company indexes
        self.companies.create_index("companyId", unique=True)

        # HR user indexes
        self.hr_users.create_index([('companyId', 1), ('email', 1)], unique=True)
        self.hr_users.create_index("userId", unique=True)

        # Job description indexes
        self.job_descriptions.create_index([('companyId', 1), ('jobId', 1)])

        # Candidate evaluation indexes
        self.candidate_evaluations.create_index([('companyId', 1), ('candidateId', 1)])
        self.candidate_evaluations.create_index([('companyId', 1), ('jobId', 1)])

        # Report indexes
        self.evaluation_reports.create_index([('companyId', 1), ('reportId', 1)])

    # Company Operations
    def create_company(self, company_id: str, company_name: str) -> bool:
        """Create a new company"""
        try:
            company_doc = {
                "companyId": company_id.upper(),
                "companyName": company_name,
                "createdAt": datetime.now(),
                "isActive": True
            }
            self.companies.insert_one(company_doc)
            return True
        except pymongo.errors.DuplicateKeyError:
            return False

    def get_company(self, company_id: str) -> Optional[Dict]:
        """Get company by ID"""
        return self.companies.find_one({"companyId": company_id.upper()})

    # HR User Operations
    def create_hr_user(self, company_id: str, hr_name: str, email: str, password: str) -> Optional[str]:
        """Create HR user and return user ID"""
        try:
            # Check if company exists
            if not self.get_company(company_id):
                return None

            # Generate user ID
            user_id = f"hr_{company_id.lower()}_{len(list(self.hr_users.find({'companyId': company_id.upper()}))) + 1:03d}"

            # Hash password with bcrypt
            hashed_password = _hash_password(password)

            user_doc = {
                "userId": user_id,
                "companyId": company_id.upper(),
                "hrName": hr_name,
                "email": email.lower(),
                "password": hashed_password,
                "createdAt": datetime.now(),
                "lastLogin": None,
                "isActive": True
            }

            self.hr_users.insert_one(user_doc)
            return user_id
        except pymongo.errors.DuplicateKeyError:
            return None

    def authenticate_hr_user(self, email: str, password: str) -> Optional[Dict]:
        """Authenticate HR user using bcrypt verification"""
        user = self.hr_users.find_one({
            "email": email.lower(),
            "isActive": True
        })

        if not user:
            return None

        # Verify password — handles both legacy sha256 hashes and new bcrypt hashes
        stored = user.get("password", "")
        if stored.startswith("$2b$") or stored.startswith("$2a$"):
            # bcrypt hash — verify directly
            if not _verify_password(password, stored):
                return None
        else:
            # Legacy sha256 hash — verify and auto-upgrade to bcrypt
            import hashlib
            if hashlib.sha256(password.encode()).hexdigest() != stored:
                return None
            # Auto-upgrade: replace sha256 hash with bcrypt
            new_hash = _hash_password(password)
            self.hr_users.update_one(
                {"_id": user["_id"]},
                {"$set": {"password": new_hash}}
            )

        # Update last login
        self.hr_users.update_one(
            {"_id": user["_id"]},
            {"$set": {"lastLogin": datetime.now()}}
        )

        return user

    def get_hr_user(self, user_id: str) -> Optional[Dict]:
        """Get HR user by ID"""
        return self.hr_users.find_one({"userId": user_id})

    # Job Description Operations
    def save_job_description(self, company_id: str, job_title: str, job_description: str,
                           required_skills: List[str], created_by: str) -> str:
        """Save job description and return job ID"""
        # Generate job ID
        job_count = self.job_descriptions.count_documents({"companyId": company_id.upper()})
        job_id = f"JOB_{company_id.upper()}_{job_count + 1:03d}"

        job_doc = {
            "jobId": job_id,
            "companyId": company_id.upper(),
            "jobTitle": job_title,
            "jobDescription": job_description,
            "requiredSkills": required_skills,
            "createdBy": created_by,
            "createdAt": datetime.now(),
            "isActive": True
        }

        self.job_descriptions.insert_one(job_doc)
        return job_id

    def get_company_jobs(self, company_id: str) -> List[Dict]:
        """Get all jobs for a company"""
        return list(self.job_descriptions.find({"companyId": company_id.upper(), "isActive": True}))

    def deactivate_job(self, company_id: str, job_id: str) -> bool:
        """Deactivate a job posting"""
        result = self.job_descriptions.update_one(
            {"jobId": job_id, "companyId": company_id.upper()},
            {"$set": {"isActive": False}}
        )
        return result.modified_count > 0

    # Candidate Evaluation Operations
    def save_candidate_evaluation(self, company_id: str, job_id: str, candidate_data: Dict,
                                evaluated_by: str) -> str:
        """Save candidate evaluation and return candidate ID"""
        # Generate candidate ID
        candidate_count = self.candidate_evaluations.count_documents({"companyId": company_id.upper()})
        candidate_id = f"CAND_{company_id.upper()}_{candidate_count + 1:03d}"

        evaluation_doc = {
            "candidateId": candidate_id,
            "companyId": company_id.upper(),
            "jobId": job_id,
            "candidateName": candidate_data.get("name", "Unknown"),
            "resumeFileName": candidate_data.get("resume_file", "Unknown"),
            "scores": {
                "skillMatch": candidate_data.get("skill_match", 0),
                "experience": candidate_data.get("experience", 0),
                "tools": candidate_data.get("tools", 0),
                "education": candidate_data.get("education", 0),
                "finalScore": candidate_data.get("score", 0)
            },
            "decision": candidate_data.get("decision", "Reject"),
            "matchedSkills": candidate_data.get("matched_skills", []),
            "missingSkills": candidate_data.get("missing_skills", []),
            "evaluatedBy": evaluated_by,
            "evaluatedAt": datetime.now(),
            "hrDecision": "Pending",
            "hrDecisionAt": None
        }

        self.candidate_evaluations.insert_one(evaluation_doc)
        return candidate_id

    def get_company_candidates(self, company_id: str, job_id: str = None) -> List[Dict]:
        """Get all candidates for a company, optionally filtered by job"""
        query = {"companyId": company_id.upper()}
        if job_id:
            query["jobId"] = job_id

        return list(self.candidate_evaluations.find(query).sort("evaluatedAt", -1))

    def update_hr_decision(self, candidate_id: str, company_id: str, hr_decision: str) -> bool:
        """Update HR decision for a candidate"""
        result = self.candidate_evaluations.update_one(
            {"candidateId": candidate_id, "companyId": company_id.upper()},
            {
                "$set": {
                    "hrDecision": hr_decision,
                    "hrDecisionAt": datetime.now()
                }
            }
        )
        return result.modified_count > 0

    # Report Operations
    def save_evaluation_report(self, company_id: str, job_id: str, report_type: str,
                             candidate_ids: List[str], generated_by: str) -> str:
        """Save evaluation report and return report ID"""
        report_count = self.evaluation_reports.count_documents({"companyId": company_id.upper()})
        report_id = f"RPT_{company_id.upper()}_{report_count + 1:03d}"

        # Fixed: guard against None when candidate document no longer exists
        shortlisted_count = 0
        for cid in candidate_ids:
            doc = self.candidate_evaluations.find_one({"candidateId": cid})
            if doc and doc.get("decision") == "Shortlist":
                shortlisted_count += 1

        report_doc = {
            "reportId": report_id,
            "companyId": company_id.upper(),
            "jobId": job_id,
            "reportType": report_type,
            "totalCandidates": len(candidate_ids),
            "shortlistedCount": shortlisted_count,
            "generatedBy": generated_by,
            "generatedAt": datetime.now(),
            "candidateIds": candidate_ids
        }

        self.evaluation_reports.insert_one(report_doc)
        return report_id

    def get_company_reports(self, company_id: str) -> List[Dict]:
        """Get all reports for a company"""
        return list(self.evaluation_reports.find({"companyId": company_id.upper()}).sort("generatedAt", -1))

    def delete_report(self, company_id: str, report_id: str) -> bool:
        """Delete a specific report"""
        result = self.evaluation_reports.delete_one({
            "reportId": report_id,
            "companyId": company_id.upper()
        })
        return result.deleted_count > 0

    # Utility Methods
    def get_company_stats(self, company_id: str) -> Dict:
        """Get company statistics"""
        total_jobs = self.job_descriptions.count_documents({"companyId": company_id.upper(), "isActive": True})
        total_candidates = self.candidate_evaluations.count_documents({"companyId": company_id.upper()})
        shortlisted = self.candidate_evaluations.count_documents({
            "companyId": company_id.upper(),
            "decision": "Shortlist"
        })

        return {
            "totalJobs": total_jobs,
            "totalCandidates": total_candidates,
            "shortlistedCandidates": shortlisted,
            "totalReports": self.evaluation_reports.count_documents({"companyId": company_id.upper()})
        }

    def close_connection(self):
        """Close MongoDB connection"""
        self.client.close()


# Global instance
db_manager = None

def get_db_manager():
    """Get MongoDB manager instance"""
    global db_manager
    if db_manager is None:
        db_manager = MongoDBManager()
    return db_manager