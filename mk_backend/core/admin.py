from django.contrib import admin
from .models import WorkerProfile, Employer, JobPosting, Application, MatchScore


@admin.register(WorkerProfile)
class WorkerProfileAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'phone_number', 'location', 'experience_level', 'created_at']
    list_filter = ['experience_level', 'language_preference', 'created_at']
    search_fields = ['full_name', 'phone_number', 'location']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Employer)
class EmployerAdmin(admin.ModelAdmin):
    list_display = ['company_name', 'email', 'sector', 'verified', 'created_at']
    list_filter = ['sector', 'verified', 'created_at']
    search_fields = ['company_name', 'email']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display = ['title', 'employer', 'location', 'pay_rate', 'job_type', 'is_open', 'created_at']
    list_filter = ['job_type', 'is_open', 'created_at']
    search_fields = ['title', 'description', 'location']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ['worker', 'job', 'status', 'channel', 'applied_at']
    list_filter = ['status', 'channel', 'applied_at']
    search_fields = ['worker__full_name', 'job__title']
    readonly_fields = ['applied_at', 'updated_at']


@admin.register(MatchScore)
class MatchScoreAdmin(admin.ModelAdmin):
    list_display = ['worker', 'job', 'score', 'calculated_at']
    list_filter = ['calculated_at']
    search_fields = ['worker__full_name', 'job__title']
    readonly_fields = ['calculated_at']