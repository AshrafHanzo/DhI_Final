import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Briefcase, Users, TrendingUp, Lock, FileText, BarChart3, Settings } from 'lucide-react';
import { NavLink } from '@/components/NavLink';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  console.log('🔍 Layout component rendering with user:', user);

  return (
    <div className="flex min-h-screen bg-muted/50 relative">
      {/* Sticky Sidebar - Overlays content */}
      <aside className="w-64 border-r border-border bg-card fixed top-0 left-0 h-screen overflow-y-auto z-30 shadow-lg" style={{ backgroundColor: '#f8f9fa', borderRight: '2px solid #dee2e6' }}>
        <div className="flex h-16 items-center justify-center border-b border-border px-4 sticky top-0 bg-card z-10" style={{ backgroundColor: '#ffffff', borderBottom: '2px solid #dee2e6' }}>
          <img src="/dhi-logo.jpg" alt="DHI Consultancy" className="h-12 object-contain" />
        </div>
        <nav className="space-y-1 p-4">
          <NavLink to="/" icon={<TrendingUp className="h-4 w-4" />}>
            Dashboard
          </NavLink>
          <NavLink to="/jobs" icon={<Briefcase className="h-4 w-4" />}>
            Jobs
          </NavLink>
          <NavLink to="/candidates" icon={<Users className="h-4 w-4" />}>
            Candidates
          </NavLink>
          <NavLink to="/applications" icon={<FileText className="h-4 w-4" />}>
            Applications
          </NavLink>
          <NavLink to="/ready-to-interview" icon={<Users className="h-4 w-4" />}>
            Ready to Interview
          </NavLink>
          <NavLink to="/interview" icon={<Users className="h-4 w-4" />}>
            Interview Scheduled
          </NavLink>
          <NavLink to="/selected" icon={<Users className="h-4 w-4" />}>
            Selected Candidates
          </NavLink>
          <NavLink to="/joined" icon={<Users className="h-4 w-4" />}>
            Joined Candidates
          </NavLink>
          <NavLink to="/recruiter-dashboard" icon={<BarChart3 className="h-4 w-4" />}>
            Recruiter Dashboard
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin-settings" icon={<Settings className="h-4 w-4" />}>
              Admin Settings
            </NavLink>
          )}
          {user?.role === 'owner' && (
            <NavLink to="/lockin" icon={<Lock className="h-4 w-4" />}>
              Lock-in Tracking
            </NavLink>
          )}
          {(user?.role === 'manager' || user?.role === 'owner') && (
            <NavLink to="/performance" icon={<TrendingUp className="h-4 w-4" />}>
              Performance
            </NavLink>
          )}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col w-full">
        {/* Sticky Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6 sticky top-0 z-20 shadow-sm pl-72">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-foreground">{user?.name}</h2>
            <span className="rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 px-3 py-1 text-xs font-medium text-primary capitalize">
              {user?.role}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </header>

        <main className="flex-1 overflow-auto ml-64">{children}</main>
      </div>
    </div>
  );
}
