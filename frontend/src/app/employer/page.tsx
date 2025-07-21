"use client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EmployerPage() {
  const [isChecking, setIsChecking] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // small delay to prevent flash of content
    const timer = setTimeout(() => {
      if (isAuthenticated && user?.user_type === "employer") {
        router.push("/employer/dashboard");
        return;
      }
      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, router]);

  if (isChecking || (isAuthenticated && user?.user_type === "employer")) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  console.log(user?.user_type);
  
  // Show different content based on auth state
  if (isAuthenticated && user?.user_type !== "employer") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-6">
        <h2 className="text-2xl font-bold text-muted-foreground">
          Access Restricted
        </h2>
        <p className="text-muted-foreground">
          This area is for employers only. You're logged in as a {user?.user_type}.
        </p>
        <Button asChild variant="outline">
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    );
  }

  // Main employer landing page content
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-8 px-4">
      <header className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary tracking-tight">
          Hire Skilled Workers, Fast
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Access a pool of vetted, reliable blue-collar professionals. Post
          jobs and manage applications all in one place.
        </p>
      </header>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          asChild
          size="lg"
          className="bg-accent hover:bg-accent/80 text-accent-foreground"
        >
          <Link href="/employer/login">
            Login as Employer <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/employer/register">Register as Employer</Link>
        </Button>
      </div>

      {/* Additional features section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl">
        <div className="text-center space-y-2">
          <h3 className="font-semibold">Post Jobs Instantly</h3>
          <p className="text-sm text-muted-foreground">
            Create job listings in minutes with our simple form
          </p>
        </div>
        <div className="text-center space-y-2">
          <h3 className="font-semibold">Phone-Based Applications</h3>
          <p className="text-sm text-muted-foreground">
            Workers apply with just their phone number - no CV required
          </p>
        </div>
        <div className="text-center space-y-2">
          <h3 className="font-semibold">AI-Powered Matching</h3>
          <p className="text-sm text-muted-foreground">
            Get matched with the most suitable candidates automatically
          </p>
        </div>
      </div>
    </div>
  );
}
