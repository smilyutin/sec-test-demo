# ML-Based Anomaly Detection Tests

This directory contains comprehensive test suites for validating Machine Learning-based anomaly detection systems in web security contexts.

## Overview

These tests are designed to:
1. **Establish behavioral baselines** for normal user interactions
2. **Generate and detect attack patterns** that ML systems should identify as anomalous
3. **Validate ML model performance** in real-time security monitoring scenarios
4. **Measure detection accuracy** and system performance metrics

## Test Structure

### **Baseline Behavior Patterns** (`baseline-behavior.spec.ts`)
- Normal user authentication flows
- Standard search behaviors
- Regular data access patterns
- Establishes behavioral baselines for ML training

**Key Metrics Collected:**
- Response times (baseline: 1-3 seconds)
- Request patterns (single POST/GET requests)
- User agent strings (standard browser signatures)
- Payload sizes (normal distribution)

### **Attack Pattern Detection** (`attack-patterns.spec.ts`)
- SQL injection attack signatures
- XSS payload patterns  
- Rapid user enumeration attacks
- Brute force attempt patterns

**Anomaly Indicators Tracked:**
- SQL metacharacters and keywords
- HTML/JavaScript injection attempts
- Request frequency (>5 requests/second = suspicious)
- Authentication bypass patterns

### **Behavioral Anomaly Detection** (`behavioral-anomalies.spec.ts`)
- Unusual navigation patterns
- Automated tool detection
- Session anomaly identification
- Cross-origin request anomalies

**Detection Patterns:**
- Direct API access bypassing UI
- Systematic endpoint enumeration
- Rapid session switching
- Missing standard browser headers

### **Traffic Pattern Analysis** (`traffic-patterns.spec.ts`)
- Request volume anomalies
- Payload size deviations
- Error pattern clustering
- Response time anomalies

**Traffic Metrics:**
- Request rate analysis (baseline vs. spike detection)
- Payload size distribution analysis
- Error clustering detection
- Response time outlier identification

### **ML Model Validation** (`ml-validation.spec.ts`)
- Feature extraction accuracy
- Anomaly score calibration
- Real-time detection performance
- False positive/negative rate measurement

**Performance Requirements:**
- Detection latency: <100ms per request
- Throughput: 1000+ requests/minute
- Accuracy: >95% detection rate
- False positive rate: <5%

## Running the Tests

### Prerequisites
```bash
npm install
npx playwright install
```

### Individual Test Suites
```bash
# Run baseline behavior analysis
npx playwright test test/ml-anomaly/baseline-behavior.spec.ts --project=ml-anomaly

# Run attack pattern detection
npx playwright test test/ml-anomaly/attack-patterns.spec.ts --project=ml-anomaly

# Run behavioral anomaly detection  
npx playwright test test/ml-anomaly/behavioral-anomalies.spec.ts --project=ml-anomaly

# Run traffic pattern analysis
npx playwright test test/ml-anomaly/traffic-patterns.spec.ts --project=ml-anomaly

# Run ML model validation
npx playwright test test/ml-anomaly/ml-validation.spec.ts --project=ml-anomaly
```

### All ML Anomaly Detection Tests
```bash
# Run complete ML anomaly detection suite
npm run test:ml-anomaly

# Run with detailed output and debugging
npx playwright test test/ml-anomaly --project=ml-anomaly --reporter=line
```

### Advanced Usage
```bash
# Run with UI mode for debugging
npx playwright test test/ml-anomaly --project=ml-anomaly --ui

# Generate detailed HTML report
npx playwright test test/ml-anomaly --project=ml-anomaly --reporter=html

# Run specific test with tracing
npx playwright test test/ml-anomaly/attack-patterns.spec.ts --project=ml-anomaly --trace=on
```

## Expected Output

Each test suite generates detailed console output with:

### Baseline Metrics
```
Normal authentication flow completed in 1250ms
Normal search completed in 890ms
Feature completeness: 100%
```

### Anomaly Detection Results
```
ANOMALY DETECTED: SQL injection bypassed authentication
Anomaly indicators: {
  "hasQuotes": true,
  "hasSqlKeywords": true,
  "payloadLength": 18,
  "bypassedAuth": true
}
```

### Performance Metrics
```
Real-time detection test results:
- Processed 50 requests in 10000ms
- Actual throughput: 5.0 requests/second  
- Average detection latency: 75ms
- Detection accuracy: 96.0%
```

## ML Training Data Generation

These tests generate structured data suitable for ML model training:

### Feature Categories
1. **Timing Features**: Response times, request intervals, session duration
2. **Content Features**: Payload sizes, character patterns, encoding types
3. **Behavioral Features**: Navigation patterns, error rates, request sequences
4. **Statistical Features**: Frequency analysis, distribution metrics, outlier detection

### Data Export
Test results include JSON-formatted anomaly indicators that can be:
- Fed directly into ML training pipelines
- Used for model validation and testing
- Analyzed for feature importance scoring
- Exported to data lakes for batch processing

## Integration with ML Systems

### Real-time Integration
```javascript
// Example integration pattern
const detectionResult = await mlAnomalyDetector.analyze({
  requestFeatures: extractedFeatures,
  behavioralContext: sessionHistory,
  timingMetrics: responseTimeData
});

if (detectionResult.anomalyScore > 0.8) {
  // Trigger security response
  await securityResponse.handle(detectionResult);
}
```

### Batch Analysis
```javascript
// Historical analysis
const batchResults = await mlAnomalyDetector.analyzeBatch(
  testResults.anomalyIndicators
);
```

## Performance Benchmarks

### Target Thresholds
| Metric | Baseline | Alert Threshold | Critical Threshold |
|--------|----------|----------------|-------------------|
| Request Rate | 1-3 req/sec | >10 req/sec | >50 req/sec |
| Response Time | 100-2000ms | >5000ms | >10000ms |
| Error Rate | <5% | >20% | >50% |
| Payload Size | 50-500 bytes | >5KB | >50KB |
| Anomaly Score | <0.2 | >0.5 | >0.8 |

### Model Performance Targets
- **Precision**: >95% (minimize false positives)
- **Recall**: >90% (catch most attacks)
- **F1-Score**: >92% (balanced performance)
- **Detection Latency**: <100ms (real-time capable)

## Security Considerations

**Important**: These tests generate actual attack payloads and should only be run in:
- Isolated test environments
- Controlled security testing labs
- Development environments with proper network isolation

### Safe Execution
- Tests target only the intentionally vulnerable demo application
- No external network requests are made
- All payloads are contained within the test environment
- Automated cleanup prevents data persistence

## Extending the Tests

### Adding New Anomaly Patterns
1. Create test case in appropriate spec file
2. Define feature extraction logic
3. Implement anomaly scoring algorithm
4. Add performance benchmarks
5. Update documentation

### Custom ML Model Integration
```javascript
// Example custom detector
class CustomAnomalyDetector {
  async analyze(features) {
    // Your ML model integration
    const prediction = await this.model.predict(features);
    return {
      anomalyScore: prediction.score,
      confidence: prediction.confidence,
      reasons: prediction.explanations
    };
  }
}
```

## Troubleshooting

### Common Issues
1. **High False Positive Rate**: Adjust baseline collection or scoring thresholds
2. **Performance Degradation**: Optimize feature extraction or reduce test scope
3. **Test Timeouts**: Increase timeout values for complex attack simulations

### Debug Mode
```bash
# Enable detailed logging
DEBUG=ml-anomaly npx playwright test test/ml-anomaly --project=ml-anomaly
```

## Contributing

When adding new ML anomaly detection tests:
1. Follow existing pattern structure
2. Include comprehensive feature extraction
3. Add performance benchmarks
4. Document expected behavior
5. Include both positive and negative test cases

---

**Note**: This test suite is designed for security research and testing purposes. Always ensure proper authorization before testing any systems.