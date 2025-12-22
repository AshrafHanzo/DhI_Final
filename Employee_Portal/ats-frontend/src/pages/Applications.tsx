import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Users, CheckCircle2, XCircle, Clock, UserCheck, Briefcase, AlertCircle, TrendingUp, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { API_ENDPOINTS, buildApiUrl } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';

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

const SOURCES = [
  'Linked-in',
  'Job hai',
  'Apna',
  'Meta',
  'EarlyJobs',
  'Others'
];

const SCREENING_STATUSES = [
  'Applied',
  'Ready To Interview',
  'Call Back',
  'Not Reachable',
  'Wrong Number',
  'Ringing No Response',
  'Not Fit',
  'Not Interested'
];

export default function Applications() {
  const navigate = useNavigate();
  const { applications, fetchApplications } = useData();
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

  // Calculate screening stats (excluding 11/28/2025)
  const stats = useMemo(() => {
    // First filter out applications from 11/28/2025
    const validApplications = applications.filter((a: any) => a.applied_on !== '2025-11-28');

    const total = validApplications.filter((a: any) =>
      a.screening_status !== 'Not Fit' && a.screening_status !== 'Not Interested' && a.screening_status !== 'Ready To Interview'
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

    // Calculate today's and yesterday's counts
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayCount = validApplications.filter((a: any) => {
      if (!a.applied_on) return false;
      const appliedDate = new Date(a.applied_on);
      appliedDate.setHours(0, 0, 0, 0);
      return appliedDate.getTime() === today.getTime();
    }).length;

    const yesterdayCount = validApplications.filter((a: any) => {
      if (!a.applied_on) return false;
      const appliedDate = new Date(a.applied_on);
      appliedDate.setHours(0, 0, 0, 0);
      return appliedDate.getTime() === yesterday.getTime();
    }).length;

    return { total, applied, callBack, notReachable, wrongNumber, ringingNoResponse, todayCount, yesterdayCount };
  }, [applications]);

  // Filter applications - exclude 'Not Fit', 'Not Interested' and 'Ready To Interview' from display
  const filteredApplications = useMemo(() => {
    return applications.filter((app: any) => {
      // Hide if Not Fit, Not Interested, or already moved to Ready To Interview
      if (app.screening_status === 'Not Fit' || app.screening_status === 'Not Interested' || app.screening_status === 'Ready To Interview') {
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
    try {
      const updateData: any = { screening_status: screeningStatus };

      // If Ready To Interview, also set interview_status to prepare for next stage
      if (screeningStatus === 'Ready To Interview') {
        updateData.interview_status = 'Pending';
      }

      const res = await fetch(buildApiUrl(API_ENDPOINTS.APPLICATIONS, appId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (!res.ok) throw new Error('Failed to update');

      await fetchApplications();

      if (screeningStatus === 'Ready To Interview') {
        toast({
          title: 'Success',
          description: 'Candidate moved to Ready for Interview section'
        });
      } else if (screeningStatus === 'Not Fit' || screeningStatus === 'Not Interested') {
        toast({
          title: `Marked as ${screeningStatus}`,
          description: 'Candidate hidden from applications (retained in database)'
        });
      } else {
        toast({
          title: 'Success',
          description: `Screening status updated to ${screeningStatus}`
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

  const getScreeningStatusIcon = (status: string) => {
    switch (status) {
      case 'Applied': return <AlertCircle className="w-4 h-4" />;
      case 'Ready To Interview': return <CheckCircle2 className="w-4 h-4" />;
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
      case 'Ready To Interview': return 'bg-green-100 text-green-700';
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
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
          <p className="text-sm text-muted-foreground">Manage all job applications and track candidate progress</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && selectedApps.length > 0 && (
            <Button onClick={() => setBulkAssignDialogOpen(true)} size="sm" variant="outline" className="gap-2">
              <UserCheck className="h-4 w-4" />
              Assign ({selectedApps.length})
            </Button>
          )}
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
                      {isAdmin && (
                        <TableHead className="w-[40px] whitespace-nowrap py-0.5 text-xs">
                          <input
                            type="checkbox"
                            checked={selectedApps.length === filteredApplications.length && filteredApplications.length > 0}
                            onChange={toggleSelectAll}
                            className="cursor-pointer"
                          />
                        </TableHead>
                      )}
                      <TableHead className="w-[40px] whitespace-nowrap py-0.5 text-xs">S.No</TableHead>
                      <TableHead className="min-w-[160px] whitespace-nowrap py-0.5 text-xs">Candidate</TableHead>
                      <TableHead className="min-w-[140px] whitespace-nowrap py-0.5 text-xs">Job Title</TableHead>
                      <TableHead className="min-w-[120px] whitespace-nowrap py-0.5 text-xs">Company</TableHead>
                      <TableHead className="min-w-[160px] whitespace-nowrap py-0.5 text-xs">Screening Status</TableHead>
                      <TableHead className="min-w-[140px] whitespace-nowrap py-0.5 text-xs">Assigned To</TableHead>
                      <TableHead className="min-w-[120px] whitespace-nowrap py-0.5 text-xs">Sourced From</TableHead>
                      <TableHead className="min-w-[110px] whitespace-nowrap py-0.5 text-xs">Applied On</TableHead>
                      <TableHead className="min-w-[200px] whitespace-nowrap py-0.5 text-xs">Comments</TableHead>
                      {isAdmin && <TableHead className="w-[60px] whitespace-nowrap py-0.5 text-xs">Actions</TableHead>}
                    </TableRow>
                    <TableRow className="h-9 bg-gray-50 dark:bg-gray-900">
                      {isAdmin && <TableHead className="py-0.5"></TableHead>}
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
                            <SelectItem value="Applied" className="text-xs">Applied</SelectItem>
                            <SelectItem value="Call Back" className="text-xs">Call Back</SelectItem>
                            <SelectItem value="Not Reachable" className="text-xs">Not Reachable</SelectItem>
                            <SelectItem value="Wrong Number" className="text-xs">Wrong Number</SelectItem>
                            <SelectItem value="Ringing No Response" className="text-xs">Ringing No Response</SelectItem>
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
                      {isAdmin && <TableHead className="py-0.5"></TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={isAdmin ? 11 : 10} className="h-32 text-center text-muted-foreground">
                          No applications found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredApplications.map((app: any, index: number) => (
                        <TableRow
                          key={app.id}
                          className="cursor-pointer hover:bg-muted/50 h-10"
                          onClick={() => navigate(`/applications/${app.id}`)}
                        >
                          {isAdmin && (
                            <TableCell className="py-1.5" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selectedApps.includes(app.id)}
                                onChange={() => toggleSelectApp(app.id)}
                                className="cursor-pointer"
                              />
                            </TableCell>
                          )}
                          <TableCell className="font-medium py-1.5 text-xs">{index + 1}</TableCell>
                          <TableCell className="py-1.5">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                                {app.candidate_name?.charAt(0) || 'A'}
                              </div>
                              <div>
                                <div className="font-medium text-sm">{app.candidate_name || 'N/A'}</div>
                                <div className="text-xs text-muted-foreground">{app.candidate_phone || '-'}</div>
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
                          {isAdmin && (
                            <TableCell onClick={(e) => e.stopPropagation()} className="py-1.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={(e) => handleDeleteApplication(app.id, app.candidate_name, e)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          )}
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
