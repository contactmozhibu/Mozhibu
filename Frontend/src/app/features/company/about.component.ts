import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="page-layout">
      <!-- Hero Section -->
      <div class="hero">
        <div class="hero-content wrap">
          <h1>{{ 'about.hero.title' | translate }}</h1>
          <p>{{ 'about.hero.p1' | translate }}</p>
          <p style="margin-top: 24px;">{{ 'about.hero.p2' | translate }}</p>
        </div>
        <div class="hero-bg"></div>
      </div>

      <!-- Mission Statement -->
      <div class="mission-section">
        <div class="wrap">
          <h2>{{ 'about.mission.title' | translate }}</h2>
          <p>{{ 'about.mission.desc' | translate }}</p>
        </div>
      </div>

      <!-- Genres Section -->
      <div class="genres-section alt-bg">
        <div class="wrap">
          <h2 class="section-title">{{ 'about.genres.title' | translate }}</h2>
          <p class="section-subtitle">{{ 'about.genres.subtitle' | translate }}</p>
          <div class="values-grid">
            <div class="value-card">
              <h4>{{ 'about.genres.fiction.title' | translate }}</h4>
              <p>{{ 'about.genres.fiction.desc' | translate }}</p>
            </div>
            <div class="value-card">
              <h4>{{ 'about.genres.nonFiction.title' | translate }}</h4>
              <p>{{ 'about.genres.nonFiction.desc' | translate }}</p>
            </div>
            <div class="value-card">
              <h4>{{ 'about.genres.academic.title' | translate }}</h4>
              <p>{{ 'about.genres.academic.desc' | translate }}</p>
            </div>
            <div class="value-card">
              <h4>{{ 'about.genres.poetry.title' | translate }}</h4>
              <p>{{ 'about.genres.poetry.desc' | translate }}</p>
            </div>
            <div class="value-card">
              <h4>{{ 'about.genres.cookbooks.title' | translate }}</h4>
              <p>{{ 'about.genres.cookbooks.desc' | translate }}</p>
            </div>
            <div class="value-card">
              <h4>{{ 'about.genres.childrens.title' | translate }}</h4>
              <p>{{ 'about.genres.childrens.desc' | translate }}</p>
            </div>
          </div>
          <div class="value-card others-card" style="margin-top: 32px;">
            <h4>{{ 'about.genres.others.title' | translate }}</h4>
            <p>{{ 'about.genres.others.desc' | translate }}</p>
          </div>
        </div>
      </div>

      <!-- Bottom Details -->
      <div class="details-section wrap">
        <div class="details-text">
          <h2>{{ 'about.details.languagesTitle' | translate }}</h2>
          <p [innerHTML]="'about.details.languagesDesc' | translate"></p>
        </div>
        <div class="details-text">
          <h2>{{ 'about.details.whoWeAreTitle' | translate }}</h2>
          <p>{{ 'about.details.whoWeAreDesc' | translate }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page-layout {
        min-height: calc(100vh - 73px);
        background: var(--paper);
      }
      .hero {
        position: relative;
        padding: 140px 0 80px 0;
        overflow: hidden;
        background: var(--forest-deep);
        color: white;
        text-align: center;
      }
      .hero-bg {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(
          circle at center,
          rgba(174, 98, 116, 0.2) 0%,
          transparent 70%
        );
        pointer-events: none;
      }
      .hero-content {
        position: relative;
        z-index: 2;
        max-width: 900px;
        margin: 0 auto;
      }
      .hero h1 {
        font-size: 56px;
        font-weight: 800;
        color: white;
        margin-bottom: 32px;
        line-height: 1.1;
      }
      .hero p {
        font-size: 20px;
        color: rgba(255, 255, 255, 0.9);
        line-height: 1.6;
        margin: 0 auto;
      }

      .mission-section {
        background: var(--paper);
        padding: 100px 32px;
        text-align: center;
      }
      .mission-section h2 {
        font-size: 20px;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        color: var(--gold);
        margin-bottom: 24px;
        font-weight: 700;
      }
      .mission-section p {
        font-size: 36px;
        font-weight: 500;
        color: var(--forest-deep);
        line-height: 1.4;
        max-width: 800px;
        margin: 0 auto;
      }

      .alt-bg {
        background: var(--paper-warm);
        padding: 80px 0;
      }
      .section-title {
        text-align: center;
        font-size: 36px;
        color: var(--ink);
        margin-bottom: 16px;
      }
      .section-subtitle {
        text-align: center;
        font-size: 18px;
        color: var(--ink-soft);
        margin-bottom: 48px;
      }
      .values-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 32px;
      }
      .value-card {
        background: var(--card);
        padding: 32px;
        border-radius: var(--radius-l);
        text-align: center;
        box-shadow: 0 4px 16px rgba(0,0,0,0.03);
        border: 1px solid var(--border-light);
      }
      .value-card h4 {
        font-size: 22px;
        margin-bottom: 12px;
        color: var(--forest-deep);
      }
      .value-card p {
        font-size: 16px;
        color: var(--ink-soft);
        line-height: 1.6;
      }
      .others-card {
        max-width: 600px;
        margin: 32px auto 0 auto;
      }

      .details-section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 64px;
        padding: 80px 32px;
      }
      .details-text h2 {
        font-size: 32px;
        margin-bottom: 24px;
        color: var(--ink);
      }
      .details-text p {
        font-size: 18px;
        line-height: 1.6;
        color: var(--ink-soft);
      }

      @media (max-width: 900px) {
        .values-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        .details-section {
          grid-template-columns: 1fr;
          gap: 48px;
        }
        .hero h1 {
          font-size: 40px;
        }
      }
    
      @media (max-width: 768px) {
        .hero { padding: 100px 16px 60px 16px !important; }
        .hero h1 { font-size: 32px !important; line-height: 1.2 !important; }
        .hero p { font-size: 18px !important; }
        
        .mission-section {
          padding: 60px 24px;
        }
        .mission-section h2 { font-size: 16px; margin-bottom: 16px; }
        .mission-section p { font-size: 24px; line-height: 1.4; }

        .values-grid { 
          grid-template-columns: 1fr !important; 
          gap: 16px !important; 
        }
        
        .value-card {
          padding: 24px !important;
        }
        .others-card {
           margin-top: 16px;
        }
      }
    `,
  ],
})
export class AboutComponent {}
