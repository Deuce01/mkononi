'use client';

import { useState, useMemo } from 'react';
import JobsDisplay from '@/components/jobs-display';
import { useJobs } from '@/hooks/use-api';
import { utils } from '@/lib/api-service';

export default function BrowseJobsPage() {
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    jobType: '',
    minPay: '',
  });

  // Create API parameters from filters
  const apiParams = useMemo(() => {
    const params: any = {};
    if (filters.search) params.search = filters.search;
    if (filters.location) params.location = filters.location;
    if (filters.jobType) params.job_type = filters.jobType;
    if (filters.minPay) params.min_pay = Number(filters.minPay);
    return params;
  }, [filters]);

  const { jobs: backendJobs, loading: isLoading, error, total } = useJobs(apiParams);

  const { uniqueLocations, uniqueJobTypes } = useMemo(() => {
    if (!backendJobs || backendJobs.length === 0) return { uniqueLocations: [], uniqueJobTypes: [] };
    const locations = [...new Set(backendJobs.map(job => job.location).filter(Boolean))];
    const jobTypes = [...new Set(backendJobs.map(job => utils.formatJobType(job.job_type)).filter(Boolean))];
    return { uniqueLocations: locations, uniqueJobTypes: jobTypes };
  }, [backendJobs]);

  // Map backend jobs to frontend format
  const mappedJobs = useMemo(() => {
    return backendJobs.map(job => {
      // Handle required_skills - it might be a string or array
      let skills: string[] = [];
      if (Array.isArray(job.required_skills)) {
        skills = job.required_skills;
      } else if (typeof job.required_skills === 'string') {
        // If it's a string, split by comma or treat as single skill
        skills = job.required_skills.includes(',') 
          ? job.required_skills.split(',').map(s => s.trim())
          : [job.required_skills];
      }

      return {
        id: job.id,
        title: job.title,
        company: job.employer_name,
        location: job.location,
        type: utils.formatJobType(job.job_type) as 'Full-time' | 'Part-time' | 'Contract',
        payRate: parseFloat(job.pay_rate),
        skills: skills,
        description: job.description,
        requirements: [] // You can add requirements field to backend model if needed
      };
    });
  }, [backendJobs]);

  return (
    <div className="space-y-8">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-headline font-bold text-primary">Find Your Next Opportunity</h1>
        <p className="text-lg text-muted-foreground">
          Browse through jobs from top companies and apply with just your phone number.
        </p>
      </header>
      
      <JobsDisplay 
        jobs={mappedJobs} 
        filters={filters}
        setFilters={setFilters}
        isLoading={isLoading}
        error={error}
        locations={uniqueLocations}
        jobTypes={uniqueJobTypes}
      />
    </div>
  );
}
