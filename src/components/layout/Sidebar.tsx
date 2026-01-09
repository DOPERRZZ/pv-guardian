import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  LineChart, 
  History, 
  Cpu, 
  Settings 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/analysis', icon: LineChart, label: 'Analysis' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/model-info', icon: Cpu, label: 'Model Info' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-14 bottom-0 w-56 bg-sidebar border-r border-sidebar-border">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="p-3 bg-muted/50 rounded-sm">
          <p className="text-xs text-muted-foreground font-mono">
            System v2.1.0
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            ML Model: Active
          </p>
        </div>
      </div>
    </aside>
  );
}
