import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Calendar, CheckCircle2, XCircle, Clock, TrendingUp, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS, buildApiUrl, API_BASE_URL } from '@/config/api';

export default function Interview() {
  const navigate = useNavigate();
  const { applications, fetchApplications } = useData();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourcedByFilter, setSourcedByFilter] = useState('all');
  const [RECRUITERS, setRecruiters] = useState<string[]>([]);
  const [INTERVIEW_STATUSES, setInterviewStatuses] = useState<string[]>([]);

  // Fetch recruiters and interview statuses from API
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [recruitersRes, statusesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/recruiters`),
          fetch(`${API_BASE_URL}/api/admin/interview-statuses`)
        ]);

        if (recruitersRes.ok) {
          const data = await recruitersRes.json();
          setRecruiters(data.filter((r: any) => r.is_active !== false).map((r: any) => r.name));
        }

        if (statusesRes.ok) {
          const data = await statusesRes.json();
          setInterviewStatuses(data.filter((s: any) => s.is_active !== false).map((s: any) => s.name));
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
      }
    };
    fetchAdminData();
  }, []);

  // Filter applications with interview_status set (exclude Selected, Rejected, and Pending as they belong to other pages)
  const interviewApplications = useMemo(() => {
    return applications.filter((a: any) =>
      a.interview_status &&
      a.interview_status !== 'Pending' &&
      a.interview_status !== 'Selected' &&
      a.interview_status !== 'Rejected'
    );
  }, [applications]);

  // Calculate interview stats
  const stats = useMemo(() => {
    const total = interviewApplications.length;
    const scheduled = interviewApplications.filter((a: any) => a.interview_status === 'Scheduled').length;
    const hold = interviewApplications.filter((a: any) => a.interview_status === 'Hold').length;
    const notAttended = interviewApplications.filter((a: any) => a.interview_status === 'Not Attended').length;
    const attended = interviewApplications.filter((a: any) => a.interview_status === 'Attended').length;
    // Count all Selected/Rejected from full applications list for reference
    const allSelected = applications.filter((a: any) => a.interview_status === 'Selected').length;
    const allRejected = applications.filter((a: any) => a.interview_status === 'Rejected').length;

    return { total, scheduled, hold, notAttended, attended, selected: allSelected, rejected: allRejected };
  }, [interviewApplications, applications]);

  // Filter by search, status, and sourced by
  const filteredApplications = useMemo(() => {
    return interviewApplications.filter((app: any) => {
      const matchesSearch =
        app.candidate_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.candidate_phone?.includes(searchQuery);

      const matchesStatus = statusFilter === 'all' || app.interview_status === statusFilter;
      const matchesSourcedBy = sourcedByFilter === 'all' || app.sourced_by === sourcedByFilter;

      return matchesSearch && matchesStatus && matchesSourcedBy;
    });
  }, [interviewApplications, searchQuery, statusFilter, sourcedByFilter]);

  // Update interview status and date
  const handleInterviewStatusUpdate = async (appId: number, interviewStatus: string, interviewDate?: string, currentApp?: any) => {
    // Find app to get previous status
    const app = currentApp || applications.find((a: any) => a.id === appId);
    const previousStatus = app?.interview_status || 'Scheduled';
    const previousAppStatus = app?.status;

    try {
      const updateData: any = { interview_status: interviewStatus };
      if (interviewDate) {
        updateData.interview_date = interviewDate;
      }

      // If Selected, move to Selected Candidates section
      if (interviewStatus === 'Selected') {
        updateData.status = 'Selected';
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
          const undoData: any = { interview_status: previousStatus };
          if (interviewStatus === 'Selected') {
            undoData.status = previousAppStatus || 'Applied';
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

      if (interviewStatus === 'Selected') {
        toast({
          title: 'Success',
          description: 'Candidate moved to Selected Candidates section',
          action: <Button variant="outline" size="sm" onClick={handleUndo}>Undo</Button>
        });
      } else if (interviewStatus === 'Rejected') {
        toast({
          title: 'Marked as Rejected',
          description: 'Candidate hidden from list (retained in database)',
          action: <Button variant="outline" size="sm" onClick={handleUndo}>Undo</Button>
        });
      } else {
        toast({
          title: 'Success',
          description: `Interview status updated to ${interviewStatus}`,
          action: <Button variant="outline" size="sm" onClick={handleUndo}>Undo</Button>
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update interview status',
        variant: 'destructive'
      });
    }
  };

  // Update interview date
  const handleDateUpdate = async (appId: number, date: string) => {
    try {
      const res = await fetch(buildApiUrl(API_ENDPOINTS.APPLICATIONS, appId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interview_date: date })
      });

      if (!res.ok) throw new Error('Failed to update');

      await fetchApplications();
      toast({
        title: 'Success',
        description: 'Interview date updated'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update interview date',
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getInterviewStatusIcon = (status: string) => {
    switch (status) {
      case 'Scheduled': return <Calendar className="w-4 h-4" />;
      case 'Hold': return <Clock className="w-4 h-4" />;
      case 'Completed': return <Clock className="w-4 h-4" />;
      case 'Selected': return <CheckCircle2 className="w-4 h-4" />;
      case 'Rejected': return <XCircle className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getInterviewStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-700';
      case 'Hold': return 'bg-yellow-100 text-yellow-700';
      case 'Completed': return 'bg-purple-100 text-purple-700';
      case 'Selected': return 'bg-green-100 text-green-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case 'Applied': return 'bg-blue-100 text-blue-700';
      case 'Shortlisted': return 'bg-purple-100 text-purple-700';
      case 'Interview': return 'bg-orange-100 text-orange-700';
      case 'Selected': return 'bg-green-100 text-green-700';
      case 'Joined': return 'bg-teal-100 text-teal-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Page Header - Sticky */}
      <div className="flex items-center justify-between p-6 pb-4 bg-white border-b sticky top-0 z-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interview Scheduled</h1>
          <p className="text-muted-foreground">Manage interview schedules and candidate assessments</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-6 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Calendar className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-700">{stats.scheduled}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hold</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-700">{stats.hold}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Not Attended</CardTitle>
              <XCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">{stats.notAttended}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attended</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">{stats.attended}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by candidate, job, company, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by interview" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Interview Status</SelectItem>
                  {INTERVIEW_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

        {/* Interview Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Interview List ({filteredApplications.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-auto relative">
              <Table>
                <TableHeader className="sticky top-0 bg-white dark:bg-gray-950 z-10 border-b">
                  <TableRow>
                    <TableHead className="w-[60px]">S.No</TableHead>
                    <TableHead className="min-w-[200px]">Candidate</TableHead>
                    <TableHead className="min-w-[180px]">Job Title</TableHead>
                    <TableHead className="min-w-[180px]">Company</TableHead>
                    <TableHead className="min-w-[200px]">Interview Status</TableHead>
                    <TableHead className="min-w-[180px]">Interview Date</TableHead>
                    <TableHead className="min-w-[180px]">Sourced By</TableHead>
                    <TableHead className="min-w-[200px]">Comments</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                        No interviews scheduled yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredApplications.map((app: any, index: number) => (
                      <TableRow
                        key={app.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => window.open(`/applications/${app.id}`, '_blank')}
                      >
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              {app.candidate_name?.charAt(0) || 'A'}
                            </div>
                            <div>
                              <div className="font-medium">{app.candidate_name || 'N/A'}</div>
                              <div className="text-sm text-muted-foreground">{app.candidate_phone || '-'}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{app.job_title || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">{app.job_location || '-'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            {app.company || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={app.interview_status || 'Scheduled'}
                            onValueChange={(value) => handleInterviewStatusUpdate(app.id, value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select status">
                                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getInterviewStatusColor(app.interview_status || 'Scheduled')}`}>
                                  {getInterviewStatusIcon(app.interview_status || 'Scheduled')}
                                  {app.interview_status || 'Scheduled'}
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {INTERVIEW_STATUSES.map((status) => (
                                <SelectItem key={status} value={status}>
                                  <div className="flex items-center gap-2">
                                    {getInterviewStatusIcon(status)}
                                    {status}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Input
                            type="date"
                            value={app.interview_date || ''}
                            onChange={(e) => handleDateUpdate(app.id, e.target.value)}
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{app.sourced_by || '-'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {app.comments || '-'}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
