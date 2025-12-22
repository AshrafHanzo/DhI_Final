import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  Search,
  Users,
  CheckCircle2,
  Send,
  UserCheck,
  UserX,
  Calendar,
  Clock,
  TrendingUp,
  Award
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS, buildApiUrl } from '@/config/api';

const JOINED_STATUSES = [
  'Joined',
  'Left'
];

const FILTER_STATUSES = [
  'Joined'
];

export default function Joined() {
  const navigate = useNavigate();
  const { applications = [], fetchApplications } = useData();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourcedByFilter, setSourcedByFilter] = useState('all');

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

  // Filter applications with "Joined" main status
  // Show only "Joined" status, hide "Left" and "Not Joined" from UI
  const joinedApplications = useMemo(() => {
    return applications.filter((a: any) =>
      a.status === 'Joined' && a.joined_status === 'Joined'
    );
  }, [applications]);

  // Calculate joined stats - count Left from ALL applications with status='Joined'
  const stats = useMemo(() => {
    const allJoinedStatus = applications.filter((a: any) => a.status === 'Joined');
    const total = joinedApplications.length;
    const joined = joinedApplications.filter((a: any) => a.joined_status === 'Joined').length;
    const left = allJoinedStatus.filter((a: any) => a.joined_status === 'Left').length;

    return { total, joined, left };
  }, [joinedApplications, applications]);

  // Filter by search, status, and sourced by
  const filteredApplications = useMemo(() => {
    return joinedApplications.filter((app: any) => {
      const matchesSearch =
        app.candidate_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.candidate_phone?.includes(searchQuery);

      const matchesStatus = statusFilter === 'all' || app.joined_status === statusFilter;
      const matchesSourcedBy = sourcedByFilter === 'all' || app.sourced_by === sourcedByFilter;

      return matchesSearch && matchesStatus && matchesSourcedBy;
    });
  }, [joinedApplications, searchQuery, statusFilter, sourcedByFilter]);

  // Update joined status
  const handleJoinedStatusUpdate = async (appId: number, joinedStatus: string) => {
    try {
      // If Left, keep in DB but hide from UI
      if (joinedStatus === 'Left') {
        const res = await fetch(buildApiUrl(API_ENDPOINTS.APPLICATIONS, appId), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            joined_status: 'Left'
          })
        });

        if (!res.ok) throw new Error('Failed to update');

        await fetchApplications();
        toast({
          title: 'Marked as Left',
          description: 'Candidate hidden from list (retained in database)'
        });
        return;
      }

      const updateData: any = { joined_status: joinedStatus };

      // If status is "Joined", ensure joining_date is set
      if (joinedStatus === 'Joined') {
        const app = applications.find((a: any) => a.id === appId);
        if (!app?.joining_date) {
          updateData.joining_date = new Date().toISOString().split('T')[0];
        }
      }

      const res = await fetch(buildApiUrl(API_ENDPOINTS.APPLICATIONS, appId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (!res.ok) throw new Error('Failed to update');

      await fetchApplications();

      if (joinedStatus === 'Joined') {
        toast({
          title: 'Tenure Started',
          description: 'Candidate marked as Joined - Tenure and commission calculation started'
        });
      } else {
        toast({
          title: 'Success',
          description: `Status updated to ${joinedStatus}`
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

  // Update joining date
  const handleJoiningDateUpdate = async (appId: number, date: string) => {
    try {
      const res = await fetch(buildApiUrl(API_ENDPOINTS.APPLICATIONS, appId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ joining_date: date })
      });

      if (!res.ok) throw new Error('Failed to update');

      await fetchApplications();
      toast({
        title: 'Success',
        description: 'Joining date updated'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update joining date',
        variant: 'destructive'
      });
    }
  };

  // Calculate tenure (days since joining)
  const calculateTenure = (joiningDate: string) => {
    if (!joiningDate) return null;

    const join = new Date(joiningDate);
    const today = new Date();
    const totalDays = Math.floor((today.getTime() - join.getTime()) / (1000 * 60 * 60 * 24));

    if (totalDays < 0) return null;

    const years = Math.floor(totalDays / 365);
    const months = Math.floor((totalDays % 365) / 30);
    const days = (totalDays % 365) % 30;

    if (years > 0) {
      return `${years}y ${months}m`;
    } else if (months > 0) {
      return `${months}m ${days}d`;
    } else {
      return `${days}d`;
    }
  };

  // Calculate lock-in period based on job tenure (in days)
  const calculateLockInProgress = (joiningDate: string, jobTenure: string | number) => {
    if (!joiningDate || !jobTenure) return null;

    // Convert tenure to days (assuming it's stored as number of days, max 3 digits)
    const lockInDays = parseInt(String(jobTenure));
    if (isNaN(lockInDays) || lockInDays <= 0 || lockInDays > 999) return null;

    const join = new Date(joiningDate);
    const today = new Date();
    const daysElapsed = Math.floor((today.getTime() - join.getTime()) / (1000 * 60 * 60 * 24));

    if (daysElapsed < 0) return null;

    const daysRemaining = Math.max(0, lockInDays - daysElapsed);
    const percentage = Math.min(100, (daysElapsed / lockInDays) * 100);

    return {
      daysElapsed,
      daysRemaining,
      lockInDays,
      percentage: percentage.toFixed(0),
      isComplete: daysElapsed >= lockInDays
    };
  };

  // Calculate commission status and amount based on job-specific lock-in completion
  const getCommissionStatus = (joiningDate: string, joinedStatus: string, jobCommission: number, jobTenure: string) => {
    if (joinedStatus !== 'Joined' || !joiningDate) {
      return { eligible: false, status: 'Not Applicable', color: 'text-gray-400', amount: null };
    }

    if (!jobCommission) {
      return { eligible: false, status: 'No Commission Set', color: 'text-gray-500', amount: null };
    }

    if (!jobTenure) {
      return { eligible: false, status: 'No Tenure Set', color: 'text-gray-500', amount: null };
    }

    const lockIn = calculateLockInProgress(joiningDate, jobTenure);
    if (!lockIn) {
      return { eligible: false, status: 'Pending', color: 'text-yellow-600', amount: null };
    }

    if (lockIn.isComplete) {
      return {
        eligible: true,
        status: 'Earned',
        color: 'text-green-600',
        amount: jobCommission
      };
    } else {
      return {
        eligible: false,
        status: `${lockIn.daysRemaining}d remaining`,
        color: 'text-orange-600',
        amount: jobCommission
      };
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getJoinedStatusIcon = (status: string) => {
    switch (status) {
      case 'Selected': return <CheckCircle2 className="w-4 h-4" />;
      case 'Offer Sent': return <Send className="w-4 h-4" />;
      case 'Joined': return <UserCheck className="w-4 h-4" />;
      case 'Not Joined': return <UserX className="w-4 h-4" />;
      default: return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const getJoinedStatusColor = (status: string) => {
    switch (status) {
      case 'Selected': return 'bg-green-100 text-green-700';
      case 'Offer Sent': return 'bg-blue-100 text-blue-700';
      case 'Joined': return 'bg-teal-100 text-teal-700';
      case 'Not Joined': return 'bg-red-100 text-red-700';
      default: return 'bg-green-100 text-green-700';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4 border-b bg-background sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto w-full flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Joined Candidates</h1>
            <p className="text-muted-foreground">Track candidates from selection to joining with tenure analysis</p>
          </div>
        </div>
      </div>

      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-auto p-6 pt-4">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Total Candidates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">{stats.total}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-teal-700 flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Joined
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-teal-900">{stats.joined}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-amber-700 flex items-center gap-2">
                  <UserX className="w-4 h-4" />
                  Left
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-900">{stats.left}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name, job, company, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {FILTER_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sourcedByFilter} onValueChange={setSourcedByFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
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
                Joined Candidates ({filteredApplications.length})
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
                        <TableHead>Status</TableHead>
                        <TableHead>Joining Date</TableHead>
                        <TableHead>Tenure</TableHead>
                        <TableHead>Lock-in Period</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                            No joined candidates found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredApplications.map((app: any, index: number) => {
                          const tenure = calculateTenure(app.joining_date);
                          const lockIn = calculateLockInProgress(app.joining_date, app.job_tenure);
                          const commission = getCommissionStatus(
                            app.joining_date,
                            app.joined_status,
                            app.job_commission,
                            app.job_tenure
                          );

                          return (
                            <TableRow
                              key={app.id}
                              className="hover:bg-gray-50 cursor-pointer"
                              onClick={() => {
                                if (app.candidate_id) {
                                  navigate(`/candidates/${app.candidate_id}`);
                                }
                              }}
                            >
                              <TableCell className="font-medium">{index + 1}</TableCell>
                              <TableCell>
                                <div className="font-medium">{app.candidate_name}</div>
                                <div className="text-xs text-gray-500">{app.candidate_city}</div>
                              </TableCell>
                              <TableCell className="text-sm">{app.candidate_phone || '-'}</TableCell>
                              <TableCell className="font-medium">{app.job_title}</TableCell>
                              <TableCell>{app.company}</TableCell>
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <Select
                                  value={app.joined_status || 'Selected'}
                                  onValueChange={(value) => handleJoinedStatusUpdate(app.id, value)}
                                >
                                  <SelectTrigger className="w-[160px] h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {JOINED_STATUSES.map((status) => (
                                      <SelectItem key={status} value={status}>
                                        <div className="flex items-center gap-2">
                                          {getJoinedStatusIcon(status)}
                                          <Badge className={getJoinedStatusColor(status)}>
                                            {status}
                                          </Badge>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <Input
                                  type="date"
                                  value={app.joining_date || ''}
                                  onChange={(e) => handleJoiningDateUpdate(app.id, e.target.value)}
                                  className="w-[150px] h-8 text-sm"
                                  disabled={app.joined_status !== 'Joined'}
                                />
                              </TableCell>
                              <TableCell>
                                {app.joined_status === 'Joined' && tenure ? (
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-blue-500" />
                                    <span className="font-medium text-blue-700">{tenure}</span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {app.joined_status === 'Joined' && lockIn ? (
                                  <div className="space-y-1 min-w-[150px]">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-gray-600">
                                        {lockIn.isComplete ? (
                                          <span className="flex items-center gap-1 text-green-600 font-medium">
                                            <Award className="w-3 h-3" />
                                            Complete
                                          </span>
                                        ) : (
                                          `${lockIn.daysRemaining}d left`
                                        )}
                                      </span>
                                      <span className="font-medium text-gray-700">{lockIn.percentage}%</span>
                                    </div>
                                    <Progress
                                      value={Number(lockIn.percentage)}
                                      className="h-2"
                                    />
                                  </div>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
