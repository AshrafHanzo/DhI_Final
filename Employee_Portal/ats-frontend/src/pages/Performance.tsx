import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserPlus, TrendingUp, Award } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, FunnelChart, Funnel, LabelList, Cell } from 'recharts';

export default function Performance() {
  const { candidates } = useData();

  const recruiterStats = candidates.reduce((acc, candidate) => {
    if (!acc[candidate.recruiterId]) {
      acc[candidate.recruiterId] = {
        added: 0,
        screened: 0,
        selected: 0,
        joined: 0,
        lockInCompleted: 0,
      };
    }

    acc[candidate.recruiterId].added++;
    if (candidate.status === 'screening' || candidate.status === 'interview_ready') {
      acc[candidate.recruiterId].screened++;
    }
    if (candidate.status === 'selected') {
      acc[candidate.recruiterId].selected++;
    }
    if (candidate.status === 'joined') {
      acc[candidate.recruiterId].joined++;
    }

    return acc;
  }, {} as Record<string, any>);

  // Overall funnel data
  const totalAdded = candidates.length;
  const totalScreened = candidates.filter(c => c.status === 'screening' || c.status === 'interview_ready' || c.status === 'selected' || c.status === 'joined').length;
  const totalSelected = candidates.filter(c => c.status === 'selected' || c.status === 'joined').length;
  const totalJoined = candidates.filter(c => c.status === 'joined').length;

  const funnelData = [
    { stage: 'Added', value: totalAdded, fill: 'hsl(var(--primary))' },
    { stage: 'Screened', value: totalScreened, fill: 'hsl(var(--chart-2))' },
    { stage: 'Selected', value: totalSelected, fill: 'hsl(var(--chart-3))' },
    { stage: 'Joined', value: totalJoined, fill: 'hsl(var(--chart-4))' },
  ];

  // Team rankings by conversion rate
  const rankingsData = Object.entries(recruiterStats)
    .map(([recruiterId, stats]: [string, any]) => ({
      recruiter: `Recruiter #${recruiterId}`,
      conversionRate: stats.added > 0 ? Math.round((stats.joined / stats.added) * 100) : 0,
      joined: stats.joined,
      added: stats.added,
    }))
    .sort((a, b) => b.conversionRate - a.conversionRate);

  const chartConfig = {
    conversionRate: {
      label: "Conversion Rate",
      color: "hsl(var(--primary))",
    },
    joined: {
      label: "Joined",
      color: "hsl(var(--chart-2))",
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Recruiter Performance</h1>
        <p className="text-muted-foreground mt-1">Track team performance metrics</p>
      </div>

      {/* Visual Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recruitment Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Recruitment Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <FunnelChart>
                <Funnel
                  data={funnelData}
                  dataKey="value"
                >
                  <LabelList position="inside" fill="#fff" stroke="none" dataKey="stage" />
                  <LabelList position="inside" fill="#fff" stroke="none" dataKey="value" dy={20} />
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Funnel>
              </FunnelChart>
            </ChartContainer>
            <div className="mt-4 grid grid-cols-4 gap-2 text-center text-sm">
              <div>
                <div className="font-semibold text-foreground">{totalAdded}</div>
                <div className="text-muted-foreground">Added</div>
              </div>
              <div>
                <div className="font-semibold text-foreground">
                  {totalAdded > 0 ? Math.round((totalScreened / totalAdded) * 100) : 0}%
                </div>
                <div className="text-muted-foreground">Screened</div>
              </div>
              <div>
                <div className="font-semibold text-foreground">
                  {totalScreened > 0 ? Math.round((totalSelected / totalScreened) * 100) : 0}%
                </div>
                <div className="text-muted-foreground">Selected</div>
              </div>
              <div>
                <div className="font-semibold text-foreground">
                  {totalSelected > 0 ? Math.round((totalJoined / totalSelected) * 100) : 0}%
                </div>
                <div className="text-muted-foreground">Joined</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Rankings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Team Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={rankingsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="recruiter" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="conversionRate" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
            <div className="mt-4 space-y-2">
              {rankingsData.slice(0, 3).map((data, index) => (
                <div key={data.recruiter} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      index === 0 ? 'bg-primary text-primary-foreground' : 
                      index === 1 ? 'bg-chart-2 text-white' : 
                      'bg-chart-3 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-foreground">{data.recruiter}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-foreground">{data.conversionRate}%</div>
                    <div className="text-xs text-muted-foreground">{data.joined}/{data.added} joined</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid gap-4">
        {Object.entries(recruiterStats).map(([recruiterId, stats]: [string, any]) => (
          <Card key={recruiterId}>
            <CardHeader>
              <CardTitle>Recruiter #{recruiterId}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Added</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.added}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Screened</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.screened}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Selected</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.selected}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Joined</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.joined}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Conversion</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {stats.added > 0 ? Math.round((stats.joined / stats.added) * 100) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
