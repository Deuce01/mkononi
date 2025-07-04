import { useState, useEffect } from 'react';
import { 
  jobService, 
  workerService, 
  applicationService, 
  authService,
  JobPosting, 
  WorkerProfile, 
  Application,
  JobMatch
} from '../lib/api-service';

// Custom hook for fetching jobs
export function useJobs(params?: {
  skills?: string;
  location?: string;
  min_pay?: number;
  max_pay?: number;
  job_type?: string;
  search?: string;
}) {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await jobService.getJobs(params);
        setJobs(response.results);
        setTotal(response.count);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [JSON.stringify(params)]);

  return { jobs, loading, error, total, refetch: () => window.location.reload() };
}

// Custom hook for fetching single job
export function useJob(id: number) {
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const jobData = await jobService.getJob(id);
        setJob(jobData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch job');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJob();
    }
  }, [id]);

  return { job, loading, error };
}

// Custom hook for job matches
export function useJobMatches(jobId: number) {
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const matchData = await jobService.getJobMatches(jobId);
        setMatches(matchData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch matches');
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchMatches();
    }
  }, [jobId]);

  return { matches, loading, error };
}

// Custom hook for applications
export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await applicationService.getApplications();
        setApplications(response.results);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const updateStatus = async (id: number, status: 'pending' | 'accepted' | 'rejected') => {
    try {
      const updatedApp = await applicationService.updateApplicationStatus(id, status);
      setApplications(prev => 
        prev.map(app => app.id === id ? updatedApp : app)
      );
      return updatedApp;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update application');
    }
  };

  return { applications, loading, error, updateStatus };
}

// Custom hook for authentication
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('access_token');
      setIsAuthenticated(!!token);
      setLoading(false);
    };

    checkAuth();
    
    // Listen for storage changes (login/logout in other tabs)
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    try {
      await authService.login(credentials);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
  };

  return { isAuthenticated, loading, login, logout };
}

// Custom hook for creating jobs
export function useCreateJob() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createJob = async (jobData: Partial<JobPosting>) => {
    try {
      setLoading(true);
      setError(null);
      const newJob = await jobService.createJob(jobData);
      return newJob;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create job';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { createJob, loading, error };
}

// Custom hook for applying to jobs
export function useApplyToJob() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyToJob = async (jobId: number, workerPhone?: string) => {
    try {
      setLoading(true);
      setError(null);
      const application = await applicationService.createApplication({
        job: jobId,
        channel: 'web',
        worker_phone: workerPhone
      });
      return application;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to apply to job';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { applyToJob, loading, error };
}
