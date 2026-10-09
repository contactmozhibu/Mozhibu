import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="premium-layout">
      <!-- Hero Image -->
      <div class="hero-banner"></div>

      <div class="content-container">
        <!-- Hero Text -->
        <header class="page-header">
          <h1 class="display-title">{{ 'about.hero.title' | translate }}</h1>
          <div class="header-body">
            <p>{{ 'about.hero.p1' | translate }}</p>
            <p>{{ 'about.hero.p2' | translate }}</p>
          </div>
        </header>

        <!-- Mission Statement -->
        <section class="mission-section">
          <h2 class="sub-heading">{{ 'about.mission.title' | translate }}</h2>
          <p class="statement-text">{{ 'about.mission.desc' | translate }}</p>
        </section>

        <hr class="minimal-divider" />

        <!-- Genres Grid -->
        <section class="genres-section">
          <header class="section-header">
            <h2 class="sub-heading">{{ 'about.genres.title' | translate }}</h2>
            <p class="muted-text">{{ 'about.genres.subtitle' | translate }}</p>
          </header>

          <div class="minimal-grid">
            <div class="grid-item">
              <h3 class="item-title">{{ 'about.genres.fiction.title' | translate }}</h3>
              <p class="item-desc">{{ 'about.genres.fiction.desc' | translate }}</p>
            </div>
            <div class="grid-item">
              <h3 class="item-title">{{ 'about.genres.nonFiction.title' | translate }}</h3>
              <p class="item-desc">{{ 'about.genres.nonFiction.desc' | translate }}</p>
            </div>
            <div class="grid-item">
              <h3 class="item-title">{{ 'about.genres.academic.title' | translate }}</h3>
              <p class="item-desc">{{ 'about.genres.academic.desc' | translate }}</p>
            </div>
            <div class="grid-item">
              <h3 class="item-title">{{ 'about.genres.poetry.title' | translate }}</h3>
              <p class="item-desc">{{ 'about.genres.poetry.desc' | translate }}</p>
            </div>
            <div class="grid-item">
              <h3 class="item-title">{{ 'about.genres.cookbooks.title' | translate }}</h3>
              <p class="item-desc">{{ 'about.genres.cookbooks.desc' | translate }}</p>
            </div>
            <div class="grid-item">
              <h3 class="item-title">{{ 'about.genres.childrens.title' | translate }}</h3>
              <p class="item-desc">{{ 'about.genres.childrens.desc' | translate }}</p>
            </div>
            <div class="grid-item span-full">
              <h3 class="item-title">{{ 'about.genres.others.title' | translate }}</h3>
              <p class="item-desc">{{ 'about.genres.others.desc' | translate }}</p>
            </div>
          </div>
        </section>

        <hr class="minimal-divider" />

        <!-- Details Section -->
        <section class="details-section">
          <div class="detail-column">
            <h3 class="item-title">{{ 'about.details.languagesTitle' | translate }}</h3>
            <p class="item-desc" [innerHTML]="'about.details.languagesDesc' | translate"></p>
          </div>
          <div class="detail-column">
            <h3 class="item-title">{{ 'about.details.whoWeAreTitle' | translate }}</h3>
            <p class="item-desc">{{ 'about.details.whoWeAreDesc' | translate }}</p>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [
    `
      .premium-layout {
        background-color: #fafafa;
        min-height: 100vh;
        color: #111827;
        padding-bottom: 120px;
      }
      .hero-banner {
        width: 100%;
        height: 65vh;
        min-height: 450px;
        background-image: url('/assets/about_hero_bg.jpg');
        background-size: cover;
        background-position: center 30%;
        background-repeat: no-repeat;
      }
      .content-container {
        max-width: 1000px;
        margin: 0 auto;
        padding: 0 32px;
        position: relative;
        top: -80px;
      }
      .page-header {
        background: #ffffff;
        padding: 80px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.04);
        border-radius: 8px;
        margin-bottom: 100px;
      }
      .display-title {
        font-family: var(--display);
        font-size: 3.5rem;
        font-weight: 300;
        letter-spacing: -0.02em;
        color: #111827;
        margin-bottom: 32px;
        line-height: 1.1;
      }
      .header-body p {
        font-size: 1.125rem;
        line-height: 1.8;
        color: #4b5563;
        margin-bottom: 1.5rem;
        font-weight: 400;
      }
      .header-body p:last-child {
        margin-bottom: 0;
      }
      .mission-section {
        text-align: center;
        padding: 60px 0;
      }
      .sub-heading {
        font-family: var(--display);
        font-size: 0.875rem;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        color: #9ca3af;
        margin-bottom: 24px;
        font-weight: 600;
      }
      .statement-text {
        font-family: var(--display);
        font-size: 2.25rem;
        font-weight: 300;
        line-height: 1.4;
        color: #111827;
        max-width: 800px;
        margin: 0 auto;
        letter-spacing: -0.01em;
      }
      .minimal-divider {
        border: 0;
        height: 1px;
        background: #e5e7eb;
        margin: 80px 0;
        width: 100%;
      }
      .genres-section {
        padding: 40px 0;
      }
      .section-header {
        text-align: center;
        margin-bottom: 80px;
      }
      .muted-text {
        font-size: 1.125rem;
        color: #6b7280;
      }
      .minimal-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 64px 48px;
      }
      .grid-item {
        display: flex;
        flex-direction: column;
      }
      .item-title {
        font-family: var(--display);
        font-size: 1.25rem;
        font-weight: 500;
        color: #111827;
        margin-bottom: 16px;
      }
      .item-desc {
        font-size: 1rem;
        line-height: 1.7;
        color: #6b7280;
      }
      .span-full {
        grid-column: 1 / -1;
        text-align: center;
        max-width: 600px;
        margin: 0 auto;
      }
      .details-section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 80px;
        padding: 40px 0;
      }
      
      @media (max-width: 900px) {
        .minimal-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        .page-header {
          padding: 64px 40px;
        }
      }
      @media (max-width: 768px) {
        .hero-banner {
          height: 40vh;
        }
        .content-container {
          padding: 0 16px;
          top: -40px;
        }
        .page-header {
          padding: 40px 24px;
        }
        .display-title {
          font-size: 2.5rem;
        }
        .statement-text {
          font-size: 1.75rem;
        }
        .minimal-grid {
          grid-template-columns: 1fr;
          gap: 48px;
        }
        .span-full {
          grid-column: 1;
          text-align: left;
        }
        .details-section {
          grid-template-columns: 1fr;
          gap: 48px;
        }
        .minimal-divider {
          margin: 60px 0;
        }
      }
    `
  ]
})
export class AboutComponent {}
