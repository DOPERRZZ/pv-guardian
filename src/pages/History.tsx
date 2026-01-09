import { useState, useMemo } from 'react';
import { generateHistoryRecords } from '@/lib/mock-data';
import { HistoryRecord } from '@/types/pv-system';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 10;

export default function History() {
  const [records] = useState<HistoryRecord[]>(() => generateHistoryRecords(50));
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(records.length / ITEMS_PER_PAGE);
  
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return records.slice(start, start + ITEMS_PER_PAGE);
  }, [records, currentPage]);

  const getSeverityClass = (severity: HistoryRecord['severity']) => {
    switch (severity) {
      case 'Critical': return 'badge-fault';
      case 'High': return 'badge-fault';
      case 'Medium': return 'badge-warning';
      case 'Low': return 'badge-normal';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Fault History</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Historical record of detected faults and system events
        </p>
      </div>

      <div className="industrial-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Timestamp</th>
                <th>Fault Type</th>
                <th>Severity</th>
                <th>Confidence</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.map((record) => (
                <tr key={record.id}>
                  <td className="text-muted-foreground">{record.id}</td>
                  <td>{formatTimestamp(record.timestamp)}</td>
                  <td className="font-medium">{record.faultType}</td>
                  <td>
                    <span className={getSeverityClass(record.severity)}>
                      {record.severity}
                    </span>
                  </td>
                  <td className="font-mono">{(record.confidence * 100).toFixed(1)}%</td>
                  <td className="text-muted-foreground">{record.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
            {Math.min(currentPage * ITEMS_PER_PAGE, records.length)} of {records.length} records
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  if (totalPages <= 5) return true;
                  if (page === 1 || page === totalPages) return true;
                  if (Math.abs(page - currentPage) <= 1) return true;
                  return false;
                })
                .map((page, idx, arr) => (
                  <span key={page}>
                    {idx > 0 && arr[idx - 1] !== page - 1 && (
                      <span className="px-1 text-muted-foreground">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        'h-8 w-8 text-sm rounded-sm',
                        page === currentPage
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      )}
                    >
                      {page}
                    </button>
                  </span>
                ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
