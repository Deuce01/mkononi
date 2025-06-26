# Mkononi Demo Workflows

## 📱 WhatsApp Demo Scenarios

### **Scenario 1: Worker Registration**
```
User: register John Nairobi plumbing,electrical
Bot: Welcome John! You're registered. Send 'jobs Nairobi' to find work.
```

### **Scenario 2: Job Search**
```
User: jobs Nairobi
Bot: Jobs in Nairobi:
1: Plumber Needed - Residential - $2500 (Match: 85%)
2: Electrician - Commercial Building - $3500 (Match: 72%)
3: Security Guard - Night Shift - $1800 (Match: 30%)
Reply 'apply [job_id]' to apply
```

### **Scenario 3: Job Application**
```
User: apply 1
Bot: Applied to Plumber Needed - Residential! Employer will contact you if selected.
```

### **Scenario 4: Invalid Command**
```
User: hello
Bot: Commands: 'register [name] [location] [skills]', 'jobs [location]', 'apply [job_id]'
```

## 📞 USSD Demo Scenarios

### **Main Menu**
```
CON Welcome to Mkononi
1. Register as Worker
2. Find Jobs
3. My Applications
```

### **Registration Flow**
```
User selects: 1
CON Enter your details:
Name*Location*Skills (comma separated)

User enters: John*Nairobi*plumbing,electrical
END Welcome John! Registration complete.
```

### **Job Search Flow**
```
User selects: 2
CON Available Jobs:
1. Plumber Needed - $2500
2. Electrician - Commercial - $3500
3. Security Guard - $1800
```

### **Applications View**
```
User selects: 3
END Your Applications:
Plumber Needed - Residential: pending
Carpenter - Furniture Making: accepted
```

## 🌐 Web API Demo

### **Test Employer Login**
```bash
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "employer1", "password": "password123"}'
```

### **Create Job Posting**
```bash
curl -X POST http://localhost:8000/api/jobs/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mechanic Needed",
    "description": "Auto mechanic for garage",
    "location": "Nairobi",
    "pay_rate": 3000.00,
    "required_skills": ["automotive", "repair"],
    "job_type": "full_time"
  }'
```

### **Search Jobs (No Auth)**
```bash
curl "http://localhost:8000/api/jobs/?skills=plumbing&location=Nairobi"
```

### **Apply for Job (Phone-based)**
```bash
curl -X POST http://localhost:8000/api/applications/ \
  -H "Content-Type: application/json" \
  -d '{
    "job": 1,
    "worker_phone": "+254700123456",
    "channel": "web"
  }'
```

## 🎯 AI Matching Demo

### **Get Job Matches**
```bash
curl http://localhost:8000/api/jobs/1/matches/
```

**Response:**
```json
[
  {
    "worker_id": 1,
    "worker_name": "John Doe",
    "score": 0.85,
    "phone": "+254700123456"
  },
  {
    "worker_id": 2,
    "worker_name": "Mary Wanjiku",
    "score": 0.42,
    "phone": "+254700123457"
  }
]
```

## 📊 Demo Data Overview

### **Test Accounts**
- **Employer 1**: `employer1` / `password123` (BuildCorp Ltd)
- **Employer 2**: `employer2` / `password123` (TechBuild Solutions)

### **Test Workers** (WhatsApp/USSD only)
- **John Doe**: `+254700123456` (Plumber/Electrician, Nairobi)
- **Mary Wanjiku**: `+254700123457` (Carpenter/Painter, Mombasa)
- **Grace Muthoni**: `+254700123459` (Cleaner, Kisumu)

### **Sample Jobs**
1. **Plumber Needed - Residential** ($2500, Contract, Nairobi)
2. **Electrician - Commercial Building** ($3500, Full-time, Nairobi)
3. **Carpenter - Furniture Making** ($2800, Part-time, Mombasa)
4. **House Cleaner - Part Time** ($1200, Part-time, Nairobi)
5. **Security Guard - Night Shift** ($1800, Full-time, Nairobi)
6. **Driver - Delivery Services** ($2200, Contract, Mombasa)

## 🚀 Quick Demo Setup

```bash
# 1. Seed demo data
python manage.py seed_data

# 2. Start server
python manage.py runserver

# 3. Access Swagger UI
http://localhost:8000/api/docs/

# 4. Test WhatsApp webhook
curl -X POST http://localhost:8000/webhook/whatsapp/ \
  -H "Content-Type: application/json" \
  -d '{"From": "whatsapp:+254700123456", "Body": "jobs Nairobi"}'

# 5. Test USSD webhook
curl -X POST http://localhost:8000/webhook/ussd/ \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "test", "phoneNumber": "+254700123456", "text": ""}'
```