import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { AdminService, AdminBook } from '../../../core/services/admin.service';

@Component({
  selector: 'app-book-reports',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-page">
      <header class="page-header">
        <div class="header-left">
          <a [routerLink]="['/admin/books']" class="back-link">← Back to Books</a>
          <h1>Reports for "{{ book()?.title }}"</h1>
          <p>Total Reports: {{ book()?.reportCount || 0 }}</p>
        </div>
      </header>

      @if (loading()) {
        <div class="loading-state">Loading reports...</div>
      } @else if (!book()?.reports || book()?.reports?.length === 0) {
        <div class="empty-state">No reports found for this book.</div>
      } @else {
        <div class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Subject / Reason</th>
                <th>Reporter</th>
                <th>Comment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              @for (report of book()?.reports; track report.createdAt || $index) {
                <tr>
                  <td class="reason-cell">
                    <strong>{{ report.reason }}</strong>
                  </td>
                  <td>
                    <div class="user-info">
                      @if (report.user.avatar) {
                        <img [src]="report.user.avatar" alt="avatar" class="avatar-sm" />
                      } @else {
                        <div class="avatar-placeholder">
                          {{ (report.user.username ? report.user.username.charAt(0) : 'U') | uppercase }}
                        </div>
                      }
                      <span class="username">{{ report.user.username || 'Unknown User' }}</span>
                    </div>
                  </td>
                  <td class="comment-cell">
                    @if (report.comment) {
                      <div class="report-comment-text">"{{ report.comment }}"</div>
                    } @else {
                      <span class="no-comment">-</span>
                    }
                  </td>
                  <td class="date-cell">
                    {{ report.createdAt | date: 'mediumDate' }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .admin-page {
        padding: 40px;
        max-width: 1200px;
        margin: 0 auto;
      }
      .page-header {
        margin-bottom: 32px;
      }
      .back-link {
        display: inline-block;
        color: var(--forest);
        font-weight: 500;
        text-decoration: none;
        margin-bottom: 12px;
        font-size: 14px;
      }
      .back-link:hover {
        text-decoration: underline;
      }
      .page-header h1 {
        font-family: var(--display);
        font-size: 28px;
        color: var(--ink);
        margin-bottom: 8px;
      }
      .page-header p {
        color: var(--ink-soft);
        font-size: 15px;
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

      .table-container {
        background: var(--card);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-m);
        overflow: hidden;
      }
      .admin-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
      }
      .admin-table th {
        padding: 16px 24px;
        background: var(--sd-icon-btn);
        font-weight: 600;
        font-size: 13px;
        color: var(--ink-soft);
        border-bottom: 1px solid var(--border-soft);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .admin-table td {
        padding: 16px 24px;
        border-bottom: 1px solid var(--border-soft);
        vertical-align: top;
      }
      .admin-table tr:last-child td {
        border-bottom: none;
      }

      .reason-cell {
        color: var(--ink);
        font-size: 14px;
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .avatar-sm, .avatar-placeholder {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        object-fit: cover;
      }
      .avatar-placeholder {
        background: var(--forest-tint);
        color: var(--forest-deep);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
      }
      .username {
        font-size: 14px;
        color: var(--ink);
        font-weight: 500;
      }

      .comment-cell {
        max-width: 400px;
      }
      .report-comment-text {
        font-size: 13px;
        color: var(--ink-soft);
        font-style: italic;
        line-height: 1.5;
        background: var(--sd-icon-btn);
        padding: 8px 12px;
        border-radius: 4px;
        border-left: 2px solid var(--border-soft);
        margin: 0;
      }
      .no-comment {
        color: var(--ink-faint);
      }

      .date-cell {
        font-size: 13px;
        color: var(--ink-soft);
      }
    `,
  ],
})
export class BookReportsComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  adminService = inject(AdminService);

  bookId = '';
  book = signal<AdminBook | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.bookId = id;
        this.loadBook();
      } else {
        this.router.navigate(['/admin/books']);
      }
    });
  }

  loadBook() {
    this.loading.set(true);
    this.adminService.getBookDetails(this.bookId).subscribe({
      next: (data) => {
        this.book.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/admin/books']);
      },
    });
  }
}
