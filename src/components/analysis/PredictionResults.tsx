import { FaultType } from '@/types/pv-system';
import { Check } from 'lucide-react';

interface PredictionResult {
  faultType: FaultType;
  probability: number;
}

interface PredictionResultsProps {
  results: PredictionResult[];
  timestamp: string;
}

export function PredictionResults({ results, timestamp }: PredictionResultsProps) {
  const sortedResults = [...results].sort((a, b) => b.probability - a.probability);
  const topPrediction = sortedResults[0];

  return (
    <div className="industrial-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">Prediction Results</h3>
        <span className="text-xs text-muted-foreground font-mono">
          {new Date(timestamp).toLocaleString()}
        </span>
      </div>

      <div className="space-y-4">
        {/* Top Prediction */}
        <div className="p-4 bg-muted/50 rounded-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="data-label">Predicted Fault Type</p>
              <p className="text-lg font-semibold mt-1">{topPrediction.faultType}</p>
            </div>
            <div className="text-right">
              <p className="data-label">Confidence</p>
              <p className="data-value text-primary">{(topPrediction.probability * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* All Probabilities */}
        <div>
          <p className="data-label mb-3">Class Probabilities</p>
          <div className="space-y-2">
            {sortedResults.map((result, idx) => (
              <div key={result.faultType} className="flex items-center gap-3">
                <div className="w-5">
                  {idx === 0 && <Check className="h-4 w-4 text-primary" />}
                </div>
                <span className="text-sm w-32 truncate">{result.faultType}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all"
                    style={{ width: `${result.probability * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono w-16 text-right text-muted-foreground">
                  {(result.probability * 100).toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
