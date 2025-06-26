# Mkononi Backend

A Django REST Framework backend for Mkononi, a blue-collar job matching platform using WhatsApp and USSD.

## Features

- **Worker Profiles**: Manage worker information, skills, and preferences
- **Employer Management**: Company profiles and job posting capabilities
- **Job Postings**: Create and manage job listings with skill requirements
- **Applications**: Handle job applications from multiple channels (WhatsApp, USSD, Web)
- **AI Matching**: Score-based job-worker matching system
- **JWT Authentication**: Secure token-based authentication
- **Filtering & Search**: Advanced filtering by skills, location, and other criteria

## Quick Start

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up Database**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

3. **Create Superuser**
   ```bash
   python manage.py createsuperuser
   ```

4. **Run Server**
   ```bash
   python manage.py runserver
   ```

5. **Access Swagger UI**
   ```
   http://127.0.0.1:8000/api/docs/
   ```

6. **Run Tests**
   ```bash
   python manage.py test core
   # OR
   python run_tests.py
   ```

## API Endpoints

### Authentication
- `POST /api/auth/token/` - Obtain JWT token
- `POST /api/auth/token/refresh/` - Refresh JWT token

### Core Resources
- `GET/POST /api/workers/` - Worker profiles
- `GET/POST /api/employers/` - Employer profiles
- `GET/POST /api/jobs/` - Job postings
- `GET /api/jobs/recommended/` - Recommended jobs for workers
- `GET/POST /api/applications/` - Job applications
- `PATCH /api/applications/{id}/update_status/` - Update application status
- `GET /api/matches/` - Match scores

### Filtering Examples

**Jobs by Skills:**
```
GET /api/jobs/?skills=plumbing,electrical
```

**Jobs by Location:**
```
GET /api/jobs/?location=Nairobi
```

**Jobs by Pay Range:**
```
GET /api/jobs/?min_pay=1000&max_pay=5000
```

## Models

### WorkerProfile
- Personal information and contact details
- Skills array and experience level
- Location and job type preferences
- Language preference for communication

### Employer
- Company information and verification status
- Sector classification
- Contact details

### JobPosting
- Job details and requirements
- Required skills array
- Pay rate and job type
- Location and employer relationship

### Application
- Links workers to job postings
- Tracks application status and channel
- Prevents duplicate applications

### MatchScore
- AI-generated compatibility scores
- Links workers to relevant jobs
- Timestamp for score calculation

## Configuration

### Environment Variables
Copy `.env.example` to `.env` and configure:

```env
USE_POSTGRES=False  # Set to True for PostgreSQL
DB_NAME=mkononi_db
DB_USER=postgres
DB_PASSWORD=your_password
SECRET_KEY=your-secret-key
```

### Database Setup

**Development (SQLite):**
Default configuration uses SQLite - no additional setup required.

**Production (PostgreSQL):**
1. Set `USE_POSTGRES=True` in `.env`
2. Configure database credentials
3. Install PostgreSQL and create database

## Security Features

- JWT token authentication
- Role-based access control
- CORS configuration for frontend integration
- Input validation and sanitization
- Unique constraints to prevent duplicates

## Integration Ready

The API is designed for easy integration with:
- **WhatsApp Business API** via webhooks
- **USSD gateways** for feature phone access
- **AI/ML matching algorithms** for job recommendations
- **Frontend applications** with CORS support

## Testing

### Run All Tests
```bash
python manage.py test core
```

### Test Coverage
- **Model Tests**: WorkerProfile, Employer, JobPosting, Application, MatchScore
- **API Tests**: Authentication, CRUD operations, filtering
- **Webhook Tests**: WhatsApp and USSD integration
- **Matching Tests**: AI algorithm validation

### Health Check
```
GET /health/
```

## Development

### Adding New Features
1. Create models in `core/models.py`
2. Add serializers in `core/serializers.py`
3. Implement viewsets in `core/views.py`
4. Configure URLs in `core/urls.py`
5. Run migrations: `python manage.py makemigrations && python manage.py migrate`

### Testing
```bash
python manage.py test
```

### Admin Interface
Access Django admin at `http://127.0.0.1:8000/admin/` to manage data directly.

## Deployment

For production deployment:
1. Set `DEBUG=False`
2. Configure PostgreSQL database
3. Set up proper CORS origins
4. Use environment variables for sensitive settings
5. Configure static files serving
6. Set up SSL/HTTPS

## License

This project is part of the Mkononi platform for connecting blue-collar workers with employment opportunities.