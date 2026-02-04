import type { APIRequestContext } from '@playwright/test';
import { sleep } from './sleep';

export interface ErrorPatternAnalysis {
  baselineErrorRate: number;
  generatedErrorRate: number;
  errorRateIncrease: number | null;
  systematicGeneration: boolean;
  errorTypeDistribution: { [key: string]: number };
  maxErrorsInOneSecond: number;
  totalErrors: number;
  errorGenerationDuration: number;
}

export interface ErrorResult {
  status: number;
  isError: boolean;
  errorCategory: string;
  timestamp: number;
  error?: string;
}

export class AttackPatternDetector {
  constructor(private request: APIRequestContext) {}

  async generateErrorPatterns(): Promise<{
    results: ErrorResult[];
    analysis: ErrorPatternAnalysis;
  }> {
    console.log('Testing error pattern anomalies...');
    
    // Establish baseline error rate with normal usage
    const baselineResults = await this.establishBaseline();
    const baselineErrorRate = baselineResults.filter(r => r.isError).length / baselineResults.length;
    
    console.log(`Baseline error rate: ${(baselineErrorRate * 100).toFixed(1)}%`);
    
    // Generate systematic errors
    const errorResults = await this.generateSystematicErrors();
    
    const totalTime = errorResults.reduce((max, result) => 
      Math.max(max, result.timestamp), 0) - 
      errorResults.reduce((min, result) => 
        Math.min(min, result.timestamp), Date.now());
    
    const errorRate = errorResults.filter(r => r.isError).length / errorResults.length;
    
    // Analyze error clustering
    const errorClusters = this.analyzeErrorClustering(errorResults);
    const maxErrorsInWindow = Math.max(...Object.values(errorClusters).map(cluster => cluster.length));
    
    const errorTypes: { [key: string]: number } = {};
    errorResults.forEach(result => {
      if (result.isError) {
        errorTypes[result.errorCategory] = (errorTypes[result.errorCategory] || 0) + 1;
      }
    });
    
    const analysis: ErrorPatternAnalysis = {
      baselineErrorRate: Math.round(baselineErrorRate * 100),
      generatedErrorRate: Math.round(errorRate * 100),
      errorRateIncrease: baselineErrorRate > 0 ? Math.round(((errorRate - baselineErrorRate) / baselineErrorRate) * 100) : null,
      systematicGeneration: true,
      errorTypeDistribution: errorTypes,
      maxErrorsInOneSecond: maxErrorsInWindow,
      totalErrors: errorResults.filter(r => r.isError).length,
      errorGenerationDuration: totalTime
    };
    
    return { results: errorResults, analysis };
  }

  private async establishBaseline(): Promise<ErrorResult[]> {
    const normalRequests = [
      () => this.request.get('/api/user/1'),
      () => this.request.post('/api/login', { data: { username: 'user1', password: 'password' } }),
      () => this.request.get('/api/search?q=laptop')
    ];
    
    const results: ErrorResult[] = [];
    
    for (const request of normalRequests) {
      try {
        const response = await request();
        results.push({
          status: response.status(),
          isError: response.status() >= 400,
          errorCategory: response.status() >= 400 ? this.categorizeError(response.status()) : 'SUCCESS',
          timestamp: Date.now()
        });
      } catch (error) {
        results.push({
          status: 0,
          isError: true,
          errorCategory: 'NETWORK_ERROR',
          timestamp: Date.now(),
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    return results;
  }

  private async generateSystematicErrors(): Promise<ErrorResult[]> {
    const errorGeneratingRequests = [
      // 404 errors
      () => this.request.get('/api/nonexistent'),
      () => this.request.get('/api/user/999999'),
      () => this.request.get('/admin/secret'),
      () => this.request.get('/api/invalid/endpoint'),
      
      // 401 errors  
      () => this.request.get('/api/admin'),
      () => this.request.post('/api/login', { data: { username: 'invalid', password: 'wrong' } }),
      () => this.request.get('/api/protected/resource'),
      
      // 400 errors
      () => this.request.post('/api/login', { data: { malformed: 'json' } }),
      () => this.request.post('/api/register', { data: {} }),
      () => this.request.post('/api/user', { data: { invalid: 'data' } }),
      
      // 422 errors (validation errors)
      () => this.request.post('/api/register', { data: { email: 'invalid-email' } }),
      () => this.request.put('/api/user/1', { data: { age: 'not-a-number' } }),
      
      // 405 Method Not Allowed errors
      () => this.request.put('/api/login', { data: {} }),
      () => this.request.delete('/api/search'),
      
      // 403 Forbidden errors
      () => this.request.get('/api/admin/users'),
      () => this.request.delete('/api/admin/config'),
      
      // 500 errors (potential)
      () => this.request.get('/api/user/null'),
      () => this.request.post('/api/login', { data: { username: null, password: undefined } }),
      () => this.request.get('/api/search?q=' + 'x'.repeat(10000)),
      
      // Network errors
      () => this.request.get('http://invalid-domain-that-does-not-exist.com/api'),
      () => this.request.get('http://localhost:99999/api')
    ];
    
    const errorResults: ErrorResult[] = [];
    
    console.log('Systematically generating errors...');
    for (const request of errorGeneratingRequests) {
      try {
        const response = await request();
        const status = response.status();
        
        errorResults.push({
          status,
          isError: status >= 400,
          errorCategory: this.categorizeError(status),
          timestamp: Date.now()
        });
        
      } catch (error) {
        errorResults.push({
          status: 0,
          isError: true,
          errorCategory: 'NETWORK_ERROR',
          timestamp: Date.now(),
          error: error instanceof Error ? error.message : String(error)
        });
      }
      
      await sleep(50);
    }
    
    return errorResults;
  }

  private categorizeError(status: number): string {
    if (status === 400) return 'BAD_REQUEST';
    if (status === 401) return 'UNAUTHORIZED';
    if (status === 403) return 'FORBIDDEN';
    if (status === 404) return 'NOT_FOUND';
    if (status === 405) return 'METHOD_NOT_ALLOWED';
    if (status === 422) return 'VALIDATION_ERROR';
    if (status >= 500) return 'SERVER_ERROR';
    if (status >= 400) return 'CLIENT_ERROR';
    return 'SUCCESS';
  }

  private analyzeErrorClustering(results: ErrorResult[]): { [key: number]: ErrorResult[] } {
    const errorClusters: { [key: number]: ErrorResult[] } = {};
    
    results.forEach(result => {
      const timeWindow = Math.floor(result.timestamp / 1000) * 1000; // 1-second windows
      if (!errorClusters[timeWindow]) {
        errorClusters[timeWindow] = [];
      }
      errorClusters[timeWindow].push(result);
    });
    
    return errorClusters;
  }

  async detectSQLInjectionPatterns(): Promise<{
    attemptedPayloads: string[];
    successfulInjections: number;
    errorBasedAttempts: number;
    timeBasedAttempts: number;
  }> {
    const sqlPayloads = [
      "' OR '1'='1",
      "' OR 1=1--",
      "admin'--",
      "' UNION SELECT * FROM users--",
      "' AND (SELECT COUNT(*) FROM users)>0--",
      "'; DROP TABLE users; --",
      "' OR pg_sleep(5)--"
    ];
    
    let successfulInjections = 0;
    let errorBasedAttempts = 0;
    let timeBasedAttempts = 0;
    
    for (const payload of sqlPayloads) {
      try {
        const startTime = Date.now();
        const response = await this.request.post('/api/login', {
          data: { username: payload, password: 'test' }
        });
        const endTime = Date.now();
        
        // Check for SQL injection success indicators
        if (response.status() === 200) {
          successfulInjections++;
        }
        
        // Time-based detection
        if (endTime - startTime > 4000) {
          timeBasedAttempts++;
        }
        
        // Error-based detection
        const responseText = await response.text();
        if (responseText.includes('SQL') || responseText.includes('syntax') || responseText.includes('database')) {
          errorBasedAttempts++;
        }
        
      } catch (error) {
        // Network errors might indicate successful injection causing crashes
        if (error instanceof Error && error.message.includes('timeout')) {
          timeBasedAttempts++;
        }
      }
      
      await sleep(100);
    }
    
    return {
      attemptedPayloads: sqlPayloads,
      successfulInjections,
      errorBasedAttempts,
      timeBasedAttempts
    };
  }

  async detectXSSPatterns(): Promise<{
    attemptedPayloads: string[];
    reflectedXSS: number;
    storedXSS: number;
    domBasedXSS: number;
  }> {
    const xssPayloads = [
      "<script>alert('XSS')</script>",
      "<img src=x onerror=alert('XSS')>",
      "javascript:alert('XSS')",
      "<svg onload=alert('XSS')>",
      "';alert('XSS');//"
    ];
    
    let reflectedXSS = 0;
    let storedXSS = 0;
    let domBasedXSS = 0;
    
    for (const payload of xssPayloads) {
      try {
        // Test reflected XSS via search
        const searchResponse = await this.request.get(`/api/search?q=${encodeURIComponent(payload)}`);
        const searchText = await searchResponse.text();
        
        if (searchText.includes(payload) && !searchText.includes('&lt;')) {
          reflectedXSS++;
        }
        
        // Test stored XSS via comment submission
        try {
          const commentResponse = await this.request.post('/api/comment', {
            data: { comment: payload, productId: 1 }
          });
          
          if (commentResponse.status() === 200) {
            // Check if payload was stored
            const getComments = await this.request.get('/api/comments/1');
            const commentsText = await getComments.text();
            
            if (commentsText.includes(payload)) {
              storedXSS++;
            }
          }
        } catch (error) {
          // Ignore comment endpoint errors
        }
        
      } catch (error) {
        // Ignore search endpoint errors
      }
      
      await sleep(100);
    }
    
    return {
      attemptedPayloads: xssPayloads,
      reflectedXSS,
      storedXSS,
      domBasedXSS
    };
  }
}