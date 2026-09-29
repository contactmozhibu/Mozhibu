import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

interface ContactQuery {
  _id: string;
  name: string;
  email: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'solved';
  adminReply?: string;
  userId?: string;
  createdAt: string;
}

@Component({
  selector: 'app-contact-queries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="header">
        <h1>Contact Queries</h1>
        <p>Manage and respond to user inquiries from the Contact Us page.</p>
      </div>

      <div class="card">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Email</th>
                <th>Message</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let query of paginatedQueries()" [class.unread]="query.status === 'new'">
                <td class="text-nowrap">{{ query.createdAt | date:'mediumDate' }}</td>
                <td class="font-medium">
                  {{ query.name }}
                  <span *ngIf="query.userId" class="badge badge-user ml-2">User</span>
                </td>
                <td>{{ query.email }}</td>
                <td class="message-cell" [title]="query.message">
                  {{ query.message.length > 50 ? (query.message | slice:0:50) + '...' : query.message }}
                </td>
                <td>
                  <span class="badge" 
                        [class.badge-new]="query.status === 'new'" 
                        [class.badge-read]="query.status === 'read'"
                        [class.badge-replied]="query.status === 'replied' || query.status === 'solved'">
                    {{ query.status | titlecase }}
                  </span>
                </td>
                <td>
                  <div class="actions">
                    <button class="btn btn-sm btn-outline" (click)="viewQuery(query)">
                      View & Reply
                    </button>
                    <button 
                      *ngIf="query.status === 'new'"
                      class="btn btn-sm btn-outline-primary" 
                      (click)="markAsRead(query._id)"
                      [disabled]="isLoading()"
                    >
                      Mark as Read
                    </button>
                  </div>
                </td>
              </tr>
              
              <tr *ngIf="queries().length === 0 && !isLoading()">
                <td colspan="6" class="text-center py-8 text-gray-500">
                  No contact queries found.
                </td>
              </tr>
            </tbody>
          </table>
          <div *ngIf="isLoading()" class="loading-state">
            <div class="loader"></div>
            <p>Loading queries...</p>
          </div>
        </div>
        
        <div *ngIf="totalPages() > 1" class="pagination">
          <button [disabled]="currentPage() === 1" (click)="currentPage.set(currentPage() - 1)">Previous</button>
          <span>Page {{ currentPage() }} of {{ totalPages() }}</span>
          <button [disabled]="currentPage() === totalPages()" (click)="currentPage.set(currentPage() + 1)">Next</button>
        </div>
      </div>

      <!-- Modal for viewing full message -->
      <div class="modal-overlay" *ngIf="selectedQuery()" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Query Details</h2>
            <button class="close-btn" (click)="closeModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div class="detail-row">
              <span class="detail-label">Name:</span>
              <span class="detail-value">{{ selectedQuery()?.name }} <span *ngIf="selectedQuery()?.userId" class="badge badge-user text-xs">Registered User</span></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">{{ selectedQuery()?.email }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">{{ selectedQuery()?.createdAt | date:'medium' }}</span>
            </div>
            <div class="message-section">
              <span class="detail-label">Message:</span>
              <div class="full-message">{{ selectedQuery()?.message }}</div>
            </div>
            
            <div class="reply-section" *ngIf="selectedQuery()?.adminReply">
              <span class="detail-label">Admin Reply:</span>
              <div class="full-reply">{{ selectedQuery()?.adminReply }}</div>
            </div>
            
            <div class="reply-input-section" *ngIf="!selectedQuery()?.adminReply">
              <span class="detail-label">Write Reply:</span>
              <textarea 
                class="reply-textarea" 
                rows="4" 
                placeholder="Type your response to the user here..."
                [(ngModel)]="replyMessage"
              ></textarea>
              <div class="reply-help" *ngIf="selectedQuery()?.userId">
                This user is registered. They will receive a notification with this reply.
              </div>
            </div>
            
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline mr-2" (click)="closeModal()">Close</button>
            <button 
              *ngIf="!selectedQuery()?.adminReply"
              class="btn btn-primary" 
              (click)="submitReply()"
              [disabled]="!replyMessage || isReplying()"
            >
              {{ isReplying() ? 'Sending...' : 'Send Reply' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
      font-family: 'Inter', system-ui, sans-serif;
    }
    .header {
      margin-bottom: 24px;
    }
    .header h1 {
      font-size: 24px;
      font-weight: 600;
      color: var(--sd-text);
      margin-bottom: 8px;
    }
    .header p {
      color: var(--sd-muted);
      font-size: 14px;
    }
    .card {
      background: var(--sd-sidebar);
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .table-responsive {
      overflow-x: auto;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .table th, .table td {
      padding: 16px 24px;
      border-bottom: 1px solid var(--sd-border);
    }
    .table th {
      background: var(--sd-icon-btn);
      font-weight: 600;
      color: var(--sd-muted);
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .table td {
      font-size: 14px;
      color: var(--sd-text);
      vertical-align: middle;
    }
    .table tr:last-child td {
      border-bottom: none;
    }
    tr.unread td {
      background-color: var(--sd-icon-btn);
    }
    tr.unread td.font-medium {
      font-weight: 700;
    }
    .message-cell {
      max-width: 300px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--sd-muted);
    }
    .text-nowrap {
      white-space: nowrap;
    }
    .font-medium {
      font-weight: 500;
    }
    .text-center {
      text-align: center;
    }
    .py-8 {
      padding-top: 32px;
      padding-bottom: 32px;
    }
    .text-gray-500 {
      color: var(--sd-muted);
    }
    
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-new {
      background: rgba(59, 130, 246, 0.1);
      color: #1976d2;
    }
    .badge-read {
      background: var(--sd-icon-btn);
      color: var(--sd-muted);
    }
    .badge-replied {
      background: rgba(16, 185, 129, 0.1);
      color: #1e8e3e;
    }
    .badge-user {
      background: rgba(245, 158, 11, 0.1);
      color: #f57c00;
      margin-left: 8px;
    }
    .text-xs {
      font-size: 10px;
    }
    
    .btn {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .btn-sm {
      padding: 4px 10px;
      font-size: 12px;
    }
    .btn-outline {
      background: transparent;
      border: 1px solid #ddd;
      color: var(--sd-text);
    }
    .btn-outline:hover:not(:disabled) {
      background: var(--sd-icon-btn);
      border-color: var(--sd-border);
    }
    .btn-outline-primary {
      background: transparent;
      border: 1px solid #1976d2;
      color: #1976d2;
    }
    .btn-outline-primary:hover:not(:disabled) {
      background: rgba(59, 130, 246, 0.1);
    }
    .btn-primary {
      background: #111;
      color: #fff;
    }
    .btn-primary:hover:not(:disabled) {
      background: #333;
    }
    
    .actions {
      display: flex;
      gap: 8px;
    }
    
    .mr-2 {
      margin-right: 8px;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 24px;
    }
    .modal-content {
      background: var(--sd-sidebar);
      border-radius: 8px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }
    .modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--sd-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: var(--sd-muted);
      line-height: 1;
    }
    .close-btn:hover {
      color: var(--sd-text);
    }
    .modal-body {
      padding: 24px;
      overflow-y: auto;
    }
    .detail-row {
      margin-bottom: 12px;
      display: flex;
    }
    .detail-label {
      width: 100px;
      font-weight: 600;
      color: var(--sd-muted);
      font-size: 14px;
    }
    .detail-value {
      flex: 1;
      color: var(--sd-text);
      font-size: 14px;
      display: flex;
      align-items: center;
    }
    .message-section, .reply-section, .reply-input-section {
      margin-top: 24px;
    }
    .full-message {
      margin-top: 8px;
      padding: 16px;
      background: var(--sd-icon-btn);
      border-radius: 6px;
      font-size: 14px;
      line-height: 1.6;
      color: var(--sd-text);
      white-space: pre-wrap;
    }
    .full-reply {
      margin-top: 8px;
      padding: 16px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid #cce8d6;
      border-radius: 6px;
      font-size: 14px;
      line-height: 1.6;
      color: #1e8e3e;
      white-space: pre-wrap;
    }
    .reply-textarea {
      width: 100%;
      margin-top: 8px;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-family: inherit;
      font-size: 14px;
      resize: vertical;
    }
    .reply-textarea:focus {
      outline: none;
      border-color: var(--sd-text);
    }
    .reply-help {
      margin-top: 6px;
      font-size: 12px;
      color: var(--sd-muted);
    }
    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--sd-border);
      display: flex;
      justify-content: flex-end;
    }
    
    .loading-state {
      padding: 48px;
      text-align: center;
      color: var(--sd-muted);
    }
    .loader {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #333;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      animation: spin 1s linear infinite;
      margin: 0 auto 12px auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: var(--sd-sidebar);
      border-top: 1px solid var(--sd-border);
    }
    .pagination button {
      padding: 6px 12px;
      border-radius: 6px;
      border: 1px solid #ddd;
      background: var(--sd-sidebar);
      cursor: pointer;
      font-size: 13px;
    }
    .pagination button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class ContactQueriesComponent implements OnInit {
  private apiService = inject(ApiService);
  
  queries = signal<ContactQuery[]>([]);
  isLoading = signal<boolean>(true);
  selectedQuery = signal<ContactQuery | null>(null);
  
  replyMessage = '';
  isReplying = signal<boolean>(false);

  currentPage = signal(1);
  itemsPerPage = 10;

  paginatedQueries = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return this.queries().slice(startIndex, startIndex + this.itemsPerPage);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.queries().length / this.itemsPerPage)));

  ngOnInit() {
    this.loadQueries();
  }

  loadQueries() {
    this.isLoading.set(true);
    this.currentPage.set(1);
    this.apiService.get<ContactQuery[]>('/contact').subscribe({
      next: (data) => {
        this.queries.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load contact queries', err);
        this.isLoading.set(false);
      }
    });
  }

  viewQuery(query: ContactQuery) {
    this.selectedQuery.set(query);
    this.replyMessage = '';
    if (query.status === 'new') {
      this.markAsRead(query._id);
    }
  }

  closeModal() {
    this.selectedQuery.set(null);
    this.replyMessage = '';
  }

  markAsRead(id: string) {
    this.apiService.put<any>(`/contact/${id}/read`, {}).subscribe({
      next: () => {
        this.queries.update(qs => qs.map(q => q._id === id ? { ...q, status: 'read' } : q));
        if (this.selectedQuery() && this.selectedQuery()?._id === id) {
          this.selectedQuery.update(q => q ? { ...q, status: 'read' } : null);
        }
      },
      error: (err) => console.error('Failed to mark as read', err)
    });
  }

  submitReply() {
    const query = this.selectedQuery();
    if (!query || !this.replyMessage.trim()) return;

    this.isReplying.set(true);
    this.apiService.put<any>(`/contact/${query._id}/reply`, { replyMessage: this.replyMessage }).subscribe({
      next: (res) => {
        this.isReplying.set(false);
        this.queries.update(qs => qs.map(q => q._id === query._id ? { ...q, status: 'replied', adminReply: this.replyMessage } : q));
        this.selectedQuery.update(q => q ? { ...q, status: 'replied', adminReply: this.replyMessage } : null);
      },
      error: (err) => {
        console.error('Failed to send reply', err);
        this.isReplying.set(false);
      }
    });
  }
}
