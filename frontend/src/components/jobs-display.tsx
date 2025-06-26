'use client';

import type { Job } from '@/lib/data';
import JobFilters from './job-filters';
import JobCard from './job-card';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Terminal } from 'lucide-react';

type Filters = {
  search: string;
  location: string;
  jobType: string;
  minPay: string;
};

type JobsDisplayProps = {
  jobs: Job[];
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  isLoading: boolean;
  error: string | null;
  locations: string[];
  jobTypes: string[];
};

export default function JobsDisplay({ jobs, filters, setFilters, isLoading, error, locations, jobTypes }: JobsDisplayProps) {
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
             <Card key={i} className="h-full flex flex-col">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="flex-grow space-y-3">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <div className="flex flex-wrap gap-1">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      );
    }
    
    if (error) {
        return (
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )
    }

    if (jobs.length > 0) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      );
    }

    return (
      <div className="text-center py-16 bg-card rounded-lg">
        <h3 className="text-xl font-semibold">No Jobs Found</h3>
        <p className="text-muted-foreground">Try adjusting your filters to find more opportunities.</p>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
      <aside className="col-span-1 md:sticky top-8">
        <JobFilters filters={filters} setFilters={setFilters} locations={locations} jobTypes={jobTypes} />
      </aside>
      <main className="col-span-1 md:col-span-3">
        {renderContent()}
      </main>
    </div>
  );
}
