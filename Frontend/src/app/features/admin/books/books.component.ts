import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminBook } from '../../../core/services/admin.service';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-admin-books',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="admin-page">
      <header class="page-header">
        <div class="header-left">
          <h1>Book Management</h1>
          <p>Manage published books across the platform.</p>
        </div>
        <div class="header-actions">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="currentPage.set(1)"
            placeholder="Search by title or author..."
            class="search-input"
          />
          <select
            [(ngModel)]="statusFilter"
            (change)="loadBooks()"
            class="filter-select"
          >
            <option value="all">All Books</option>
            <option value="pending">Pending Approval</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="suspended">Suspended</option>
            <option value="reported">Reported Queue</option>
          </select>
        </div>
      </header>

      @if (loading()) {
        <div class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Title & Author</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (i of [1,2,3,4,5,6]; track i) {
                <tr class="skeleton-row">
                  <td>
                    <div class="skeleton-text skeleton-title"></div>
                    <div class="skeleton-text skeleton-sub"></div>
                  </td>
                  <td><div class="skeleton-badge"></div></td>
                  <td><div class="skeleton-text skeleton-sub"></div></td>
                  <td><div class="skeleton-actions"></div></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else if (books().length === 0) {
        <div class="empty-state">
          No books found matching the current filter.
        </div>
      } @else {
        <div class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Title & Author</th>
                <th>Status</th>
                <th>
                  {{ statusFilter === 'reported' ? 'Reports' : 'Submitted' }}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (book of paginatedBooks(); track book._id) {
                <tr>
                  <td>
                    <div class="title-cell">
                      <a
                        [routerLink]="['/admin/books', book._id]"
                        class="book-title"
                        >{{ book.title }}</a
                      >
                      <span class="book-author"
                        >by {{ book.author.username }}</span
                      >
                    </div>
                  </td>
                  <td>
                    <span class="status-badge" [ngClass]="book.status">{{
                      book.status
                    }}</span>
                  </td>
                  <td class="date-cell">
                    @if (statusFilter === 'reported') {
                      <div class="reports-info">
                        <span class="report-count-text">
                          {{ book.reportCount }} {{ book.reportCount === 1 ? 'Report' : 'Reports' }}
                        </span>
                        @if (book.reports && book.reports.length > 0) {
                          <a [routerLink]="['/admin/books', book._id, 'reports']" class="view-reports-link">
                            View Reports →
                          </a>
                        }
                      </div>
                    } @else {
                      {{ book.submittedAt | date: 'mediumDate' }}
                    }
                  </td>
                  <td>
                    <div class="action-buttons">
                      @if (book.status === 'published') {
                        <button
                          class="btn-reject"
                          (click)="updateStatus(book, 'suspended')"
                        >
                          Suspend
                        </button>
                        @if (statusFilter === 'reported') {
                          <button
                            class="btn-clear"
                            title="Dismiss Reports"
                            (click)="clearReports(book)"
                          >
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        }
                      } @else if (book.status === 'pending') {
                        <button
                          class="btn-approve"
                          (click)="updateStatus(book, 'published')"
                        >
                          Approve
                        </button>
                        <button
                          class="btn-reject"
                          (click)="updateStatus(book, 'rejected')"
                        >
                          Reject
                        </button>
                      } @else if (
                        book.status === 'rejected' ||
                        book.status === 'suspended'
                      ) {
                        <button
                          class="btn-approve"
                          (click)="updateStatus(book, 'published')"
                        >
                          Republish
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        
        @if (totalPages() > 1) {
          <div class="pagination">
            <button [disabled]="currentPage() === 1" (click)="currentPage.set(currentPage() - 1)">Previous</button>
            <span>Page {{ currentPage() }} of {{ totalPages() }}</span>
            <button [disabled]="currentPage() === totalPages()" (click)="currentPage.set(currentPage() + 1)">Next</button>
          </div>
        }
      }
    </div>
  `,
  styles: [
    `
      .admin-page {
        padding: 8px 0;
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 32px;
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

      .header-actions {
        display: flex;
        gap: 12px;
        align-items: center;
      }
      .search-input {
        padding: 8px 12px;
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-s);
        width: 250px;
        font-family: var(--body);
        font-size: 14px;
        outline: none;
      }
      .search-input:focus {
        border-color: var(--forest);
      }
      .filter-select {
        padding: 8px 12px;
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-s);
        font-family: var(--body);
        font-size: 14px;
        outline: none;
        background: var(--card);
        cursor: pointer;
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
        vertical-align: middle;
      }
      .admin-table tr:last-child td {
        border-bottom: none;
      }

      .title-cell {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .book-title {
        font-family: var(--display);
        font-weight: 600;
        font-size: 15px;
        color: var(--ink);
        text-decoration: none;
      }
      .book-title:hover {
        color: var(--forest);
      }
      .book-author {
        font-size: 13px;
        color: var(--ink-faint);
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
        background: rgba(239, 68, 68, 0.1);
        color: #991b1b;
      }
      .status-badge.suspended {
        background: #fef3c7;
        color: #92400e;
      }

      .reports-info {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .view-reports-link {
        display: inline-block;
        color: var(--forest);
        font-size: 13px;
        font-weight: 500;
        text-decoration: none;
        margin-top: 6px;
      }
      .view-reports-link:hover {
        text-decoration: underline;
      }
      .report-count-text {
        font-size: 11px;
        color: var(--rose);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        display: inline-block;
      }
      .status-badge.draft {
        background: #f3f4f6;
        color: var(--sd-muted);
      }

      .action-buttons {
        display: flex;
        gap: 8px;
      }
      .action-buttons button {
        padding: 6px 12px;
        border-radius: var(--radius-s);
        font-size: 13px;
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
        border-color: var(--border-soft);
        color: var(--rose);
      }
      .btn-reject:hover {
        border-color: var(--rose);
        background: var(--rose-tint);
      }
      .btn-clear {
        padding: 6px;
        background: var(--card);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-s);
        color: var(--ink-soft);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .btn-clear:hover {
        background: #f1f5f9;
        color: var(--ink);
      }
      .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 16px;
        padding: 16px;
        background: var(--card);
        border-top: 1px solid var(--border-soft);
      }
      .pagination button {
        padding: 6px 12px;
        border-radius: var(--radius-s);
        border: 1px solid var(--border-soft);
        background: var(--card);
        cursor: pointer;
        font-family: var(--body);
        font-size: 14px;
      }
      .pagination button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `,
  ],
})
export class BooksComponent implements OnInit {
  adminService = inject(AdminService);
  private confirmService = inject(ConfirmService);

  books = signal<AdminBook[]>([]);
  searchQuery = signal('');
  loading = signal(true);
  statusFilter = 'all';

  filteredBooks = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.books();
    return this.books().filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.author && b.author.username.toLowerCase().includes(q)),
    );
  });

  currentPage = signal(1);
  itemsPerPage = 10;

  paginatedBooks = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredBooks().slice(startIndex, startIndex + this.itemsPerPage);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredBooks().length / this.itemsPerPage)));

  ngOnInit() {
    this.loadBooks();
  }

  loadBooks() {
    this.loading.set(true);
    this.currentPage.set(1);

    if (this.statusFilter === 'reported') {
      this.adminService.getReportedBooks().subscribe({
        next: (data) => {
          this.books.set(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    } else {
      this.adminService.getBooks(this.statusFilter).subscribe({
        next: (data) => {
          this.books.set(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    }
  }

  updateStatus(book: AdminBook, status: string, reason?: string) {
    this.confirmService.confirm(
      'Confirm Action',
      `Are you sure you want to mark this book as ${status}?`,
      true,
      'Confirm',
      'Cancel'
    ).subscribe((confirmed) => {
      if (confirmed) {
        this.adminService
          .updateBookStatus(book._id, status, reason)
          .subscribe(() => {
            this.loadBooks();
          });
      }
    });
  }

  rejectBook(book: AdminBook) {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason !== null) {
      this.updateStatus(book, 'rejected', reason);
    }
  }

  clearReports(book: AdminBook) {
    this.confirmService.confirm(
      'Dismiss Reports',
      `Are you sure you want to dismiss all reports for "${book.title}"?`,
      true,
      'Dismiss',
      'Cancel'
    ).subscribe((confirmed) => {
      if (confirmed) {
        this.adminService.clearBookReports(book._id).subscribe({
          next: () => {
            this.loadBooks();
          },
          error: (err) => {
            console.error('Failed to clear reports', err);
            this.confirmService.confirm('Error', 'Failed to clear reports', false, 'OK', '').subscribe();
          }
        });
      }
    });
  }
}

