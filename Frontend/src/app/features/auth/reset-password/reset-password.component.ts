import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

function passwordMatchValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-wrap">
      <div class="auth-card">
        <h2>Reset Password</h2>
        <p>Please enter your new password below.</p>

        <div *ngIf="successMessage" class="success-msg">
          {{ successMessage }}
          <div class="login-link" style="margin-top: 16px;">
            <a
              routerLink="/login"
              class="btn btn-primary"
              style="color: white; display: inline-block;"
              >Go to Login</a
            >
          </div>
        </div>

        <form
          *ngIf="!successMessage"
          [formGroup]="resetForm"
          (ngSubmit)="onSubmit()"
        >
          <div class="form-group">
            <label>New Password</label>
            <div class="input-wrapper">
              <input
                [type]="showPassword ? 'text' : 'password'"
                formControlName="password"
                class="form-control"
                placeholder="••••••••"
              />
              <button type="button" class="eye-btn" (click)="togglePassword()">
                <svg
                  *ngIf="!showPassword"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg
                  *ngIf="showPassword"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                  ></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </div>
            <div
              *ngIf="
                resetForm.get('password')?.touched &&
                resetForm.get('password')?.hasError('pattern')
              "
              class="field-error"
            >
              Password must be 8-16 characters, have 1 uppercase, 1 number, and
              no emojis.
            </div>
          </div>

          <div class="form-group">
            <label>Confirm Password</label>
            <div class="input-wrapper">
              <input
                [type]="showConfirmPassword ? 'text' : 'password'"
                formControlName="confirmPassword"
                class="form-control"
                placeholder="••••••••"
              />
              <button
                type="button"
                class="eye-btn"
                (click)="toggleConfirmPassword()"
              >
                <svg
                  *ngIf="!showConfirmPassword"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg
                  *ngIf="showConfirmPassword"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                  ></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </div>
            <div
              *ngIf="
                resetForm.hasError('passwordMismatch') &&
                resetForm.get('confirmPassword')?.touched
              "
              class="field-error"
            >
              Passwords do not match.
            </div>
          </div>

          <div *ngIf="errorMessage" class="error-msg">
            {{ errorMessage }}
          </div>

          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="isLoading || resetForm.invalid || !email || !code"
          >
            {{ isLoading ? 'Resetting...' : 'Reset Password' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-wrap {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: calc(100vh - 150px);
        background: var(--paper);
        padding: 40px 20px;
      }
      .auth-card {
        background: var(--card);
        padding: 40px 48px;
        border-radius: var(--radius-l);
        border: 1px solid var(--border-soft);
        box-shadow: 0 10px 30px -10px rgba(43, 38, 32, 0.1);
        max-width: 480px;
        width: 100%;
      }
      .auth-card h2 {
        margin-bottom: 8px;
        font-family: var(--display);
        font-size: 24px;
        text-align: center;
      }
      .auth-card p {
        color: var(--ink-soft);
        margin-bottom: 24px;
        font-size: 14px;
        text-align: center;
      }
      .form-group {
        margin-bottom: 20px;
      }
      .form-group label {
        display: block;
        margin-bottom: 6px;
        font-size: 13px;
        font-weight: 500;
        color: var(--ink);
      }
      .form-control {
        width: 100%;
        padding: 12px 14px;
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-s);
        font-family: var(--body);
        font-size: 14px;
        transition: all 0.2s;
      }
      .form-control:focus {
        outline: none;
        border-color: var(--gold);
      }
      .input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
      }
      .input-wrapper .form-control {
        padding-right: 40px;
      }
      .eye-btn {
        position: absolute;
        right: 12px;
        background: none;
        border: none;
        color: var(--ink-faint);
        cursor: pointer;
        display: flex;
        align-items: center;
        padding: 0;
        transition: color 0.2s;
      }
      .eye-btn:hover {
        color: var(--ink);
      }
      .field-error {
        color: var(--rose);
        font-size: 11px;
        margin-top: 6px;
        line-height: 1.3;
        display: block;
      }
      .error-msg {
        color: var(--rose);
        font-size: 13px;
        margin-bottom: 16px;
        text-align: center;
        background: var(--rose-tint);
        padding: 8px;
        border-radius: 4px;
      }
      .success-msg {
        color: var(--forest);
        font-size: 13px;
        margin-bottom: 16px;
        text-align: center;
        background: var(--forest-tint);
        padding: 16px;
        border-radius: 4px;
        font-weight: 500;
      }
      .btn {
        width: 100%;
      }
      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      /* Mobile Responsiveness */
      @media (max-width: 600px) {
        .auth-wrap {
          padding: 20px 15px;
          min-height: calc(100vh - 100px);
        }
        .auth-card {
          padding: 30px 24px;
          border-radius: var(--radius-m);
        }
        .auth-card h2 {
          font-size: 22px;
        }
      }
    `,
  ],
})
export class ResetPasswordComponent implements OnInit {
  auth = inject(AuthService);
  fb = inject(FormBuilder);
  route = inject(ActivatedRoute);

  resetForm: FormGroup = this.fb.group(
    {
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d)[\x20-\x7E]{8,16}$/),
        ],
      ],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator },
  );

  email: string | null = null;
  code: string | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  ngOnInit() {
    this.email = this.route.snapshot.queryParamMap.get('email');
    this.code = this.route.snapshot.queryParamMap.get('code');
    if (!this.email || !this.code) {
      this.errorMessage = 'Invalid or missing reset code/email.';
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    if (this.resetForm.invalid || !this.email || !this.code) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.auth
      .resetPassword(this.email, this.code, this.resetForm.value.password)
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          this.successMessage = res.msg || 'Password successfully updated!';
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage =
            err.error?.msg || 'An error occurred. Please try again.';
        },
      });
  }
}
