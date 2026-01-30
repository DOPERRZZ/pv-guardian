import { useState } from 'react';
import { FileUpload } from '@/components/analysis/FileUpload';
import { DataPreview } from '@/components/analysis/DataPreview';
import { PredictionResults } from '@/components/analysis/PredictionResults';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Play, RotateCcw } from 'lucide-react';
import { FaultType } from '@/types/pv-system';
import { runPrediction, PredictionResponse } from '@/lib/api';
import { toast } from 'sonner';

// Mock data for demonstration (used when actual file parsing isn't available)
const mockDataset = [
  { Time: '2025-01-09 08:00', Voltage: 48.2, Current: 5.1, Power: 245.8, Irradiance: 650, Temperature: 32.1 },
  { Time: '2025-01-09 08:10', Voltage: 48.5, Current: 5.3, Power: 257.1, Irradiance: 680, Temperature: 32.5 },
  { Time: '2025-01-09 08:20', Voltage: 48.1, Current: 5.2, Power: 250.1, Irradiance: 670, Temperature: 32.8 },
  { Time: '2025-01-09 08:30', Voltage: 47.9, Current: 5.0, Power: 239.5, Irradiance: 640, Temperature: 33.0 },
  { Time: '2025-01-09 08:40', Voltage: 48.3, Current: 5.4, Power: 260.8, Irradiance: 690, Temperature: 33.2 },
  { Time: '2025-01-09 08:50', Voltage: 29.2, Current: 8.1, Power: 236.5, Irradiance: 700, Temperature: 33.5 },
  { Time: '2025-01-09 09:00', Voltage: 28.5, Current: 8.3, Power: 236.6, Irradiance: 710, Temperature: 33.8 },
  { Time: '2025-01-09 09:10', Voltage: 48.4, Current: 5.5, Power: 266.2, Irradiance: 720, Temperature: 34.0 },
  { Time: '2025-01-09 09:20', Voltage: 48.6, Current: 5.6, Power: 272.2, Irradiance: 730, Temperature: 34.2 },
  { Time: '2025-01-09 09:30', Voltage: 48.7, Current: 5.7, Power: 277.6, Irradiance: 740, Temperature: 34.5 },
];

const availableFeatures = ['Voltage', 'Current', 'Power', 'Irradiance', 'Temperature'];

export default function Analysis() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dataset, setDataset] = useState<Record<string, unknown>[] | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(['Voltage', 'Current', 'Power']);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [predictionResults, setPredictionResults] = useState<{ faultType: FaultType; probability: number }[] | null>(null);
  const [predictionTimestamp, setPredictionTimestamp] = useState<string>('');

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
    setPredictionResults(null);
    
    // Simulate file parsing (in real app, would use xlsx library)
    setTimeout(() => {
      setDataset(mockDataset);
      toast.success('Dataset loaded successfully');
    }, 500);
  };

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const handleRunInference = async () => {
    if (!dataset) return;
    
    setIsAnalyzing(true);
    
    try {
      // Call the backend ML inference endpoint
      const response: PredictionResponse = await runPrediction(
        dataset as Record<string, unknown>[],
        selectedFeatures,
        uploadedFile?.name
      );

      // Convert response to expected format
      const results = response.predictions.map(p => ({
        faultType: p.faultType as FaultType,
        probability: p.probability
      }));

      setPredictionResults(results);
      setPredictionTimestamp(response.timestamp);
      
      toast.success(`Analysis complete: ${response.topPrediction.faultType} detected`, {
        description: `Confidence: ${(response.topPrediction.probability * 100).toFixed(1)}%`
      });
    } catch (error) {
      console.error('Inference error:', error);
      toast.error('Failed to run inference', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Fallback to mock results for demo
      setPredictionResults([
        { faultType: 'Line-Line Fault', probability: 0.847 },
        { faultType: 'Normal', probability: 0.098 },
        { faultType: 'Partial Shading', probability: 0.032 },
        { faultType: 'Ground Fault', probability: 0.015 },
        { faultType: 'Open Circuit', probability: 0.005 },
        { faultType: 'Degradation', probability: 0.002 },
        { faultType: 'Arc Fault', probability: 0.001 },
      ]);
      setPredictionTimestamp(new Date().toISOString());
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setUploadedFile(null);
    setDataset(null);
    setPredictionResults(null);
    setSelectedFeatures(['Voltage', 'Current', 'Power']);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Data Analysis</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Upload PV system data for fault detection and classification
          </p>
        </div>
        {(uploadedFile || dataset) && (
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        )}
      </div>

      {/* File Upload */}
      <div className="industrial-card">
        <h3 className="text-sm font-medium mb-4">Dataset Upload</h3>
        <FileUpload onFileSelect={handleFileSelect} isLoading={false} />
        {uploadedFile && (
          <div className="mt-3 p-3 bg-muted/50 rounded-sm flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-sm">
              <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium">{uploadedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(uploadedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Data Preview */}
      {dataset && (
        <DataPreview
          data={dataset}
          columns={Object.keys(dataset[0])}
          fileName={uploadedFile?.name || 'dataset.xlsx'}
          rowCount={dataset.length}
        />
      )}

      {/* Feature Selection */}
      {dataset && (
        <div className="industrial-card">
          <h3 className="text-sm font-medium mb-4">Feature Selection</h3>
          <div className="flex flex-wrap gap-4">
            {availableFeatures.map((feature) => (
              <label key={feature} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={selectedFeatures.includes(feature)}
                  onCheckedChange={() => handleFeatureToggle(feature)}
                />
                <span className="text-sm">{feature}</span>
              </label>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-border">
            <Button 
              onClick={handleRunInference} 
              disabled={selectedFeatures.length < 2 || isAnalyzing}
              className="w-full sm:w-auto"
            >
              {isAnalyzing ? (
                <>
                  <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Model Inference
                </>
              )}
            </Button>
            {selectedFeatures.length < 2 && (
              <p className="text-xs text-muted-foreground mt-2">
                Select at least 2 features to run inference
              </p>
            )}
          </div>
        </div>
      )}

      {/* Prediction Results */}
      {predictionResults && (
        <PredictionResults
          results={predictionResults}
          timestamp={predictionTimestamp || new Date().toISOString()}
        />
      )}
    </div>
  );
}
