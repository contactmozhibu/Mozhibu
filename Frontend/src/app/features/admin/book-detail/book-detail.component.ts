import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { AdminService, AdminBook } from '../../../core/services/admin.service';
import { BookService } from '../../../core/services/book.service';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-admin-book-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-page">
      <div class="breadcrumb">
        <a routerLink="/admin/books">← Back to Books</a>
      </div>

      @if (loading()) {
        <div class="loading-state">Loading book details...</div>
      } @else if (book()) {
        <header class="book-header">
          <div class="header-content">
            <div
              class="book-cover"
              [ngStyle]="{
                'background-image':
                  'url(' + (book()?.cover || 'assets/placeholder.jpg') + ')',
              }"
            ></div>
            <div class="book-info">
              <span class="status-badge" [ngClass]="book()?.status">{{
                book()?.status
              }}</span>
              <h1>{{ book()?.title }}</h1>
              <p class="author">
                by <strong>{{ book()?.author?.username }}</strong> ({{
                  book()?.author?.email
                }})
              </p>

              <div class="metadata">
                <span class="meta-item"
                  ><strong>Genre:</strong> {{ book()?.genre }}</span
                >
                <span class="meta-item"
                  ><strong>Format:</strong>
                  {{ book()?.isAudio ? 'Audiobook' : 'Text' }}</span
                >
                <span class="meta-item"
                  ><strong>Submitted:</strong>
                  {{ book()?.submittedAt | date: 'medium' }}</span
                >
              </div>
            </div>
          </div>

          <div class="action-panel">
            @if (book()?.status === 'published') {
              <h3>Published Book</h3>
              <p>This book is currently visible to the public.</p>
              <div class="action-buttons">
                <button
                  class="btn-reject"
                  (click)="updateStatus('rejected', 'Suspended by admin')"
                >
                  Suspend Book
                </button>
              </div>
            } @else if (book()?.status === 'pending') {
              <h3>Pending Approval</h3>
              <p>This book requires admin approval to be published.</p>
              <div class="action-buttons">
                <button class="btn-approve" (click)="updateStatus('published')">
                  Approve & Publish
                </button>
                <button class="btn-reject" (click)="rejectBook()">
                  Reject Book
                </button>
              </div>
            } @else if (book()?.status === 'rejected') {
              <h3>Rejected Book</h3>
              <p><strong>Reason:</strong> {{ book()?.rejectionReason }}</p>
              <div class="action-buttons">
                <button class="btn-approve" (click)="updateStatus('published')">
                  Republish Book
                </button>
              </div>
            }
          </div>
        </header>

        <section class="book-content-preview">
          <h2>Content Preview</h2>
          <div class="preview-box">
            @if (chapters().length === 0) {
              <p class="no-content">No chapters available for this book.</p>
            } @else {
              <div class="chapter-content" [innerHTML]="chapters()[0].content"></div>
            }
          </div>
        </section>
      }
    </div>
  `,
  styles: [
    `
      .admin-page {
        padding: 8px 0;
      }
      .breadcrumb {
        margin-bottom: 24px;
      }
      .breadcrumb a {
        color: var(--ink-soft);
        text-decoration: none;
        font-size: 14px;
        font-weight: 500;
      }
      .breadcrumb a:hover {
        color: var(--forest);
      }

      .loading-state {
        padding: 48px;
        text-align: center;
        color: var(--ink-soft);
        background: var(--card);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-m);
      }

      .book-header {
        display: flex;
        gap: 48px;
        background: var(--card);
        padding: 32px;
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-m);
        margin-bottom: 32px;
      }
      .header-content {
        display: flex;
        gap: 32px;
        flex-grow: 1;
      }

      .book-cover {
        width: 140px;
        height: 210px;
        background-size: cover;
        background-position: center;
        border-radius: var(--radius-s);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        flex-shrink: 0;
      }

      .book-info h1 {
        font-family: var(--display);
        font-size: 32px;
        color: var(--ink);
        margin: 12px 0 8px 0;
        line-height: 1.2;
      }
      .author {
        font-size: 15px;
        color: var(--ink-soft);
        margin-bottom: 24px;
      }
      .author strong {
        color: var(--ink);
      }

      .status-badge {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 100px;
        font-size: 12px;
        font-weight: 600;
        text-transform: capitalize;
      }
      .status-badge.pending {
        background: #fff7ed;
        color: #c2410c;
      }
      .status-badge.published {
        background: var(--forest-tint);
        color: var(--forest-deep);
      }
      .status-badge.rejected {
        background: var(--rose-tint);
        color: var(--rose);
      }

      .metadata {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .meta-item {
        font-size: 14px;
        color: var(--ink-soft);
      }
      .meta-item strong {
        color: var(--ink);
      }

      .action-panel {
        width: 300px;
        background: var(--sd-icon-btn);
        padding: 24px;
        border-radius: var(--radius-s);
        border: 1px solid var(--border-soft);
        flex-shrink: 0;
      }
      .action-panel h3 {
        font-family: var(--display);
        font-size: 18px;
        margin-bottom: 8px;
        color: var(--ink);
      }
      .action-panel p {
        font-size: 13px;
        color: var(--ink-soft);
        line-height: 1.5;
        margin-bottom: 24px;
      }

      .action-buttons {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .action-buttons button {
        width: 100%;
        padding: 12px;
        border-radius: var(--radius-s);
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        border: 1px solid transparent;
      }
      .btn-approve {
        background: var(--forest);
        color: #fff;
      }
      .btn-approve:hover {
        background: var(--forest-deep);
      }
      .btn-reject {
        background: var(--card);
        border-color: var(--rose);
        color: var(--rose);
      }
      .btn-reject:hover {
        background: var(--rose-tint);
      }

      .book-content-preview h2 {
        font-family: var(--display);
        font-size: 20px;
        color: var(--ink);
        margin-bottom: 16px;
      }
      .preview-box {
        background: var(--card);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-m);
        padding: 48px;
        max-width: 800px;
        max-height: 500px;
        overflow-y: auto;
      }
      .chapter-content {
        font-size: 16px;
        line-height: 1.8;
        color: var(--ink);
      }
      .no-content {
        color: var(--ink-soft);
        font-style: italic;
        text-align: center;
      }
    `,
  ],
})
export class BookDetailComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  adminService = inject(AdminService);
  bookService = inject(BookService);
  confirmService = inject(ConfirmService);

  book = signal<AdminBook | null>(null);
  loading = signal(true);
  
  chapters = signal<any[]>([]);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.adminService.getBookDetails(id).subscribe({
        next: (data) => {
          this.book.set(data);
          this.loadChapters(id);
        },
        error: () => {
          this.loading.set(false);
          this.router.navigate(['/admin/books']);
        },
      });
    }
  }

  loadChapters(bookId: string) {
    this.bookService.getChapters(bookId).subscribe({
      next: (data) => {
        this.chapters.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load chapters', err);
        this.loading.set(false);
      }
    });
  }

  updateStatus(status: string, reason?: string) {
    if (!this.book()) return;

    this.confirmService.confirm(
      'Confirm Action',
      `Are you sure you want to mark this book as ${status}?`,
      true,
      'Confirm',
      'Cancel'
    ).subscribe((confirmed) => {
      if (confirmed) {
        this.adminService
          .updateBookStatus(this.book()!._id, status, reason)
          .subscribe({
            next: (updated) => this.book.set(updated),
          });
      }
    });
  }

  rejectBook() {
    // Note: If you want to replace prompt() with ConfirmService you'll need an input modal.
    // For now we leave prompt as is or use a custom component, but since it wasn't requested, we keep it simple.
    const reason = prompt('Please provide a reason for rejection:');
    if (reason !== null) {
      this.updateStatus('rejected', reason);
    }
  }
}

