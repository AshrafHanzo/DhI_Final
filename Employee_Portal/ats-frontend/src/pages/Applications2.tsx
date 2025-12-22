import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Users, CheckCircle2, XCircle, Clock, UserCheck, UserPlus, TrendingUp, Briefcase, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { API_ENDPOINTS, buildApiUrl } from '@/config/api';

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

export default function Applications() {
  const navigate = useNavigate();
  const { applications, fetchApplications } = useData();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobTitleFilter, setJobTitleFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [assignedToFilter, setAssignedToFilter] = useState('');
  const [sourcedFromFilter, setSourcedFromFilter] = useState('');
  const [appliedOnFilter, setAppliedOnFilter] = useState('');
  const [selectedApps, setSelectedApps] = useState<number[]>([]);
  const [bulkAssignDialogOpen, setBulkAssignDialogOpen] = useState(false);
  const [bulkAssignTo, setBulkAssignTo] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});

  // Calculate stats
  const stats = useMemo(() => {
    const total = applications.length;
    const applied = applications.filter((a: any) => a.status === 'Applied').length;
    const shortlisted = applications.filter((a: any) => a.status === 'Shortlisted').length;
    const interview = applications.filter((a: any) => a.status === 'Interview').length;
    const selected = applications.filter((a: any) => a.status === 'Selected').length;
    const joined = applications.filter((a: any) => a.status === 'Joined').length;
    const rejected = applications.filter((a: any) => a.status === 'Rejected').length;

    // Calculate today's and yesterday's counts
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayCount = applications.filter((a: any) => {
      if (!a.applied_on) return false;
      const appliedDate = new Date(a.applied_on);
      appliedDate.setHours(0, 0, 0, 0);
      return appliedDate.getTime() === today.getTime();
    }).length;

    const yesterdayCount = applications.filter((a: any) => {
      if (!a.applied_on) return false;
      const appliedDate = new Date(a.applied_on);
      appliedDate.setHours(0, 0, 0, 0);
      return appliedDate.getTime() === yesterday.getTime();
    }).length;

    return { total, applied, shortlisted, interview, selected, joined, rejected, todayCount, yesterdayCount };
  }, [applications]);

  // Filter applications - Only show 'Applied' status
  const filteredApplications = useMemo(() => {
    return applications.filter((app: any) => {
      // Only show Applied status
      if (app.status !== 'Applied') {
        return false;
      }

      const matchesSearch = 
        app.candidate_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.candidate_phone?.includes(searchQuery);

      const matchesJobTitle = !jobTitleFilter || app.job_title?.toLowerCase().includes(jobTitleFilter.toLowerCase());
      const matchesCompany = !companyFilter || app.company?.toLowerCase().includes(companyFilter.toLowerCase());
      const matchesAssignedTo = !assignedToFilter || assignedToFilter === 'all' || app.sourced_by === assignedToFilter;
      const matchesSourcedFrom = !sourcedFromFilter || sourcedFromFilter === 'all' || app.sourced_from === sourcedFromFilter;
      const matchesAppliedOn = !appliedOnFilter || app.applied_on === appliedOnFilter;

      return matchesSearch && matchesJobTitle && matchesCompany && matchesAssignedTo && matchesSourcedFrom && matchesAppliedOn;
    });
  }, [applications, searchQuery, jobTitleFilter, companyFilter, assignedToFilter, sourcedFromFilter, appliedOnFilter]);

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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Applied': return <Clock className="w-4 h-4" />;
      case 'Shortlisted': return <UserCheck className="w-4 h-4" />;
      case 'Interview': return <Users className="w-4 h-4" />;
      case 'Selected': return <CheckCircle2 className="w-4 h-4" />;
      case 'Joined': return <UserPlus className="w-4 h-4" />;
      case 'Rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
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
    <div className="space-y-3 pb-8">
      {/* Page Header */}
      <div className="flex items-center justify-between px-6 pt-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
          <p className="text-sm text-muted-foreground">Manage all job applications and track candidate progress</p>
        </div>
        <div className="flex gap-2">
          {selectedApps.length > 0 && (
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
        <div className="flex flex-col lg:flex-row gap-3 items-stretch">
          {/* Stats Cards */}
          <div className="flex gap-3 flex-1">
            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 flex-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3">
                <CardTitle className="text-xs font-medium">Applied</CardTitle>
                <Clock className="h-3 w-3 text-indigo-600" />
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-xl font-bold text-indigo-700">{stats.applied}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 flex-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3">
                <CardTitle className="text-xs font-medium">Today Count</CardTitle>
                <TrendingUp className="h-3 w-3 text-green-600" />
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-xl font-bold text-green-700">{stats.todayCount}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 flex-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3">
                <CardTitle className="text-xs font-medium">Yesterday Count</CardTitle>
                <Clock className="h-3 w-3 text-amber-600" />
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-xl font-bold text-amber-700">{stats.yesterdayCount}</div>
              </CardContent>
            </Card>
          </div>
          
          {/* Search */}
          <div className="flex items-center lg:w-96">
            <div className="relative w-full">
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
            <div className="overflow-x-auto overflow-y-auto border rounded-md" style={{maxHeight: 'calc(100vh - 220px)'}}>
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
                  <TableHead className="min-w-[100px] whitespace-nowrap py-0.5 text-xs">Status</TableHead>
                  <TableHead className="min-w-[140px] whitespace-nowrap py-0.5 text-xs">Assigned To</TableHead>
                  <TableHead className="min-w-[120px] whitespace-nowrap py-0.5 text-xs">Sourced From</TableHead>
                  <TableHead className="min-w-[110px] whitespace-nowrap py-0.5 text-xs">Applied On</TableHead>
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
                  <TableHead className="py-0.5"></TableHead>
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
                      className="cursor-pointer hover:bg-muted/50 h-10"
                      onClick={() => navigate(`/applications/${app.id}`)}
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
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                          {getStatusIcon(app.status)}
                          {app.status}
                        </div>
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Edit Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Candidate Name</Label>
                <Input
                  value={editFormData.candidate_name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, candidate_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input
                  value={editFormData.job_title || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, job_title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  value={editFormData.company || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Sourced By</Label>
                <Select
                  value={editFormData.sourced_by || ''}
                  onValueChange={(value) => setEditFormData({ ...editFormData, sourced_by: value })}
                >
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
              <div className="space-y-2">
                <Label>Sourced From</Label>
                <Select
                  value={editFormData.sourced_from || ''}
                  onValueChange={(value) => setEditFormData({ ...editFormData, sourced_from: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCES.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assigned To</Label>
                <Input
                  value={editFormData.assigned_to || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, assigned_to: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Comments</Label>
              <Textarea
                value={editFormData.comments || ''}
                onChange={(e) => setEditFormData({ ...editFormData, comments: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={async () => {
                try {
                  const res = await fetch(buildApiUrl(API_ENDPOINTS.APPLICATIONS, editingApp.id), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(editFormData)
                  });
                  if (!res.ok) throw new Error('Failed to update');
                  await fetchApplications();
                  setEditDialogOpen(false);
                  toast({
                    title: 'Success',
                    description: 'Application updated successfully'
                  });
                } catch (error) {
                  toast({
                    title: 'Error',
                    description: 'Failed to update application',
                    variant: 'destructive'
                  });
                }
              }}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
