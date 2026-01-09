interface DataPreviewProps {
  data: Record<string, unknown>[];
  columns: string[];
  fileName: string;
  rowCount: number;
}

export function DataPreview({ data, columns, fileName, rowCount }: DataPreviewProps) {
  const previewRows = data.slice(0, 10);

  return (
    <div className="industrial-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium">Data Preview</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {fileName} • {rowCount.toLocaleString()} rows • {columns.length} columns
          </p>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          Showing first 10 rows
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-12">#</th>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row, idx) => (
              <tr key={idx}>
                <td className="text-muted-foreground">{idx + 1}</td>
                {columns.map((col) => (
                  <td key={col}>
                    {typeof row[col] === 'number' 
                      ? (row[col] as number).toFixed(3)
                      : String(row[col] ?? '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
