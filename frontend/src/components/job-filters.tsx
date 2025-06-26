'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter } from 'lucide-react';
import { Button } from './ui/button';

type Filters = {
  search: string;
  location: string;
  jobType: string;
  minPay: string;
};

type JobFiltersProps = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  locations: string[];
  jobTypes: string[];
};

export default function JobFilters({ filters, setFilters, locations, jobTypes }: JobFiltersProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (name: keyof Filters) => (value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value === 'all' ? '' : value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      location: '',
      jobType: '',
      minPay: '',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <span>Filter Jobs</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search">Search by Skill or Title</Label>
          <Input
            id="search"
            name="search"
            placeholder="e.g. Plumber, Carpentry..."
            value={filters.search}
            onChange={handleInputChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Select name="location" onValueChange={handleSelectChange('location')} value={filters.location}>
            <SelectTrigger>
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="jobType">Job Type</Label>
          <Select name="jobType" onValueChange={handleSelectChange('jobType')} value={filters.jobType}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
               <SelectItem value="all">All Types</SelectItem>
              {jobTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="minPay">Minimum Daily Pay (KES)</Label>
          <Input
            id="minPay"
            name="minPay"
            type="number"
            placeholder="e.g. 1500"
            value={filters.minPay}
            onChange={handleInputChange}
          />
        </div>
        <Button variant="ghost" onClick={clearFilters} className="w-full">
          Clear Filters
        </Button>
      </CardContent>
    </Card>
  );
}
