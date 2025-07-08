"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { Application } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { applicationService } from "@/lib/api-service";

const statusColors = {
  Pending: "default",
  Accepted: "secondary",
  Rejected: "destructive",
} as const;

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await applicationService.getApplications();
        // Transform the API response to match the expected Application type
        const transformedApplications = response.results.map((app: any) => ({
          ...app,
          job: typeof app.job === 'number' 
            ? { id: app.job, title: app.job_title || '' } 
            : app.job
        }));
        setApplications(transformedApplications);
      } catch (err) {
        setError("Failed to fetch applications. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const handleStatusUpdate = async (
    id: number,
    status: "Accepted" | "Rejected"
  ) => {
    const originalApplications = [...applications];
    setApplications((apps) =>
      apps.map((app) => (app.id === id ? { ...app, status: status } : app))
    );

    try {
      await api.patch(`/applications/${id}/update_status/`, { status });
      toast({
        title: "Status Updated",
        description: `Application has been ${status.toLowerCase()}.`,
      });
    } catch (error) {
      setApplications(originalApplications);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description:
          "Could not update the application status. Please try again.",
      });
      console.error("Failed to update status", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-headline font-bold">Applications</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-60" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-32 mb-4" />
                <div className="flex justify-end gap-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-headline font-bold">Applications</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {applications.map((app) => (
          <Card key={app.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{app.worker.name}</CardTitle>
                  <CardDescription>
                    Applied for: {app.job.title}
                  </CardDescription>
                </div>
                <Badge variant={statusColors[app.status]}>{app.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {app.worker.phone_number}
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusUpdate(app.id, "Rejected")}
                >
                  Reject
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleStatusUpdate(app.id, "Accepted")}
                >
                  Accept
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {applications.length === 0 && (
          <p className="text-muted-foreground col-span-full text-center py-16">
            No applications received yet.
          </p>
        )}
      </div>
    </div>
  );
}
