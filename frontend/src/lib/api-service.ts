import api from "./api";

// Types that match the backend API structure
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface WorkerProfile {
  id: number;
  user: User;
  full_name: string;
  phone_number: string;
  location: string;
  skills: string[];
  experience_level: "entry" | "intermediate" | "experienced" | "expert";
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Employer {
  id: number;
  user: User;
  company_name: string;
  email: string;
  phone: string;
  sector: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobPosting {
  id: number;
  title: string;
  description: string;
  location: string;
  pay_rate: string;
  required_skills: string[] | string; // Can be either array or string from backend
  job_type: "full_time" | "part_time" | "contract";
  is_open: boolean;
  employer: number;
  employer_name: string;
  applications_count: number;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: number;
  worker: number;
  job: number;
  worker_name: string;
  job_title: string;
  employer_name: string;
  status: "pending" | "accepted" | "rejected";
  channel: "web" | "whatsapp" | "ussd";
  applied_at: string;
  updated_at: string;
}

export interface MatchScore {
  id: number;
  worker: number;
  job: number;
  worker_name: string;
  job_title: string;
  score: number;
  calculated_at: string;
}

export interface JobMatch {
  worker_id: number;
  worker_name: string;
  score: number;
  phone: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface WorkerRegistration {
  phone_number: string;
  full_name: string;
  location: string;
  skills: string[];
  experience_level?: "entry" | "intermediate" | "experienced" | "expert";
}

export interface EmployerRegistration {
  username: string;
  email: string;
  password: string;
  company_name: string;
  phone: string;
  sector: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
}

// API Service functions
export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post("/auth/token/", credentials);
    return response.data;
  },

  async loginWorker(
    phoneNumber: String
  ): Promise<{ worker: WorkerProfile; tokens: AuthResponse }> {
    const response = await api.post("/auth/login/worker/", {
      phone_number: phoneNumber,
    });
    // Store tokens
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", response.data.tokens.access);
      localStorage.setItem("refresh_token", response.data.tokens.refresh);
    }
    return response.data;
  },

  async loginEmployer(
    email: string,
    password: string
  ): Promise<{ employer: Employer; tokens: AuthResponse }> {
    const response = await api.post("/auth/login/employer/", {
      email,
      password,
    });
    // Store tokens
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", response.data.tokens.access);
      localStorage.setItem("refresh_token", response.data.tokens.refresh);
    }
    return response.data;
  },

  async registerWorker(
    data: WorkerRegistration
  ): Promise<{ worker: WorkerProfile; tokens: AuthResponse }> {
    const response = await api.post("/auth/register/worker/", data);
    // Store tokens
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", response.data.tokens.access);
      localStorage.setItem("refresh_token", response.data.tokens.refresh);
    }
    return response.data;
  },

  async registerEmployer(
    data: EmployerRegistration
  ): Promise<{ employer: Employer; tokens: AuthResponse }> {
    const response = await api.post("/auth/register/employer/", data);
    // Store tokens
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", response.data.tokens.access);
      localStorage.setItem("refresh_token", response.data.tokens.refresh);
    }
    return response.data;
  },

  async getUserProfile(): Promise<{
    user_type: "worker" | "employer" | "admin";
    profile: any;
  }> {
    const response = await api.get("/auth/profile/");
    return response.data;
  },

  async refreshToken(refresh: string): Promise<{ access: string }> {
    const response = await api.post("/auth/token/refresh/", { refresh });
    return response.data;
  },

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
  },

  isAuthenticated(): boolean {
    if (typeof window === "undefined") {
      return false; // Return false during SSR
    }
    return !!localStorage.getItem("access_token");
  },
};

export const jobService = {
  async getJobs(params?: {
    skills?: string;
    location?: string;
    min_pay?: number;
    max_pay?: number;
    job_type?: string;
    search?: string;
  }): Promise<{ count: number; results: JobPosting[] }> {
    const response = await api.get("/jobs/", { params });
    return response.data;
  },

  async getJob(id: number): Promise<JobPosting> {
    const response = await api.get(`/jobs/${id}/`);
    return response.data;
  },

  async createJob(job: Partial<JobPosting>): Promise<JobPosting> {
    const response = await api.post("/jobs/", job);
    return response.data;
  },

  async updateJob(id: number, job: Partial<JobPosting>): Promise<JobPosting> {
    const response = await api.put(`/jobs/${id}/`, job);
    return response.data;
  },

  async deleteJob(id: number): Promise<void> {
    await api.delete(`/jobs/${id}/`);
  },

  async getJobMatches(jobId: number): Promise<JobMatch[]> {
    const response = await api.get(`/jobs/${jobId}/matches/`);
    return response.data;
  },

  async getMyJobs(): Promise<{ count: number; results: JobPosting[] }> {
    const response = await api.get("/jobs/my_jobs/");
    return response.data;
  },
};

export const workerService = {
  async getWorkers(): Promise<{ count: number; results: WorkerProfile[] }> {
    const response = await api.get("/workers/");
    return response.data;
  },

  async getWorker(id: number): Promise<WorkerProfile> {
    const response = await api.get(`/workers/${id}/`);
    return response.data;
  },

  async createWorker(worker: Partial<WorkerProfile>): Promise<WorkerProfile> {
    const response = await api.post("/workers/", worker);
    return response.data;
  },

  async updateWorker(
    id: number,
    worker: Partial<WorkerProfile>
  ): Promise<WorkerProfile> {
    const response = await api.put(`/workers/${id}/`, worker);
    return response.data;
  },
};

export const employerService = {
  async getEmployers(): Promise<{ count: number; results: Employer[] }> {
    const response = await api.get("/employers/");
    return response.data;
  },

  async getEmployer(id: number): Promise<Employer> {
    const response = await api.get(`/employers/${id}/`);
    return response.data;
  },

  async createEmployer(employer: Partial<Employer>): Promise<Employer> {
    const response = await api.post("/employers/", employer);
    return response.data;
  },

  async updateEmployer(
    id: number,
    employer: Partial<Employer>
  ): Promise<Employer> {
    const response = await api.put(`/employers/${id}/`, employer);
    return response.data;
  },
};

export const applicationService = {
  async getApplications(): Promise<{ count: number; results: Application[] }> {
    const response = await api.get("/applications/");
    return response.data;
  },

  async getApplication(id: number): Promise<Application> {
    const response = await api.get(`/applications/${id}/`);
    return response.data;
  },

  async createApplication(application: {
    job: number;
    channel?: "web" | "whatsapp" | "ussd";
    worker_phone?: string;
  }): Promise<Application> {
    const response = await api.post("/applications/", application);
    return response.data;
  },

  async updateApplicationStatus(
    id: number,
    status: "pending" | "accepted" | "rejected"
  ): Promise<Application> {
    const response = await api.patch(`/applications/${id}/update_status/`, {
      status,
    });
    return response.data;
  },
};

export const matchService = {
  async getMatches(): Promise<{ count: number; results: MatchScore[] }> {
    const response = await api.get("/matches/");
    return response.data;
  },
};

// Utility functions
export const utils = {
  formatJobType(type: string): string {
    switch (type) {
      case "full_time":
        return "Full-time";
      case "part_time":
        return "Part-time";
      case "contract":
        return "Contract";
      default:
        return type;
    }
  },

  formatStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  },

  formatPayRate(payRate: string | number): string {
    const rate = typeof payRate === "string" ? parseFloat(payRate) : payRate;
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(rate);
  },
};
