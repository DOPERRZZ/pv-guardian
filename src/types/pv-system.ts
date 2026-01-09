export type FaultType = 
  | 'Normal'
  | 'Line-Line Fault'
  | 'Ground Fault'
  | 'Open Circuit'
  | 'Partial Shading'
  | 'Degradation'
  | 'Arc Fault';

export type SystemStatus = 'Normal' | 'Fault' | 'Warning';

export interface PVDataPoint {
  timestamp: string;
  voltage: number;
  current: number;
  power: number;
  irradiance?: number;
  temperature?: number;
  isFault?: boolean;
}

export interface FaultPrediction {
  faultType: FaultType;
  confidence: number;
  timestamp: string;
}

export interface HistoryRecord {
  id: string;
  timestamp: string;
  faultType: FaultType;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  confidence: number;
  duration?: string;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}

export interface SystemState {
  status: SystemStatus;
  currentFault: FaultType;
  confidence: number;
  lastUpdated: string;
}
