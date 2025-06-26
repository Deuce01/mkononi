export type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract';
  payRate: number;
  skills: string[];
  description: string;
  requirements: string[];
};

export const jobTypes: ReadonlyArray<'Full-time' | 'Part-time' | 'Contract'> = ['Full-time', 'Part-time', 'Contract'];
export const experienceLevels = ['Entry-Level', 'Intermediate', 'Experienced', 'Expert'];


// --- API response types ---

export type ApiJob = {
  id: number;
  title: string;
  description: string;
  location: string;
  pay_rate: number;
  type: 'Full-time' | 'Part-time' | 'Contract';
  skills: { name: string }[];
  employer: {
      name: string;
  };
  requirements: string[];
};

export type EmployerJob = {
    id: number;
    title: string;
    type: 'Full-time' | 'Part-time' | 'Contract';
    applicants_count: number;
    posted_date: string;
};

export type Application = {
    id: number;
    job: {
        id: number;
        title: string;
    };
    worker: {
        id: number;
        name: string;
        phone_number: string;
    }
    status: 'Pending' | 'Accepted' | 'Rejected';
};
