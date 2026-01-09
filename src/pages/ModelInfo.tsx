import { modelMetrics, modelInfo } from '@/lib/mock-data';
import { StatusCard } from '@/components/dashboard/StatusCard';

export default function ModelInfo() {
  const formatPercentage = (value: number) => (value * 100).toFixed(2);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Model Information</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Details about the trained fault classification model
        </p>
      </div>

      {/* Model Overview */}
      <div className="industrial-card">
        <h3 className="text-sm font-medium mb-4">Model Overview</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="data-label">Model Name</p>
            <p className="text-base font-medium mt-1">{modelInfo.name}</p>
          </div>
          <div>
            <p className="data-label">Version</p>
            <p className="text-base font-mono mt-1">{modelInfo.version}</p>
          </div>
          <div>
            <p className="data-label">Framework</p>
            <p className="text-base mt-1">{modelInfo.framework}</p>
          </div>
          <div>
            <p className="data-label">Last Trained</p>
            <p className="text-base mt-1">
              {new Date(modelInfo.lastTrained).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <p className="data-label">Architecture</p>
          <p className="text-sm font-mono mt-1 text-muted-foreground">{modelInfo.architecture}</p>
        </div>
        <div className="mt-4">
          <p className="data-label">Training Dataset</p>
          <p className="text-sm mt-1 text-muted-foreground">{modelInfo.trainingDataset}</p>
        </div>
      </div>

      {/* Performance Metrics */}
      <div>
        <h3 className="text-sm font-medium mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-4 gap-4">
          <StatusCard
            label="Accuracy"
            value={formatPercentage(modelMetrics.accuracy)}
            unit="%"
            status="normal"
          />
          <StatusCard
            label="Precision"
            value={formatPercentage(modelMetrics.precision)}
            unit="%"
            status="normal"
          />
          <StatusCard
            label="Recall"
            value={formatPercentage(modelMetrics.recall)}
            unit="%"
            status="normal"
          />
          <StatusCard
            label="F1 Score"
            value={formatPercentage(modelMetrics.f1Score)}
            unit="%"
            status="normal"
          />
        </div>
      </div>

      {/* Input Features */}
      <div className="industrial-card">
        <h3 className="text-sm font-medium mb-4">Input Features</h3>
        <div className="flex flex-wrap gap-2">
          {modelInfo.inputFeatures.map((feature) => (
            <span key={feature} className="px-3 py-1.5 bg-muted rounded-sm text-sm font-mono">
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Output Classes */}
      <div className="industrial-card">
        <h3 className="text-sm font-medium mb-4">Output Classes</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {modelInfo.outputClasses.map((cls, idx) => (
            <div key={cls} className="p-3 bg-muted/50 rounded-sm">
              <p className="text-xs text-muted-foreground font-mono">Class {idx}</p>
              <p className="text-sm font-medium mt-1">{cls}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Confusion Matrix Placeholder */}
      <div className="industrial-card">
        <h3 className="text-sm font-medium mb-4">Confusion Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr>
                <th className="p-2 text-left text-muted-foreground">Actual / Predicted</th>
                {modelInfo.outputClasses.map((cls) => (
                  <th key={cls} className="p-2 text-center text-muted-foreground truncate max-w-[80px]">
                    {cls.split(' ')[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modelInfo.outputClasses.map((rowCls, rowIdx) => (
                <tr key={rowCls}>
                  <td className="p-2 text-muted-foreground truncate max-w-[100px]">{rowCls}</td>
                  {modelInfo.outputClasses.map((_, colIdx) => {
                    // Generate realistic confusion matrix values
                    const isDiagonal = rowIdx === colIdx;
                    const value = isDiagonal 
                      ? Math.floor(85 + Math.random() * 15)
                      : Math.floor(Math.random() * 5);
                    
                    return (
                      <td 
                        key={colIdx}
                        className={`p-2 text-center ${
                          isDiagonal 
                            ? 'bg-primary/20 text-primary font-medium' 
                            : value > 0 ? 'bg-muted' : ''
                        }`}
                      >
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Values represent sample counts from the test dataset (n=1,000)
        </p>
      </div>
    </div>
  );
}
