'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import api from '@/lib/api';
import type { ApiJob } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, MapPin, DollarSign, Wrench, CheckCircle, Terminal } from 'lucide-react';
import JobApplicationForm from '@/components/job-application-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function JobDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [job, setJob] = useState<ApiJob | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchJob = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get(`/jobs/${id}/`);
        setJob(response.data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          notFound();
        }
        setError('Failed to fetch job details. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  if (isLoading) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4 mb-2" />
                        <Skeleton className="h-6 w-1/2 mb-4" />
                        <div className="flex flex-wrap gap-4 pt-4 text-sm">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-5 w-24" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-5/6" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-40" />
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </CardContent>
                </Card>
            </div>
            <div className="lg:sticky top-8">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-7 w-48 mb-2" />
                        <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardContent>
                         <div className="space-y-4">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
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

  if (!job) {
    return null;
  }
  
  const requirements = job.requirements || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <h1 className="text-3xl font-headline font-bold text-primary">{job.title}</h1>
            <p className="text-xl text-muted-foreground">{job.employer.name}</p>
            <div className="flex flex-wrap gap-4 pt-4 text-sm">
                <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {job.location}</span>
                <span className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary" /> {job.type}</span>
                <span className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /> KES {job.pay_rate.toLocaleString()} / day</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-base">{job.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5 text-primary" /> Required Skills</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {job.skills.map(skill => (
              <Badge key={skill.name} variant="default">{skill.name}</Badge>
            ))}
          </CardContent>
        </Card>

        {requirements.length > 0 && (
            <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary" /> Requirements</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2 list-disc list-inside">
                {requirements.map((req: string, index: number) => (
                    <li key={index}>{req}</li>
                ))}
                </ul>
            </CardContent>
            </Card>
        )}
      </div>

      <div className="lg:sticky top-8">
        <JobApplicationForm jobId={job.id} jobTitle={job.title} />
      </div>
    </div>
  );
}
