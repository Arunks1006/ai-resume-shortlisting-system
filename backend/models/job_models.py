from pydantic import BaseModel
from typing import List

class JobCreateRequest(BaseModel):
    jobTitle: str
    jobDescription: str
    requiredSkills: List[str]

class JobResponse(BaseModel):
    jobId: str
    jobTitle: str
    jobDescription: str
    requiredSkills: List[str]
    isActive: bool
    createdAt: str
