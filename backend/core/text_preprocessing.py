import re

def clean_text(text):
    """Simple text cleaning that preserves important words"""
    if not text:
        return ""
    
    # Convert to lowercase and keep only letters and spaces
    text = re.sub(r'[^a-zA-Z\s]', ' ', text.lower())
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def extract_keywords(text):
    """Extract meaningful keywords from text"""
    if not text:
        return set()
    
    # Get words that are 3+ characters
    words = re.findall(r'\b\w{3,}\b', text.lower())
    
    # Filter out common stop words manually
    stop_words = {'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'she', 'use', 'her', 'way', 'many', 'then', 'them', 'well', 'were'}
    
    keywords = set(word for word in words if word not in stop_words)
    
    return keywords
