from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import auth_api, resume_api, candidate_api, report_api, job_api

app = FastAPI(
    title="AI Resume Shortlisting System",
    description="Full-stack resume evaluation system with AI-powered matching",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth_api.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(resume_api.router, prefix="/api/resume", tags=["Resume"])
app.include_router(candidate_api.router, prefix="/api/candidates", tags=["Candidates"])
app.include_router(report_api.router, prefix="/api/reports", tags=["Reports"])
app.include_router(job_api.router, prefix="/api/jobs", tags=["Jobs"])

@app.get("/")
def root():
    return {"message": "AI Resume Shortlisting System API", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
