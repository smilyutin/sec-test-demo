import type { APIRequestContext } from '@playwright/test';
import { sleep } from './sleep';

export interface BehaviorAnomalyIndicators {
  directApiAccess: boolean;
  skippedAuthFlow: boolean;
  missingReferrerHeaders: boolean;
  bypassedUIInteraction: boolean;
  nonStandardNavigation: boolean;
  timestamp: number;
}

export interface AutomatedToolSignature {
  rapidSequentialRequests: boolean;
  systematicEnumeration: boolean;
  noHumanDelay: boolean;
  missingBrowserHeaders: boolean;
  directoryTraversal: boolean;
  requestRate: number;
  totalRequests: number;
  duration: number;
}

export class BehaviorAnalyzer {
  constructor(private request: APIRequestContext) {}

  async detectUnusualNavigation(): Promise<BehaviorAnomalyIndicators> {
    console.log('Testing unusual navigation patterns...');
    
    // Access sensitive endpoints directly without normal user flow
    const configResponse = await this.request.get('/api/config');
    console.log('Direct API access to /api/config without UI interaction');
    
    const headers = configResponse.headers();
    console.log('Request headers for direct API access:', Object.keys(headers));
    
    // Skip normal authentication flow and access user data directly
    const userResponse = await this.request.get('/api/user/1');
    console.log('Direct access to user endpoint bypassing authentication UI');
    
    return {
      directApiAccess: true,
      skippedAuthFlow: true,
      missingReferrerHeaders: !headers.referer,
      bypassedUIInteraction: true,
      nonStandardNavigation: true,
      timestamp: Date.now()
    };
  }

  async simulateAutomatedScanner(endpoints: string[]): Promise<{
    results: Array<{
      endpoint: string;
      status: number | string;
      duration: number;
      timestamp: number;
      error?: string;
    }>;
    signature: AutomatedToolSignature;
  }> {
    console.log('Simulating automated scanner behavior...');
    
    const startTime = Date.now();
    const requestResults = [];
    
    // Simulate systematic directory enumeration
    for (const endpoint of endpoints) {
      const requestStart = Date.now();
      
      try {
        const response = await this.request.get(endpoint);
        const requestEnd = Date.now();
        
        requestResults.push({
          endpoint,
          status: response.status(),
          duration: requestEnd - requestStart,
          timestamp: requestEnd
        });
        
        // Minimal delay - typical of automated tools
        await sleep(10);
        
      } catch (error) {
        requestResults.push({
          endpoint,
          status: 'ERROR',
          duration: 0,
          timestamp: Date.now(),
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    const totalDuration = Date.now() - startTime;
    const requestRate = endpoints.length / (totalDuration / 1000);
    
    const signature: AutomatedToolSignature = {
      rapidSequentialRequests: requestRate > 5,
      systematicEnumeration: endpoints.length > 5,
      noHumanDelay: totalDuration < endpoints.length * 100,
      missingBrowserHeaders: true,
      directoryTraversal: endpoints.some(e => e.includes('../') || e.includes('..\\\\') || e.includes('..')),
      requestRate: Math.round(requestRate * 100) / 100,
      totalRequests: endpoints.length,
      duration: totalDuration
    };
    
    return { results: requestResults, signature };
  }

  async detectSessionAnomalies(): Promise<{
    simultaneousSessions: boolean;
    sessionTokenReplacement: boolean;
    crossOriginRequests: boolean;
    missingSessionContext: boolean;
    abnormalSessionDuration: boolean;
  }> {
    // Simulate simultaneous session access
    const sessionPromises = [
      this.request.get('/api/user/1'),
      this.request.get('/api/user/1'),
      this.request.get('/api/user/1')
    ];
    
    const responses = await Promise.all(sessionPromises);
    const allSuccessful = responses.every(r => r.status() === 200);
    
    // Check for missing session context
    const contextResponse = await this.request.get('/api/user/1');
    const hasSessionHeaders = Object.keys(contextResponse.headers()).some(h => 
      h.toLowerCase().includes('session') || h.toLowerCase().includes('auth')
    );
    
    return {
      simultaneousSessions: allSuccessful,
      sessionTokenReplacement: false,
      crossOriginRequests: true,
      missingSessionContext: !hasSessionHeaders,
      abnormalSessionDuration: true
    };
  }

  analyzeBehaviorPatterns(navigationData: any[], interactionData: any[]) {
    const navigationSpeed = navigationData.length / (navigationData[navigationData.length - 1]?.timestamp - navigationData[0]?.timestamp || 1);
    const interactionGaps = this.calculateInteractionGaps(interactionData);
    
    return {
      abnormalSpeed: navigationSpeed > 10, // More than 10 actions per second
      missingHumanPatterns: interactionGaps.every(gap => gap < 100), // All gaps under 100ms
      systematicBehavior: this.detectSystematicPatterns(navigationData),
      consistentTiming: this.detectConsistentTiming(interactionData)
    };
  }

  private calculateInteractionGaps(interactions: any[]): number[] {
    const gaps = [];
    for (let i = 1; i < interactions.length; i++) {
      gaps.push(interactions[i].timestamp - interactions[i-1].timestamp);
    }
    return gaps;
  }

  private detectSystematicPatterns(data: any[]): boolean {
    // Simple heuristic: check if actions follow a predictable pattern
    if (data.length < 3) return false;
    
    const intervals = [];
    for (let i = 1; i < data.length; i++) {
      intervals.push(data[i].timestamp - data[i-1].timestamp);
    }
    
    // Check if intervals are very consistent (less than 10% variation)
    const avgInterval = intervals.reduce((sum, int) => sum + int, 0) / intervals.length;
    const variations = intervals.map(int => Math.abs(int - avgInterval) / avgInterval);
    
    return variations.every(variation => variation < 0.1);
  }

  private detectConsistentTiming(data: any[]): boolean {
    if (data.length < 2) return false;
    
    const intervals = this.calculateInteractionGaps(data);
    const uniqueIntervals = new Set(intervals);
    
    // If there are very few unique intervals, it suggests automated timing
    return uniqueIntervals.size < intervals.length * 0.3;
  }
}