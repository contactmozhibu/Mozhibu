import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-layout">
      <!-- Hero Section -->
      <div class="hero">
        <div class="hero-content wrap">
          <h1>Privacy Policy</h1>
        </div>
        <div class="hero-bg"></div>
      </div>

      <!-- Content -->
      <div class="content-section wrap">
        <div class="policy-container">
          
          <div class="policy-block">
            <p>
              Mozhibu (“Company”, “we”, “us”, or “our”) respects the privacy of users (“User”, “you”, or “your”) who access or use our website and services (“Services”). This Privacy Policy explains what information we collect, how we use it, how it is stored and secured, and when it may be shared with third parties.
            </p>
            <p>
              By accessing or using mozhibu.com, you acknowledge that you have read and understood this Privacy Policy.
            </p>
          </div>

          <div class="policy-block">
            <h2>What information does Mozhibu collect?</h2>
            <p>
              To provide our Services to Users and continuously improve the User experience, Mozhibu may collect personally identifiable information and non-personally identifiable information provided by or associated with the User.
            </p>
            
            <div class="info-table">
              <div class="table-row header">
                <div class="col-type">Type of Information</div>
                <div class="col-desc">Includes</div>
              </div>
              <div class="table-row">
                <div class="col-type"><strong>Registration / Login Data</strong></div>
                <div class="col-desc">Name, email address, mobile number, account credentials, and information required to create and manage your account.</div>
              </div>
              <div class="table-row">
                <div class="col-type"><strong>Profile / Business Data</strong></div>
                <div class="col-desc">Business name, entity details, business address, contact information, and other business-related information provided through our Services.</div>
              </div>
              <div class="table-row">
                <div class="col-type"><strong>Service / Application Data</strong></div>
                <div class="col-desc">Information submitted while requesting or applying for services through the Mozhibu platform, including incorporation, trademark, copyright, patent, compliance, and other related services.</div>
              </div>
              <div class="table-row">
                <div class="col-type"><strong>Document Data</strong></div>
                <div class="col-desc">Documents uploaded by Users, which may include PAN, Aadhaar, address proof, photographs, signatures, certificates, and other documents required for processing requested Services.</div>
              </div>
              <div class="table-row">
                <div class="col-type"><strong>Usage Data</strong></div>
                <div class="col-desc">Information relating to how you access and use our website, including pages visited, features used, actions performed, and interactions with our Services.</div>
              </div>
              <div class="table-row">
                <div class="col-type"><strong>Device Data</strong></div>
                <div class="col-desc">IP address, browser type, operating system, device information, and technical information associated with accessing our website.</div>
              </div>
              <div class="table-row">
                <div class="col-type"><strong>Payment Data</strong></div>
                <div class="col-desc">Payment status, transaction reference, payment method, and other information required to process and verify payments. Payment card or banking details may be processed directly by authorized payment service providers.</div>
              </div>
              <div class="table-row">
                <div class="col-type"><strong>Customer Support Data</strong></div>
                <div class="col-desc">Information provided when you contact Mozhibu, including inquiries, requests, complaints, feedback, and other communications.</div>
              </div>
            </div>
            
            <p class="highlight-box">
              Mozhibu collects information that is reasonably necessary to provide, maintain, secure, and improve its Services.
            </p>
          </div>

          <div class="policy-block">
            <h2>What does Mozhibu use the collected User Information for?</h2>
            <p>Mozhibu may use User Information to:</p>
            <ul class="styled-list">
              <li>Create and manage User accounts and provide access to our Services.</li>
              <li>Process service applications, business information, documents, payments, and related requests.</li>
              <li>Verify information and documents submitted by Users where necessary for service processing.</li>
              <li>Communicate with Users regarding applications, service status, payments, renewals, notifications, and important account information.</li>
              <li>Provide customer support and respond to User inquiries.</li>
              <li>Maintain the security, functionality, and reliability of our website.</li>
              <li>Improve our Services, website functionality, and User experience.</li>
              <li>Detect, prevent, and investigate unauthorized access, fraud, misuse, or security incidents.</li>
              <li>Comply with applicable laws, regulations, legal processes, and governmental requirements.</li>
            </ul>
          </div>

          <div class="policy-block">
            <h2>Can any third party access the User Information?</h2>
            <p>Mozhibu does not sell or rent User Information to third parties.</p>
            <p>User Information may be shared with or accessed by trusted third-party service providers where reasonably necessary to provide, operate, maintain, or secure our Services.</p>
            
            <div class="partner-grid">
              <div class="partner-card">
                <div class="icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                </div>
                <h4>Analytics Services</h4>
                <p>Analytics providers may be used to understand website usage and improve the performance and User experience of our Services.</p>
              </div>
              <div class="partner-card">
                <div class="icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                </div>
                <h4>Notification Services</h4>
                <p>Service providers may be used to send service-related communications, notifications, emails, SMS, or other permitted communications.</p>
              </div>
              <div class="partner-card">
                <div class="icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                </div>
                <h4>Payment Providers</h4>
                <p>Payment providers may process and verify payments and transactions initiated through our Services.</p>
              </div>
              <div class="partner-card">
                <div class="icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
                </div>
                <h4>Cloud & Hosting</h4>
                <p>Authorized providers may provide hosting, storage, database, backup, and infrastructure services required to operate the platform.</p>
              </div>
              <div class="partner-card">
                <div class="icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <h4>Compliance Partners</h4>
                <p>Where necessary, relevant information may be shared with authorized personnel or service partners to process the Services requested by the User.</p>
              </div>
              <div class="partner-card">
                <div class="icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>
                </div>
                <h4>Govt. Authorities</h4>
                <p>Information may be disclosed where required by applicable law, regulation, court order, or governmental authority.</p>
              </div>
            </div>
            
            <p class="mt-4 text-faint">
              Third-party service providers are expected to handle User Information in accordance with applicable privacy, security, and confidentiality requirements.
            </p>
          </div>

          <div class="policy-block">
            <h2>Where is the User Information stored and how is it secured?</h2>
            <p>User Information may be stored on secure servers, databases, and cloud infrastructure operated by Mozhibu or its authorized service providers.</p>
            <p>Mozhibu takes reasonable technical and organizational measures to protect User Information against unauthorized access, alteration, disclosure, loss, or misuse.</p>
            
            <p>These measures may include:</p>
            <div class="tags-container">
              <span class="tag">Secure authentication mechanisms</span>
              <span class="tag">Access controls and authorization</span>
              <span class="tag">Encryption where appropriate</span>
              <span class="tag">Secure database and server configurations</span>
              <span class="tag">Restricted access to sensitive documents</span>
              <span class="tag">Security monitoring</span>
            </div>
            
            <p class="highlight-box warning">
              However, no method of electronic transmission or storage can be guaranteed to be completely secure. Users are also responsible for keeping their account credentials confidential and taking reasonable precautions to protect their information.
            </p>
          </div>

          <div class="policy-block">
            <h2>How is the User Information collected and what are the opt-out options?</h2>
            <p>User Information may be collected through:</p>
            <ul class="styled-list">
              <li><strong>User-Provided Information:</strong> Information voluntarily provided when registering, creating a profile, submitting service applications, uploading documents, making payments, or contacting Mozhibu.</li>
              <li><strong>Cookies and Similar Technologies:</strong> Cookies and similar technologies may be used to maintain sessions, remember preferences, understand website usage, and improve website functionality.</li>
              <li><strong>API Calls and System Integrations:</strong> Information may be received or exchanged through authorized APIs and integrations required to provide certain Services.</li>
            </ul>
            <p>
              Where applicable, Users may control or disable cookies through their browser settings. Certain cookies may be necessary for the website to function properly.
            </p>
            <p>
              Users may also opt out of non-essential promotional communications by using the unsubscribe option provided in the communication or by contacting Mozhibu.
            </p>
          </div>

          <div class="policy-block">
            <h2>How long does Mozhibu retain User Information?</h2>
            <p>Mozhibu retains User Information for as long as reasonably necessary to:</p>
            <ul class="styled-list">
              <li>Provide the requested Services.</li>
              <li>Maintain User accounts and service records.</li>
              <li>Complete transactions and service applications.</li>
              <li>Comply with legal, regulatory, accounting, or reporting requirements.</li>
              <li>Resolve disputes and enforce applicable agreements.</li>
              <li>Maintain security and prevent misuse.</li>
            </ul>
            <p>
              When information is no longer required, Mozhibu may securely delete, anonymize, or otherwise dispose of it in accordance with applicable requirements.
            </p>
          </div>

          <div class="policy-block">
            <h2>User Rights</h2>
            <p>Subject to applicable laws and regulations, Users may have the right to:</p>
            <div class="rights-grid">
              <div class="right-item">
                <span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></span>
                Request access to their personal information.
              </div>
              <div class="right-item">
                <span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></span>
                Request correction of inaccurate or incomplete information.
              </div>
              <div class="right-item">
                <span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg></span>
                Request deletion of information where legally permitted.
              </div>
              <div class="right-item">
                <span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></span>
                Withdraw consent where processing is based on consent.
              </div>
              <div class="right-item">
                <span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></span>
                Request information about how their personal information is processed.
              </div>
              <div class="right-item">
                <span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><polyline points="14 2 14 8 20 8"/><path d="M3 15h6"/><path d="m6 12-3 3 3 3"/></svg></span>
                Raise concerns regarding the handling of their personal information.
              </div>
            </div>
            <p class="mt-4">
              To exercise an applicable privacy right, Users may contact Mozhibu using the contact details provided below.
            </p>
          </div>

          <div class="policy-block">
            <h2>Children's Privacy</h2>
            <p>
              Our Services are not intended for children who are below the applicable legal age to use such services independently.
            </p>
            <p>
              Mozhibu does not knowingly collect personal information from children in violation of applicable law. If you believe that a child has provided personal information to us, please contact us so that appropriate action can be taken.
            </p>
          </div>

          <div class="policy-block">
            <h2>Changes to this Privacy Policy</h2>
            <p>
              Mozhibu may update this Privacy Policy from time to time to reflect changes in our Services, technology, legal requirements, or privacy practices.
            </p>
            <p>
              Any updated version will be published on this page with a revised Effective Date. Users are encouraged to review this Privacy Policy periodically.
            </p>
          </div>

          <div class="policy-block contact-block">
            <h2>Contact Us</h2>
            <p>If you have any questions, concerns, or requests regarding this Privacy Policy or the handling of your personal information, please contact us:</p>
            
            <div class="contact-details">
              <div><strong>Company:</strong> Mozhibu</div>
              <div><strong>Email:</strong> <a href="mailto:contactmozhibu&#64;gmail.com">contactmozhibu&#64;gmail.com</a></div>
              <div><strong>Website:</strong> <a href="https://mozhibu.com">mozhibu.com</a></div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        background: var(--paper);
        color: var(--ink);
      }
      
      .page-layout {
        padding-top: 80px;
      }
      
      /* Hero Section */
      .hero {
        position: relative;
        padding: 80px 24px;
        background: var(--ink);
        color: var(--paper);
        text-align: center;
        overflow: hidden;
      }
      .hero-content {
        position: relative;
        z-index: 2;
        max-width: 800px;
        margin: 0 auto;
      }
      .hero h1 {
        font-family: var(--display);
        font-size: 48px;
        font-weight: 800;
        margin: 0 0 16px 0;
        letter-spacing: -0.02em;
        line-height: 1.1;
      }
      .hero p {
        font-size: 18px;
        color: var(--paper-warm);
        margin: 0;
      }
      .hero-bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(
          circle at top right,
          var(--forest-deep),
          transparent 60%
        );
        opacity: 0.3;
        z-index: 1;
      }
      
      /* Content */
      .content-section {
        padding: 60px 24px;
        background: var(--paper);
      }
      .policy-container {
        max-width: 800px;
        margin: 0 auto;
      }
      .policy-block {
        margin-bottom: 48px;
      }
      .policy-block h2 {
        font-family: var(--display);
        font-size: 28px;
        font-weight: 700;
        color: var(--ink);
        margin-bottom: 24px;
        padding-bottom: 12px;
        border-bottom: 2px solid var(--border-soft);
      }
      .policy-block p {
        font-size: 16px;
        line-height: 1.7;
        color: var(--ink-soft);
        margin-bottom: 16px;
      }
      
      /* Table */
      .info-table {
        margin: 24px 0;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid var(--border-soft);
      }
      .table-row {
        display: flex;
        border-bottom: 1px solid var(--border-soft);
        background: var(--paper);
      }
      .table-row:last-child {
        border-bottom: none;
      }
      .table-row.header {
        background: var(--paper-warm);
        font-weight: 700;
        color: var(--ink);
      }
      .col-type {
        flex: 0 0 30%;
        padding: 16px;
        border-right: 1px solid var(--border-soft);
        font-size: 14px;
        color: var(--ink);
      }
      .col-desc {
        flex: 1;
        padding: 16px;
        font-size: 14px;
        color: var(--ink-soft);
        line-height: 1.6;
      }
      
      /* Lists */
      .styled-list {
        list-style: none;
        padding: 0;
        margin: 0 0 24px 0;
      }
      .styled-list li {
        position: relative;
        padding-left: 28px;
        margin-bottom: 12px;
        font-size: 16px;
        line-height: 1.6;
        color: var(--ink-soft);
      }
      .styled-list li::before {
        content: "→";
        position: absolute;
        left: 0;
        top: 0;
        color: var(--forest);
        font-weight: bold;
      }
      
      /* Partner Grid */
      .partner-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 20px;
        margin: 24px 0;
      }
      .partner-card {
        background: var(--paper-warm);
        border: 1px solid var(--border-soft);
        padding: 24px;
        border-radius: 12px;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .partner-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(0,0,0,0.05);
        border-color: var(--forest-tint);
      }
      .partner-card .icon {
        color: var(--forest);
        margin-bottom: 16px;
      }
      .partner-card .icon svg {
        width: 28px;
        height: 28px;
      }
      .partner-card h4 {
        font-family: var(--display);
        font-size: 16px;
        margin: 0 0 8px 0;
        color: var(--ink);
      }
      .partner-card p {
        font-size: 13px !important;
        margin: 0 !important;
        line-height: 1.5 !important;
      }
      
      /* Tags */
      .tags-container {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin: 24px 0;
      }
      .tag {
        background: var(--forest-tint);
        color: var(--forest-deep);
        padding: 8px 16px;
        border-radius: 100px;
        font-size: 14px;
        font-weight: 500;
      }
      
      /* Rights Grid */
      .rights-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 16px;
        margin: 24px 0;
      }
      .right-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 16px;
        background: var(--paper-warm);
        border-radius: 8px;
        font-size: 14px;
        color: var(--ink-soft);
        line-height: 1.5;
      }
      .right-item span {
        color: var(--forest);
        display: flex;
        align-items: center;
      }
      
      /* Highlight boxes */
      .highlight-box {
        background: var(--forest-tint);
        padding: 16px 20px;
        border-radius: 8px;
        color: var(--forest-deep) !important;
        font-weight: 500;
        margin: 24px 0 !important;
      }
      .highlight-box.warning {
        background: #fffbeb;
        color: #b45309 !important;
      }
      
      /* Contact block */
      .contact-block {
        background: var(--paper-warm);
        padding: 32px;
        border-radius: 16px;
        border: 1px solid var(--border-soft);
      }
      .contact-block h2 {
        border: none;
        padding: 0;
      }
      .contact-details {
        margin-top: 24px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .contact-details div {
        font-size: 16px;
        color: var(--ink-soft);
      }
      .contact-details strong {
        color: var(--ink);
        display: inline-block;
        width: 100px;
      }
      .contact-details a {
        color: var(--forest);
        text-decoration: none;
        font-weight: 500;
      }
      .contact-details a:hover {
        text-decoration: underline;
      }
      
      .mt-4 {
        margin-top: 24px !important;
      }
      .text-faint {
        color: var(--ink-faint) !important;
      }
      
      @media (max-width: 768px) {
        .hero {
          padding: 60px 16px;
        }
        .hero h1 {
          font-size: 36px;
        }
        .content-section {
          padding: 40px 16px;
        }
        .table-row {
          flex-direction: column;
        }
        .col-type {
          border-right: none;
          border-bottom: 1px dashed var(--border-soft);
          padding: 12px 16px;
        }
      }
    
      /* Universal Mobile Fixes injected automatically */
      @media (max-width: 768px) {
        .hero { padding: 40px 16px !important; }
        .hero h1 { font-size: 28px !important; line-height: 1.2 !important; }
        .hero p { font-size: 16px !important; }
        
        .content-section, .wrap { padding: 24px 16px !important; }
        
        .policy-block h2, .section h2 { font-size: 22px !important; margin-top: 24px !important; margin-bottom: 16px !important; }
        .policy-block h3, .section h3 { font-size: 18px !important; }
        
        p, li, .right-item, .contact-details div { font-size: 15px !important; line-height: 1.6 !important; }
        
        .partner-grid, .rights-grid, .values-grid, .features-grid, .grid { 
          grid-template-columns: 1fr !important; 
          gap: 16px !important; 
        }
        
        .icon, .feature-icon, .value-icon {
          width: 40px !important;
          height: 40px !important;
        }
        .icon svg, .feature-icon svg, .value-icon svg {
          width: 20px !important;
          height: 20px !important;
        }
        
        .partner-card, .value-card, .feature-card {
          padding: 20px !important;
        }
        
        .table-row {
          flex-direction: column !important;
        }
        .col-type, .col-desc {
          width: 100% !important;
          padding: 12px !important;
        }
        .col-type {
          border-right: none !important;
          border-bottom: 1px dashed var(--border-soft) !important;
          background: var(--paper-warm) !important;
        }
      }
`
  ]
})
export class PrivacyPolicyComponent {}
