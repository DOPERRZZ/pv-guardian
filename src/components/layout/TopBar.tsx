import { SystemStatus } from '@/types/pv-system';
import { Activity, Zap } from 'lucide-react';

interface TopBarProps {
  status: SystemStatus;
  lastUpdated: string;
}

export function TopBar({ status, lastUpdated }: TopBarProps) {
  const getStatusDisplay = () => {
    switch (status) {
      case 'Normal':
        return {
          label: 'NORMAL',
          className: 'badge-normal',
          dotClass: 'bg-status-normal',
        };
      case 'Fault':
        return {
          label: 'FAULT DETECTED',
          className: 'badge-fault',
          dotClass: 'bg-status-fault',
        };
      case 'Warning':
        return {
          label: 'WARNING',
          className: 'badge-warning',
          dotClass: 'bg-status-warning',
        };
    }
  };

  const statusDisplay = getStatusDisplay();
  const formattedTime = new Date(lastUpdated).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-card border-b border-border z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <Zap className="h-5 w-5 text-primary" />
        <h1 className="text-base font-semibold tracking-tight">
          PV Fault Detection System
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4" />
          <span className="font-mono">{formattedTime}</span>
        </div>

        <div className={statusDisplay.className}>
          <span className={`h-2 w-2 rounded-full ${statusDisplay.dotClass} pulse-indicator`} />
          <span className="font-mono">{statusDisplay.label}</span>
        </div>
      </div>
    </header>
  );
}
