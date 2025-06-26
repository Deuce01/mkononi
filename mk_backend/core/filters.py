import django_filters
from .models import JobPosting, Application


class JobPostingFilter(django_filters.FilterSet):
    skills = django_filters.CharFilter(method='filter_skills')
    location = django_filters.CharFilter(field_name='location', lookup_expr='icontains')
    job_type = django_filters.ChoiceFilter(choices=JobPosting.JOB_TYPE_CHOICES)
    min_pay = django_filters.NumberFilter(field_name='pay_rate', lookup_expr='gte')
    max_pay = django_filters.NumberFilter(field_name='pay_rate', lookup_expr='lte')
    
    class Meta:
        model = JobPosting
        fields = ['location', 'job_type', 'is_open']
    
    def filter_skills(self, queryset, name, value):
        skills = [skill.strip() for skill in value.split(',')]
        for skill in skills:
            queryset = queryset.filter(required_skills__icontains=skill)
        return queryset


class ApplicationFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=Application.STATUS_CHOICES)
    channel = django_filters.ChoiceFilter(choices=Application.CHANNEL_CHOICES)
    
    class Meta:
        model = Application
        fields = ['status', 'channel']