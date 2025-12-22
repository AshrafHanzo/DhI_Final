import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Users, Calendar, CheckCircle2, UserCheck, XCircle, Edit, Languages, GraduationCap, Code, Factory, Layers, MapPin, Clock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { API_ENDPOINTS, buildApiUrl } from '@/config/api';

export default function ReadyToInterview() {
  const navigate = useNavigate();
  const { applications = [], candidates, jobs, fetchApplications, fetchCandidates } = useData();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [sourcedByFilter, setSourcedByFilter] = useState('all');
  const [editingCandidate, setEditingCandidate] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    select_languages: [] as string[],
    educational_quality: '',
    work_experience: '',
    additional_months: '',
    technical_professional_skills: '',
    preferred_industries_categories: '',
    preferred_employment_types: [] as string[],
    preferred_work_types: ''
  });

  // Interview scheduling dialog state
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [schedulingAppId, setSchedulingAppId] = useState<number | null>(null);
  const [schedulingCandidate, setSchedulingCandidate] = useState<string>('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [scheduling, setScheduling] = useState(false);

  // Filter applications that are Ready To Interview - exclude Rejected and Interview Scheduled
  const readyApplications = useMemo(() => {
    return applications.filter((a: any) =>
      a.screening_status === 'Ready To Interview' &&
      (!a.interview_status || a.interview_status === 'Pending') &&
      a.interview_status !== 'Scheduled' &&
      a.interview_status !== 'Rejected'
    );
  }, [applications]);

  // Count rejected candidates (they are in DB but hidden from UI)
  const rejectedCount = useMemo(() => {
    return applications.filter((a: any) =>
      a.screening_status === 'Ready To Interview' &&
      a.interview_status === 'Rejected'
    ).length;
  }, [applications]);

  // Handle status update - opens date picker for scheduling
  const handleStatusUpdate = async (appId: number, interviewStatus: string, app?: any) => {
    if (interviewStatus === 'Scheduled') {
      // Open the scheduling dialog instead of immediately updating
      setSchedulingAppId(appId);
      setSchedulingCandidate(app?.candidate_name || 'Candidate');
      setInterviewDate('');
      setInterviewTime('');
      setScheduleDialogOpen(true);
      return;
    }

    try {
      const updateData: any = { interview_status: interviewStatus };

      const res = await fetch(buildApiUrl(API_ENDPOINTS.APPLICATIONS, appId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (!res.ok) throw new Error('Failed to update');

      await fetchApplications();

      if (interviewStatus === 'Rejected') {
        toast({
          title: 'Marked as Rejected',
          description: 'Candidate hidden from list (retained in database)'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive'
      });
    }
  };

  // Confirm interview scheduling with date
  const confirmInterviewSchedule = async () => {
    if (!schedulingAppId || !interviewDate) {
      toast({
        title: 'Date Required',
        description: 'Please select an interview date',
        variant: 'destructive'
      });
      return;
    }

    setScheduling(true);
    try {
      const updateData: any = {
        interview_status: 'Scheduled',
        interview_date: interviewDate
      };

      if (interviewTime) {
        updateData.interview_time = interviewTime;
      }

      const res = await fetch(buildApiUrl(API_ENDPOINTS.APPLICATIONS, schedulingAppId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (!res.ok) throw new Error('Failed to schedule interview');

      await fetchApplications();

      setScheduleDialogOpen(false);
      setSchedulingAppId(null);
      setSchedulingCandidate('');
      setInterviewDate('');
      setInterviewTime('');

      toast({
        title: '🎉 Interview Scheduled!',
        description: `Interview scheduled for ${new Date(interviewDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to schedule interview',
        variant: 'destructive'
      });
    } finally {
      setScheduling(false);
    }
  };

  // Filter by search and sourced by
  const filteredApplications = useMemo(() => {
    let filtered = readyApplications;

    // Filter by sourced by
    if (sourcedByFilter && sourcedByFilter !== 'all') {
      filtered = filtered.filter((app: any) => app.sourced_by === sourcedByFilter);
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter((app: any) =>
        app.candidate_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.candidate_phone?.includes(searchQuery)
      );
    }

    return filtered;
  }, [readyApplications, searchQuery, sourcedByFilter]);

  const RECRUITERS = [
    'Muni Divya',
    'Surya K',
    'Thameem Ansari',
    'Nandhini Kumaravel',
    'Dhivya V',
    'Gokulakrishna V',
    'Snehal Prakash',
    'Selvaraj Veilumuthu'
  ];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Repopulate form when editing candidate changes
  useEffect(() => {
    if (editingCandidate && editDialogOpen) {
      setEditForm({
        select_languages: editingCandidate.select_languages ? (typeof editingCandidate.select_languages === 'string' ? editingCandidate.select_languages.split(',').map((s: string) => s.trim()).filter(Boolean) : editingCandidate.select_languages) : [],
        educational_quality: editingCandidate.educational_quality || '',
        work_experience: editingCandidate.work_experience || '',
        additional_months: editingCandidate.additional_months || '',
        technical_professional_skills: editingCandidate.technical_professional_skills || '',
        preferred_industries_categories: editingCandidate.preferred_industries_categories || '',
        preferred_employment_types: editingCandidate.preferred_employment_types ? (typeof editingCandidate.preferred_employment_types === 'string' ? editingCandidate.preferred_employment_types.split(',').map((s: string) => s.trim()).filter(Boolean) : editingCandidate.preferred_employment_types) : [],
        preferred_work_types: editingCandidate.preferred_work_types || ''
      });
    }
  }, [editingCandidate, editDialogOpen]);

  const handleEdit = (app: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const candidate = candidates.find((c: any) => c.id === app.candidate_id);
    if (candidate) {
      setEditingCandidate(candidate);
      setEditDialogOpen(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingCandidate) return;

    setSaving(true);
    try {
      const candidatePayload: any = {
        select_languages: editForm.select_languages.length > 0 ? editForm.select_languages.join(',') : '',
        educational_quality: editForm.educational_quality || '',
        work_experience: editForm.work_experience || null,
        additional_months: editForm.additional_months || null,
        technical_professional_skills: editForm.technical_professional_skills || '',
        preferred_industries_categories: editForm.preferred_industries_categories || '',
        preferred_employment_types: editForm.preferred_employment_types.length > 0 ? editForm.preferred_employment_types.join(',') : '',
        preferred_work_types: editForm.preferred_work_types || ''
      };

      const candidateRes = await fetch(buildApiUrl(API_ENDPOINTS.CANDIDATES, editingCandidate.id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(candidatePayload),
      });

      if (!candidateRes.ok) {
        const errorData = await candidateRes.json();
        throw new Error(errorData.detail || 'Failed to update candidate');
      }

      await Promise.all([fetchCandidates(), fetchApplications()]);

      setEditDialogOpen(false);
      setEditingCandidate(null);

      toast({
        title: "Success",
        description: "Candidate profile updated successfully",
      });
    } catch (err: any) {
      console.error('Save edit error:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to update candidate",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const LANGUAGES = ['English', 'Hindi', 'Bengali', 'Marathi', 'Telugu', 'Tamil', 'Gujarati', 'Urdu', 'Kannada', 'Odia', 'Malayalam', 'Punjabi', 'Assamese', 'Maithili', 'Nepali', 'Konkani'];
  const EMPLOYMENT_TYPES = ['Full Time', 'Part Time', 'Contract', 'Internship', 'Freelance'];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4 border-b bg-background sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto w-full flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ready to Interview</h1>
            <p className="text-muted-foreground">Candidates ready for interview scheduling</p>
          </div>
        </div>
      </div>

      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-auto p-6 pt-4">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 max-w-2xl">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Total Ready
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">{readyApplications.length}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Rejected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-900">
                  {rejectedCount}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name, job, company, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={sourcedByFilter} onValueChange={setSourcedByFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Sourced By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Recruiters</SelectItem>
                    {RECRUITERS.map((recruiter) => (
                      <SelectItem key={recruiter} value={recruiter}>
                        {recruiter}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Applications Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Ready to Interview ({filteredApplications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="max-h-[600px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                      <TableRow>
                        <TableHead className="w-[50px]">S.No</TableHead>
                        <TableHead>Candidate</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Job Title</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Applied On</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                            No candidates ready for interview
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredApplications.map((app: any, index: number) => (
                          <TableRow
                            key={app.id}
                            className="hover:bg-gray-50"
                          >
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell
                              className="cursor-pointer"
                              onClick={() => navigate(`/applications/${app.id}`)}
                            >
                              <div className="font-medium">{app.candidate_name}</div>
                              <div className="text-xs text-gray-500">{app.candidate_city}</div>
                            </TableCell>
                            <TableCell className="text-sm">{app.candidate_phone || '-'}</TableCell>
                            <TableCell className="font-medium">{app.job_title}</TableCell>
                            <TableCell>{app.company}</TableCell>
                            <TableCell>{formatDate(app.applied_on)}</TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Select
                                value={app.interview_status || 'Pending'}
                                onValueChange={(value) => handleStatusUpdate(app.id, value, app)}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pending">Pending</SelectItem>
                                  <SelectItem value="Scheduled">
                                    <span className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-blue-500" />
                                      Interview Scheduled
                                    </span>
                                  </SelectItem>
                                  <SelectItem value="Rejected">Rejected</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => handleEdit(app, e)}
                                className="h-8 w-8"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
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

        </div>
      </div>

      {/* Edit Candidate Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="bg-gradient-to-r from-green-50 to-emerald-50 -m-6 p-6 mb-6">
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Edit className="h-6 w-6 text-green-600" />
              Edit Professional Profile
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Update candidate professional information
            </p>
          </DialogHeader>

          <div className="space-y-6">
            {/* Languages */}
            <div>
              <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                <Languages className="h-5 w-5 text-green-600" />
                Languages Known
              </Label>
              <div className="grid grid-cols-4 gap-3">
                {LANGUAGES.map((lang) => (
                  <div key={lang} className="flex items-center space-x-2">
                    <Checkbox
                      id={`lang-${lang}`}
                      checked={editForm.select_languages.includes(lang)}
                      onCheckedChange={(checked) => {
                        setEditForm({
                          ...editForm,
                          select_languages: checked
                            ? [...editForm.select_languages, lang]
                            : editForm.select_languages.filter((l) => l !== lang)
                        });
                      }}
                    />
                    <label htmlFor={`lang-${lang}`} className="text-sm cursor-pointer">{lang}</label>
                  </div>
                ))}
              </div>
              {editForm.select_languages.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {editForm.select_languages.map((lang) => (
                    <Badge key={lang} variant="outline" className="bg-emerald-50 text-emerald-700">
                      {lang}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Education */}
            <div>
              <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                Educational Qualification
              </Label>
              <Select value={editForm.educational_quality} onValueChange={(val) => setEditForm({ ...editForm, educational_quality: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Below 10th">Below 10th</SelectItem>
                  <SelectItem value="10th Pass">10th Pass</SelectItem>
                  <SelectItem value="12th Pass">12th Pass</SelectItem>
                  <SelectItem value="Diploma">Diploma</SelectItem>
                  <SelectItem value="Bachelor's 3yr">Bachelor's 3yr</SelectItem>
                  <SelectItem value="Bachelor's 4yr">Bachelor's 4yr</SelectItem>
                  <SelectItem value="Master's">Master's</SelectItem>
                  <SelectItem value="Doctorate">Doctorate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Work Experience */}
            <div>
              <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-purple-600" />
                Work Experience
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="years" className="text-sm">Years</Label>
                  <Input
                    id="years"
                    type="number"
                    min="0"
                    value={editForm.work_experience}
                    onChange={(e) => setEditForm({ ...editForm, work_experience: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="months" className="text-sm">Additional Months (0-11)</Label>
                  <Input
                    id="months"
                    type="number"
                    min="0"
                    max="11"
                    value={editForm.additional_months}
                    onChange={(e) => setEditForm({ ...editForm, additional_months: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Technical Skills */}
            <div>
              <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                <Code className="h-5 w-5 text-orange-600" />
                Technical & Professional Skills
              </Label>
              <textarea
                value={editForm.technical_professional_skills}
                onChange={(e) => setEditForm({ ...editForm, technical_professional_skills: e.target.value })}
                placeholder="Python, JavaScript, React, Node.js, SQL, AWS..."
                className="w-full min-h-[100px] p-3 border rounded-md"
              />
            </div>

            <Separator />

            {/* Preferred Industries */}
            <div>
              <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                <Factory className="h-5 w-5 text-cyan-600" />
                Preferred Industries/Categories
              </Label>
              <textarea
                value={editForm.preferred_industries_categories}
                onChange={(e) => setEditForm({ ...editForm, preferred_industries_categories: e.target.value })}
                placeholder="IT, Healthcare, Finance, Education..."
                className="w-full min-h-[80px] p-3 border rounded-md"
              />
            </div>

            <Separator />

            {/* Preferred Employment Types */}
            <div>
              <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                <Layers className="h-5 w-5 text-teal-600" />
                Preferred Employment Types
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {EMPLOYMENT_TYPES.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`emp-${type}`}
                      checked={editForm.preferred_employment_types.includes(type)}
                      onCheckedChange={(checked) => {
                        setEditForm({
                          ...editForm,
                          preferred_employment_types: checked
                            ? [...editForm.preferred_employment_types, type]
                            : editForm.preferred_employment_types.filter((t) => t !== type)
                        });
                      }}
                    />
                    <label htmlFor={`emp-${type}`} className="text-sm cursor-pointer">{type}</label>
                  </div>
                ))}
              </div>
              {editForm.preferred_employment_types.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {editForm.preferred_employment_types.map((type) => (
                    <Badge key={type} variant="outline" className="bg-teal-50 text-teal-700">
                      {type}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Preferred Work Mode */}
            <div>
              <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                <MapPin className="h-5 w-5 text-violet-600" />
                Preferred Work Mode
              </Label>
              <Select value={editForm.preferred_work_types} onValueChange={(val) => setEditForm({ ...editForm, preferred_work_types: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select work mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Remote">🏠 Remote</SelectItem>
                  <SelectItem value="Office">🏢 Office</SelectItem>
                  <SelectItem value="Hybrid">🔄 Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={saving}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 min-w-[120px]"
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
        </DialogContent>
      </Dialog>

      {/* Interview Scheduling Dialog - Stunning Design */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="max-w-md overflow-hidden p-0">
          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 text-white relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Schedule Interview</h2>
                  <p className="text-white/80 text-sm">Set the interview date and time</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <p className="text-sm text-white/90">Candidate:</p>
                <p className="font-semibold text-lg">{schedulingCandidate}</p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            {/* Date Picker - Enhanced */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg shadow-md">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Interview Date
                </span>
                <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="h-14 text-lg border-2 border-gray-200 focus:border-purple-500 rounded-xl transition-all shadow-sm hover:shadow-md focus:shadow-lg pl-4 pr-4"
                />
              </div>
              {interviewDate && (
                <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                  <p className="text-sm text-green-700 flex items-center gap-2 font-medium">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    {new Date(interviewDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Date Selection - Enhanced */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <span className="w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></span>
                Quick Select
                <span className="flex-1 h-0.5 bg-gray-200 rounded"></span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Today', days: 0, icon: '📅' },
                  { label: 'Tomorrow', days: 1, icon: '🌅' },
                  { label: '+2 Days', days: 2, icon: '📆' },
                  { label: '+1 Week', days: 7, icon: '📅' }
                ].map(({ label, days, icon }) => {
                  const date = new Date();
                  date.setDate(date.getDate() + days);
                  const dateStr = date.toISOString().split('T')[0];
                  const isSelected = interviewDate === dateStr;
                  return (
                    <Button
                      key={label}
                      variant="outline"
                      onClick={() => setInterviewDate(dateStr)}
                      className={`h-12 transition-all duration-300 ${isSelected
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-lg scale-[1.02]'
                          : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-purple-300'
                        }`}
                    >
                      <span className="mr-2">{icon}</span>
                      {label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 pt-0 flex gap-3">
            <Button
              variant="outline"
              onClick={() => setScheduleDialogOpen(false)}
              disabled={scheduling}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmInterviewSchedule}
              disabled={scheduling || !interviewDate}
              className="flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              {scheduling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  Confirm Interview
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
