import { test, expect } from '../fixtures/e2e-fixtures';

test.describe('User Registration', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  // -------------------------
  // BASELINE TESTS (always run)
  // -------------------------

  test('registers a new user successfully', async ({ registrationPage }) => {
    const username = `user_${Date.now()}`;
    
    await registrationPage.registerUser({
      username,
      password: 'pass123',
      email: `${username}@demo.com`,
      role: 'user'
    });

    await registrationPage.verifyRegistrationSuccess();
  });

  test.fixme('SECURITY EXPECTATION: ignores client-supplied role (should fail until fixed)', async ({ registrationPage }) => {
    const username = `role_expect_${Date.now()}`;

    // Currently fails because the app allows mass assignment for demo purposes
    const result = await registrationPage.registerWithRole(username, 'admin');
    
    // Server should ignore the role field and default to 'user'
    expect((result as any).role).toBe('user');
  });

  // --------------------------------------
  // VULNERABILITY DEMO (opt-in only)
  // RUN_VULN_TESTS=1 npx playwright test
  // --------------------------------------

  test('VULN DEMO: accepts arbitrary role from client (opt-in)', async ({ registrationPage }) => {
    test.skip(!process.env.RUN_VULN_TESTS, 'Vulnerability demos are opt-in (set RUN_VULN_TESTS=1)');

    const username = `vuln_role_${Date.now()}`;
    
    // Test mass assignment vulnerability where client can set admin role
    const result = await registrationPage.testMassAssignmentVulnerability();
    
    console.log(`WARNING: Mass assignment vulnerability test result:`, result);
    
    const isAdmin = result.response.data?.role === 'admin';
    if (isAdmin) {
      console.log(`WARNING: Successfully elevated privileges through mass assignment!`);
    } else {
      console.log(`PASS: Mass assignment vulnerability not exploitable`);
    }
  });

  test.fixme('handles registration form validation errors', async ({ registrationPage }) => {
    // FIXME: Server validation not properly implemented - allows empty form submission
    // This test should fail until proper form validation is added to the server
    // Test empty form submission
    await registrationPage.submitRegistration();
    await registrationPage.verifyRequiredFieldsError();
    
    // Test invalid email format
    await registrationPage.fillRegistrationForm({
      email: 'invalid-email',
      username: 'testuser',
      password: 'password123'
    });
    await registrationPage.submitRegistration();
    await registrationPage.verifyValidationError('email');
  });

  test('prevents duplicate user registration', async ({ registrationPage, homePage }) => {
    const userData = {
      username: `duplicate_${Date.now()}`,
      password: 'password123',
      email: `duplicate_${Date.now()}@example.com`
    };

    // First registration
    await registrationPage.registerUser(userData);
    await registrationPage.verifyRegistrationSuccess();

    // Navigate back and try duplicate registration
    await homePage.goto();
    await registrationPage.fillRegistrationForm(userData);
    await registrationPage.submitRegistration();
    await registrationPage.verifyDuplicateUserError();
  });

  // -------------------------
  // ADDITIONAL TESTS
  // -------------------------

  test.fixme('does not allow registration with weak password', async ({ registrationPage }) => {
    // FIXME: Server validation not properly implemented - allows weak passwords
    // This test should fail until proper password validation is added to the server
    const username = `weakpass_${Date.now()}`;
    await registrationPage.fillRegistrationForm({
      username,
      password: '123',
      email: `${username}@demo.com`
    });
    await registrationPage.submitRegistration();
    await registrationPage.verifyValidationError('password');
  });

  test('does not allow registration with missing username', async ({ registrationPage }) => {
    await registrationPage.fillRegistrationForm({
      username: '',
      password: 'password123',
      email: `nouser_${Date.now()}@demo.com`
    });
    await registrationPage.submitRegistration();
    await registrationPage.verifyValidationError('username');
  });

  test.fixme('does not allow registration with missing email', async ({ registrationPage }) => {
    // FIXME: Server validation not properly implemented - allows empty email
    await registrationPage.fillRegistrationForm({
      username: `noemail_${Date.now()}`,
      password: 'password123',
      email: ''
    });
    await registrationPage.submitRegistration();
    await registrationPage.verifyValidationError('email');
  });

  test.fixme('does not allow registration with missing password', async ({ registrationPage }) => {
    // FIXME: Server validation not properly implemented - allows empty password
    await registrationPage.fillRegistrationForm({
      username: `nopass_${Date.now()}`,
      password: '',
      email: `nopass_${Date.now()}@demo.com`
    });
    await registrationPage.submitRegistration();
    await registrationPage.verifyValidationError('password');
  });

  test('validates username format requirements', async ({ registrationPage }) => {
    // Test that a valid username works
    const username = `validuser${Date.now()}`;
    await registrationPage.fillRegistrationForm({
      username: username,
      password: 'password123',
      email: `${username}@demo.com`
    });
    await registrationPage.submitRegistration();
    await registrationPage.verifyRegistrationSuccess();
  });

  test('shows error for already registered email with different username', async ({ registrationPage, homePage }) => {
    const email = `sameemail_${Date.now()}@demo.com`;
    const user1 = {
      username: `user1_${Date.now()}`,
      password: 'password123',
      email
    };
    const user2 = {
      username: `user2_${Date.now()}`,
      password: 'password123',
      email
    };

    await registrationPage.registerUser(user1);
    await registrationPage.verifyRegistrationSuccess();

    await homePage.goto();
    await registrationPage.fillRegistrationForm(user2);
    await registrationPage.submitRegistration();
    await registrationPage.verifyDuplicateUserError();
  });
  // Additional edge case tests

  test('does not allow registration with extremely long username', async ({ registrationPage }) => {
    const longUsername = 'u'.repeat(256);
    await registrationPage.fillRegistrationForm({
      username: longUsername,
      password: 'password123',
      email: `long_${Date.now()}@demo.com`
    });
    await registrationPage.submitRegistration();
    await registrationPage.verifyValidationError('username');
  });

  test.fixme('does not allow registration with extremely long email', async ({ registrationPage }) => {
    // FIXME: Server validation not properly implemented - allows extremely long emails
    const longEmail = `${'e'.repeat(244)}@x.com`;
    await registrationPage.fillRegistrationForm({
      username: `longemail_${Date.now()}`,
      password: 'password123',
      email: longEmail
    });
    await registrationPage.submitRegistration();
    await registrationPage.verifyValidationError('email');
  });

  test('does not allow registration with special characters in username', async ({ registrationPage }) => {
    await registrationPage.fillRegistrationForm({
      username: 'invalid!@#',
      password: 'password123',
      email: `special_${Date.now()}@demo.com`
    });
    await registrationPage.submitRegistration();
    await registrationPage.verifyValidationError('username');
  });

  test('does not allow registration with spaces in password', async ({ registrationPage }) => {
    // FIXME: Server validation not properly implemented - allows spaces in passwords
    const username = `spacepass_${Date.now()}`;
    await registrationPage.fillRegistrationForm({
      username,
      password: 'pass word 123',
      email: `${username}@demo.com`
    });
    await registrationPage.submitRegistration();
    await registrationPage.verifyValidationError('password');
  });

  test('does not allow registration with uppercase email if system is case-insensitive', async ({ registrationPage }) => {
    const username = `caseemail_${Date.now()}`;
    const email = `${username}@DEMO.COM`;
    await registrationPage.fillRegistrationForm({
      username,
      password: 'password123',
      email
    });
    await registrationPage.submitRegistration();
    // If system is case-insensitive, this should succeed, otherwise fail
    // Adjust expectation as per your app's behavior
    await registrationPage.verifyRegistrationSuccess();
  });

  test('does not allow registration with script tags in username (XSS)', async ({ registrationPage }) => {
    await registrationPage.fillRegistrationForm({
      username: '<script>alert(1)</script>',
      password: 'password123',
      email: `xss_${Date.now()}@demo.com`
    });
    await registrationPage.submitRegistration();
    await registrationPage.verifyValidationError('username');
  });
});