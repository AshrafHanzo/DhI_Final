import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Users, 
  Briefcase, 
  Clock, 
  DollarSign, 
  Calendar,
  Target,
  Award,
  TrendingUp,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS, buildApiUrl } from '@/config/api';

interface JobDetail {
  id: number;
  company_id: number;
  company_name: string;
  job_title: string;
  job_description: string;
  address: string;
  openings: number;
  type: string;
  work_mode: string;
  salary_min: number;
  salary_max: number;
  status: string;
  urgency: string;
  commission: number;
  tenure: string;
  shift: string;
  category: string;
  experience: number;
  age_min: number;
  age_max: number;
  required_skills: string;
  preferred_skills: string;
  nice_to_have: string;
  languages_required: string;
  seo_keywords: string;
  posted_by: number;
  created_at: string;
  updated_at: string;
}

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        const res = await fetch(buildApiUrl(API_ENDPOINTS.JOBS, id));
        if (!res.ok) throw new Error('Failed to fetch job details');
        const data = await res.json();
        setJob(data);
      } catch (err) {
        console.error(err);
        toast({
          title: 'Error',
          description: 'Failed to load job details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetail();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/jobs')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Job not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusColor = job.status === 'open' ? 'bg-green-500' : 'bg-gray-500';
  const urgencyColor = 
    job.urgency === 'urgent' ? 'bg-red-500' : 
    job.urgency === 'high' ? 'bg-orange-500' : 
    'bg-blue-500';

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/jobs')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>
      </div>

      {/* Title Card */}
      <Card className="border-2 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold">{job.job_title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span className="text-lg font-medium">{job.company_name}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge className={`${statusColor} text-white`}>
                  {job.status}
                </Badge>
                {job.urgency && (
                  <Badge className={`${urgencyColor} text-white`}>
                    {job.urgency}
                  </Badge>
                )}
                {job.type && (
                  <Badge variant="outline">{job.type}</Badge>
                )}
                {job.work_mode && (
                  <Badge variant="secondary">{job.work_mode}</Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-semibold">{job.address}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Openings</p>
                <p className="font-semibold">{job.openings} Positions</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Salary Range</p>
                <p className="font-semibold">
                  {job.salary_min && job.salary_max
                    ? `₹${job.salary_min.toLocaleString()} - ₹${job.salary_max.toLocaleString()}`
                    : 'Not specified'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Job Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {job.job_description}
              </p>
            </CardContent>
          </Card>

          {/* Skills */}
          {(job.required_skills || job.preferred_skills || job.nice_to_have) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Skills & Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.required_skills && (
                  <div>
                    <h4 className="font-semibold mb-2 text-red-600">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.required_skills.split(',').map((skill, idx) => (
                        <Badge key={idx} variant="destructive" className="bg-red-500">
                          {skill.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {job.preferred_skills && (
                  <div>
                    <h4 className="font-semibold mb-2 text-orange-600">Preferred Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.preferred_skills.split(',').map((skill, idx) => (
                        <Badge key={idx} className="bg-orange-500 text-white">
                          {skill.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {job.nice_to_have && (
                  <div>
                    <h4 className="font-semibold mb-2 text-blue-600">Nice to Have</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.nice_to_have.split(',').map((skill, idx) => (
                        <Badge key={idx} variant="secondary">
                          {skill.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {job.category && (
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">{job.category}</p>
                  </div>
                </div>
              )}

              {job.experience !== null && (
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Experience</p>
                    <p className="font-medium">{job.experience} years</p>
                  </div>
                </div>
              )}

              {job.shift && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Shift</p>
                    <p className="font-medium">{job.shift}</p>
                  </div>
                </div>
              )}

              {job.tenure && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tenure</p>
                    <p className="font-medium">{job.tenure}</p>
                  </div>
                </div>
              )}

              {(job.age_min || job.age_max) && (
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Age Range</p>
                    <p className="font-medium">
                      {job.age_min && job.age_max
                        ? `${job.age_min} - ${job.age_max} years`
                        : job.age_min
                        ? `${job.age_min}+ years`
                        : `Up to ${job.age_max} years`}
                    </p>
                  </div>
                </div>
              )}

              {job.commission && (
                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Commission</p>
                    <p className="font-medium">₹{job.commission.toLocaleString()}</p>
                  </div>
                </div>
              )}

              {job.languages_required && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Languages</p>
                  <div className="flex flex-wrap gap-1">
                    {job.languages_required.split(',').map((lang, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {lang.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Posted Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Posted Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Posted On</p>
                <p className="font-medium">
                  {new Date(job.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">
                  {new Date(job.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => navigate(`/candidates/add?job_id=${job.id}`)}
              >
                <Users className="mr-2 h-4 w-4" />
                Add Candidate to This Job
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
