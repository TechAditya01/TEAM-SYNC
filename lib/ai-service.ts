// Stub AI service for non-ML version
export interface AlertAnalysis {
  category: string
  severity: string
  description: string
  confidence: number
  isDuplicate: boolean
  duplicateOf?: string
  locationVerified: boolean
  recommendations: string[]
}

export interface ImageAnalysis {
  isValid: boolean
  description: string
  category: string
  severity: string
  confidence: number
  objects: string[]
  locationVerified: boolean
  location?: {
    lat: number
    lng: number
    address: string
  }
}

export class AIService {
  async analyzeImage(imageUrl: string, metadata?: any): Promise<ImageAnalysis> {
    // Stub implementation - returns default values
    return {
      isValid: true,
      description: 'Image uploaded successfully',
      category: 'other',
      severity: 'medium',
      confidence: 0.5,
      objects: [],
      locationVerified: false
    }
  }

  async analyzeAlertText(title: string, description: string, location?: string): Promise<AlertAnalysis> {
    // Stub implementation - returns default values
    return {
      category: 'other',
      severity: 'medium',
      description: description,
      confidence: 0.5,
      isDuplicate: false,
      recommendations: [],
      locationVerified: false
    }
  }

  async checkForDuplicates(newAlert: any, existingAlerts: any[]): Promise<{ isDuplicate: boolean, duplicateOf?: string }> {
    // Stub implementation - never marks as duplicate
    return { isDuplicate: false }
  }

  async generatePredictiveInsights(alerts: any[]): Promise<any> {
    // Stub implementation - returns empty insights
    return { patterns: [], recommendations: [] }
  }
}

export const aiService = new AIService()
