import { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Briefcase, Building2, MapPin, Users, DollarSign, Clock, TrendingUp, Search, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS, buildApiUrl } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';

export default function Jobs() {
  const { jobs, fetchJobs } = useData();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingJob, setEditingJob] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    job_title: '',
    company_name: '',
    job_description: '',
    address: '',
    openings: '',
    type: '',
    work_mode: '',
    salary_min: '',
    salary_max: '',
    status: '',
    urgency: '',
    commission: '',
    tenure: '',
    shift: '',
    category: '',
    experience: '',
    age_min: '',
    age_max: '',
    required_skills: '',
    preferred_skills: '',
    nice_to_have: '',
    languages_required: ''
  });

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch =
        job.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.required_skills?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchQuery, statusFilter]);

  const stats = {
    total: jobs.length,
    open: jobs.filter(j => j.status === 'open').length,
    closed: jobs.filter(j => j.status === 'closed').length,
    onHold: jobs.filter(j => j.status === 'on_hold').length,
  };

  const handleStatusChange = async (jobId: number, newStatus: string) => {
    try {
      const res = await fetch(buildApiUrl(API_ENDPOINTS.JOBS, jobId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      await fetchJobs();
      toast({
        title: "Success",
        description: `Job status updated to ${newStatus}`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (job: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingJob(job);
    setEditDialogOpen(true);
    setEditForm({
      job_title: job.job_title || '',
      company_name: job.company_name || '',
      job_description: job.job_description || '',
      address: job.address || '',
      openings: job.openings?.toString() || '',
      type: job.type || '',
      work_mode: job.work_mode || '',
      salary_min: job.salary_min?.toString() || '',
      salary_max: job.salary_max?.toString() || '',
      status: job.status || '',
      urgency: job.urgency || '',
      commission: job.commission?.toString() || '',
      tenure: job.tenure || '',
      shift: job.shift || '',
      category: job.category || '',
      experience: job.experience?.toString() || '',
      age_min: job.age_min?.toString() || '',
      age_max: job.age_max?.toString() || '',
      required_skills: job.required_skills || '',
      preferred_skills: job.preferred_skills || '',
      nice_to_have: job.nice_to_have || '',
      languages_required: job.languages_required || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingJob) return;

    try {
      // Convert string numbers to integers where needed
      const updateData: any = { ...editForm };
      ['openings', 'salary_min', 'salary_max', 'commission', 'experience', 'age_min', 'age_max'].forEach(key => {
        if (updateData[key] && updateData[key] !== '') {
          updateData[key] = parseInt(updateData[key]);
        }
      });

      const res = await fetch(buildApiUrl(API_ENDPOINTS.JOBS, editingJob.id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) throw new Error('Failed to update job');

      await fetchJobs();
      setEditDialogOpen(false);
      setEditingJob(null);
      toast({
        title: "Success",
        description: "Job updated successfully",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update job",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Jobs</h1>
          <p className="text-muted-foreground mt-1">
            Manage all job openings - Total: {stats.total}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => navigate("/jobs/add")} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Job
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card
          className={`cursor-pointer transition-all border-2 ${statusFilter === 'all' ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'}`}
          onClick={() => setStatusFilter('all')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-primary">{stats.total}</div>
                <p className="text-sm text-muted-foreground">All Jobs</p>
              </div>
              <Briefcase className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all border-2 ${statusFilter === 'open' ? 'ring-2 ring-green-500 shadow-lg' : 'hover:shadow-md'}`}
          onClick={() => setStatusFilter('open')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.open}</div>
                <p className="text-sm text-muted-foreground">Open</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all border-2 ${statusFilter === 'on_hold' ? 'ring-2 ring-orange-500 shadow-lg' : 'hover:shadow-md'}`}
          onClick={() => setStatusFilter('on_hold')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">{stats.onHold}</div>
                <p className="text-sm text-muted-foreground">On Hold</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all border-2 ${statusFilter === 'closed' ? 'ring-2 ring-gray-500 shadow-lg' : 'hover:shadow-md'}`}
          onClick={() => setStatusFilter('closed')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-600">{stats.closed}</div>
                <p className="text-sm text-muted-foreground">Closed</p>
              </div>
              <Briefcase className="h-8 w-8 text-gray-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by job title, company, location, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Jobs Grid */}
      <div className="grid gap-4">
        {filteredJobs.map(job => {
          const statusColor =
            job.status === 'open' ? 'bg-green-500' :
              job.status === 'on_hold' ? 'bg-orange-500' :
                'bg-gray-500';

          const urgencyColor =
            job.urgency === 'urgent' ? 'bg-red-500' :
              job.urgency === 'high' ? 'bg-orange-500' :
                'bg-blue-500';

          return (
            <Card
              key={job.id}
              className="hover:shadow-xl transition-all border-l-4 border-2 cursor-pointer"
              style={{ borderLeftColor: job.status === 'open' ? '#22c55e' : '#6b7280' }}
              onClick={() => navigate(`/jobs/${job.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div
                    className="flex items-center gap-3 flex-1"
                  >
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                      <Briefcase className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{job.job_title}</h3>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {job.urgency && (
                          <Badge className={`${urgencyColor} text-white`}>
                            {job.urgency}
                          </Badge>
                        )}
                        {job.type && (
                          <Badge variant="outline">{job.type}</Badge>
                        )}
                        {job.work_mode && (
                          <Badge variant="secondary">{job.work_mode}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={job.status}
                      onValueChange={(value) => handleStatusChange(job.id, value)}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-green-500" />
                            Open
                          </span>
                        </SelectItem>
                        <SelectItem value="on_hold">
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-orange-500" />
                            On Hold
                          </span>
                        </SelectItem>
                        <SelectItem value="closed">
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-gray-500" />
                            Closed
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleEdit(job, e)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Job</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="edit-job-title">Job Title *</Label>
                              <Input
                                id="edit-job-title"
                                value={editForm.job_title}
                                onChange={(e) => setEditForm(prev => ({ ...prev, job_title: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-company">Company Name *</Label>
                              <Input
                                id="edit-company"
                                value={editForm.company_name}
                                onChange={(e) => setEditForm(prev => ({ ...prev, company_name: e.target.value }))}
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="edit-description">Job Description</Label>
                            <Textarea
                              id="edit-description"
                              rows={4}
                              value={editForm.job_description}
                              onChange={(e) => setEditForm(prev => ({ ...prev, job_description: e.target.value }))}
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-address">Location/Address *</Label>
                            <Input
                              id="edit-address"
                              value={editForm.address}
                              onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="edit-openings">Openings</Label>
                              <Input
                                id="edit-openings"
                                type="number"
                                value={editForm.openings}
                                onChange={(e) => setEditForm(prev => ({ ...prev, openings: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-type">Job Type</Label>
                              <select
                                id="edit-type"
                                value={editForm.type}
                                onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value }))}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              >
                                <option value="">Select Type</option>
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Contract">Contract</option>
                                <option value="Temporary">Temporary</option>
                                <option value="Internship">Internship</option>
                              </select>
                            </div>
                            <div>
                              <Label htmlFor="edit-work-mode">Work Mode</Label>
                              <select
                                id="edit-work-mode"
                                value={editForm.work_mode}
                                onChange={(e) => setEditForm(prev => ({ ...prev, work_mode: e.target.value }))}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              >
                                <option value="">Select Mode</option>
                                <option value="Remote">Remote</option>
                                <option value="On-Site">On-Site</option>
                                <option value="Hybrid">Hybrid</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="edit-salary-min">Minimum Salary</Label>
                              <Input
                                id="edit-salary-min"
                                type="number"
                                placeholder="e.g., 30000"
                                value={editForm.salary_min}
                                onChange={(e) => setEditForm(prev => ({ ...prev, salary_min: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-salary-max">Maximum Salary</Label>
                              <Input
                                id="edit-salary-max"
                                type="number"
                                placeholder="e.g., 50000"
                                value={editForm.salary_max}
                                onChange={(e) => setEditForm(prev => ({ ...prev, salary_max: e.target.value }))}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="edit-status">Status</Label>
                              <select
                                id="edit-status"
                                value={editForm.status}
                                onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              >
                                <option value="open">Open</option>
                                <option value="on_hold">On Hold</option>
                                <option value="closed">Closed</option>
                              </select>
                            </div>
                            <div>
                              <Label htmlFor="edit-urgency">Urgency</Label>
                              <select
                                id="edit-urgency"
                                value={editForm.urgency}
                                onChange={(e) => setEditForm(prev => ({ ...prev, urgency: e.target.value }))}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              >
                                <option value="">Select Urgency</option>
                                <option value="urgent">Urgent</option>
                                <option value="high">High</option>
                                <option value="normal">Normal</option>
                              </select>
                            </div>
                            <div>
                              <Label htmlFor="edit-experience">Experience (Years)</Label>
                              <Input
                                id="edit-experience"
                                type="number"
                                value={editForm.experience}
                                onChange={(e) => setEditForm(prev => ({ ...prev, experience: e.target.value }))}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-4">
                            <div>
                              <Label htmlFor="edit-commission">Commission</Label>
                              <Input
                                id="edit-commission"
                                type="number"
                                value={editForm.commission}
                                onChange={(e) => setEditForm(prev => ({ ...prev, commission: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-tenure">Tenure</Label>
                              <Input
                                id="edit-tenure"
                                placeholder="e.g., 12 months"
                                value={editForm.tenure}
                                onChange={(e) => setEditForm(prev => ({ ...prev, tenure: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-shift">Shift</Label>
                              <Input
                                id="edit-shift"
                                placeholder="e.g., Day/Night"
                                value={editForm.shift}
                                onChange={(e) => setEditForm(prev => ({ ...prev, shift: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-category">Category</Label>
                              <Input
                                id="edit-category"
                                value={editForm.category}
                                onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="edit-age-min">Minimum Age</Label>
                              <Input
                                id="edit-age-min"
                                type="number"
                                value={editForm.age_min}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 99)) {
                                    setEditForm(prev => ({ ...prev, age_min: value }));
                                  }
                                }}
                                maxLength={2}
                                placeholder="e.g. 18"
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-age-max">Maximum Age</Label>
                              <Input
                                id="edit-age-max"
                                type="number"
                                value={editForm.age_max}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 99)) {
                                    setEditForm(prev => ({ ...prev, age_max: value }));
                                  }
                                }}
                                maxLength={2}
                                placeholder="e.g. 65"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="edit-required-skills">Required Skills</Label>
                            <Textarea
                              id="edit-required-skills"
                              rows={2}
                              placeholder="e.g., Python, SQL, React"
                              value={editForm.required_skills}
                              onChange={(e) => setEditForm(prev => ({ ...prev, required_skills: e.target.value }))}
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-preferred-skills">Preferred Skills</Label>
                            <Textarea
                              id="edit-preferred-skills"
                              rows={2}
                              value={editForm.preferred_skills}
                              onChange={(e) => setEditForm(prev => ({ ...prev, preferred_skills: e.target.value }))}
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-nice-to-have">Nice to Have</Label>
                            <Textarea
                              id="edit-nice-to-have"
                              rows={2}
                              value={editForm.nice_to_have}
                              onChange={(e) => setEditForm(prev => ({ ...prev, nice_to_have: e.target.value }))}
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-languages">Languages Required</Label>
                            <Input
                              id="edit-languages"
                              placeholder="e.g., English, Hindi"
                              value={editForm.languages_required}
                              onChange={(e) => setEditForm(prev => ({ ...prev, languages_required: e.target.value }))}
                            />
                          </div>

                          <Button onClick={handleSaveEdit} className="w-full">
                            Save Changes
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Company</p>
                      <p className="font-medium">{job.company_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="font-medium">{job.address}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Openings</p>
                      <p className="font-medium">{job.openings} Positions</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Salary</p>
                      <p className="font-medium">
                        {job.salary_min && job.salary_max
                          ? `₹${(job.salary_min / 1000).toFixed(0)}k - ₹${(job.salary_max / 1000).toFixed(0)}k`
                          : 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>

                {job.job_description && (
                  <p className="text-sm text-muted-foreground mt-4 line-clamp-2">
                    {job.job_description}
                  </p>
                )}

                {/* Skills Preview */}
                {job.required_skills && (
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-muted-foreground">Skills:</span>
                    {job.required_skills.split(',').slice(0, 3).map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {skill.trim()}
                      </Badge>
                    ))}
                    {job.required_skills.split(',').length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{job.required_skills.split(',').length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {filteredJobs.length === 0 && (
          <Card className="shadow-lg border-2">
            <CardContent className="p-12 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No jobs found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {statusFilter !== 'all'
                  ? `No jobs with status "${statusFilter}"`
                  : searchQuery
                    ? 'Try adjusting your search query'
                    : 'Start by adding your first job'}
              </p>
              {isAdmin && (
                <Button className="mt-4" onClick={() => navigate("/jobs/add")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Job
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
