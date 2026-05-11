import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Users, CheckCircle2, XCircle, Clock, UserCheck, Briefcase, AlertCircle, TrendingUp, Trash2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { API_ENDPOINTS, buildApiUrl, API_BASE_URL } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';

export default function Applications() {
  const navigate = useNavigate();
  const { applications, candidates, fetchApplications } = useData();
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [searchQuery, setSearchQuery] = useState('');
  const [screeningStatusFilter, setScreeningStatusFilter] = useState('all');
  const [jobTitleFilter, setJobTitleFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [assignedToFilter, setAssignedToFilter] = useState('');
  const [sourcedFromFilter, setSourcedFromFilter] = useState('');
  const [appliedOnFilter, setAppliedOnFilter] = useState('');
  const [selectedApps, setSelectedApps] = useState<number[]>([]);
  const [bulkAssignDialogOpen, setBulkAssignDialogOpen] = useState(false);
  const [bulkAssignTo, setBulkAssignTo] = useState('');
  const [editingComments, setEditingComments] = useState<{ [key: number]: string }>({});

  // Dynamic data from Admin Settings
  const [RECRUITERS, setRecruiters] = useState<string[]>([]);
  const [SCREENING_STATUSES, setScreeningStatuses] = useState<string[]>([]);
  const [SOURCES, setSources] = useState<string[]>([]);

  // Fetch recruiters, screening statuses, and sources from API
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [recruitersRes, statusesRes, sourcesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/recruiters`),
          fetch(`${API_BASE_URL}/api/admin/screening-statuses`),
          fetch(`${API_BASE_URL}/api/admin/sourced-from`)
        ]);

        if (recruitersRes.ok) {
          const data = await recruitersRes.json();
          setRecruiters(data.filter((r: any) => r.is_active !== false).map((r: any) => r.name));
        }

        if (statusesRes.ok) {
          const data = await statusesRes.json();
          setScreeningStatuses(data.filter((s: any) => s.is_active !== false).map((s: any) => s.name));
        }

        if (sourcesRes.ok) {
          const data = await sourcesRes.json();
          setSources(data.filter((s: any) => s.is_active !== false).map((s: any) => s.name));
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
      }
    };

    fetchAdminData();
  }, []);

  // Calculate screening stats (excluding 11/28/2025)
  const stats = useMemo(() => {
    // First filter out applications from 11/28/2025
    const validApplications = applications.filter((a: any) => a.applied_on !== '2025-11-28');

    const total = validApplications.filter((a: any) =>
      a.screening_status !== 'Not Fit' && a.screening_status !== 'Not Interested' && a.screening_status !== 'Interested'
    ).length;
    const applied = validApplications.filter((a: any) =>
      (a.screening_status === 'Applied' || !a.screening_status) && a.screening_status !== 'Not Fit' && a.screening_status !== 'Not Interested'
    ).length;
    const callBack = validApplications.filter((a: any) =>
      a.screening_status === 'Call Back'
    ).length;
    const notReachable = validApplications.filter((a: any) =>
      a.screening_status === 'Not Reachable'
    ).length;
    const wrongNumber = validApplications.filter((a: any) =>
      a.screening_status === 'Wrong Number'
    ).length;
    const ringingNoResponse = validApplications.filter((a: any) =>
      a.screening_status === 'Ringing No Response'
    ).length;

    // Calculate today's and yesterday's counts using local date strings
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Format as YYYY-MM-DD in local timezone
    const formatLocalDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const todayStr = formatLocalDate(today);
    const yesterdayStr = formatLocalDate(yesterday);

    const todayCount = validApplications.filter((a: any) => {
      return a.applied_on === todayStr;
    }).length;

    const yesterdayCount = validApplications.filter((a: any) => {
      return a.applied_on === yesterdayStr;
    }).length;

    return { total, applied, callBack, notReachable, wrongNumber, ringingNoResponse, todayCount, yesterdayCount };
  }, [applications]);

  // Filter applications - exclude 'Not Fit', 'Not Interested' and 'Ready To Interview' from display
  const filteredApplications = useMemo(() => {
    return applications.filter((app: any) => {
      // Hide if Not Fit, Not Interested, or already moved to Interested (Ready To Interview)
      if (app.screening_status === 'Not Fit' || app.screening_status === 'Not Interested' || app.screening_status === 'Interested') {
        return false;
      }

      // Exclude applications from 11/28/2025
      if (app.applied_on === '2025-11-28') {
        return false;
      }

      const matchesSearch =
        app.candidate_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.candidate_phone?.includes(searchQuery);

      const matchesScreeningStatus = screeningStatusFilter === 'all' ||
        app.screening_status === screeningStatusFilter ||
        (!app.screening_status && screeningStatusFilter === 'Applied');

      const matchesJobTitle = !jobTitleFilter || app.job_title?.toLowerCase().includes(jobTitleFilter.toLowerCase());
      const matchesCompany = !companyFilter || app.company?.toLowerCase().includes(companyFilter.toLowerCase());
      const matchesAssignedTo = !assignedToFilter || assignedToFilter === 'all' || app.sourced_by === assignedToFilter;
      const matchesSourcedFrom = !sourcedFromFilter || sourcedFromFilter === 'all' || app.sourced_from === sourcedFromFilter;
      const matchesAppliedOn = !appliedOnFilter || app.applied_on === appliedOnFilter;

      return matchesSearch && matchesScreeningStatus && matchesJobTitle && matchesCompany && matchesAssignedTo && matchesSourcedFrom && matchesAppliedOn;
    }).sort((a: any, b: any) => {
      // Sort by applied_on date descending (newest first)
      const dateA = a.applied_on ? new Date(a.applied_on).getTime() : 0;
      const dateB = b.applied_on ? new Date(b.applied_on).getTime() : 0;
      return dateB - dateA;
    });
  }, [applications, searchQuery, screeningStatusFilter, jobTitleFilter, companyFilter, assignedToFilter, sourcedFromFilter, appliedOnFilter]);

  // Detect duplicate phone numbers
  const duplicatePhones = useMemo(() => {
    const phoneCount: Record<string, number> = {};

    // Count occurrences of each phone number
    applications.forEach((app: any) => {
      if (app.candidate_phone) {
        const phone = app.candidate_phone.replace(/\D/g, ''); // Normalize phone
        if (phone.length >= 10) {
          phoneCount[phone] = (phoneCount[phone] || 0) + 1;
        }
      }
    });

    // Return set of phones that appear more than once
    return new Set(
      Object.entries(phoneCount)
        .filter(([_, count]) => count > 1)
        .map(([phone]) => phone)
    );
  }, [applications]);

  // Check if a phone number is a duplicate
  const isDuplicatePhone = (phone: string | null | undefined): boolean => {
    if (!phone) return false;
    const normalizedPhone = phone.replace(/\D/g, '');
    return normalizedPhone.length >= 10 && duplicatePhones.has(normalizedPhone);
  };

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedApps.length === filteredApplications.length) {
      setSelectedApps([]);
    } else {
      setSelectedApps(filteredApplications.map((app: any) => app.id));
    }
  };

  const toggleSelectApp = (appId: number) => {
    setSelectedApps(prev =>
      prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
    );
  };

  const handleBulkAssign = async () => {
    if (!bulkAssignTo || selectedApps.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select a recruiter and at least one application',
        variant: 'destructive'
      });
      return;
    }

    try {
      await Promise.all(
        selectedApps.map(appId =>
          fetch(buildApiUrl(API_ENDPOINTS.APPLICATIONS, appId), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sourced_by: bulkAssignTo })
          })
        )
      );

      await fetchApplications();
      setSelectedApps([]);
      setBulkAssignDialogOpen(false);
      setBulkAssignTo('');
      toast({
        title: 'Success',
        description: `Assigned ${selectedApps.length} applications to ${bulkAssignTo}`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign applications',
        variant: 'destructive'
      });
    }
  };

  // Download resumes for selected applications
  const handleDownloadResumes = async () => {
    if (selectedApps.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one application',
        variant: 'destructive'
      });
      return;
    }

    const selectedApplications = applications.filter((a: any) => selectedApps.includes(a.id));
    const candidateIds = selectedApplications.map((a: any) => a.candidate_id).filter(Boolean);
    const candidatesWithResume = candidates.filter((c: any) => candidateIds.includes(c.id) && c.resume_url);

    if (candidatesWithResume.length === 0) {
      toast({
        title: 'No Resumes',
        description: 'None of the selected candidates have resumes uploaded',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Downloading',
      description: `Downloading ${candidatesWithResume.length} resume(s)...`
    });

    // Download each resume with proper download behavior
    for (let i = 0; i < candidatesWithResume.length; i++) {
      const candidate = candidatesWithResume[i];
      try {
        // Add delay between downloads to prevent browser blocking
        await new Promise(resolve => setTimeout(resolve, i * 800));

        const response = await fetch(`${API_BASE_URL}${candidate.resume_url}`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `${candidate.full_name}_resume.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error(`Failed to download resume for ${candidate.full_name}:`, error);
      }
    }

    toast({
      title: 'Complete',
      description: `Downloaded ${candidatesWithResume.length} resume(s)`
    });
  };

  // Update field handler
  const handleFieldUpdate = async (appId: number, field: string, value: string) => {
    try {
      const res = await fetch(buildApiUrl(API_ENDPOINTS.APPLICATIONS, appId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });

      if (!res.ok) throw new Error('Failed to update');

      await fetchApplications();
      toast({
        title: 'Success',
        description: `${field.replace('_', ' ')} updated successfully`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update application',
        variant: 'destructive'
      });
    }
  };

  // Update screening status
  const handleScreeningStatusUpdate = async (appId: number, screeningStatus: string) => {
    // Find the application to check validation
    const app = applications.find((a: any) => a.id === appId);
    const previousStatus = app?.screening_status || 'Under Screening';

    // Validation: Require Assigned To and Applied On for Interested (Ready To Interview)
    if (screeningStatus === 'Interested') {
      if (!app?.sourced_by || app.sourced_by.trim() === '') {
        toast({
          title: 'Validation Error',
          description: 'Please assign this application to a recruiter (Assigned To) before marking as Interested',
          variant: 'destructive'
        });
        return;
      }
      if (!app?.applied_on || app.applied_on.trim() === '') {
        toast({
          title: 'Validation Error',
          description: 'Please set the Applied On date before marking as Interested',
          variant: 'destructive'
        });
        return;
      }
    }

    try {
      const updateData: any = { screening_status: screeningStatus };

      // If Interested (Ready To Interview), also set interview_status to prepare for next stage
      if (screeningStatus === 'Interested') {
        updateData.interview_status = 'Pending';
      }

      const res = await fetch(buildApiUrl(API_ENDPOINTS.APPLICATIONS, appId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (!res.ok) throw new Error('Failed to update');

      await fetchApplications();

      // Undo function
      const handleUndo = async () => {
        try {
          const undoData: any = { screening_status: previousStatus };
          // If reverting from Interested, clear interview_status
          if (screeningStatus === 'Interested' && previousStatus !== 'Interested') {
            undoData.interview_status = null;
          }
          await fetch(buildApiUrl(API_ENDPOINTS.APPLICATIONS, appId), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(undoData)
          });
          await fetchApplications();
          toast({
            title: 'Undone',
            description: `Status reverted to ${previousStatus}`
          });
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to undo status change',
            variant: 'destructive'
          });
        }
      };

      if (screeningStatus === 'Interested') {
        toast({
          title: 'Success',
          description: 'Candidate moved to Ready for Interview section',
          action: <Button variant="outline" size="sm" onClick={handleUndo}>Undo</Button>
        });
      } else if (screeningStatus === 'Not Fit' || screeningStatus === 'Not Interested') {
        toast({
          title: `Marked as ${screeningStatus}`,
          description: 'Candidate hidden from applications (retained in database)',
          action: <Button variant="outline" size="sm" onClick={handleUndo}>Undo</Button>
        });
      } else {
        toast({
          title: 'Success',
          description: `Screening status updated to ${screeningStatus}`,
          action: <Button variant="outline" size="sm" onClick={handleUndo}>Undo</Button>
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update screening status',
        variant: 'destructive'
      });
    }
  };

  // Update comments
  const handleCommentsUpdate = async (appId: number, comments: string) => {
    try {
      const res = await fetch(buildApiUrl(API_ENDPOINTS.APPLICATIONS, appId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comments: comments })
      });

      if (!res.ok) throw new Error('Failed to update');

      await fetchApplications();

      toast({
        title: 'Success',
        description: 'Comments updated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update comments',
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Delete application handler (Admin only)
  const handleDeleteApplication = async (appId: number, candidateName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete the application for ${candidateName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(buildApiUrl(API_ENDPOINTS.APPLICATIONS, appId), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) throw new Error('Failed to delete');

      await fetchApplications();
      toast({
        title: 'Deleted',
        description: `Application for ${candidateName} has been deleted`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete application',
        variant: 'destructive'
      });
    }
  };

  // Bulk delete applications handler (Admin only)
  const handleBulkDelete = async () => {
    if (selectedApps.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one application to delete',
        variant: 'destructive'
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedApps.length} application(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      await Promise.all(
        selectedApps.map(appId =>
          fetch(buildApiUrl(API_ENDPOINTS.APPLICATIONS, appId), {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
          })
        )
      );

      await fetchApplications();
      const count = selectedApps.length;
      setSelectedApps([]);
      toast({
        title: 'Deleted',
        description: `Successfully deleted ${count} application(s)`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete some applications',
        variant: 'destructive'
      });
    }
  };

  const getScreeningStatusIcon = (status: string) => {
    switch (status) {
      case 'Applied': return <AlertCircle className="w-4 h-4" />;
      case 'Interested': return <CheckCircle2 className="w-4 h-4" />;
      case 'Call Back': return <Clock className="w-4 h-4" />;
      case 'Not Reachable': return <XCircle className="w-4 h-4" />;
      case 'Wrong Number': return <XCircle className="w-4 h-4" />;
      case 'Ringing No Response': return <Clock className="w-4 h-4" />;
      case 'Not Fit': return <XCircle className="w-4 h-4" />;
      case 'Not Interested': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getScreeningStatusColor = (status: string) => {
    switch (status) {
      case 'Applied': return 'bg-sky-100 text-sky-700';
      case 'Interested': return 'bg-green-100 text-green-700';
      case 'Call Back': return 'bg-amber-100 text-amber-700';
      case 'Not Reachable': return 'bg-orange-100 text-orange-700';
      case 'Wrong Number': return 'bg-rose-100 text-rose-700';
      case 'Ringing No Response': return 'bg-purple-100 text-purple-700';
      case 'Not Fit': return 'bg-red-100 text-red-700';
      case 'Not Interested': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-3 pb-8">
      {/* Page Header */}
      <div className="flex items-center justify-between px-6 pt-3">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
            <p className="text-sm text-muted-foreground">Manage all job applications and track candidate progress</p>
          </div>
          {/* Bulk Actions - Left Side */}
          {selectedApps.length > 0 && (
            <div className="flex items-center gap-2 ml-4 pl-4 border-l">
              <Button onClick={handleDownloadResumes} size="sm" variant="outline" className="gap-2 border-blue-500 text-blue-600 hover:bg-blue-50">
                <Download className="h-4 w-4" />
                Download Resumes ({selectedApps.length})
              </Button>
              <Button onClick={() => setBulkAssignDialogOpen(true)} size="sm" variant="outline" className="gap-2">
                <UserCheck className="h-4 w-4" />
                Assign ({selectedApps.length})
              </Button>
              {isAdmin && (
                <Button onClick={handleBulkDelete} size="sm" variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete ({selectedApps.length})
                </Button>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/add-application')} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Application
          </Button>
        </div>
      </div>

      {/* Stats Cards & Search */}
      <div className="px-6">
        <div className="flex flex-col gap-3">
          {/* Stats Cards - All 8 in one row */}
          <div className="grid grid-cols-8 gap-2">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3">
                <CardTitle className="text-xs font-medium">Total</CardTitle>
                <Users className="h-3 w-3 text-blue-600" />
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-xl font-bold text-blue-700">{stats.total}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-sky-50 to-sky-100 border-sky-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3">
                <CardTitle className="text-xs font-medium">Applied</CardTitle>
                <AlertCircle className="h-3 w-3 text-sky-600" />
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-xl font-bold text-sky-700">{stats.applied}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3">
                <CardTitle className="text-xs font-medium">Call Back</CardTitle>
                <Clock className="h-3 w-3 text-amber-600" />
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-xl font-bold text-amber-700">{stats.callBack}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3">
                <CardTitle className="text-xs font-medium">Not Reachable</CardTitle>
                <XCircle className="h-3 w-3 text-orange-600" />
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-xl font-bold text-orange-700">{stats.notReachable}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3">
                <CardTitle className="text-xs font-medium">Wrong Number</CardTitle>
                <XCircle className="h-3 w-3 text-rose-600" />
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-xl font-bold text-rose-700">{stats.wrongNumber}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3">
                <CardTitle className="text-xs font-medium">Ringing No Response</CardTitle>
                <Clock className="h-3 w-3 text-purple-600" />
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-xl font-bold text-purple-700">{stats.ringingNoResponse}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3">
                <CardTitle className="text-xs font-medium">Today Count</CardTitle>
                <TrendingUp className="h-3 w-3 text-green-600" />
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-xl font-bold text-green-700">{stats.todayCount}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3">
                <CardTitle className="text-xs font-medium">Yesterday</CardTitle>
                <Clock className="h-3 w-3 text-teal-600" />
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-xl font-bold text-teal-700">{stats.yesterdayCount}</div>
              </CardContent>
            </Card>
          </div>

          {/* Search only */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by candidate, job, company, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="px-6">
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4" />
              Applications List ({filteredApplications.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative w-full">
              <div className="overflow-x-auto overflow-y-auto border rounded-md" style={{ maxHeight: 'calc(100vh - 320px)' }}>
                <Table className="min-w-max">
                  <TableHeader className="sticky top-0 bg-white dark:bg-gray-950 z-10 border-b">
                    <TableRow className="h-8">
                      <TableHead className="w-[40px] whitespace-nowrap py-0.5 text-xs">
                        <input
                          type="checkbox"
                          checked={selectedApps.length === filteredApplications.length && filteredApplications.length > 0}
                          onChange={toggleSelectAll}
                          className="cursor-pointer"
                        />
                      </TableHead>
                      <TableHead className="w-[40px] whitespace-nowrap py-0.5 text-xs">S.No</TableHead>
                      <TableHead className="min-w-[160px] whitespace-nowrap py-0.5 text-xs">Candidate</TableHead>
                      <TableHead className="min-w-[140px] whitespace-nowrap py-0.5 text-xs">Job Title</TableHead>
                      <TableHead className="min-w-[120px] whitespace-nowrap py-0.5 text-xs">Company</TableHead>
                      <TableHead className="min-w-[160px] whitespace-nowrap py-0.5 text-xs">Screening Status</TableHead>
                      <TableHead className="min-w-[140px] whitespace-nowrap py-0.5 text-xs">Assigned To</TableHead>
                      <TableHead className="min-w-[120px] whitespace-nowrap py-0.5 text-xs">Sourced From</TableHead>
                      <TableHead className="min-w-[110px] whitespace-nowrap py-0.5 text-xs">Applied On</TableHead>
                      <TableHead className="min-w-[200px] whitespace-nowrap py-0.5 text-xs">Comments</TableHead>
                    </TableRow>
                    <TableRow className="h-9 bg-gray-50 dark:bg-gray-900">
                      <TableHead className="py-0.5"></TableHead>
                      <TableHead className="py-0.5"></TableHead>
                      <TableHead className="py-0.5"></TableHead>
                      <TableHead className="py-0.5">
                        <Input
                          placeholder="Filter..."
                          value={jobTitleFilter}
                          onChange={(e) => setJobTitleFilter(e.target.value)}
                          className="h-7 text-xs"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableHead>
                      <TableHead className="py-0.5">
                        <Input
                          placeholder="Filter..."
                          value={companyFilter}
                          onChange={(e) => setCompanyFilter(e.target.value)}
                          className="h-7 text-xs"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableHead>
                      <TableHead className="py-0.5">
                        <Select value={screeningStatusFilter} onValueChange={setScreeningStatusFilter}>
                          <SelectTrigger className="h-7 text-xs" onClick={(e) => e.stopPropagation()}>
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all" className="text-xs">All Status</SelectItem>
                            {SCREENING_STATUSES.map((status) => (
                              <SelectItem key={status} value={status} className="text-xs">
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableHead>
                      <TableHead className="py-0.5">
                        <Select
                          value={assignedToFilter}
                          onValueChange={setAssignedToFilter}
                        >
                          <SelectTrigger className="h-7 text-xs" onClick={(e) => e.stopPropagation()}>
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all" className="text-xs">All</SelectItem>
                            {RECRUITERS.map((recruiter) => (
                              <SelectItem key={recruiter} value={recruiter} className="text-xs">
                                {recruiter}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableHead>
                      <TableHead className="py-0.5">
                        <Select
                          value={sourcedFromFilter}
                          onValueChange={setSourcedFromFilter}
                        >
                          <SelectTrigger className="h-7 text-xs" onClick={(e) => e.stopPropagation()}>
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all" className="text-xs">All</SelectItem>
                            {SOURCES.map((source) => (
                              <SelectItem key={source} value={source} className="text-xs">
                                {source}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableHead>
                      <TableHead className="py-0.5">
                        <Input
                          type="date"
                          value={appliedOnFilter}
                          onChange={(e) => setAppliedOnFilter(e.target.value)}
                          className="h-7 text-xs"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableHead>
                      <TableHead className="py-0.5"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                          No applications found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredApplications.map((app: any, index: number) => (
                        <TableRow
                          key={app.id}
                          className={`cursor-pointer hover:bg-muted/50 h-10 ${isDuplicatePhone(app.candidate_phone) ? 'bg-orange-50 border-l-4 border-l-orange-400' : ''}`}
                          onClick={() => window.open(`/applications/${app.id}`, '_blank')}
                        >
                          <TableCell className="py-1.5" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedApps.includes(app.id)}
                              onChange={() => toggleSelectApp(app.id)}
                              className="cursor-pointer"
                            />
                          </TableCell>
                          <TableCell className="font-medium py-1.5 text-xs">{index + 1}</TableCell>
                          <TableCell className="py-1.5">
                            <div className="flex items-center gap-2">
                              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${isDuplicatePhone(app.candidate_phone) ? 'bg-orange-500 text-white' : 'bg-primary text-primary-foreground'}`}>
                                {app.candidate_name?.charAt(0) || 'A'}
                              </div>
                              <div>
                                <div className="font-medium text-sm">{app.candidate_name || 'N/A'}</div>
                                <div className="flex items-center gap-1">
                                  <span className={`text-xs ${isDuplicatePhone(app.candidate_phone) ? 'text-orange-600 font-medium' : 'text-muted-foreground'}`}>
                                    {app.candidate_phone || '-'}
                                  </span>
                                  {isDuplicatePhone(app.candidate_phone) && (
                                    <span className="text-[9px] px-1.5 py-0.5 bg-orange-500 text-white rounded-full font-medium">Duplicate</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-1.5">
                            <div className="font-medium text-xs">{app.job_title || 'N/A'}</div>
                            <div className="text-[10px] text-muted-foreground">{app.job_location || '-'}</div>
                          </TableCell>
                          <TableCell className="py-1.5">
                            <div className="flex items-center gap-1.5 text-xs">
                              <Briefcase className="h-3 w-3 text-muted-foreground" />
                              {app.company || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()} className="py-1.5">
                            <Select
                              value={app.screening_status || 'Applied'}
                              onValueChange={(value) => handleScreeningStatusUpdate(app.id, value)}
                            >
                              <SelectTrigger className="border-0 bg-transparent p-0 h-auto w-auto focus:ring-0 shadow-none">
                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 ${getScreeningStatusColor(app.screening_status || 'Applied')}`}>
                                  {getScreeningStatusIcon(app.screening_status || 'Applied')}
                                  {app.screening_status || 'Applied'}
                                </div>
                              </SelectTrigger>
                              <SelectContent>
                                {SCREENING_STATUSES.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    <div className="flex items-center gap-2">
                                      {getScreeningStatusIcon(status)}
                                      {status}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()} className="py-1.5">
                            <Select
                              value={app.sourced_by || ''}
                              onValueChange={(value) => handleFieldUpdate(app.id, 'sourced_by', value)}
                            >
                              <SelectTrigger className="w-full h-7 text-xs">
                                <SelectValue placeholder="Select Assigned To" />
                              </SelectTrigger>
                              <SelectContent>
                                {RECRUITERS.map((recruiter) => (
                                  <SelectItem key={recruiter} value={recruiter} className="text-xs">
                                    {recruiter}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()} className="py-1.5">
                            <Select
                              value={app.sourced_from || ''}
                              onValueChange={(value) => handleFieldUpdate(app.id, 'sourced_from', value)}
                            >
                              <SelectTrigger className="w-full h-7 text-xs">
                                <SelectValue placeholder="Select source" />
                              </SelectTrigger>
                              <SelectContent>
                                {SOURCES.map((source) => (
                                  <SelectItem key={source} value={source} className="text-xs">
                                    {source}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()} className="py-1.5">
                            <Input
                              type="date"
                              value={app.applied_on || ''}
                              onChange={(e) => handleFieldUpdate(app.id, 'applied_on', e.target.value)}
                              className="w-full h-7 text-xs"
                            />
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()} className="py-1.5">
                            <Input
                              value={editingComments[app.id] !== undefined ? editingComments[app.id] : (app.comments || '')}
                              onChange={(e) => setEditingComments({ ...editingComments, [app.id]: e.target.value })}
                              onBlur={() => {
                                if (editingComments[app.id] !== undefined && editingComments[app.id] !== app.comments) {
                                  handleCommentsUpdate(app.id, editingComments[app.id]);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.currentTarget.blur();
                                }
                              }}
                              placeholder="Add comments..."
                              className="w-full h-7 text-xs"
                            />
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

      {/* Bulk Assignment Dialog */}
      <Dialog open={bulkAssignDialogOpen} onOpenChange={setBulkAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Assign Applications ({selectedApps.length})</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Assign To</Label>
              <Select value={bulkAssignTo} onValueChange={setBulkAssignTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Select recruiter" />
                </SelectTrigger>
                <SelectContent>
                  {RECRUITERS.map((recruiter) => (
                    <SelectItem key={recruiter} value={recruiter}>
                      {recruiter}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setBulkAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBulkAssign}>
                Assign Applications
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
