export interface AIAssessmentResult {
  category: 'MEDICAL' | 'RESCUE' | 'WATER' | 'FOOD' | 'SHELTER' | 'EVACUATION' | 'SUPPLIES' | 'SECURITY' | 'OTHER';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  ai_notes: string;
}

/**
 * MOCK AI SERVICE
 * In a real application, this would pass the image buffer to Google Cloud Vision API
 * or OpenAI Vision to detect smoke, fire, structural collapse, injuries, etc.
 * 
 * For this demonstration, we use a simple heuristic:
 * - If the file size is very small, we assume it's a minor incident.
 * - Otherwise, we randomize some realistic outputs for the demonstration.
 */
export async function analyzeEmergencyImage(imageBuffer: Buffer, originalname: string): Promise<AIAssessmentResult> {
  // Simulate network delay for inference
  await new Promise(resolve => setTimeout(resolve, 2000));

  const size = imageBuffer.length;
  
  // Example heuristic: very small images might be "LOW" severity
  if (size < 5000) {
    return {
      category: 'OTHER',
      urgency: 'LOW',
      confidence: 0.88,
      ai_notes: 'Image resolution is low or file is very small. Cannot determine severe damage. Defaulting to LOW urgency.'
    };
  }

  // Random mock assessment for demo purposes
  const assessments: AIAssessmentResult[] = [
    {
      category: 'RESCUE',
      urgency: 'CRITICAL',
      confidence: 0.96,
      ai_notes: 'AI Vision detected large plumes of black smoke and visible flames engulfing a structure. High probability of trapped individuals requiring immediate RESCUE.'
    },
    {
      category: 'RESCUE',
      urgency: 'HIGH',
      confidence: 0.91,
      ai_notes: 'Detected severe structural damage and debris scattered across the area. Potential for further collapse requiring RESCUE teams.'
    },
    {
      category: 'MEDICAL',
      urgency: 'MEDIUM',
      confidence: 0.82,
      ai_notes: 'Detected individuals lying on the ground. Medical attention may be required, but no immediate life-threatening hemorrhage visible in frame.'
    }
  ];

  // Pick one randomly based on the file name's length to make it deterministic-ish for the same file
  const index = originalname.length % assessments.length;
  return assessments[index];
}
