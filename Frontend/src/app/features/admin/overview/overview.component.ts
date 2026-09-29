import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService, AdminStats } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-page">
      <header class="page-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome to the Super Admin control panel.</p>
      </header>

      @if (loading()) {
        <div class="loading-state">Loading analytics...</div>
      } @else if (errorMsg()) {
        <div class="error-state">
          <p>{{ errorMsg() }}</p>
          <button (click)="forceLogout()" class="btn btn-outline">
            Log Out &amp; Re-authenticate
          </button>
        </div>
      } @else if (stats()) {
        <div class="dashboard-grid">
          <!-- Top Stats Row -->
          <div class="metrics-row">
            <div class="stat-card">
              <div class="stat-header">
                <div class="stat-icon users-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.5 19.5C7.5 18.5344 7.82853 17.5576 8.63092 17.0204C9.59321 16.3761 10.7524 16 12 16C13.2476 16 14.4068 16.3761 15.3691 17.0204C16.1715 17.5576 16.5 18.5344 16.5 19.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="12" cy="11" r="2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M17.5 11C18.6101 11 19.6415 11.3769 20.4974 12.0224C21.2229 12.5696 21.5 13.4951 21.5 14.4038V14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="17.5" cy="6.5" r="2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6.5 11C5.38987 11 4.35846 11.3769 3.50256 12.0224C2.77706 12.5696 2.5 13.4951 2.5 14.4038V14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="6.5" cy="6.5" r="2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
                </div>
              </div>
              <div class="stat-label">Total Users</div>
              <div class="stat-bottom">
                <div class="stat-value">{{ stats()!.totalUsers }}</div>
                @if (getTrend(stats()!.monthlyUsersData) !== 0) {
                  <div class="trend positive">
                    ↑ {{ formatTrend(stats()!.monthlyUsersData) }}
                  </div>
                }
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-header">
                <div class="stat-icon books-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.25 7C7.25 6.58579 7.58579 6.25 8 6.25H16C16.4142 6.25 16.75 6.58579 16.75 7C16.75 7.41422 16.4142 7.75 16 7.75H8C7.58579 7.75 7.25 7.41422 7.25 7Z" fill="currentColor"/>
<path d="M8 9.75C7.58579 9.75 7.25 10.0858 7.25 10.5C7.25 10.9142 7.58579 11.25 8 11.25H13C13.4142 11.25 13.75 10.9142 13.75 10.5C13.75 10.0858 13.4142 9.75 13 9.75H8Z" fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M9.94513 1.25C8.57754 1.24998 7.47521 1.24996 6.60825 1.36652C5.70814 1.48754 4.95027 1.74643 4.34835 2.34835C3.74643 2.95027 3.48754 3.70814 3.36652 4.60825C3.24996 5.47521 3.24998 6.57753 3.25 7.94512V16.0549C3.24998 17.4225 3.24996 18.5248 3.36652 19.3918C3.48754 20.2919 3.74643 21.0497 4.34835 21.6517C4.95027 22.2536 5.70814 22.5125 6.60825 22.6335C7.47522 22.75 8.57754 22.75 9.94513 22.75H14.0549C15.4225 22.75 16.5248 22.75 17.3918 22.6335C18.2919 22.5125 19.0497 22.2536 19.6517 21.6517C20.2536 21.0497 20.5125 20.2919 20.6335 19.3918C20.75 18.5248 20.75 17.4225 20.75 16.0549V7.94513C20.75 6.57754 20.75 5.47522 20.6335 4.60825C20.5125 3.70814 20.2536 2.95027 19.6517 2.34835C19.0497 1.74643 18.2919 1.48754 17.3918 1.36652C16.5248 1.24996 15.4225 1.24998 14.0549 1.25H9.94513ZM5.40901 3.40901C5.68577 3.13225 6.07435 2.9518 6.80812 2.85315C7.56347 2.75159 8.56459 2.75 10 2.75H14C15.4354 2.75 16.4365 2.75159 17.1919 2.85315C17.9257 2.9518 18.3142 3.13225 18.591 3.40901C18.8678 3.68577 19.0482 4.07435 19.1469 4.80812C19.2484 5.56347 19.25 6.56459 19.25 8V15.25L7.78198 15.25C6.96402 15.2497 6.40587 15.2495 5.92721 15.3778C5.49923 15.4925 5.10224 15.6798 4.75 15.9259V8C4.75 6.56459 4.75159 5.56347 4.85315 4.80812C4.9518 4.07435 5.13225 3.68577 5.40901 3.40901ZM4.77676 18.2491C4.79196 18.6029 4.81579 18.914 4.85315 19.1919C4.9518 19.9257 5.13225 20.3142 5.40901 20.591C5.68577 20.8678 6.07435 21.0482 6.80812 21.1469C7.56347 21.2484 8.56459 21.25 10 21.25H14C15.4354 21.25 16.4365 21.2484 17.1919 21.1469C17.9257 21.0482 18.3142 20.8678 18.591 20.591C18.8678 20.3142 19.0482 19.9257 19.1469 19.1919C19.2297 18.5756 19.246 17.7958 19.2492 16.75H7.89778C6.91952 16.75 6.57752 16.7564 6.31544 16.8267C5.59612 17.0194 5.02268 17.5541 4.77676 18.2491Z" fill="currentColor"/>
</svg>
                </div>
              </div>
              <div class="stat-label">Published Books</div>
              <div class="stat-bottom">
                <div class="stat-value">{{ stats()!.totalPublishedBooks }}</div>
                @if (getTrend(stats()!.monthlyBooksData) !== 0) {
                  <div class="trend positive">
                    ↑ {{ formatTrend(stats()!.monthlyBooksData) }}
                  </div>
                }
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-header">
                <div class="stat-icon authors-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.5502 3C6.69782 3.00694 4.6805 3.10152 3.39128 4.39073C2 5.78202 2 8.02125 2 12.4997C2 16.9782 2 19.2174 3.39128 20.6087C4.78257 22 7.0218 22 11.5003 22C15.9787 22 18.218 22 19.6093 20.6087C20.8985 19.3195 20.9931 17.3022 21 13.4498" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M11.0556 13C10.3322 3.86635 16.8023 1.27554 21.9805 2.16439C22.1896 5.19136 20.7085 6.32482 17.8879 6.84825C18.4326 7.41736 19.395 8.13354 19.2912 9.02879C19.2173 9.66586 18.7846 9.97843 17.9194 10.6036C16.0231 11.9736 13.8264 12.8375 11.0556 13Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9 17C11 11.5 12.9604 9.63636 15 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
                </div>
              </div>
              <div class="stat-label">Total Writers</div>
              <div class="stat-bottom">
                <div class="stat-value">{{ stats()!.writers }}</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-header">
                <div class="stat-icon readers-icon" style="color: var(--blue); background: var(--blue-tint);">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.25 7C7.25 6.58579 7.58579 6.25 8 6.25H16C16.4142 6.25 16.75 6.58579 16.75 7C16.75 7.41422 16.4142 7.75 16 7.75H8C7.58579 7.75 7.25 7.41422 7.25 7Z" fill="currentColor"/>
<path d="M8 9.75C7.58579 9.75 7.25 10.0858 7.25 10.5C7.25 10.9142 7.58579 11.25 8 11.25H13C13.4142 11.25 13.75 10.9142 13.75 10.5C13.75 10.0858 13.4142 9.75 13 9.75H8Z" fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M9.94513 1.25C8.57754 1.24998 7.47521 1.24996 6.60825 1.36652C5.70814 1.48754 4.95027 1.74643 4.34835 2.34835C3.74643 2.95027 3.48754 3.70814 3.36652 4.60825C3.24996 5.47521 3.24998 6.57753 3.25 7.94512V16.0549C3.24998 17.4225 3.24996 18.5248 3.36652 19.3918C3.48754 20.2919 3.74643 21.0497 4.34835 21.6517C4.95027 22.2536 5.70814 22.5125 6.60825 22.6335C7.47522 22.75 8.57754 22.75 9.94513 22.75H14.0549C15.4225 22.75 16.5248 22.75 17.3918 22.6335C18.2919 22.5125 19.0497 22.2536 19.6517 21.6517C20.2536 21.0497 20.5125 20.2919 20.6335 19.3918C20.75 18.5248 20.75 17.4225 20.75 16.0549V7.94513C20.75 6.57754 20.75 5.47522 20.6335 4.60825C20.5125 3.70814 20.2536 2.95027 19.6517 2.34835C19.0497 1.74643 18.2919 1.48754 17.3918 1.36652C16.5248 1.24996 15.4225 1.24998 14.0549 1.25H9.94513ZM5.40901 3.40901C5.68577 3.13225 6.07435 2.9518 6.80812 2.85315C7.56347 2.75159 8.56459 2.75 10 2.75H14C15.4354 2.75 16.4365 2.75159 17.1919 2.85315C17.9257 2.9518 18.3142 3.13225 18.591 3.40901C18.8678 3.68577 19.0482 4.07435 19.1469 4.80812C19.2484 5.56347 19.25 6.56459 19.25 8V15.25L7.78198 15.25C6.96402 15.2497 6.40587 15.2495 5.92721 15.3778C5.49923 15.4925 5.10224 15.6798 4.75 15.9259V8C4.75 6.56459 4.75159 5.56347 4.85315 4.80812C4.9518 4.07435 5.13225 3.68577 5.40901 3.40901ZM4.77676 18.2491C4.79196 18.6029 4.81579 18.914 4.85315 19.1919C4.9518 19.9257 5.13225 20.3142 5.40901 20.591C5.68577 20.8678 6.07435 21.0482 6.80812 21.1469C7.56347 21.2484 8.56459 21.25 10 21.25H14C15.4354 21.25 16.4365 21.2484 17.1919 21.1469C17.9257 21.0482 18.3142 20.8678 18.591 20.591C18.8678 20.3142 19.0482 19.9257 19.1469 19.1919C19.2297 18.5756 19.246 17.7958 19.2492 16.75H7.89778C6.91952 16.75 6.57752 16.7564 6.31544 16.8267C5.59612 17.0194 5.02268 17.5541 4.77676 18.2491Z" fill="currentColor"/>
</svg>
                </div>
              </div>
              <div class="stat-label">Total Readers</div>
              <div class="stat-bottom">
                <div class="stat-value">{{ stats()!.readers }}</div>
              </div>
            </div>
          </div>

          <!-- Charts Row -->
          <div class="charts-row">
            <!-- Unified Analytics Chart -->
            <div class="analytics-card card-panel">
              <div class="analytics-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h3 style="font-size: 20px; font-weight: 700; color: var(--sd-text); font-family: var(--display);">Platform Growth</h3>
                <div class="time-tabs" style="display: flex; gap: 8px; align-items: center;">
                  @if (chartLoading()) {
                    <span style="font-size: 12px; color: var(--sd-muted); margin-right: 8px;">Loading...</span>
                  }
                  @for (opt of ['Today', 'This Week', 'This Month', 'This Year']; track opt) {
                    <button
                      class="time-tab"
                      (click)="selectSort(opt)"
                      style="padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s;"
                      [style.background]="opt === currentSort() ? '#94a3b8' : '#f1f5f9'"
                      [style.color]="opt === currentSort() ? 'white' : '#475569'"
                      [disabled]="chartLoading()"
                      [style.opacity]="chartLoading() ? '0.5' : '1'"
                    >
                      {{ opt }}
                    </button>
                  }
                </div>
              </div>

              <div class="analytics-metrics" [style.opacity]="chartLoading() ? '0.5' : '1'" style="display: flex; justify-content: space-around; margin-bottom: 40px; text-align: center; border-bottom: 1px dashed #e2e8f0; padding-bottom: 24px; transition: opacity 0.3s;">
                <div class="metric-item" style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                  <span class="label" style="font-size: 14px; font-weight: 500; color: #64748b;">New Users (This Month)</span>
                  <div style="display: flex; align-items: baseline; gap: 8px;">
                    <span class="value" style="font-family: var(--display); font-size: 24px; font-weight: 700; color: #1e293b;">{{ stats()!.monthlyUsersData[stats()!.monthlyUsersData.length - 1] || 0 }}</span>
                    <span class="trend positive" style="font-size: 12px; font-weight: 600; color: #10b981; background: transparent; padding: 0;">{{ formatTrend(stats()!.monthlyUsersData) }} ↑</span>
                  </div>
                </div>
                <div class="metric-item" style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                  <span class="label" style="font-size: 14px; font-weight: 500; color: #64748b;">New Books (This Month)</span>
                  <div style="display: flex; align-items: baseline; gap: 8px;">
                    <span class="value" style="font-family: var(--display); font-size: 24px; font-weight: 700; color: #1e293b;">{{ stats()!.monthlyBooksData[stats()!.monthlyBooksData.length - 1] || 0 }}</span>
                    <span class="trend positive" style="font-size: 12px; font-weight: 600; color: #10b981; background: transparent; padding: 0;">{{ formatTrend(stats()!.monthlyBooksData) }} ↑</span>
                  </div>
                </div>
              </div>

              <div class="chart-legend" style="display: flex; justify-content: flex-end; gap: 16px; margin-bottom: -16px; position: relative; z-index: 2;">
                <div class="legend-item" style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #64748b;">
                  <span class="dot" style="width: 12px; height: 12px; border-radius: 50%; background: #6366f1;"></span> New Users
                </div>
                <div class="legend-item" style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #64748b;">
                  <span class="dot" style="width: 12px; height: 12px; border-radius: 50%; background: #f59e0b;"></span> New Books
                </div>
              </div>

              <div class="analytics-chart-wrapper" [style.opacity]="chartLoading() ? '0.5' : '1'" style="transition: opacity 0.3s;">
                <div class="y-axis">
                  <span>{{ getMaxValue() }}</span>
                  <span>{{ getMaxValue() / 2 | number: '1.0-0' }}</span>
                  <span>0</span>
                </div>

                <div class="chart-container">
                  <svg class="unified-chart" viewBox="0 0 1000 260" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="blueGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stop-color="#6366f1" stop-opacity="0.3" />
                        <stop offset="100%" stop-color="#6366f1" stop-opacity="0.0" />
                      </linearGradient>
                      <linearGradient id="orangeGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.2" />
                        <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.0" />
                      </linearGradient>
                    </defs>

                    <!-- Horizontal Grid Lines -->
                    <line x1="0" y1="50" x2="1000" y2="50" stroke="#f1f5f9" stroke-width="1" />
                    <line x1="0" y1="150" x2="1000" y2="150" stroke="#f1f5f9" stroke-width="1" />
                    <line x1="0" y1="250" x2="1000" y2="250" stroke="#f1f5f9" stroke-width="1" />

                    <!-- New Books Smooth Area -->
                    <path [attr.d]="getAreaPath(stats()!.monthlyBooksData, true, true)" fill="url(#orangeGradient)" />
                    <path [attr.d]="getAreaPath(stats()!.monthlyBooksData, false, true)" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <!-- New Books Points -->
                    @for (val of stats()!.monthlyBooksData; track $index) {
                      <circle
                        [attr.cx]="getBarX($index, stats()!.monthlyBooksData.length)"
                        [attr.cy]="getPointY(val, getMaxValue())"
                        r="4"
                        fill="white"
                        stroke="#f59e0b"
                        stroke-width="2"
                      />
                    }

                    <!-- New Users Smooth Area -->
                    <path [attr.d]="getAreaPath(stats()!.monthlyUsersData, true, true)" fill="url(#blueGradient)" />
                    <path [attr.d]="getAreaPath(stats()!.monthlyUsersData, false, true)" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <!-- New Users Points -->
                    @for (val of stats()!.monthlyUsersData; track $index) {
                      <circle
                        [attr.cx]="getBarX($index, stats()!.monthlyUsersData.length)"
                        [attr.cy]="getPointY(val, getMaxValue())"
                        r="4"
                        fill="white"
                        stroke="#6366f1"
                        stroke-width="2"
                      />
                    }

                    <!-- Hover Areas (Invisible Rectangles for tooltips) -->
                    @for (label of stats()!.chartLabels; track $index) {
                      <rect
                        [attr.x]="getBarX($index, stats()!.chartLabels.length) - (1000 / (stats()!.chartLabels.length > 1 ? stats()!.chartLabels.length - 1 : 1)) / 2"
                        y="0"
                        [attr.width]="1000 / (stats()!.chartLabels.length > 1 ? stats()!.chartLabels.length - 1 : 1)"
                        height="250"
                        fill="transparent"
                        (mouseenter)="hoverIndex.set($index)"
                        (mouseleave)="hoverIndex.set(null)"
                        style="cursor: pointer;"
                      />
                    }

                    <!-- Tooltip Line & Active Points -->
                    @if (hoverIndex() !== null) {
                      <line
                        [attr.x1]="getBarX(hoverIndex()!, stats()!.chartLabels.length)"
                        y1="50"
                        [attr.x2]="getBarX(hoverIndex()!, stats()!.chartLabels.length)"
                        y2="250"
                        stroke="#94a3b8"
                        stroke-width="1"
                        stroke-dasharray="4 4"
                        pointer-events="none"
                      />
                      <circle
                        [attr.cx]="getBarX(hoverIndex()!, stats()!.monthlyBooksData.length)"
                        [attr.cy]="getPointY(stats()!.monthlyBooksData[hoverIndex()!], getMaxValue())"
                        r="6"
                        fill="white"
                        stroke="#f59e0b"
                        stroke-width="3"
                        pointer-events="none"
                      />
                      <circle
                        [attr.cx]="getBarX(hoverIndex()!, stats()!.monthlyUsersData.length)"
                        [attr.cy]="getPointY(stats()!.monthlyUsersData[hoverIndex()!], getMaxValue())"
                        r="6"
                        fill="white"
                        stroke="#6366f1"
                        stroke-width="3"
                        pointer-events="none"
                      />
                    }
                  </svg>

                  <div class="x-axis">
                    @for (label of stats()!.chartLabels; track $index) {
                      <span style="flex: 1; text-align: center;">{{ label }}</span>
                    }
                  </div>

                  <!-- HTML Tooltip Box -->
                  @if (hoverIndex() !== null) {
                    <div
                      class="chart-tooltip"
                      [style.left]="(getBarX(hoverIndex()!, stats()!.chartLabels.length) / 1000) * 100 + '%'"
                    >
                      <div class="tooltip-header">{{ stats()!.chartLabels[hoverIndex()!] }}</div>
                      <div class="tooltip-row">
                        <span class="dot" style="background: #6366f1;"></span> New Users: <strong>{{ stats()!.monthlyUsersData[hoverIndex()!] }}</strong>
                      </div>
                      <div class="tooltip-row">
                        <span class="dot" style="background: #f59e0b;"></span> New Books: <strong>{{ stats()!.monthlyBooksData[hoverIndex()!] }}</strong>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Target Chart -->
            <div class="target-card card-panel">
              <div class="panel-header">
                <h3>User Distribution</h3>
                <p>Percentage of readers vs total users</p>
              </div>
              <div class="target-chart">
                <svg viewBox="0 0 36 36" class="circular-chart">
                  <path
                    class="circle-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    class="circle blue-circle"
                    [attr.stroke-dasharray]="getReadersRatio() + ', 100'"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="20.35" class="percentage">
                    {{ getReadersRatio() | number: '1.0-0' }}%
                  </text>
                </svg>
              </div>
              <div class="target-footer">
                <div class="target-stat">
                  <span>Readers</span>
                  <strong>{{ stats()!.readers }}</strong>
                </div>
                <div class="target-stat">
                  <span>Writers</span>
                  <strong>{{ stats()!.writers }}</strong>
                </div>
              </div>
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
        margin-bottom: 24px;
      }
      .page-header h1 {
        font-family: var(--display);
        font-size: 24px;
        color: var(--sd-text);
        margin-bottom: 4px;
      }
      .page-header p {
        color: var(--sd-muted);
        font-size: 14px;
      }

      .loading-state {
        padding: 48px;
        text-align: center;
        color: var(--sd-muted);
      }
      .error-state {
        padding: 48px;
        text-align: center;
        color: var(--rose);
        background: var(--rose-tint);
        border-radius: var(--radius-m);
      }
      .error-state p {
        margin-bottom: 16px;
        font-weight: 500;
      }
      .btn-outline {
        padding: 8px 16px;
        border: 1px solid var(--rose);
        color: var(--rose);
        background: transparent;
        border-radius: 4px;
        cursor: pointer;
      }

      .dashboard-grid {
        display: flex;
        flex-direction: column;
        gap: 32px;
      }

      .metrics-row {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 24px;
      }

      .charts-row {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 24px;
      }

      .card-panel {
        background: var(--sd-sidebar);
        border: 1px solid var(--sd-border);
        border-radius: var(--radius-l);
        padding: 32px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
        transition: box-shadow 0.3s ease;
      }
      .card-panel:hover {
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
      }
      .panel-header h3 {
        font-family: var(--display);
        font-size: 16px;
        font-weight: 600;
        color: var(--sd-text);
        margin-bottom: 4px;
      }
      .panel-header p {
        font-size: 13px;
        color: var(--sd-muted);
      }

      .stat-card {
        background: var(--sd-sidebar);
        border: 1px solid var(--sd-border);
        border-radius: var(--radius-l);
        padding: 24px;
        text-decoration: none;
        display: flex;
        flex-direction: column;
        position: relative;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
      }
      .stat-header {
        margin-bottom: 16px;
        position: relative;
        z-index: 2;
      }
      .stat-icon {
        display: flex;
        align-items: center;
        justify-content: flex-start;
      }
      .users-icon { background: transparent; color: var(--sd-text); }
      .books-icon { background: transparent; color: var(--sd-text); }

      .stat-label {
        font-size: 13px;
        color: var(--sd-muted);
        font-weight: 400;
        margin-bottom: 8px;
        position: relative;
        z-index: 2;
      }
      .stat-bottom {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        position: relative;
        z-index: 2;
      }
      .stat-value {
        font-family: var(--display);
        font-size: 28px;
        font-weight: 500;
        color: var(--sd-text);
        line-height: 1;
      }
      .trend {
        font-size: 12px;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 100px;
      }
      .trend.positive {
        background: var(--forest-tint);
        color: var(--forest-deep);
      }

      /* Target Chart */
      .target-card {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      .target-chart {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px 0;
      }
      .circular-chart {
        display: block;
        margin: 0 auto;
        max-width: 180px;
        max-height: 250px;
      }
      .circle-bg {
        fill: none;
        stroke: var(--paper-soft);
        stroke-width: 2.5;
      }
      .circle {
        fill: none;
        stroke-width: 2.5;
        stroke-linecap: round;
        animation: progress 1s ease-out forwards;
      }
      .circle.blue-circle {
        stroke: #3b82f6;
      }
      @keyframes progress {
        0% { stroke-dasharray: 0 100; }
      }
      .percentage {
        fill: var(--sd-text);
        font-family: var(--display);
        font-size: 8px;
        font-weight: 700;
        text-anchor: middle;
      }
      .target-footer {
        display: flex;
        justify-content: space-between;
        border-top: 1px solid var(--sd-border);
        padding-top: 16px;
        margin-top: auto;
      }
      .target-stat {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .target-stat span { font-size: 13px; color: var(--sd-muted); }
      .target-stat strong { font-size: 18px; color: var(--sd-text); }

      /* Analytics Chart */
      .analytics-card { margin-top: 0; }

      .chart-tooltip {
        position: absolute;
        top: 20px;
        transform: translateX(-50%);
        background: white;
        border: 1px solid var(--sd-border);
        border-radius: 8px;
        padding: 12px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        z-index: 10;
        min-width: 130px;
        pointer-events: none;
      }
      .tooltip-header {
        font-size: 13px;
        font-weight: 700;
        color: #1e293b;
        margin-bottom: 8px;
        padding-bottom: 6px;
        border-bottom: 1px solid var(--sd-border);
      }
      .tooltip-row {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: #64748b;
        margin-bottom: 4px;
      }
      .tooltip-row:last-child { margin-bottom: 0; }
      .tooltip-row .dot { width: 8px; height: 8px; border-radius: 50%; }
      .tooltip-row strong { color: #1e293b; margin-left: auto; }

      .analytics-chart-wrapper {
        display: flex;
        height: 300px;
        position: relative;
      }

      .y-axis {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        font-size: 12px;
        font-weight: 500;
        color: #94a3b8;
        padding-top: 55px;
        padding-right: 24px;
        padding-bottom: 24px;
        text-align: right;
        width: 40px;
      }

      .chart-container {
        flex: 1;
        position: relative;
      }

      .unified-chart {
        width: 100%;
        height: calc(100% - 24px);
        overflow: visible;
      }

      .x-axis {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        font-weight: 500;
        color: #94a3b8;
      }

      /* Mobile Responsive */
      @media (max-width: 1024px) {
        .dashboard-grid { gap: 16px; }
      }
      @media (max-width: 768px) {
        .page-header { padding: 24px 0 16px; }
        .page-header h1 { font-size: 22px; }
        .metrics-row { grid-template-columns: repeat(2, 1fr); }
        .analytics-chart-wrapper { height: 200px; }
      }
      @media (max-width: 480px) {
        .metrics-row { grid-template-columns: 1fr; }
      }
    `,
  ],
})
export class OverviewComponent implements OnInit {
  adminService = inject(AdminService);
  authService = inject(AuthService);
  router = inject(Router);

  stats = signal<AdminStats | null>(null);
  loading = signal(true);
  errorMsg = signal<string | null>(null);

  baseStats: AdminStats | null = null;

  sortOptions = ['1Y', '6M'];
  currentSort = signal('This Year');
  sortDropdownOpen = signal(false);
  hoverIndex = signal<number | null>(null);

  chartLoading = signal(false);

  selectSort(option: string) {
    if (this.currentSort() === option) return;
    this.currentSort.set(option);
    this.sortDropdownOpen.set(false);
    this.chartLoading.set(true);

    this.adminService.getStats(option).subscribe({
      next: (data) => {
        this.baseStats = JSON.parse(JSON.stringify(data));
        this.stats.set(data);
        this.chartLoading.set(false);
      },
      error: () => {
        this.chartLoading.set(false);
        this.errorMsg.set(`Failed to load data for ${option}`);
      }
    });
  }

  ngOnInit() {
    this.adminService.getStats().subscribe({
      next: (data) => {
        this.baseStats = JSON.parse(JSON.stringify(data));
        this.stats.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 401) {
          this.errorMsg.set(
            'Your session is invalid (likely because the database was reset). Please log out and log back in.',
          );
        } else {
          this.errorMsg.set('Failed to load analytics data.');
        }
      },
    });
  }

  forceLogout() {
    this.authService.logout().subscribe(() => {
      window.location.href = '/login';
    });
  }

  // Calculate simple trend percentage vs previous month (dynamic — works for any slice)
  getTrend(data: number[]): number {
    if (!data || data.length < 2) return 0;
    const current = data[data.length - 1];
    const prev = data[data.length - 2];
    if (prev === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - prev) / prev) * 100);
  }

  // Display-safe trend: caps at 999%+
  formatTrend(data: number[]): string {
    const t = this.getTrend(data);
    if (t > 999) return '999%+';
    if (t < -999) return '999%-';
    return `${Math.abs(t)}%`;
  }

  getReadersRatio(): number {
    const s = this.stats();
    if (!s) return 0;
    const total = s.readers + s.writers;
    if (total === 0) return 0;
    return (s.readers / total) * 100;
  }

  // Unified max so both lines share the same Y scale
  getMaxValue(): number {
    const s = this.stats();
    if (!s) return 10;
    const maxU = s.monthlyUsersData ? Math.max(...s.monthlyUsersData) : 0;
    const maxB = s.monthlyBooksData ? Math.max(...s.monthlyBooksData) : 0;
    const max = Math.max(maxU, maxB);
    return max < 10 ? 10 : Math.ceil(max / 10) * 10;
  }

  getPointY(val: number, max: number): number {
    const h = 250;
    return h - (val / max) * 200;
  }

  getBarX(index: number, totalLen: number): number {
    const w = 1000;
    const stepX = w / (totalLen > 1 ? totalLen - 1 : 1);
    return index * stepX;
  }

  getAreaPath(data: number[], closePath: boolean, smooth: boolean = false): string {
    if (!data || data.length === 0) return '';
    const max = this.getMaxValue();
    const w = 1000;

    const stepX = w / (data.length > 1 ? data.length - 1 : 1);

    let path = '';

    for (let i = 0; i < data.length; i++) {
      const x = i * stepX;
      const y = this.getPointY(data[i], max);

      if (i === 0) {
        path += `M ${x},${y}`;
      } else {
        if (smooth) {
          const prevX = (i - 1) * stepX;
          const prevY = this.getPointY(data[i - 1], max);
          const cX1 = prevX + stepX / 2.5;
          const cY1 = prevY;
          const cX2 = x - stepX / 2.5;
          const cY2 = y;
          path += ` C ${cX1},${cY1} ${cX2},${cY2} ${x},${y}`;
        } else {
          path += ` L ${x},${y}`;
        }
      }
    }

    if (closePath) {
      path += ` L ${w},250 L 0,250 Z`;
    }

    return path;
  }
}
