import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Users,
    Target,
    TrendingUp,
    CheckCircle,
    PhoneCall,
    Award,
    BarChart3,
    Trophy,
    Medal,
    Star,
    Calendar
} from 'lucide-react';
import { API_ENDPOINTS, API_BASE_URL } from '@/config/api';

interface RecruiterStats {
    recruiter: string;
    total_applications: number;
    ready_to_interview: number;
    selected: number;
    joined: number;
}

interface GlobalStats {
    total_applications: number;
    screening_ready: number;
    interview_selected: number;
    joined_count: number;
}

export default function RecruiterDashboard() {
    const [recruiterStats, setRecruiterStats] = useState<RecruiterStats[]>([]);
    const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [timePeriod, setTimePeriod] = useState('all'); // 'all', 'today', 'week', 'month', 'year'

    // Fetch recruiter stats and global stats from API
    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);

                // Fetch all recruiters from Admin API
                const allRecruitersRes = await fetch(`${API_BASE_URL}/api/admin/recruiters`);
                let allRecruiters: string[] = [];
                if (allRecruitersRes.ok) {
                    const recruitersData = await allRecruitersRes.json();
                    allRecruiters = recruitersData
                        .filter((r: any) => r.is_active !== false)
                        .map((r: any) => r.name);
                }

                // Fetch recruiter-specific stats
                const recruiterRes = await fetch(`${API_ENDPOINTS.DASHBOARD}recruiter-stats?period=${timePeriod}`);
                let recruiterData: RecruiterStats[] = [];
                if (recruiterRes.ok) {
                    recruiterData = await recruiterRes.json();
                }

                // Merge: include all recruiters from admin, with stats if available
                const statsMap = new Map(recruiterData.map(r => [r.recruiter, r]));
                const mergedStats: RecruiterStats[] = allRecruiters.map(name => {
                    const existingStats = statsMap.get(name);
                    if (existingStats) {
                        return existingStats;
                    }
                    return {
                        recruiter: name,
                        total_applications: 0,
                        ready_to_interview: 0,
                        selected: 0,
                        joined: 0
                    };
                });

                // Add any recruiters from stats that might not be in admin (edge case)
                recruiterData.forEach(r => {
                    if (!allRecruiters.includes(r.recruiter)) {
                        mergedStats.push(r);
                    }
                });

                setRecruiterStats(mergedStats);

                // Fetch global stats for accurate totals
                const globalRes = await fetch(API_ENDPOINTS.DASHBOARD);
                if (globalRes.ok) {
                    const globalData = await globalRes.json();
                    setGlobalStats({
                        total_applications: globalData.total_applications || 0,
                        screening_ready: globalData.screening_ready || 0,
                        interview_selected: globalData.interview_selected || 0,
                        joined_count: globalData.joined_count || 0
                    });
                }
            } catch (error) {
                console.error('Failed to fetch recruiter stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [timePeriod]);

    // Calculate totals from recruiter stats (for recruiter-attributed counts)
    const recruiterTotals = recruiterStats.reduce((acc, r) => ({
        approached: acc.approached + r.total_applications,
        ready: acc.ready + r.ready_to_interview,
        selected: acc.selected + r.selected,
        joined: acc.joined + r.joined
    }), { approached: 0, ready: 0, selected: 0, joined: 0 });

    // Use global stats for total joined/selected to include unattributed candidates
    const totals = {
        approached: recruiterTotals.approached,
        ready: globalStats?.screening_ready || recruiterTotals.ready,
        selected: globalStats?.interview_selected || recruiterTotals.selected,
        joined: globalStats?.joined_count || recruiterTotals.joined
    };

    // Get top performer
    const topPerformer = recruiterStats.length > 0
        ? recruiterStats.reduce((max, r) => r.joined > max.joined ? r : max, recruiterStats[0])
        : null;

    return (
        <div className="space-y-6 pb-12">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <BarChart3 className="h-8 w-8" />
                            <h1 className="text-4xl font-bold">Recruiter Dashboard</h1>
                        </div>
                        <p className="text-white/80 text-lg mt-2">
                            Track recruiter performance and productivity metrics
                        </p>
                    </div>

                    {/* Time Period Filter */}
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg p-2">
                        <Calendar className="h-5 w-5 text-white" />
                        <Select value={timePeriod} onValueChange={setTimePeriod}>
                            <SelectTrigger className="w-[140px] bg-white/20 border-white/30 text-white hover:bg-white/30">
                                <SelectValue placeholder="Time Period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Time</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="week">This Week</SelectItem>
                                <SelectItem value="month">This Month</SelectItem>
                                <SelectItem value="year">This Year</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/90">Total Recruiters</CardTitle>
                        <Users className="h-5 w-5" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{recruiterStats.length}</div>
                        <p className="text-xs text-white/70 mt-1">Active recruiters</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0 shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/90">Total Approached</CardTitle>
                        <Target className="h-5 w-5" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{totals.approached}</div>
                        <p className="text-xs text-white/70 mt-1">Applications sourced</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/90">Ready for Interview</CardTitle>
                        <PhoneCall className="h-5 w-5" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{totals.ready}</div>
                        <p className="text-xs text-white/70 mt-1">Screened candidates</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/90">Selected</CardTitle>
                        <Award className="h-5 w-5" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{totals.selected}</div>
                        <p className="text-xs text-white/70 mt-1">After interview</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/90">Total Joined</CardTitle>
                        <CheckCircle className="h-5 w-5" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{totals.joined}</div>
                        <p className="text-xs text-white/70 mt-1">Successfully onboarded</p>
                    </CardContent>
                </Card>
            </div>

            {/* Top Performer Card */}
            {topPerformer && topPerformer.joined > 0 && (
                <Card className="border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-950/20 dark:via-amber-950/20 dark:to-orange-950/20 shadow-xl overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl"></div>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                            <Trophy className="h-6 w-6" />
                            Top Performer
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                {topPerformer.recruiter?.split(' ').map(n => n[0]).join('') || '?'}
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{topPerformer.recruiter}</p>
                                <div className="flex items-center gap-4 mt-2">
                                    <Badge className="bg-yellow-500 text-white">{topPerformer.joined} Joined</Badge>
                                    <Badge variant="outline">{topPerformer.total_applications} Approached</Badge>
                                    <div className="flex items-center gap-1 text-yellow-600">
                                        <Star className="h-4 w-4 fill-yellow-400" />
                                        <Star className="h-4 w-4 fill-yellow-400" />
                                        <Star className="h-4 w-4 fill-yellow-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Recruiter Performance Table */}
            <Card className="shadow-xl border-0 bg-white dark:bg-gray-900 overflow-hidden">
                <CardHeader className="border-b bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-indigo-600" />
                            All Recruiters Performance
                        </CardTitle>
                        <Badge variant="outline" className="text-sm">
                            {recruiterStats.length} Recruiters
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                            <p>Loading recruiter data...</p>
                        </div>
                    ) : recruiterStats.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No recruiter data available</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
                                        <th className="text-left py-4 px-6 font-semibold text-sm">
                                            <div className="flex items-center gap-2">
                                                <Medal className="h-4 w-4 text-indigo-600" />
                                                Rank
                                            </div>
                                        </th>
                                        <th className="text-left py-4 px-6 font-semibold text-sm">Recruiter</th>
                                        <th className="text-center py-4 px-4 font-semibold text-sm">
                                            <div className="flex flex-col items-center">
                                                <Target className="h-4 w-4 text-blue-600 mb-1" />
                                                <span>Approached</span>
                                            </div>
                                        </th>
                                        <th className="text-center py-4 px-4 font-semibold text-sm">
                                            <div className="flex flex-col items-center">
                                                <PhoneCall className="h-4 w-4 text-amber-600 mb-1" />
                                                <span>Ready for Interview</span>
                                            </div>
                                        </th>
                                        <th className="text-center py-4 px-4 font-semibold text-sm">
                                            <div className="flex flex-col items-center">
                                                <Award className="h-4 w-4 text-green-600 mb-1" />
                                                <span>Selected</span>
                                            </div>
                                        </th>
                                        <th className="text-center py-4 px-4 font-semibold text-sm">
                                            <div className="flex flex-col items-center">
                                                <CheckCircle className="h-4 w-4 text-emerald-600 mb-1" />
                                                <span>Joined</span>
                                            </div>
                                        </th>
                                        <th className="text-center py-4 px-4 font-semibold text-sm">
                                            <div className="flex flex-col items-center">
                                                <TrendingUp className="h-4 w-4 text-purple-600 mb-1" />
                                                <span>Conversion</span>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recruiterStats
                                        .sort((a, b) => b.joined - a.joined)
                                        .map((recruiter, index) => {
                                            const conversionRate = recruiter.total_applications > 0
                                                ? ((recruiter.joined / recruiter.total_applications) * 100).toFixed(1)
                                                : '0.0';

                                            const getRankBadge = (rank: number) => {
                                                if (rank === 0) return <div className="h-8 w-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold shadow-lg">🥇</div>;
                                                if (rank === 1) return <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-white font-bold shadow-lg">🥈</div>;
                                                if (rank === 2) return <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg">🥉</div>;
                                                return <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm">{rank + 1}</div>;
                                            };

                                            return (
                                                <tr
                                                    key={recruiter.recruiter}
                                                    className={`border-b last:border-b-0 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 dark:hover:from-purple-950/20 dark:hover:to-pink-950/20 transition-all ${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-slate-50/50 dark:bg-slate-900/50'}`}
                                                >
                                                    <td className="py-4 px-6">
                                                        {getRankBadge(index)}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                                                                index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                                                                    index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                                                                        'bg-gradient-to-br from-indigo-500 to-purple-500'
                                                                }`}>
                                                                {recruiter.recruiter?.split(' ').map(n => n[0]).join('') || '?'}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold">{recruiter.recruiter}</p>
                                                                <p className="text-xs text-muted-foreground">Recruiter</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="text-center py-4 px-4">
                                                        <div className="inline-flex items-center justify-center h-12 w-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl shadow">
                                                            <span className="font-bold text-lg text-blue-700 dark:text-blue-300">{recruiter.total_applications}</span>
                                                        </div>
                                                    </td>
                                                    <td className="text-center py-4 px-4">
                                                        <div className="inline-flex items-center justify-center h-12 w-20 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 rounded-xl shadow">
                                                            <span className="font-bold text-lg text-amber-700 dark:text-amber-300">{recruiter.ready_to_interview}</span>
                                                        </div>
                                                    </td>
                                                    <td className="text-center py-4 px-4">
                                                        <div className="inline-flex items-center justify-center h-12 w-20 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl shadow">
                                                            <span className="font-bold text-lg text-green-700 dark:text-green-300">{recruiter.selected}</span>
                                                        </div>
                                                    </td>
                                                    <td className="text-center py-4 px-4">
                                                        <div className="inline-flex items-center justify-center h-12 w-20 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-xl shadow">
                                                            <span className="font-bold text-lg text-emerald-700 dark:text-emerald-300">{recruiter.joined}</span>
                                                        </div>
                                                    </td>
                                                    <td className="text-center py-4 px-4">
                                                        <div className={`inline-flex items-center justify-center h-12 px-4 rounded-xl font-bold text-lg shadow ${parseFloat(conversionRate) >= 10
                                                            ? 'bg-gradient-to-br from-green-100 to-emerald-200 text-green-700 dark:from-green-900/30 dark:to-emerald-800/30 dark:text-green-300'
                                                            : parseFloat(conversionRate) >= 5
                                                                ? 'bg-gradient-to-br from-yellow-100 to-amber-200 text-yellow-700 dark:from-yellow-900/30 dark:to-amber-800/30 dark:text-yellow-300'
                                                                : 'bg-gradient-to-br from-red-100 to-orange-200 text-red-700 dark:from-red-900/30 dark:to-orange-800/30 dark:text-red-300'
                                                            }`}>
                                                            {conversionRate}%
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
