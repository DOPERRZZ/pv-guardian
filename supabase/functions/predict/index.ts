import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data, features, datasetName } = await req.json()
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Received prediction request: ${data.length} rows, features: ${features?.join(', ')}`)

    // Run ML inference
    const predictions = runInference(data, features || ['Voltage', 'Current', 'Power'])
    const topPrediction = predictions[0]
    
    console.log(`Top prediction: ${topPrediction.faultType} (${topPrediction.probability})`)

    // Save prediction to database
    const { error: predictionError } = await supabase
      .from('predictions')
      .insert({
        predicted_fault: topPrediction.faultType,
        probabilities: predictions,
        input_features: { features, rowCount: data.length },
        dataset_name: datasetName || 'uploaded_data.xlsx'
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
          dataset_name: datasetName || 'uploaded_data.xlsx',
          features_used: features || ['Voltage', 'Current', 'Power']
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
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
