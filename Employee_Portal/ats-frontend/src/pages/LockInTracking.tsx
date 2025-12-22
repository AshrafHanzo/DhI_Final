import { useData } from '@/contexts/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function LockInTracking() {
  const { candidates, jobs } = useData();
  const [filter, setFilter] = useState<'all' | 'this_week' | 'earlyjob' | 'dhi'>('all');

  const joinedCandidates = candidates.filter(c => c.status === 'joined');

  const calculateLockInInfo = (doj: string, lockInDays: number = 60) => {
    const joinDate = new Date(doj);
    const lockInEndDate = new Date(joinDate);
    lockInEndDate.setDate(lockInEndDate.getDate() + lockInDays);
    
    const today = new Date();
    const totalDays = lockInDays;
    const daysCompleted = Math.min(
      totalDays,
      Math.floor((today.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24))
    );
    const daysRemaining = Math.max(0, totalDays - daysCompleted);
    
    return {
      daysCompleted,
      daysRemaining,
      totalDays,
      lockInEndDate: lockInEndDate.toLocaleDateString(),
      isEligible: daysRemaining === 0,
      isDueSoon: daysRemaining <= 7 && daysRemaining > 0,
    };
  };

  const filteredCandidates = joinedCandidates.filter(candidate => {
    const job = jobs.find(j => j.id === candidate.jobId);
    if (!candidate.dateOfJoining) return false;

    const lockInInfo = calculateLockInInfo(candidate.dateOfJoining, candidate.lockInDays);

    if (filter === 'this_week' && !lockInInfo.isDueSoon && !lockInInfo.isEligible) return false;
    if (filter === 'earlyjob' && job?.source !== 'EarlyJob') return false;
    if (filter === 'dhi' && job?.source !== 'DHI') return false;

    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Lock-in Tracking</h1>
        <p className="text-muted-foreground mt-1">Track payment eligibility and lock-in periods</p>
      </div>

      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'this_week' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('this_week')}
        >
          Due This Week
        </Button>
        <Button
          variant={filter === 'earlyjob' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('earlyjob')}
        >
          EarlyJob Payouts
        </Button>
        <Button
          variant={filter === 'dhi' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('dhi')}
        >
          DHI Payouts
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredCandidates.map(candidate => {
          const job = jobs.find(j => j.id === candidate.jobId);
          const lockInInfo = candidate.dateOfJoining
            ? calculateLockInInfo(candidate.dateOfJoining, candidate.lockInDays)
            : null;

          return (
            <Card key={candidate.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{candidate.name}</h3>
                      {lockInInfo?.isEligible && (
                        <Badge className="bg-success/10 text-success">Payment Eligible</Badge>
                      )}
                      {lockInInfo?.isDueSoon && (
                        <Badge className="bg-warning/10 text-warning">Due Soon</Badge>
                      )}
                      <Badge variant="outline">{job?.source}</Badge>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground">Company</p>
                        <p className="font-medium">{job?.company}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">DOJ</p>
                        <p className="font-medium">
                          {candidate.dateOfJoining
                            ? new Date(candidate.dateOfJoining).toLocaleDateString()
                            : 'Not set'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Lock-in Duration</p>
                        <p className="font-medium">{candidate.lockInDays || 60} days</p>
                      </div>
                    </div>

                    {lockInInfo && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">
                            {lockInInfo.daysCompleted} / {lockInInfo.totalDays} days
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{
                              width: `${(lockInInfo.daysCompleted / lockInInfo.totalDays) * 100}%`,
                            }}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Lock-in end date: {lockInInfo.lockInEndDate}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredCandidates.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No candidates match the selected filter</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
