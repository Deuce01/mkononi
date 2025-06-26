# Mkononi - Blue-Collar Job Matching Platform

A comprehensive job matching platform for Africa's blue-collar workforce, supporting WhatsApp, USSD, and Web interfaces.

## 🚀 Quick Start

### Windows Setup
```bash
# Run the setup script
setup.bat

# Start the platform
start.bat
```

### Manual Setup

#### Backend (Django + DRF)
```bash
cd mk_backend
pip install -r requirements.txt
python migrate.py  # Sets up DB, creates admin user, sample data
python manage.py runserver
```

#### Frontend (Next.js + TypeScript)
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Admin Panel**: http://localhost:8000/admin (admin/admin123)
- **API Documentation**: http://localhost:8000/api/docs/

## 📱 Features

### Multi-Channel Support
- **Web Interface**: Full-featured job portal
- **WhatsApp**: Apply via WhatsApp messages
- **USSD**: Feature phone support for job search

### Core Functionality
- **AI-Powered Matching**: Score-based job-worker compatibility
- **JWT Authentication**: Secure employer authentication
- **Real-time Applications**: Instant job applications
- **Advanced Filtering**: Skills, location, pay rate filtering
- **Webhook Integration**: Twilio + Africa's Talking support

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
DEBUG=False
SECRET_KEY=your-production-secret-key
ALLOWED_HOSTS=localhost,yourdomain.com
DATABASE_URL=postgres://user:pass@localhost:5432/mkononi_db
REDIS_URL=redis://localhost:6379/0
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_WHATSAPP_NUMBER=+14155238886
NEXT_PUBLIC_GENKIT_KEY=your-genkit-api-key
```

## 🐳 Docker Deployment

```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# Development
docker-compose up -d
```

## 📞 Webhook Endpoints

### WhatsApp (Twilio)
- **URL**: `/webhook/whatsapp/`
- **Commands**: 
  - `register John Nairobi plumbing,electrical`
  - `jobs Nairobi`
  - `apply 123`

### USSD (Africa's Talking)
- **URL**: `/webhook/ussd/`
- **Menu**: Interactive USSD menu system

## 🧪 Testing

```bash
# Backend tests
cd mk_backend
python manage.py test
# or
python run_tests.py

# API testing via Swagger
# Visit: http://localhost:8000/api/docs/
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/token/` - Login
- `POST /api/auth/token/refresh/` - Refresh token

### Core Resources
- `GET/POST /api/workers/` - Worker profiles
- `GET/POST /api/employers/` - Employer profiles  
- `GET/POST /api/jobs/` - Job postings
- `GET /api/jobs/{id}/matches/` - AI job matches
- `GET/POST /api/applications/` - Job applications

### Filtering Examples
```bash
# Jobs by skills
GET /api/jobs/?skills=plumbing,electrical

# Jobs by location
GET /api/jobs/?location=Nairobi

# Jobs by pay range
GET /api/jobs/?min_pay=2000&max_pay=5000
```

## 🔒 Security Features

- Environment-based configuration
- JWT token authentication
- Rate limiting on webhooks
- CORS protection
- Input validation
- SQL injection protection

## 🚀 Production Deployment

### Heroku
```bash
# Set environment variables
heroku config:set DEBUG=False
heroku config:set SECRET_KEY=your-secret-key

# Deploy
git push heroku main
```

### AWS/DigitalOcean
- Use provided Dockerfile
- Configure PostgreSQL + Redis
- Set up SSL certificates
- Configure domain and CORS

## 📈 Monitoring

- **Health Check**: `/health/`
- **Logs**: `django_errors.log`
- **Admin Panel**: Monitor applications and jobs

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Submit pull request

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Support

- **Documentation**: `/api/docs/`
- **Issues**: GitHub Issues
- **Email**: support@mkononi.com

---

**Built for Africa's workforce** 🌍