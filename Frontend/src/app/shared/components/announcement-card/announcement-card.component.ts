import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';

export interface Announcement {
  id: string;
  title: string;
  date: string;
  content: string;
  type: 'update' | 'event' | 'news';
}

@Component({
  selector: 'app-announcement-card',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="announcement-card">
      <div class="card-header">
        <div>
          <span class="type-badge" [ngClass]="announcement.type">{{
            "announcements.type." + announcement.type | translate
          }}</span>
          <span class="date">{{ announcement.date }}</span>
        </div>
        <button class="dismiss-btn" (click)="onDismiss($event)" title="Dismiss">✖</button>
      </div>
      <h4 class="title">{{ announcement.title | translate }}</h4>
      <div class="content-wrapper">
        <div class="content" [innerHTML]="announcement.content | translate"></div>
        <div class="fade-out"></div>
      </div>
      <button class="read-more" (click)="openModal()">{{ "announcements.readMore" | translate }} →</button>
    </div>

    <!-- Read More Modal -->
    @if (isModalOpen()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="closeModal()">×</button>

          <div class="modal-header">
            <span class="type-badge" [ngClass]="announcement.type">{{
              "announcements.type." + announcement.type | translate
            }}</span>
            <span class="date">{{ announcement.date }}</span>
          </div>
          <h2 class="modal-title">{{ announcement.title | translate }}</h2>
          <div class="modal-body" [innerHTML]="announcement.content | translate"></div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .announcement-card {
        background: var(--card);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-m);
        padding: 24px;
        width: 300px;
        height: 240px;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        transition:
          box-shadow 0.15s ease,
          transform 0.15s ease;
      }
      .announcement-card:hover {
        box-shadow: 0 12px 28px -16px rgba(43, 38, 32, 0.18);
        transform: translateY(-2px);
      }
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16px;
      }
      .card-header > div {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .dismiss-btn {
        background: transparent;
        border: none;
        color: var(--ink-faint);
        font-size: 14px;
        cursor: pointer;
        padding: 4px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s, background 0.2s;
      }
      .dismiss-btn:hover {
        color: var(--rose);
        background: var(--rose-tint);
      }
      .type-badge {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 4px 10px;
        border-radius: 100px;
      }
      .type-badge.update {
        background: var(--forest-tint);
        color: var(--forest-deep);
      }
      .type-badge.event {
        background: var(--rose-tint);
        color: var(--rose);
      }
      .type-badge.news {
        background: #e0e7ff;
        color: #3730a3;
      }

      .date {
        font-size: 12px;
        color: var(--ink-faint);
      }
      .title {
        font-family: var(--display);
        font-weight: 700;
        font-size: 18px;
        color: var(--ink);
        margin-bottom: 8px;
        line-height: 1.3;
      }
      .content-wrapper {
        position: relative;
        flex-grow: 1;
        margin-bottom: 16px;
      }
      .content {
        font-size: 13.5px;
        color: var(--ink-soft);
        line-height: 1.6;
        max-height: 80px;
        overflow: hidden;
      }
      /* Simple styling for rendered HTML */
      .content ::ng-deep p {
        margin-bottom: 8px;
      }
      .content ::ng-deep a {
        color: var(--forest);
        text-decoration: none;
      }

      .fade-out {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 40px;
        background: linear-gradient(
          to bottom,
          rgba(255, 255, 255, 0),
          var(--card)
        );
      }
      .read-more {
        align-self: flex-start;
        font-family: var(--display);
        font-weight: 600;
        font-size: 13px;
        color: var(--forest);
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        transition: color 0.2s;
      }
      .read-more:hover {
        color: var(--gold);
      }

      /* Modal Styles */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }
      .modal-content {
        background: var(--paper);
        border-radius: var(--radius-l);
        padding: 40px;
        max-width: 600px;
        width: 100%;
        max-height: 85vh;
        overflow-y: auto;
        position: relative;
      }
      .close-btn {
        position: absolute;
        top: 16px;
        right: 16px;
        background: none;
        border: none;
        font-size: 28px;
        cursor: pointer;
        color: var(--ink-soft);
      }
      .modal-header {
        display: flex;
        gap: 16px;
        align-items: center;
        margin-bottom: 24px;
      }
      .modal-title {
        font-size: 28px;
        margin-bottom: 24px;
        line-height: 1.2;
      }
      .modal-body {
        font-size: 16px;
        color: var(--ink);
        line-height: 1.8;
      }
      .modal-body ::ng-deep p {
        margin-bottom: 16px;
      }
      .modal-body ::ng-deep a {
        color: var(--forest);
        text-decoration: underline;
      }
      .modal-body ::ng-deep ul {
        padding-left: 20px;
        margin-bottom: 16px;
      }
    `,
  ],
})
export class AnnouncementCardComponent {
  @Input() announcement!: Announcement;
  @Output() dismiss = new EventEmitter<string>();
  isModalOpen = signal(false);

  openModal() {
    this.isModalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.isModalOpen.set(false);
    document.body.style.overflow = '';
  }

  onDismiss(event: Event) {
    event.stopPropagation();
    this.dismiss.emit(this.announcement.id);
  }
}
