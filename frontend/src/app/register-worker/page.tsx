'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { experienceLevels, jobTypes } from '@/lib/data';
import { Checkbox } from '@/components/ui/checkbox';

// Assuming a static list of skills for now. In a real app, this might be fetched.
const allSkills = [
  'Plumbing', 'Pipe fitting', 'Leak detection', 'Electrical wiring', 'Circuit installation',
  'Troubleshooting', 'Carpentry', 'Woodworking', 'Furniture assembly', 'Logistics',
  'Supply chain', 'Record keeping', 'Welding', 'Metal fabrication', 'Grinding',
  'Painting', 'Repairs', 'Maintenance'
];

const workerSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  phone_number: z.string().min(10, 'Please enter a valid phone number'),
  location: z.string().min(1, 'Location is required'),
  experience_level: z.string().min(1, 'Please select your experience level'),
  skills: z.array(z.string()).min(1, 'Please select at least one skill'),
  preferred_job_types: z.array(z.string()).min(1, 'Please select at least one job type'),
});

type WorkerFormValues = z.infer<typeof workerSchema>;

export default function RegisterWorkerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<WorkerFormValues>({
    resolver: zodResolver(workerSchema),
    defaultValues: {
      name: '',
      phone_number: '',
      location: '',
      experience_level: '',
      skills: [],
      preferred_job_types: [],
    },
  });

  const onSubmit = async (data: WorkerFormValues) => {
    setIsLoading(true);
    try {
      await api.post('/workers/register/', data);
      toast({
        title: 'Registration Successful',
        description: `Welcome, ${data.name}! You can now browse and apply for jobs.`,
      });
      router.push('/jobs');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error.response?.data?.detail || 'An unexpected error occurred. Please try again.',
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
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input placeholder="e.g. Juma Otieno" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone_number" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (WhatsApp)</FormLabel>
                    <FormControl><Input type="tel" placeholder="e.g. 0712345678" {...field} /></FormControl>
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
                          <SelectItem key={level} value={level}>{level}</SelectItem>
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

              <FormField
                control={form.control}
                name="preferred_job_types"
                render={() => (
                  <FormItem>
                    <FormLabel>Preferred Job Types</FormLabel>
                     <div className="flex items-center gap-8 rounded-md border p-4">
                        {jobTypes.map((item) => (
                            <FormField
                            key={item}
                            control={form.control}
                            name="preferred_job_types"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                    checked={field.value?.includes(item)}
                                    onCheckedChange={(checked) => {
                                        return checked
                                        ? field.onChange([...(field.value || []), item])
                                        : field.onChange(
                                            field.value?.filter(
                                                (value) => value !== item
                                            )
                                            );
                                    }}
                                    />
                                </FormControl>
                                <FormLabel className="font-normal">
                                    {item}
                                </FormLabel>
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
