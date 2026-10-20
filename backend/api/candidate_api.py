from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict
from database.mongodb_manager import get_db_manager
from utils.security import verify_token
from models.resume_models import CandidateResponse, HRDecisionRequest

router = APIRouter()

@router.get("/", response_model=List[CandidateResponse])
def get_candidates(current_user: Dict = Depends(verify_token)):
    """Get all candidates for the logged-in company"""
    db = get_db_manager()
    
    # Get candidates for this company
    candidates = db.get_company_candidates(current_user["company_id"])
    
    # Convert MongoDB documents to response format
    result = []
    for candidate in candidates:
        result.append(CandidateResponse(
            candidateId=candidate["candidateId"],
            candidateName=candidate["candidateName"],
            resumeFileName=candidate["resumeFileName"],
            scores=candidate["scores"],
            decision=candidate["decision"],
            missingSkills=candidate.get("missingSkills", []),
            hrDecision=candidate.get("hrDecision", "Pending"),
            evaluatedAt=candidate["evaluatedAt"].isoformat()
        ))
    
    return result

@router.get("/{candidate_id}", response_model=CandidateResponse)
def get_candidate(candidate_id: str, current_user: Dict = Depends(verify_token)):
    """Get specific candidate details"""
    db = get_db_manager()
    
    candidates = db.get_company_candidates(current_user["company_id"])
    candidate = next((c for c in candidates if c["candidateId"] == candidate_id), None)
    
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    return CandidateResponse(
        candidateId=candidate["candidateId"],
        candidateName=candidate["candidateName"],
        resumeFileName=candidate["resumeFileName"],
        scores=candidate["scores"],
        decision=candidate["decision"],
        missingSkills=candidate.get("missingSkills", []),
        hrDecision=candidate.get("hrDecision", "Pending"),
        evaluatedAt=candidate["evaluatedAt"].isoformat()
    )

@router.post("/{candidate_id}/decision")
def update_hr_decision(
    candidate_id: str,
    request: HRDecisionRequest,
    current_user: Dict = Depends(verify_token)
):
    """Update HR decision for a candidate"""
    db = get_db_manager()
    
    success = db.update_hr_decision(
        candidate_id,
        current_user["company_id"],
        request.hrDecision
    )
    
    if not success:
        raise HTTPException(status_code=404, detail="Candidate not found or update failed")
    
    return {"message": "HR decision updated successfully", "candidateId": candidate_id}

@router.get("/stats/summary")
def get_candidate_stats(current_user: Dict = Depends(verify_token)):
    """Get candidate statistics for the company"""
    db = get_db_manager()
    
    stats = db.get_company_stats(current_user["company_id"])
    
    return stats
