from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


class WorkerProfile(models.Model):
    EXPERIENCE_CHOICES = [
        ('entry', 'Entry Level'),
        ('intermediate', 'Intermediate'),
        ('experienced', 'Experienced'),
        ('expert', 'Expert'),
    ]
    
    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('sw', 'Swahili'),
        ('fr', 'French'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='worker_profile', null=True, blank=True)
    full_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15, unique=True)
    location = models.CharField(max_length=100)
    skills = models.JSONField(default=list)
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE_CHOICES, default='entry')
    language_preference = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, default='en')
    preferred_job_types = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.full_name} - {self.phone_number}"


class Employer(models.Model):
    SECTOR_CHOICES = [
        ('construction', 'Construction'),
        ('hospitality', 'Hospitality'),
        ('retail', 'Retail'),
        ('manufacturing', 'Manufacturing'),
        ('agriculture', 'Agriculture'),
        ('transport', 'Transport'),
        ('other', 'Other'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employer_profile')
    company_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    sector = models.CharField(max_length=20, choices=SECTOR_CHOICES)
    verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.company_name


class JobPosting(models.Model):
    JOB_TYPE_CHOICES = [
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
        ('contract', 'Contract'),
        ('temporary', 'Temporary'),
    ]

    title = models.CharField(max_length=100)
    description = models.TextField()
    location = models.CharField(max_length=100)
    employer = models.ForeignKey(Employer, on_delete=models.CASCADE, related_name='job_postings')
    pay_rate = models.DecimalField(max_digits=10, decimal_places=2)
    required_skills = models.JSONField(default=list)
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES, default='full_time')
    is_open = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.employer.company_name}"


class Application(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]
    
    CHANNEL_CHOICES = [
        ('whatsapp', 'WhatsApp'),
        ('ussd', 'USSD'),
        ('web', 'Web'),
    ]

    job = models.ForeignKey(JobPosting, on_delete=models.CASCADE, related_name='applications')
    worker = models.ForeignKey(WorkerProfile, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES, default='web')
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['job', 'worker']
        ordering = ['-applied_at']

    def __str__(self):
        return f"{self.worker.full_name} -> {self.job.title}"


class MatchScore(models.Model):
    worker = models.ForeignKey(WorkerProfile, on_delete=models.CASCADE, related_name='match_scores')
    job = models.ForeignKey(JobPosting, on_delete=models.CASCADE, related_name='match_scores')
    score = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(1.0)])
    calculated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['worker', 'job']
        ordering = ['-score']

    def __str__(self):
        return f"{self.worker.full_name} -> {self.job.title}: {self.score:.2f}"