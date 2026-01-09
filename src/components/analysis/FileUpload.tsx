import { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export function FileUpload({ onFileSelect, isLoading = false }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    const validExtensions = ['.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    const isValidType = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidType) {
      setError('Invalid file type. Only .xlsx files are accepted.');
      return false;
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      setError('File size exceeds 50MB limit.');
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-sm p-8 text-center transition-colors cursor-pointer',
          isDragging ? 'border-primary bg-accent/50' : 'border-border hover:border-primary/50',
          isLoading && 'opacity-50 pointer-events-none'
        )}
      >
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
          disabled={isLoading}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 bg-muted rounded-sm">
              {isLoading ? (
                <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">
                {isLoading ? 'Processing...' : 'Drop Excel file here or click to browse'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports .xlsx format only (max 50MB)
              </p>
            </div>
          </div>
        </label>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-status-fault">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
