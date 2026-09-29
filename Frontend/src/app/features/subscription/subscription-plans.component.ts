import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  SubscriptionService,
  SubscriptionPlan,
  CouponValidation,
} from '../../core/services/subscription.service';
import { AuthService } from '../../core/services/auth.service';

declare var Razorpay: any;

@Component({
  selector: 'app-subscription-plans',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="plans-page">
      <div class="wrap">
        @if (isLoading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading plans...</p>
          </div>
        } @else {
          <!-- Current Plan Banner -->
          @if (currentSub()?.active) {
            <div class="current-plan-banner">
              <div class="current-plan-info">
                <span class="badge-active">✓ Active</span>
                <span
                  >You're on
                  <strong>{{ currentSub()?.subscription?.plan?.name }}</strong>
                  — {{ currentSub()?.subscription?.daysRemaining }} days
                  remaining</span
                >
              </div>
              <a routerLink="/subscription/me" class="btn-outline-sm"
                >Manage Plan →</a
              >
            </div>
          }

          <!-- Plans Grid -->
          <div class="plans-grid">
            @for (plan of plans(); track plan._id; let i = $index) {
              <div
                class="plan-card"
                [class.featured]="i === 1"
                [class.selected]="selectedPlan()?._id === plan._id"
                (click)="selectPlan(plan)"
              >
                <div class="plan-header">
                  <div class="title-row">
                    <h3 class="plan-name">{{ plan.name }}</h3>
                    @if (i === 1) {
                      <span class="popular-badge">Most popular</span>
                    }
                  </div>

                  <div class="plan-price">
                    @if (appliedCoupon() && selectedPlan()?._id === plan._id) {
                      <span class="price-main"
                        >₹{{
                          (appliedCoupon()!.finalPriceInPaise / 100).toFixed(0)
                        }}</span
                      >
                    } @else {
                      <span class="price-main"
                        >₹{{ (plan.priceInPaise / 100).toFixed(0) }}</span
                      >
                    }
                    <span class="price-period"
                      >/ {{ plan.durationDays }} days</span
                    >
                  </div>

                  <p class="plan-desc">{{ plan.description }}</p>
                </div>

                <div class="plan-body">
                  <ul class="benefits-list">
                    @for (benefit of plan.marketingBenefits; track benefit) {
                      <li>
                        <svg
                          class="check-icon"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>{{ benefit }}</span>
                      </li>
                    }
                  </ul>
                </div>

                <div class="plan-footer">
                  <button
                    class="btn-select"
                    [class.active]="selectedPlan()?._id === plan._id"
                  >
                    {{
                      selectedPlan()?._id === plan._id
                        ? 'Selected'
                        : 'Get started'
                    }}
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- Coupon Code -->
          @if (selectedPlan()) {
            <div class="coupon-section">
              <div class="coupon-input-row">
                <input
                  [(ngModel)]="couponCode"
                  placeholder="Have a coupon code? Enter here"
                  class="coupon-input"
                  [disabled]="!!appliedCoupon()"
                />
                @if (!appliedCoupon()) {
                  <button
                    class="btn-apply"
                    (click)="validateCoupon()"
                    [disabled]="!couponCode.trim() || couponLoading()"
                  >
                    {{ couponLoading() ? '...' : 'Apply' }}
                  </button>
                } @else {
                  <button class="btn-remove" (click)="removeCoupon()">
                    Remove
                  </button>
                }
              </div>
              @if (couponError()) {
                <p class="coupon-error">{{ couponError() }}</p>
              }
              @if (appliedCoupon()) {
                <div class="coupon-success">
                  Coupon applied! You save {{ appliedCoupon()!.savingsDisplay }}
                </div>
              }
            </div>

            <!-- Order Summary -->
            <div class="order-summary">
              <div class="summary-row">
                <span>Plan</span>
                <span>{{ selectedPlan()!.name }}</span>
              </div>
              <div class="summary-row">
                <span>Duration</span>
                <span>{{ selectedPlan()!.durationDays }} days</span>
              </div>
              @if (appliedCoupon()) {
                <div class="summary-row discount">
                  <span>Discount</span>
                  <span>- {{ appliedCoupon()!.savingsDisplay }}</span>
                </div>
              }
              <div class="summary-row total">
                <span>Total</span>
                <span>{{ finalPrice() }}</span>
              </div>

              @if (isUpgradeRestricted()) {
                <div class="upgrade-restricted-warning" style="background: #fff3cd; color: #856404; padding: 12px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; text-align: center; border: 1px solid #ffeeba;">
                  You can only renew or upgrade your plan when you have 2 or fewer days remaining on your current active subscription. ({{ currentSub()?.subscription?.daysRemaining }} days remaining)
                </div>
              }

              <button
                class="btn-checkout"
                (click)="checkout()"
                [disabled]="checkoutLoading() || isUpgradeRestricted()"
              >
                @if (checkoutLoading()) {
                  <span class="spinner-sm"></span> Processing...
                } @else {
                  Pay {{ finalPrice() }}
                }
              </button>
            </div>
          }

          <p class="bottom-note">No contracts. Pause or cancel anytime.</p>
        }
      </div>
    </div>
  `,
  styles: [
    `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

      .plans-page {
        min-height: 100vh;
        background: var(--card);
        color: #111827;
        font-family: 'Inter', system-ui, sans-serif;
        padding: 80px 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .wrap {
        width: 100%;
        max-width: 1080px;
        margin: 0 auto;
        padding: 0 24px;
      }

      /* Current plan banner */
      .current-plan-banner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 16px 24px;
        margin-bottom: 48px;
        gap: 16px;
      }
      .current-plan-info {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 15px;
        color: #374151;
      }
      .badge-active {
        background: #10b981;
        color: #fff;
        padding: 4px 12px;
        border-radius: 100px;
        font-size: 12px;
        font-weight: 600;
      }
      .btn-outline-sm {
        background: #111827;
        color: #ffffff;
        padding: 8px 16px;
        border-radius: 100px;
        font-size: 14px;
        font-weight: 500;
        text-decoration: none;
        transition: background 0.2s;
      }
      .btn-outline-sm:hover {
        background: #374151;
      }

      /* Plans Grid */
      .plans-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
        margin-bottom: 48px;
      }

      .plan-card {
        background: var(--card);
        border: 1px solid #f3f4f6;
        border-radius: 24px;
        padding: 40px 32px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
        cursor: pointer;
        display: flex;
        flex-direction: column;
        transition: all 0.2s ease;
      }
      .plan-card:hover {
        border-color: #e5e7eb;
        transform: translateY(-2px);
      }

      .plan-card.featured {
        background: #f4f3ec; /* Beige premium color */
        border-color: #ebeadfc0;
        box-shadow: none;
      }
      .plan-card.featured:hover {
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
      }

      .plan-card.selected {
        border-color: #111827;
        box-shadow: 0 0 0 1px #111827;
      }

      .plan-header {
        margin-bottom: 32px;
      }
      .title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }
      .plan-name {
        font-size: 20px;
        font-weight: 600;
        color: #111827;
        margin: 0;
      }
      .popular-badge {
        background: #e2e1d7;
        color: #374151;
        padding: 4px 12px;
        border-radius: 100px;
        font-size: 12px;
        font-weight: 600;
      }

      .plan-price {
        display: flex;
        align-items: baseline;
        gap: 4px;
        margin-bottom: 16px;
      }
      .price-main {
        font-size: 42px;
        font-weight: 700;
        color: #111827;
        letter-spacing: -0.02em;
      }
      .price-period {
        font-size: 15px;
        font-weight: 500;
        color: #6b7280;
      }

      .plan-desc {
        font-size: 14px;
        color: #6b7280;
        line-height: 1.5;
        margin: 0;
      }

      .plan-body {
        flex: 1;
        margin-bottom: 40px;
      }

      .benefits-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .benefits-list li {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        font-size: 14px;
        font-weight: 500;
        color: #374151;
        margin-bottom: 16px;
      }
      .check-icon {
        width: 16px;
        height: 16px;
        color: #111827;
        margin-top: 2px;
        flex-shrink: 0;
      }

      .plan-footer {
        margin-top: auto;
      }

      .btn-select {
        width: 100%;
        padding: 16px;
        background: #111827;
        color: #ffffff;
        border: none;
        border-radius: 100px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
      }
      .btn-select:hover {
        background: #000000;
      }
      .btn-select.active {
        background: #4b5563;
      }

      /* Coupon & Checkout */
      .coupon-section {
        max-width: 500px;
        margin: 0 auto 32px;
      }
      .coupon-input-row {
        display: flex;
        gap: 8px;
      }
      .coupon-input {
        flex: 1;
        padding: 14px 20px;
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 100px;
        color: #111827;
        font-size: 15px;
        outline: none;
      }
      .coupon-input:focus {
        border-color: #111827;
      }
      .btn-apply,
      .btn-remove {
        padding: 14px 24px;
        border-radius: 100px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        border: none;
        transition: background 0.2s;
      }
      .btn-apply {
        background: #111827;
        color: white;
      }
      .btn-apply:hover:not(:disabled) {
        background: #000000;
      }
      .btn-apply:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .btn-remove {
        background: #fee2e2;
        color: #ef4444;
      }

      .coupon-error {
        color: #ef4444;
        font-size: 14px;
        margin-top: 12px;
        text-align: center;
      }
      .coupon-success {
        color: #10b981;
        font-size: 14px;
        font-weight: 500;
        margin-top: 12px;
        text-align: center;
      }

      /* Order Summary */
      .order-summary {
        max-width: 500px;
        margin: 0 auto 48px;
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 20px;
        padding: 32px;
      }
      .summary-row {
        display: flex;
        justify-content: space-between;
        padding: 12px 0;
        border-bottom: 1px solid #e5e7eb;
        font-size: 15px;
        color: #4b5563;
      }
      .summary-row.discount {
        color: #10b981;
      }
      .summary-row.total {
        font-size: 20px;
        font-weight: 700;
        color: #111827;
        border-bottom: none;
        padding-top: 20px;
        margin-bottom: 24px;
      }
      .btn-checkout {
        width: 100%;
        padding: 18px;
        background: #111827;
        border: none;
        border-radius: 100px;
        color: white;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      .btn-checkout:hover {
        background: #000000;
      }
      .btn-checkout:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .bottom-note {
        text-align: center;
        font-size: 14px;
        color: #9ca3af;
        margin: 0;
      }

      /* Loading */
      .loading-state {
        text-align: center;
        padding: 80px;
        color: #6b7280;
      }
      .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #f3f4f6;
        border-top-color: #111827;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin: 0 auto 16px;
      }
      .spinner-sm {
        width: 20px;
        height: 20px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
        display: inline-block;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      @media (max-width: 900px) {
        .plans-grid {
          grid-template-columns: 1fr;
          gap: 24px;
        }
        .plan-card {
          padding: 32px 24px;
        }
      }
    `,
  ],
})
export class SubscriptionPlansComponent implements OnInit {
  private subscriptionService = inject(SubscriptionService);
  private authService = inject(AuthService);
  private router = inject(Router);

  plans = signal<SubscriptionPlan[]>([]);
  selectedPlan = signal<SubscriptionPlan | null>(null);
  currentSub = signal<any>(null);
  isLoading = signal(true);
  couponCode = '';
  couponLoading = signal(false);
  couponError = signal<string | null>(null);
  appliedCoupon = signal<CouponValidation | null>(null);
  checkoutLoading = signal(false);

  ngOnInit() {
    this.subscriptionService.getPlans().subscribe({
      next: (plans) => {
        this.plans.set(plans);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });

    if (this.authService.user()) {
      this.subscriptionService.getMySubscription().subscribe({
        next: (sub) => this.currentSub.set(sub),
        error: () => {},
      });
    }
  }

  selectPlan(plan: SubscriptionPlan) {
    this.selectedPlan.set(plan);
    this.appliedCoupon.set(null);
    this.couponCode = '';
    this.couponError.set(null);

    // Give Angular a tiny moment to render the checkout section, then scroll to it
    setTimeout(() => {
      const checkoutSection = document.querySelector('.coupon-section');
      if (checkoutSection) {
        checkoutSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  finalPrice(): string {
    const plan = this.selectedPlan();
    if (!plan) return '';
    const coupon = this.appliedCoupon();
    const paise = coupon ? coupon.finalPriceInPaise : plan.priceInPaise;
    return `INR ${(paise / 100).toFixed(2)}`;
  }

  isUpgradeRestricted(): boolean {
    const sub = this.currentSub();
    if (sub && sub.active && sub.subscription) {
      return sub.subscription.daysRemaining > 2;
    }
    return false;
  }

  validateCoupon() {
    if (!this.couponCode.trim() || !this.selectedPlan()) return;
    this.couponLoading.set(true);
    this.couponError.set(null);
    this.subscriptionService
      .validateCoupon(this.couponCode.trim(), this.selectedPlan()!._id)
      .subscribe({
        next: (res) => {
          this.appliedCoupon.set(res);
          this.couponLoading.set(false);
        },
        error: (err) => {
          this.couponError.set(err.error?.msg || 'Invalid coupon');
          this.couponLoading.set(false);
        },
      });
  }

  removeCoupon() {
    this.appliedCoupon.set(null);
    this.couponCode = '';
    this.couponError.set(null);
  }

  checkout() {
    if (!this.authService.user()) {
      this.router.navigate(['/login']);
      return;
    }
    const plan = this.selectedPlan();
    if (!plan) return;
    this.checkoutLoading.set(true);

    if (this.currentSub()?.active) {
      if (!confirm('Note: After your current plan ends, this new plan and benefits will reflect. Do you want to proceed to payment?')) {
        this.checkoutLoading.set(false);
        return;
      }
    }

    this.loadRazorpayScript().then((razorpayLoaded) => {
      if (!razorpayLoaded) {
        this.checkoutLoading.set(false);
        alert('Razorpay SDK failed to load. Are you online?');
        return;
      }

      this.subscriptionService
        .createOrder(plan._id, this.appliedCoupon() ? this.couponCode : undefined)
        .subscribe({
          next: (orderData) => {
          const options = {
            key: orderData.keyId,
            amount: orderData.amount,
            currency: 'INR',
            name: 'Mozhibu Premium',
            description: `${plan.name} — ${plan.durationDays} days`,
            order_id: orderData.orderId,
            handler: (response: any) => {
              // Verify payment on backend
              this.subscriptionService
                .verifyPayment({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  planId: plan._id,
                  couponCode: this.appliedCoupon()
                    ? this.couponCode
                    : undefined,
                })
                .subscribe({
                  next: () => {
                    this.checkoutLoading.set(false);
                    this.router.navigate(['/subscription/me']);
                  },
                  error: (err) => {
                    this.checkoutLoading.set(false);
                    alert(
                      'Payment verification failed: ' +
                        (err.error?.msg || 'Please contact support'),
                    );
                  },
                });
            },
            prefill: {
              name: this.authService.user()?.username,
              email: this.authService.user()?.email,
            },
            theme: { color: '#6366f1' },
            modal: {
              ondismiss: () => {
                this.checkoutLoading.set(false);
                alert('Checkout cancelled');
              },
            },
          };
          const rzp = new Razorpay(options);
          rzp.on('payment.failed', (response: any) => {
            this.checkoutLoading.set(false);
            alert('Payment failed: ' + (response.error?.description || 'Unknown error'));
          });
          rzp.open();
        },
        error: (err) => {
          this.checkoutLoading.set(false);
          alert(
            'Failed to create order: ' + (err.error?.msg || 'Server error'),
          );
        },
      });
    });
  }

  private loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }
}

