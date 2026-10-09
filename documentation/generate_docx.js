const fs = require('fs');
const path = require('path');
const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    HeadingLevel, AlignmentType, BorderStyle, WidthType, Header, Footer,
    ImageRun, PageNumber, NumberFormat, ShadingType, TableLayoutType,
    PageBreak, Tab, TabStopType, TabStopPosition
} = require('docx');

// ─── Read Images ───
const headerImg = fs.readFileSync(path.join(__dirname, 'Doc1_files', 'image001.png'));
const footerImg = fs.readFileSync(path.join(__dirname, 'Doc1_files', 'image002.png'));

// ─── Read MD ───
const md = fs.readFileSync(path.join(__dirname, 'Mozhibu_Complete_Documentation.md'), 'utf8');

// ─── Helpers ───
function heading(text, level = HeadingLevel.HEADING_1) {
    return new Paragraph({ heading: level, spacing: { before: 300, after: 200 }, children: [new TextRun({ text, bold: true, color: '2F5496', font: 'Calibri Light', size: level === HeadingLevel.HEADING_1 ? 40 : level === HeadingLevel.HEADING_2 ? 32 : 26 })] });
}
function para(text, opts = {}) {
    return new Paragraph({ spacing: { after: 120, line: 276 }, children: [new TextRun({ text, font: 'Calibri', size: 22, ...opts })] });
}
function boldPara(label, value) {
    return new Paragraph({ spacing: { after: 80, line: 276 }, children: [new TextRun({ text: label, bold: true, font: 'Calibri', size: 22 }), new TextRun({ text: value, font: 'Calibri', size: 22 })] });
}
function bullet(text, level = 0) {
    return new Paragraph({ bullet: { level }, spacing: { after: 60, line: 276 }, children: [new TextRun({ text, font: 'Calibri', size: 22 })] });
}
function bulletBold(label, text, level = 0) {
    return new Paragraph({ bullet: { level }, spacing: { after: 60, line: 276 }, children: [new TextRun({ text: label, bold: true, font: 'Calibri', size: 22 }), new TextRun({ text, font: 'Calibri', size: 22 })] });
}
function emptyLine() {
    return new Paragraph({ spacing: { after: 80 }, children: [] });
}
function codeBlock(text) {
    const lines = text.split('\n');
    return lines.map(line => new Paragraph({ spacing: { after: 0, line: 240 }, shading: { type: ShadingType.SOLID, color: 'F8F9FA' }, indent: { left: 360 }, children: [new TextRun({ text: line || ' ', font: 'Consolas', size: 18, color: '333333' })] }));
}
function makeTable(headers, rows) {
    const hCells = headers.map(h => new TableCell({ shading: { type: ShadingType.SOLID, color: '2F5496' }, children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: 'FFFFFF', font: 'Calibri', size: 20 })], alignment: AlignmentType.LEFT })] }));
    const hRow = new TableRow({ children: hCells, tableHeader: true });
    const dataRows = rows.map((r, i) => {
        const bg = i % 2 === 0 ? 'FFFFFF' : 'F2F7FB';
        return new TableRow({ children: r.map(cell => new TableCell({ shading: { type: ShadingType.SOLID, color: bg }, children: [new Paragraph({ children: [new TextRun({ text: cell, font: 'Calibri', size: 20 })], alignment: AlignmentType.LEFT })] })) });
    });
    return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [hRow, ...dataRows] });
}
function pageBreak() {
    return new Paragraph({ children: [new PageBreak()] });
}
function blockquote(text) {
    return new Paragraph({ spacing: { after: 120, line: 276 }, indent: { left: 720 }, border: { left: { color: '2F5496', size: 6, style: BorderStyle.SINGLE, space: 10 } }, shading: { type: ShadingType.SOLID, color: 'F2F7FB' }, children: [new TextRun({ text, font: 'Calibri', size: 22, italics: true, color: '555555' })] });
}

// ─── Build Document ───
const children = [];

// ═══ COVER PAGE ═══
for (let i = 0; i < 8; i++) children.push(emptyLine());
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: 'MOZHIBU — STORY PLATFORM', bold: true, font: 'Calibri Light', size: 56, color: '2F5496' })] }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: 'Comprehensive Technical Documentation', font: 'Calibri', size: 32, color: '595959' })] }));
children.push(emptyLine());
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: 'Version 2.0  |  September 2026', font: 'Calibri', size: 24, color: '595959' })] }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: 'Prepared For: Client Stakeholders & Development Teams', font: 'Calibri', size: 24, color: '595959' })] }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: 'Classification: Technical Reference Document', font: 'Calibri', size: 24, color: '595959' })] }));
for (let i = 0; i < 6; i++) children.push(emptyLine());
children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'SOFTRATE TECHNOLOGIES (P) LTD', bold: true, font: 'Calibri', size: 24, color: '2F5496' })] }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Softrate Tech Park, Mangadu, Chennai, India, 600 122', font: 'Calibri', size: 20, color: '595959' })] }));

// ═══ TABLE OF CONTENTS ═══
children.push(pageBreak());
children.push(heading('Table of Contents'));
const tocItems = [
    '1. Executive Project Overview',
    '2. Technologies Used',
    '3. System Architecture',
    '4. Frontend Application Architecture',
    '5. Backend & Middleware Architecture',
    '6. Database Schema & Data Models',
    '7. Entity Relationship Diagram',
    '8. API Architecture & Routing',
    '9. Test Case Documentation',
    'Appendix'
];
tocItems.forEach((item, i) => children.push(para(item)));
children.push(emptyLine());

// ═══ SECTION 1: Executive Project Overview ═══
children.push(pageBreak());
children.push(heading('1. Executive Project Overview'));
children.push(heading('1.1 Introduction', HeadingLevel.HEADING_2));
children.push(para('Mozhibu — Story is a multilingual, full-stack digital storytelling and literary platform designed to bridge the gap between independent authors and readers across diverse linguistic communities. The name Mozhibu is derived from the Tamil word for language, reflecting the platform\'s foundational mission: celebrating linguistic diversity through original literature.'));
children.push(emptyLine());
children.push(para('The platform is not a simple blog or content aggregator. It is a comprehensive literary economy — a sophisticated, real-time system where authors write, publish, and earn revenue directly from their readership; where readers discover, follow, and immerse themselves in serialised fiction; and where competitions drive engagement and accelerate discoverability for talented new voices.'));

children.push(heading('1.2 Mission Statement', HeadingLevel.HEADING_2));
children.push(blockquote('To democratise global storytelling by providing a robust, equitable, and technologically superior platform where linguistic diversity is celebrated, raw creativity is financially rewarded, and the act of reading is elevated through seamless technology.'));

children.push(heading('1.3 Platform Scope & Core Capabilities', HeadingLevel.HEADING_2));
children.push(makeTable(
    ['Module', 'Description', 'Primary Actors'],
    [
        ['Author Studio', 'A full-featured writing interface for creating, editing, and publishing serialised books and chapters with cover uploads, genre tagging, and analytics.', 'Writers'],
        ['Reader Interface', 'An immersive, distraction-free reading UI with customisable typography, dark/light themes, offline caching, and cross-device progress synchronisation.', 'Readers'],
        ['Subscription Engine', 'A Stripe-integrated dual-tier monetisation system where readers subscribe for premium access and authors earn proportional revenue based on Qualified Reads.', 'Readers, Writers'],
        ['Competitions Module', 'Time-bound, admin-configured writing contests with eligibility checking, real-time leaderboards, and winner selection.', 'Admins, Writers'],
        ['Monetisation & Payouts', 'An end-of-month automated Cron Job that calculates each author\'s revenue share from the subscription pool and transfers earnings via Stripe Connect.', 'Writers, Admins'],
        ['Admin Control Panel', 'A secure moderation dashboard for managing user accounts, reviewing reported books, approving author applications, and configuring system-wide parameters.', 'Superadmins'],
        ['Notification System', 'A push-notification and in-app alert engine via Firebase Cloud Messaging (FCM) for chapter releases, competition results, and moderation events.', 'All Users']
    ]
));

children.push(heading('1.4 User Roles & Permissions', HeadingLevel.HEADING_2));
children.push(para('The platform uses a hierarchical role system with progressive access:'));
children.push(makeTable(
    ['Role', 'Access Level', 'Key Permissions'],
    [
        ['Superadmin', 'Full System Access', 'Manage all users, platform config, approve authors, resolve reports, create competitions'],
        ['Writer', 'Reader + Author Studio', 'All Reader permissions plus: publish books, create chapters, earn payouts, view earnings dashboard'],
        ['Reader', 'Standard Access', 'Browse books, read chapters, subscribe to premium, follow authors, leave reviews']
    ]
));
children.push(emptyLine());
children.push(heading('Role Progression', HeadingLevel.HEADING_3));
children.push(bullet('A user registers as a Reader by default.'));
children.push(bullet('A Reader submits an Author Request (with pen name and bio).'));
children.push(bullet('A Superadmin approves the request, upgrading their role to Writer.'));
children.push(bullet('Writers can receive payouts once their KYC (bank details) are submitted and verified.'));

children.push(heading('1.5 User Journey Maps', HeadingLevel.HEADING_2));
children.push(heading('Journey A — Reader Lifecycle', HeadingLevel.HEADING_3));
children.push(makeTable(
    ['Step', 'Stage', 'What Happens'],
    [
        ['1', 'Landing', 'User discovers the platform via SEO link or social share'],
        ['2', 'Onboarding', 'User signs up via email/password or OAuth (Google/Facebook). Selects preferred language and favourite genres.'],
        ['3', 'Discovery', 'Personalised feed shows books matching genres. User follows authors, bookmarks books.'],
        ['4', 'Reading', 'Opens chapters. Progress is tracked every 60 seconds via Heartbeat API.'],
        ['5', 'Paywall', 'Chapter 10 is Premium — upgrade modal appears. User inputs card → Stripe processes → webhook fires.'],
        ['6', 'Premium', 'isPremium = true, all locked chapters unlock instantly.']
    ]
));
children.push(heading('Journey B — Writer Earning Pipeline', HeadingLevel.HEADING_3));
children.push(makeTable(
    ['Step', 'Stage', 'What Happens'],
    [
        ['1', 'Application', 'Reader submits AuthorRequest → Admin approves'],
        ['2', 'Creation', 'Writer creates Book with cover art and genre tags. Drafts Chapter 1 in the rich text editor.'],
        ['3', 'Publication', 'Publishes chapter → FCM notification sent to all followers'],
        ['4', 'KYC Setup', 'Writer submits encrypted bank details (accountNumber, IFSC)'],
        ['5', 'Month End', 'Cron Job aggregates all QualifiedReads for the author\'s books. Calculates revenue share from total subscription pool.'],
        ['6', 'Payout', 'AuthorEarnings record created → Stripe Connect transfer initiated']
    ]
));

// ═══ SECTION 2: Technologies Used ═══
children.push(pageBreak());
children.push(heading('2. Technologies Used'));
children.push(heading('2.1 Full Technology Stack Overview', HeadingLevel.HEADING_2));
children.push(makeTable(
    ['Layer', 'Technologies'],
    [
        ['Frontend', 'Angular 15+, TypeScript (Strict), RxJS, SCSS'],
        ['Backend', 'Node.js 18 LTS, Express.js 4.x'],
        ['Database', 'MongoDB (NoSQL, Replica Set), Mongoose ODM 8.x'],
        ['Cache', 'Redis (ElastiCache)'],
        ['Authentication', 'JWT (RS256), bcrypt (10 salt rounds), OAuth 2.0'],
        ['Payments', 'Stripe API + Stripe Connect + Webhooks'],
        ['Notifications', 'Firebase Cloud Messaging (FCM)'],
        ['File Storage', 'AWS S3 / Cloudinary CDN'],
        ['Email', 'Nodemailer / SendGrid'],
        ['Dev Tools', 'Jest, Supertest, ESLint, Prettier']
    ]
));
children.push(heading('2.2 Frontend Technologies — Deep Dive', HeadingLevel.HEADING_2));
children.push(makeTable(
    ['Technology', 'Version', 'Justification'],
    [
        ['Angular', '15+', 'Enterprise-grade SPA framework with built-in DI, AOT compilation, lazy-loading, and strict TypeScript integration. Ideal for a large, multi-role application.'],
        ['TypeScript', 'Strict Mode', 'Compile-time type safety across hundreds of components. Shared interfaces (IBook, IUser) prevent API contract drift.'],
        ['RxJS', '7.x', 'Manages all async state — debounced search queries, cross-component state via BehaviorSubjects, real-time progress tracking heartbeats.'],
        ['SCSS', 'Preprocessor', 'CSS Variables + SCSS variables enable runtime theme switching (Light/Dark/Sepia) without page reload.'],
        ['Angular Router', 'Built-in', 'Lazy-loads Feature Modules. A Reader never downloads the Admin or Author Studio JS bundles.']
    ]
));
children.push(heading('2.3 Backend Technologies — Deep Dive', HeadingLevel.HEADING_2));
children.push(makeTable(
    ['Technology', 'Version', 'Justification'],
    [
        ['Node.js', '18 LTS', 'Non-blocking, event-driven I/O handles tens of thousands of concurrent readers on a single instance without thread starvation.'],
        ['Express.js', '4.x', 'Minimalist routing + middleware pipeline. Ideal for injecting Auth, Rate Limiting, and File Upload handling globally.'],
        ['Mongoose ODM', '8.x', 'Schema validation, lifecycle hooks (pre-save bcrypt hashing), and .populate() for reference resolution — all at the application layer.'],
        ['JWT', 'RS256', 'Stateless authentication. Tokens carry user ID and role, removing per-request database lookups and enabling horizontal scaling.'],
        ['bcrypt', '10 Salt Rounds', 'One-way password hashing. Even database administrators cannot read user passwords.'],
        ['Multer', '1.x', 'Intercepts multipart/form-data file uploads, validates MIME types by inspecting magic bytes, and streams directly to S3.']
    ]
));
children.push(heading('2.4 Third-Party SaaS Integrations', HeadingLevel.HEADING_2));
children.push(makeTable(
    ['Service', 'Purpose', 'Integration Method'],
    [
        ['Stripe', 'Reader subscriptions, Author payouts via Connect', 'REST API + Webhooks'],
        ['AWS S3 / Cloudinary', 'Book cover and avatar storage with global CDN', 'SDK — streams file buffer directly'],
        ['Firebase FCM', 'Push notifications (new chapters, competition alerts)', 'Server SDK'],
        ['SendGrid / Nodemailer', 'Transactional emails (verify, reset password, payout reports)', 'SMTP / REST API'],
        ['Redis', 'Rate limiting, JWT blacklisting, session caching', 'ioredis client']
    ]
));

// ═══ SECTION 3: System Architecture ═══
children.push(pageBreak());
children.push(heading('3. System Architecture'));
children.push(heading('3.1 High-Level Platform Topology', HeadingLevel.HEADING_2));
children.push(para('The Mozhibu platform follows a modern, cloud-native microservices-inspired architecture divided into four distinct tiers. Each tier is designed for independent scaling and fault isolation.'));
children.push(emptyLine());
children.push(heading('Client Tier (Presentation Layer)', HeadingLevel.HEADING_3));
children.push(bulletBold('Angular SPA: ', 'The primary web application running in the user\'s browser. Built with Angular 15+ using lazy-loaded feature modules.'));
children.push(bulletBold('Mobile App (Future): ', 'Planned native mobile apps for iOS and Android.'));
children.push(bulletBold('SEO Crawlers: ', 'GoogleBot and other search engines index public-facing story pages for organic discovery.'));

children.push(heading('Edge & Gateway Tier', HeadingLevel.HEADING_3));
children.push(bulletBold('Cloudflare CDN & WAF: ', 'Global content delivery network that caches static assets and provides DDoS protection via Web Application Firewall.'));
children.push(bulletBold('AWS Application Load Balancer: ', 'Distributes incoming API traffic across multiple Node.js instances using round-robin routing.'));

children.push(heading('Application Tier (Business Logic)', HeadingLevel.HEADING_3));
children.push(bulletBold('Node.js Cluster: ', 'Multiple identical Express.js server instances running behind the load balancer. Each handles user requests independently.'));
children.push(bulletBold('Cron Worker: ', 'A dedicated background job server that executes monthly payout calculations and sends batch notifications without impacting user-facing performance.'));

children.push(heading('Data Persistence Tier', HeadingLevel.HEADING_3));
children.push(bulletBold('MongoDB Replica Set: ', 'A 3-node cluster consisting of 1 Primary (handles all writes) and 2 Secondaries (handle reads and analytics queries).'));
children.push(bulletBold('Redis Cache: ', 'In-memory data store for rate limiting counters, JWT blacklist tokens, and frequently accessed session data.'));

children.push(heading('External Cloud Services', HeadingLevel.HEADING_3));
children.push(bulletBold('AWS S3: ', 'Stores book cover images, user avatars, and chapter media assets.'));
children.push(bulletBold('Stripe: ', 'Handles all payment processing — subscriptions, refunds, and author payouts via Connect.'));
children.push(bulletBold('Firebase FCM: ', 'Delivers push notifications to readers when new chapters are published.'));
children.push(bulletBold('SendGrid: ', 'Sends transactional emails for account verification, password reset, and payout reports.'));

children.push(heading('3.2 Request Lifecycle Flow', HeadingLevel.HEADING_2));
children.push(para('When a user interacts with the platform, the following sequence occurs:'));
children.push(makeTable(
    ['Step', 'Component', 'Action'],
    [
        ['1', 'Angular Browser', 'User triggers action → HTTP request sent (e.g., GET /api/v1/books?genre=Fiction)'],
        ['2', 'Cloudflare CDN', 'Request passes through CDN. Static assets served from cache; API calls forwarded.'],
        ['3', 'Load Balancer', 'Routes request to an available Node.js instance using round-robin.'],
        ['4', 'Redis', 'Rate limiter checks if the IP has exceeded 100 requests per 15 minutes.'],
        ['5', 'Auth Middleware', 'JWT token is verified. User ID and role are decoded and attached to the request.'],
        ['6', 'MongoDB', 'Database query executes (e.g., db.books.find({ genre, status: "published" }))'],
        ['7', 'Response', 'JSON envelope returned: { success: true, data: [...], pagination: {...} }']
    ]
));

// ═══ SECTION 4: Frontend Architecture ═══
children.push(pageBreak());
children.push(heading('4. Frontend Application Architecture'));
children.push(heading('4.1 Angular Module Strategy', HeadingLevel.HEADING_2));
children.push(para('The Angular application uses a strict three-tier module architecture to keep the initial bundle lean and load feature code on-demand. This ensures that readers never download admin or author studio code, reducing initial load time by approximately 60%.'));
children.push(makeTable(
    ['Module Type', 'Loading Strategy', 'Contents'],
    [
        ['CoreModule', 'Eager (loaded once at startup)', 'AuthService, JWT Interceptor, Error Handler, Theme Service'],
        ['SharedModule', 'Imported by Feature Modules', 'BookCard component, Modal, Spinner, Pagination, TruncatePipe'],
        ['Feature Modules', 'Lazy-loaded on navigation', '/auth, /home, /story, /reader, /write, /library, /earnings, /admin, /competition, /search, /subscription']
    ]
));

children.push(heading('4.2 Frontend Folder Structure', HeadingLevel.HEADING_2));
children.push(para('The frontend codebase is organised into a clean, maintainable structure:'));
children.push(makeTable(
    ['Directory', 'Purpose', 'Key Files'],
    [
        ['src/app/core/', 'Singleton services loaded once at startup', 'auth.guard.ts, role.guard.ts, jwt.interceptor.ts, auth.service.ts, theme.service.ts'],
        ['src/app/shared/', 'Reusable UI components and utilities', 'book-card/, modal/, confirm-modal/, toast-alert/, truncate.pipe.ts'],
        ['src/app/features/', 'Lazy-loaded domain modules', 'auth/, home/, story/, reader/, write/, library/, earnings/, admin/, search/, subscription/'],
        ['src/app/layout/', 'App shell (navbar, sidebar, footer)', 'Layout components shared across all routes'],
        ['src/app/styles/', 'Design tokens and mixins', '_variables.scss, _mixins.scss, _typography.scss'],
        ['src/assets/i18n/', 'Translation files', 'en.json, ta.json (Tamil), hi.json (Hindi)']
    ]
));

children.push(heading('4.3 Routing Architecture & Guard Strategy', HeadingLevel.HEADING_2));
children.push(para('Every route in the application is protected by a layered guard system:'));
children.push(makeTable(
    ['Step', 'Guard', 'Logic'],
    [
        ['1', 'AuthGuard', 'Checks if JWT token exists in localStorage. If missing → redirects to /login.'],
        ['2', 'RoleGuard', 'Decodes JWT payload and checks the user\'s role. If role doesn\'t match → redirects to 403 Forbidden page.'],
        ['3', 'Module Loader', 'If guards pass, Angular\'s lazy loader fetches the appropriate Feature Module bundle.'],
        ['4', 'Component Render', 'The target component renders with data fetched from the API.']
    ]
));

children.push(heading('4.4 State Management via RxJS', HeadingLevel.HEADING_2));
children.push(para('Instead of NgRx, Mozhibu uses lightweight RxJS BehaviorSubjects for reactive state management:'));
children.push(bulletBold('Optimistic Updates: ', 'When a user clicks "Like", the UI updates instantly via BehaviorSubject before the HTTP call completes.'));
children.push(bulletBold('Rollback on Error: ', 'If the server returns an error (4xx), the BehaviorSubject is rolled back to its previous state.'));
children.push(bulletBold('Shared State: ', 'Components subscribe to the same Observable stream using the async pipe, ensuring consistent data across the UI.'));

// ═══ SECTION 5: Backend & Middleware Architecture ═══
children.push(pageBreak());
children.push(heading('5. Backend & Middleware Architecture'));
children.push(heading('5.1 The Layered Architecture Pattern', HeadingLevel.HEADING_2));
children.push(para('Every HTTP request passing through the Express API travels through a strict, ordered middleware pipeline. This design ensures security, validation, and error handling are applied consistently across all routes.'));
children.push(makeTable(
    ['Layer', 'Component', 'Responsibility'],
    [
        ['1', 'CORS Handler', 'Validates origin headers to prevent cross-site request forgery'],
        ['2', 'Rate Limiter', 'Redis-based: 100 requests per 15 minutes per IP address'],
        ['3', 'Body Parser', 'Parses JSON bodies and multipart/form-data file uploads'],
        ['4', 'Auth Middleware', 'Decodes JWT token → attaches user ID and role to req.user'],
        ['5', 'Route Handler', 'Matches the URL pattern to the appropriate controller method'],
        ['6', 'Controller', 'Extracts request parameters and delegates to the Service layer'],
        ['7', 'Service', 'Contains all business logic, external API calls, and data transformations'],
        ['8', 'Mongoose Model', 'Executes database queries with schema validation and lifecycle hooks'],
        ['9', 'Error Handler', 'Catches all unhandled errors and returns sanitised JSON responses']
    ]
));

children.push(heading('5.2 Backend Folder Structure', HeadingLevel.HEADING_2));
children.push(makeTable(
    ['Directory', 'Purpose', 'Key Files'],
    [
        ['src/config/', 'Configuration and external service setup', 'db.js (MongoDB), redis.js, stripe.js'],
        ['src/middleware/', 'Request pipeline middleware', 'auth.js, authorizeRoles.js, errorHandler.js, rateLimiter.js, sanitize.js, upload.js'],
        ['src/models/', '25 Mongoose Schema Definitions', 'User.js, Book.js, Chapter.js, Competition.js, QualifiedRead.js, AuthorEarnings.js, SubscriptionPlan.js, and 18 more'],
        ['src/controllers/', 'Request handlers', 'authController.js, bookController.js, chapterController.js, adminController.js, subscriptionController.js, webhookController.js'],
        ['src/services/', 'Business logic and integrations', 'emailService.js, paymentService.js, s3Service.js, readingService.js, notificationService.js'],
        ['src/routes/', 'Express route definitions', 'auth.js, books.js, users.js, admin.js, subscriptions.js, earnings.js, competitions.js, notifications.js, search.js'],
        ['src/utils/', 'Helper utilities', 'hashers.js (bcrypt), logger.js (Winston), dateHelpers.js'],
        ['tests/', 'Automated test suites', 'Jest + Supertest integration tests']
    ]
));

children.push(heading('5.3 Auth Middleware — Detailed Flow', HeadingLevel.HEADING_2));
children.push(para('The authentication middleware is the most critical security layer. Here is exactly how it processes each request:'));
children.push(makeTable(
    ['Step', 'Check', 'Outcome if Failed'],
    [
        ['1', 'Is the Authorization header present?', '401 Unauthorized — no token provided'],
        ['2', 'Extract Bearer token from the header', '401 Unauthorized — malformed header'],
        ['3', 'Verify JWT signature using secret key', '401 Unauthorized — invalid or expired token'],
        ['4', 'Check Redis blacklist for this token', '401 Token Revoked — user has logged out'],
        ['5', 'Decode payload (user ID + role)', 'Set req.user = decoded payload → proceed to route']
    ]
));

children.push(heading('5.4 Global Error Handler', HeadingLevel.HEADING_2));
children.push(para('All errors thrown anywhere in the application are caught by a centralised error handler. This prevents server crashes and ensures clients always receive a structured JSON response:'));
children.push(makeTable(
    ['Error Type', 'HTTP Status', 'Response'],
    [
        ['Mongoose ValidationError', '400 Bad Request', 'Returns field-by-field validation error array'],
        ['JWT Error (invalid/expired)', '401 Unauthorized', 'Token invalid or expired message'],
        ['CastError (invalid ObjectId)', '404 Not Found', 'Resource not found message'],
        ['Stripe Error', '402 Payment Required', 'Payment processing failed details'],
        ['Unhandled Error', '500 Internal Server Error', 'Generic error message (no stack trace in production)']
    ]
));

// ═══ SECTION 6: Database Schema ═══
children.push(pageBreak());
children.push(heading('6. Database Schema & Data Models'));
children.push(heading('6.1 Database Configuration', HeadingLevel.HEADING_2));
children.push(bulletBold('Database Type: ', 'MongoDB (NoSQL, Document Store)'));
children.push(bulletBold('Deployment: ', '3-Node Replica Set (1 Primary + 2 Secondaries)'));
children.push(bulletBold('ODM: ', 'Mongoose 8.x'));
children.push(bulletBold('Database Name: ', 'mozhibu'));
children.push(bulletBold('Total Collections: ', '25'));

children.push(heading('6.2 Core Collection Schemas', HeadingLevel.HEADING_2));

children.push(heading('User Collection', HeadingLevel.HEADING_3));
children.push(makeTable(
    ['Field', 'Type', 'Description'],
    [
        ['_id', 'ObjectId', 'Auto-generated primary key'],
        ['username', 'String (required)', 'Display name'],
        ['email', 'String (required, unique)', 'Login identifier'],
        ['mobile', 'String (required)', 'Phone number'],
        ['password', 'String (hashed)', 'bcrypt hashed — never returned in queries by default'],
        ['preferredLanguage', 'String', 'Selected reading language'],
        ['favoriteGenres', '[String]', 'Array of preferred genres'],
        ['penName', 'String (unique sparse)', 'Writer\'s pen name — only for writers'],
        ['role', 'Enum', '"reader" | "writer" | "superadmin"'],
        ['status', 'Enum', '"active" | "suspended" | "deactivated"'],
        ['isPremium', 'Boolean', 'Whether user has active subscription'],
        ['avatar', 'String', 'CDN URL to profile picture'],
        ['savedBooks', '[ObjectId → Book]', 'Bookmarked books'],
        ['following', '[ObjectId → User]', 'Authors the user follows'],
        ['monetization', 'Object', 'AES-256 encrypted bank details (accountNumber, IFSC, bankName)']
    ]
));

children.push(heading('Book Collection', HeadingLevel.HEADING_3));
children.push(makeTable(
    ['Field', 'Type', 'Description'],
    [
        ['_id', 'ObjectId', 'Primary key'],
        ['title', 'String (required)', 'Book title'],
        ['author', 'ObjectId → User', 'Reference to the writer who created this book'],
        ['cover', 'String', 'S3/CDN URL for cover image'],
        ['genre', 'String (required)', 'Primary genre category'],
        ['competitionTag', 'String', 'Links book to a Competition via matching tag'],
        ['status', 'Enum', '"draft" | "pending" | "published" | "rejected" | "suspended"'],
        ['accessType', 'Enum', '"free" | "premium"'],
        ['views', 'Number', 'Total view count'],
        ['likesCount', 'Number', 'Denormalised like count for fast queries'],
        ['likes', '[ObjectId → User]', 'Array of user IDs who liked this book'],
        ['reports', '[{ user, reason, comment }]', 'Content violation reports']
    ]
));

children.push(heading('Chapter Collection', HeadingLevel.HEADING_3));
children.push(makeTable(
    ['Field', 'Type', 'Description'],
    [
        ['_id', 'ObjectId', 'Primary key'],
        ['book', 'ObjectId → Book', 'Parent book reference'],
        ['title', 'String (required)', 'Chapter title'],
        ['content', 'String', 'Actual story text (large field)'],
        ['order', 'Number (required)', 'Reading sequence position'],
        ['status', 'Enum', '"draft" | "published" | "scheduled"'],
        ['accessType', 'Enum', '"inherit" | "free" | "premium"'],
        ['scheduledAt', 'Date', 'Future publish date for scheduled chapters']
    ]
));

children.push(heading('QualifiedRead Collection', HeadingLevel.HEADING_3));
children.push(para('This is the core analytics collection that powers the monetisation engine. A QualifiedRead is created every time a reader crosses the qualification threshold on a chapter:'));
children.push(makeTable(
    ['Field', 'Type', 'Description'],
    [
        ['user', 'ObjectId → User', 'The reader'],
        ['book', 'ObjectId → Book', 'The book being read'],
        ['chapter', 'ObjectId → Chapter', 'The specific chapter'],
        ['month / year', 'Number', 'Used for monthly aggregation in payout calculations'],
        ['timeOnPageSeconds', 'Number', 'How long the user spent on the chapter'],
        ['isQualified', 'Boolean', 'Whether this read counts toward author earnings'],
        ['isFraudFlag', 'Boolean', 'Anti-fraud detection flag']
    ]
));

// ═══ SECTION 7: ER Diagram ═══
children.push(pageBreak());
children.push(heading('7. Entity Relationship Diagram'));
children.push(heading('7.1 Master ER Diagram — All Collections', HeadingLevel.HEADING_2));
children.push(para('The following diagram shows how all 13 core entities in the Mozhibu database relate to each other. Each box represents a MongoDB collection, and the lines show the relationships between them.'));
children.push(emptyLine());

// ER Diagram as a structured table
children.push(heading('Entity Definitions', HeadingLevel.HEADING_3));
children.push(makeTable(
    ['Entity', 'Primary Key', 'Key Fields', 'Purpose'],
    [
        ['USERS', '_id (ObjectId)', 'username, email, role, isPremium, monetization', 'Core user account — readers, writers, and admins'],
        ['BOOKS', '_id (ObjectId)', 'author (FK→User), title, genre, status, accessType, competitionTag', 'Published stories created by writers'],
        ['CHAPTERS', '_id (ObjectId)', 'book (FK→Book), order, content, accessType, status', 'Individual chapters within a book'],
        ['COMPETITIONS', '_id (ObjectId)', 'tag, title, endDate, isActive', 'Time-bound writing contests'],
        ['QUALIFIED_READS', '_id (ObjectId)', 'user (FK→User), book (FK→Book), chapter (FK→Chapter), isQualified', 'Reading analytics for payout calculation'],
        ['AUTHOR_EARNINGS', '_id (ObjectId)', 'author (FK→User), amount, month, status', 'Monthly payout records per author'],
        ['SUBSCRIPTION_PLANS', '_id (ObjectId)', 'name, priceInPaise, durationDays, isActive', 'Available subscription tiers'],
        ['USER_SUBSCRIPTIONS', '_id (ObjectId)', 'user (FK→User), plan (FK→Plan), startDate, endDate', 'Active user subscription records'],
        ['READING_PROGRESS', '_id (ObjectId)', 'user (FK→User), book (FK→Book), lastChapter, percentage', 'Cross-device reading sync'],
        ['REVIEWS', '_id (ObjectId)', 'user (FK→User), book (FK→Book), rating, comment', 'User book reviews and ratings'],
        ['REPORTS', '_id (ObjectId)', 'reporter (FK→User), book (FK→Book), reason, status', 'Content violation reports'],
        ['NOTIFICATIONS', '_id (ObjectId)', 'recipient (FK→User), type, isRead', 'In-app and push notification records'],
        ['ENGAGEMENT_SCORE', '_id (ObjectId)', 'book (FK→Book), score, month', 'Monthly engagement metric per book']
    ]
));

children.push(heading('7.2 Relationship Map', HeadingLevel.HEADING_3));
children.push(para('The following table documents every relationship between entities, showing how data flows through the system:'));
children.push(makeTable(
    ['From Entity', 'Relationship', 'To Entity', 'Meaning'],
    [
        ['USERS', 'One → Many', 'BOOKS', 'A writer creates multiple books'],
        ['USERS', 'One → Many', 'REVIEWS', 'A user submits reviews on books'],
        ['USERS', 'One → Many', 'QUALIFIED_READS', 'A reader generates qualified reads'],
        ['USERS', 'One → Many', 'READING_PROGRESS', 'Each user has reading progress per book'],
        ['USERS', 'One → Many', 'USER_SUBSCRIPTIONS', 'A user purchases subscriptions'],
        ['USERS', 'One → Many', 'AUTHOR_EARNINGS', 'A writer receives monthly earnings'],
        ['USERS', 'One → Many', 'NOTIFICATIONS', 'Each user receives notifications'],
        ['USERS', 'One → Many', 'REPORTS', 'A user files content reports'],
        ['USERS', 'Many ↔ Many', 'USERS', 'Users follow other users (self-referencing)'],
        ['BOOKS', 'One → Many', 'CHAPTERS', 'A book contains multiple chapters'],
        ['BOOKS', 'One → Many', 'REVIEWS', 'A book has multiple reviews'],
        ['BOOKS', 'One → Many', 'QUALIFIED_READS', 'Reads are tracked per book'],
        ['BOOKS', 'One → Many', 'READING_PROGRESS', 'Progress is tracked per book'],
        ['BOOKS', 'One → Many', 'ENGAGEMENT_SCORE', 'Engagement scored monthly per book'],
        ['BOOKS', 'Many → One', 'COMPETITIONS', 'Books are entered in competitions via tag'],
        ['CHAPTERS', 'One → Many', 'QUALIFIED_READS', 'Reads are qualified per chapter'],
        ['SUBSCRIPTION_PLANS', 'One → Many', 'USER_SUBSCRIPTIONS', 'Plans define subscription terms']
    ]
));

children.push(heading('7.3 Revenue & Monetisation Flow', HeadingLevel.HEADING_2));
children.push(para('This step-by-step flow explains exactly how money moves from readers to authors:'));
children.push(makeTable(
    ['Step', 'Action', 'System Behaviour'],
    [
        ['1', 'Reader subscribes (₹99/month)', 'Stripe charges the reader\'s card. UserSubscription record created. User.isPremium set to true.'],
        ['2', 'Reader reads premium chapters', 'Reading progress tracked in real-time via heartbeat API calls every 60 seconds.'],
        ['3', 'Time-on-page threshold check', 'If time > threshold → QualifiedRead created (isQualified=true). If time < threshold → isFraudFlag=true (ignored in payout).'],
        ['4', 'Month-End Cron Job fires', 'Automated job aggregates all QualifiedReads for the month across all books and authors.'],
        ['5', 'Revenue split calculation', 'Platform retains 30%. Remaining 70% is distributed proportionally based on each author\'s share of total qualified reads.'],
        ['6', 'AuthorEarnings record created', 'Each author gets an earnings record with their calculated amount.'],
        ['7', 'KYC check', 'If author has completed bank details (KYC) → Stripe Connect transfer initiated. If not → status set to "pending_setup" and reminder email sent.']
    ]
));

// ═══ SECTION 8: API Architecture ═══
children.push(pageBreak());
children.push(heading('8. API Architecture & Routing'));
children.push(heading('8.1 API Overview', HeadingLevel.HEADING_2));
children.push(bulletBold('Base URL (Dev): ', 'http://localhost:3000/api/v1'));
children.push(bulletBold('Base URL (Prod): ', 'https://api.mozhibu.com/api/v1'));
children.push(bulletBold('Request Format: ', 'application/json (or multipart/form-data for uploads)'));
children.push(bulletBold('Response Format: ', 'Standard Envelope: { success, data, message, error }'));
children.push(bulletBold('Authentication: ', 'Authorization: Bearer <JWT>'));

children.push(heading('8.2 Authentication Routes — /api/v1/auth', HeadingLevel.HEADING_2));
children.push(makeTable(
    ['Method', 'Endpoint', 'Auth', 'Description'],
    [
        ['POST', '/auth/register', 'Public', 'Create account, hash password, return JWT'],
        ['POST', '/auth/login', 'Public (Rate Limited)', 'Authenticate, return JWT + user profile'],
        ['POST', '/auth/google', 'Public', 'OAuth 2.0 Google login'],
        ['POST', '/auth/facebook', 'Public', 'OAuth 2.0 Facebook login'],
        ['GET', '/auth/verify-email/:token', 'Public', 'Verify email address'],
        ['POST', '/auth/forgot-password', 'Public', 'Send reset email'],
        ['PUT', '/auth/reset-password/:token', 'Public', 'Reset password with token'],
        ['POST', '/auth/logout', 'Bearer Token', 'Blacklist JWT in Redis']
    ]
));
children.push(heading('8.3 Book Routes — /api/v1/books', HeadingLevel.HEADING_2));
children.push(makeTable(
    ['Method', 'Endpoint', 'Auth', 'Description'],
    [
        ['GET', '/books', 'Public', 'Paginated book list with genre, language, and status filters'],
        ['GET', '/books/:id', 'Public', 'Single book detail with author info and chapter count'],
        ['POST', '/books', 'Writer + Multer', 'Create new book with cover image upload'],
        ['PUT', '/books/:id', 'Writer (owner)', 'Update book metadata (title, genre, description)'],
        ['DELETE', '/books/:id', 'Writer (owner)', 'Delete book and cascade-delete all chapters'],
        ['POST', '/books/:id/like', 'Bearer', 'Toggle like (atomic $addToSet / $pull)'],
        ['POST', '/books/:id/bookmark', 'Bearer', 'Toggle bookmark to savedBooks array'],
        ['POST', '/books/:id/report', 'Bearer', 'Submit content violation report']
    ]
));
children.push(heading('8.4 User Routes — /api/v1/users', HeadingLevel.HEADING_2));
children.push(makeTable(
    ['Method', 'Endpoint', 'Auth', 'Description'],
    [
        ['GET', '/users/me', 'Bearer', 'Own profile + saved books + following list'],
        ['PUT', '/users/me', 'Bearer', 'Update profile, upload new avatar'],
        ['PUT', '/users/me/monetization', 'Writer', 'Submit/update encrypted bank details (KYC)'],
        ['POST', '/users/me/follow/:id', 'Bearer', 'Follow an author'],
        ['DELETE', '/users/me/follow/:id', 'Bearer', 'Unfollow an author'],
        ['GET', '/users/:id/profile', 'Public', 'View author\'s public profile and published books']
    ]
));
children.push(heading('8.5 Subscription & Admin Routes', HeadingLevel.HEADING_2));
children.push(makeTable(
    ['Method', 'Endpoint', 'Auth', 'Description'],
    [
        ['GET', '/subscriptions/plans', 'Public', 'List all active subscription plans'],
        ['POST', '/subscriptions/purchase', 'Bearer', 'Create Stripe PaymentIntent for subscription'],
        ['GET', '/subscriptions/my-subscription', 'Bearer', 'Get active subscription details'],
        ['GET', '/admin/users', 'Superadmin', 'List all users with pagination and filters'],
        ['PUT', '/admin/users/:id/suspend', 'Superadmin', 'Suspend a user account'],
        ['PUT', '/admin/users/:id/role', 'Superadmin', 'Change user role (promote/demote)'],
        ['GET', '/admin/reports', 'Superadmin', 'List all content reports for moderation'],
        ['POST', '/admin/competitions', 'Superadmin', 'Create a new competition']
    ]
));

children.push(heading('8.6 Standard Response Envelope', HeadingLevel.HEADING_2));
children.push(para('All API responses follow a consistent JSON envelope structure for predictable client-side parsing:'));
children.push(makeTable(
    ['Field', 'Type', 'Description'],
    [
        ['success', 'Boolean', 'true for 2xx responses, false for 4xx/5xx'],
        ['message', 'String', 'Human-readable status message'],
        ['data', 'Object / Array', 'The requested resource(s)'],
        ['pagination', 'Object', 'total, page, limit, pages (for list endpoints)'],
        ['error', 'String', 'Error description (only on failure)'],
        ['code', 'Number', 'HTTP status code']
    ]
));
children.push(heading('8.7 HTTP Status Code Standards', HeadingLevel.HEADING_2));
children.push(makeTable(
    ['Code', 'Meaning', 'When Used'],
    [
        ['200 OK', 'Success', 'Successful GET or PUT operations'],
        ['201 Created', 'Resource created', 'Successful POST creating a new document'],
        ['400 Bad Request', 'Validation error', 'Missing required fields or invalid format'],
        ['401 Unauthorized', 'Authentication failed', 'Missing or expired JWT token'],
        ['402 Payment Required', 'Payment error', 'Stripe card declined or payment failed'],
        ['403 Forbidden', 'Insufficient role', 'Reader trying to access Writer/Admin endpoint'],
        ['404 Not Found', 'Resource missing', 'Invalid ObjectId or deleted document'],
        ['429 Too Many Requests', 'Rate limited', 'Redis rate limit exceeded (100 req/15 min)'],
        ['500 Internal Server Error', 'Server crash', 'Unhandled exception (logged to Winston)']
    ]
));

// ═══ SECTION 9: Test Cases ═══
children.push(pageBreak());
children.push(heading('9. Test Case Documentation'));
children.push(heading('9.1 Testing Strategy Overview', HeadingLevel.HEADING_2));
children.push(para('The platform employs three levels of testing executed automatically in the CI/CD pipeline. This ensures that every code change is validated before deployment:'));
children.push(makeTable(
    ['Level', 'Tool', 'Coverage', 'Purpose'],
    [
        ['Unit Tests (Most)', 'Jest', 'Individual functions and services', 'Validate isolated business logic — e.g., QualifiedRead calculation, revenue split math'],
        ['Integration Tests (Medium)', 'Supertest', 'Full HTTP request → response cycle', 'Test actual API routes with a real MongoDB test database'],
        ['E2E Tests (Fewest)', 'Cypress', 'Complete user flows in a browser', 'Simulate reader login → book discovery → subscription → reading → chapter unlock']
    ]
));

children.push(heading('9.2 Authentication & Security Test Cases', HeadingLevel.HEADING_2));
children.push(makeTable(
    ['Test ID', 'Scenario', 'Expected Result', 'Type'],
    [
        ['TC-AUTH-001', 'Valid email + password login', '200 OK + signed JWT returned', 'Integration'],
        ['TC-AUTH-002', 'Login with incorrect password', '401 Unauthorized', 'Integration'],
        ['TC-AUTH-003', '6th login attempt within 15 minutes', '429 Too Many Requests (Redis limit)', 'Integration'],
        ['TC-AUTH-004', 'Access protected route with no JWT', '401 Unauthorized — redirect to /login', 'E2E'],
        ['TC-AUTH-005', 'Reader role accesses /admin route', '403 Forbidden — AdminModule never loaded', 'E2E'],
        ['TC-AUTH-006', 'JWT token expired (24hrs old)', '401 Unauthorized — frontend clears localStorage', 'Integration'],
        ['TC-AUTH-007', 'Logout — use same token again', '401 Token Revoked (Redis blacklist check)', 'Integration'],
        ['TC-AUTH-008', 'Register with duplicate email', '400 Bad Request — Mongo unique index error', 'Integration']
    ]
));
children.push(heading('9.3 Content Publishing Test Cases', HeadingLevel.HEADING_2));
children.push(makeTable(
    ['Test ID', 'Scenario', 'Expected Result', 'Type'],
    [
        ['TC-PUB-001', 'Create book missing required genre field', '400 Bad Request + validation error array', 'Integration'],
        ['TC-PUB-002', 'Upload cover image that is a disguised .exe', '415 Unsupported Media Type (magic byte check)', 'Integration'],
        ['TC-PUB-003', 'Upload cover image larger than 5MB', '400 Bad Request — Multer file size limit', 'Integration'],
        ['TC-PUB-004', 'Publish chapter to non-owned book', '403 Forbidden — ownership check fails', 'Integration'],
        ['TC-PUB-005', 'Publish chapter successfully', '201 Created + FCM push to followers triggered', 'E2E']
    ]
));
children.push(heading('9.4 Reading, Progress & Monetisation Test Cases', HeadingLevel.HEADING_2));
children.push(makeTable(
    ['Test ID', 'Scenario', 'Expected Result', 'Type'],
    [
        ['TC-READ-001', 'Free reader accesses free chapter', '200 OK — full content returned', 'Integration'],
        ['TC-READ-002', 'Free reader accesses premium chapter', '403 + content field stripped from response', 'Integration'],
        ['TC-READ-003', 'Reader reads chapter for 90 seconds', 'QualifiedRead created: isQualified=true', 'Unit'],
        ['TC-READ-004', 'Reader reads chapter for 10 seconds', 'QualifiedRead: isFraudFlag=true, isQualified=false', 'Unit'],
        ['TC-READ-005', 'Valid Stripe webhook fires (payment succeeded)', 'User.isPremium=true, UserSubscription created', 'Integration'],
        ['TC-READ-006', 'Month-end Cron runs with zero qualified reads', 'AuthorEarnings: amount=0, no Stripe transfer', 'Unit'],
        ['TC-READ-007', 'Author has no KYC, Cron runs', 'AuthorEarnings: status=pending_setup, email sent', 'Integration']
    ]
));
children.push(heading('9.5 Competition Module Test Cases', HeadingLevel.HEADING_2));
children.push(makeTable(
    ['Test ID', 'Scenario', 'Expected Result', 'Type'],
    [
        ['TC-CMP-001', 'Submit book with correct competition tag', 'Book linked to competition, appears on leaderboard', 'Integration'],
        ['TC-CMP-002', 'Submit book after competition endDate', '400 Bad Request — server UTC time used, not client', 'Integration'],
        ['TC-CMP-003', 'Two users like a competition entry simultaneously', 'Both IDs added correctly ($addToSet, atomic)', 'Unit'],
        ['TC-CMP-004', 'Admin sets winnerBookIds on a competition', 'Winners displayed on homepage, competition marked closed', 'E2E']
    ]
));

// ═══ APPENDIX ═══
children.push(pageBreak());
children.push(heading('Appendix'));
children.push(heading('A. Environment Variables', HeadingLevel.HEADING_2));
children.push(makeTable(
    ['Variable', 'Description', 'Example'],
    [
        ['MONGO_URI', 'MongoDB connection string', 'mongodb+srv://...'],
        ['JWT_SECRET', 'JWT signing secret', '256-bit random string'],
        ['STRIPE_SECRET_KEY', 'Stripe API secret', 'sk_live_...'],
        ['STRIPE_WEBHOOK_SECRET', 'Webhook signature verification', 'whsec_...'],
        ['AWS_S3_BUCKET', 'S3 bucket name for media', 'mozhibu-media'],
        ['REDIS_URL', 'Redis connection URL', 'redis://localhost:6379'],
        ['FCM_SERVER_KEY', 'Firebase server key', 'AAAA...'],
        ['SENDGRID_API_KEY', 'Email service API key', 'SG....']
    ]
));
children.push(heading('B. Glossary', HeadingLevel.HEADING_2));
children.push(makeTable(
    ['Term', 'Definition'],
    [
        ['QualifiedRead', 'A reading session where the user spent enough time on a chapter to count toward the author\'s payout. Anti-fraud threshold is applied.'],
        ['Engagement Score', 'A calculated metric combining views, likes, qualified reads, and bookmarks. Used for leaderboard ranking and discovery algorithms.'],
        ['isPremium', 'A boolean flag on the User model indicating they have an active subscription with access to locked premium chapters.'],
        ['competitionTag', 'A string on the Book model matching a Competition\'s tag field, linking the book to that specific writing contest.'],
        ['RevenueSplitConfig', 'A configurable system document defining the platform\'s percentage cut vs. the author pool percentage (default: 30/70).'],
        ['Oplog', 'MongoDB\'s operations log used to replicate write operations from Primary to Secondary nodes in real time for high availability.']
    ]
));

// ═══ Shared page properties ═══
const pageProps = {
    page: {
        size: {
            width: 11906,   // A4 width in twips (210mm)
            height: 16838,  // A4 height in twips (297mm)
            orientation: 'portrait'
        },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
    }
};

// Split children: cover page vs rest
const coverChildren = [];
// Find the first pageBreak index to separate cover
let splitIdx = 0;
for (let i = 0; i < children.length; i++) {
    // PageBreak paragraphs have no text runs with actual text before the TOC
    if (children[i] && children[i].options && children[i].options.children) {
        const c = children[i].options.children;
        if (c.length === 1 && c[0] instanceof PageBreak) {
            splitIdx = i;
            break;
        }
    }
}
// If we couldn't find the split, just use index based on our known structure
// Cover page is roughly the first ~15 elements (8 empty lines + title + subtitle + version + prepared + classification + 6 empty + company + address)
if (splitIdx === 0) splitIdx = 17;

const coverContent = children.slice(0, splitIdx);
const mainContent = children.slice(splitIdx);

// ═══ Create the Document ═══
const doc = new Document({
    sections: [
        {
            properties: { ...pageProps },
            headers: {
                default: new Header({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [new ImageRun({ data: headerImg, transformation: { width: 452, height: 60 }, type: 'png' })]
                        })
                    ]
                })
            },
            footers: {
                default: new Footer({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [new ImageRun({ data: footerImg, transformation: { width: 328, height: 21 }, type: 'png' })]
                        })
                    ]
                })
            },
            children: coverContent
        },
        {
            properties: { ...pageProps },
            headers: {
                default: new Header({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [new ImageRun({ data: headerImg, transformation: { width: 452, height: 60 }, type: 'png' })]
                        })
                    ]
                })
            },
            footers: {
                default: new Footer({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [new ImageRun({ data: footerImg, transformation: { width: 328, height: 21 }, type: 'png' })]
                        })
                    ]
                })
            },
            children: mainContent
        }
    ]
});

// ═══ Write to File ═══
(async () => {
    console.log('Generating Word document...');
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(path.join(__dirname, 'mozhibu-complete documentation.docx'), buffer);
    console.log('Successfully created mozhibu-complete documentation.docx (' + Math.round(buffer.length / 1024) + ' KB)');
})();

