import type { APIRequestContext } from '@playwright/test';
import { sleep } from '../utils/sleep';

export class AnomalyDetectionAPI {
  constructor(private request: APIRequestContext) {}

  async makeRequest(endpoint: string, options?: { method?: string; data?: any; headers?: Record<string, string> }) {
    const { method = 'GET', data, headers } = options || {};
    
    const requestStart = Date.now();
    try {
      const response = method === 'POST' 
        ? await this.request.post(endpoint, { data, headers })
        : method === 'PUT'
        ? await this.request.put(endpoint, { data, headers })
        : method === 'DELETE'
        ? await this.request.delete(endpoint, { headers })
        : await this.request.get(endpoint, { headers });
      
      const requestEnd = Date.now();
      
      return {
        status: response.status(),
        headers: response.headers(),
        duration: requestEnd - requestStart,
        timestamp: requestEnd,
        response
      };
    } catch (error) {
      return {
        status: 0,
        headers: {},
        duration: Date.now() - requestStart,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  async makeMultipleRequests(endpoints: Array<{ endpoint: string; method?: string; data?: any }>, delay: number = 25) {
    const results = [];
    
    for (const { endpoint, method, data } of endpoints) {
      const result = await this.makeRequest(endpoint, { method, data });
      results.push({
        endpoint,
        method: method || 'GET',
        ...result
      });
      
      if (delay > 0) {
        await sleep(delay);
      }
    }
    
    return results;
  }

  async measureBaseline(endpoints: string[], iterations: number = 3) {
    const results = [];
    const startTime = Date.now();
    
    for (let i = 0; i < iterations; i++) {
      for (const endpoint of endpoints) {
        const result = await this.makeRequest(endpoint);
        results.push({
          endpoint,
          iteration: i,
          ...result
        });
      }
      await sleep(1000); // Normal human delay
    }
    
    const totalTime = Date.now() - startTime;
    const totalRequests = results.length;
    const baselineRate = totalRequests / (totalTime / 1000);
    const avgResponseTime = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    const successRate = results.filter(r => r.status >= 200 && r.status < 400).length / results.length;
    
    return {
      results,
      metrics: {
        totalRequests,
        duration: totalTime,
        requestRate: baselineRate,
        averageResponseTime: avgResponseTime,
        successRate,
        errorRate: 1 - successRate
      }
    };
  }
}