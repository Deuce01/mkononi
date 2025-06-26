from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import WorkerProfile, Employer, JobPosting, Application, MatchScore
from .matching import calculate_match_score


class ModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user('test', 'test@test.com', 'pass')
        self.employer_user = User.objects.create_user('emp', 'emp@test.com', 'pass')
        
    def test_worker_profile_creation(self):
        worker = WorkerProfile.objects.create(
            full_name='John Doe',
            phone_number='+254700123456',
            location='Nairobi',
            skills=['plumbing'],
            experience_level='intermediate'
        )
        self.assertEqual(str(worker), 'John Doe - +254700123456')
        
    def test_employer_creation(self):
        employer = Employer.objects.create(
            user=self.employer_user,
            company_name='TestCorp',
            email='test@corp.com',
            phone='+254700123456',
            sector='construction'
        )
        self.assertEqual(str(employer), 'TestCorp')
        
    def test_job_posting_creation(self):
        employer = Employer.objects.create(
            user=self.employer_user,
            company_name='TestCorp',
            email='test@corp.com',
            phone='+254700123456',
            sector='construction'
        )
        job = JobPosting.objects.create(
            title='Test Job',
            description='Test Description',
            location='Nairobi',
            employer=employer,
            pay_rate=2500.00,
            required_skills=['plumbing']
        )
        self.assertEqual(str(job), 'Test Job - TestCorp')
        
    def test_application_unique_constraint(self):
        worker = WorkerProfile.objects.create(
            full_name='John Doe',
            phone_number='+254700123456',
            location='Nairobi',
            skills=['plumbing']
        )
        employer = Employer.objects.create(
            user=self.employer_user,
            company_name='TestCorp',
            email='test@corp.com',
            phone='+254700123456',
            sector='construction'
        )
        job = JobPosting.objects.create(
            title='Test Job',
            description='Test Description',
            location='Nairobi',
            employer=employer,
            pay_rate=2500.00,
            required_skills=['plumbing']
        )
        
        Application.objects.create(job=job, worker=worker)
        
        with self.assertRaises(Exception):
            Application.objects.create(job=job, worker=worker)


class MatchingTests(TestCase):
    def setUp(self):
        self.worker = WorkerProfile.objects.create(
            full_name='John Doe',
            phone_number='+254700123456',
            location='Nairobi',
            skills=['plumbing', 'electrical'],
            experience_level='intermediate'
        )
        
        self.employer_user = User.objects.create_user('emp', 'emp@test.com', 'pass')
        self.employer = Employer.objects.create(
            user=self.employer_user,
            company_name='TestCorp',
            email='test@corp.com',
            phone='+254700123456',
            sector='construction'
        )
        
        self.job = JobPosting.objects.create(
            title='Plumber Job',
            description='Need plumber',
            location='Nairobi',
            employer=self.employer,
            pay_rate=2500.00,
            required_skills=['plumbing'],
            job_type='full_time'
        )
        
    def test_perfect_match(self):
        score = calculate_match_score(self.worker, self.job)
        self.assertGreater(score, 0.7)
        
    def test_no_skills_match(self):
        job = JobPosting.objects.create(
            title='Cook Job',
            description='Need cook',
            location='Nairobi',
            employer=self.employer,
            pay_rate=2000.00,
            required_skills=['cooking'],
            job_type='full_time'
        )
        score = calculate_match_score(self.worker, job)
        self.assertLess(score, 0.5)


class APITests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.employer_user = User.objects.create_user('emp', 'emp@test.com', 'pass')
        self.employer = Employer.objects.create(
            user=self.employer_user,
            company_name='TestCorp',
            email='test@corp.com',
            phone='+254700123456',
            sector='construction'
        )
        
        # Get JWT token
        refresh = RefreshToken.for_user(self.employer_user)
        self.token = str(refresh.access_token)
        
    def test_worker_registration_no_auth(self):
        url = reverse('workerprofile-list')
        data = {
            'full_name': 'John Doe',
            'phone_number': '+254700123456',
            'location': 'Nairobi',
            'skills': ['plumbing'],
            'experience_level': 'intermediate'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
    def test_job_listing_no_auth(self):
        JobPosting.objects.create(
            title='Test Job',
            description='Test Description',
            location='Nairobi',
            employer=self.employer,
            pay_rate=2500.00,
            required_skills=['plumbing']
        )
        
        url = reverse('jobposting-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        
    def test_job_creation_requires_auth(self):
        url = reverse('jobposting-list')
        data = {
            'title': 'New Job',
            'description': 'Job Description',
            'location': 'Nairobi',
            'pay_rate': 3000.00,
            'required_skills': ['electrical']
        }
        
        # Without auth
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # With auth
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
    def test_job_filtering(self):
        JobPosting.objects.create(
            title='Plumber Job',
            description='Need plumber',
            location='Nairobi',
            employer=self.employer,
            pay_rate=2500.00,
            required_skills=['plumbing']
        )
        JobPosting.objects.create(
            title='Electrician Job',
            description='Need electrician',
            location='Mombasa',
            employer=self.employer,
            pay_rate=3000.00,
            required_skills=['electrical']
        )
        
        url = reverse('jobposting-list')
        
        # Filter by skills
        response = self.client.get(f'{url}?skills=plumbing')
        self.assertEqual(len(response.data['results']), 1)
        
        # Filter by location
        response = self.client.get(f'{url}?location=Nairobi')
        self.assertEqual(len(response.data['results']), 1)
        
    def test_application_with_phone(self):
        worker = WorkerProfile.objects.create(
            full_name='John Doe',
            phone_number='+254700123456',
            location='Nairobi',
            skills=['plumbing']
        )
        job = JobPosting.objects.create(
            title='Test Job',
            description='Test Description',
            location='Nairobi',
            employer=self.employer,
            pay_rate=2500.00,
            required_skills=['plumbing']
        )
        
        url = reverse('application-list')
        data = {
            'job': job.id,
            'worker_phone': '+254700123456',
            'channel': 'whatsapp'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
    def test_job_matches_endpoint(self):
        worker = WorkerProfile.objects.create(
            full_name='John Doe',
            phone_number='+254700123456',
            location='Nairobi',
            skills=['plumbing']
        )
        job = JobPosting.objects.create(
            title='Plumber Job',
            description='Need plumber',
            location='Nairobi',
            employer=self.employer,
            pay_rate=2500.00,
            required_skills=['plumbing']
        )
        
        url = reverse('jobposting-matches', kwargs={'pk': job.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)


class WebhookTests(APITestCase):
    def test_whatsapp_webhook_register(self):
        url = reverse('whatsapp_webhook')
        data = {
            'From': 'whatsapp:+254700123456',
            'Body': 'register John Nairobi plumbing,electrical'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(WorkerProfile.objects.filter(phone_number='+254700123456').exists())
        
    def test_whatsapp_webhook_invalid_command(self):
        url = reverse('whatsapp_webhook')
        data = {
            'From': 'whatsapp:+254700123456',
            'Body': 'invalid command'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('Commands:', response.data['message'])
        
    def test_ussd_webhook_menu(self):
        url = reverse('ussd_webhook')
        data = {
            'sessionId': 'test_session',
            'phoneNumber': '+254700123456',
            'text': ''
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('CON Welcome', response.data['response'])
        
    def test_ussd_webhook_registration(self):
        url = reverse('ussd_webhook')
        data = {
            'sessionId': 'test_session',
            'phoneNumber': '+254700123456',
            'text': '1*John*Nairobi*plumbing'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('END Welcome', response.data['response'])
        self.assertTrue(WorkerProfile.objects.filter(phone_number='+254700123456').exists())