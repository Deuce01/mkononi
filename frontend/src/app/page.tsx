import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Briefcase, Users } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-12">
      <header className="space-y-4 mt-8">
        <h1 className="text-5xl font-headline font-bold text-primary tracking-tight">
          Connecting Skills with Opportunity
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Mkononi Connect is the leading platform in Africa for blue-collar jobs, linking skilled workers with employers through simple, accessible technology like USSD and WhatsApp.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <span className="text-2xl font-headline">For Workers</span>
            </CardTitle>
            <CardDescription>
              Find jobs that match your skills. Apply easily with your phone, no CV needed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
             <Button asChild className="w-full">
              <Link href="/jobs">
                Browse Jobs <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild className="w-full bg-accent hover:bg-accent/80 text-accent-foreground" variant="secondary">
              <Link href="/register-worker">
                Register as a Worker
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Briefcase className="h-8 w-8 text-primary" />
              <span className="text-2xl font-headline">For Employers</span>
            </CardTitle>
            <CardDescription>
              Post jobs and connect with a vast network of skilled and reliable workers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/employer">
                Post a Job <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="w-full max-w-4xl pt-8">
        <Card className="bg-primary-foreground/50">
            <CardHeader>
                <CardTitle className="text-center font-headline text-2xl">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="flex flex-col items-center space-y-2">
                    <div className="bg-primary text-primary-foreground rounded-full h-12 w-12 flex items-center justify-center font-bold text-xl">1</div>
                    <h3 className="font-semibold">Find a Job</h3>
                    <p className="text-sm text-muted-foreground">Workers browse and find jobs on our platform or via USSD.</p>
                </div>
                <div className="flex flex-col items-center space-y-2">
                    <div className="bg-primary text-primary-foreground rounded-full h-12 w-12 flex items-center justify-center font-bold text-xl">2</div>
                    <h3 className="font-semibold">Apply Simply</h3>
                    <p className="text-sm text-muted-foreground">Apply in seconds with just a phone number. No complex forms.</p>
                </div>
                <div className="flex flex-col items-center space-y-2">
                    <div className="bg-primary text-primary-foreground rounded-full h-12 w-12 flex items-center justify-center font-bold text-xl">3</div>
                    <h3 className="font-semibold">Get Hired</h3>
                    <p className="text-sm text-muted-foreground">Employers contact you directly to start working.</p>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
