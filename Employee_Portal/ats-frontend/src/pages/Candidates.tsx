import { useState, useMemo, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Phone, Mail, MapPin, Briefcase, Building2, Search, Eye, Edit, GraduationCap, Languages, Clock, Code, Factory, Calendar, Loader2, CheckCircle2, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS, buildApiUrl } from '@/config/api';

const statusColors: any = {
  new: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  screening: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  interview_ready: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  selected: 'bg-green-500/10 text-green-500 border-green-500/20',
  joined: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export default function Candidates() {
  const { candidates, jobs, applications, fetchCandidates, fetchApplications } = useData();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCandidate, setEditingCandidate] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [jobInput, setJobInput] = useState('');
  const [showJobSuggestions, setShowJobSuggestions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    fathers_name: '',
    phone_number: '',
    email_address: '',
    date_of_birth: '',
    gender: '',
    aadhaar_number: '',
    street_address: '',
    area_locality: '',
    city: '',
    pincode: '',
    job_id: '',
    select_languages: [] as string[],
    educational_quality: '',
    work_experience: '',
    additional_months: '',
    technical_professional_skills: '',
    preferred_industries_categories: '',
    preferred_employment_types: [] as string[],
    preferred_work_types: ''
  });

  // Get job options for autocomplete
  const jobOptions = useMemo(() => {
    return (jobs || []).map(j => ({
      id: j.id,
      title: j.job_title,
      company: j.company_name || j.company || '',
      combined: `${j.job_title} - ${j.company_name || j.company || 'No Company'}`,
      searchText: `${j.job_title} ${j.company_name || j.company || ''}`.toLowerCase()
    })).filter(j => j.title);
  }, [jobs]);

  // Filter job options based on input
  const filteredJobOptions = useMemo(() => {
    if (!jobInput) return jobOptions;
    const searchLower = jobInput.toLowerCase();
    return jobOptions.filter(job => job.searchText.includes(searchLower));
  }, [jobInput, jobOptions]);

  // Show job dropdown only when there are matches
  const showJobDropdown = useMemo(() => {
    if (!jobInput || jobInput.trim().length === 0) return false;
    const searchLower = jobInput.toLowerCase();
    return jobOptions.some(job => job.searchText.includes(searchLower));
  }, [jobInput, jobOptions]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      const query = searchQuery.toLowerCase();

      // Basic fields
      const matchesBasic =
        candidate.full_name?.toLowerCase().includes(query) ||
        candidate.phone_number?.toLowerCase().includes(query) ||
        candidate.email_address?.toLowerCase().includes(query) ||
        candidate.city?.toLowerCase().includes(query);

      // Find application and job for this candidate to search by job title and company
      const app = applications.find(a => a.candidate_id === candidate.id);
      const job = jobs.find(j => j.id === app?.job_id);

      const matchesJob =
        job?.job_title?.toLowerCase().includes(query) ||
        app?.job_title?.toLowerCase().includes(query) ||
        job?.company_name?.toLowerCase().includes(query) ||
        job?.company?.toLowerCase().includes(query) ||
        app?.company?.toLowerCase().includes(query);

      return matchesBasic || matchesJob;
    });
  }, [candidates, searchQuery, applications, jobs]);

  // Repopulate form when editing candidate changes
  useEffect(() => {
    if (editingCandidate && editDialogOpen) {
      console.log('Populating edit form with candidate data:', editingCandidate);

      const app = applications.find(a => a.candidate_id === editingCandidate.id);
      const job = jobs.find(j => j.id === app?.job_id);

      setEditForm({
        full_name: editingCandidate.full_name || '',
        fathers_name: editingCandidate.fathers_name || '',
        phone_number: editingCandidate.phone_number || '',
        email_address: editingCandidate.email_address || '',
        date_of_birth: editingCandidate.date_of_birth || '',
        gender: editingCandidate.gender || '',
        aadhaar_number: editingCandidate.aadhaar_number || '',
        street_address: editingCandidate.street_address || '',
        area_locality: editingCandidate.area_locality || '',
        city: editingCandidate.city || '',
        pincode: editingCandidate.pincode || '',
        job_id: app?.job_id ? String(app.job_id) : '',
        select_languages: editingCandidate.select_languages ? (typeof editingCandidate.select_languages === 'string' ? editingCandidate.select_languages.split(',').map((s: string) => s.trim()).filter(Boolean) : editingCandidate.select_languages) : [],
        educational_quality: editingCandidate.educational_quality || '',
        work_experience: editingCandidate.work_experience || '',
        additional_months: editingCandidate.additional_months || '',
        technical_professional_skills: editingCandidate.technical_professional_skills || '',
        preferred_industries_categories: editingCandidate.preferred_industries_categories || '',
        preferred_employment_types: editingCandidate.preferred_employment_types ? (typeof editingCandidate.preferred_employment_types === 'string' ? editingCandidate.preferred_employment_types.split(',').map((s: string) => s.trim()).filter(Boolean) : editingCandidate.preferred_employment_types) : [],
        preferred_work_types: editingCandidate.preferred_work_types || ''
      });

      if (job) {
        setJobInput(`${job.job_title} - ${job.company_name || job.company || 'No Company'}`);
      } else {
        setJobInput('');
      }
    }
  }, [editingCandidate, editDialogOpen, applications, jobs]);

  const handleEdit = (candidate: any, e: React.MouseEvent) => {
    e.stopPropagation();

    // Find the application for this candidate to get job_id
    const app = applications.find(a => a.candidate_id === candidate.id);
    const job = jobs.find(j => j.id === app?.job_id);

    setEditForm({
      full_name: candidate.full_name || '',
      fathers_name: candidate.fathers_name || '',
      phone_number: candidate.phone_number || '',
      email_address: candidate.email_address || '',
      date_of_birth: candidate.date_of_birth || '',
      gender: candidate.gender || '',
      aadhaar_number: candidate.aadhaar_number || '',
      street_address: candidate.street_address || '',
      area_locality: candidate.area_locality || '',
      city: candidate.city || '',
      pincode: candidate.pincode || '',
      job_id: app?.job_id ? String(app.job_id) : '',
      select_languages: candidate.select_languages ? (typeof candidate.select_languages === 'string' ? candidate.select_languages.split(',').filter(Boolean) : candidate.select_languages) : [],
      educational_quality: candidate.educational_quality || '',
      work_experience: candidate.work_experience || '',
      additional_months: candidate.additional_months || '',
      technical_professional_skills: candidate.technical_professional_skills || '',
      preferred_industries_categories: candidate.preferred_industries_categories || '',
      preferred_employment_types: candidate.preferred_employment_types ? (typeof candidate.preferred_employment_types === 'string' ? candidate.preferred_employment_types.split(',').filter(Boolean) : candidate.preferred_employment_types) : [],
      preferred_work_types: candidate.preferred_work_types || ''
    });

    // Set job input with combined format if job exists
    if (job) {
      setJobInput(`${job.job_title} - ${job.company_name || job.company || 'No Company'}`);
    } else {
      setJobInput('');
    }

    setEditingCandidate(candidate);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingCandidate) return;

    setSaving(true);
    try {
      // Extract job details from jobInput
      let jobId = editForm.job_id;
      if (jobInput.trim()) {
        let extractedJobTitle = jobInput.trim();
        let extractedCompany = '';

        if (jobInput.includes(' - ')) {
          const parts = jobInput.split(' - ');
          extractedJobTitle = parts[0].trim();
          extractedCompany = parts[1]?.trim() || '';
        }

        const matchingJob = jobs.find(j =>
          j.job_title.toLowerCase() === extractedJobTitle.toLowerCase() &&
          (extractedCompany ? ((j.company_name || j.company || '').toLowerCase() === extractedCompany.toLowerCase()) : true)
        );

        if (matchingJob) {
          jobId = String(matchingJob.id);
        }
      }

      // Prepare candidate update payload (no job_id - that's in applications table)
      const candidatePayload: any = {
        full_name: editForm.full_name,
        fathers_name: editForm.fathers_name,
        phone_number: editForm.phone_number,
        email_address: editForm.email_address,
        gender: editForm.gender,
        aadhaar_number: editForm.aadhaar_number,
        street_address: editForm.street_address,
        area_locality: editForm.area_locality,
        city: editForm.city,
        pincode: editForm.pincode ? editForm.pincode : null,
        select_languages: editForm.select_languages.length > 0 ? editForm.select_languages.join(',') : '',
        educational_quality: editForm.educational_quality || '',
        work_experience: editForm.work_experience || null,
        additional_months: editForm.additional_months || null,
        technical_professional_skills: editForm.technical_professional_skills || '',
        preferred_industries_categories: editForm.preferred_industries_categories || '',
        preferred_employment_types: editForm.preferred_employment_types.length > 0 ? editForm.preferred_employment_types.join(',') : '',
        preferred_work_types: editForm.preferred_work_types || ''
      };

      // Add date_of_birth if it has a value
      if (editForm.date_of_birth && editForm.date_of_birth.trim() !== '') {
        candidatePayload.date_of_birth = editForm.date_of_birth;
      } else {
        candidatePayload.date_of_birth = null;
      }

      // Update candidate
      const candidateRes = await fetch(buildApiUrl(API_ENDPOINTS.CANDIDATES, editingCandidate.id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(candidatePayload),
      });

      if (!candidateRes.ok) {
        let errorMessage = 'Failed to update candidate';
        try {
          const errorData = await candidateRes.json();
          errorMessage = errorData.detail || errorMessage;
        } catch (e) {
          errorMessage = `Server error: ${candidateRes.status} ${candidateRes.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Update application if exists
      const app = applications.find(a => a.candidate_id === editingCandidate.id);
      if (app && jobId) {
        const job = jobs.find(j => j.id === parseInt(jobId));
        const appPayload = {
          candidate_id: editingCandidate.id,
          candidate_name: editForm.full_name,
          job_id: parseInt(jobId),
          job_title: job?.job_title || app.job_title,
          company: job?.company_name || job?.company || app.company,
          status: app.status,
          sourced_by: app.sourced_by,
          sourced_from: app.sourced_from,
          assigned_to: app.assigned_to,
          applied_on: app.applied_on,
          comments: app.comments
        };

        const appRes = await fetch(buildApiUrl(API_ENDPOINTS.APPLICATIONS, app.id), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appPayload),
        });

        if (!appRes.ok) {
          console.error('Failed to update application');
        }
      }

      // Refresh all data
      await Promise.all([
        fetchCandidates(),
        fetchApplications()
      ]);

      console.log('Data refreshed after save');

      setEditDialogOpen(false);
      setEditingCandidate(null);
      setJobInput('');

      toast({
        title: "Success",
        description: "Candidate updated successfully",
      });
    } catch (err: any) {
      console.error('Save edit error:', err);

      let errorMessage = "Failed to update candidate";

      if (err instanceof TypeError && err.message.includes('fetch')) {
        errorMessage = "Cannot connect to server. Please ensure the backend is running on port 8000.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Candidates</h1>
          <p className="text-muted-foreground mt-1">
            Manage all candidates - Total: {candidates.length}
          </p>
        </div>

        <div className="flex gap-3">
          <Button onClick={() => navigate('/candidates/add?mode=existing')} variant="outline" size="lg" className="border-blue-500 text-blue-600 hover:bg-blue-50">
            <Database className="mr-2 h-4 w-4" />
            Talent Base
          </Button>
          <Button onClick={() => navigate('/candidates/add')} size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Candidate
          </Button>
        </div>
      </div>

      {/* Compact Statistics Bar */}
      {(() => {
        // Calculate today and yesterday dates
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const todayStr = today.toISOString().split('T')[0];
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // Source categories to track
        const sources = ['Meta', 'LinkedIn', 'Job hai', 'Apna', 'EarlyJobs', 'Others'];

        // Calculate source counts
        const getSourceCount = (dateStr: string, source: string) => {
          return applications.filter((app: any) => {
            const appDate = app.applied_on;
            if (appDate !== dateStr) return false;

            const appSource = app.sourced_from?.toLowerCase() || '';
            if (source === 'Others') {
              return !sources.slice(0, -1).some(s => appSource.includes(s.toLowerCase()));
            }
            return appSource.includes(source.toLowerCase());
          }).length;
        };

        const todayCounts = sources.map(source => ({ source, count: getSourceCount(todayStr, source) }));
        const yesterdayCounts = sources.map(source => ({ source, count: getSourceCount(yesterdayStr, source) }));
        const totalToday = todayCounts.reduce((sum, s) => sum + s.count, 0);
        const totalYesterday = yesterdayCounts.reduce((sum, s) => sum + s.count, 0);

        const sourceColors: Record<string, string> = {
          'Meta': 'text-blue-600 bg-blue-50',
          'LinkedIn': 'text-sky-600 bg-sky-50',
          'Job hai': 'text-orange-600 bg-orange-50',
          'Apna': 'text-purple-600 bg-purple-50',
          'EarlyJobs': 'text-green-600 bg-green-50',
          'Others': 'text-gray-600 bg-gray-50',
        };

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Total Candidates + Today */}
            <Card className="border-2">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center px-4 border-r">
                      <div className="text-2xl font-bold text-blue-600">{candidates.length}</div>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-600">Today ({totalToday})</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {todayCounts.map(({ source, count }) => (
                      <div key={source} className={`text-center px-2 py-1 rounded-lg ${sourceColors[source]}`}>
                        <div className="text-sm font-bold">{count}</div>
                        <p className="text-[10px]">{source}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Yesterday */}
            <Card className="border-2">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-600">Yesterday ({totalYesterday})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {yesterdayCounts.map(({ source, count }) => (
                      <div key={source} className={`text-center px-2 py-1 rounded-lg ${sourceColors[source]}`}>
                        <div className="text-sm font-bold">{count}</div>
                        <p className="text-[10px]">{source}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })()}

      {/* Search Bar */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, email, location, job, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Candidates Table */}
      <Card className="shadow-lg border-2">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-green-600" />
            Candidates List ({filteredCandidates.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-bold">S.No</TableHead>
                <TableHead className="font-bold">Name</TableHead>
                <TableHead className="font-bold">Contact</TableHead>
                <TableHead className="font-bold">Location</TableHead>
                <TableHead className="font-bold">Job Applied</TableHead>
                <TableHead className="font-bold">Company</TableHead>
                <TableHead className="font-bold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidates.map((candidate, index) => {
                // Find the application
                const app = applications.find(a => a.candidate_id === candidate.id);
                // Find job if exists
                const job = jobs.find(j => j.id === app?.job_id);

                return (
                  <TableRow
                    key={candidate.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => navigate(`/candidates/${candidate.id}`)}
                  >
                    <TableCell>
                      <div className="font-medium">{index + 1}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">{candidate.full_name}</div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{candidate.phone_number}</span>
                        </div>
                        {candidate.email_address && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span className="truncate max-w-[150px]">{candidate.email_address}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{candidate.city || 'N/A'}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {job?.job_title || app?.job_title || 'Not Assigned'}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{job?.company_name || app?.company || 'N/A'}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/candidates/${candidate.id}`);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleEdit(candidate, e)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredCandidates.length === 0 && (
            <div className="p-12 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No candidates found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery ? 'Try adjusting your search query' : 'Add your first candidate!'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog - Stunning UI */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden p-0">
          <DialogHeader className="px-8 pt-6 pb-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-b">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Edit className="h-6 w-6 text-green-600" />
              Edit Candidate Profile
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">Update candidate information and professional details</p>
          </DialogHeader>

          <div className="px-8 py-6 max-h-[calc(95vh-180px)] overflow-y-auto">
            <div className="space-y-8">
              {/* Personal Information Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                  <Mail className="h-5 w-5 text-green-600" />
                  Personal Information
                </h3>
                <div className="space-y-4 bg-gray-50/50 p-6 rounded-lg border">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-name" className="text-sm font-medium">Full Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="edit-name"
                        value={editForm.full_name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                        className="mt-1.5"
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-fathers-name" className="text-sm font-medium">Father's Name</Label>
                      <Input
                        id="edit-fathers-name"
                        value={editForm.fathers_name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, fathers_name: e.target.value }))}
                        className="mt-1.5"
                        placeholder="Enter father's name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-phone" className="text-sm font-medium">Phone Number <span className="text-red-500">*</span></Label>
                      <Input
                        id="edit-phone"
                        value={editForm.phone_number}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phone_number: e.target.value }))}
                        className="mt-1.5"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-email" className="text-sm font-medium">Email Address</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={editForm.email_address}
                        onChange={(e) => setEditForm(prev => ({ ...prev, email_address: e.target.value }))}
                        className="mt-1.5"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-dob" className="text-sm font-medium">Date of Birth</Label>
                      <Input
                        id="edit-dob"
                        type="date"
                        value={editForm.date_of_birth}
                        onChange={(e) => setEditForm(prev => ({ ...prev, date_of_birth: e.target.value }))}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-gender" className="text-sm font-medium">Gender</Label>
                      <Select value={editForm.gender} onValueChange={(value) => setEditForm(prev => ({ ...prev, gender: value }))}>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="edit-aadhaar" className="text-sm font-medium">Aadhaar Number</Label>
                    <Input
                      id="edit-aadhaar"
                      value={editForm.aadhaar_number}
                      onChange={(e) => setEditForm(prev => ({ ...prev, aadhaar_number: e.target.value }))}
                      className="mt-1.5"
                      placeholder="XXXX XXXX XXXX"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-street" className="text-sm font-medium">Street Address</Label>
                    <Input
                      id="edit-street"
                      value={editForm.street_address}
                      onChange={(e) => setEditForm(prev => ({ ...prev, street_address: e.target.value }))}
                      className="mt-1.5"
                      placeholder="House no, Street name"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="edit-area" className="text-sm font-medium">Area/Locality</Label>
                      <Input
                        id="edit-area"
                        value={editForm.area_locality}
                        onChange={(e) => setEditForm(prev => ({ ...prev, area_locality: e.target.value }))}
                        className="mt-1.5"
                        placeholder="Area name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-city" className="text-sm font-medium">City <span className="text-red-500">*</span></Label>
                      <Input
                        id="edit-city"
                        value={editForm.city}
                        onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                        className="mt-1.5"
                        placeholder="City name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-pincode" className="text-sm font-medium">Pincode</Label>
                      <Input
                        id="edit-pincode"
                        value={editForm.pincode}
                        onChange={(e) => setEditForm(prev => ({ ...prev, pincode: e.target.value }))}
                        className="mt-1.5"
                        placeholder="000000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Professional Details Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                  <Briefcase className="h-5 w-5 text-emerald-600" />
                  Professional Profile
                </h3>
                <div className="space-y-6 bg-emerald-50/30 p-6 rounded-lg border border-emerald-100">

                  {/* Languages - Multi-select with checkboxes */}
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2 mb-3">
                      <Languages className="h-4 w-4 text-emerald-600" />
                      Languages Known
                    </Label>
                    <div className="grid grid-cols-4 gap-3 bg-white p-4 rounded-lg border max-h-[200px] overflow-y-auto">
                      {['English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Kannada', 'Malayalam', 'Odia', 'Punjabi', 'Assamese', 'Maithili', 'Urdu', 'Nepali', 'Konkani'].map((lang) => (
                        <div key={lang} className="flex items-center space-x-2">
                          <Checkbox
                            id={`lang-${lang}`}
                            checked={editForm.select_languages.includes(lang)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setEditForm(prev => ({ ...prev, select_languages: [...prev.select_languages, lang] }));
                              } else {
                                setEditForm(prev => ({ ...prev, select_languages: prev.select_languages.filter(l => l !== lang) }));
                              }
                            }}
                          />
                          <label htmlFor={`lang-${lang}`} className="text-sm cursor-pointer">{lang}</label>
                        </div>
                      ))}
                    </div>
                    {editForm.select_languages.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {editForm.select_languages.map((lang, idx) => (
                          <Badge key={idx} variant="secondary" className="bg-emerald-100 text-emerald-700">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Education */}
                  <div>
                    <Label htmlFor="edit-education" className="text-sm font-medium flex items-center gap-2 mb-2">
                      <GraduationCap className="h-4 w-4 text-blue-600" />
                      Educational Qualification
                    </Label>
                    <Select value={editForm.educational_quality} onValueChange={(value) => setEditForm(prev => ({ ...prev, educational_quality: value }))}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select education level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Secondary Education">🎓 Secondary Education (10th)</SelectItem>
                        <SelectItem value="Higher Secondary Education">🎓 Higher Secondary Education (12th)</SelectItem>
                        <SelectItem value="ITI">🔧 ITI</SelectItem>
                        <SelectItem value="Diploma">📜 Diploma</SelectItem>
                        <SelectItem value="Bachelor's 3yr">🎓 Bachelor's (3 year)</SelectItem>
                        <SelectItem value="Bachelor's 4yr">🎓 Bachelor's (4 year)</SelectItem>
                        <SelectItem value="Master's">🎓 Master's</SelectItem>
                        <SelectItem value="PhD">🎓 PhD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Work Experience */}
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2 mb-3">
                      <Clock className="h-4 w-4 text-purple-600" />
                      Work Experience
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-experience" className="text-xs text-muted-foreground">Years</Label>
                        <Input
                          id="edit-experience"
                          type="number"
                          min="0"
                          value={editForm.work_experience}
                          onChange={(e) => setEditForm(prev => ({ ...prev, work_experience: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'e' || e.key === 'E' || e.key === '-' || e.key === '+') e.preventDefault();
                          }}
                          className="mt-1 bg-white"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-months" className="text-xs text-muted-foreground">Additional Months</Label>
                        <Input
                          id="edit-months"
                          type="number"
                          min="0"
                          max="11"
                          value={editForm.additional_months}
                          onChange={(e) => setEditForm(prev => ({ ...prev, additional_months: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'e' || e.key === 'E' || e.key === '-' || e.key === '+') e.preventDefault();
                          }}
                          className="mt-1 bg-white"
                          placeholder="0-11"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Technical Skills */}
                  <div>
                    <Label htmlFor="edit-skills" className="text-sm font-medium flex items-center gap-2 mb-2">
                      <Code className="h-4 w-4 text-orange-600" />
                      Technical & Professional Skills
                    </Label>
                    <textarea
                      id="edit-skills"
                      value={editForm.technical_professional_skills}
                      onChange={(e) => setEditForm(prev => ({ ...prev, technical_professional_skills: e.target.value }))}
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Python, JavaScript, React, Node.js, SQL, AWS..."
                    />
                  </div>

                  <Separator className="bg-emerald-200" />

                  {/* Preferences */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-gray-700">Preferences</h4>


                    <div className="space-y-4">
                      {/* Preferred Industries */}
                      <div>
                        <Label htmlFor="edit-industries" className="text-sm font-medium flex items-center gap-2 mb-2">
                          <Factory className="h-4 w-4 text-cyan-600" />
                          Preferred Industries/Categories
                        </Label>
                        <Input
                          id="edit-industries"
                          value={editForm.preferred_industries_categories}
                          onChange={(e) => setEditForm(prev => ({ ...prev, preferred_industries_categories: e.target.value }))}
                          className="bg-white"
                          placeholder="IT, Healthcare, Manufacturing, Finance..."
                        />
                      </div>

                      {/* Employment Types - Multi-select with checkboxes */}
                      <div>
                        <Label className="text-sm font-medium flex items-center gap-2 mb-3">
                          <Briefcase className="h-4 w-4 text-teal-600" />
                          Preferred Employment Types
                        </Label>
                        <div className="grid grid-cols-3 gap-3 bg-white p-4 rounded-lg border">
                          {['Full Time', 'Part Time', 'Contract', 'Temporary', 'Internship', 'Freelance'].map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                              <Checkbox
                                id={`emp-${type}`}
                                checked={editForm.preferred_employment_types.includes(type)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setEditForm(prev => ({ ...prev, preferred_employment_types: [...prev.preferred_employment_types, type] }));
                                  } else {
                                    setEditForm(prev => ({ ...prev, preferred_employment_types: prev.preferred_employment_types.filter(t => t !== type) }));
                                  }
                                }}
                              />
                              <label htmlFor={`emp-${type}`} className="text-sm cursor-pointer">{type}</label>
                            </div>
                          ))}
                        </div>
                        {editForm.preferred_employment_types.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {editForm.preferred_employment_types.map((type, idx) => (
                              <Badge key={idx} variant="outline" className="bg-teal-50 text-teal-700 border-teal-300">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Work Mode */}
                      <div>
                        <Label htmlFor="edit-work-types" className="text-sm font-medium flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-violet-600" />
                          Preferred Work Mode
                        </Label>
                        <Select value={editForm.preferred_work_types} onValueChange={(value) => setEditForm(prev => ({ ...prev, preferred_work_types: value }))}>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select work mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Remote">🏠 Remote</SelectItem>
                            <SelectItem value="Onsite">🏢 Onsite</SelectItem>
                            <SelectItem value="Hybrid">🔄 Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Job Application */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  Job Application
                </h3>
                <div className="bg-blue-50/30 p-6 rounded-lg border border-blue-100">
                  <div>
                    <Label htmlFor="edit-job" className="text-sm font-medium">Applying For <span className="text-red-500">*</span></Label>
                    <div className="relative mt-2">
                      <Input
                        id="edit-job"
                        value={jobInput}
                        onChange={(e) => {
                          setJobInput(e.target.value);
                          setShowJobSuggestions(true);
                        }}
                        onFocus={() => setShowJobSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowJobSuggestions(false), 200)}
                        placeholder="Type to search job title or company..."
                        className="w-full bg-white"
                      />
                      {showJobSuggestions && showJobDropdown && filteredJobOptions.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-auto">
                          {filteredJobOptions.map((job) => (
                            <div
                              key={job.id}
                              className="px-4 py-3 hover:bg-green-50 cursor-pointer flex items-start gap-3 border-b last:border-0 transition-colors"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setJobInput(job.combined);
                                setEditForm({ ...editForm, job_id: String(job.id) });
                                setShowJobSuggestions(false);
                              }}
                            >
                              <Briefcase className="w-5 h-5 mt-0.5 text-green-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm truncate text-gray-900">{job.title}</div>
                                <div className="text-xs text-gray-600 truncate flex items-center gap-1 mt-0.5">
                                  <Building2 className="w-3 h-3" />
                                  {job.company}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer with Save Button */}
          <div className="px-8 py-4 bg-gray-50 border-t flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              <span className="text-red-500">*</span> Required fields
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={saving}
                className="min-w-[140px] bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
