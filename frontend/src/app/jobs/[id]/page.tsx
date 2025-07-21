"use client";

import { useParams } from "next/navigation";
import { useJob } from "@/hooks/use-api";
import { utils } from "@/lib/api-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Wrench,
  CheckCircle,
  Terminal,
} from "lucide-react";
import JobApplicationForm from "@/components/job-application-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function JobDetailPage() {
  const params = useParams();
  const id = parseInt(params.id as string);

  const { job, loading: isLoading, error } = useJob(id);

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
    );
  }

  if (!job) {
    return null;
  }

  // Handle required_skills - convert to array if needed
  let skills: string[] = [];
  if (Array.isArray(job.required_skills)) {
    skills = job.required_skills;
  } else if (typeof job.required_skills === "string") {
    skills = job.required_skills.includes(",")
      ? job.required_skills.split(",").map((s) => s.trim())
      : [job.required_skills];
  }


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <h1 className="text-3xl font-headline font-bold text-primary">
              {job.title}
            </h1>
            <p className="text-xl text-muted-foreground">{job.employer_name}</p>
            <div className="flex flex-wrap gap-4 pt-4 text-sm">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> {job.location}
              </span>
              <span className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />{" "}
                {utils.formatJobType(job.job_type)}
              </span>
              <span className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />{" "}
                {utils.formatPayRate(job.pay_rate)} / day
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-base">{job.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" /> Required Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {skills.length > 0 ? (
              skills.map((skill, index) => (
                <Badge key={index} variant="default">
                  {skill}
                </Badge>
              ))
            ) : (
              <p className="text-muted-foreground">
                No specific skills required
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="lg:sticky top-8">
        <JobApplicationForm jobId={job.id} jobTitle={job.title} />
      </div>
    </div>
  );
}
