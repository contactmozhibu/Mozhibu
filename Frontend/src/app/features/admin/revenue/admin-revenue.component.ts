import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AdminPlansComponent } from '../plans/admin-plans.component';

@Component({
  selector: 'app-admin-revenue',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminPlansComponent],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h1>Revenue & Subscriptions</h1>
        <p>
          Manage subscription plans, configure revenue split, and process
          payouts.
        </p>
      </div>

      <div class="tabs">
        <button
          [class.active]="activeTab === 'analytics'"
          (click)="activeTab = 'analytics'"
        >
          Analytics
        </button>
        <button
          [class.active]="activeTab === 'plans'"
          (click)="activeTab = 'plans'"
        >
          Subscription Plans
        </button>
        <button
          [class.active]="activeTab === 'config'"
          (click)="activeTab = 'config'"
        >
          Revenue Config
        </button>
      </div>

      <!-- Analytics Tab -->
      @if (activeTab === 'analytics') {
        <div class="tab-content">
          @if (isLoading()) {
            <div class="spinner"></div>
          } @else {
            <div class="stats-grid">
              <div class="stat-card">
                <h3>Active Subscribers</h3>
                <div class="value">
                  {{ analytics()?.activeSubscribers || 0 }}
                </div>
              </div>
            </div>

            <div class="section-card">
              <h3>Monthly Ad Revenue Import</h3>
              <p class="desc">
                Import net ad revenue for previous month to trigger the
                distribution engine.
              </p>

              <div class="form-row">
                <div class="input-group">
                  <label>Month (1-12)</label>
                  <input
                    type="number"
                    [(ngModel)]="importData.month"
                    min="1"
                    max="12"
                  />
                </div>
                <div class="input-group">
                  <label>Year</label>
                  <input type="number" [(ngModel)]="importData.year" />
                </div>
                <div class="input-group">
                  <label>Gross Revenue (INR)</label>
                  <input type="number" [(ngModel)]="importData.grossRevenue" />
                </div>
                <div class="input-group">
                  <label>Net Revenue (INR)</label>
                  <input type="number" [(ngModel)]="importData.netRevenue" />
                </div>
                <div class="input-group align-bottom">
                  <label>&nbsp;</label>
                  <button
                    class="btn-primary"
                    (click)="importRevenue()"
                    [disabled]="isImporting()"
                  >
                    {{
                      isImporting() ? 'Processing...' : 'Import & Distribute'
                    }}
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Plans Tab -->
      @if (activeTab === 'plans') {
        <div class="tab-content" style="margin-top: 16px;">
          <app-admin-plans></app-admin-plans>
        </div>
      }

      <!-- Config Tab -->
      @if (activeTab === 'config') {
        <div class="tab-content">
          <div class="section-card">
            <h3>Revenue Split Configuration</h3>

            @if (config()) {
              <div class="config-grid">
                <div class="input-group">
                  <label>Platform Share (%)</label>
                  <input
                    type="number"
                    [(ngModel)]="editConfigData.platformPercent"
                  />
                </div>
                <div class="input-group">
                  <label>Authors Pool (%)</label>
                  <input
                    type="number"
                    [(ngModel)]="editConfigData.authorsPercent"
                  />
                </div>
                <div class="input-group">
                  <label>Readers Pool (%)</label>
                  <input
                    type="number"
                    [(ngModel)]="editConfigData.readersPercent"
                  />
                </div>
              </div>
              <button
                class="btn-primary"
                (click)="saveConfig()"
                [disabled]="isSavingConfig"
              >
                Save Config
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .admin-page {
        padding-bottom: 40px;
      }
      .page-header {
        margin-bottom: 24px;
      }
      .page-header h1 {
        font-family: var(--display);
        font-size: 28px;
        color: var(--ink);
        margin: 0 0 8px;
      }
      .page-header p {
        color: var(--ink-soft);
        margin: 0;
      }

      .tabs {
        display: flex;
        gap: 4px;
        border-bottom: 1px solid var(--border-soft);
        margin-bottom: 24px;
      }
      .tabs button {
        padding: 12px 24px;
        background: transparent;
        border: none;
        border-bottom: 2px solid transparent;
        font-weight: 600;
        color: var(--ink-soft);
        cursor: pointer;
        transition: all 0.2s;
      }
      .tabs button:hover {
        color: var(--ink);
        background: var(--paper-warm);
      }
      .tabs button.active {
        color: var(--forest);
        border-bottom-color: var(--forest);
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 20px;
        margin-bottom: 24px;
      }
      .stat-card {
        background: var(--card);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-m);
        padding: 24px;
      }
      .stat-card h3 {
        font-size: 14px;
        color: var(--ink-soft);
        margin: 0 0 12px;
      }
      .stat-card .value {
        font-family: var(--display);
        font-size: 32px;
        font-weight: 700;
        color: var(--ink);
      }

      .section-card {
        background: var(--card);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-m);
        padding: 24px;
        margin-bottom: 24px;
      }
      .section-card h3 {
        font-size: 18px;
        margin: 0 0 8px;
        color: var(--ink);
      }
      .desc {
        color: var(--ink-soft);
        font-size: 14px;
        margin-bottom: 20px;
      }

      .form-row {
        display: flex;
        gap: 16px;
        align-items: flex-start;
        flex-wrap: wrap;
      }
      .input-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex: 1;
        min-width: 150px;
      }
      .input-group label {
        font-size: 13px;
        font-weight: 600;
        color: var(--ink-soft);
      }
      .input-group input {
        padding: 10px 12px;
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-s);
        font-family: var(--body);
      }
      .align-bottom {
        justify-content: flex-end;
        padding-bottom: 2px;
      }

      .btn-primary {
        background: var(--forest);
        color: white;
        border: none;
        padding: 10px 24px;
        border-radius: var(--radius-s);
        font-weight: 600;
        cursor: pointer;
      }
      .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .admin-table {
        width: 100%;
        border-collapse: collapse;
      }
      .admin-table th {
        text-align: left;
        padding: 12px 16px;
        border-bottom: 2px solid var(--border-soft);
        color: var(--ink-soft);
        font-size: 13px;
        text-transform: uppercase;
      }
      .admin-table td {
        padding: 16px;
        border-bottom: 1px solid var(--border-soft);
        vertical-align: middle;
      }
      .badge {
        padding: 4px 10px;
        border-radius: 100px;
        font-size: 12px;
        font-weight: 600;
      }
      .badge-active {
        background: rgba(16, 185, 129, 0.1);
        color: #137333;
      }
      .badge-inactive {
        background: rgba(239, 68, 68, 0.1);
        color: #c5221f;
      }
      .btn-icon-small {
        background: none;
        border: none;
        cursor: pointer;
        margin-left: 8px;
        color: var(--ink-soft);
        opacity: 0.6;
        display: inline-flex;
        align-items: center;
        vertical-align: middle;
      }
      .btn-icon-small:hover {
        opacity: 1;
        color: var(--forest);
      }
      .edit-input {
        width: 100%;
        padding: 6px;
        border: 1px solid var(--border-soft);
        border-radius: 4px;
      }
      .btn-text {
        background: none;
        border: none;
        color: var(--forest);
        cursor: pointer;
        font-weight: 600;
        font-size: 13px;
        margin-right: 8px;
      }
      .text-danger {
        color: var(--rose);
      }

      .config-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin-bottom: 16px;
      }
      .help-text {
        font-size: 13px;
        color: var(--ink-faint);
        font-style: italic;
      }
      .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--border-soft);
        border-top-color: var(--forest);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin: 40px auto;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class AdminRevenueComponent implements OnInit {
  private api = inject(ApiService);

  activeTab = 'analytics';
  isLoading = signal(true);
  isImporting = signal(false);

  analytics = signal<any>(null);
  plans = signal<any[]>([]);
  config = signal<any>(null);

  importData = { month: new Date().getMonth(), year: new Date().getFullYear(), grossRevenue: 0, netRevenue: 0 };

  // Editing states
  editingPlanId: string | null = null;
  editPlanData: any = {};

  editConfigData: any = {};
  isSavingConfig = false;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.get('/revenue/analytics').subscribe({
      next: (data) => {
        this.analytics.set(data);
        this.isLoading.set(false);
      },
    });
    this.api
      .get('/subscriptions/plans')
      .subscribe((plans: any) => this.plans.set(plans));
    this.api.get('/revenue/config').subscribe((res: any) => {
      this.config.set(res.splitConfig);
      this.editConfigData = {
        platformPercent: res.splitConfig.platformPercent,
        authorsPercent: res.splitConfig.authorsPercent,
        readersPercent: res.splitConfig.readersPercent,
        minAuthorPayoutInPaise: res.splitConfig.minAuthorPayoutInPaise,
        minReaderPayoutInPaise: res.splitConfig.minReaderPayoutInPaise,
      };
    });
  }

  importRevenue() {
    if (!this.importData.netRevenue || this.importData.netRevenue <= 0) return;
    if (!this.importData.grossRevenue || this.importData.grossRevenue < this.importData.netRevenue) {
      alert('Gross revenue must be greater than or equal to net revenue.');
      return;
    }

    this.isImporting.set(true);
    // Convert ₹ to paise
    const body = {
      month: this.importData.month,
      year: this.importData.year,
      grossRevenueInPaise: this.importData.grossRevenue * 100,
      netRevenueInPaise: this.importData.netRevenue * 100,
      source: 'manual',
    };

    this.api.post('/revenue/monthly', body).subscribe({
      next: () => {
        // Trigger computation immediately after import
        this.api
          .post(`/revenue/compute/${body.year}/${body.month}`, {})
          .subscribe({
            next: () => {
              alert('Revenue imported and distributed successfully!');
              this.isImporting.set(false);
            },
            error: (err) => {
              alert('Distribution failed: ' + (err.error?.msg || 'Error'));
              this.isImporting.set(false);
            },
          });
      },
      error: (err) => {
        alert('Import failed: ' + (err.error?.msg || 'Error'));
        this.isImporting.set(false);
      },
    });
  }

  startEditPlan(plan: any) {
    this.editingPlanId = plan._id;
    this.editPlanData = {
      name: plan.name,
      price: plan.priceInPaise / 100,
      durationDays: plan.durationDays,
    };
  }

  cancelEditPlan() {
    this.editingPlanId = null;
  }

  savePlan(id: string) {
    const payload = {
      name: this.editPlanData.name,
      priceInPaise: Math.round(this.editPlanData.price * 100),
      durationDays: this.editPlanData.durationDays,
    };

    this.api.put(`/revenue/plans/${id}`, payload).subscribe({
      next: () => {
        this.editingPlanId = null;
        this.loadData(); // Refresh plans
      },
      error: (err) => {
        alert('Failed to update plan: ' + (err.error?.msg || 'Error'));
      },
    });
  }

  saveConfig() {
    const total =
      this.editConfigData.platformPercent +
      this.editConfigData.authorsPercent +
      this.editConfigData.readersPercent;
    if (total !== 100) {
      alert(`Split percentages must sum to 100%. Current sum: ${total}%`);
      return;
    }

    this.isSavingConfig = true;
    this.api.put('/revenue/config', this.editConfigData).subscribe({
      next: (updatedConfig) => {
        this.config.set(updatedConfig);
        this.isSavingConfig = false;
        alert('Revenue configuration updated successfully.');
      },
      error: (err) => {
        alert('Failed to update config: ' + (err.error?.msg || 'Error'));
        this.isSavingConfig = false;
      },
    });
  }
}

