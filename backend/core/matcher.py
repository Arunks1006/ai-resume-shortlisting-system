from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import re
import numpy as np

# Load Sentence-BERT model (lightweight and efficient)
# Bare except replaced with specific Exception so failures are visible in logs
try:
    sbert_model = SentenceTransformer('all-MiniLM-L6-v2')
    print("[matcher] Sentence-BERT model loaded successfully.")
except Exception as e:
    sbert_model = None
    print(f"[matcher] WARNING: Could not load Sentence-BERT model: {e}. "
          "Falling back to keyword-only matching.")

def calculate_skill_match(resume_text, jd_text):
    """Enhanced skill matching with better keyword extraction"""
    if not resume_text or not jd_text:
        return 0.0

    # Use Sentence-BERT for semantic similarity
    semantic_score = 0
    if sbert_model:
        try:
            embeddings = sbert_model.encode([resume_text, jd_text])
            similarity = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
            semantic_score = similarity * 100
        except Exception as e:
            print(f"[matcher] WARNING: Semantic scoring failed: {e}")
            semantic_score = 0

    # Enhanced keyword matching
    resume_text_lower = resume_text.lower()
    jd_text_lower = jd_text.lower()

    # Extract important keywords (skills, technologies, domains)
    important_keywords = [
        'python', 'java', 'javascript', 'react', 'angular', 'vue', 'node', 'express',
        'django', 'flask', 'spring', 'sql', 'mysql', 'postgresql', 'mongodb', 'redis',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github',
        'machine learning', 'data science', 'artificial intelligence', 'deep learning',
        'frontend', 'backend', 'fullstack', 'devops', 'microservices', 'api', 'rest',
        'agile', 'scrum', 'project management', 'team lead', 'senior', 'experience'
    ]

    # Count keyword matches with higher weight
    jd_keywords = [kw for kw in important_keywords if kw in jd_text_lower]
    resume_keywords = [kw for kw in important_keywords if kw in resume_text_lower]

    if jd_keywords:
        keyword_matches = len([kw for kw in jd_keywords if kw in resume_text_lower])
        keyword_score = (keyword_matches / len(jd_keywords)) * 100
    else:
        # Fallback to general word matching
        resume_words = set(re.findall(r'\b\w{3,}\b', resume_text_lower))
        jd_words = set(re.findall(r'\b\w{3,}\b', jd_text_lower))
        if jd_words:
            common_words = resume_words.intersection(jd_words)
            keyword_score = (len(common_words) / len(jd_words)) * 100
        else:
            keyword_score = 0

    # Combine semantic and keyword scores
    final_score = max(semantic_score * 0.6 + keyword_score * 0.4, keyword_score)
    return min(100, round(final_score, 2))

def calculate_experience_score(resume_text):
    """Calculate experience relevance score"""
    if not resume_text:
        return 0.0

    text = resume_text.lower()
    score = 0

    # Years of experience patterns
    year_patterns = re.findall(r'(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)', text)
    years = max([int(y) for y in year_patterns], default=0)

    # Experience scoring
    score += min(50, years * 5)  # 5 points per year, max 50

    # Experience keywords
    exp_keywords = ['experience', 'worked', 'developed', 'managed', 'led', 'project', 'team', 'responsible']
    exp_count = sum(1 for keyword in exp_keywords if keyword in text)
    score += min(30, exp_count * 4)

    # Professional roles
    roles = ['developer', 'engineer', 'manager', 'analyst', 'consultant', 'specialist', 'lead', 'senior']
    role_count = sum(1 for role in roles if role in text)
    score += min(20, role_count * 5)

    return min(100, round(score, 2))

def calculate_tools_score(resume_text, jd_text):
    """Calculate tools and technologies score"""
    if not resume_text or not jd_text:
        return 0.0

    tools_list = ['python', 'java', 'javascript', 'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring', 'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github', 'gitlab', 'jira', 'confluence', 'slack', 'teams', 'tensorflow', 'pytorch', 'scikit', 'pandas', 'numpy']

    resume_words = set(re.findall(r'\b\w{3,}\b', resume_text.lower()))
    jd_words = set(re.findall(r'\b\w{3,}\b', jd_text.lower()))

    jd_tools = jd_words.intersection(tools_list)
    resume_tools = resume_words.intersection(tools_list)

    if not jd_tools:
        return 70  # Default score if no specific tools mentioned in JD

    tools_match = (len(resume_tools.intersection(jd_tools)) / len(jd_tools)) * 100
    return min(100, round(tools_match, 2))

def calculate_education_score(resume_text):
    """Calculate education relevance score"""
    if not resume_text:
        return 0.0

    text = resume_text.lower()
    score = 0

    # Degree levels
    if any(degree in text for degree in ['phd', 'doctorate', 'ph.d']):
        score += 40
    elif any(degree in text for degree in ['master', 'msc', 'mba', 'ms']):
        score += 35
    elif any(degree in text for degree in ['bachelor', 'bsc', 'ba', 'bs', 'be', 'btech']):
        score += 30
    elif any(degree in text for degree in ['diploma', 'certificate']):
        score += 20

    # Relevant fields
    relevant_fields = ['computer', 'software', 'engineering', 'science', 'technology', 'information', 'data', 'mathematics', 'statistics']
    field_matches = sum(1 for field in relevant_fields if field in text)
    score += min(30, field_matches * 5)

    # Universities/Institutions
    if any(word in text for word in ['university', 'college', 'institute', 'school']):
        score += 15

    # Certifications
    cert_keywords = ['certified', 'certification', 'aws', 'azure', 'google', 'microsoft', 'oracle', 'cisco']
    cert_count = sum(1 for cert in cert_keywords if cert in text)
    score += min(15, cert_count * 3)

    return min(100, round(score, 2))

def calculate_final_score(skill_score, exp_score, tools_score, edu_score):
    """Calculate weighted final score with skill emphasis"""
    # Increased skill weight for better matching
    final_score = (skill_score * 0.6) + (exp_score * 0.2) + (tools_score * 0.15) + (edu_score * 0.05)
    return round(final_score, 2)

def get_technical_skills_gap(jd_text, resume_text):
    """Return only technical missing skills from job description"""
    if not jd_text or not resume_text:
        return set()

    # Technical skills list
    technical_skills = {
        'python', 'java', 'javascript', 'react', 'angular', 'vue', 'node', 'express',
        'django', 'flask', 'spring', 'sql', 'mysql', 'postgresql', 'mongodb', 'redis',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github',
        'gitlab', 'jira', 'confluence', 'tensorflow', 'pytorch', 'scikit', 'pandas',
        'numpy', 'html', 'css', 'bootstrap', 'jquery', 'php', 'laravel', 'ruby',
        'rails', 'golang', 'rust', 'swift', 'kotlin', 'flutter', 'xamarin', 'unity',
        'elasticsearch', 'kafka', 'rabbitmq', 'nginx', 'apache', 'linux', 'windows',
        'restapi', 'graphql', 'microservices', 'devops', 'ci/cd', 'agile', 'scrum'
    }

    jd_words = set(re.findall(r'\b\w{3,}\b', jd_text.lower()))
    resume_words = set(re.findall(r'\b\w{3,}\b', resume_text.lower()))

    # Find technical skills mentioned in JD
    jd_tech_skills = jd_words.intersection(technical_skills)
    resume_tech_skills = resume_words.intersection(technical_skills)

    # Return missing technical skills
    return jd_tech_skills - resume_tech_skills
