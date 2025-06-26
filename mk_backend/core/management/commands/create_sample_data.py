from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import WorkerProfile, Employer, JobPosting, Application, MatchScore
from core.matching import calculate_match_score
import random


class Command(BaseCommand):
    help = 'Create sample data for testing'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')
        
        # Create employer user and profile
        employer_user = User.objects.create_user('employer1', 'employer@test.com', 'password123')
        
        # Create workers (no user accounts - WhatsApp/USSD only)
        workers = [
            WorkerProfile.objects.create(
                full_name='John Doe',
                phone_number='+254700123456',
                location='Nairobi',
                skills=['plumbing', 'electrical'],
                experience_level='intermediate',
                preferred_job_types=['full_time', 'contract']
            ),
            WorkerProfile.objects.create(
                full_name='Mary Wanjiku',
                phone_number='+254700123457',
                location='Mombasa',
                skills=['carpentry', 'painting'],
                experience_level='experienced',
                preferred_job_types=['part_time', 'contract']
            )
        ]
        
        employer = Employer.objects.create(
            user=employer_user,
            company_name='BuildCorp Ltd',
            email='hr@buildcorp.com',
            phone='+254700654321',
            sector='construction',
            verified=True
        )
        
        # Create job postings
        jobs = [
            JobPosting.objects.create(
                title='Plumber Needed',
                description='Experienced plumber for residential project',
                location='Nairobi',
                employer=employer,
                pay_rate=2500.00,
                required_skills=['plumbing', 'pipe_fitting'],
                job_type='contract'
            ),
            JobPosting.objects.create(
                title='Carpenter - Furniture Making',
                description='Skilled carpenter for custom furniture',
                location='Mombasa',
                employer=employer,
                pay_rate=2800.00,
                required_skills=['carpentry', 'woodwork'],
                job_type='part_time'
            )
        ]
        
        # Create applications
        Application.objects.create(
            job=jobs[0],
            worker=workers[0],
            channel='whatsapp'
        )
        
        # Generate match scores
        for worker in workers:
            for job in jobs:
                score = calculate_match_score(worker, job)
                if score > 0.2:
                    MatchScore.objects.create(
                        worker=worker,
                        job=job,
                        score=score
                    )
        
        self.stdout.write(self.style.SUCCESS(
            f'Sample data created!\n'
            f'Employer login: employer1/password123\n'
            f'Test phones: +254700123456, +254700123457'
        ))