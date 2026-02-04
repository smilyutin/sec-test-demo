import { test, expect } from '../fixtures/ml-anomaly-fixtures';

test.describe('Traffic Pattern Analysis - ML Anomaly Detection', () => {
  test('Request Volume Anomalies', async ({ trafficAnalyzer, anomalyAPI }) => {
    console.log('Testing request volume anomalies...');
    
    // Establish baseline traffic pattern
    const baselineEndpoints = ['/api/config', '/api/user/1', '/api/search?q=test'];
    const baseline = await anomalyAPI.measureBaseline(baselineEndpoints);
    console.log(`Baseline rate: ${baseline.metrics.requestRate.toFixed(2)} requests/second`);
    
    // Generate burst of requests
    const burst = await trafficAnalyzer.generateTrafficBurst(20, 25);
    console.log(`Burst rate: ${burst.metrics.burstRate.toFixed(2)} requests/second`);
    console.log(`Rate increase: ${burst.metrics.rateIncreasePercent.toFixed(1)}%`);
    
    // Validate volume anomaly patterns
    expect(burst.metrics.rateIncreasePercent).toBeGreaterThan(200);
    expect(burst.metrics.suddenTrafficSpike).toBe(true);
    expect(burst.results.length).toBe(20);
    
    if (burst.metrics.suddenTrafficSpike) {
      console.log('ANOMALY DETECTED: Sudden traffic volume spike');
    }
    
    console.log('Volume anomaly indicators:', JSON.stringify(burst.metrics, null, 2));
  });

  test('Payload Size Anomalies', async ({ trafficAnalyzer, anomalyAPI }) => {
    console.log('Testing payload size anomalies...');
    
    // Establish baseline payload sizes
    const baselinePayloads = [
      { endpoint: '/api/login', method: 'POST', data: { username: 'user1', password: 'password' } },
      { endpoint: '/api/login', method: 'POST', data: { username: 'admin', password: 'admin123' } },
      { endpoint: '/api/register', method: 'POST', data: { username: 'test', password: 'test', email: 'test@example.com' } }
    ];
    
    const baselineRequests = [];
    for (const payload of baselinePayloads) {
      const result = await anomalyAPI.makeRequest(payload.endpoint, { 
        method: payload.method, 
        data: payload.data 
      });
      baselineRequests.push({
        size: JSON.stringify(payload.data).length,
        endpoint: payload.endpoint,
        timestamp: result.timestamp
      });
    }
    
    const averageBaselineSize = baselineRequests.reduce((sum, r) => sum + r.size, 0) / baselineRequests.length;
    console.log(`Average baseline payload size: ${averageBaselineSize} bytes`);
    
    // Test with various payload sizes
    const testPayloads = [
      { size: JSON.stringify({ username: 'user' + 'A'.repeat(1000), password: 'pass' + 'B'.repeat(500), extraField: 'C'.repeat(2000) }).length, endpoint: '/api/login', timestamp: Date.now() },
      { size: JSON.stringify({ u: 'x', p: 'y' }).length, endpoint: '/api/register', timestamp: Date.now() },
      { size: 1024, endpoint: '/api/login', timestamp: Date.now() } // Binary payload simulation
    ];
    
    const payloadAnalysis = trafficAnalyzer.analyzePayloadAnomalies([...baselineRequests, ...testPayloads]);
    
    console.log(`Large payload deviation: +${(((payloadAnalysis.maxSize - averageBaselineSize) / averageBaselineSize) * 100).toFixed(1)}%`);
    console.log(`Small payload deviation: -${(((averageBaselineSize - payloadAnalysis.minSize) / averageBaselineSize) * 100).toFixed(1)}%`);
    
    // Validate payload anomaly patterns
    expect(payloadAnalysis.maxSize).toBeGreaterThan(averageBaselineSize * 5);
    expect(payloadAnalysis.minSize).toBeLessThan(averageBaselineSize * 0.5);
    expect(payloadAnalysis.sizeSpike).toBe(true);
    
    if (payloadAnalysis.sizeSpike || payloadAnalysis.unusualVariation) {
      console.log('ANOMALY DETECTED: Payload size outside normal distribution');
    }
    
    console.log('Payload size anomaly indicators:', JSON.stringify(payloadAnalysis, null, 2));
  });

  test('Error Pattern Anomalies', async ({ attackPatternDetector }) => {
    const { results, analysis } = await attackPatternDetector.generateErrorPatterns();
    
    console.log(`Generated error rate: ${analysis.generatedErrorRate}%`);
    console.log(`Error generation rate: ${(results.length / (analysis.errorGenerationDuration / 1000)).toFixed(2)} errors/second`);
    
    // Validate error pattern anomalies
    expect(analysis.generatedErrorRate).toBeGreaterThan(analysis.baselineErrorRate);
    expect(Object.keys(analysis.errorTypeDistribution).length).toBeGreaterThan(2);
    
    if (analysis.errorRateIncrease && analysis.errorRateIncrease > 200 && analysis.systematicGeneration) {
      console.log('ANOMALY DETECTED: Systematic error generation pattern');
    }
    
    console.log('Error pattern anomaly indicators:', JSON.stringify(analysis, null, 2));
    console.log('Error type distribution:', analysis.errorTypeDistribution);
    console.log('Total unique error types detected:', Object.keys(analysis.errorTypeDistribution).length);
    
    Object.entries(analysis.errorTypeDistribution).forEach(([type, count]) => {
      console.log(`Error type "${type}": ${count} occurrences`);
    });
  });

  test('Response Time Anomalies', async ({ trafficAnalyzer, anomalyAPI }) => {
    console.log('Testing response time anomalies...');
    
    // Collect baseline response times
    const endpoints = ['/api/config', '/api/user/1', '/api/search?q=test', '/'];
    const baseline = await anomalyAPI.measureBaseline(endpoints, 2);
    
    console.log(`Average baseline response time: ${baseline.metrics.averageResponseTime.toFixed(0)}ms`);
    
    // Test under artificial load
    console.log('Creating artificial load to increase response times...');
    const loadTestRequests = Array(10).fill(0).map((_, i) => ({
      endpoint: `/api/search?q=load_test_${i}`,
      method: 'GET'
    }));
    
    const loadResults = await anomalyAPI.makeMultipleRequests(loadTestRequests, 10);
    
    // Measure response times under load
    const loadBaseline = await anomalyAPI.measureBaseline(endpoints, 1);
    const responseTimeIncrease = ((loadBaseline.metrics.averageResponseTime - baseline.metrics.averageResponseTime) / baseline.metrics.averageResponseTime) * 100;
    
    console.log(`Average response time under load: ${loadBaseline.metrics.averageResponseTime.toFixed(0)}ms`);
    console.log(`Response time increase: ${responseTimeIncrease.toFixed(1)}%`);
    
    // Analyze response time patterns
    const allResults = [...baseline.results, ...loadBaseline.results].map(result => ({
      type: 'request',
      status: 200,
      duration: result.duration,
      timestamp: result.timestamp
    }));
    const responseTimeAnalysis = trafficAnalyzer.analyzeResponseTimePatterns(allResults);
    
    const anomalyIndicators = {
      ...responseTimeAnalysis,
      responseTimeIncrease: Math.round(responseTimeIncrease),
      abnormalSlowResponses: responseTimeAnalysis.performanceDegradation,
      concurrentLoadGenerated: true,
      loadTestDuration: loadResults.reduce((max, r) => Math.max(max, r.timestamp), 0) - loadResults.reduce((min, r) => Math.min(min, r.timestamp), Date.now())
    };
    
    // Validate response time anomalies
    if (responseTimeAnalysis.slowRequestCount > 0) {
      console.log(`ANOMALY DETECTED: ${responseTimeAnalysis.slowRequestCount} slow response time outliers found`);
    }
    
    if (responseTimeAnalysis.performanceDegradation) {
      console.log('ANOMALY DETECTED: Abnormally slow response times detected');
    }
    
    console.log('Response time anomaly indicators:', JSON.stringify(anomalyIndicators, null, 2));
  });

});
