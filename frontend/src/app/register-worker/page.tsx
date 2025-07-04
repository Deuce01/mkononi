'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/lib/api-service';

// Skills available for workers
const allSkills = [
  'Plumbing', 'Pipe fitting', 'Leak detection', 'Electrical wiring', 'Circuit installation',
  'Troubleshooting', 'Carpentry', 'Woodworking', 'Furniture assembly', 'Logistics',
  'Supply chain', 'Record keeping', 'Welding', 'Metal fabrication', 'Grinding',
  'Painting', 'Repairs', 'Maintenance'
];

// Experience levels that match backend choices
const experienceLevels = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'experienced', label: 'Experienced' },
  { value: 'expert', label: 'Expert' }
];

// Schema that matches the backend WorkerRegistration interface
const workerSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  phone_number: z.string().min(10, 'Please enter a valid phone number'),
  location: z.string().min(1, 'Location is required'),
  experience_level: z.enum(['entry', 'intermediate', 'experienced', 'expert']),
  skills: z.array(z.string()).min(1, 'Please select at least one skill'),
});

type WorkerFormValues = z.infer<typeof workerSchema>;

export default function RegisterWorkerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<WorkerFormValues>({
    resolver: zodResolver(workerSchema),
    defaultValues: {
      full_name: '',
      phone_number: '',
      location: '',
      experience_level: 'entry',
      skills: [],
    },
  });

  const onSubmit = async (data: WorkerFormValues) => {
    setIsLoading(true);
    try {
      const response = await authService.registerWorker(data);
      toast({
        title: 'Registration Successful',
        description: `Welcome, ${data.full_name}! You can now browse and apply for jobs.`,
      });
      router.push('/jobs');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error.response?.data?.error || 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-8">
       <header className="text-center space-y-2">
        <h1 className="text-4xl font-headline font-bold text-primary">Join Mkononi Connect</h1>
        <p className="text-lg text-muted-foreground">
          Create your worker profile to get matched with great jobs.
        </p>
      </header>

      <Card className="w-full max-w-2xl">
        <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>This information helps us find the best jobs for you.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="full_name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input placeholder="e.g. Juma Otieno" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone_number" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (WhatsApp)</FormLabel>
                    <FormControl><Input type="tel" placeholder="e.g. +254712345678" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Location</FormLabel>
                    <FormControl><Input placeholder="e.g. Nairobi" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="experience_level" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select your experience level" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {experienceLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField
                control={form.control}
                name="skills"
                render={() => (
                  <FormItem>
                    <FormLabel>Your Skills</FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 rounded-md border p-4 max-h-60 overflow-y-auto">
                      {allSkills.map((skill) => (
                        <FormField
                          key={skill}
                          control={form.control}
                          name="skills"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(skill)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), skill])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== skill
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">{skill}</FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" size="lg" disabled={isLoading}>
                  {isLoading ? 'Submitting...' : 'Complete Registration'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
