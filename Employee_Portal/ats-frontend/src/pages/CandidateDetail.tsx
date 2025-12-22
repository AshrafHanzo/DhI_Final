import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft, User, Phone, Mail, MapPin, Calendar, FileText,
  Briefcase, Building2, Eye, Database
} from 'lucide-react';
import { format } from 'date-fns';
import { API_BASE_URL } from '@/config/api';

const statusColors: any = {
  new: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  screening: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  interview_ready: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  selected: 'bg-green-500/10 text-green-500 border-green-500/20',
  joined: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export default function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { candidates, jobs, applications, fetchCandidates } = useData();
  const [candidate, setCandidate] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const [job, setJob] = useState<any>(null);

  // Fetch fresh data when component mounts or when ID changes
  useEffect(() => {
    const loadFreshData = async () => {
      await fetchCandidates();
    };
    loadFreshData();
  }, [id]);

  // Update local state whenever candidates array changes
  useEffect(() => {
    if (candidates.length === 0) return; // Wait for candidates to load

    const cand = candidates.find(c => c.id === parseInt(id || '0'));

    // Force update by creating a new object to trigger re-render
    if (cand) {
      setCandidate({ ...cand });

      const app = applications.find(a => a.candidate_id === cand.id);
      setApplication(app ? { ...app } : null);

      if (app) {
        const j = jobs.find(j => j.id === app.job_id);
        setJob(j ? { ...j } : null);
      }
    } else {
      setCandidate(null);
    }
  }, [id, candidates, applications, jobs]);

  if (!candidate) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <User className="h-16 w-16 mx-auto text-muted-foreground opacity-20" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">Candidate not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/candidates')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Candidates
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy');
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/candidates')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Candidate Details
          </h1>
          <p className="text-muted-foreground mt-1">Candidate ID: #{candidate.id}</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Personal Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="border-2 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-green-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-3xl">
                  {candidate.full_name?.charAt(0) || '?'}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{candidate.full_name}</h3>
                  <p className="text-muted-foreground">{candidate.gender || 'N/A'}</p>
                </div>
              </div>

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
                    <p className="font-medium break-all">{candidate.email_address || 'N/A'}</p>
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
                  <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">{candidate.date_of_birth ? formatDate(candidate.date_of_birth) : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {candidate.resume_url && (
                <>
                  <Separator />
                  <div>
                    <Button variant="outline" asChild className="w-full">
                      <a href={`${API_BASE_URL}${candidate.resume_url}`} target="_blank" rel="noopener noreferrer">
                        <Eye className="mr-2 h-4 w-4" />
                        View Resume
                      </a>
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Professional Details - Always show if candidate exists */}
          {candidate && (
            <Card className="border-2 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-emerald-600" />
                  Professional Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Languages */}
                {candidate.select_languages && candidate.select_languages.trim() !== '' && (
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">Languages Known</h4>
                    <div className="flex flex-wrap gap-2">
                      {(typeof candidate.select_languages === 'string'
                        ? candidate.select_languages.split(',').filter(Boolean)
                        : candidate.select_languages
                      ).map((lang: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 px-3 py-1">
                          {lang.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {candidate.educational_quality && candidate.educational_quality.trim() !== '' && (
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">Education</h4>
                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                        🎓
                      </div>
                      <span className="font-medium text-blue-900 dark:text-blue-100">{candidate.educational_quality}</span>
                    </div>
                  </div>
                )}

                {/* Work Experience */}
                {((candidate.work_experience && candidate.work_experience !== '0') || (candidate.additional_months && candidate.additional_months !== '0')) && (
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">Work Experience</h4>
                    <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
                        💼
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                          {candidate.work_experience || 0}
                          <span className="text-sm font-normal"> years</span>
                          {candidate.additional_months && (
                            <span className="text-base font-normal"> + {candidate.additional_months} months</span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">Professional Experience</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Technical Skills */}
                {candidate.technical_professional_skills && candidate.technical_professional_skills.trim() !== '' && (
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">Technical & Professional Skills</h4>
                    <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-lg border border-orange-200">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{candidate.technical_professional_skills}</p>
                    </div>
                  </div>
                )}

                <Separator />

                <h4 className="text-sm font-semibold text-muted-foreground">Preferences</h4>

                {/* Preferred Industries */}
                {candidate.preferred_industries_categories && candidate.preferred_industries_categories.trim() !== '' && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Preferred Industries</p>
                    <div className="p-3 bg-gradient-to-r from-cyan-50 to-sky-50 dark:from-cyan-950/20 dark:to-sky-950/20 rounded-lg border border-cyan-200">
                      <p className="font-medium text-cyan-900 dark:text-cyan-100">{candidate.preferred_industries_categories}</p>
                    </div>
                  </div>
                )}

                {/* Preferred Employment Types */}
                {candidate.preferred_employment_types && candidate.preferred_employment_types.trim() !== '' && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Preferred Employment Types</p>
                    <div className="flex flex-wrap gap-2">
                      {(typeof candidate.preferred_employment_types === 'string'
                        ? candidate.preferred_employment_types.split(',').filter(Boolean)
                        : candidate.preferred_employment_types
                      ).map((type: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="bg-teal-50 text-teal-700 border-teal-300">
                          {type.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preferred Work Types */}
                {candidate.preferred_work_types && candidate.preferred_work_types.trim() !== '' && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Preferred Work Mode</p>
                    <Badge className="bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0">
                      {candidate.preferred_work_types}
                    </Badge>
                  </div>
                )}

                {/* Show message if no professional data */}
                {(!candidate.select_languages || candidate.select_languages.trim() === '') &&
                  (!candidate.educational_quality || candidate.educational_quality.trim() === '') &&
                  (!candidate.work_experience || candidate.work_experience === '0') &&
                  (!candidate.technical_professional_skills || candidate.technical_professional_skills.trim() === '') &&
                  (!candidate.preferred_industries_categories || candidate.preferred_industries_categories.trim() === '') &&
                  (!candidate.preferred_employment_types || candidate.preferred_employment_types.trim() === '') &&
                  (!candidate.preferred_work_types || candidate.preferred_work_types.trim() === '') && (
                    <div className="text-center py-8">
                      <Briefcase className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                      <p className="text-muted-foreground">No professional details added yet</p>
                      <p className="text-sm text-muted-foreground mt-1">Edit candidate to add professional information</p>
                    </div>
                  )}
              </CardContent>
            </Card>
          )}

          {/* Job Application Info */}
          {application && (
            <Card className="border-2 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  Application Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {job ? (
                  <>
                    <div>
                      <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">{job.job_title}</h3>
                      <p className="text-muted-foreground">Job ID: #{job.id}</p>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <Building2 className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Company</p>
                          <p className="font-medium">{job.company_name || 'N/A'}</p>
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
                        <Briefcase className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Job Type</p>
                          <p className="font-medium">{job.type || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Briefcase className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Work Mode</p>
                          <p className="font-medium">{job.work_mode || 'N/A'}</p>
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
                ) : (
                  <p className="text-muted-foreground">No job application found</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Timeline & Additional Info */}
        <div className="space-y-6">
          {/* Timeline */}
          <Card className="border-2 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Created On</p>
                    <p className="font-medium">{formatDate(candidate.created_at)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="border-2 shadow-lg">
            <CardContent className="pt-6 space-y-3">
              <Button variant="outline" className="w-full" onClick={() => navigate(`/applications?candidate=${candidate.id}`)}>
                <FileText className="mr-2 h-4 w-4" />
                View Application History
              </Button>
              <Button
                variant="outline"
                className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 text-blue-700"
                onClick={() => navigate('/candidates/add?mode=existing')}
              >
                <Database className="mr-2 h-4 w-4" />
                Back to Talent Base
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/candidates')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to All Candidates
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
