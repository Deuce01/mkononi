from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.throttling import AnonRateThrottle
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.core.cache import cache
from .models import WorkerProfile, JobPosting, Application
from .matching import calculate_match_score
import json
import logging
from twilio.twiml.messaging_response import MessagingResponse

logger = logging.getLogger(__name__)


class WebhookThrottle(AnonRateThrottle):
    scope = 'webhook'


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([WebhookThrottle])
@csrf_exempt
def whatsapp_webhook(request):
    """
    Handle WhatsApp messages via Twilio
    Expected format: {"From": "+254...", "Body": "message"}
    """
    try:
        phone = request.data.get('From', '').replace('whatsapp:', '')
        message = request.data.get('Body', '').strip().lower()
        
        # Simple command parsing
        if message.startswith('register'):
            return handle_worker_registration(phone, message)
        elif message.startswith('jobs'):
            return handle_job_search(phone, message)
        elif message.startswith('apply'):
            return handle_job_application(phone, message)
        else:
            return Response({
                "message": "Commands: 'register [name] [location] [skills]', 'jobs [location]', 'apply [job_id]'"
            })
            
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([WebhookThrottle])
@csrf_exempt
def ussd_webhook(request):
    """
    Handle USSD sessions via Africa's Talking
    Expected format: {"sessionId": "...", "phoneNumber": "+254...", "text": "..."}
    """
    try:
        session_id = request.data.get('sessionId')
        phone = request.data.get('phoneNumber')
        text = request.data.get('text', '')
        
        # USSD menu navigation
        if text == '':
            response = "CON Welcome to Mkononi\n1. Register as Worker\n2. Find Jobs\n3. My Applications"
        elif text == '1':
            response = "CON Enter your details:\nName*Location*Skills (comma separated)"
        elif text == '2':
            response = handle_ussd_job_search(phone)
        elif text == '3':
            response = handle_ussd_applications(phone)
        elif text.startswith('1*'):
            response = handle_ussd_registration(phone, text)
        else:
            response = "END Invalid option"
            
        return Response({"response": response})
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


def handle_worker_registration(phone, message):
    """Register worker via WhatsApp"""
    try:
        parts = message.split(' ', 1)[1].split(' ')
        if len(parts) < 3:
            return Response({"message": "Format: register [name] [location] [skills]"})
        
        name = parts[0]
        location = parts[1]
        skills = parts[2].split(',')
        
        worker, created = WorkerProfile.objects.get_or_create(
            phone_number=phone,
            defaults={
                'full_name': name,
                'location': location,
                'skills': [s.strip() for s in skills]
            }
        )
        
        if created:
            return Response({"message": f"Welcome {name}! You're registered. Send 'jobs {location}' to find work."})
        else:
            return Response({"message": "You're already registered. Send 'jobs' to find work."})
            
    except Exception as e:
        return Response({"message": "Registration failed. Try: register [name] [location] [skills]"})


def handle_job_search(phone, message):
    """Search jobs via WhatsApp"""
    try:
        worker = WorkerProfile.objects.get(phone_number=phone)
        location = message.split(' ', 1)[1] if len(message.split(' ')) > 1 else worker.location
        
        jobs = JobPosting.objects.filter(
            is_open=True,
            location__icontains=location
        )[:5]
        
        if not jobs:
            return Response({"message": f"No jobs found in {location}. Try different location."})
        
        response = f"Jobs in {location}:\n"
        for job in jobs:
            score = calculate_match_score(worker, job)
            response += f"{job.id}: {job.title} - ${job.pay_rate} (Match: {score:.0%})\n"
        response += "Reply 'apply [job_id]' to apply"
        
        return Response({"message": response})
        
    except WorkerProfile.DoesNotExist:
        return Response({"message": "Please register first: register [name] [location] [skills]"})


def handle_job_application(phone, message):
    """Handle job application via WhatsApp"""
    try:
        worker = WorkerProfile.objects.get(phone_number=phone)
        job_id = int(message.split(' ')[1])
        job = JobPosting.objects.get(id=job_id, is_open=True)
        
        application, created = Application.objects.get_or_create(
            worker=worker,
            job=job,
            defaults={'channel': 'whatsapp'}
        )
        
        if created:
            return Response({"message": f"Applied to {job.title}! Employer will contact you if selected."})
        else:
            return Response({"message": "You already applied to this job."})
            
    except (WorkerProfile.DoesNotExist, JobPosting.DoesNotExist, ValueError):
        return Response({"message": "Invalid job ID or you're not registered."})


def handle_ussd_registration(phone, text):
    """Handle USSD registration"""
    try:
        data = text.split('*')[1]  # Remove menu selection
        parts = data.split('*')
        
        if len(parts) >= 3:
            name, location, skills = parts[0], parts[1], parts[2].split(',')
            
            WorkerProfile.objects.get_or_create(
                phone_number=phone,
                defaults={
                    'full_name': name,
                    'location': location,
                    'skills': [s.strip() for s in skills]
                }
            )
            return f"END Welcome {name}! Registration complete."
        else:
            return "CON Enter: Name*Location*Skills"
            
    except Exception:
        return "END Registration failed. Try again."


def handle_ussd_job_search(phone):
    """Handle USSD job search"""
    try:
        worker = WorkerProfile.objects.get(phone_number=phone)
        jobs = JobPosting.objects.filter(is_open=True)[:3]
        
        if not jobs:
            return "END No jobs available."
        
        response = "CON Available Jobs:\n"
        for i, job in enumerate(jobs, 1):
            response += f"{i}. {job.title} - ${job.pay_rate}\n"
        return response
        
    except WorkerProfile.DoesNotExist:
        return "END Please register first (Option 1)"


def handle_ussd_applications(phone):
    """Handle USSD applications view"""
    try:
        worker = WorkerProfile.objects.get(phone_number=phone)
        applications = worker.applications.all()[:3]
        
        if not applications:
            return "END No applications yet."
        
        response = "END Your Applications:\n"
        for app in applications:
            response += f"{app.job.title}: {app.status}\n"
        return response
        
    except WorkerProfile.DoesNotExist:
        return "END Please register first"