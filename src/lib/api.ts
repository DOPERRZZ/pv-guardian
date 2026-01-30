import { supabase } from '@/integrations/supabase/client';

export interface PredictionResult {
  faultType: string;
  probability: number;
}

export interface PredictionResponse {
  predictions: PredictionResult[];
  topPrediction: PredictionResult;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  timestamp: string;
}

export interface HistoryRecord {
  id: string;
  timestamp: string;
  fault_type: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  confidence: number;
  duration: string | null;
  dataset_name: string | null;
  features_used: string[] | null;
}

export interface HistoryResponse {
  history: HistoryRecord[];
  total: number;
  limit: number;
  offset: number;
}

export interface SystemStatus {
  id: string;
  status: 'Normal' | 'Fault' | 'Warning';
  current_fault: string;
  confidence: number;
  last_updated: string;
}

// Run ML inference on uploaded data
export async function runPrediction(
  data: Record<string, unknown>[],
  features: string[],
  datasetName?: string
): Promise<PredictionResponse> {
  const { data: response, error } = await supabase.functions.invoke('predict', {
    body: { data, features, datasetName }
  });

  if (error) {
    console.error('Prediction error:', error);
    throw new Error(error.message || 'Failed to run prediction');
  }

  return response;
}

// Fetch fault history
export async function fetchHistory(
  limit: number = 50,
  offset: number = 0
): Promise<HistoryResponse> {
  const { data: response, error } = await supabase.functions.invoke('history', {
    body: {},
    method: 'GET',
  });

  if (error) {
    console.error('History fetch error:', error);
    // Fallback to direct query
    const { data, count, error: queryError } = await supabase
      .from('fault_history')
      .select('*', { count: 'exact' })
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (queryError) throw new Error(queryError.message);
    
    return {
      history: (data || []) as HistoryRecord[],
      total: count || 0,
      limit,
      offset
    };
  }

  return response;
}

// Get current system status
export async function getSystemStatus(): Promise<SystemStatus> {
  const { data, error } = await supabase
    .from('system_status')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('Status fetch error:', error);
    // Return default status
    return {
      id: 'default',
      status: 'Normal',
      current_fault: 'Normal',
      confidence: 0.95,
      last_updated: new Date().toISOString()
    };
  }

  return data as SystemStatus;
}

// Update system status
export async function updateSystemStatus(
  status: 'Normal' | 'Fault' | 'Warning',
  currentFault: string,
  confidence: number
): Promise<SystemStatus> {
  const { data: response, error } = await supabase.functions.invoke('system-status', {
    body: { status, currentFault, confidence }
  });

  if (error) {
    console.error('Status update error:', error);
    throw new Error(error.message || 'Failed to update status');
  }

  return response;
}

// Direct database queries for history (alternative to edge function)
export async function fetchHistoryDirect(
  limit: number = 50,
  offset: number = 0
): Promise<HistoryResponse> {
  const { data, count, error } = await supabase
    .from('fault_history')
    .select('*', { count: 'exact' })
    .order('timestamp', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Direct history fetch error:', error);
    throw new Error(error.message);
  }

  return {
    history: (data || []) as HistoryRecord[],
    total: count || 0,
    limit,
    offset
  };
}
