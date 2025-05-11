const express = require('express');
const { v4: uuidv4 } = require('uuid');

class MockEmailServer {
  constructor(port = 54324) {
    this.port = port;
    this.app = express();
    this.server = null;
    this.mailboxes = new Map();

    this.setupRoutes();
  }

  setupRoutes() {
    this.app.use(express.json());

    // List emails in a mailbox
    this.app.get('/api/v1/mailbox/:address', (req, res) => {
      const { address } = req.params;
      const mailbox = this.mailboxes.get(address) || [];
      res.json(mailbox.map(email => ({
        id: email.id,
        from: email.from,
        subject: email.subject,
        date: email.date
      })));
    });

    // Get specific email content
    this.app.get('/api/v1/mailbox/:address/:id', (req, res) => {
      const { address, id } = req.params;
      const mailbox = this.mailboxes.get(address) || [];
      const email = mailbox.find(email => email.id === id);
      
      if (!email) {
        return res.status(404).json({ error: 'Email not found' });
      }
      
      res.json(email);
    });

    // Delete all emails in a mailbox
    this.app.delete('/api/v1/mailbox/:address', (req, res) => {
      const { address } = req.params;
      this.mailboxes.delete(address);
      res.status(204).end();
    });

    // Add an endpoint to receive emails (not part of inbucket API, but useful for testing)
    this.app.post('/api/v1/send', (req, res) => {
      const { to, from, subject, html, text } = req.body;
      
      if (!to || !from || !subject || (!html && !text)) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      this.addEmail(to, from, subject, html, text);
      res.status(201).json({ message: 'Email received' });
    });
  }

  addEmail(to, from, subject, html, text) {
    const email = {
      id: uuidv4(),
      from,
      to,
      subject,
      html,
      text,
      date: new Date().toISOString()
    };

    if (!this.mailboxes.has(to)) {
      this.mailboxes.set(to, []);
    }
    
    this.mailboxes.get(to).push(email);
    return email;
  }

  extractMagicLink(email) {
    // Extract magic link from HTML content
    if (email.html) {
      const linkMatch = email.html.match(/href=["'](https?:\/\/[^"']+)["']/);
      if (linkMatch && linkMatch[1]) {
        return linkMatch[1];
      }
    }
    
    // Try to extract from text content if HTML extraction failed
    if (email.text) {
      const urlMatch = email.text.match(/(https?:\/\/[^\s]+)/);
      if (urlMatch && urlMatch[1]) {
        return urlMatch[1];
      }
    }
    
    return null;
  }

  createMagicLinkEmail(to, link) {
    return this.addEmail(
      to,
      'noreply@supabase.io',
      'Your Magic Link',
      `<html><body><p>Click <a href="${link}">here</a> to sign in.</p></body></html>`,
      `Click this link to sign in: ${link}`
    );
  }

  async start() {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log(`Mock email server running on port ${this.port}`);
          resolve();
        }
      });
    });
  }

  async stop() {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          console.log('Mock email server stopped');
          this.server = null;
          resolve();
        });
      });
    }
  }

  reset() {
    this.mailboxes.clear();
  }

  // Helper method to wait for an email to arrive
  async waitForEmail(address, timeoutMs = 5000, checkIntervalMs = 100) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      const mailbox = this.mailboxes.get(address) || [];
      if (mailbox.length > 0) {
        return mailbox[mailbox.length - 1]; // Return the most recent email
      }
      await new Promise(resolve => setTimeout(resolve, checkIntervalMs));
    }
    
    throw new Error(`No email received for ${address} after ${timeoutMs}ms`);
  }
}

module.exports = { MockEmailServer };