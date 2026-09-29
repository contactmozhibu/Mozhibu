import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminCouponService, Coupon } from '../../../core/services/admin-coupon.service';
import { AdminRevenueComponent } from '../revenue/admin-revenue.component';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AdminRevenueComponent],
  template: `
    <div class="settings-page">
      <div class="header">
        <h1>Settings</h1>
        <p>Manage subscription coupons, revenue config, and other settings.</p>
      </div>

      <div class="tabs">
        <button [class.active]="activeTab === 'general'" (click)="activeTab = 'general'">General</button>
        <button [class.active]="activeTab === 'coupons'" (click)="activeTab = 'coupons'">Coupons</button>
        <button [class.active]="activeTab === 'revenue'" (click)="activeTab = 'revenue'">Revenue</button>
      </div>

      <ng-container *ngIf="activeTab === 'general'">
        <div class="card mt-4">
          <div class="card-header">
            <h2>Contact Information</h2>
          </div>
          <form [formGroup]="generalForm" (ngSubmit)="onSaveGeneral()" class="coupon-form">
            <div class="form-row">
              <div class="form-group">
                <label>Contact Email</label>
                <input type="email" formControlName="contactEmail" class="form-control" placeholder="e.g. contact@mozhibu.com">
              </div>
              <div class="form-group">
                <label>Contact Phone (with Country Code)</label>
                <input type="text" formControlName="contactPhone" class="form-control" placeholder="e.g. +91 1234567890">
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="generalForm.invalid || isSavingGeneral">
                <div *ngIf="isSavingGeneral" class="btn-loader"></div>
                {{ isSavingGeneral ? 'Saving...' : 'Save Settings' }}
              </button>
            </div>
            <div *ngIf="generalSuccessMsg" class="success-msg">{{ generalSuccessMsg }}</div>
            <div *ngIf="generalErrorMsg" class="error-msg">{{ generalErrorMsg }}</div>
          </form>
        </div>
      </ng-container>

      <ng-container *ngIf="activeTab === 'coupons'">
        <div class="card mt-4">
          <div class="card-header">
          <h2>Create New Coupon</h2>
        </div>
        <form [formGroup]="couponForm" (ngSubmit)="onSubmit()" class="coupon-form">
          <div class="form-row">
            <div class="form-group">
              <label>Coupon Code</label>
              <input type="text" formControlName="code" class="form-control" placeholder="e.g. SUMMER50" style="text-transform: uppercase;">
            </div>
            <div class="form-group">
              <label>Discount Type</label>
              <select formControlName="discountType" class="form-control">
                <option value="percent">Percentage (%)</option>
                <option value="fixed">Fixed Amount (Paise)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Discount Value</label>
              <input type="number" formControlName="discountValue" class="form-control" placeholder="e.g. 50">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Valid From</label>
              <input type="datetime-local" formControlName="validFrom" class="form-control">
            </div>
            <div class="form-group">
              <label>Valid Until</label>
              <input type="datetime-local" formControlName="validUntil" class="form-control">
            </div>
            <div class="form-group">
              <label>Max Uses (Optional)</label>
              <input type="number" formControlName="maxUses" class="form-control" placeholder="Leave empty for unlimited">
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="couponForm.invalid || isSubmitting">
              <div *ngIf="isSubmitting" class="btn-loader"></div>
              {{ isSubmitting ? 'Creating...' : 'Create Coupon' }}
            </button>
          </div>
          <div *ngIf="errorMessage" class="error-msg">{{ errorMessage }}</div>
          <div *ngIf="successMessage" class="success-msg">{{ successMessage }}</div>
        </form>
      </div>

      <div class="card">
        <div class="card-header">
          <h2>Active & Past Coupons</h2>
        </div>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Validity</th>
                <th>Uses</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let coupon of coupons">
                <td><strong>{{ coupon.code }}</strong></td>
                <td>
                  {{ coupon.discountType === 'percent' ? coupon.discountValue + '%' : '₹' + (coupon.discountValue / 100).toFixed(2) }}
                </td>
                <td>
                  <div class="text-sm">From: {{ coupon.validFrom | date:'mediumDate' }}</div>
                  <div class="text-sm">To: {{ coupon.validUntil | date:'mediumDate' }}</div>
                </td>
                <td>
                  {{ coupon.usedCount }} / {{ coupon.maxUses || '∞' }}
                </td>
                <td>
                  <span class="badge" [class.badge-active]="coupon.isActive" [class.badge-inactive]="!coupon.isActive">
                    {{ coupon.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm btn-outline" (click)="toggleStatus(coupon)">
                    {{ coupon.isActive ? 'Deactivate' : 'Activate' }}
                  </button>
                  <button class="btn btn-sm btn-danger ml-2" (click)="deleteCoupon(coupon._id!)">Delete</button>
                </td>
              </tr>
              <tr *ngIf="coupons.length === 0">
                <td colspan="6" class="text-center py-4 text-gray-500">No coupons found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      </ng-container>

      <ng-container *ngIf="activeTab === 'revenue'">
        <app-admin-revenue></app-admin-revenue>
      </ng-container>
    </div>
  `,
  styles: [
    `
      .settings-page {
        padding: 24px;
        max-width: 1200px;
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
        margin-bottom: 24px;
        overflow: hidden;
      }
      .card-header {
        padding: 16px 24px;
        border-bottom: 1px solid var(--sd-border);
      }
      .card-header h2 {
        font-size: 16px;
        font-weight: 600;
        color: var(--sd-text);
      }
      .tabs {
        display: flex;
        gap: 16px;
        border-bottom: 1px solid #ddd;
        margin-bottom: 24px;
      }
      .tabs button {
        background: none;
        border: none;
        padding: 8px 16px;
        font-size: 14px;
        font-weight: 500;
        color: var(--sd-muted);
        cursor: pointer;
        border-bottom: 2px solid transparent;
      }
      .tabs button:hover {
        color: var(--sd-text);
      }
      .tabs button.active {
        color: var(--sd-text);
        border-bottom-color: var(--sd-text);
      }
      .mt-4 { margin-top: 16px; }
      .coupon-form {
        padding: 24px;
      }
      .form-row {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;
      }
      .form-group {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .form-group label {
        font-size: 13px;
        font-weight: 500;
        color: var(--sd-muted);
      }
      .form-control {
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        font-family: inherit;
      }
      .form-control:focus {
        outline: none;
        border-color: var(--sd-text);
      }
      .form-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 24px;
      }
      .btn {
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
      }
      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .btn-primary {
        background: #1e342c;
        color: white;
      }
      .btn-primary:hover:not(:disabled) {
        background: #15251f;
      }
      .btn-sm {
        padding: 4px 8px;
        font-size: 12px;
      }
      .btn-outline {
        background: transparent;
        border: 1px solid #ddd;
        color: var(--sd-text);
      }
      .btn-outline:hover {
        background: var(--sd-icon-btn);
      }
      .btn-danger {
        background: transparent;
        border: 1px solid #d32f2f;
        color: #d32f2f;
      }
      .btn-danger:hover {
        background: rgba(239, 68, 68, 0.1);
      }
      .ml-2 { margin-left: 8px; }
      .table-responsive {
        overflow-x: auto;
      }
      .table {
        width: 100%;
        border-collapse: collapse;
      }
      .table th, .table td {
        padding: 12px 24px;
        text-align: left;
        border-bottom: 1px solid var(--sd-border);
        font-size: 14px;
      }
      .table th {
        background: var(--sd-icon-btn);
        font-weight: 500;
        color: var(--sd-muted);
        text-transform: uppercase;
        font-size: 12px;
      }
      .badge {
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
      }
      .badge-active {
        background: rgba(16, 185, 129, 0.1);
        color: #03543f;
      }
      .badge-inactive {
        background: rgba(239, 68, 68, 0.1);
        color: #9b1c1c;
      }
      .text-sm { font-size: 12px; color: var(--sd-muted); }
      .text-center { text-align: center; }
      .py-4 { padding-top: 16px; padding-bottom: 16px; }
      .text-gray-500 { color: var(--sd-muted); }
      .error-msg {
        color: #d32f2f;
        font-size: 13px;
        margin-top: 12px;
      }
      .success-msg {
        color: #03543f;
        font-size: 13px;
        margin-top: 12px;
      }
    `
  ]
})
export class AdminSettingsComponent implements OnInit {
  couponService = inject(AdminCouponService);
  apiService = inject(ApiService);
  fb = inject(FormBuilder);

  activeTab: 'general' | 'coupons' | 'revenue' = 'general';
  
  coupons: Coupon[] = [];
  
  couponForm: FormGroup = this.fb.group({
    code: ['', [Validators.required]],
    discountType: ['percent', Validators.required],
    discountValue: [0, [Validators.required, Validators.min(1)]],
    validFrom: ['', Validators.required],
    validUntil: ['', Validators.required],
    maxUses: ['']
  });

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  generalForm: FormGroup = this.fb.group({
    contactEmail: ['', [Validators.required, Validators.email]],
    contactPhone: ['', Validators.required]
  });
  isSavingGeneral = false;
  generalSuccessMsg = '';
  generalErrorMsg = '';

  ngOnInit() {
    this.loadCoupons();
    this.loadGeneralSettings();
  }

  loadGeneralSettings() {
    this.apiService.get<any>('/settings').subscribe({
      next: (settings) => {
        if (settings) {
          this.generalForm.patchValue({
            contactEmail: settings.contactEmail,
            contactPhone: settings.contactPhone
          });
        }
      },
      error: (err) => console.error('Failed to load settings', err)
    });
  }

  onSaveGeneral() {
    if (this.generalForm.invalid) return;
    this.isSavingGeneral = true;
    this.generalSuccessMsg = '';
    this.generalErrorMsg = '';

    this.apiService.put<any>('/settings', this.generalForm.value).subscribe({
      next: () => {
        this.generalSuccessMsg = 'Settings saved successfully!';
        this.isSavingGeneral = false;
        setTimeout(() => this.generalSuccessMsg = '', 3000);
      },
      error: (err) => {
        this.generalErrorMsg = err.error?.message || 'Failed to save settings';
        this.isSavingGeneral = false;
      }
    });
  }

  loadCoupons() {
    this.couponService.getCoupons().subscribe({
      next: (data) => this.coupons = data,
      error: (err) => console.error('Failed to load coupons', err)
    });
  }

  onSubmit() {
    if (this.couponForm.invalid) return;
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const val = this.couponForm.value;
    const payload = {
      ...val,
      code: val.code.toUpperCase().trim(),
      maxUses: val.maxUses ? parseInt(val.maxUses, 10) : null
    };

    this.couponService.createCoupon(payload).subscribe({
      next: (res) => {
        this.successMessage = 'Coupon created successfully!';
        this.couponForm.reset({ discountType: 'percent' });
        this.loadCoupons();
        this.isSubmitting = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || 'Failed to create coupon';
        this.isSubmitting = false;
      }
    });
  }

  toggleStatus(coupon: Coupon) {
    if (!coupon._id) return;
    this.couponService.toggleCouponStatus(coupon._id, !coupon.isActive).subscribe({
      next: () => this.loadCoupons(),
      error: (err) => console.error(err)
    });
  }

  deleteCoupon(id: string) {
    if (confirm('Are you sure you want to delete this coupon?')) {
      this.couponService.deleteCoupon(id).subscribe({
        next: () => this.loadCoupons(),
        error: (err) => console.error(err)
      });
    }
  }
}
