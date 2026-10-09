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
        <div class="hero-bg"></div>
        <div class="hero-content wrap">
          <h1>{{ 'about.hero.title' | translate }}</h1>
          <p>{{ 'about.hero.p1' | translate }}</p>
          <p style="margin-top: 16px;">{{ 'about.hero.p2' | translate }}</p>
        </div>
      </div>

      <!-- Story / Mission Section -->
      <div class="story-section wrap">
        <h2 class="section-title">{{ 'about.mission.title' | translate }}</h2>
        <p class="section-subtitle">{{ 'about.mission.desc' | translate }}</p>

        <div class="details-section">
          <div class="detail-block">
            <h3>{{ 'about.details.languagesTitle' | translate }}</h3>
            <p [innerHTML]="'about.details.languagesDesc' | translate"></p>
          </div>
          <div class="detail-block">
            <h3>{{ 'about.details.whoWeAreTitle' | translate }}</h3>
            <p>{{ 'about.details.whoWeAreDesc' | translate }}</p>
          </div>
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
    </div>
  `,
  styles: [
    `
      .page-layout {
        min-height: calc(100vh - 73px);
        background: #ffffff;
      }
      .hero {
        position: relative;
        padding: 200px 0 160px 0;
        background-color: #f8fafc;
        display: flex;
        align-items: center;
      }
      .hero-bg {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: url('/assets/about_hero_bg.jpg');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
      }
      .hero-bg::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 30%, rgba(255,255,255,0) 100%);
      }
      .hero-content {
        position: relative;
        z-index: 2;
        max-width: 600px;
        margin-left: 0; /* Align left based on wrap */
        padding-right: 24px;
      }
      .hero h1 {
        font-size: 56px;
        font-weight: 800;
        color: #0f172a;
        margin-bottom: 24px;
        line-height: 1.1;
      }
      .hero p {
        font-size: 18px;
        color: #334155;
        line-height: 1.6;
        font-weight: 500;
      }

      .story-section {
        padding: 100px 32px;
        text-align: center;
        background: #ffffff;
      }
      
      .details-section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 64px;
        text-align: left;
        margin-top: 80px;
        padding-top: 64px;
        border-top: 1px solid #e2e8f0;
      }
      .detail-block h3 {
        font-size: 20px;
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 16px;
      }
      .detail-block p {
        font-size: 15px;
        color: #64748b;
        line-height: 1.7;
      }

      .alt-bg {
        background: #f8fafc;
        padding: 100px 0;
      }
      .section-title {
        text-align: center;
        font-size: 40px;
        font-weight: 800;
        color: #0f172a;
        margin-bottom: 16px;
      }
      .section-subtitle {
        text-align: center;
        font-size: 18px;
        color: #64748b;
        margin-bottom: 64px;
      }
      .values-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 32px;
      }
      .value-card {
        background: #ffffff;
        padding: 32px;
        text-align: left;
        border-left: 2px solid #e2e8f0;
        transition: border-color 0.2s ease;
      }
      .value-card:hover {
        border-left-color: var(--gold);
      }
      .others-card {
        max-width: 600px;
        margin: 32px auto 0 auto;
        border-left: none;
        border-top: 2px solid #e2e8f0;
        text-align: center;
      }
      .others-card:hover {
        border-top-color: var(--gold);
        border-left-color: transparent;
      }
      .value-card h4 {
        font-size: 18px;
        margin-bottom: 12px;
        color: #0f172a;
        font-weight: 700;
      }
      .value-card p {
        font-size: 15px;
        color: #64748b;
        line-height: 1.6;
      }

      @media (max-width: 900px) {
        .values-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        .details-section {
          grid-template-columns: 1fr;
          gap: 48px;
        }
      }
    
      @media (max-width: 768px) {
        .hero { padding: 120px 16px 80px 16px !important; }
        .hero-bg::after {
          background: linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 60%, rgba(255,255,255,0.4) 100%);
        }
        .hero h1 { font-size: 40px !important; }
        .hero p { font-size: 16px !important; }
        
        .story-section { padding: 60px 16px; }
        .section-title { font-size: 32px; }

        .values-grid { 
          grid-template-columns: 1fr !important; 
          gap: 16px !important; 
        }
        
        .value-card {
          padding: 24px !important;
          border-left: none;
          border-top: 2px solid #e2e8f0;
        }
        .value-card:hover {
          border-top-color: var(--gold);
          border-left-color: transparent;
        }
      }
    `,
  ],
})
export class AboutComponent {}
