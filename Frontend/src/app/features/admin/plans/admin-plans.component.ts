import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface SubscriptionPlan {
  _id?: string;
  name: string;
  priceInPaise: number;
  currency: string;
  durationDays: number;
  marketingBenefits: string[];
  structuredBenefits: {
    unlimited_premium_access: boolean;
    ad_free: boolean;
    early_access_days: number;
    multi_language_access: boolean;
    priority_support: boolean;
  };
  terms: string;
  isActive: boolean;
  displayOrder: number;
}

@Component({
  selector: 'app-admin-plans',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-container">
      <div class="header-actions">
        <h1>Manage Subscription Plans</h1>
        <button class="btn btn-primary" (click)="openCreateForm()">
          + Create New Plan
        </button>
      </div>

      <div class="plans-list" *ngIf="!showForm()">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Name</th>
              <th>Price</th>
              <th>Duration (Days)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let plan of plans()">
              <td>{{ plan.displayOrder }}</td>
              <td>{{ plan.name }}</td>
              <td>
                {{ plan.currency }}
                {{ plan.priceInPaise / 100 | number: '1.2-2' }}
              </td>
              <td>{{ plan.durationDays }}</td>
              <td>
                <span
                  class="badge"
                  [class.badge-active]="plan.isActive"
                  [class.badge-inactive]="!plan.isActive"
                >
                  {{ plan.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="actions">
                <button class="btn-icon" (click)="editPlan(plan)" title="Edit">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M12 20h9"></path>
                    <path
                      d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
                    ></path>
                  </svg>
                </button>
                <button
                  class="btn-icon"
                  (click)="toggleStatus(plan)"
                  title="Toggle Status"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="1 4 1 10 7 10"></polyline>
                    <polyline points="23 20 23 14 17 14"></polyline>
                    <path
                      d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"
                    ></path>
                  </svg>
                </button>
                <button
                  class="btn-icon danger"
                  (click)="deletePlan(plan)"
                  title="Delete"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path
                      d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                    ></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="plan-form-card" *ngIf="showForm()">
        <h2>{{ editingPlan() ? 'Edit Plan' : 'Create New Plan' }}</h2>

        <form (ngSubmit)="savePlan()">
          <div class="form-grid">
            <div class="form-group">
              <label>Plan Name</label>
              <input
                type="text"
                [(ngModel)]="formData.name"
                name="name"
                required
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>Price (in {{ formData.currency }})</label>
              <input
                type="number"
                [ngModel]="formData.priceInPaise / 100"
                (ngModelChange)="formData.priceInPaise = $event * 100"
                name="price"
                step="0.01"
                required
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>Currency</label>
              <input
                type="text"
                [(ngModel)]="formData.currency"
                name="currency"
                required
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>Duration (Days)</label>
              <input
                type="number"
                [(ngModel)]="formData.durationDays"
                name="durationDays"
                required
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>Display Order</label>
              <input
                type="number"
                [(ngModel)]="formData.displayOrder"
                name="displayOrder"
                required
                class="form-control"
              />
            </div>
          </div>

          <h3>Structured Benefits</h3>
          <div class="benefits-grid">
            <label class="checkbox-label">
              <input
                type="checkbox"
                [(ngModel)]="
                  formData.structuredBenefits.unlimited_premium_access
                "
                name="unlimited_premium_access"
              />
              Unlimited Premium Access
            </label>
            <label class="checkbox-label">
              <input
                type="checkbox"
                [(ngModel)]="formData.structuredBenefits.ad_free"
                name="ad_free"
              />
              Ad Free
            </label>

            <label class="checkbox-label">
              <input
                type="checkbox"
                [(ngModel)]="formData.structuredBenefits.multi_language_access"
                name="multi_language_access"
              />
              Multi-Language Access
            </label>
            <div class="form-group">
              <label>Early Access Days</label>
              <input
                type="number"
                [(ngModel)]="formData.structuredBenefits.early_access_days"
                name="early_access_days"
                class="form-control"
              />
            </div>
            <label class="checkbox-label">
              <input
                type="checkbox"
                [(ngModel)]="formData.structuredBenefits.priority_support"
                name="priority_support"
              />
              Priority Support
            </label>
          </div>

          <h3>Marketing Benefits (Display only)</h3>
          <div class="form-group">
            <label>Comma separated benefits</label>
            <textarea
              [ngModel]="formData.marketingBenefits.join(', ')"
              (ngModelChange)="updateMarketingBenefits($event)"
              name="marketingBenefits"
              class="form-control"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Terms</label>
            <textarea
              [(ngModel)]="formData.terms"
              name="terms"
              class="form-control"
              rows="2"
            ></textarea>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                [(ngModel)]="formData.isActive"
                name="isActive"
              />
              Is Active?
            </label>
          </div>

          <div class="form-actions">
            <button
              type="button"
              class="btn btn-secondary"
              (click)="cancelForm()"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="loading()"
            >
              {{ editingPlan() ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .admin-container {
        padding: 24px;
        color: var(--sd-text);
      }
      .header-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }
      h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
      }

      .admin-table {
        width: 100%;
        border-collapse: collapse;
        background: var(--card);
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
      .admin-table th,
      .admin-table td {
        padding: 12px 16px;
        text-align: left;
        border-bottom: 1px solid #e5e7eb;
      }
      .admin-table th {
        background: var(--sd-icon-btn);
        font-weight: 600;
        font-size: 14px;
        color: var(--sd-muted);
      }

      .badge {
        padding: 4px 8px;
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 600;
      }
      .badge-active {
        background: rgba(16, 185, 129, 0.1);
        color: #03543f;
      }
      .badge-inactive {
        background: rgba(239, 68, 68, 0.1);
        color: #9b1c1c;
      }

      .actions {
        display: flex;
        gap: 8px;
      }
      .btn-icon {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
        padding: 4px;
        opacity: 0.7;
      }
      .btn-icon:hover {
        opacity: 1;
      }
      .btn-icon.danger:hover {
        background: rgba(239, 68, 68, 0.1);
        border-radius: 4px;
      }

      .plan-form-card {
        background: var(--card);
        padding: 24px;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        max-width: 800px;
      }
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 24px;
      }
      .benefits-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 24px;
        background: var(--sd-icon-btn);
        padding: 16px;
        border-radius: 8px;
      }

      .form-group {
        margin-bottom: 16px;
      }
      .form-group label {
        display: block;
        margin-bottom: 6px;
        font-weight: 500;
        font-size: 14px;
      }
      .form-control {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        outline: none;
      }
      .form-control:focus {
        border-color: #6366f1;
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
      }

      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        cursor: pointer;
      }

      .form-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        margin-top: 24px;
        border-top: 1px solid #e5e7eb;
        padding-top: 16px;
      }

      .btn {
        padding: 8px 16px;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        border: none;
        font-size: 14px;
      }
      .btn-primary {
        background: #6366f1;
        color: white;
      }
      .btn-primary:hover {
        background: #4f46e5;
      }
      .btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .btn-secondary {
        background: #f3f4f6;
        color: var(--sd-text);
      }
      .btn-secondary:hover {
        background: #e5e7eb;
      }
    `,
  ],
})
export class AdminPlansComponent implements OnInit {
  private http = inject(HttpClient);

  plans = signal<SubscriptionPlan[]>([]);
  showForm = signal(false);
  editingPlan = signal<string | null>(null);
  loading = signal(false);

  defaultPlan: SubscriptionPlan = {
    name: '',
    priceInPaise: 0,
    currency: 'INR',
    durationDays: 30,
    marketingBenefits: [],
    structuredBenefits: {
      unlimited_premium_access: false,
      ad_free: false,
      early_access_days: 0,
      multi_language_access: false,
      priority_support: false,
    },
    terms: '',
    isActive: true,
    displayOrder: 0,
  };

  formData: SubscriptionPlan = JSON.parse(JSON.stringify(this.defaultPlan));

  ngOnInit() {
    this.fetchPlans();
  }

  updateMarketingBenefits(event: string) {
    this.formData.marketingBenefits = event
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  fetchPlans() {
    this.http
      .get<SubscriptionPlan[]>(`${environment.apiUrl}/admin/plans`)
      .subscribe({
        next: (res) => this.plans.set(res),
        error: (err) => alert('Failed to load plans: ' + err.message),
      });
  }

  openCreateForm() {
    this.formData = JSON.parse(JSON.stringify(this.defaultPlan));
    this.editingPlan.set(null);
    this.showForm.set(true);
  }

  editPlan(plan: SubscriptionPlan) {
    this.formData = JSON.parse(JSON.stringify(plan));
    this.editingPlan.set(plan._id!);
    this.showForm.set(true);
  }

  cancelForm() {
    this.showForm.set(false);
    this.editingPlan.set(null);
  }

  savePlan() {
    this.loading.set(true);
    const request = this.editingPlan()
      ? this.http.put(
          `${environment.apiUrl}/admin/plans/${this.editingPlan()}`,
          this.formData,
        )
      : this.http.post(`${environment.apiUrl}/admin/plans`, this.formData);

    request.subscribe({
      next: () => {
        this.fetchPlans();
        this.cancelForm();
        this.loading.set(false);
      },
      error: (err) => {
        alert('Failed to save plan: ' + (err.error?.msg || err.message));
        this.loading.set(false);
      },
    });
  }

  toggleStatus(plan: SubscriptionPlan) {
    this.http
      .patch(`${environment.apiUrl}/admin/plans/${plan._id}/status`, {})
      .subscribe({
        next: () => this.fetchPlans(),
        error: (err) => alert('Failed to toggle status'),
      });
  }

  deletePlan(plan: SubscriptionPlan) {
    if (
      confirm(
        'Are you sure you want to delete this plan? This will fail if there are active subscribers.',
      )
    ) {
      this.http
        .delete(`${environment.apiUrl}/admin/plans/${plan._id}`)
        .subscribe({
          next: () => this.fetchPlans(),
          error: (err) =>
            alert('Cannot delete: ' + (err.error?.msg || err.message)),
        });
    }
  }
}

