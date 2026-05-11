import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Database, UserPlus, Search, Briefcase, Mail, Phone, MapPin, ArrowLeft, Trash2 } from 'lucide-react';
import { API_BASE_URL, API_ENDPOINTS, buildApiUrl } from '@/config/api';

export default function AddCandidate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addCandidate, candidates, jobs, fetchJobs, fetchCandidates, fetchApplications, applications } = useData();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { toast } = useToast();

  // Read mode from URL, default to 'new'
  const urlMode = searchParams.get('mode');
  const [mode, setMode] = useState<'new' | 'existing' | null>(urlMode === 'existing' ? 'existing' : 'new');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [selectedJobForAssign, setSelectedJobForAssign] = useState('');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [sourcedFromOptions, setSourcedFromOptions] = useState<{ id: number, source_name: string }[]>([]);
  const [selectedTalentBase, setSelectedTalentBase] = useState<number[]>([]);

  console.log('AddCandidate render - mode:', mode, 'candidates:', candidates?.length, 'jobs:', jobs?.length);

  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    email_address: '',
    gender: '',
    city: '',
    resume_url: null as File | null,
    job_id: '',
    sourced_from: '',
  });

  const [jobInput, setJobInput] = useState('');
  const [showJobSuggestions, setShowJobSuggestions] = useState(false);

  // -------- Load active jobs, candidates, and sourced_from options --------
  useEffect(() => {
    fetchJobs();
    fetchCandidates();
    fetchApplications();
  }, []);

  // Fetch sourced_from options from master table
  useEffect(() => {
    const fetchSourcedFromOptions = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.MASTERS_SOURCED_FROM);
        if (res.ok) {
          const data = await res.json();
          setSourcedFromOptions(data);
        }
      } catch (error) {
        console.error('Error fetching sourced_from options:', error);
      }
    };
    fetchSourcedFromOptions();
  }, []);

  // Get job options for autocomplete (combined format: Title - Company)
  const jobOptions = useMemo(() => {
    return (jobs || [])
      .map(j => ({
        id: j.id,
        title: j.job_title,
        company: j.company_name || j.company || '',
        combined: `${j.job_title} - ${j.company_name || j.company || 'No Company'}`,
        searchText: `${j.job_title} ${j.company_name || j.company || ''}`.toLowerCase()
      }))
      .filter(j => j.title);
  }, [jobs]);

  // Show job dropdown only when there are matches
  const showJobDropdown = useMemo(() => {
    if (!jobInput || jobInput.trim().length === 0) return false;
    const searchLower = jobInput.toLowerCase();
    return jobOptions.some(job => job.searchText.includes(searchLower));
  }, [jobInput, jobOptions]);

  // Filter job options based on input
  const filteredJobOptions = useMemo(() => {
    if (!jobInput) return jobOptions;
    const searchLower = jobInput.toLowerCase();
    return jobOptions.filter(job => job.searchText.includes(searchLower));
  }, [jobInput, jobOptions]);

  // -------- Get candidates with specific statuses for reassignment --------
  const availableCandidates = useMemo(() => {
    if (!candidates || !applications) return [];

    // Get all candidate IDs with Rejected, Not Fit, Not Interested, Not Joined, or Left statuses
    const reassignableCandidateIds = new Set<number>();

    applications.forEach((app: any) => {
      if (
        app.interview_status === 'Rejected' ||
        app.screening_status === 'Not Fit' ||
        app.screening_status === 'Not Interested' ||
        app.joined_status === 'Not Joined' ||
        app.joined_status === 'Left'
      ) {
        if (app.candidate_id) {
          reassignableCandidateIds.add(app.candidate_id);
        }
      }
    });

    // Return all candidates (both reassignable and fresh candidates)
    return candidates;
  }, [candidates, applications]);

  // Helper to check if candidate is available for reassignment
  const getCandidateStatus = (candidateId: number) => {
    if (!applications) return null;

    const candidateApps = applications.filter((app: any) => app.candidate_id === candidateId);

    for (const app of candidateApps) {
      if (app.interview_status === 'Rejected') return { status: 'Rejected', color: 'bg-red-100 text-red-700' };
      if (app.screening_status === 'Not Fit') return { status: 'Not Fit', color: 'bg-orange-100 text-orange-700' };
      if (app.screening_status === 'Not Interested') return { status: 'Not Interested', color: 'bg-yellow-100 text-yellow-700' };
      if (app.joined_status === 'Not Joined') return { status: 'Not Joined', color: 'bg-purple-100 text-purple-700' };
      if (app.joined_status === 'Left') return { status: 'Left', color: 'bg-gray-100 text-gray-700' };
    }

    return null;
  };

  // -------- Filter candidates by search query and status (including professional profile) --------
  const filteredCandidates = useMemo(() => {
    let filtered = availableCandidates || [];

    // Filter by status first
    if (statusFilter !== 'all') {
      filtered = filtered.filter((candidate: any) => {
        const status = getCandidateStatus(candidate.id);
        if (statusFilter === 'available') {
          return !status; // No status means available
        }
        return status?.status === statusFilter;
      });
    }

    // Then filter by search query
    if (!searchQuery) return filtered;

    const query = searchQuery.toLowerCase();

    return filtered.filter((candidate: any) => {
      // Basic fields
      const matchesBasic =
        candidate.full_name?.toLowerCase().includes(query) ||
        candidate.phone_number?.includes(query) ||
        candidate.email_address?.toLowerCase().includes(query) ||
        candidate.city?.toLowerCase().includes(query);

      // Professional profile fields
      const matchesLanguages = candidate.languages?.some((lang: string) =>
        lang.toLowerCase().includes(query)
      );

      const matchesEducation = candidate.education_qualification?.toLowerCase().includes(query);

      // Work experience - check for "freshers" or "fresher" specifically
      const workExp = candidate.work_experience?.toLowerCase() || '';
      const isFresher = workExp === 'fresher' || workExp === 'freshers' || workExp === '0' || workExp === 'no experience';
      const matchesWorkExp = workExp.includes(query) ||
        (query === 'fresher' || query === 'freshers') && isFresher;

      const matchesCurrentRole = candidate.current_role?.toLowerCase().includes(query);
      const matchesCurrentCompany = candidate.current_company?.toLowerCase().includes(query);
      const matchesDomain = candidate.domain?.toLowerCase().includes(query);
      const matchesRelevantExp = candidate.relevant_experience?.toLowerCase().includes(query);
      const matchesSkills = candidate.skills?.toLowerCase().includes(query);

      // Job and company fields - find application and job for this candidate
      const app = applications.find((a: any) => a.candidate_id === candidate.id);
      const job = jobs.find((j: any) => j.id === app?.job_id);

      const matchesJob =
        job?.job_title?.toLowerCase().includes(query) ||
        app?.job_title?.toLowerCase().includes(query) ||
        job?.company_name?.toLowerCase().includes(query) ||
        job?.company?.toLowerCase().includes(query) ||
        app?.company?.toLowerCase().includes(query);

      return matchesBasic || matchesLanguages || matchesEducation || matchesWorkExp ||
        matchesCurrentRole || matchesCurrentCompany || matchesDomain ||
        matchesRelevantExp || matchesSkills || matchesJob;
    });
  }, [availableCandidates, searchQuery, statusFilter]);

  // -------- Handle job assignment to candidate --------
  const handleAssignJob = async () => {
    if (!selectedCandidate || !selectedJobForAssign) {
      toast({ title: 'Please select a job', variant: 'destructive' });
      return;
    }

    try {
      const job = jobs.find(j => String(j.id) === selectedJobForAssign);

      const payload = {
        candidate_id: selectedCandidate.id,
        job_id: Number(selectedJobForAssign),
        candidate_name: selectedCandidate.full_name,
        job_title: job?.job_title || '',
        company: job?.company_name || job?.company || '',
        status: 'Applied',
        applied_on: new Date().toISOString().split('T')[0],
      };

      const res = await fetch(API_ENDPOINTS.APPLICATIONS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to assign job');

      await fetchApplications();

      toast({
        title: 'Success',
        description: `${selectedCandidate.full_name} assigned to ${job?.job_title}`
      });

      setIsAssignDialogOpen(false);
      setSelectedCandidate(null);
      setSelectedJobForAssign('');

      setTimeout(() => {
        navigate('/applications');
      }, 500);
    } catch (error) {
      console.error('Error assigning job:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign job',
        variant: 'destructive'
      });
    }
  };

  // -------- Talent Base Selection Handlers --------
  const toggleSelectAllTalent = () => {
    if (selectedTalentBase.length === filteredCandidates.length) {
      setSelectedTalentBase([]);
    } else {
      setSelectedTalentBase(filteredCandidates.map((c: any) => c.id));
    }
  };

  const toggleSelectTalent = (candidateId: number) => {
    setSelectedTalentBase(prev =>
      prev.includes(candidateId) ? prev.filter(id => id !== candidateId) : [...prev, candidateId]
    );
  };

  // -------- Bulk Delete Talent Base Candidates --------
  const handleBulkDeleteTalent = async () => {
    if (selectedTalentBase.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one candidate to delete',
        variant: 'destructive'
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedTalentBase.length} candidate(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      await Promise.all(
        selectedTalentBase.map(candidateId =>
          fetch(buildApiUrl(API_ENDPOINTS.CANDIDATES, candidateId), {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
          })
        )
      );

      await fetchCandidates();
      await fetchApplications();
      const count = selectedTalentBase.length;
      setSelectedTalentBase([]);
      toast({
        title: 'Deleted',
        description: `Successfully deleted ${count} candidate(s) from talent base`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete some candidates',
        variant: 'destructive'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobInput.trim()) {
      toast({ title: 'Please select a job', variant: 'destructive' });
      return;
    }

    if (!formData.sourced_from) {
      toast({ title: 'Please select a source', variant: 'destructive' });
      return;
    }

    try {
      // Extract job title and company from combined format
      let extractedJobTitle = jobInput.trim();
      let extractedCompany = '';

      if (jobInput.includes(' - ')) {
        const parts = jobInput.split(' - ');
        extractedJobTitle = parts[0].trim();
        extractedCompany = parts[1]?.trim() || '';
      }

      // Find matching job from the options that were displayed
      const matchingJobOption = jobOptions.find(j =>
        j.combined.toLowerCase() === jobInput.toLowerCase() ||
        (j.title.toLowerCase() === extractedJobTitle.toLowerCase() &&
          (extractedCompany ? j.company.toLowerCase() === extractedCompany.toLowerCase() : true))
      );

      // If not found in options, try direct lookup in jobs array
      let matchingJob = matchingJobOption ? jobs.find(j => j.id === matchingJobOption.id) : null;

      if (!matchingJob) {
        // Try one more time with a more lenient search
        matchingJob = jobs.find(j =>
          j.job_title.toLowerCase() === extractedJobTitle.toLowerCase() &&
          (extractedCompany ? ((j.company_name || j.company || '').toLowerCase() === extractedCompany.toLowerCase()) : true)
        );
      }

      // Validate that job exists
      if (!matchingJob) {
        toast({
          title: 'Error',
          description: 'Please select a valid job from the dropdown list',
          variant: 'destructive',
        });
        return;
      }

      const fd = new FormData();
      fd.append("full_name", formData.full_name);
      fd.append("phone_number", formData.phone_number);
      fd.append("email_address", formData.email_address);
      fd.append("gender", formData.gender);
      fd.append("city", formData.city);
      fd.append("job_id", String(matchingJob.id));
      if (formData.sourced_from) {
        fd.append("sourced_from", formData.sourced_from);
      }

      if (formData.resume_url) {
        fd.append("resume", formData.resume_url);
      }

      console.log('Submitting candidate with job_id:', matchingJob.id);

      // Send FormData and wait for completion
      await addCandidate(fd);

      toast({ title: 'Success', description: 'Candidate added successfully' });

      // Navigate after a short delay to allow data to refresh
      setTimeout(() => {
        navigate('/candidates');
      }, 500);
    } catch (error) {
      console.error('Error adding candidate:', error);
      toast({
        title: 'Error',
        description: 'Failed to add candidate. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // -------- SELECT MODE SCREEN --------
  if (!mode) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add Candidate</h1>
          <p className="text-muted-foreground mt-1">Choose how to add the candidate</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 max-w-3xl">
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader onClick={() => setMode('existing')}>
              <Database className="h-12 w-12 text-primary mb-2" />
              <CardTitle>Talent Base</CardTitle>
            </CardHeader>
            <CardContent onClick={() => setMode('existing')}>
              <p className="text-sm text-muted-foreground">
                Search and assign existing candidates to jobs
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader onClick={() => setMode('new')}>
              <UserPlus className="h-12 w-12 text-primary mb-2" />
              <CardTitle>Add New Candidate</CardTitle>
            </CardHeader>
            <CardContent onClick={() => setMode('new')}>
              <p className="text-sm text-muted-foreground">
                Create a new candidate profile with details
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // -------- EXISTING CANDIDATE LIST --------
  if (mode === 'existing') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/candidates')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Talent Base</h1>
              <p className="text-muted-foreground mt-1">Search and assign candidates to jobs</p>
            </div>
            {/* Bulk Delete Button - Left Side */}
            {isAdmin && selectedTalentBase.length > 0 && (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l">
                <Button onClick={handleBulkDeleteTalent} size="sm" variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete ({selectedTalentBase.length})
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar and Status Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, phone, email, city, education, work experience (freshers), languages, skills, job, company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Candidates</SelectItem>
                  <SelectItem value="available">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Available
                    </div>
                  </SelectItem>
                  <SelectItem value="Rejected">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      Rejected
                    </div>
                  </SelectItem>
                  <SelectItem value="Not Fit">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      Not Fit
                    </div>
                  </SelectItem>
                  <SelectItem value="Not Interested">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      Not Interested
                    </div>
                  </SelectItem>
                  <SelectItem value="Not Joined">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      Not Joined
                    </div>
                  </SelectItem>
                  <SelectItem value="Left">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                      Left
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">Candidate Reassignment System</h3>
                <p className="text-sm text-blue-800">
                  All candidates are shown here. Candidates with <strong>Rejected</strong>, <strong>Not Fit</strong>, <strong>Not Interested</strong>, <strong>Not Joined</strong>, or <strong>Left</strong> statuses are available for reassignment to new positions.
                  Use the advanced search to find candidates by education, work experience (type "freshers" for fresh graduates), languages, skills, and more. Click on any row to view full candidate details.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Candidates Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              All Candidates ({filteredCandidates.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="max-h-[600px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-white z-10">
                    <TableRow>
                      {isAdmin && (
                        <TableHead className="w-[40px]">
                          <input
                            type="checkbox"
                            checked={selectedTalentBase.length === filteredCandidates.length && filteredCandidates.length > 0}
                            onChange={toggleSelectAllTalent}
                            className="cursor-pointer"
                          />
                        </TableHead>
                      )}
                      <TableHead className="w-[50px]">ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Resume</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCandidates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={isAdmin ? 9 : 8} className="text-center text-gray-500 py-8">
                          No candidates found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCandidates.map((candidate: any) => (
                        <TableRow
                          key={candidate.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => navigate(`/candidates/${candidate.id}`)}
                        >
                          {isAdmin && (
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selectedTalentBase.includes(candidate.id)}
                                onChange={() => toggleSelectTalent(candidate.id)}
                                className="cursor-pointer"
                              />
                            </TableCell>
                          )}
                          <TableCell className="font-medium">{candidate.id}</TableCell>
                          <TableCell>
                            <div className="font-medium">{candidate.full_name}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-3 h-3 text-gray-400" />
                              {candidate.phone_number || '-'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-3 h-3 text-gray-400" />
                              {candidate.email_address || '-'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const status = getCandidateStatus(candidate.id);
                              return status ? (
                                <Badge className={status.color}>{status.status}</Badge>
                              ) : (
                                <Badge variant="outline" className="bg-green-50 text-green-700">Available</Badge>
                              );
                            })()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              {candidate.city || '-'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {candidate.resume_url ? (
                              <a
                                href={`${API_BASE_URL}${candidate.resume_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm"
                              >
                                View
                              </a>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedCandidate(candidate);
                                  setIsAssignDialogOpen(true);
                                }}
                              >
                                <Briefcase className="w-4 h-4 mr-2" />
                                Assign
                              </Button>
                              {isAdmin && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    if (!confirm(`Are you sure you want to delete ${candidate.full_name}? This will remove the candidate from the database.`)) {
                                      return;
                                    }
                                    try {
                                      const res = await fetch(buildApiUrl(API_ENDPOINTS.CANDIDATES, candidate.id), {
                                        method: 'DELETE',
                                        headers: { 'Content-Type': 'application/json' }
                                      });
                                      if (!res.ok) throw new Error('Failed to delete');
                                      await fetchCandidates();
                                      toast({
                                        title: 'Deleted',
                                        description: `${candidate.full_name} has been removed from the talent base`
                                      });
                                    } catch (error) {
                                      toast({
                                        title: 'Error',
                                        description: 'Failed to delete candidate',
                                        variant: 'destructive'
                                      });
                                    }
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assign Job Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Assign Job to {selectedCandidate?.full_name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {/* Candidate Info */}
              {selectedCandidate && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{selectedCandidate.phone_number}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{selectedCandidate.email_address || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{selectedCandidate.city}</span>
                  </div>
                </div>
              )}

              {/* Job Selection */}
              <div className="space-y-2">
                <Label>Select Job *</Label>
                <Select
                  value={selectedJobForAssign}
                  onValueChange={setSelectedJobForAssign}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a job to assign" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs
                      .filter(j => j.status === 'open' || j.status === 'Active')
                      .map(job => (
                        <SelectItem key={job.id} value={String(job.id)}>
                          <div className="flex flex-col">
                            <span className="font-medium">{job.job_title}</span>
                            <span className="text-xs text-gray-500">
                              {job.company_name || job.company} • {job.address}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleAssignJob}
                  className="flex-1"
                  disabled={!selectedJobForAssign}
                >
                  Assign Job
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAssignDialogOpen(false);
                    setSelectedCandidate(null);
                    setSelectedJobForAssign('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // -------- NEW CANDIDATE FORM --------
  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate('/candidates')}>Back</Button>
      <h1 className="text-3xl font-bold text-foreground mt-4">Add New Candidate</h1>

      <Card className="max-w-2xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Job Selection - Moved to Top */}
            <div className="space-y-2">
              <Label>Applying For *</Label>
              <div className="relative">
                <Input
                  required
                  value={jobInput}
                  onChange={(e) => {
                    setJobInput(e.target.value);
                    setShowJobSuggestions(true);
                  }}
                  onFocus={() => setShowJobSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowJobSuggestions(false), 200)}
                  placeholder="Type to search job title or company..."
                  className="w-full"
                />
                {showJobSuggestions && showJobDropdown && filteredJobOptions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredJobOptions.map((job) => (
                      <div
                        key={job.id}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-start gap-2"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setJobInput(job.combined);
                          setFormData({ ...formData, job_id: String(job.id) });
                          setShowJobSuggestions(false);
                        }}
                      >
                        <Briefcase className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{job.title}</div>
                          <div className="text-xs text-gray-500 truncate">{job.company}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input
                required
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email_address}
                onChange={(e) => setFormData({ ...formData, email_address: e.target.value })}
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* City - Not Required */}
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>

            {/* Sourced From */}
            <div className="space-y-2">
              <Label>Sourced From *</Label>
              <Select
                value={formData.sourced_from}
                onValueChange={(value) => {
                  setFormData({ ...formData, sourced_from: value });
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {sourcedFromOptions.map((source) => (
                    <SelectItem key={source.id} value={source.source_name}>
                      {source.source_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Resume Upload */}
            <div className="space-y-2">
              <Label>Resume</Label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFormData({ ...formData, resume_url: e.target.files?.[0] || null })}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">Add Candidate</Button>
              <Button variant="outline" onClick={() => navigate('/candidates')}>
                Cancel
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
