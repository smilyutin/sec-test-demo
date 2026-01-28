import { test as base, expect } from '@playwright/test';
import { AnomalyDetectionAPI } from '../pages/AnomalyDetectionAPI';
import { TrafficAnalyzer } from '../utils/TrafficAnalyzer';
import { BehaviorAnalyzer } from '../utils/BehaviorAnalyzer';
import { AttackPatternDetector } from '../utils/AttackPatternDetector';
import { MLModelValidator } from '../utils/MLModelValidator';

interface MLAnomalyFixtures {
  anomalyAPI: AnomalyDetectionAPI;
  trafficAnalyzer: TrafficAnalyzer;
  behaviorAnalyzer: BehaviorAnalyzer;
  attackPatternDetector: AttackPatternDetector;
  mlValidator: MLModelValidator;
}

export const test = base.extend<MLAnomalyFixtures>({
  anomalyAPI: async ({ page }, use) => {
    const api = new AnomalyDetectionAPI(page);
    await use(api);
  },

  trafficAnalyzer: async ({ page }, use) => {
    const analyzer = new TrafficAnalyzer(page);
    await use(analyzer);
  },

  behaviorAnalyzer: async ({ page }, use) => {
    const analyzer = new BehaviorAnalyzer(page);
    await use(analyzer);
  },

  attackPatternDetector: async ({ page }, use) => {
    const detector = new AttackPatternDetector(page);
    await use(detector);
  },

  mlValidator: async ({ page }, use) => {
    const validator = new MLModelValidator(page);
    await use(validator);
  }
});

export { expect };