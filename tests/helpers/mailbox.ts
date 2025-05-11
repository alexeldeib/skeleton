/**
 * Helper functions to interact with the Supabase local mailbox (inbucket)
 * 
 * Supabase runs inbucket for local email testing on port 54324
 */

import fetch from 'node-fetch';
import { expect } from '@playwright/test';

const MAIL_API_URL = 'http://localhost:54324/api/v1/mailbox';

/**
 * Interfaces for inbucket mail service
 */
interface InbucketMail {
  id: string;
  from: string;
  subject: string;
  date: string;
  size: number;
  seen: boolean;
}

interface InbucketMailContent {
  body: {
    text?: string;
    html?: string;
  };
  header: {
    subject: string;
    date: string;
    to: string;
    from: string;
  };
}

/**
 * Gets all emails for a specific address
 * @param address Email address to check (only the username part, without domain)
 * @returns Array of mail objects
 */
export async function getEmails(address: string): Promise<InbucketMail[]> {
  const response = await fetch(`${MAIL_API_URL}/${address}`);
  if (!response.ok) {
    throw new Error(`Failed to get emails: ${response.statusText}`);
  }
  return response.json() as Promise<InbucketMail[]>;
}

/**
 * Gets a specific email's content
 * @param address Email address (username only)
 * @param id Email ID
 * @returns Email content including HTML and text body
 */
export async function getEmail(address: string, id: string): Promise<InbucketMailContent> {
  const response = await fetch(`${MAIL_API_URL}/${address}/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to get email content: ${response.statusText}`);
  }
  return response.json() as Promise<InbucketMailContent>;
}

/**
 * Deletes all emails for an address
 * @param address Email address (username only)
 */
export async function deleteAllEmails(address: string): Promise<void> {
  const response = await fetch(`${MAIL_API_URL}/${address}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete emails: ${response.statusText}`);
  }
}

/**
 * Wait for an email to arrive and extract the magic link
 * @param address Email address to check (username only)
 * @param timeout Time to wait in ms
 * @returns The magic link URL
 */
export async function waitForMagicLink(address: string, timeout = 10000): Promise<string> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const emails = await getEmails(address);
    
    if (emails.length > 0) {
      // Get the newest email
      const latestEmail = emails[0];
      
      // Get the full email content
      const emailContent = await getEmail(address, latestEmail.id);
      
      // Extract the magic link from the email
      // First try to find it in the HTML content
      if (emailContent.body.html) {
        const matches = emailContent.body.html.match(/href=["'](https:\/\/[^"']+)["']/);
        if (matches && matches[1]) {
          // Convert the production URL to a local one for testing
          return matches[1].replace('https://app.example.com', 'http://localhost:3000');
        }
      }
      
      // If not found in HTML, try text content
      if (emailContent.body.text) {
        const matches = emailContent.body.text.match(/(https:\/\/[^\s]+)/);
        if (matches && matches[1]) {
          return matches[1].replace('https://app.example.com', 'http://localhost:3000');
        }
      }
    }
    
    // Wait a bit before checking again
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  throw new Error(`Magic link email not received within ${timeout}ms`);
}

/**
 * Verify that a magic link email was received
 * @param address Email address to check (username only) 
 */
export async function expectMagicLinkEmail(address: string): Promise<InbucketMail> {
  const emails = await getEmails(address);
  expect(emails.length).toBeGreaterThan(0);
  
  const magicLinkEmail = emails.find(email => 
    email.subject.includes('Magic Link') || 
    email.subject.includes('Sign In') || 
    email.subject.includes('Login')
  );
  
  expect(magicLinkEmail).toBeDefined();
  return magicLinkEmail!;
}