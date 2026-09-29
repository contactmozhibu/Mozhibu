import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import {
  AdminService,
  AdminAuthorDetail,
} from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-author-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="admin-page">
      <header class="page-header">
        <a routerLink="/admin/authors" class="back-link">← Back to Authors</a>
      </header>

      @if (loading()) {
        <div class="loading-state">Loading author profile...</div>
      } @else if (authorDetail()) {
        <div class="profile-layout">
          <!-- Left Sidebar: Author Info -->
          <div class="profile-sidebar">
            <div class="profile-card">
              <div class="avatar-circle">
                {{ authorDetail()!.author.username.charAt(0).toUpperCase() }}
              </div>
              <h2 class="author-name">{{ authorDetail()!.author.username }}</h2>
              <p class="author-email">{{ authorDetail()!.author.email }}</p>

              <div
                class="status-badge"
                [ngClass]="authorDetail()!.author.status"
              >
                {{ authorDetail()!.author.status }}
              </div>

              <!-- Admin controls -->
              <div
                class="admin-controls"
                *ngIf="authorDetail()!.author.role !== 'superadmin'"
              >
                <button
                  *ngIf="authorDetail()!.author.status === 'active'"
                  class="btn-suspend"
                  (click)="openSuspendModal()"
                >
                  Suspend
                </button>
                <button
                  *ngIf="authorDetail()!.author.status === 'suspended'"
                  class="btn-reactivate"
                  (click)="reactivateAuthor()"
                >
                  Reactivate
                </button>
                <button class="btn-delete" (click)="deleteAuthor()">
                  Delete Account
                </button>
              </div>

              <div class="profile-stats">
                <div class="stat-box">
                  <span class="stat-value">{{
                    authorDetail()!.author.followersCount
                  }}</span>
                  <span class="stat-label">Followers</span>
                </div>
                <div class="stat-box">
                  <span class="stat-value">{{
                    authorDetail()!.books.length
                  }}</span>
                  <span class="stat-label">Books</span>
                </div>
              </div>

              <div class="profile-details">
                <div class="detail-row">
                  <span class="detail-label">Joined</span>
                  <span class="detail-value">{{
                    authorDetail()!.author.createdAt | date: 'mediumDate'
                  }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Language</span>
                  <span class="detail-value">{{
                    authorDetail()!.author.preferredLanguage || 'English'
                  }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Role</span>
                  <span
                    class="detail-value"
                    style="text-transform: capitalize;"
                    >{{ authorDetail()!.author.role }}</span
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content: Published Books -->
          <div class="profile-content">
            <div class="content-header">
              <h3>Published Works</h3>
              <p>Books authored by {{ authorDetail()!.author.username }}</p>
            </div>

            @if (authorDetail()!.books.length === 0) {
              <div class="empty-state">
                This author has not published any books yet.
              </div>
            } @else {
              <div class="books-grid">
                @for (book of authorDetail()!.books; track book._id) {
                  <a
                    [routerLink]="['/admin/books', book._id]"
                    class="book-card"
                  >
                    <div class="book-cover">
                      @if (book.cover) {
                        <img loading="lazy" [src]="book.cover" [alt]="book.title" />
                      } @else {
                        <div class="placeholder-cover">
                          {{ book.title.charAt(0) }}
                        </div>
                      }
                      <div class="book-status" [ngClass]="book.status">
                        {{ book.status }}
                      </div>
                    </div>
                    <div class="book-info">
                      <h4>{{ book.title }}</h4>
                      <p class="genre">{{ book.genre }}</p>
                      <div class="book-meta">
                        <span
                          ><i class="views-icon"></i>
                          {{ book.views | number }} reads</span
                        >
                      </div>
                    </div>
                  </a>
                }
              </div>
            }
          </div>
        </div>
      }

      @if (showSuspendModal()) {
        <div class="modal-backdrop" (click)="closeSuspendModal()">
          <div class="suspend-modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Suspend Author</h3>
              <button class="close-btn" (click)="closeSuspendModal()">✕</button>
            </div>
            <p class="modal-desc">
              Choose the suspension duration for <strong>{{ authorDetail()?.author?.username }}</strong>:
            </p>
            <div class="duration-options">
              <label class="duration-option" [class.selected]="suspendDuration === '24h'">
                <input type="radio" name="authorDuration" value="24h" [(ngModel)]="suspendDuration" />
                <span>24 Hours</span>
              </label>
              <label class="duration-option" [class.selected]="suspendDuration === '48h'">
                <input type="radio" name="authorDuration" value="48h" [(ngModel)]="suspendDuration" />
                <span>48 Hours</span>
              </label>
              <label class="duration-option" [class.selected]="suspendDuration === '1w'">
                <input type="radio" name="authorDuration" value="1w" [(ngModel)]="suspendDuration" />
                <span>1 Week</span>
              </label>
              <label class="duration-option" [class.selected]="suspendDuration === '1m'">
                <input type="radio" name="authorDuration" value="1m" [(ngModel)]="suspendDuration" />
                <span>1 Month</span>
              </label>
              <label class="duration-option" [class.selected]="suspendDuration === 'permanent'">
                <input type="radio" name="authorDuration" value="permanent" [(ngModel)]="suspendDuration" />
                <span>Permanent</span>
              </label>
            </div>
            <div class="modal-actions">
              <button class="btn-cancel" (click)="closeSuspendModal()">Cancel</button>
              <button class="btn-confirm-suspend" (click)="confirmSuspend()">Confirm Suspension</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .admin-page {
        padding: 8px 0;
      }
      .page-header {
        margin-bottom: 24px;
      }
      .back-link {
        display: inline-flex;
        align-items: center;
        color: var(--ink-soft);
        text-decoration: none;
        font-size: 14px;
        font-weight: 500;
        transition: color 0.2s;
      }
      .back-link:hover {
        color: var(--ink);
      }

      .loading-state,
      .empty-state {
        padding: 48px;
        text-align: center;
        color: var(--ink-soft);
        background: var(--card);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-m);
      }

      .profile-layout {
        display: grid;
        grid-template-columns: 300px 1fr;
        gap: 32px;
        align-items: start;
      }

      /* Sidebar */
      .profile-sidebar {
        position: sticky;
        top: 24px;
      }
      .profile-card {
        background: var(--card);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-m);
        padding: 32px 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      .avatar-circle {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: var(--forest);
        color: #fff;
        font-family: var(--display);
        font-size: 32px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;
      }
      .author-name {
        font-family: var(--display);
        font-size: 20px;
        color: var(--ink);
        margin-bottom: 4px;
      }
      .author-email {
        font-size: 14px;
        color: var(--ink-soft);
        margin-bottom: 16px;
      }

      .status-badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 100px;
        font-size: 12px;
        font-weight: 600;
        text-transform: capitalize;
        margin-bottom: 24px;
      }
      .status-badge.active {
        background: var(--forest-tint);
        color: var(--forest-deep);
      }
      .status-badge.suspended {
        background: var(--rose-tint);
        color: var(--rose);
      }

      .admin-controls {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
        margin-bottom: 24px;
      }
      .admin-controls button {
        padding: 8px 12px;
        border-radius: var(--radius-s);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
        width: 100%;
        text-align: center;
      }
      .btn-suspend {
        background: var(--card);
        border: 1px solid var(--border-soft) !important;
        color: var(--rose) !important;
      }
      .btn-suspend:hover {
        border-color: var(--rose) !important;
        background: var(--rose-tint);
      }
      .btn-reactivate {
        background: var(--forest);
        color: #fff;
      }
      .btn-reactivate:hover {
        background: var(--forest-deep);
      }
      .btn-delete {
        background: #dc2626;
        color: #fff;
      }
      .btn-delete:hover {
        background: #b91c1c;
      }

      .profile-stats {
        display: flex;
        width: 100%;
        border-top: 1px solid var(--border-soft);
        border-bottom: 1px solid var(--border-soft);
        padding: 16px 0;
        margin-bottom: 24px;
      }
      .stat-box {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .stat-box:first-child {
        border-right: 1px solid var(--border-soft);
      }
      .stat-value {
        font-family: var(--display);
        font-size: 24px;
        font-weight: 700;
        color: var(--ink);
      }
      .stat-label {
        font-size: 12px;
        color: var(--ink-soft);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-top: 4px;
      }

      .profile-details {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .detail-row {
        display: flex;
        justify-content: space-between;
        font-size: 14px;
      }
      .detail-label {
        color: var(--ink-soft);
      }
      .detail-value {
        color: var(--ink);
        font-weight: 500;
      }

      /* Content */
      .profile-content {
        background: var(--card);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-m);
        padding: 32px;
      }
      .content-header {
        margin-bottom: 24px;
      }
      .content-header h3 {
        font-family: var(--display);
        font-size: 20px;
        color: var(--ink);
        margin-bottom: 4px;
      }
      .content-header p {
        font-size: 14px;
        color: var(--ink-soft);
      }

      .books-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 24px;
      }
      .book-card {
        display: flex;
        flex-direction: column;
        text-decoration: none;
        transition: transform 0.2s;
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-s);
        overflow: hidden;
      }
      .book-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
        border-color: transparent;
      }

      .book-cover {
        aspect-ratio: 2/3;
        position: relative;
        background: var(--paper-warm);
      }
      .book-cover img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .placeholder-cover {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--display);
        font-size: 48px;
        color: var(--ink-faint);
      }

      .book-status {
        position: absolute;
        top: 8px;
        right: 8px;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
        text-transform: capitalize;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(4px);
      }
      .book-status.published {
        color: var(--forest);
      }
      .book-status.pending {
        color: #d97706;
      }
      .book-status.rejected {
        color: var(--rose);
      }

      .book-info {
        padding: 16px;
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .book-info h4 {
        font-family: var(--display);
        font-size: 15px;
        color: var(--ink);
        margin-bottom: 4px;
        line-height: 1.3;
      }
      .genre {
        font-size: 12px;
        color: var(--ink-soft);
        margin-bottom: 12px;
      }
      .book-meta {
        margin-top: auto;
        font-size: 12px;
        color: var(--ink-soft);
        font-weight: 500;
      }
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        backdrop-filter: blur(4px);
      }
      .suspend-modal {
        background: var(--card, #ffffff);
        color: var(--ink, #1e293b);
        border-radius: 16px;
        padding: 24px;
        width: 100%;
        max-width: 440px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        border: 1px solid var(--border-soft, #e2e8f0);
      }
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }
      .modal-header h3 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 700;
      }
      .close-btn {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        color: var(--sd-muted);
      }
      .modal-desc {
        color: var(--ink-soft, #64748b);
        font-size: 0.95rem;
        margin-bottom: 18px;
      }
      .duration-options {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 24px;
      }
      .duration-option {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border: 1px solid var(--border-soft, #e2e8f0);
        border-radius: 10px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;
      }
      .duration-option:hover {
        background: var(--card-hover, #f8fafc);
      }
      .duration-option.selected {
        border-color: #ef4444;
        background: rgba(239, 68, 68, 0.05);
      }
      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }
      .btn-cancel {
        padding: 8px 16px;
        border: 1px solid #cbd5e1;
        background: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
      }
      .btn-confirm-suspend {
        padding: 8px 18px;
        border: none;
        background: #ef4444;
        color: #fff;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
      }
      .btn-confirm-suspend:hover {
        background: #dc2626;
      }
    `,
  ],
})
export class AuthorDetailComponent implements OnInit {
  route = inject(ActivatedRoute);
  adminService = inject(AdminService);
  router = inject(Router);

  authorDetail = signal<AdminAuthorDetail | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.loadAuthorDetails();
  }

  loadAuthorDetails() {
    this.loading.set(true);
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.adminService.getAuthorDetails(id).subscribe({
        next: (data) => {
          this.authorDetail.set(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    }
  }

  showSuspendModal = signal(false);
  suspendDuration = '24h';

  openSuspendModal() {
    this.suspendDuration = '24h';
    this.showSuspendModal.set(true);
  }

  closeSuspendModal() {
    this.showSuspendModal.set(false);
  }

  confirmSuspend() {
    const author = this.authorDetail()?.author;
    if (!author) return;
    this.adminService
      .updateUserStatus(author._id, 'suspended', this.suspendDuration)
      .subscribe(() => {
        this.closeSuspendModal();
        this.loadAuthorDetails();
      });
  }

  reactivateAuthor() {
    const author = this.authorDetail()?.author;
    if (!author) return;
    if (
      confirm(
        `Are you sure you want to reactivate author "${author.username}"?`,
      )
    ) {
      this.adminService.updateUserStatus(author._id, 'active').subscribe(() => {
        this.loadAuthorDetails();
      });
    }
  }

  deleteAuthor() {
    const author = this.authorDetail()?.author;
    if (!author) return;
    if (
      confirm(
        `Are you absolutely sure you want to permanently delete author "${author.username}"? All their books, chapters, and records will be deleted forever.`,
      )
    ) {
      if (
        confirm(
          `FINAL CONFIRMATION: Permanently delete author "${author.username}"?`,
        )
      ) {
        this.adminService.deleteUser(author._id).subscribe(() => {
          this.router.navigate(['/admin/authors']);
        });
      }
    }
  }
}

