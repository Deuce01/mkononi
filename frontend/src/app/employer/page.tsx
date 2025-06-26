import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function EmployerPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8">
      <header className="space-y-4 mt-8">
        <h1 className="text-5xl font-headline font-bold text-primary tracking-tight">
          Hire Skilled Workers, Fast
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Access a pool of vetted, reliable blue-collar professionals. Post jobs and manage applications all in one place.
        </p>
      </header>

      <div className="flex gap-4">
        <Button asChild size="lg" className="bg-accent hover:bg-accent/80 text-accent-foreground">
          <Link href="/employer/login">
            Login as Employer <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/employer/register">
            Register as Employer
          </Link>
        </Button>
      </div>
    </div>
  );
}
