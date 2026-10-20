from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from typing import List, Dict
from database.mongodb_manager import get_db_manager
from utils.security import verify_token
from models.report_models import ReportResponse
import csv
import io

router = APIRouter()

@router.get("/", response_model=List[ReportResponse])
def get_reports(current_user: Dict = Depends(verify_token)):
    """Get all reports for the logged-in company"""
    db = get_db_manager()
    
    reports = db.get_company_reports(current_user["company_id"])
    
    result = []
    for report in reports:
        result.append(ReportResponse(
            reportId=report["reportId"],
            reportType=report["reportType"],
            totalCandidates=report["totalCandidates"],
            shortlistedCount=report["shortlistedCount"],
            generatedAt=report["generatedAt"].isoformat()
        ))
    
    return result

@router.post("/generate")
def generate_report(current_user: Dict = Depends(verify_token)):
    """Generate a new evaluation report"""
    db = get_db_manager()
    
    # Get all candidates for this company
    candidates = db.get_company_candidates(current_user["company_id"])
    
    if not candidates:
        raise HTTPException(status_code=404, detail="No candidates found to generate report")
    
    candidate_ids = [c["candidateId"] for c in candidates]
    
    # Save report
    report_id = db.save_evaluation_report(
        current_user["company_id"],
        "DEFAULT_JOB",
        "full_evaluation",
        candidate_ids,
        current_user["user_id"]
    )
    
    return {"message": "Report generated successfully", "reportId": report_id}

@router.get("/export/csv")
def export_candidates_csv(current_user: Dict = Depends(verify_token)):
    """Export candidates to CSV file"""
    db = get_db_manager()
    
    candidates = db.get_company_candidates(current_user["company_id"])
    company = db.get_company(current_user["company_id"])
    hr_user = db.get_hr_user(current_user["user_id"])
    
    if not candidates:
        raise HTTPException(status_code=404, detail="No candidates found to export")
    
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        "Candidate ID",
        "Name",
        "Resume File",
        "Skill Match (%)",
        "Experience (%)",
        "Tools (%)",
        "Education (%)",
        "Final Score (%)",
        "AI Decision",
        "HR Decision",
        "HR Name",
        "Evaluated At"
    ])
    
    # Write data
    for candidate in candidates:
        writer.writerow([
            candidate["candidateId"],
            candidate["candidateName"],
            candidate["resumeFileName"],
            candidate["scores"]["skillMatch"],
            candidate["scores"]["experience"],
            candidate["scores"]["tools"],
            candidate["scores"]["education"],
            candidate["scores"]["finalScore"],
            candidate["decision"],
            candidate.get("hrDecision", "Pending"),
            hr_user["hrName"] if hr_user else "Unknown",
            candidate["evaluatedAt"].strftime("%Y-%m-%d %H:%M:%S")
        ])
    
    # Prepare response
    output.seek(0)
    
    from datetime import datetime
    date_str = datetime.now().strftime("%Y%m%d")
    company_name = company["companyName"] if company else current_user["company_id"]
    filename = f"{company_name}_Reports_{date_str}.csv"
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )

@router.delete("/{report_id}")
def delete_report(report_id: str, current_user: Dict = Depends(verify_token)):
    """Delete a specific report"""
    db = get_db_manager()
    success = db.delete_report(current_user["company_id"], report_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return {"message": "Report deleted successfully"}
