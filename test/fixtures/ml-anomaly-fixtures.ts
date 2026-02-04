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
  anomalyAPI: async ({ request }, use) => {
    const api = new AnomalyDetectionAPI(request);
    await use(api);
  },

  trafficAnalyzer: async ({ request }, use) => {
    const analyzer = new TrafficAnalyzer(request);
    await use(analyzer);
  },

  behaviorAnalyzer: async ({ request }, use) => {
    const analyzer = new BehaviorAnalyzer(request);
    await use(analyzer);
  },

  attackPatternDetector: async ({ request }, use) => {
    const detector = new AttackPatternDetector(request);
    await use(detector);
  },

  mlValidator: async ({ request }, use) => {
    const validator = new MLModelValidator(request);
    await use(validator);
  }
});

export const uiTest = base.extend<MLAnomalyFixtures & { autoGoto: boolean }>({
  autoGoto: [true, { option: true }],

  anomalyAPI: async ({ request }, use) => {
    const api = new AnomalyDetectionAPI(request);
    await use(api);
  },

  trafficAnalyzer: async ({ request }, use) => {
    const analyzer = new TrafficAnalyzer(request);
    await use(analyzer);
  },

  behaviorAnalyzer: async ({ request }, use) => {
    const analyzer = new BehaviorAnalyzer(request);
    await use(analyzer);
  },

  attackPatternDetector: async ({ request }, use) => {
    const detector = new AttackPatternDetector(request);
    await use(detector);
  },

  mlValidator: async ({ request }, use) => {
    const validator = new MLModelValidator(request);
    await use(validator);
  },

  _autoGoto: [
    async ({ page, autoGoto }, use) => {
      if (autoGoto) {
        await page.goto('/');
      }
      await use();
    },
    { auto: true }
  ]
});

export { expect };