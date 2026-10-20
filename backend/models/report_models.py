from pydantic import BaseModel

class ReportResponse(BaseModel):
    reportId: str
    reportType: str
    totalCandidates: int
    shortlistedCount: int
    generatedAt: str
