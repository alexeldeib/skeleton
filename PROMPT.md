skaffold a template for a production saas application following best practices. 

include a landing page (marketing site) and separate frontend application. the landing page and frontend should vite or next.js or some other common frontend framework. The landing page and frontend should be deployed via vercel. The landing page and frontend should be modern and responsive.

The landing page should include the following sections:

- A mailing list signup - the product will not exist when we launch the site.
- A header with the company logo, navigation links, and a call-to-action button.
- A hero section with a catchy headline, brief description, and a prominent call-to-action.
- A features section highlighting 3-4 key features of the application.
- A section with different plan options - no pricing yet.
- A final call-to-action section to encourage mailing list signups.
- A footer with important links and social media icons.
- A "go to app" button which links to the application frontend

The application frontend should include:
- Authentication protection on all pages via supabase auth. skaffold magic link auth, google auth, and github auth. Show all auth options in a single panel without toggles.
- A settings page for account configuration -- name, email, and billing.
- 1-2 key product pages. details TBD -- just mock out some visually pleasing designs.
- An analytics/usage page. details TBD.

skaffold appropriate code to implement backend functionality using, in descending priority:
- supabase edge functions -- for anything we can use them for.
- codesandbox.io -- for executing untrusted code or things that should be isolated from our backend.
- fly.io apps -- for anything where we require a full VM runtime.
- cloudflare workers -- similar usage to supabase edge functions. unlikely there's a good use case, but another option.
- If required, use upstash for redis. Prefer not to use it.
- If required, use Vercel or Cloudflare for object storage. Prefer not to use it

make it easy to delete e.g. the cloudflare and fly.io folders if they are unused.

organize landing page, frontend, and the 4 varieties of backend code, plus SQL migrations

assume the database will be hosted on supabase, but create migrations and seed content that will work with any postgresql backend. use supabase with magic link as the default authentication method. never hardcode secrets in code, and enforce all required application variables at startup. use env files for local development and add secrets to git ignore. develop scripts for best-practice automated deployment for each component.

use production best practices to create all components. avoid using stub API calls where possible. design code to be testable and debuggable easily by human or AI.

---

Generate a complete production-ready SaaS application scaffold following best practices. 

Requirements:
1. Frontend:
   - Use Vite or Next.js for both a landing page (marketing site) and a separate frontend application.
   - Deploy both on Vercel.
   - Design should be modern, responsive, and visually appealing.

2. Landing Page:
   - Sections: 
     - Mailing list signup using mailchimp (product will not exist at launch).
     - Header with logo, navigation links, and a call-to-action button.
     - Hero section with catchy headline, description, and call-to-action.
     - Features section highlighting 3-4 key features.
     - Plan options (no pricing yet).
     - Final call-to-action for mailing list signups.
     - Footer with important links and social media icons.
     - "Go to app" button linking to the application frontend.

3. Application Frontend:
   - Authentication protection on all pages using Supabase Auth (magic link, Google, GitHub).
   - Display all auth options in a single panel without toggles.
   - Include a settings page for account configuration (name, email, billing).
   - 1-2 key product pages (mock visually appealing designs).
   - Analytics/usage page (details TBD).

4. Backend Architecture:
   - Prioritize Supabase Edge Functions for backend functionality.
   - Use Codesandbox.io for isolated/untrusted code execution.
   - Fly.io for full VM runtime requirements.
   - Cloudflare Workers for use cases similar to Supabase Edge Functions (if needed).
   - Make it easy to remove unused backend components (e.g., Cloudflare or Fly.io).
   - Use supabase postgres or neon postgres as the database.
   - If required, use upstash for redis. Prefer not to use it.
   - If required, use Vercel or Cloudflare for object storage. Prefer not to use it

5. Organization and Best Practices:
   - Structure the project to separate landing page, frontend, and the four backend code types.
   - Use Supabase as the default database with PostgreSQL compatibility. 
   - Implement database migrations and seed content.
   - Use environment variables for configuration, and ensure secrets are not hardcoded.
   - Follow production best practices: code must be testable and easily debuggable.
   - Automate deployment with best-practice scripts.
   - Document the project structure and deployment steps clearly.


Appendix

Codesandbox API example:

`npm install @codesandbox/sdk`: this cannot execute in Deno or Bun environments, like cloudflare workers and supabase edge functions.

Codesandbox does not require a directory for its own code -- it would be embedded inside other server side code.

This should be used minimally: only for code execution or other untrusted activities.

```typescript
import { CodeSandbox } from "@codesandbox/sdk";

// Create the client with your token  
const sdk = new CodeSandbox(token);

// This creates a new sandbox by forking our default template sandbox.  
// You can also pass in other template ids, or create your own template to fork from.  
const sandbox = await sdk.sandbox.create();

// You can run JS code directly  
await sandbox.shells.js.run("console.log(1+1)");  
// Or Python code (if it's installed in the template)  
await sandbox.shells.python.run("print(1+1)");

// Or anything else  
await sandbox.shells.run("echo 'Hello, world!'");

// We have a FS API to interact with the filesystem  
await sandbox.fs.writeTextFile("./hello.txt", "world");

// And you can clone sandboxes! This does not only clone the filesystem, processes that are running in the original sandbox will also be cloned!  
const sandbox2 = await sandbox.fork();

// Check that the file is still there  
await sandbox2.fs.readTextFile("./hello.txt");

// You can also get the opened ports, with the URL to access those  
console.log(sandbox2.ports.getOpenedPorts());

// Getting metrics...  
const metrics = await sandbox2.getMetrics();  
console.log(  
  `Memory: ${metrics.memory.usedKiB} KiB / ${metrics.memory.totalKiB} KiB`  
);  
console.log(`CPU: ${(metrics.cpu.used / metrics.cpu.cores) * 100}%`);

// Finally, you can hibernate a sandbox. This will snapshot the sandbox and stop it. Next time you start the sandbox, it will continue where it left off, as we created a memory snapshot.  
await sandbox.hibernate();  
await sandbox2.hibernate();

// Open the sandbox again  
const resumedSandbox = await sdk.sandbox.open(sandbox.id);
```