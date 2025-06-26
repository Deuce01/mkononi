# Mkononi API Documentation

## Swagger UI
Interactive API documentation available at: **http://127.0.0.1:8000/api/docs/**

## Authentication

### JWT Token Authentication
- **Obtain Token**: `POST /api/auth/token/`
- **Refresh Token**: `POST /api/auth/token/refresh/`

**Request Body:**
```json
{
    "username": "employer@example.com",
    "password": "password123"
}
```

## Core Endpoints

### 1. Worker Registration (No Auth Required)
**Endpoint**: `POST /api/workers/`

**Request Body:**
```json
{
    "full_name": "John Doe",
    "phone_number": "+254700123456",
    "location": "Nairobi",
    "skills": ["plumbing", "electrical"],
    "experience_level": "intermediate",
    "preferred_job_types": ["full_time", "contract"]
}
```

### 2. Employer Registration (Auth Required)
**Endpoint**: `POST /api/employers/`

**Headers**: `Authorization: Bearer <token>`

**Request Body:**
```json
{
    "company_name": "BuildCorp Ltd",
    "email": "hr@buildcorp.com",
    "phone": "+254700654321",
    "sector": "construction"
}
```

### 3. Job Postings

#### Create Job (Auth Required - Employers Only)
**Endpoint**: `POST /api/jobs/`

**Headers**: `Authorization: Bearer <token>`

**Request Body:**
```json
{
    "title": "Plumber Needed",
    "description": "Experienced plumber for residential project",
    "location": "Nairobi",
    "pay_rate": 2500.00,
    "required_skills": ["plumbing", "pipe_fitting"],
    "job_type": "contract"
}
```

#### List Jobs (No Auth Required)
**Endpoint**: `GET /api/jobs/`

**Query Parameters:**
- `skills`: Filter by skills (comma-separated)
- `location`: Filter by location (partial match)
- `job_type`: Filter by job type
- `min_pay`: Minimum pay rate
- `max_pay`: Maximum pay rate

**Examples:**
```
GET /api/jobs/?skills=plumbing,electrical
GET /api/jobs/?location=Nairobi&min_pay=2000
GET /api/jobs/?job_type=full_time
```

#### Get Job Matches (No Auth Required)
**Endpoint**: `GET /api/jobs/{job_id}/matches/`

**Response:**
```json
[
    {
        "worker_id": 1,
        "worker_name": "John Doe",
        "score": 0.85,
        "phone": "+254700123456"
    }
]
```

### 4. Applications

#### Submit Application (No Auth Required)
**Endpoint**: `POST /api/applications/`

**Request Body (via phone):**
```json
{
    "job": 1,
    "worker_phone": "+254700123456",
    "channel": "whatsapp"
}
```

**Request Body (authenticated worker):**
```json
{
    "job": 1,
    "channel": "web"
}
```

#### Update Application Status (Auth Required - Employers Only)
**Endpoint**: `PATCH /api/applications/{id}/update_status/`

**Headers**: `Authorization: Bearer <token>`

**Request Body:**
```json
{
    "status": "accepted"
}
```

## Webhook Endpoints

### WhatsApp Webhook
**Endpoint**: `POST /webhook/whatsapp/`

**Expected from Twilio:**
```json
{
    "From": "whatsapp:+254700123456",
    "Body": "register John Nairobi plumbing,electrical"
}
```

**Commands:**
- `register [name] [location] [skills]` - Register as worker
- `jobs [location]` - Search for jobs
- `apply [job_id]` - Apply to job

### USSD Webhook
**Endpoint**: `POST /webhook/ussd/`

**Expected from Africa's Talking:**
```json
{
    "sessionId": "ATUid_session_id",
    "phoneNumber": "+254700123456",
    "text": "1*John*Nairobi*plumbing,electrical"
}
```

**USSD Menu:**
1. Register as Worker
2. Find Jobs  
3. My Applications

## Response Formats

### Success Response
```json
{
    "id": 1,
    "field1": "value1",
    "field2": "value2",
    "created_at": "2024-01-01T00:00:00Z"
}
```

### Error Response
```json
{
    "error": "Error message",
    "details": {
        "field": ["Field-specific error"]
    }
}
```

## Integration Examples

### WhatsApp Integration (Twilio)
```python
from twilio.rest import Client

client = Client(account_sid, auth_token)
message = client.messages.create(
    body="Welcome to Mkononi! Send 'register [name] [location] [skills]' to start.",
    from_='whatsapp:+14155238886',
    to='whatsapp:+254700123456'
)
```

### USSD Integration (Africa's Talking)
```python
import requests

response = requests.post('https://api.africastalking.com/version1/messaging', {
    'username': 'sandbox',
    'to': '+254700123456',
    'message': 'Welcome to Mkononi Jobs!'
})
```

### AI Matching Integration
```python
from core.matching import calculate_match_score
from core.models import WorkerProfile, JobPosting

worker = WorkerProfile.objects.get(id=1)
job = JobPosting.objects.get(id=1)
score = calculate_match_score(worker, job)
print(f"Match score: {score:.2%}")
```

## Security Notes

1. **Worker Access**: Workers can access job listings and apply without authentication
2. **Employer Access**: Employers must authenticate to create jobs and manage applications
3. **Phone Verification**: Worker identity verified via phone number for applications
4. **Rate Limiting**: Implement rate limiting on webhook endpoints in production
5. **CORS**: Configure CORS origins for frontend integration

## Production Deployment

1. Set `USE_POSTGRES=True` in environment
2. Configure PostgreSQL database
3. Set proper `CORS_ALLOWED_ORIGINS`
4. Use environment variables for sensitive settings
5. Enable HTTPS/SSL
6. Set up monitoring for webhook endpoints