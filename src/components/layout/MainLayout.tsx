import { ReactNode, useState, useEffect } from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { SystemStatus, FaultType } from '@/types/pv-system';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [systemState, setSystemState] = useState({
    status: 'Normal' as SystemStatus,
    currentFault: 'Normal' as FaultType,
    confidence: 0.98,
    lastUpdated: new Date().toISOString(),
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemState(prev => ({
        ...prev,
        lastUpdated: new Date().toISOString(),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <TopBar status={systemState.status} lastUpdated={systemState.lastUpdated} />
      <Sidebar />
      <main className="ml-56 pt-14 min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
