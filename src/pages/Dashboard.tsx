import { useState, useEffect } from 'react';
import { StatusCard } from '@/components/dashboard/StatusCard';
import { TimeSeriesChart } from '@/components/dashboard/TimeSeriesChart';
import { generateTimeSeriesData } from '@/lib/mock-data';
import { getSystemStatus, SystemStatus as ApiSystemStatus } from '@/lib/api';
import { PVDataPoint, FaultType, SystemStatus } from '@/types/pv-system';

export default function Dashboard() {
  const [timeSeriesData, setTimeSeriesData] = useState<PVDataPoint[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>('Normal');
  const [currentFault, setCurrentFault] = useState<FaultType>('Normal');
  const [confidence, setConfidence] = useState(98.2);
  const [lastUpdated, setLastUpdated] = useState(new Date().toISOString());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Generate time series data
    const data = generateTimeSeriesData(24, true);
    setTimeSeriesData(data);

    // Fetch system status from backend
    async function fetchStatus() {
      try {
        const status = await getSystemStatus();
        setSystemStatus(status.status);
        setCurrentFault(status.current_fault as FaultType);
        setConfidence(Number(status.confidence) * 100);
        setLastUpdated(status.last_updated);
      } catch (error) {
        console.error('Failed to fetch status:', error);
        // Fallback to mock data
        const hasFault = data.some(d => d.isFault);
        if (hasFault) {
          setSystemStatus('Fault');
          setCurrentFault('Line-Line Fault');
          setConfidence(94.7);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchStatus();

    // Refresh status periodically
    const interval = setInterval(() => {
      fetchStatus();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const formattedDate = new Date(lastUpdated).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">System Overview</h2>
        <span className="text-xs text-muted-foreground font-mono">
          {isLoading ? 'Loading...' : `Last updated: ${formattedDate}`}
        </span>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatusCard
          label="System Status"
          value={systemStatus}
          status={systemStatus === 'Normal' ? 'normal' : 'fault'}
        />
        <StatusCard
          label="Detected Fault"
          value={currentFault}
          status={currentFault === 'Normal' ? 'normal' : 'fault'}
        />
        <StatusCard
          label="Model Confidence"
          value={confidence.toFixed(1)}
          unit="%"
          status={confidence > 90 ? 'normal' : confidence > 75 ? 'warning' : 'fault'}
        />
        <StatusCard
          label="Active Alerts"
          value={systemStatus === 'Fault' ? 1 : 0}
          status={systemStatus === 'Fault' ? 'fault' : 'normal'}
        />
      </div>

      {/* Time Series Charts */}
      <div className="grid grid-cols-1 gap-4">
        <TimeSeriesChart
          data={timeSeriesData}
          dataKey="voltage"
          title="DC Voltage"
          unit="V"
          color="hsl(210, 90%, 50%)"
          showFaultZone={true}
        />
        <div className="grid grid-cols-2 gap-4">
          <TimeSeriesChart
            data={timeSeriesData}
            dataKey="current"
            title="DC Current"
            unit="A"
            color="hsl(142, 60%, 45%)"
            showFaultZone={true}
          />
          <TimeSeriesChart
            data={timeSeriesData}
            dataKey="power"
            title="Output Power"
            unit="W"
            color="hsl(38, 92%, 50%)"
            showFaultZone={true}
          />
        </div>
      </div>

      {/* System Metrics */}
      <div className="industrial-card">
        <h3 className="text-sm font-medium mb-4">Current Readings</h3>
        <div className="grid grid-cols-5 gap-6">
          {timeSeriesData.length > 0 && (
            <>
              <div>
                <p className="data-label">Voltage</p>
                <p className="data-value">{timeSeriesData[timeSeriesData.length - 1].voltage.toFixed(2)} V</p>
              </div>
              <div>
                <p className="data-label">Current</p>
                <p className="data-value">{timeSeriesData[timeSeriesData.length - 1].current.toFixed(2)} A</p>
              </div>
              <div>
                <p className="data-label">Power</p>
                <p className="data-value">{timeSeriesData[timeSeriesData.length - 1].power.toFixed(2)} W</p>
              </div>
              <div>
                <p className="data-label">Irradiance</p>
                <p className="data-value">{timeSeriesData[timeSeriesData.length - 1].irradiance} W/m²</p>
              </div>
              <div>
                <p className="data-label">Temperature</p>
                <p className="data-value">{timeSeriesData[timeSeriesData.length - 1].temperature?.toFixed(1)} °C</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
