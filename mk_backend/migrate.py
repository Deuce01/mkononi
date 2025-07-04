#!/usr/bin/env python
"""
Database migration and setup script for Mkononi
"""

import os
import sys
import django
from django.core.management import execute_from_command_line

def setup_django():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mkononi_backend.settings')
    django.setup()

def run_migrations():
    print("Running database migrations...")
    execute_from_command_line(['manage.py', 'makemigrations'])
    execute_from_command_line(['manage.py', 'migrate'])
    print("✅ Migrations completed")

def create_superuser():
    from django.contrib.auth.models import User
    print("Creating superuser...")
    try:
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@mkononi.com', 'admin123')
            print("✅ Superuser created: admin/admin123")
        else:
            print("ℹ️ Superuser already exists")
    except Exception as e:
        print(f"❌ Error creating superuser: {e}")

def collect_static():
    print("Collecting static files...")
    try:
        execute_from_command_line(['manage.py', 'collectstatic', '--noinput'])
        print("✅ Static files collected")
    except Exception as e:
        print(f"❌ Error collecting static files: {e}")

def create_sample_data():
    from core.models import WorkerProfile, Employer, JobPosting
    from django.contrib.auth.models import User
    
    print("Creating sample data...")
    
    # Create sample employer
    if not User.objects.filter(username='employer1').exists():
        emp_user = User.objects.create_user('employer1', 'emp@test.com', 'pass123')
        employer = Employer.objects.create(
            user=emp_user,
            company_name='BuildCorp Kenya',
            email='jobs@buildcorp.co.ke',
            phone='+254700123456',
            sector='construction',
            verified=True
        )
        
        # Create sample jobs
        JobPosting.objects.create(
            title='Experienced Plumber',
            description='We need an experienced plumber for residential projects in Nairobi.',
            location='Nairobi',
            employer=employer,
            pay_rate=2500.00,
            required_skills=['plumbing', 'pipe installation'],
            job_type='full_time'
        )
        
        JobPosting.objects.create(
            title='Electrician - Commercial Projects',
            description='Seeking qualified electrician for commercial building projects.',
            location='Mombasa',
            employer=employer,
            pay_rate=3000.00,
            required_skills=['electrical', 'wiring'],
            job_type='contract'
        )
        
        print("✅ Sample data created")
    else:
        print("ℹ️ Sample data already exists")

if __name__ == "__main__":
    setup_django()
    run_migrations()
    create_superuser()
    collect_static()
    create_sample_data()
    print("\n🎉 Database setup complete!")
    print("You can now start the server with: python manage.py runserver")