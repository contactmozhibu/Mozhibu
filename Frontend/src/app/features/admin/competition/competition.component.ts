import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService, AdminBook } from '../../../core/services/admin.service';
import { ApiService } from '../../../core/services/api.service';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-admin-competition',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="admin-page-container">
      <div
        class="page-header"
        style="display: flex; justify-content: space-between; align-items: center;"
      >
        <div>
          <h1>{{ isCompetitionClosed ? 'Start a New Competition' : 'Competition Management' }}</h1>
          <p>
            {{ isCompetitionClosed ? 'The previous competition has concluded. Configure the details below to start a new one.' : 'Manage the active competition banner, notify writers, and pick a winner.' }}
          </p>
        </div>
        @if (!isCompetitionClosed) {
          <button
            class="btn-primary"
            (click)="notifyWriters()"
            [disabled]="isNotifying || !config.isActive"
          >
            {{ isNotifying ? 'Notifying...' : 'Broadcast Invite to Writers' }}
          </button>
        }
      </div>

      <div class="card">
        @if (isLoading) {
          <div class="loading">Loading configuration...</div>
        } @else {
          <form (ngSubmit)="saveConfig()" #configForm="ngForm">
            <div class="toggle-group">
              <label class="toggle">
                <input
                  type="checkbox"
                  name="isActive"
                  [(ngModel)]="config.isActive"
                  (change)="saveConfig()"
                />
                <span class="slider"></span>
              </label>
              <div class="toggle-info">
                <span class="toggle-title">Enable Banner</span>
                <span class="toggle-desc"
                  >Show the competition banner on the homepage.</span
                >
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label>Tag (Eyebrow Text)</label>
                <input
                  type="text"
                  name="tag"
                  [(ngModel)]="config.tag"
                  required
                  placeholder="e.g. Writing competition"
                />
              </div>

              <div class="form-group">
                <label>Main Title</label>
                <input
                  type="text"
                  name="title"
                  [(ngModel)]="config.title"
                  required
                  placeholder="e.g. The Twelve Tongues Prize 2026"
                />
              </div>
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea
                name="description"
                [(ngModel)]="config.description"
                rows="3"
                required
                placeholder="Description..."
              ></textarea>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label>End Date (Countdown Target)</label>
                <input
                  type="datetime-local"
                  name="endDate"
                  [(ngModel)]="config.endDate"
                  required
                />
              </div>

              <div class="form-group">
                <label>Button Text</label>
                <input
                  type="text"
                  name="buttonText"
                  [(ngModel)]="config.buttonText"
                  required
                  placeholder="e.g. Submit your story"
                />
              </div>
            </div>

            <div class="form-actions">
              <button
                type="submit"
                class="btn-primary"
                [disabled]="!configForm.valid || isSaving"
              >
                {{ isSaving ? (isCompetitionClosed ? 'Creating...' : 'Saving...') : (isCompetitionClosed ? 'Create New Competition' : 'Save Configuration') }}
              </button>
            </div>

            @if (successMessage) {
              <div class="alert success">{{ successMessage }}</div>
            }
            @if (errorMessage) {
              <div class="alert error">{{ errorMessage }}</div>
            }
          </form>
        }
      </div>

      <div class="card" style="margin-top: 24px;">
        <h2>Submitted Entries</h2>
        
        @if (isCompetitionClosed) {
          <div class="alert" style="background: var(--forest-tint); border: 1px solid var(--forest); color: var(--forest-deep); border-radius: var(--radius-s); padding: 16px;">
            <strong>This competition has concluded!</strong> Please configure and start a new competition above to begin accepting new entries.
          </div>
        } @else {
          <p style="color: var(--ink-soft); font-size: 14px; margin-bottom: 24px;">
            All books published with a competition tag. The currently active tag
            is: <strong>{{ config.tag || 'None' }}</strong>
          </p>

          @if (isLoadingEntries) {
            <div class="loading">Loading entries...</div>
          } @else if (entries.length === 0) {
            <div class="empty-state">
              No entries found for this competition tag yet.
            </div>
          } @else {
            <div class="table-container">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th>Book Name</th>
                    <th>Submitted Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let entry of entries">
                    <td>
                      <strong>{{ entry.author.username }}</strong>
                    </td>
                    <td>
                      <div style="display: flex; align-items: center; gap: 12px;">
                        <img 
                          [src]="entry.cover || api.getFallbackCover()" 
                          alt="Book cover"
                          (error)="onCoverError($event)"
                          style="width: 32px; height: 48px; object-fit: cover; border-radius: var(--radius-s);"
                        />
                        <span>{{ entry.title }}</span>
                      </div>
                    </td>
                    <td>{{ entry.submittedAt | date: 'mediumDate' }}</td>
                    <td>
                      <div style="display: flex; align-items: center; gap: 16px;">
                        <a [routerLink]="['/admin/books', entry._id]" class="btn-outline btn-small" style="text-decoration: none;">View Book</a>
                        <label class="checkbox-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                          <input 
                            type="checkbox" 
                            [checked]="selectedEntries.includes(entry._id)"
                            (change)="toggleSelection(entry._id)"
                            [disabled]="isAnnouncing"
                          />
                          Pick Winner
                        </label>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              
              <div class="form-actions" style="margin-top: 24px; border-top: 1px solid var(--border); padding-top: 24px;">
                <button
                  class="btn-primary"
                  (click)="announceWinners()"
                  [disabled]="isAnnouncing || selectedEntries.length === 0"
                >
                  Announce Winners ({{ selectedEntries.length }} selected)
                </button>
              </div>
            </div>
          }
        }
      </div>
      <div class="card" style="margin-top: 24px;">
        <h2>Competition History</h2>
        <p style="color: var(--ink-soft); font-size: 14px; margin-bottom: 24px;">
          Past competitions with announced winners.
        </p>
        
        @if (history.length === 0) {
          <div class="empty-state">No past competitions found.</div>
        } @else {
          <div class="table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Title</th>
                  <th>Tag</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let comp of paginatedHistory">
                  <td>{{ comp.createdAt | date: 'mediumDate' }}</td>
                  <td>{{ comp.createdAt | date: 'EEEE' }}</td>
                  <td><strong>{{ comp.title }}</strong></td>
                  <td><span class="badge tag-badge">{{ comp.tag }}</span></td>
                  <td>
                    <span class="badge" [ngClass]="comp.winnerBookIds?.length ? 'success-badge' : 'neutral-badge'">
                      {{ comp.winnerBookIds?.length ? 'Winners Picked' : 'Closed' }}
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <a [routerLink]="['/admin/competition/history', comp._id]" class="btn-outline btn-small">View Details</a>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <div class="pagination" *ngIf="history.length > historyPageSize">
              <button 
                class="btn-outline btn-small" 
                [disabled]="historyPage === 1"
                (click)="historyPage = historyPage - 1">
                Previous
              </button>
              <span style="font-size: 14px; color: var(--ink-soft);">
                Page {{ historyPage }} of {{ Math.ceil(history.length / historyPageSize) }}
              </span>
              <button 
                class="btn-outline btn-small" 
                [disabled]="historyPage * historyPageSize >= history.length"
                (click)="historyPage = historyPage + 1">
                Next
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styleUrls: ['./competition.component.css'],
})
export class AdminCompetitionComponent implements OnInit {
  private adminService = inject(AdminService);
  api = inject(ApiService);
  private confirmService = inject(ConfirmService);

  get isCompetitionClosed(): boolean {
    return this.config?.winnerBookIds?.length > 0;
  }

  isLoading = true;
  isLoadingEntries = false;
  isSaving = false;
  isNotifying = false;
  isAnnouncing = false;
  successMessage = '';
  errorMessage = '';

  entries: AdminBook[] = [];
  selectedEntries: string[] = [];

  config: any = {
    isActive: false,
    tag: '',
    title: '',
    description: '',
    endDate: '',
    buttonText: '',
  };
  history: any[] = [];
  
  historyPage = 1;
  historyPageSize = 10;
  Math = Math;

  get paginatedHistory() {
    const startIndex = (this.historyPage - 1) * this.historyPageSize;
    return this.history.slice(startIndex, startIndex + this.historyPageSize);
  }

  ngOnInit() {
    this.loadConfig();
  }

  loadEntries() {
    this.isLoadingEntries = true;
    this.adminService.getCompetitionEntries().subscribe({
      next: (entries) => {
        this.entries = entries;
        this.isLoadingEntries = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoadingEntries = false;
      },
    });
  }

  loadConfig() {
    this.adminService.getCompetitionConfig().subscribe({
      next: (data) => {
        this.config = { ...data };
        if (this.config.endDate) {
          // Format for datetime-local input
          const date = new Date(this.config.endDate);
          this.config.endDate = new Date(
            date.getTime() - date.getTimezoneOffset() * 60000,
          )
            .toISOString()
            .slice(0, 16);
        }

        // If the latest competition is closed, clear the form to start fresh
        if (this.isCompetitionClosed) {
           this.config.tag = '';
           this.config.title = '';
           this.config.description = '';
           this.config.endDate = '';
        } else {
           // Only load entries if the competition is still active
           this.loadEntries();
        }

        this.isLoading = false;
        this.loadHistory();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.errorMessage = 'Failed to load configuration';
      },
    });
  }

  loadHistory() {
    this.adminService.getCompetitionHistory().subscribe({
      next: (history) => {
        this.history = history;
      },
      error: (err) => console.error(err)
    });
  }

  saveConfig() {
    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    const payload = { ...this.config };
    if (payload.endDate) {
      payload.endDate = new Date(payload.endDate).toISOString();
    }

    this.adminService.updateCompetitionConfig(payload).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.successMessage = 'Banner configuration updated successfully!';
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = 'Failed to save configuration';
      },
    });
  }

  notifyWriters() {
    this.confirmService.confirm(
      'Notify Writers',
      'This will send a notification to ALL writers on the platform to join this competition. Proceed?'
    ).subscribe((confirmed) => {
      if (!confirmed) return;

      this.isNotifying = true;
      this.successMessage = '';
      this.errorMessage = '';

      this.adminService
        .sendCompetitionNotification(
          `The "${this.config.title}" competition is now open! Click here to submit your story.`,
        )
        .subscribe({
          next: () => {
            this.isNotifying = false;
            this.successMessage = 'All writers have been notified successfully.';
            setTimeout(() => this.successMessage = '', 3000);
          },
          error: (err) => {
            console.error(err);
            this.isNotifying = false;
            this.errorMessage = 'Failed to send notifications.';
            setTimeout(() => this.errorMessage = '', 3000);
          },
        });
    });
  }

  onCoverError(event: any) {
    event.target.src = this.api.getFallbackCover();
  }

  toggleSelection(bookId: string) {
    const index = this.selectedEntries.indexOf(bookId);
    if (index > -1) {
      this.selectedEntries.splice(index, 1);
    } else {
      this.selectedEntries.push(bookId);
    }
  }

  announceWinners() {
    if (this.selectedEntries.length === 0) return;

    this.confirmService.confirm(
      'Announce Winners',
      `Are you sure? This will immediately end the competition, set ${this.selectedEntries.length} book(s) as the winners, and notify EVERYONE on the platform!`,
      true, 
      'Yes, Announce Winners'
    ).subscribe((confirmed) => {
      if (!confirmed) return;

      this.isAnnouncing = true;
      this.successMessage = '';
      this.errorMessage = '';

      this.adminService.announceCompetitionWinner(this.selectedEntries).subscribe({
        next: (res) => {
          this.isAnnouncing = false;
          this.config = res.competition;
          this.selectedEntries = [];
          this.loadConfig();
          this.successMessage = 'Winners announced successfully! The competition is now closed.';
          setTimeout(() => this.successMessage = '', 5000);
        },
        error: (err) => {
          console.error(err);
          this.isAnnouncing = false;
          this.errorMessage = 'Failed to announce winners.';
          setTimeout(() => this.errorMessage = '', 5000);
        },
      });
    });
  }
}
