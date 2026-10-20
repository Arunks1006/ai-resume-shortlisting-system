from typing import Any, Dict

def success_response(message: str, data: Any = None) -> Dict:
    """Standard success response format"""
    response = {
        "success": True,
        "message": message
    }
    if data is not None:
        response["data"] = data
    return response

def error_response(message: str, error_code: str = None) -> Dict:
    """Standard error response format"""
    response = {
        "success": False,
        "message": message
    }
    if error_code:
        response["error_code"] = error_code
    return response
