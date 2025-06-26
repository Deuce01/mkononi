from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import WorkerProfile, Employer, JobPosting, Application, MatchScore
from core.matching import calculate_match_score


class Command(BaseCommand):
    help = 'Seed database with demo data for MVP testing'

    def handle(self, *args, **options):
        self.stdout.write('🌱 Seeding Mkononi demo data...')
        
        # Create employers
        emp1_user = User.objects.create_user('employer1', 'emp1@test.com', 'password123')
        emp1 = Employer.objects.create(
            user=emp1_user,
            company_name='BuildCorp Ltd',
            email='hr@buildcorp.com',
            phone='+254700654321',
            sector='construction',
            verified=True
        )
        
        emp2_user = User.objects.create_user('employer2', 'emp2@test.com', 'password123')
        emp2 = Employer.objects.create(
            user=emp2_user,
            company_name='TechBuild Solutions',
            email='hr@techbuild.com',
            phone='+254700111222',
            sector='construction',
            verified=True
        )
        
        # Create workers (WhatsApp/USSD only - no user accounts)
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
            ),
            WorkerProfile.objects.create(
                full_name='Grace Muthoni',
                phone_number='+254700123459',
                location='Kisumu',
                skills=['cleaning', 'housekeeping'],
                experience_level='experienced',
                preferred_job_types=['part_time', 'contract']
            )
        ]
        
        # Create demo jobs
        jobs = [
            JobPosting.objects.create(
                title='Plumber Needed - Residential',
                description='Experienced plumber for residential project in Nairobi',
                location='Nairobi',
                employer=emp1,
                pay_rate=2500.00,
                required_skills=['plumbing', 'pipe_fitting'],
                job_type='contract'
            ),
            JobPosting.objects.create(
                title='Electrician - Commercial Building',
                description='Full-time electrician for commercial building project',
                location='Nairobi',
                employer=emp1,
                pay_rate=3500.00,
                required_skills=['electrical', 'wiring'],
                job_type='full_time'
            ),
            JobPosting.objects.create(
                title='Carpenter - Furniture Making',
                description='Skilled carpenter for custom furniture production',
                location='Mombasa',
                employer=emp2,
                pay_rate=2800.00,
                required_skills=['carpentry', 'woodwork'],
                job_type='part_time'
            ),
            JobPosting.objects.create(
                title='House Cleaner - Part Time',
                description='Reliable cleaner for residential homes',
                location='Nairobi',
                employer=emp2,
                pay_rate=1200.00,
                required_skills=['cleaning', 'housekeeping'],
                job_type='part_time'
            ),
            JobPosting.objects.create(
                title='Security Guard - Night Shift',
                description='Experienced security guard for office complex',
                location='Nairobi',
                employer=emp1,
                pay_rate=1800.00,
                required_skills=['security', 'night_shift'],
                job_type='full_time'
            ),
            JobPosting.objects.create(
                title='Driver - Delivery Services',
                description='Driver with valid license for delivery company',
                location='Mombasa',
                employer=emp2,
                pay_rate=2200.00,
                required_skills=['driving', 'delivery'],
                job_type='contract'
            )
        ]
        
        # Create sample applications
        Application.objects.create(
            job=jobs[0],  # Plumber job
            worker=workers[0],  # John (plumber)
            channel='whatsapp'
        )
        
        Application.objects.create(
            job=jobs[2],  # Carpenter job
            worker=workers[1],  # Mary (carpenter)
            channel='ussd'
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
            f'✅ Demo data seeded successfully!\n'
            f'👤 Employers: employer1/password123, employer2/password123\n'
            f'📱 Test phones: +254700123456, +254700123457, +254700123459\n'
            f'🏢 Jobs created: {len(jobs)}\n'
            f'👷 Workers: {len(workers)}\n'
            f'📋 Applications: 2\n'
            f'🎯 Match scores generated'
        ))