import { cn } from '@/lib/utils';

interface StatusCardProps {
  label: string;
  value: string | number;
  unit?: string;
  status?: 'normal' | 'fault' | 'warning' | 'default';
  className?: string;
}

export function StatusCard({ label, value, unit, status = 'default', className }: StatusCardProps) {
  const statusClasses = {
    normal: 'border-l-status-normal',
    fault: 'border-l-status-fault',
    warning: 'border-l-status-warning',
    default: 'border-l-border',
  };

  return (
    <div className={cn(
      'industrial-card border-l-4',
      statusClasses[status],
      className
    )}>
      <p className="data-label mb-2">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className={cn(
          'data-value',
          status === 'normal' && 'text-status-normal',
          status === 'fault' && 'text-status-fault',
          status === 'warning' && 'text-status-warning'
        )}>
          {value}
        </span>
        {unit && (
          <span className="text-sm text-muted-foreground">{unit}</span>
        )}
      </div>
    </div>
  );
}
