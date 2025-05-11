/**
 * Helper to manage the mock email server during tests
 */

const { MockEmailServer } = require('../mock-email-server');

// Singleton instance
let mockServer = null;

/**
 * Start the mock email server if it's not already running
 */
async function startMockEmailServer() {
  if (!mockServer) {
    mockServer = new MockEmailServer();
    try {
      await mockServer.start();
      console.log('🎭 Mock email server started on port 54324');
    } catch (error) {
      console.error('❌ Failed to start mock email server:', error.message);
      mockServer = null;
      throw error;
    }
  }
  return mockServer;
}

/**
 * Stop the mock email server
 */
async function stopMockEmailServer() {
  if (mockServer) {
    await mockServer.stop();
    mockServer = null;
    console.log('🛑 Mock email server stopped');
  }
}

/**
 * Clear all emails in the mock server
 */
function clearEmails() {
  if (mockServer) {
    mockServer.reset();
    console.log('🧹 Cleared all mock emails');
  }
}

/**
 * Generate a mock magic link for testing
 * 
 * @param {string} email - The email to send to
 * @param {string} redirectUrl - The URL to redirect to after authentication
 * @returns {string} The generated magic link
 */
function generateMockMagicLink(email, redirectUrl = 'http://localhost:3001/dashboard') {
  // Create a mock magic link with a fake token
  const token = Buffer.from(Date.now().toString()).toString('base64');
  const magicLink = `http://localhost:3001/auth/callback?token=${token}&type=magiclink&redirect_to=${encodeURIComponent(redirectUrl)}`;
  
  // Add the email to the mock server
  if (mockServer) {
    mockServer.createMagicLinkEmail(email, magicLink);
    console.log(`📧 Generated mock magic link for ${email}: ${magicLink}`);
  }
  
  return magicLink;
}

/**
 * Wait for an email to be received and return it
 * 
 * @param {string} email - The email address to check
 * @param {number} timeout - The timeout in milliseconds
 * @returns {Object} The email object
 */
async function waitForEmail(email, timeout = 5000) {
  if (!mockServer) {
    throw new Error('Mock email server not started');
  }
  
  return mockServer.waitForEmail(email, timeout);
}

module.exports = {
  startMockEmailServer,
  stopMockEmailServer,
  clearEmails,
  generateMockMagicLink,
  waitForEmail
};