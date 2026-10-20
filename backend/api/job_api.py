from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict
from database.mongodb_manager import get_db_manager
from utils.security import verify_token
from models.job_models import JobCreateRequest, JobResponse
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=JobResponse)
def create_job(job: JobCreateRequest, current_user: Dict = Depends(verify_token)):
    """Create a new job posting"""
    db = get_db_manager()
    
    job_id = db.save_job_description(
        current_user["company_id"],
        job.jobTitle,
        job.jobDescription,
        job.requiredSkills,
        current_user["user_id"]
    )
    
    return JobResponse(
        jobId=job_id,
        jobTitle=job.jobTitle,
        jobDescription=job.jobDescription,
        requiredSkills=job.requiredSkills,
        isActive=True,
        createdAt=datetime.now().isoformat()
    )

@router.get("/", response_model=List[JobResponse])
def get_jobs(current_user: Dict = Depends(verify_token)):
    """Get all jobs for the company"""
    db = get_db_manager()
    
    jobs = db.get_company_jobs(current_user["company_id"])
    
    result = []
    for job in jobs:
        result.append(JobResponse(
            jobId=job["jobId"],
            jobTitle=job["jobTitle"],
            jobDescription=job["jobDescription"],
            requiredSkills=job.get("requiredSkills", []),
            isActive=job.get("isActive", True),
            createdAt=job["createdAt"].isoformat()
        ))
    
    return result

@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: str, current_user: Dict = Depends(verify_token)):
    """Get specific job details"""
    db = get_db_manager()
    
    jobs = db.get_company_jobs(current_user["company_id"])
    job = next((j for j in jobs if j["jobId"] == job_id), None)
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return JobResponse(
        jobId=job["jobId"],
        jobTitle=job["jobTitle"],
        jobDescription=job["jobDescription"],
        requiredSkills=job.get("requiredSkills", []),
        isActive=job.get("isActive", True),
        createdAt=job["createdAt"].isoformat()
    )

@router.delete("/{job_id}")
def delete_job(job_id: str, current_user: Dict = Depends(verify_token)):
    """Deactivate a job posting"""
    db = get_db_manager()
    
    success = db.deactivate_job(current_user["company_id"], job_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return {"message": "Job deactivated successfully"}
