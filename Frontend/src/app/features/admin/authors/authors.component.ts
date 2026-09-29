import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  AdminService,
  AdminAuthor,
} from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-authors',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="admin-page">
      <header class="page-header">
        <div class="header-left">
          <h1>Author Management</h1>
          <p>Review author statistics and published works.</p>
        </div>
        <div class="header-right">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="currentPage.set(1)"
            placeholder="Search authors by name or email..."
            class="search-input"
          />
        </div>
      </header>

      @if (loading()) {
        <div class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Author</th>
                <th>Published Books</th>
                <th>Total Reads</th>
                <th>Status</th>
                <th>Joined</th>
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
                  <td><div class="skeleton-badge"></div></td>
                  <td><div class="skeleton-badge"></div></td>
                  <td><div class="skeleton-text skeleton-sub"></div></td>
                  <td><div class="skeleton-actions"></div></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else if (authors().length === 0) {
        <div class="empty-state">No authors found on the platform.</div>
      } @else {
        <div class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Author</th>
                <th>Published Books</th>
                <th>Total Reads</th>
                <th>Status</th>
                <th>Joined</th>
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
                  <td>
                    <span class="stat-badge">{{ author.publishedCount }}</span>
                  </td>
                  <td>
                    <span class="stat-text">{{
                      author.totalReads | number
                    }}</span>
                  </td>
                  <td>
                    <span class="status-badge" [ngClass]="author.status">{{
                      author.status
                    }}</span>
                  </td>
                  <td class="date-cell">
                    {{ author.joinedAt | date: 'mediumDate' }}
                  </td>
                  <td>
                    <div class="action-buttons">
                      <a
                        [routerLink]="['/admin/authors', author._id]"
                        class="btn-outline"
                        >View Profile</a
                      >
                      <button class="btn-delete" (click)="deleteAuthor(author)">
                        Delete
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
        background: #f8fafc;
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

      .stat-badge {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 100px;
        font-size: 13px;
        font-weight: 600;
        background: var(--paper-warm);
        color: var(--ink);
      }
      .stat-text {
        font-size: 14px;
        font-weight: 500;
        color: var(--ink-soft);
      }

      .status-badge {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 100px;
        font-size: 12px;
        font-weight: 600;
        text-transform: capitalize;
      }
      .status-badge.active {
        background: var(--forest-tint);
        color: var(--forest-deep);
      }
      .status-badge.suspended {
        background: var(--rose-tint);
        color: var(--rose);
      }

      .date-cell {
        font-size: 14px;
        color: var(--ink-soft);
      }

      .action-buttons {
        display: flex;
        gap: 8px;
      }
      .btn-outline {
        padding: 6px 12px;
        border-radius: var(--radius-s);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        border: 1px solid var(--border-soft);
        background: var(--card);
        color: var(--ink);
        text-decoration: none;
      }
      .btn-outline:hover {
        border-color: var(--forest);
        color: var(--forest);
      }
      .btn-delete {
        padding: 6px 12px;
        border-radius: var(--radius-s);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
        background: #dc2626;
        color: #fff;
      }
      .btn-delete:hover {
        background: #b91c1c;
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
export class AuthorsComponent implements OnInit {
  adminService = inject(AdminService);
  authors = signal<AdminAuthor[]>([]);
  searchQuery = signal('');
  loading = signal(true);

  filteredAuthors = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.authors();
    return this.authors().filter(
      (a) =>
        a.username.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q),
    );
  });

  currentPage = signal(1);
  itemsPerPage = 30;

  paginatedAuthors = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredAuthors().slice(startIndex, startIndex + this.itemsPerPage);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredAuthors().length / this.itemsPerPage)));

  ngOnInit() {
    this.loadAuthors();
  }

  loadAuthors() {
    this.loading.set(true);
    this.currentPage.set(1);
    this.adminService.getAuthors().subscribe({
      next: (data) => {
        this.authors.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  deleteAuthor(author: AdminAuthor) {
    if (
      confirm(
        `Are you absolutely sure you want to permanently delete author "${author.username}" and all their published books?`,
      )
    ) {
      if (
        confirm(
          `FINAL CONFIRMATION: Permanently delete author "${author.username}"?`,
        )
      ) {
        this.adminService.deleteUser(author._id).subscribe(() => {
          this.loadAuthors();
        });
      }
    }
  }
}

