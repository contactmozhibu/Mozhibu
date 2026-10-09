import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-layout">
      <!-- Hero Section -->
      <div class="hero">
        <div class="hero-content wrap">
          <h1>Welcome to Mozhibu!</h1>
          <p>
            “Mozhibu” is a Tamil word which means “Narrative” or “Story,” representing storytelling through prose. The term originates from the Tamil word “Mozhi,” meaning “speech” or “expression.”
          </p>
          <p style="margin-top: 24px;">
            We are a platform built for readers, writers, and creators who believe in the power of stories. From fiction that sparks imagination to non-fiction that informs, from poetry that moves the soul to cookbooks that inspire kitchens, and from children’s tales to academic insight — we celebrate every voice and every genre.
          </p>
        </div>
        <div class="hero-bg"></div>
      </div>

      <!-- Mission Statement -->
      <div class="mission-banner wrap">
        <h2>Our mission is simple:</h2>
        <p>to make storytelling accessible, diverse, and beautifully inclusive.</p>
      </div>

      <!-- Genres Section -->
      <div class="genres-section alt-bg">
        <div class="wrap">
          <h2 class="section-title">A Platform for Every Kind of Story</h2>
          <p class="section-subtitle">Stories come in many forms, so we embrace them all.</p>
          <div class="values-grid">
            <div class="value-card">
              <h4>Fiction</h4>
              <p>Adventures, drama, thrillers, romance, and everything imagined.</p>
            </div>
            <div class="value-card">
              <h4>Non-Fiction</h4>
              <p>Real stories, reflections, biographies, insights, and lived experiences.</p>
            </div>
            <div class="value-card">
              <h4>Academic</h4>
              <p>Research-driven writing, educational content, and learning resources.</p>
            </div>
            <div class="value-card">
              <h4>Poetry</h4>
              <p>Verses, emotions, ghazals, haiku, reflections, and lyrical expressions.</p>
            </div>
            <div class="value-card">
              <h4>Cookbooks</h4>
              <p>Recipes, food memories, kitchen traditions, and culinary explorations.</p>
            </div>
            <div class="value-card">
              <h4>Children’s Books</h4>
              <p>Imaginative tales, early readers, picture books, and learning stories.</p>
            </div>
          </div>
          <div class="value-card others-card" style="margin-top: 32px;">
            <h4>Others</h4>
            <p>Comics, graphic stories, plays, essays, journals, spiritual texts, and mixed formats.</p>
          </div>
        </div>
      </div>

      <!-- Bottom Details -->
      <div class="details-section wrap">
        <div class="details-text">
          <h2>Languages Available</h2>
          <p>
            Currently Mozhibu is available for reading and writing in <strong>12 languages</strong>. We will also expand in other Indian languages soon.
          </p>
        </div>
        <div class="details-text">
          <h2>Wondering who we are?</h2>
          <p>
            At Mozhibu, passionate engineers, intellectual writers, and community managers come together with one shared mission — to constantly evolve the platform and craft a meaningful, inspiring experience for every author and reader.
          </p>
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
        padding: 120px 0;
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
        margin-bottom: 24px;
        line-height: 1.1;
      }
      .hero p {
        font-size: 20px;
        color: rgba(255, 255, 255, 0.9);
        line-height: 1.6;
        margin: 0 auto;
      }

      .mission-banner {
        text-align: center;
        padding: 80px 32px;
        background: var(--card);
        border-radius: var(--radius-l);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.04);
        margin-top: -40px;
        position: relative;
        z-index: 10;
        border: 1px solid var(--border-soft);
        margin-bottom: 80px;
      }
      .mission-banner h2 {
        font-size: 36px;
        color: var(--forest);
        margin-bottom: 12px;
      }
      .mission-banner p {
        font-size: 24px;
        font-weight: 500;
        color: var(--ink);
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
        .hero { padding: 60px 16px !important; }
        .hero h1 { font-size: 32px !important; line-height: 1.2 !important; }
        .hero p { font-size: 18px !important; }
        
        .mission-banner {
          margin-top: -20px;
          padding: 40px 24px;
        }
        .mission-banner h2 { font-size: 28px; }
        .mission-banner p { font-size: 20px; }

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
