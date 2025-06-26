'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import JobsDisplay from '@/components/jobs-display';
import api from '@/lib/api';
import type { ApiJob } from '@/lib/data';

export default function BrowseJobsPage() {
  const [allJobs, setAllJobs] = useState<ApiJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    jobType: '',
    minPay: '',
  });

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('skills', filters.search);
      if (filters.location) params.append('location', filters.location);
      if (filters.jobType) params.append('job_type', filters.jobType);
      if (filters.minPay) params.append('min_pay', filters.minPay);

      const response = await api.get('/jobs/', { params });
      setAllJobs(response.data);
    } catch (err) {
      setError('Failed to fetch jobs. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchJobs]);

  const { uniqueLocations, uniqueJobTypes } = useMemo(() => {
    if (!allJobs || allJobs.length === 0) return { uniqueLocations: [], uniqueJobTypes: [] };
    const locations = [...new Set(allJobs.map(job => job.location).filter(Boolean))];
    const jobTypes = [...new Set(allJobs.map(job => job.type).filter(Boolean))];
    return { uniqueLocations: locations, uniqueJobTypes: jobTypes };
  }, [allJobs]);

  const mappedJobs = useMemo(() => {
    return allJobs.map(job => ({
        id: job.id,
        title: job.title,
        company: job.employer.name,
        location: job.location,
        type: job.type,
        payRate: job.pay_rate,
        skills: job.skills.map(s => s.name),
        description: job.description,
        requirements: job.requirements || []
    }));
  }, [allJobs]);

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
