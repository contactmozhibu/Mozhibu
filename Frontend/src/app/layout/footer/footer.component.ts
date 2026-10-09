import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <footer class="site-footer">
      <div class="footer-container">
        <div class="footer-brand">
          <div class="logo">
            <img
              src="assets/Mozhibu%20topbarcropednewLogo%20(1).png"
              alt="Mozhibu logo"
              class="logo-img"
            />Mozhibu
          </div>
          <p class="brand-desc">
            {{ "footer.tagline" | translate }}
          </p>
          <div class="social-links">
            <a href="#" aria-label="Twitter">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"
                ></path>
              </svg>
            </a>
            <a href="https://www.instagram.com/contactmozhibu/" target="_blank" aria-label="Instagram">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path
                  d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"
                ></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="https://www.facebook.com/people/Mozhibu/61590620288523/" target="_blank" aria-label="Facebook">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"
                ></path>
              </svg>
            </a>
          </div>
        </div>

        <div class="footer-links-group">
          <div class="footer-col">
            <h3>{{ "footer.company" | translate }}</h3>
            <a routerLink="/about">{{ "footer.companyLinks.about" | translate }}</a>
            <a routerLink="/careers">{{ "footer.companyLinks.careers" | translate }}</a>
            <a routerLink="/press">{{ "footer.companyLinks.press" | translate }}</a>
            <a routerLink="/blog">{{ "footer.companyLinks.blog" | translate }}</a>
            <a routerLink="/contact">{{ "footer.companyLinks.contact" | translate }}</a>
          </div>

          <div class="footer-col">
            <h3>{{ "footer.resources" | translate }}</h3>
            <a routerLink="/help">{{ "footer.resourceLinks.help" | translate }}</a>
            <a routerLink="/guidelines">{{ "footer.resourceLinks.guidelines" | translate }}</a>
            <a routerLink="/writers">{{ "footer.resourceLinks.writers" | translate }}</a>
            <a routerLink="/competitions">{{ "footer.resourceLinks.competitions" | translate }}</a>
          </div>

          <div class="footer-col">
            <h3>{{ "footer.legal" | translate }}</h3>
            <a routerLink="/terms">{{ "footer.legalLinks.terms" | translate }}</a>
            <a routerLink="/privacy">{{ "footer.legalLinks.privacy" | translate }}</a>
            <a routerLink="/cookies">{{ "footer.legalLinks.cookies" | translate }}</a>
            <a routerLink="/copyright">{{ "footer.legalLinks.copyright" | translate }}</a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="copyright">{{ "footer.copyright" | translate }}</p>
        <p class="crafted-by">Crafted by Softrate ❤️</p>
      </div>
    </footer>
  `,
  styles: [
    `
      .site-footer {
        background: #0f172a;
        color: #f8fafc;
        padding: 64px 32px 32px 32px;
        margin-top: 64px;
      }
      .footer-container {
        max-width: 1240px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        gap: 64px;
        padding-bottom: 48px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      .footer-brand {
        max-width: 320px;
      }
      .logo {
        font-family: var(--display);
        font-weight: 700;
        font-size: 24px;
        letter-spacing: 0.01em;
        color: #fff;
        display: flex;
        align-items: center;
        gap: 9px;
        margin-bottom: 16px;
      }
      .logo-img {
        width: 36px;
        height: 36px;
        object-fit: contain;
      }
      .brand-desc {
        font-size: 14px;
        color: #94a3b8;
        line-height: 1.6;
        margin-bottom: 24px;
      }
      .social-links {
        display: flex;
        gap: 16px;
      }
      .social-links a {
        color: #94a3b8;
        transition: color 0.2s ease;
      }
      .social-links a:hover {
        color: var(--gold);
      }
      .footer-links-group {
        display: flex;
        gap: 80px;
      }
      .footer-col {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .footer-col h3 {
        font-family: var(--display);
        font-size: 16px;
        font-weight: 600;
        color: #fff;
        margin-bottom: 8px;
      }
      .footer-col a {
        font-size: 14px;
        color: #94a3b8;
        text-decoration: none;
        transition: color 0.2s ease;
      }
      .footer-col a:hover {
        color: #fff;
      }
      .footer-bottom {
        max-width: 1240px;
        margin: 0 auto;
        padding-top: 32px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
        color: #64748b;
      }
      .crafted-by {
        font-weight: 500;
        color: #94a3b8;
        text-align: right;
      }
      .copyright {
        text-align: left;
      }
      @media (max-width: 900px) {
        .footer-container {
          flex-direction: column;
          gap: 48px;
        }
        .footer-links-group {
          flex-wrap: wrap;
          gap: 48px;
        }
        .footer-bottom {
          flex-direction: column;
          gap: 16px;
          text-align: center;
        }
        .copyright {
          text-align: center;
        }
      }
    `,
  ],
})
export class FooterComponent {}
