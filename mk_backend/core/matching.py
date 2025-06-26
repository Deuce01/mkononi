from typing import List
import math


def calculate_match_score(worker, job) -> float:
    """
    Calculate match score between worker and job
    Returns score between 0.0 and 1.0
    """
    score = 0.0
    
    # Skills matching (40% weight)
    skills_score = calculate_skills_match(worker.skills, job.required_skills)
    score += skills_score * 0.4
    
    # Location matching (30% weight)
    location_score = calculate_location_match(worker.location, job.location)
    score += location_score * 0.3
    
    # Experience level matching (20% weight)
    experience_score = calculate_experience_match(worker.experience_level, job.job_type)
    score += experience_score * 0.2
    
    # Job type preference (10% weight)
    job_type_score = calculate_job_type_match(worker.preferred_job_types, job.job_type)
    score += job_type_score * 0.1
    
    return min(score, 1.0)


def calculate_skills_match(worker_skills: List[str], required_skills: List[str]) -> float:
    """Calculate skills overlap score"""
    if not worker_skills or not required_skills:
        return 0.0
    
    worker_skills_lower = [skill.lower() for skill in worker_skills]
    required_skills_lower = [skill.lower() for skill in required_skills]
    
    matches = sum(1 for skill in required_skills_lower if skill in worker_skills_lower)
    return matches / len(required_skills_lower)


def calculate_location_match(worker_location: str, job_location: str) -> float:
    """Calculate location proximity score"""
    if not worker_location or not job_location:
        return 0.5
    
    # Simple string matching - can be enhanced with geolocation
    if worker_location.lower() == job_location.lower():
        return 1.0
    elif worker_location.lower() in job_location.lower() or job_location.lower() in worker_location.lower():
        return 0.7
    else:
        return 0.3


def calculate_experience_match(worker_experience: str, job_type: str) -> float:
    """Calculate experience level appropriateness"""
    experience_weights = {
        'entry': 1,
        'intermediate': 2,
        'experienced': 3,
        'expert': 4
    }
    
    job_type_requirements = {
        'temporary': 1,
        'part_time': 2,
        'contract': 3,
        'full_time': 3
    }
    
    worker_level = experience_weights.get(worker_experience, 1)
    required_level = job_type_requirements.get(job_type, 2)
    
    # Perfect match
    if worker_level == required_level:
        return 1.0
    # Overqualified (slight penalty)
    elif worker_level > required_level:
        return 0.8
    # Underqualified
    else:
        return max(0.3, worker_level / required_level)


def calculate_job_type_match(preferred_types: List[str], job_type: str) -> float:
    """Calculate job type preference match"""
    if not preferred_types:
        return 0.5
    
    return 1.0 if job_type in preferred_types else 0.3