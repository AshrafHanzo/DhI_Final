import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  Users,
  CheckCircle,
  Building2,
  TrendingUp,
  TrendingDown,
  UserCheck,
  Calendar,
  Activity,
  Target,
  PhoneCall,
  PhoneOff,
  UserPlus,
  Sparkles,
  ArrowRight,
  Zap,
  Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '@/config/api';

interface DashboardStats {
  total_users: number;
  total_companies: number;
  total_jobs: number;
  total_candidates: number;
  total_applications: number;
  jobs_open: number;
  jobs_closed: number;
  jobs_on_hold: number;
  applications_today: number;
  applications_yesterday: number;
  candidates_today: number;
  candidates_yesterday: number;
  screening_applied: number;
  screening_callback: number;
  screening_not_reachable: number;
  screening_wrong_number: number;
  screening_ringing: number;
  screening_ready: number;
  screening_not_fit: number;
  screening_not_interested: number;
  interview_scheduled: number;
  interview_attended: number;
  interview_not_attended: number;
  interview_selected: number;
  interview_rejected: number;
  joined_count: number;
  not_joined_count: number;
  applications_this_week: number;
  candidates_this_week: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { jobs, candidates, applications } = useData();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.DASHBOARD);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Animated counter component
  const AnimatedNumber = ({ value, suffix = '' }: { value: number, suffix?: string }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
      if (value === 0) {
        setDisplayValue(0);
        return;
      }

      const duration = 1000;
      const steps = 30;
      const increment = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }, [value]);

    return <>{displayValue.toLocaleString()}{suffix}</>;
  };

  // Calculate trend (compare to yesterday)
  const getTrend = (today: number, yesterday: number) => {
    if (yesterday === 0) return { positive: today > 0, value: today };
    const diff = today - yesterday;
    return { positive: diff >= 0, value: diff };
  };

  const appTrend = stats ? getTrend(stats.applications_today, stats.applications_yesterday) : { positive: true, value: 0 };
  const candTrend = stats ? getTrend(stats.candidates_today, stats.candidates_yesterday) : { positive: true, value: 0 };

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="h-8 w-8" />
              <h1 className="text-4xl font-bold">
                Welcome back, {user?.name?.split(' ')[0] || 'User'}!
              </h1>
            </div>
            <p className="text-white/80 text-lg mt-2">
              Here's your recruitment performance at a glance
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3 px-5 py-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <Activity className="h-5 w-5 animate-pulse" />
            <span className="font-semibold">Live Dashboard</span>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Jobs */}
        <Card
          className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
          onClick={() => navigate('/jobs')}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-white/90">Total Jobs</CardTitle>
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
              <Briefcase className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold">
              <AnimatedNumber value={stats?.total_jobs || 0} />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Badge className="bg-green-400/30 text-white border-0 text-xs">
                {stats?.jobs_open || 0} Open
              </Badge>
              <Badge className="bg-orange-400/30 text-white border-0 text-xs">
                {stats?.jobs_on_hold || 0} On Hold
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Total Candidates */}
        <Card
          className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
          onClick={() => navigate('/candidates')}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-white/90">Total Candidates</CardTitle>
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold">
              <AnimatedNumber value={stats?.total_candidates || 0} />
            </div>
            <div className="flex items-center gap-2 mt-3">
              {candTrend.positive ? (
                <TrendingUp className="h-4 w-4 text-green-300" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-300" />
              )}
              <span className="text-sm text-white/80">
                {candTrend.positive ? '+' : ''}{candTrend.value} today
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Total Applications */}
        <Card
          className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
          onClick={() => navigate('/applications')}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-white/90">Total Applications</CardTitle>
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
              <Target className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold">
              <AnimatedNumber value={stats?.total_applications || 0} />
            </div>
            <div className="flex items-center gap-2 mt-3">
              {appTrend.positive ? (
                <TrendingUp className="h-4 w-4 text-green-300" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-300" />
              )}
              <span className="text-sm text-white/80">
                {appTrend.positive ? '+' : ''}{appTrend.value} today
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Joined */}
        <Card
          className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
          onClick={() => navigate('/joined')}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-white/90">Successfully Joined</CardTitle>
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
              <Award className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold">
              <AnimatedNumber value={stats?.joined_count || 0} />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <CheckCircle className="h-4 w-4 text-green-300" />
              <span className="text-sm text-white/80">Onboarded candidates</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Screening Pipeline */}
      <Card className="shadow-xl border-0 bg-white dark:bg-gray-900">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <PhoneCall className="h-5 w-5 text-blue-600" />
              Screening Pipeline
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/applications')} className="gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <div className="text-center p-4 bg-gradient-to-b from-sky-50 to-sky-100 dark:from-sky-950/20 dark:to-sky-900/20 rounded-xl border border-sky-200 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/applications')}>
              <div className="text-2xl font-bold text-sky-600"><AnimatedNumber value={stats?.screening_applied || 0} /></div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Applied</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-b from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 rounded-xl border border-amber-200 hover:shadow-lg transition-all cursor-pointer">
              <div className="text-2xl font-bold text-amber-600"><AnimatedNumber value={stats?.screening_callback || 0} /></div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Call Back</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-b from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 rounded-xl border border-orange-200 hover:shadow-lg transition-all cursor-pointer">
              <div className="text-2xl font-bold text-orange-600"><AnimatedNumber value={stats?.screening_not_reachable || 0} /></div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Not Reachable</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-b from-rose-50 to-rose-100 dark:from-rose-950/20 dark:to-rose-900/20 rounded-xl border border-rose-200 hover:shadow-lg transition-all cursor-pointer">
              <div className="text-2xl font-bold text-rose-600"><AnimatedNumber value={stats?.screening_wrong_number || 0} /></div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Wrong Number</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-b from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-xl border border-purple-200 hover:shadow-lg transition-all cursor-pointer">
              <div className="text-2xl font-bold text-purple-600"><AnimatedNumber value={stats?.screening_ringing || 0} /></div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Ringing</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-b from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-xl border border-green-200 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/ready-to-interview')}>
              <div className="text-2xl font-bold text-green-600"><AnimatedNumber value={stats?.screening_ready || 0} /></div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Ready</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-b from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 rounded-xl border border-red-200 hover:shadow-lg transition-all cursor-pointer">
              <div className="text-2xl font-bold text-red-600"><AnimatedNumber value={stats?.screening_not_fit || 0} /></div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Not Fit</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950/20 dark:to-gray-900/20 rounded-xl border border-gray-200 hover:shadow-lg transition-all cursor-pointer">
              <div className="text-2xl font-bold text-gray-600"><AnimatedNumber value={stats?.screening_not_interested || 0} /></div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Not Interested</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interview Pipeline */}
      <Card className="shadow-xl border-0 bg-white dark:bg-gray-900">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-purple-600" />
              Interview Pipeline
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/interview')} className="gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-5 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-xl border-2 border-blue-200 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/interview')}>
              <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-blue-600"><AnimatedNumber value={stats?.interview_scheduled || 0} /></div>
              <p className="text-sm text-muted-foreground mt-1 font-medium">Scheduled</p>
            </div>
            <div className="text-center p-5 bg-gradient-to-b from-cyan-50 to-cyan-100 dark:from-cyan-950/20 dark:to-cyan-900/20 rounded-xl border-2 border-cyan-200 hover:shadow-lg transition-all cursor-pointer">
              <CheckCircle className="h-8 w-8 text-cyan-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-cyan-600"><AnimatedNumber value={stats?.interview_attended || 0} /></div>
              <p className="text-sm text-muted-foreground mt-1 font-medium">Attended</p>
            </div>
            <div className="text-center p-5 bg-gradient-to-b from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 rounded-xl border-2 border-orange-200 hover:shadow-lg transition-all cursor-pointer">
              <PhoneOff className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-orange-600"><AnimatedNumber value={stats?.interview_not_attended || 0} /></div>
              <p className="text-sm text-muted-foreground mt-1 font-medium">Not Attended</p>
            </div>
            <div className="text-center p-5 bg-gradient-to-b from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-xl border-2 border-green-200 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/selected')}>
              <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-green-600"><AnimatedNumber value={stats?.interview_selected || 0} /></div>
              <p className="text-sm text-muted-foreground mt-1 font-medium">Selected</p>
            </div>
            <div className="text-center p-5 bg-gradient-to-b from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 rounded-xl border-2 border-red-200 hover:shadow-lg transition-all cursor-pointer">
              <Zap className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-red-600"><AnimatedNumber value={stats?.interview_rejected || 0} /></div>
              <p className="text-sm text-muted-foreground mt-1 font-medium">Rejected</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Jobs */}
        <Card className="shadow-xl border-0 bg-white dark:bg-gray-900">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                Recent Jobs
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/jobs')} className="gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {jobs.slice(0, 5).map(job => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-900/50 rounded-lg hover:from-blue-50 dark:hover:from-blue-950/20 transition-all cursor-pointer border border-transparent hover:border-blue-200"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  <div className="flex-1">
                    <p className="font-semibold">{job.job_title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{job.company_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={job.status === 'open' ? 'bg-green-500 hover:bg-green-600' : job.status === 'on_hold' ? 'bg-orange-500' : 'bg-gray-500'}>
                      {job.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {job.openings} openings
                    </p>
                  </div>
                </div>
              ))}
              {jobs.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No jobs available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Candidates */}
        <Card className="shadow-xl border-0 bg-white dark:bg-gray-900">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-purple-600" />
                Recent Candidates
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/candidates')} className="gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {candidates.slice(0, 5).map(candidate => {
                const app = applications.find(a => a.candidate_id === candidate.id);
                const job = jobs.find(j => j.id === app?.job_id);

                return (
                  <div
                    key={candidate.id}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-900/50 rounded-lg hover:from-purple-50 dark:hover:from-purple-950/20 transition-all cursor-pointer border border-transparent hover:border-purple-200"
                    onClick={() => window.open(`/candidates/${candidate.id}`, '_blank')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                        {candidate.full_name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <p className="font-semibold">{candidate.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {job?.job_title || app?.job_title || 'Not assigned'}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {(candidate.status || 'new').replace('_', ' ')}
                    </Badge>
                  </div>
                );
              })}
              {candidates.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No candidates yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-xl border-2 border-dashed border-primary/30 bg-gradient-to-r from-primary/5 to-purple-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              className="group p-5 bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-xl transition-all text-left border-2 border-transparent hover:border-blue-300 hover:shadow-lg"
              onClick={() => navigate('/jobs/add')}
            >
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg inline-block mb-3 group-hover:scale-110 transition-transform">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <p className="font-semibold">Add Job</p>
              <p className="text-sm text-muted-foreground mt-1">Create new position</p>
            </button>
            <button
              className="group p-5 bg-white dark:bg-gray-900 hover:bg-purple-50 dark:hover:bg-purple-950/20 rounded-xl transition-all text-left border-2 border-transparent hover:border-purple-300 hover:shadow-lg"
              onClick={() => navigate('/candidates/add')}
            >
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg inline-block mb-3 group-hover:scale-110 transition-transform">
                <UserPlus className="h-6 w-6 text-purple-600" />
              </div>
              <p className="font-semibold">Add Candidate</p>
              <p className="text-sm text-muted-foreground mt-1">Register new talent</p>
            </button>
            <button
              className="group p-5 bg-white dark:bg-gray-900 hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-xl transition-all text-left border-2 border-transparent hover:border-orange-300 hover:shadow-lg"
              onClick={() => navigate('/ready-to-interview')}
            >
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg inline-block mb-3 group-hover:scale-110 transition-transform">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <p className="font-semibold">Ready to Interview</p>
              <p className="text-sm text-muted-foreground mt-1">Schedule interviews</p>
            </button>
            <button
              className="group p-5 bg-white dark:bg-gray-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-xl transition-all text-left border-2 border-transparent hover:border-emerald-300 hover:shadow-lg"
              onClick={() => navigate('/joined')}
            >
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg inline-block mb-3 group-hover:scale-110 transition-transform">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="font-semibold">Joined Candidates</p>
              <p className="text-sm text-muted-foreground mt-1">Track onboarding</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
