import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-info-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-layout">
      <!-- Hero Section -->
      <div class="hero">
        <div class="hero-content wrap">
          <h1>{{ title }}</h1>
        </div>
        <div class="hero-bg"></div>
      </div>

      <!-- Content -->
      <div class="content-section wrap">
        <div class="policy-container">
          
          <div class="policy-block intro">
            <p>Last updated: August 25, 2026</p>
          </div>

          @if (content) {
            <div class="policy-block" [innerHTML]="content"></div>
          } @else {
            <div class="policy-block">
              <p class="highlight-box warning">
                This is a placeholder page for <strong>{{ title }}</strong>. 
                The actual content will be added here by the legal or content team.
              </p>
            </div>

            <div class="policy-block">
              <h2>1. Introduction</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
                in dui mauris. Vivamus hendrerit arcu sed erat molestie
                vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh
                porttitor.
              </p>
            </div>

            <div class="policy-block">
              <h2>2. Standard Terms</h2>
              <p>
                Ut tristique lectus ac ligula congue, vel auctor libero
                venenatis. Phasellus nisl mi, hendrerit quis viverra ut,
                venenatis in nisl.
              </p>
            </div>
          }
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
        margin: 0;
        letter-spacing: -0.02em;
        line-height: 1.1;
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
      .policy-block.intro {
        font-size: 16px;
        color: var(--ink-faint);
        border-bottom: 1px solid var(--border-soft);
        padding-bottom: 24px;
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
      
      /* Highlight boxes */
      .highlight-box {
        background: var(--forest-tint);
        border-left: 4px solid var(--forest);
        padding: 16px 20px;
        border-radius: 0 8px 8px 0;
        color: var(--forest-deep) !important;
        font-weight: 500;
        margin: 24px 0 !important;
      }
      .highlight-box.warning {
        background: #fffbeb;
        border-left-color: #f59e0b;
        color: #b45309 !important;
      }
      
      ::ng-deep .policy-container table {
        width: 100%;
        border-collapse: collapse;
        margin: 24px 0;
      }
      ::ng-deep .policy-container th, ::ng-deep .policy-container td {
        border: 1px solid var(--border-soft);
        padding: 12px 16px;
        text-align: left;
      }
      ::ng-deep .policy-container th {
        background: var(--surface);
        font-weight: 600;
        color: var(--ink);
      }
      ::ng-deep .policy-container td {
        color: var(--ink-soft);
      }
      ::ng-deep .policy-container ol, ::ng-deep .policy-container ul {
        margin-bottom: 24px;
        padding-left: 24px;
        color: var(--ink-soft);
      }
      ::ng-deep .policy-container p {
        margin-bottom: 16px;
        color: var(--ink-soft);
        line-height: 1.6;
      }
      ::ng-deep .policy-container strong {
        color: var(--ink);
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
      }
    `,
  ],
})
export class InfoPageComponent implements OnInit {
  title = 'Information';
  content = '';

  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.data.subscribe((data) => {
      if (data['title']) {
        this.title = data['title'];
      }
      if (data['content']) {
        this.content = data['content'];
      }
    });
  }
}
