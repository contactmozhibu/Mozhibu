import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AdminService,
  PendingAuthor,
} from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-author-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page">
      <header class="page-header">
        <div class="header-left">
          <h1>Author Approvals</h1>
          <p>Review users requesting to become authors on the platform.</p>
        </div>
        <div class="header-right">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="currentPage.set(1)"
            placeholder="Search by name or email..."
            class="search-input"
          />
        </div>
      </header>

      @if (loading()) {
        <div class="loading-state">Loading pending requests...</div>
      } @else if (pendingAuthors().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h3>All caught up!</h3>
          <p>There are no pending author requests to review right now.</p>
        </div>
      } @else {
        <div class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Request Date</th>
                <th>Current Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (author of paginatedAuthors(); track author._id) {
                <tr>
                  <td>
                    <div class="title-cell">
                      <span class="user-name">{{ author.username }}</span>
                      <span class="user-email">{{ author.email }}</span>
                    </div>
                  </td>
                  <td class="date-cell">
                    {{ author.createdAt | date: 'mediumDate' }}
                  </td>
                  <td>
                    <span class="status-badge pending">Pending</span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button
                        class="btn btn-primary btn-sm"
                        (click)="updateStatus(author._id, 'approve')"
                        [disabled]="processingId() === author._id"
                      >
                        {{
                          processingId() === author._id
                            ? 'Processing...'
                            : 'Approve'
                        }}
                      </button>
                      <button
                        class="btn btn-danger btn-sm"
                        (click)="updateStatus(author._id, 'reject')"
                        [disabled]="processingId() === author._id"
                      >
                        Reject
                      </button>
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

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .search-input {
        padding: 10px 16px;
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-m);
        width: 300px;
        font-size: 14px;
        outline: none;
      }
      .search-input:focus {
        border-color: var(--forest);
      }
      .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 16px;
        padding: 16px;
        background: var(--card);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-m);
        margin-top: 16px;
      }
      .pagination button {
        padding: 6px 12px;
        border-radius: var(--radius-s);
        border: 1px solid var(--border-soft);
        background: var(--card);
        color: var(--ink);
        cursor: pointer;
        font-family: var(--body);
        font-size: 14px;
      }
      .pagination button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .loading-state,
      .empty-state {
        padding: 64px;
        text-align: center;
        color: var(--ink-soft);
        background: var(--card);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-m);
      }
      .empty-icon {
        display: flex;
        justify-content: center;
        margin-bottom: 16px;
        color: var(--forest);
      }
      .empty-icon svg {
        width: 48px;
        height: 48px;
      }
      .empty-state h3 {
        font-family: var(--display);
        font-size: 20px;
        color: var(--ink);
        margin-bottom: 8px;
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
      .user-name {
        font-family: var(--display);
        font-weight: 600;
        font-size: 15px;
        color: var(--ink);
      }
      .user-email {
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
        background: #fef3c7;
        color: #d97706;
      }

      .date-cell {
        font-size: 14px;
        color: var(--ink-soft);
      }

      .action-buttons {
        display: flex;
        gap: 8px;
      }
      .btn-sm {
        padding: 6px 12px;
        font-size: 13px;
        border-radius: var(--radius-s);
      }
      .btn-danger {
        background: var(--rose);
        color: #fff;
        border: 1px solid var(--rose);
      }
      .btn-danger:hover {
        background: #e11d48;
      }
    `,
  ],
})
export class AuthorApprovalsComponent implements OnInit {
  adminService = inject(AdminService);

  pendingAuthors = signal<PendingAuthor[]>([]);
  searchQuery = signal('');
  loading = signal(true);
  processingId = signal<string | null>(null);

  filteredAuthors = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.pendingAuthors();
    return this.pendingAuthors().filter(
      (a) =>
        a.username.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q),
    );
  });

  currentPage = signal(1);
  itemsPerPage = 10;

  paginatedAuthors = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredAuthors().slice(startIndex, startIndex + this.itemsPerPage);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredAuthors().length / this.itemsPerPage)));

  ngOnInit() {
    this.loadPendingAuthors();
  }

  loadPendingAuthors() {
    this.loading.set(true);
    this.adminService.getPendingAuthors().subscribe({
      next: (data) => {
        this.pendingAuthors.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  updateStatus(id: string, action: 'approve' | 'reject') {
    if (confirm(`Are you sure you want to ${action} this author request?`)) {
      this.processingId.set(id);
      this.adminService.updatePendingAuthorStatus(id, action).subscribe({
        next: () => {
          // Remove from list
          this.pendingAuthors.update((list) =>
            list.filter((a) => a._id !== id),
          );
          this.processingId.set(null);
        },
        error: () => {
          alert('Failed to update author status');
          this.processingId.set(null);
        },
      });
    }
  }
}

