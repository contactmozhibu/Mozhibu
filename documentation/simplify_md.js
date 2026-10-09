const fs = require('fs');

let md = fs.readFileSync('Mozhibu_Complete_Documentation.md', 'utf8');

const regex7 = /# 7\. Entity Relationship Diagram[\s\S]*?```mermaid[\s\S]*?```[\s\S]*?## 7\.2 Revenue & Monetisation Data Flow[\s\S]*?```mermaid[\s\S]*?```/m;

const replacement7 = `# 7. Data Structure & Revenue Flow

## 7.1 How Data is Connected

The platform relies on several core data records that interact seamlessly to provide the reader and author experiences. Here is a simplified breakdown of how everything is connected:

### Core Records
- **Users**: Everyone on the platform (Readers, Writers, Admins). Each user has a profile, role, and monetization settings.
- **Books**: Created by Writers. Contains metadata like title, genre, and whether it's part of a competition.
- **Chapters**: Belong to Books. Contain the actual story text and cost (free or premium).
- **Competitions**: Hosted by Admins. Books can be submitted to these time-bound events.

### How Users Interact with Data
- **Writing**: A User (Writer) creates multiple **Books**, and each Book contains multiple **Chapters**.
- **Reading**: A User (Reader) has **Reading Progress** tracked automatically for every Book they open.
- **Engaging**: Users can leave **Reviews** on Books, or submit **Reports** if content violates guidelines. Users can also follow other Users.

### Subscriptions & Earning
- **Subscriptions**: Readers purchase **User Subscriptions** based on predefined **Subscription Plans**.
- **Qualified Reads**: When a reader spends enough time reading a chapter, a **Qualified Read** is generated. 
- **Payouts**: Qualified Reads determine the **Author Earnings** received by writers each month.

---

## 7.2 Revenue & Monetisation Flow

This step-by-step process explains how money moves from Readers to Authors seamlessly:

1. **Reader Subscribes**: A reader pays ₹99/month via Stripe. Their account immediately becomes "Premium".
2. **Reading Chapters**: The reader unlocks and reads chapters across the platform.
3. **Time Tracking (Anti-Fraud)**: The system checks if the reader spent a reasonable amount of time on the chapter. 
   - *If Yes:* It counts as a "Qualified Read".
   - *If No:* It is flagged as fraud and ignored.
4. **Month-End Calculation**: At the end of the month, an automated system aggregates all Qualified Reads across the platform.
5. **Revenue Split**: The system calculates each author's share. The platform keeps 30%, and the remaining 70% is pooled and distributed to authors based on their share of total reads.
6. **Payout via Stripe**: The system creates an Earnings record. If the author has completed their bank setup (KYC), the money is automatically transferred directly to their bank account via Stripe Connect!`;

md = md.replace(regex7, replacement7);

const regex3 = /# 3\. System Architecture Diagram[\s\S]*?```mermaid[\s\S]*?```/m;

const replacement3 = `# 3. System Architecture Diagram

## 3.1 High-Level Platform Topology

The system follows a modern cloud-native architecture split into distinct tiers:

**1. Client Tier (Presentation)**
- **Angular SPA**: The web browser application used by readers and authors. 
- **SEO Crawlers**: GoogleBot and other search engines indexing public story pages.

**2. Edge & Gateway Tier**
- **Cloudflare CDN**: Speeds up the site globally and protects against attacks.
- **AWS Load Balancer**: Routes traffic to healthy servers.

**3. Application Tier (Business Logic)**
- **Node.js Cluster**: Multiple identical servers running the Express API to handle user requests concurrently.
- **Cron Worker**: A background job server that safely calculates monthly author payouts without slowing down the main website.

**4. Data Persistence Tier (State)**
- **MongoDB Database**: Uses a Primary node for saving data and Secondary nodes for fast reading and analytics.
- **Redis Cache**: Temporarily stores fast-access data like active user sessions and security rate limits.`;

md = md.replace(regex3, replacement3);

fs.writeFileSync('Mozhibu_Complete_Documentation.md', md, 'utf8');
console.log('Markdown successfully updated to be user-friendly.');
