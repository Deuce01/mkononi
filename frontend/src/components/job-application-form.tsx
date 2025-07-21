"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useApplyToJob } from "@/hooks/use-api";

interface JobApplicationFormProps {
  jobId: number;
  jobTitle: string;
  onSuccess?: () => void;
}

export default function JobApplicationForm({
  jobId,
  jobTitle,
  onSuccess,
}: JobApplicationFormProps) {
  const [phone, setPhone] = useState("");
  const { toast } = useToast();
  const { applyToJob, loading: isLoading } = useApplyToJob();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await applyToJob(jobId, phone);
      toast({
        title: "Application Submitted!",
        description: `Your application for ${jobTitle} has been submitted successfully.`,
      });

      setPhone("");
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Application Failed",
        description:
          error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apply for {jobTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+254700123456"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              Enter your phone number to apply. No CV required!
            </p>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Submitting..." : "Apply Now"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
