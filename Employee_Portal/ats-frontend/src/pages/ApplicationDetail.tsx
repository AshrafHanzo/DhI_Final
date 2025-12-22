import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, User, Briefcase, Building2, Calendar, FileText, 
  Phone, Mail, MapPin, Clock, TrendingUp, Edit, Trash2, CheckCircle2,
  Languages, GraduationCap, Code, Factory, Layers
} from 'lucide-react';
import { format } from 'date-fns';
import { API_BASE_URL } from '@/config/api';

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { applications, candidates, jobs, updateApplicationStatus, fetchApplications } = useData();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState<any>(null);
  const [candidate, setCandidate] = useState<any>(null);
  const [job, setJob] = useState<any>(null);

  // Fetch fresh data when component mounts
  useEffect(() => {
    fetchApplications();
  }, [id]);

  // Update local state whenever applications array changes
  useEffect(() => {
    if (applications.length === 0) return; // Wait for applications to load
    
    const app = applications.find(a => a.id === parseInt(id || '0'));
    
    if (app) {
      setApplication({ ...app });
      
      const cand = candidates.find(c => c.id === app.candidate_id);
      setCandidate(cand ? { ...cand } : null);
      
      const j = jobs.find(j => j.id === app.job_id);
      setJob(j ? { ...j } : null);
    } else {
      setApplication(null);
    }
  }, [id, applications, candidates, jobs]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Applied: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      Shortlisted: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      Interview: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      Selected: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      Joined: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
      Rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy');
    } catch {
      return 'N/A';
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'N/A';
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!application) return;

    setLoading(true);
    try {
      await updateApplicationStatus(application.id, newStatus);
      toast({
        title: "Success",
        description: `Application status updated to ${newStatus}`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading while data is being fetched
  if (applications.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Briefcase className="h-16 w-16 mx-auto text-muted-foreground opacity-20" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">Application not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/applications')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Applications
          </Button>
        </div>
      </div>
    );
  }

  const nextStatuses: Record<string, string[]> = {
    Applied: ['Shortlisted', 'Rejected'],
    Shortlisted: ['Interview', 'Rejected'],
    Interview: ['Selected', 'Rejected'],
    Selected: ['Joined', 'Rejected'],
    Joined: ['Tenure Completed'],
  };

  const availableStatuses = nextStatuses[application.status] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/applications')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Application Details
            </h1>
            <p className="text-muted-foreground mt-1">Application ID: #{application.id}</p>
          </div>
        </div>
        <Badge className={`${getStatusColor(application.status)} text-lg px-4 py-2`}>
          {application.status}
        </Badge>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Candidate & Job Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Candidate Information */}
          <Card className="border-2 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-green-600" />
                Candidate Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-2xl">
                  {application.candidate_name?.charAt(0) || '?'}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{application.candidate_name}</h3>
                  <p className="text-muted-foreground">Candidate ID: #{application.candidate_id}</p>
                </div>
              </div>

              {candidate && (
                <>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{candidate.phone_number || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{candidate.email_address || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">{candidate.city || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Gender</p>
                        <p className="font-medium">{candidate.gender || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {candidate.resume_url && (
                    <>
                      <Separator />
                      <div>
                        <Button variant="outline" asChild className="w-full">
                          <a href={`${API_BASE_URL}${candidate.resume_url}`} target="_blank" rel="noopener noreferrer">
                            <FileText className="mr-2 h-4 w-4" />
                            View Resume
                          </a>
                        </Button>
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Professional Profile */}
          {candidate && (
            <Card className="border-2 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-teal-600" />
                  Professional Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {candidate.select_languages && candidate.select_languages.trim() !== '' && (
                  <div className="flex items-start gap-3">
                    <Languages className="h-5 w-5 text-teal-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-2">Languages Known</p>
                      <div className="flex flex-wrap gap-2">
                        {candidate.select_languages.split(',').map((lang: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                            {lang.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {candidate.educational_quality && candidate.educational_quality.trim() !== '' && (
                  <div className="flex items-start gap-3">
                    <GraduationCap className="h-5 w-5 text-teal-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Education</p>
                      <p className="font-medium">{candidate.educational_quality}</p>
                    </div>
                  </div>
                )}

                {((candidate.work_experience && candidate.work_experience !== '0') || (candidate.additional_months && candidate.additional_months !== '0')) && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-teal-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Work Experience</p>
                      <p className="font-medium">
                        {candidate.work_experience || 0} years {candidate.additional_months || 0} months
                      </p>
                    </div>
                  </div>
                )}

                {candidate.technical_professional_skills && candidate.technical_professional_skills.trim() !== '' && (
                  <div className="flex items-start gap-3">
                    <Code className="h-5 w-5 text-teal-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Technical & Professional Skills</p>
                      <p className="font-medium">{candidate.technical_professional_skills}</p>
                    </div>
                  </div>
                )}

                {candidate.preferred_industries_categories && candidate.preferred_industries_categories.trim() !== '' && (
                  <div className="flex items-start gap-3">
                    <Factory className="h-5 w-5 text-teal-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Preferred Industries</p>
                      <p className="font-medium">{candidate.preferred_industries_categories}</p>
                    </div>
                  </div>
                )}

                {candidate.preferred_employment_types && candidate.preferred_employment_types.trim() !== '' && (
                  <div className="flex items-start gap-3">
                    <Layers className="h-5 w-5 text-teal-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-2">Preferred Employment Types</p>
                      <div className="flex flex-wrap gap-2">
                        {candidate.preferred_employment_types.split(',').map((type: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                            {type.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {candidate.preferred_work_types && candidate.preferred_work_types.trim() !== '' && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-teal-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Preferred Work Mode</p>
                      <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">
                        {candidate.preferred_work_types}
                      </Badge>
                    </div>
                  </div>
                )}

                {!candidate.select_languages && !candidate.educational_quality && !candidate.work_experience && 
                 !candidate.technical_professional_skills && !candidate.preferred_industries_categories && 
                 !candidate.preferred_employment_types && !candidate.preferred_work_types && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No professional details added yet</p>
                    <p className="text-sm">Edit candidate to add professional information</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Job Information */}
          <Card className="border-2 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                Job Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100">{application.job_title}</h3>
                <p className="text-muted-foreground">Job ID: #{application.job_id}</p>
              </div>

              {job && (
                <>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Company</p>
                        <p className="font-medium">{job.company_name || application.company}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">{job.address || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Salary</p>
                        <p className="font-medium">
                          {job.salary_min && job.salary_max 
                            ? `₹${job.salary_min.toLocaleString()} - ₹${job.salary_max.toLocaleString()}` 
                            : 'Not specified'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Briefcase className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p className="font-medium">{job.type || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />
                  <div>
                    <Button variant="outline" className="w-full" onClick={() => navigate(`/jobs/${job.id}`)}>
                      <Briefcase className="mr-2 h-4 w-4" />
                      View Full Job Details
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Application Details & Actions */}
        <div className="space-y-6">
          {/* Application Timeline */}
          <Card className="border-2 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Created On</p>
                    <p className="font-medium">{formatDateTime(application.created_at)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Source Information */}
          <Card className="border-2 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-amber-600" />
                Source Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Sourced By</p>
                  <p className="font-medium">{application.sourced_by || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sourced From</p>
                  <p className="font-medium">{application.sourced_from || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Assigned To</p>
                  <p className="font-medium">{application.assigned_to || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments */}
          {application.comments && (
            <Card className="border-2 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-950/20">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-slate-600" />
                  Comments
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm">{application.comments}</p>
              </CardContent>
            </Card>
          )}


        </div>
      </div>
    </div>
  );
}
