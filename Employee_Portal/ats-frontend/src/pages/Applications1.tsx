import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Users, CheckCircle2, XCircle, Clock, UserCheck, UserPlus, TrendingUp, Briefcase, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

export default function Applications() {
  const navigate = useNavigate();
  const { applications, fetchApplications } = useData();
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
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

    return { total, applied, shortlisted, interview, selected, joined, rejected };
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

      return matchesSearch;
    });
  }, [applications, searchQuery]);

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
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex items-center justify-between px-6 pt-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground">Manage all job applications and track candidate progress</p>
        </div>
        <Button onClick={() => navigate('/add-application')} size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Add Application
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 px-6 max-w-sm">
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applied</CardTitle>
            <Clock className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-700">{stats.applied}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="px-6">
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by candidate, job, company, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications Table */}
      <div className="px-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Applications List ({filteredApplications.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative w-full">
              <div className="overflow-x-auto overflow-y-auto border rounded-md" style={{ maxHeight: 'calc(100vh - 520px)' }}>
                <Table className="min-w-max">
                  <TableHeader className="sticky top-0 bg-white dark:bg-gray-950 z-10 border-b">
                    <TableRow>
                      <TableHead className="w-[60px] whitespace-nowrap">S.No</TableHead>
                      <TableHead className="min-w-[180px] whitespace-nowrap">Candidate</TableHead>
                      <TableHead className="min-w-[160px] whitespace-nowrap">Job Title</TableHead>
                      <TableHead className="min-w-[140px] whitespace-nowrap">Company</TableHead>
                      <TableHead className="min-w-[120px] whitespace-nowrap">Status</TableHead>
                      {isAdmin && <TableHead className="min-w-[160px] whitespace-nowrap">Assigned To</TableHead>}
                      <TableHead className="min-w-[140px] whitespace-nowrap">Sourced From</TableHead>
                      <TableHead className="min-w-[130px] whitespace-nowrap">Applied On</TableHead>
                      {isAdmin && <TableHead className="w-[80px] whitespace-nowrap">Actions</TableHead>}
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
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate(`/applications/${app.id}`)}
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
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                              {getStatusIcon(app.status)}
                              {app.status}
                            </div>
                          </TableCell>
                          {isAdmin && (
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Select
                                value={app.sourced_by || ''}
                                onValueChange={(value) => handleFieldUpdate(app.id, 'sourced_by', value)}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select Assigned To" />
                                </SelectTrigger>
                                <SelectContent>
                                  {RECRUITERS.map((recruiter) => (
                                    <SelectItem key={recruiter} value={recruiter}>
                                      {recruiter}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          )}
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Select
                              value={app.sourced_from || ''}
                              onValueChange={(value) => handleFieldUpdate(app.id, 'sourced_from', value)}
                            >
                              <SelectTrigger className="w-full">
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
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Input
                              type="date"
                              value={app.applied_on || ''}
                              onChange={(e) => handleFieldUpdate(app.id, 'applied_on', e.target.value)}
                              className="w-full h-8 text-sm"
                            />
                          </TableCell>
                          {isAdmin && (
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
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
