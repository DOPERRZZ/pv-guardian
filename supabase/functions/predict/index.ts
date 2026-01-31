import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

// Input validation constants
const MAX_ROWS = 1000
const MAX_DATASET_NAME_LENGTH = 255
const ALLOWED_FEATURES = ['Voltage', 'Current', 'Power', 'Irradiance', 'Temperature', 'voltage', 'current', 'power', 'irradiance', 'temperature']

// Fault types for classification
const FAULT_TYPES = [
  'Normal',
  'Line-Line Fault',
  'Ground Fault',
  'Open Circuit',
  'Partial Shading',
  'Degradation',
  'Arc Fault',
]

// Simple ML inference simulation (in production, this would call a TensorFlow model)
function runInference(data: Record<string, number>[], features: string[]): { faultType: string; probability: number }[] {
  console.log(`Running inference on ${data.length} rows with features: ${features.join(', ')}`)
  
  // Analyze data patterns for fault detection
  let faultScore = 0
  let faultType = 'Normal'
  
  // Check for voltage anomalies (Line-Line Fault indicator)
  const voltages = data.map(row => row.Voltage || row.voltage || 0).filter(v => v > 0)
  if (voltages.length > 0) {
    const avgVoltage = voltages.reduce((a, b) => a + b, 0) / voltages.length
    const voltageVariance = voltages.reduce((a, b) => a + Math.pow(b - avgVoltage, 2), 0) / voltages.length
    
    // High variance indicates potential fault
    if (voltageVariance > 50) {
      faultScore += 0.3
      faultType = 'Line-Line Fault'
    }
    
    // Low voltage indicates potential fault
    if (avgVoltage < 35) {
      faultScore += 0.4
      faultType = 'Line-Line Fault'
    }
  }
  
  // Check for current anomalies (Ground Fault indicator)
  const currents = data.map(row => row.Current || row.current || 0).filter(c => c > 0)
  if (currents.length > 0) {
    const avgCurrent = currents.reduce((a, b) => a + b, 0) / currents.length
    if (avgCurrent > 7) {
      faultScore += 0.2
      if (faultType === 'Normal') faultType = 'Ground Fault'
    }
  }
  
  // Check for power drops (Open Circuit indicator)
  const powers = data.map(row => row.Power || row.power || 0)
  if (powers.length > 1) {
    const powerDrops = powers.slice(1).filter((p, i) => p < powers[i] * 0.5).length
    if (powerDrops > powers.length * 0.2) {
      faultScore += 0.25
      if (faultType === 'Normal') faultType = 'Open Circuit'
    }
  }
  
  // Generate probability distribution
  const baseProbability = Math.min(0.95, 0.5 + faultScore)
  const probabilities: { faultType: string; probability: number }[] = []
  
  let remainingProb = 1 - baseProbability
  
  for (const type of FAULT_TYPES) {
    if (type === faultType) {
      probabilities.push({ faultType: type, probability: baseProbability })
    } else {
      const prob = remainingProb / (FAULT_TYPES.length - 1) * (0.5 + Math.random() * 0.5)
      probabilities.push({ faultType: type, probability: Math.max(0.001, prob) })
    }
  }
  
  // Normalize probabilities
  const total = probabilities.reduce((a, b) => a + b.probability, 0)
  return probabilities.map(p => ({
    faultType: p.faultType,
    probability: Math.round((p.probability / total) * 10000) / 10000
  })).sort((a, b) => b.probability - a.probability)
}

// Determine severity based on confidence
function getSeverity(confidence: number): 'Low' | 'Medium' | 'High' | 'Critical' {
  if (confidence >= 0.9) return 'Critical'
  if (confidence >= 0.75) return 'High'
  if (confidence >= 0.5) return 'Medium'
  return 'Low'
}

// Validate input data structure
function validateInput(body: unknown): { valid: boolean; error?: string; data?: Record<string, number>[]; features?: string[]; datasetName?: string } {
  if (typeof body !== 'object' || body === null) {
    return { valid: false, error: 'Request body must be an object' }
  }

  const { data, features, datasetName } = body as { data?: unknown; features?: unknown; datasetName?: unknown }

  // Validate data array
  if (!data || !Array.isArray(data)) {
    return { valid: false, error: 'Data must be an array' }
  }

  if (data.length === 0) {
    return { valid: false, error: 'Data array cannot be empty' }
  }

  if (data.length > MAX_ROWS) {
    return { valid: false, error: `Data must contain at most ${MAX_ROWS} rows` }
  }

  // Validate each row is an object with numeric values
  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    if (typeof row !== 'object' || row === null || Array.isArray(row)) {
      return { valid: false, error: `Row ${i + 1} must be an object` }
    }
  }

  // Validate features array if provided
  let validatedFeatures = ['Voltage', 'Current', 'Power']
  if (features !== undefined) {
    if (!Array.isArray(features)) {
      return { valid: false, error: 'Features must be an array' }
    }
    
    if (features.length === 0) {
      return { valid: false, error: 'Features array cannot be empty' }
    }

    for (const feature of features) {
      if (typeof feature !== 'string') {
        return { valid: false, error: 'Each feature must be a string' }
      }
      if (!ALLOWED_FEATURES.includes(feature)) {
        return { valid: false, error: `Invalid feature: ${feature}. Allowed: ${ALLOWED_FEATURES.join(', ')}` }
      }
    }
    validatedFeatures = features as string[]
  }

  // Validate dataset name
  let validatedDatasetName = 'uploaded_data.xlsx'
  if (datasetName !== undefined) {
    if (typeof datasetName !== 'string') {
      return { valid: false, error: 'Dataset name must be a string' }
    }
    if (datasetName.length > MAX_DATASET_NAME_LENGTH) {
      return { valid: false, error: `Dataset name must be at most ${MAX_DATASET_NAME_LENGTH} characters` }
    }
    // Sanitize dataset name - remove any potentially dangerous characters
    validatedDatasetName = datasetName.replace(/[<>:"/\\|?*]/g, '_').trim() || 'uploaded_data.xlsx'
  }

  return { 
    valid: true, 
    data: data as Record<string, number>[], 
    features: validatedFeatures,
    datasetName: validatedDatasetName
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('Unauthorized request: No valid Authorization header')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create client with user's token for auth verification
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token)
    
    if (claimsError || !claimsData?.claims) {
      console.log('Unauthorized request: Invalid token')
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = claimsData.claims.sub
    console.log(`Authenticated request from user: ${userId}`)

    // Create service role client for database operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Parse and validate input
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const validation = validateInput(body)
    if (!validation.valid) {
      console.log(`Validation error: ${validation.error}`)
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data, features, datasetName } = validation

    console.log(`Received prediction request: ${data!.length} rows, features: ${features!.join(', ')}`)

    // Run ML inference
    const predictions = runInference(data!, features!)
    const topPrediction = predictions[0]
    
    console.log(`Top prediction: ${topPrediction.faultType} (${topPrediction.probability})`)

    // Save prediction to database
    const { error: predictionError } = await supabase
      .from('predictions')
      .insert({
        predicted_fault: topPrediction.faultType,
        probabilities: predictions,
        input_features: { features, rowCount: data!.length },
        dataset_name: datasetName
      })

    if (predictionError) {
      console.error('Error saving prediction:', predictionError)
    }

    // If fault detected, save to history
    if (topPrediction.faultType !== 'Normal' && topPrediction.probability > 0.5) {
      const severity = getSeverity(topPrediction.probability)
      
      const { error: historyError } = await supabase
        .from('fault_history')
        .insert({
          fault_type: topPrediction.faultType,
          severity,
          confidence: topPrediction.probability,
          dataset_name: datasetName,
          features_used: features
        })

      if (historyError) {
        console.error('Error saving to history:', historyError)
      }

      // Update system status
      const { error: statusError } = await supabase
        .from('system_status')
        .update({
          status: 'Fault',
          current_fault: topPrediction.faultType,
          confidence: topPrediction.probability,
          last_updated: new Date().toISOString()
        })
        .eq('id', (await supabase.from('system_status').select('id').limit(1).single()).data?.id)

      if (statusError) {
        console.error('Error updating status:', statusError)
      }
    }

    return new Response(
      JSON.stringify({
        predictions,
        topPrediction,
        severity: getSeverity(topPrediction.probability),
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Prediction error:', error)
    return new Response(
      JSON.stringify({ error: 'An error occurred processing your request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
