from rest_framework import viewsets, status, permissions, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.core.cache import cache
from django.db.models import Prefetch
from .models import WorkerProfile, Employer, JobPosting, Application, MatchScore
from .serializers import (
    WorkerProfileSerializer, EmployerSerializer, JobPostingSerializer,
    JobPostingCreateSerializer, ApplicationSerializer, ApplicationCreateSerializer,
    MatchScoreSerializer
)
from .filters import JobPostingFilter, ApplicationFilter
from .matching import calculate_match_score


class WorkerProfileViewSet(viewsets.ModelViewSet):
    queryset = WorkerProfile.objects.all()
    serializer_class = WorkerProfileSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        # Allow access to all worker profiles for matching purposes
        return WorkerProfile.objects.all()


class EmployerViewSet(viewsets.ModelViewSet):
    queryset = Employer.objects.all()
    serializer_class = EmployerSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if hasattr(self.request.user, 'employer_profile'):
            return Employer.objects.filter(id=self.request.user.employer_profile.id)
        return Employer.objects.none()


class JobPostingViewSet(viewsets.ModelViewSet):
    queryset = JobPosting.objects.filter(is_open=True)
    serializer_class = JobPostingSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = JobPostingFilter
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['created_at', 'pay_rate']
    ordering = ['-created_at']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return JobPostingCreateSerializer
        return JobPostingSerializer
    
    def get_queryset(self):
        if self.action in ['list', 'retrieve']:
            return JobPosting.objects.filter(is_open=True)
        elif hasattr(self.request.user, 'employer_profile'):
            return JobPosting.objects.filter(employer=self.request.user.employer_profile)
        return JobPosting.objects.none()
    
    def perform_create(self, serializer):
        if hasattr(self.request.user, 'employer_profile'):
            serializer.save(employer=self.request.user.employer_profile)
        else:
            raise permissions.PermissionDenied("Only employers can create job postings.")
    
    @action(detail=True, methods=['get'])
    def matches(self, request, pk=None):
        """Get match scores for a specific job with caching"""
        job = self.get_object()
        cache_key = f'job_matches_{job.id}'
        
        # Check cache first
        matches = cache.get(cache_key)
        if matches is None:
            workers = WorkerProfile.objects.all()
            matches = []
            
            for worker in workers:
                score = calculate_match_score(worker, job)
                if score > 0.3:  # Only return matches above threshold
                    matches.append({
                        'worker_id': worker.id,
                        'worker_name': worker.full_name,
                        'score': score,
                        'phone': worker.phone_number
                    })
            
            matches.sort(key=lambda x: x['score'], reverse=True)
            matches = matches[:10]  # Top 10 matches
            
            # Cache for 15 minutes
            cache.set(cache_key, matches, 900)
        
        return Response(matches)


class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = ApplicationFilter
    ordering_fields = ['applied_at']
    ordering = ['-applied_at']
    
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ApplicationCreateSerializer
        return ApplicationSerializer
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'worker_profile'):
            return Application.objects.filter(worker=user.worker_profile)
        elif hasattr(user, 'employer_profile'):
            return Application.objects.filter(job__employer=user.employer_profile)
        return Application.objects.none()
    
    def perform_create(self, serializer):
        # Allow applications from workers via phone number lookup
        phone = self.request.data.get('worker_phone')
        if phone:
            try:
                worker = WorkerProfile.objects.get(phone_number=phone)
                serializer.save(worker=worker)
            except WorkerProfile.DoesNotExist:
                raise serializers.ValidationError("Worker not found")
        elif hasattr(self.request.user, 'worker_profile'):
            serializer.save(worker=self.request.user.worker_profile)
        else:
            raise permissions.PermissionDenied("Worker identification required.")
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update application status (for employers only)"""
        application = self.get_object()
        
        if not hasattr(request.user, 'employer_profile'):
            return Response({"error": "Only employers can update application status"}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        if application.job.employer != request.user.employer_profile:
            return Response({"error": "You can only update applications for your jobs"}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        new_status = request.data.get('status')
        if new_status not in ['pending', 'accepted', 'rejected']:
            return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
        
        application.status = new_status
        application.save()
        
        serializer = self.get_serializer(application)
        return Response(serializer.data)


class MatchScoreViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MatchScore.objects.all()
    serializer_class = MatchScoreSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'worker_profile'):
            return MatchScore.objects.filter(worker=user.worker_profile)
        elif hasattr(user, 'employer_profile'):
            return MatchScore.objects.filter(job__employer=user.employer_profile)
        return MatchScore.objects.none()