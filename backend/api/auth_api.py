from fastapi import APIRouter, HTTPException, Depends
from models.auth_models import LoginRequest, RegisterRequest, LoginResponse, UserResponse
from database.mongodb_manager import get_db_manager
from utils.security import create_access_token, verify_token
from typing import Dict

router = APIRouter()

@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest):
    """HR user login endpoint"""
    db = get_db_manager()
    
    # Authenticate user
    user = db.authenticate_hr_user(request.email, request.password)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Get company details
    company = db.get_company(user["companyId"])
    
    # Create JWT token
    token_data = {
        "user_id": user["userId"],
        "company_id": user["companyId"],
        "email": user["email"]
    }
    access_token = create_access_token(token_data)
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            userId=user["userId"],
            companyId=user["companyId"],
            companyName=company["companyName"] if company else user["companyId"],
            hrName=user["hrName"],
            email=user["email"]
        )
    )

@router.post("/register")
def register(request: RegisterRequest):
    """Company and HR user registration endpoint"""
    db = get_db_manager()
    
    # Validate password match
    if request.password != request.confirmPassword:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    
    # Check if company exists, create if not
    existing_company = db.get_company(request.companyId)
    if not existing_company:
        company_created = db.create_company(request.companyId, request.companyName)
        if not company_created:
            raise HTTPException(status_code=500, detail="Failed to create company")
    
    # Create HR user
    user_id = db.create_hr_user(
        request.companyId,
        request.hrName,
        request.email,
        request.password
    )
    
    if not user_id:
        raise HTTPException(status_code=400, detail="Registration failed. Email might already exist.")
    
    return {"message": "Registration successful", "userId": user_id}

@router.get("/verify")
def verify_token_endpoint(current_user: Dict = Depends(verify_token)):
    """Verify JWT token and return user info"""
    return {"valid": True, "user": current_user}
