import { test } from '../fixtures/e2e-fixtures';

// NOTE: This spec intentionally duplicated multiple individual vuln demos by chaining them.
// The single canonical chain scenario now lives under the ZAP suite to avoid duplicate coverage.
test.describe.skip('Vulnerability Chain Testing (moved to ZAP suite)', () => {
  // See: test/e2e/zap_workflow_chain.spec.ts
});
