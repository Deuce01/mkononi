'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { applicationService } from '@/lib/api-service';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const applySchema = z.object({
  phone_number: z.string().min(10, 'Please enter a valid phone number.'),
});

type ApplyFormValues = z.infer<typeof applySchema>;

export default function ApplyForm({ jobId }: { jobId: number }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<ApplyFormValues>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      phone_number: '',
    },
  });

  const onSubmit = async (data: ApplyFormValues) => {
    setIsLoading(true);
    try {
      await applicationService.createApplication({
        job: jobId,
        worker_phone: data.phone_number,
        channel: 'web',
      });
      setIsDialogOpen(true);
      form.reset();
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Application Failed',
        description: error.response?.data?.detail || 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <Card className="bg-primary-foreground">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">Ready to Apply?</CardTitle>
          <CardDescription>Enter your phone number to submit your application.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="e.g. 0712345678"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-accent hover:bg-accent/80 text-accent-foreground" disabled={isLoading}>
                {isLoading ? 'Applying...' : 'Apply Now'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Application Submitted!</AlertDialogTitle>
            <AlertDialogDescription>
              Your application has been received. The employer will contact you if you are a good fit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsDialogOpen(false)}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
