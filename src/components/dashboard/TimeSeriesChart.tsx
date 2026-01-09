import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts';
import { PVDataPoint } from '@/types/pv-system';

interface TimeSeriesChartProps {
  data: PVDataPoint[];
  dataKey: 'voltage' | 'current' | 'power';
  title: string;
  unit: string;
  color: string;
  showFaultZone?: boolean;
}

export function TimeSeriesChart({ 
  data, 
  dataKey, 
  title, 
  unit, 
  color,
  showFaultZone = false 
}: TimeSeriesChartProps) {
  const chartData = useMemo(() => {
    return data.map((point, index) => ({
      ...point,
      time: new Date(point.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      index,
    }));
  }, [data]);

  // Find fault zones for highlighting
  const faultZones = useMemo(() => {
    if (!showFaultZone) return [];
    
    const zones: { start: number; end: number }[] = [];
    let inFault = false;
    let startIdx = 0;

    chartData.forEach((point, idx) => {
      if (point.isFault && !inFault) {
        inFault = true;
        startIdx = idx;
      } else if (!point.isFault && inFault) {
        inFault = false;
        zones.push({ start: startIdx, end: idx - 1 });
      }
    });

    if (inFault) {
      zones.push({ start: startIdx, end: chartData.length - 1 });
    }

    return zones;
  }, [chartData, showFaultZone]);

  const maxValue = Math.max(...data.map(d => d[dataKey]));
  const minValue = Math.min(...data.map(d => d[dataKey]));

  return (
    <div className="industrial-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">{title}</h3>
        <span className="text-xs text-muted-foreground font-mono">{unit}</span>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              vertical={false}
            />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={[minValue * 0.9, maxValue * 1.1]}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              width={50}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '2px',
                fontSize: '12px',
                fontFamily: 'IBM Plex Mono, monospace',
              }}
              labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
            />
            
            {/* Fault zone highlighting */}
            {faultZones.map((zone, idx) => (
              <ReferenceArea
                key={idx}
                x1={zone.start}
                x2={zone.end}
                fill="hsl(var(--status-fault))"
                fillOpacity={0.1}
                stroke="hsl(var(--status-fault))"
                strokeOpacity={0.3}
              />
            ))}
            
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3, fill: color }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
