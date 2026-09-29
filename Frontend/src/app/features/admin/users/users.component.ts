import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminUser } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page">
      <header class="page-header">
        <div class="header-left">
          <h1>User Management</h1>
          <p>View and manage all registered platform users.</p>
        </div>
        <div class="header-right">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="currentPage.set(1)"
            placeholder="Search users by name or email..."
            class="search-input"
          />
        </div>
      </header>

      @if (loading()) {
        <div class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
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
                  <td><div class="skeleton-text skeleton-sub"></div></td>
                  <td><div class="skeleton-actions"></div></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <div class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (user of paginatedUsers(); track user._id) {
                <tr>
                  <td>
                    <div class="title-cell">
                      <span class="user-name">{{ user.username }}</span>
                      <span class="user-email">{{ user.email }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="role-badge">{{ user.role }}</span>
                  </td>
                  <td>
                    <span class="status-badge" [ngClass]="user.status">{{
                      user.status
                    }}</span>
                    @if (user.status === 'suspended' && user.suspendedUntil) {
                      <div class="suspended-time-hint">Until {{ user.suspendedUntil | date: 'short' }}</div>
                    } @else if (user.status === 'suspended') {
                      <div class="suspended-time-hint">Permanent</div>
                    }
                  </td>
                  <td class="date-cell">
                    {{ user.createdAt | date: 'mediumDate' }}
                  </td>
                  <td>
                    <div class="action-buttons">
                      @if (
                        user.status === 'active' && user.role !== 'superadmin'
                      ) {
                        <button
                          class="btn-reject"
                          (click)="openSuspendModal(user)"
                        >
                          Suspend
                        </button>
                      } @else if (user.status === 'suspended') {
                        <button
                          class="btn-approve"
                          (click)="reactivateUser(user)"
                        >
                          Reactivate
                        </button>
                      }
                      @if (user.role !== 'superadmin') {
                        <button class="btn-delete" (click)="deleteUser(user)">
                          Delete
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

      @if (showSuspendModal() && userToSuspend()) {
        <div class="modal-backdrop" (click)="closeSuspendModal()">
          <div class="suspend-modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Suspend User</h3>
              <button class="close-btn" (click)="closeSuspendModal()">✕</button>
            </div>
            <p class="modal-desc">
              Choose the suspension duration for <strong>{{ userToSuspend()?.username }}</strong>:
            </p>
            <div class="duration-options">
              <label class="duration-option" [class.selected]="suspendDuration === '24h'">
                <input type="radio" name="duration" value="24h" [(ngModel)]="suspendDuration" />
                <span>24 Hours</span>
              </label>
              <label class="duration-option" [class.selected]="suspendDuration === '48h'">
                <input type="radio" name="duration" value="48h" [(ngModel)]="suspendDuration" />
                <span>48 Hours</span>
              </label>
              <label class="duration-option" [class.selected]="suspendDuration === '1w'">
                <input type="radio" name="duration" value="1w" [(ngModel)]="suspendDuration" />
                <span>1 Week</span>
              </label>
              <label class="duration-option" [class.selected]="suspendDuration === '1m'">
                <input type="radio" name="duration" value="1m" [(ngModel)]="suspendDuration" />
                <span>1 Month</span>
              </label>
              <label class="duration-option" [class.selected]="suspendDuration === 'permanent'">
                <input type="radio" name="duration" value="permanent" [(ngModel)]="suspendDuration" />
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

      .loading-state {
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

      .role-badge {
        font-size: 13px;
        font-weight: 500;
        color: var(--ink-soft);
        text-transform: capitalize;
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
      .btn-delete {
        background: #dc2626;
        color: #fff;
      }
      .btn-delete:hover {
        background: #b91c1c;
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
        color: #94a3b8;
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
      .suspended-time-hint {
        font-size: 0.75rem;
        color: #dc2626;
        margin-top: 4px;
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
export class UsersComponent implements OnInit {
  adminService = inject(AdminService);
  users = signal<AdminUser[]>([]);
  searchQuery = signal('');
  loading = signal(true);

  showSuspendModal = signal(false);
  userToSuspend = signal<AdminUser | null>(null);
  suspendDuration = '24h';

  openSuspendModal(user: AdminUser) {
    this.userToSuspend.set(user);
    this.suspendDuration = '24h';
    this.showSuspendModal.set(true);
  }

  closeSuspendModal() {
    this.showSuspendModal.set(false);
    this.userToSuspend.set(null);
  }

  confirmSuspend() {
    const user = this.userToSuspend();
    if (!user) return;
    this.adminService
      .updateUserStatus(user._id, 'suspended', this.suspendDuration)
      .subscribe(() => {
        this.closeSuspendModal();
        this.loadUsers();
      });
  }

  reactivateUser(user: AdminUser) {
    if (confirm(`Are you sure you want to reactivate user "${user.username}"?`)) {
      this.adminService.updateUserStatus(user._id, 'active').subscribe(() => {
        this.loadUsers();
      });
    }
  }

  filteredUsers = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.users();
    return this.users().filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    );
  });

  currentPage = signal(1);
  itemsPerPage = 30;

  paginatedUsers = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredUsers().slice(startIndex, startIndex + this.itemsPerPage);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredUsers().length / this.itemsPerPage)));

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.currentPage.set(1);
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleStatus(user: AdminUser, status: string) {
    if (confirm(`Are you sure you want to mark this user as ${status}?`)) {
      this.adminService.updateUserStatus(user._id, status).subscribe(() => {
        this.loadUsers();
      });
    }
  }

  deleteUser(user: AdminUser) {
    if (
      confirm(
        `Are you absolutely sure you want to permanently delete user "${user.username}"? All their books, chapters, and records will be deleted forever.`,
      )
    ) {
      if (
        confirm(`FINAL CONFIRMATION: Permanently delete "${user.username}"?`)
      ) {
        this.adminService.deleteUser(user._id).subscribe(() => {
          this.loadUsers();
        });
      }
    }
  }
}

