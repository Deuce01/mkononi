from rest_framework import serializers
from django.contrib.auth.models import User
from .models import WorkerProfile, Employer, JobPosting, Application, MatchScore


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class WorkerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = WorkerProfile
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class EmployerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Employer
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'verified']


class JobPostingSerializer(serializers.ModelSerializer):
    employer_name = serializers.CharField(source='employer.company_name', read_only=True)
    applications_count = serializers.SerializerMethodField()
    
    class Meta:
        model = JobPosting
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def get_applications_count(self, obj):
        return obj.applications.count()


class JobPostingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPosting
        exclude = ['employer']
        read_only_fields = ['created_at', 'updated_at']


class ApplicationSerializer(serializers.ModelSerializer):
    worker_name = serializers.CharField(source='worker.full_name', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    employer_name = serializers.CharField(source='job.employer.company_name', read_only=True)
    
    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = ['applied_at', 'updated_at']


class ApplicationCreateSerializer(serializers.ModelSerializer):
    worker_phone = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Application
        fields = ['job', 'channel', 'worker_phone']
        
    def validate(self, data):
        job = data['job']
        worker = None
        
        # Get worker from phone or authenticated user
        if 'worker_phone' in data:
            try:
                worker = WorkerProfile.objects.get(phone_number=data['worker_phone'])
            except WorkerProfile.DoesNotExist:
                raise serializers.ValidationError("Worker not found with this phone number.")
        elif hasattr(self.context['request'].user, 'worker_profile'):
            worker = self.context['request'].user.worker_profile
        else:
            raise serializers.ValidationError("Worker identification required.")
        
        if Application.objects.filter(worker=worker, job=job).exists():
            raise serializers.ValidationError("You have already applied to this job.")
        
        if not job.is_open:
            raise serializers.ValidationError("This job is no longer accepting applications.")
        
        # Store worker in context for perform_create to use
        self.context['worker'] = worker
        
        # Remove worker_phone from data since it's not a model field
        if 'worker_phone' in data:
            del data['worker_phone']
            
        return data


class MatchScoreSerializer(serializers.ModelSerializer):
    worker_name = serializers.CharField(source='worker.full_name', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    
    class Meta:
        model = MatchScore
        fields = '__all__'
        read_only_fields = ['calculated_at']