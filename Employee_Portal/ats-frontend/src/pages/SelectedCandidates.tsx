import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Search, Users, CheckCircle2, Calendar, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS, buildApiUrl } from '@/config/api';

export default function SelectedCandidates() {
  const navigate = useNavigate();
  const { applications = [], fetchApplications } = useData();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [sourcedByFilter, setSourcedByFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [joiningDate, setJoiningDate] = useState('');
  const [actionType, setActionType] = useState<'Joined' | 'Not Joined' | null>(null);

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

  // Filter applications with status = 'Selected' (exclude those moved to Joined or marked Not Joined)
  const selectedApplications = useMemo(() => {
    return applications.filter((a: any) =>
      a.status === 'Selected' && a.interview_status === 'Selected' && a.joined_status !== 'Not Joined'
    );
  }, [applications]);

  // Handle status update
  const handleStatusUpdate = async (appId: number, joinedStatus: string, joiningDate?: string) => {
    try {
      const updateData: any = {};

      if (joinedStatus === 'Joined') {
        // Move to Joined section with joining date
        updateData.status = 'Joined';
        updateData.joined_status = 'Joined';
        updateData.joining_date = joiningDate;
      }

      const res = await fetch(buildApiUrl(API_ENDPOINTS.APPLICATIONS, appId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (!res.ok) throw new Error('Failed to update');

      await fetchApplications();

      toast({
        title: 'Success',
        description: 'Candidate moved to Joined Candidates section with joining date set'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive'
      });
    }
  };

  // Filter by search and sourced by
  const filteredApplications = useMemo(() => {
    let filtered = selectedApplications;

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
  }, [selectedApplications, searchQuery, sourcedByFilter]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Selected Candidates</h1>
          <p className="text-muted-foreground">Candidates selected after interviews</p>
        </div>
      </div>

      {/* Stats and Content */}
      <div className="space-y-6">
        {/* Stats Card */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Total Selected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{selectedApplications.length}</div>
          </CardContent>
        </Card>

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
              Selected Candidates ({filteredApplications.length})
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
                      <TableHead>Interview Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                          No selected candidates found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredApplications.map((app: any, index: number) => (
                        <TableRow
                          key={app.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => navigate(`/applications/${app.id}`)}
                        >
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>
                            <div className="font-medium">{app.candidate_name}</div>
                            <div className="text-xs text-gray-500">{app.candidate_city}</div>
                          </TableCell>
                          <TableCell className="text-sm">{app.candidate_phone || '-'}</TableCell>
                          <TableCell className="font-medium">{app.job_title}</TableCell>
                          <TableCell>{app.company}</TableCell>
                          <TableCell>{formatDate(app.interview_date)}</TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="flex gap-2 items-center">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedCandidate(app);
                                  setActionType('Joined');
                                  setJoiningDate('');
                                  setIsDialogOpen(true);
                                }}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Calendar className="h-4 w-4 mr-1" />
                                Set Joining Date
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  // Mark as Not Joined - stays in DB but hidden from UI
                                  try {
                                    const res = await fetch(buildApiUrl(API_ENDPOINTS.APPLICATIONS, app.id), {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ joined_status: 'Not Joined' })
                                    });
                                    if (!res.ok) throw new Error('Failed to update');
                                    await fetchApplications();
                                    toast({
                                      title: 'Success',
                                      description: 'Candidate marked as Not Joined'
                                    });
                                  } catch (error) {
                                    toast({
                                      title: 'Error',
                                      description: 'Failed to update status',
                                      variant: 'destructive'
                                    });
                                  }
                                }}
                                className="border-red-300 text-red-600 hover:bg-red-50"
                              >
                                Not Joined
                              </Button>
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
      </div>

      {/* Stunning Date Selection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Set Joining Date
                </DialogTitle>
                <DialogDescription className="text-sm mt-1">
                  {selectedCandidate?.candidate_name}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Candidate Info Card */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Job Title:</span>
                  <span className="font-semibold text-gray-900">{selectedCandidate?.job_title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Company:</span>
                  <span className="font-semibold text-gray-900">{selectedCandidate?.company}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-semibold text-gray-900">{selectedCandidate?.candidate_phone}</span>
                </div>
              </div>
            </div>

            {/* Date Input */}
            <div className="space-y-3">
              <Label htmlFor="joining-date" className="text-base font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600" />
                Joining Date
              </Label>
              <Input
                id="joining-date"
                type="date"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="text-lg p-6 border-2 focus:border-green-500"
              />
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Select the joining date (past dates allowed)
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setSelectedCandidate(null);
                setJoiningDate('');
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!joiningDate) {
                  toast({
                    title: 'Date Required',
                    description: 'Please select a date',
                    variant: 'destructive'
                  });
                  return;
                }
                handleStatusUpdate(selectedCandidate?.id, actionType!, joiningDate);
                setIsDialogOpen(false);
                setSelectedCandidate(null);
                setJoiningDate('');
              }}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              disabled={!joiningDate}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
