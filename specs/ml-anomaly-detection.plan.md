# ML-Based Anomaly Detection Security Test Plan

## Application Overview

This test plan focuses on ML-based anomaly detection for security testing of the vulnerable web application. It covers behavioral patterns, traffic analysis, attack detection, and unusual user behavior that ML systems would typically identify as anomalous. The plan includes both legitimate user behavior baselines and malicious activity patterns that should trigger anomaly detection systems.

## Test Scenarios

### 1. Baseline Behavior Patterns

**Seed:** `test/seed.spec.ts`

#### 1.1. Normal User Authentication Flow

**File:** `tests/ml-anomaly/normal-auth-flow.spec.ts`

**Steps:**
  1. Navigate to the home page
  2. Fill username field with 'user1'
  3. Fill password field with 'password'
  4. Click login button
  5. Wait for successful login response
  6. Verify token is stored in localStorage
  7. Record baseline timing metrics

**Expected Results:**
  - Login completes within normal time range (1-3 seconds)
  - Single POST request to /api/login
  - HTTP 200 response received
  - Valid JWT token returned
  - No console errors generated
  - Standard user agent string used

#### 1.2. Normal Search Behavior

**File:** `tests/ml-anomaly/normal-search-behavior.spec.ts`

**Steps:**
  1. Navigate to home page
  2. Enter normal search term 'Laptop'
  3. Click search button
  4. Wait for search results
  5. Record response time and request patterns
  6. Repeat search with different normal terms

**Expected Results:**
  - Search completes within 1-2 seconds
  - Single GET request to /api/search
  - Search terms contain alphanumeric characters only
  - Response size within normal range (< 5KB)
  - No unusual HTTP headers
  - Standard browser behavior patterns

#### 1.3. Normal User Data Access

**File:** `tests/ml-anomaly/normal-data-access.spec.ts`

**Steps:**
  1. Navigate to home page
  2. Enter user ID '1' in IDOR form
  3. Click 'Get User Data' button
  4. Wait for response
  5. Record access pattern and timing
  6. Verify single user data request

**Expected Results:**
  - Single request to /api/user/1
  - Response time under 500ms
  - Standard HTTP headers
  - No rapid sequential requests
  - Normal browser navigation patterns

### 2. Attack Pattern Detection

**Seed:** `test/seed.spec.ts`

#### 2.1. SQL Injection Attack Pattern

**File:** `tests/ml-anomaly/sql-injection-anomaly.spec.ts`

**Steps:**
  1. Navigate to login form
  2. Enter SQL injection payload in username field: "admin' OR '1'='1'--"
  3. Enter any password
  4. Click login button
  5. Monitor request patterns and timing
  6. Record unusual payload characteristics

**Expected Results:**
  - Abnormal characters in username field (quotes, SQL keywords)
  - Payload contains SQL metacharacters
  - Request timing may vary from baseline
  - Successful authentication without valid credentials
  - Unusual payload length compared to normal usernames

#### 2.2. XSS Attack Pattern Detection

**File:** `tests/ml-anomaly/xss-attack-pattern.spec.ts`

**Steps:**
  1. Navigate to search form
  2. Enter XSS payload: '<script>alert("XSS")</script>'
  3. Submit search form
  4. Monitor response content and patterns
  5. Check for script injection in DOM

**Expected Results:**
  - Search query contains HTML/JavaScript tags
  - Abnormal characters like angle brackets and quotes
  - Payload matches known XSS patterns
  - Response reflects unescaped HTML content
  - Potential script execution context created

#### 2.3. Rapid User Enumeration Attack

**File:** `tests/ml-anomaly/user-enumeration-attack.spec.ts`

**Steps:**
  1. Navigate to IDOR form
  2. Rapidly request user data for IDs 1-20
  3. Submit requests with minimal delay between them
  4. Monitor request frequency and patterns
  5. Record response times and success rates

**Expected Results:**
  - High request frequency (> 5 requests/second)
  - Sequential parameter values (1,2,3,4...)
  - Consistent endpoint targeting (/api/user/*)
  - Abnormal session behavior compared to human patterns
  - Multiple successful data extractions

#### 2.4. Brute Force Attack Pattern

**File:** `tests/ml-anomaly/brute-force-pattern.spec.ts`

**Steps:**
  1. Navigate to login form
  2. Attempt multiple login combinations rapidly
  3. Use common passwords with same username
  4. Monitor failed authentication patterns
  5. Record timing and frequency metrics

**Expected Results:**
  - Multiple rapid login attempts (> 3/minute)
  - High failure rate (> 80% failed attempts)
  - Consistent username with varying passwords
  - Abnormal session persistence
  - Pattern matches known brute force signatures

### 3. Behavioral Anomaly Detection

**Seed:** `test/seed.spec.ts`

#### 3.1. Unusual Navigation Patterns

**File:** `tests/ml-anomaly/unusual-navigation.spec.ts`

**Steps:**
  1. Navigate directly to sensitive endpoints without normal user flow
  2. Access /api/config endpoint directly
  3. Skip normal authentication flow
  4. Monitor navigation pattern deviations
  5. Record abnormal endpoint access sequences

**Expected Results:**
  - Direct API access without UI interaction
  - Missing referrer headers from normal navigation
  - Skipped intermediate pages in typical user flow
  - Abnormal URL access patterns
  - Non-human navigation timing

#### 3.2. Automated Tool Detection

**File:** `tests/ml-anomaly/automated-tool-detection.spec.ts`

**Steps:**
  1. Simulate automated scanner behavior
  2. Make rapid requests to multiple endpoints
  3. Use non-standard User-Agent strings
  4. Perform systematic directory enumeration
  5. Monitor request patterns and headers

**Expected Results:**
  - High request volume in short timeframe
  - Systematic endpoint discovery patterns
  - Non-browser User-Agent headers
  - Missing standard browser headers (Accept-Language, etc)
  - Perfect timing consistency (robotic patterns)

#### 3.3. Session Anomaly Detection

**File:** `tests/ml-anomaly/session-anomaly.spec.ts`

**Steps:**
  1. Create multiple concurrent sessions
  2. Perform different activities in each session
  3. Monitor session timing and behavior
  4. Detect unusual session patterns
  5. Record multi-session correlation patterns

**Expected Results:**
  - Multiple simultaneous active sessions
  - Inconsistent behavior patterns across sessions
  - Rapid session switching
  - Abnormal session duration (too short/long)
  - Geographically impossible session locations

### 4. Traffic Pattern Analysis

**Seed:** `test/seed.spec.ts`

#### 4.1. Request Volume Anomalies

**File:** `tests/ml-anomaly/request-volume-anomalies.spec.ts`

**Steps:**
  1. Generate burst of requests in short timeframe
  2. Create artificial traffic spikes
  3. Monitor request rate patterns
  4. Measure deviation from baseline traffic
  5. Record traffic volume metrics

**Expected Results:**
  - Request rate exceeds normal baseline by >300%
  - Sudden traffic spikes without organic growth
  - Abnormal request distribution patterns
  - Missing typical user session patterns
  - Consistent request timing (non-human)

#### 4.2. Payload Size Anomalies

**File:** `tests/ml-anomaly/payload-size-anomalies.spec.ts`

**Steps:**
  1. Submit requests with unusually large payloads
  2. Test with abnormally small requests
  3. Monitor payload size distributions
  4. Compare against normal payload baselines
  5. Record payload characteristics

**Expected Results:**
  - Payload sizes outside normal distribution
  - Requests significantly larger than typical user input
  - Unusual content-type headers
  - Abnormal request body structures
  - Payload patterns match attack signatures

#### 4.3. Error Pattern Anomalies

**File:** `tests/ml-anomaly/error-pattern-anomalies.spec.ts`

**Steps:**
  1. Trigger various application errors systematically
  2. Monitor error response patterns
  3. Analyze error rate distribution
  4. Compare against normal error baseline
  5. Record error pattern characteristics

**Expected Results:**
  - Error rate significantly above baseline
  - Systematic error generation patterns
  - Specific error types clustered together
  - Error patterns consistent with scanning tools
  - Abnormal error response timing

### 5. Machine Learning Model Validation

**Seed:** `test/seed.spec.ts`

#### 5.1. Feature Extraction Validation

**File:** `tests/ml-anomaly/feature-extraction.spec.ts`

**Steps:**
  1. Collect comprehensive behavioral metrics during normal usage
  2. Extract timing, frequency, and pattern features
  3. Record request/response characteristics
  4. Validate feature completeness for ML models
  5. Test feature extraction accuracy

**Expected Results:**
  - All required features captured accurately
  - Features show clear distinction between normal/anomalous behavior
  - Feature extraction performance within acceptable limits
  - No data leakage in feature engineering
  - Features suitable for real-time ML inference

#### 5.2. Anomaly Score Calibration

**File:** `tests/ml-anomaly/anomaly-score-calibration.spec.ts`

**Steps:**
  1. Generate known anomalous behavior patterns
  2. Create baseline normal behavior samples
  3. Test anomaly scoring algorithm
  4. Validate score thresholds and ranges
  5. Measure false positive/negative rates

**Expected Results:**
  - Anomalous patterns receive high anomaly scores (>0.8)
  - Normal patterns receive low anomaly scores (<0.2)
  - Clear separation between normal and anomalous score distributions
  - False positive rate under acceptable threshold (<5%)
  - System maintains performance under load

#### 5.3. Real-time Detection Performance

**File:** `tests/ml-anomaly/realtime-detection.spec.ts`

**Steps:**
  1. Simulate real-time traffic with mixed normal/anomalous patterns
  2. Test detection latency and throughput
  3. Monitor system resource usage during detection
  4. Validate detection accuracy under load
  5. Measure end-to-end detection pipeline performance

**Expected Results:**
  - Detection latency under 100ms per request
  - System handles target throughput (1000+ requests/minute)
  - Detection accuracy maintained under load (>95%)
  - Resource usage within acceptable limits
  - No performance degradation over time
