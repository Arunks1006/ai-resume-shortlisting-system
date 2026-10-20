from pydantic import BaseModel
from typing import List, Dict

class EvaluationResponse(BaseModel):
    candidateId: str
    candidateName: str
    resumeFileName: str
    scores: Dict[str, float]
    decision: str
    missingSkills: List[str]

class CandidateResponse(BaseModel):
    candidateId: str
    candidateName: str
    resumeFileName: str
    scores: Dict[str, float]
    decision: str
    missingSkills: List[str]
    hrDecision: str
    evaluatedAt: str

class HRDecisionRequest(BaseModel):
    hrDecision: str  # "Approved", "Rejected", "Pending"

class BulkEvaluationResponse(BaseModel):
    totalProcessed: int
    successCount: int
    failureCount: int
    results: List[Dict]
    errors: List[Dict]
