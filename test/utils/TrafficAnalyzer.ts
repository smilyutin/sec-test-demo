import { Page } from '@playwright/test';

export interface TrafficMetrics {
  baselineRate: number;
  burstRate: number;
  rateIncreasePercent: number;
  suddenTrafficSpike: boolean;
  abnormalDistribution: boolean;
  totalBurstRequests: number;
  burstDuration: number;
  missingSessionPatterns: boolean;
}

export interface RequestResult {
  type: string;
  status: number;
  duration: number;
  timestamp: number;
  error?: string;
}

export class TrafficAnalyzer {
  constructor(private page: Page) {}

  async generateTrafficBurst(requestCount: number = 20, delay: number = 25): Promise<{
    results: RequestResult[];
    metrics: TrafficMetrics;
  }> {
    const requestTypes = [
      { name: 'config', fn: () => this.page.request.get('/api/config') },
      { name: 'user', fn: () => this.page.request.get('/api/user/1') },
      { name: 'search', fn: () => this.page.request.get('/api/search?q=test') },
      { name: 'home', fn: () => this.page.request.get('/') }
    ];

    const burstStart = Date.now();
    const burstResults: RequestResult[] = [];

    console.log('Generating artificial traffic spike...');
    
    for (let i = 0; i < requestCount; i++) {
      const requestStart = Date.now();
      const randomRequest = requestTypes[i % requestTypes.length];
      
      try {
        const response = await randomRequest.fn();
        const requestEnd = Date.now();
        
        burstResults.push({
          type: randomRequest.name,
          status: response.status(),
          duration: requestEnd - requestStart,
          timestamp: requestEnd
        });
        
        await this.page.waitForTimeout(delay);
        
      } catch (error) {
        burstResults.push({
          type: 'ERROR',
          status: 0,
          duration: 0,
          timestamp: Date.now(),
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    const burstTime = Date.now() - burstStart;
    const burstRate = requestCount / (burstTime / 1000);

    // Calculate baseline (assuming normal rate is around 1-2 requests per second)
    const baselineRate = 1.5;
    const rateIncrease = (burstRate / baselineRate) * 100;

    const requestTypeDistribution: { [key: string]: number } = {};
    burstResults.forEach(result => {
      requestTypeDistribution[result.type] = (requestTypeDistribution[result.type] || 0) + 1;
    });

    const metrics: TrafficMetrics = {
      baselineRate: Math.round(baselineRate * 100) / 100,
      burstRate: Math.round(burstRate * 100) / 100,
      rateIncreasePercent: Math.round(rateIncrease),
      suddenTrafficSpike: rateIncrease > 300,
      abnormalDistribution: Object.keys(requestTypeDistribution).length < 2,
      totalBurstRequests: requestCount,
      burstDuration: burstTime,
      missingSessionPatterns: true
    };

    return { results: burstResults, metrics };
  }

  analyzePayloadAnomalies(requests: Array<{ size: number; endpoint: string; timestamp: number }>) {
    const sizes = requests.map(r => r.size);
    const avgSize = sizes.reduce((sum, size) => sum + size, 0) / sizes.length;
    const maxSize = Math.max(...sizes);
    const minSize = Math.min(...sizes);
    
    // Simple statistical analysis
    const variance = sizes.reduce((sum, size) => sum + Math.pow(size - avgSize, 2), 0) / sizes.length;
    const stdDev = Math.sqrt(variance);
    
    const anomalousRequests = requests.filter(r => 
      r.size > avgSize + (2 * stdDev) || r.size < avgSize - (2 * stdDev)
    );

    return {
      averageSize: Math.round(avgSize),
      maxSize,
      minSize,
      standardDeviation: Math.round(stdDev),
      anomalousRequests: anomalousRequests.length,
      sizeSpike: maxSize > avgSize * 3,
      unusualVariation: stdDev > avgSize * 0.5,
      totalRequests: requests.length
    };
  }

  analyzeResponseTimePatterns(results: RequestResult[]) {
    const times = results.map(r => r.duration);
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);
    
    const slowRequests = results.filter(r => r.duration > avgTime * 2);
    const fastRequests = results.filter(r => r.duration < avgTime * 0.5);
    
    return {
      averageResponseTime: Math.round(avgTime),
      maxResponseTime: maxTime,
      minResponseTime: minTime,
      slowRequestCount: slowRequests.length,
      fastRequestCount: fastRequests.length,
      performanceDegradation: maxTime > avgTime * 3,
      inconsistentTiming: (maxTime - minTime) > avgTime * 2
    };
  }
}