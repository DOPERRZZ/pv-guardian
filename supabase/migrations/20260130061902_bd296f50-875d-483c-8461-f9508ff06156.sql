-- Fault history table to store all detected faults
CREATE TABLE public.fault_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  fault_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
  confidence NUMERIC(5,4) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  duration TEXT,
  dataset_name TEXT,
  features_used TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Predictions table for storing inference results
CREATE TABLE public.predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  predicted_fault TEXT NOT NULL,
  probabilities JSONB NOT NULL,
  input_features JSONB,
  dataset_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- System status table for current state
CREATE TABLE public.system_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'Normal' CHECK (status IN ('Normal', 'Fault', 'Warning')),
  current_fault TEXT NOT NULL DEFAULT 'Normal',
  confidence NUMERIC(5,4) NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default system status
INSERT INTO public.system_status (status, current_fault, confidence)
VALUES ('Normal', 'Normal', 0.95);

-- Enable RLS but allow public read for this demo
ALTER TABLE public.fault_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_status ENABLE ROW LEVEL SECURITY;

-- Public read policies for demo
CREATE POLICY "Allow public read on fault_history" 
ON public.fault_history FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert on fault_history" 
ON public.fault_history FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public read on predictions" 
ON public.predictions FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert on predictions" 
ON public.predictions FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public read on system_status" 
ON public.system_status FOR SELECT 
USING (true);

CREATE POLICY "Allow public update on system_status" 
ON public.system_status FOR UPDATE 
USING (true);

-- Create index for faster queries
CREATE INDEX idx_fault_history_timestamp ON public.fault_history(timestamp DESC);
CREATE INDEX idx_predictions_timestamp ON public.predictions(timestamp DESC);