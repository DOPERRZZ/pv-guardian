import { PVDataPoint, HistoryRecord, FaultType, ModelMetrics } from '@/types/pv-system';

// Generate realistic PV time-series data with optional fault injection
export function generateTimeSeriesData(hours: number = 24, injectFault: boolean = false): PVDataPoint[] {
  const data: PVDataPoint[] = [];
  const now = new Date();
  const baseVoltage = 48;
  const baseCurrent = 8;
  
  for (let i = 0; i < hours * 6; i++) { // 10-minute intervals
    const timestamp = new Date(now.getTime() - (hours * 6 - i) * 10 * 60 * 1000);
    const hourOfDay = timestamp.getHours();
    
    // Simulate solar irradiance curve
    let irradianceFactor = 0;
    if (hourOfDay >= 6 && hourOfDay <= 18) {
      irradianceFactor = Math.sin((hourOfDay - 6) * Math.PI / 12);
    }
    
    // Add some noise
    const noise = (Math.random() - 0.5) * 0.1;
    
    // Determine if this is a fault zone
    const isFault = injectFault && i >= hours * 4 && i <= hours * 4 + 12;
    
    let voltage = baseVoltage * (0.9 + irradianceFactor * 0.1) + noise * 5;
    let current = baseCurrent * irradianceFactor + noise * 2;
    
    if (isFault) {
      voltage = voltage * 0.6; // Voltage drop during fault
      current = current * 1.5; // Current spike
    }
    
    const power = Math.max(0, voltage * current);
    
    data.push({
      timestamp: timestamp.toISOString(),
      voltage: Math.round(voltage * 100) / 100,
      current: Math.round(Math.max(0, current) * 100) / 100,
      power: Math.round(power * 100) / 100,
      irradiance: Math.round(irradianceFactor * 1000),
      temperature: 25 + irradianceFactor * 20 + noise * 5,
      isFault,
    });
  }
  
  return data;
}

export function generateHistoryRecords(count: number = 20): HistoryRecord[] {
  const faultTypes: FaultType[] = [
    'Line-Line Fault',
    'Ground Fault',
    'Open Circuit',
    'Partial Shading',
    'Degradation',
    'Arc Fault',
  ];
  
  const severities: ('Low' | 'Medium' | 'High' | 'Critical')[] = ['Low', 'Medium', 'High', 'Critical'];
  
  const records: HistoryRecord[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const timestamp = new Date(now.getTime() - i * 3600000 * Math.random() * 48);
    const faultType = faultTypes[Math.floor(Math.random() * faultTypes.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    
    records.push({
      id: `fault-${i.toString().padStart(4, '0')}`,
      timestamp: timestamp.toISOString(),
      faultType,
      severity,
      confidence: Math.round((0.7 + Math.random() * 0.29) * 100) / 100,
      duration: `${Math.floor(Math.random() * 60) + 1}m`,
    });
  }
  
  return records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export const modelMetrics: ModelMetrics = {
  accuracy: 0.9423,
  precision: 0.9312,
  recall: 0.9187,
  f1Score: 0.9249,
};

export const modelInfo = {
  name: 'LSTM-based Fault Classifier',
  version: '2.1.0',
  inputFeatures: ['Voltage (V)', 'Current (A)', 'Power (W)', 'Irradiance (W/m²)', 'Temperature (°C)'],
  outputClasses: ['Normal', 'Line-Line Fault', 'Ground Fault', 'Open Circuit', 'Partial Shading', 'Degradation', 'Arc Fault'],
  architecture: 'LSTM (2 layers, 64 units) → Dense (32) → Softmax',
  trainingDataset: 'PV System Fault Dataset v3.2 (45,000 samples)',
  framework: 'TensorFlow 2.15',
  lastTrained: '2025-01-08T14:30:00Z',
};
