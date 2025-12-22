import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send, Briefcase, User, Building2 } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

export default function AddApplication() {
  const navigate = useNavigate();
  const { jobs, candidates, fetchApplications } = useData();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    candidate_id: '',
    job_id: '',
    status: 'Applied',
    sourced_by: '',
    sourced_from: '',
    applied_on: new Date().toISOString().split('T')[0],
  });

  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [showCandidateSuggestions, setShowCandidateSuggestions] = useState(false);
  const [showJobSuggestions, setShowJobSuggestions] = useState(false);

  useEffect(() => {
    if (formData.candidate_id) {
      const candidate = candidates.find(c => c.id === parseInt(formData.candidate_id));
      setSelectedCandidate(candidate);
    }
  }, [formData.candidate_id, candidates]);

  useEffect(() => {
    if (formData.job_id) {
      const job = jobs.find(j => j.id === parseInt(formData.job_id));
      setSelectedJob(job);
    }
  }, [formData.job_id, jobs]);

  // Get candidate names for autocomplete
  const candidateNames = useMemo(() => {
    return candidates.map(c => c.full_name).filter(Boolean);
  }, [candidates]);

  // Get job data for autocomplete (combined format)
  const jobOptions = useMemo(() => {
    return jobs.map(j => ({
      id: j.id,
      title: j.job_title,
      company: j.company_name || '',
      combined: `${j.job_title} - ${j.company_name || 'No Company'}`,
      searchText: `${j.job_title} ${j.company_name || ''}`.toLowerCase()
    })).filter(j => j.title);
  }, [jobs]);

  // Show candidate dropdown only when there are matches
  const showCandidateDropdown = useMemo(() => {
    if (!candidateName || candidateName.trim().length === 0) return false;
    return candidateNames.some(name => 
      name.toLowerCase().includes(candidateName.toLowerCase())
    );
  }, [candidateName, candidateNames]);

  // Show job dropdown only when there are matches
  const showJobDropdown = useMemo(() => {
    if (!jobTitle || jobTitle.trim().length === 0) return false;
    const searchLower = jobTitle.toLowerCase();
    return jobOptions.some(job => job.searchText.includes(searchLower));
  }, [jobTitle, jobOptions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!candidateName.trim()) {
      toast({
        title: "Error",
        description: "Please select a candidate from the list",
        variant: "destructive",
      });
      return;
    }

    if (!jobTitle.trim()) {
      toast({
        title: "Error",
        description: "Please select a job from the list",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Extract job title and company from combined format if present
      let extractedJobTitle = jobTitle.trim();
      let extractedCompany = '';
      
      if (jobTitle.includes(' - ')) {
        const parts = jobTitle.split(' - ');
        extractedJobTitle = parts[0].trim();
        extractedCompany = parts[1]?.trim() || '';
      }

      // Find matching candidate and job - MUST exist
      const matchingCandidate = candidates.find(c => 
        c.full_name.toLowerCase() === candidateName.toLowerCase()
      );
      const matchingJob = jobs.find(j => 
        j.job_title.toLowerCase() === extractedJobTitle.toLowerCase() &&
        (extractedCompany ? (j.company_name?.toLowerCase() === extractedCompany.toLowerCase()) : true)
      );

      // Validate that both candidate and job exist
      if (!matchingCandidate) {
        toast({
          title: "Error",
          description: "Please select a valid candidate from the existing list",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!matchingJob) {
        toast({
          title: "Error",
          description: "Please select a valid job from the existing list",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const payload = {
        candidate_id: matchingCandidate.id,
        job_id: matchingJob.id,
        candidate_name: matchingCandidate.full_name,
        job_title: matchingJob.job_title,
        company: matchingJob.company_name || '',
        status: 'Applied',
        sourced_by: formData.sourced_by || null,
        sourced_from: formData.sourced_from || null,
        applied_on: formData.applied_on || null,
      };

      const res = await fetch(API_ENDPOINTS.APPLICATIONS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Failed to create application');
      }

      await fetchApplications();

      toast({
        title: "Success",
        description: "Application created successfully!",
      });

      setTimeout(() => navigate('/applications'), 500);
    } catch (err: any) {
      console.error('Error creating application:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to create application",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Add New Application
          </h1>
          <p className="text-muted-foreground mt-1">Create a new job application for a candidate</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/applications')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Applications
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-600" />
              Application Details
            </CardTitle>
            <CardDescription>Select candidate and job position</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Candidate Selection */}
            <div className="space-y-3">
              <Label htmlFor="candidate_name" className="flex items-center gap-2">
                <User className="h-4 w-4 text-green-600" />
                Candidate Name *
              </Label>
              
              <div className="relative">
                <Input
                  id="candidate_name"
                  placeholder="Search and select existing candidate..."
                  value={candidateName}
                  onChange={(e) => {
                    setCandidateName(e.target.value);
                    setShowCandidateSuggestions(true);
                  }}
                  onFocus={() => candidateName && setShowCandidateSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowCandidateSuggestions(false), 200)}
                  autoComplete="off"
                  className="border-green-300 focus:border-green-500"
                />
                {showCandidateSuggestions && showCandidateDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-green-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {candidateNames
                      .filter(name => name.toLowerCase().includes(candidateName.toLowerCase()))
                      .slice(0, 8)
                      .map((name, idx) => (
                        <div
                          key={idx}
                          className="px-4 py-2.5 hover:bg-green-100 dark:hover:bg-green-900 cursor-pointer text-sm border-b border-green-100 last:border-0"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setCandidateName(name);
                            setShowCandidateSuggestions(false);
                          }}
                        >
                          {name}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Job Selection */}
            <div className="space-y-3">
              <Label htmlFor="job_title" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-600" />
                Job Position *
              </Label>
              
              <div className="relative">
                <Input
                  id="job_title"
                  placeholder="Search and select existing job position..."
                  value={jobTitle}
                  onChange={(e) => {
                    setJobTitle(e.target.value);
                    setShowJobSuggestions(true);
                  }}
                  onFocus={() => jobTitle && setShowJobSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowJobSuggestions(false), 200)}
                  autoComplete="off"
                  className="border-blue-300 focus:border-blue-500"
                />
                {showJobSuggestions && showJobDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-blue-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {jobOptions
                      .filter(job => job.searchText.includes(jobTitle.toLowerCase()))
                      .slice(0, 8)
                      .map((job, idx) => (
                        <div
                          key={idx}
                          className="px-4 py-2.5 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer border-b border-blue-100 last:border-0"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setJobTitle(job.combined);
                            setShowJobSuggestions(false);
                          }}
                        >
                          <div className="font-medium text-sm">{job.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">📍 {job.company}</div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Status - Hidden, defaults to Applied */}
            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200">
              <p className="text-sm">
                <span className="font-semibold">Application Status:</span> Applied (Default)
              </p>
            </div>

            {/* Source Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sourced_by">Assigned To</Label>
                <Select
                  value={formData.sourced_by}
                  onValueChange={(value) => setFormData({ ...formData, sourced_by: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Assigned To" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Muni Divya">Muni Divya</SelectItem>
                    <SelectItem value="Surya K">Surya K</SelectItem>
                    <SelectItem value="Thameem Ansari">Thameem Ansari</SelectItem>
                    <SelectItem value="Nandhini Kumaravel">Nandhini Kumaravel</SelectItem>
                    <SelectItem value="Dhivya V">Dhivya V</SelectItem>
                    <SelectItem value="Gokulakrishna V">Gokulakrishna V</SelectItem>
                    <SelectItem value="Snehal Prakash">Snehal Prakash</SelectItem>
                    <SelectItem value="Selvaraj Veilumuthu">Selvaraj Veilumuthu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sourced_from">Sourced From</Label>
                <Select
                  value={formData.sourced_from}
                  onValueChange={(value) => setFormData({ ...formData, sourced_from: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Linked-in">Linked-in</SelectItem>
                    <SelectItem value="Job hai">Job hai</SelectItem>
                    <SelectItem value="Apna">Apna</SelectItem>
                    <SelectItem value="Meta">Meta</SelectItem>
                    <SelectItem value="EarlyJobs">EarlyJobs</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Application Date */}
            <div className="space-y-2">
              <Label htmlFor="applied_on">Application Date</Label>
              <Input
                id="applied_on"
                type="date"
                value={formData.applied_on}
                onChange={(e) => setFormData({ ...formData, applied_on: e.target.value })}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Send className="mr-2 h-4 w-4" />
                {loading ? 'Creating...' : 'Create Application'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/applications')}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
