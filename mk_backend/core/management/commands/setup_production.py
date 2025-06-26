from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import WorkerProfile, Employer, JobPosting
import os

class Command(BaseCommand):
    help = 'Setup production environment with sample data'

    def handle(self, *args, **options):
        self.stdout.write('Setting up production environment...')
        
        # Create admin user
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@mkononi.com', 'admin123')
            self.stdout.write(self.style.SUCCESS('✅ Admin user created'))
        
        # Create sample employer
        if not User.objects.filter(username='buildcorp').exists():
            emp_user = User.objects.create_user('buildcorp', 'jobs@buildcorp.co.ke', 'build123')
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
                description='We need an experienced plumber for residential projects.',
                location='Nairobi',
                employer=employer,
                pay_rate=2500.00,
                required_skills=['plumbing', 'pipe installation'],
                job_type='full_time'
            )
            
            JobPosting.objects.create(
                title='Electrician - Commercial',
                description='Qualified electrician for commercial projects.',
                location='Mombasa', 
                employer=employer,
                pay_rate=3000.00,
                required_skills=['electrical', 'wiring'],
                job_type='contract'
            )
            
            self.stdout.write(self.style.SUCCESS('✅ Sample data created'))
        
        self.stdout.write(self.style.SUCCESS('🎉 Production setup complete!'))