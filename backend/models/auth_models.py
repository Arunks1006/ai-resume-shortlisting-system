from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    companyId: str
    companyName: str
    hrName: str
    email: EmailStr
    password: str
    confirmPassword: str

class UserResponse(BaseModel):
    userId: str
    companyId: str
    companyName: str
    hrName: str
    email: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
