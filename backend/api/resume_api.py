from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from typing import Dict, List, Optional
from core.parser import extract_text
from core.matcher import (
    calculate_skill_match,
    calculate_experience_score,
    calculate_tools_score,
    calculate_education_score,
    calculate_final_score,
    get_technical_skills_gap
)
from database.mongodb_manager import get_db_manager
from utils.security import verify_token
from models.resume_models import EvaluationResponse, BulkEvaluationResponse

router = APIRouter()

# Decision thresholds — extracted as named constants (no more magic numbers)
SHORTLIST_THRESHOLD = 40
HOLD_THRESHOLD = 25


def _make_file_wrapper(content: bytes, filename: str):
    """
    Helper that creates a minimal file-like object accepted by extract_text().
    Extracted from both endpoints to eliminate code duplication.
    """
    class FileWrapper:
        def __init__(self, file_content, file_name):
            self.content = file_content
            self.name = file_name

        def read(self):
            return self.content

        def seek(self, position):
            pass  # content is already buffered in memory

    return FileWrapper(content, filename)


def _determine_decision(final_score: float) -> str:
    """Map a final score to a human-readable decision string."""
    if final_score >= SHORTLIST_THRESHOLD:
        return "Shortlist"
    if final_score >= HOLD_THRESHOLD:
        return "Hold"
    return "Reject"


@router.post("/evaluate", response_model=EvaluationResponse)
async def evaluate_resume(
    resume: UploadFile = File(...),
    candidateName: str = Form(...),
    jobDescription: str = Form(...),
    jobId: Optional[str] = Form(None),
    current_user: Dict = Depends(verify_token)
):
    """Evaluate resume against job description using AI matching"""

    # Validate file type
    if not resume.filename.endswith(('.pdf', '.docx')):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")

    try:
        file_content = await resume.read()
        file_obj = _make_file_wrapper(file_content, resume.filename)

        # Extract text from resume
        resume_text = extract_text(file_obj)

        if not resume_text:
            raise HTTPException(status_code=400, detail="Could not extract text from resume")

        # Calculate scores using AI logic
        skill_score = calculate_skill_match(resume_text, jobDescription)
        exp_score = calculate_experience_score(resume_text)
        tools_score = calculate_tools_score(resume_text, jobDescription)
        edu_score = calculate_education_score(resume_text)
        final_score = calculate_final_score(skill_score, exp_score, tools_score, edu_score)

        decision = _determine_decision(final_score)

        # Get missing skills
        missing_skills = list(get_technical_skills_gap(jobDescription, resume_text))

        # Use provided jobId or fall back to "DEFAULT_JOB" for backward compatibility
        effective_job_id = jobId if jobId else "DEFAULT_JOB"

        # Save to database
        db = get_db_manager()
        candidate_data = {
            "name": candidateName,
            "resume_file": resume.filename,
            "skill_match": skill_score,
            "experience": exp_score,
            "tools": tools_score,
            "education": edu_score,
            "score": final_score,
            "decision": decision,
            "matched_skills": [],
            "missing_skills": missing_skills
        }

        candidate_id = db.save_candidate_evaluation(
            current_user["company_id"],
            effective_job_id,
            candidate_data,
            current_user["user_id"]
        )

        return EvaluationResponse(
            candidateId=candidate_id,
            candidateName=candidateName,
            resumeFileName=resume.filename,
            scores={
                "skillMatch": skill_score,
                "experience": exp_score,
                "tools": tools_score,
                "education": edu_score,
                "finalScore": final_score
            },
            decision=decision,
            missingSkills=missing_skills
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing resume: {str(e)}")


@router.post("/evaluate-bulk", response_model=BulkEvaluationResponse)
async def evaluate_bulk_resumes(
    resumes: List[UploadFile] = File(...),
    jobDescription: str = Form(...),
    jobId: Optional[str] = Form(None),
    current_user: Dict = Depends(verify_token)
):
    """Evaluate multiple resumes against single job description"""

    results = []
    errors = []
    effective_job_id = jobId if jobId else "DEFAULT_JOB"

    for resume in resumes:
        if not resume.filename.endswith(('.pdf', '.docx')):
            errors.append({"filename": resume.filename, "error": "Invalid file type"})
            continue

        try:
            file_content = await resume.read()
            file_obj = _make_file_wrapper(file_content, resume.filename)
            resume_text = extract_text(file_obj)

            if not resume_text:
                errors.append({"filename": resume.filename, "error": "Could not extract text"})
                continue

            skill_score = calculate_skill_match(resume_text, jobDescription)
            exp_score = calculate_experience_score(resume_text)
            tools_score = calculate_tools_score(resume_text, jobDescription)
            edu_score = calculate_education_score(resume_text)
            final_score = calculate_final_score(skill_score, exp_score, tools_score, edu_score)

            decision = _determine_decision(final_score)
            missing_skills = list(get_technical_skills_gap(jobDescription, resume_text))

            candidate_data = {
                "name": resume.filename.rsplit('.', 1)[0],
                "resume_file": resume.filename,
                "skill_match": skill_score,
                "experience": exp_score,
                "tools": tools_score,
                "education": edu_score,
                "score": final_score,
                "decision": decision,
                "matched_skills": [],
                "missing_skills": missing_skills
            }

            db = get_db_manager()
            candidate_id = db.save_candidate_evaluation(
                current_user["company_id"],
                effective_job_id,
                candidate_data,
                current_user["user_id"]
            )

            results.append({
                "candidateId": candidate_id,
                "candidateName": candidate_data["name"],
                "resumeFileName": resume.filename,
                "scores": {
                    "skillMatch": skill_score,
                    "experience": exp_score,
                    "tools": tools_score,
                    "education": edu_score,
                    "finalScore": final_score
                },
                "decision": decision,
                "missingSkills": missing_skills
            })

        except Exception as e:
            errors.append({"filename": resume.filename, "error": str(e)})

    return BulkEvaluationResponse(
        totalProcessed=len(resumes),
        successCount=len(results),
        failureCount=len(errors),
        results=results,
        errors=errors
    )
