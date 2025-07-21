"use client";

import { useEffect, useState } from "react";
import { jobService } from "@/lib/api-service";
import type { JobPosting } from "@/lib/api-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreVertical, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

export default function EmployerDashboardPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/employer/login");
      return;
    }

    const fetchJobs = async () => {
      try {
        const response = await jobService.getMyJobs();
        setJobs(response.results);
      } catch (err: any) {
        if (err.response?.status === 401) {
          router.push("/employer/login");
        } else {
          setError("Failed to fetch jobs. Please try again later.");
        }
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [isAuthenticated, router]);

  const formatJobType = (type: string) => {
    switch (type) {
      case "full_time":
        return "Full-time";
      case "part_time":
        return "Part-time";
      case "contract":
        return "Contract";
      case "temporary":
        return "Temporary";
      default:
        return type;
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <TableBody>
          {[...Array(3)].map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-5 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-24" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-8 w-8 ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      );
    }

    if (error) {
      return (
        <TableBody>
          <TableRow>
            <TableCell colSpan={5}>
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </TableCell>
          </TableRow>
        </TableBody>
      );
    }

    if (jobs.length === 0) {
      return (
        <TableBody>
          <TableRow>
            <TableCell colSpan={5} className="text-center h-24">
              You haven&apos;t posted any jobs yet.
            </TableCell>
          </TableRow>
        </TableBody>
      );
    }

    return (
      <TableBody>
        {jobs.map((job) => (
          <TableRow key={job.id}>
            <TableCell className="font-medium">{job.title}</TableCell>
            <TableCell>
              <Badge variant="outline">{formatJobType(job.job_type)}</Badge>
            </TableCell>
            <TableCell>{job.applications_count || 0}</TableCell>
            <TableCell>
              {new Date(job.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Link
                      href={`/employer/dashboard/applications?job=${job.id}`}
                    >
                      View Applicants
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-headline font-bold">My Jobs</h1>
          {user && user.user_type === "employer" && (
            <p className="text-muted-foreground">
              Welcome back, {user.profile.company_name}
            </p>
          )}
        </div>
        <Button asChild>
          <Link href="/employer/dashboard/post-job">
            <PlusCircle className="mr-2 h-4 w-4" /> Post New Job
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Applicants</TableHead>
                <TableHead>Posted Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            {renderContent()}
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
