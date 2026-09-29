const fs = require('fs');
const file = 'Frontend/src/app/features/admin/overview/overview.component.ts';
let content = fs.readFileSync(file, 'utf8');

const newTemplate = `    <div class="admin-page">
      <header class="page-header">
        <div>
          <h1>Welcome back, Admin!</h1>
          <p>Welcome back! Here's what's happening today.</p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary">Export Data</button>
          <button class="btn-primary">Create Automation</button>
        </div>
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
            <!-- Total Users -->
            <div class="stat-card">
              <div class="stat-header">
                <div class="stat-icon-wrapper">
                  <div class="stat-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></div>
                  <div class="stat-label">Total Users</div>
                </div>
                <svg class="more-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
              </div>
              <div class="stat-bottom">
                <div class="stat-value">{{ stats()!.totalUsers | number }}</div>
                <div class="trend-pill" [class.positive]="getTrend(stats()!.monthlyUsersData) >= 0" [class.negative]="getTrend(stats()!.monthlyUsersData) < 0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                  {{ getTrend(stats()!.monthlyUsersData) > 0 ? '+' : '' }}{{ formatTrend(stats()!.monthlyUsersData) }}
                </div>
              </div>
            </div>

            <!-- Published Books -->
            <div class="stat-card">
              <div class="stat-header">
                <div class="stat-icon-wrapper">
                  <div class="stat-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg></div>
                  <div class="stat-label">Published Books</div>
                </div>
                <svg class="more-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
              </div>
              <div class="stat-bottom">
                <div class="stat-value">{{ stats()!.totalPublishedBooks | number }}</div>
                <div class="trend-pill" [class.positive]="getTrend(stats()!.monthlyBooksData) >= 0" [class.negative]="getTrend(stats()!.monthlyBooksData) < 0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                  {{ getTrend(stats()!.monthlyBooksData) > 0 ? '+' : '' }}{{ formatTrend(stats()!.monthlyBooksData) }}
                </div>
              </div>
            </div>

            <!-- Writers -->
            <div class="stat-card">
              <div class="stat-header">
                <div class="stat-icon-wrapper">
                  <div class="stat-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg></div>
                  <div class="stat-label">Total Writers</div>
                </div>
                <svg class="more-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
              </div>
              <div class="stat-bottom">
                <div class="stat-value">{{ stats()!.writers | number }}</div>
              </div>
            </div>

            <!-- Active Subscriptions -->
            <div class="stat-card">
              <div class="stat-header">
                <div class="stat-icon-wrapper">
                  <div class="stat-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg></div>
                  <div class="stat-label">Subscriptions</div>
                </div>
                <svg class="more-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
              </div>
              <div class="stat-bottom">
                <div class="stat-value">{{ stats()!.activeSubscriptions || 0 | number }}</div>
              </div>
            </div>
          </div>

          <!-- Charts Row -->
          <div class="charts-row">
            <!-- Unified Analytics Chart -->
            <div class="analytics-card card-panel">
              <div class="analytics-header">
                <div>
                  <h3>Platform Growth</h3>
                  <p>Last 12 months overview</p>
                </div>
                <div class="chart-legend">
                  <div class="legend-item">
                    <span class="dot users-dot"></span> Users
                  </div>
                  <div class="legend-item">
                    <span class="dot books-dot"></span> Books
                  </div>
                </div>
              </div>

              <div class="analytics-chart-wrapper" [style.opacity]="chartLoading() ? '0.5' : '1'">
                <div class="y-axis">
                  <span>{{ getMaxValue() }}</span>
                  <span>{{ getMaxValue() / 2 | number: '1.0-0' }}</span>
                  <span>0</span>
                </div>

                <div class="chart-container">
                  <svg class="unified-chart" viewBox="0 0 1000 240" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="blueGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stop-color="#6366f1" stop-opacity="0.15" />
                        <stop offset="100%" stop-color="#6366f1" stop-opacity="0.0" />
                      </linearGradient>
                      <linearGradient id="orangeGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.1" />
                        <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.0" />
                      </linearGradient>
                    </defs>

                    <!-- Horizontal Grid Lines -->
                    <line x1="0" y1="40" x2="1000" y2="40" stroke="#f1f5f9" stroke-width="1.5" />
                    <line x1="0" y1="120" x2="1000" y2="120" stroke="#f1f5f9" stroke-width="1.5" stroke-dasharray="4 4" />
                    <line x1="0" y1="200" x2="1000" y2="200" stroke="#f1f5f9" stroke-width="1.5" />

                    <!-- New Books Smooth Area -->
                    <path [attr.d]="getAreaPath(stats()!.monthlyBooksData, true, false)" fill="url(#orangeGradient)" />
                    <path [attr.d]="getAreaPath(stats()!.monthlyBooksData, false, false)" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

                    <!-- New Users Smooth Area -->
                    <path [attr.d]="getAreaPath(stats()!.monthlyUsersData, true, false)" fill="url(#blueGradient)" />
                    <path [attr.d]="getAreaPath(stats()!.monthlyUsersData, false, false)" fill="none" stroke="#6366f1" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

                    <!-- Hover Areas (Invisible Rectangles for tooltips) -->
                    @for (label of stats()!.chartLabels; track $index) {
                      <rect
                        [attr.x]="getBarX($index, stats()!.chartLabels.length) - (1000 / (stats()!.chartLabels.length > 1 ? stats()!.chartLabels.length - 1 : 1)) / 2"
                        y="0"
                        [attr.width]="1000 / (stats()!.chartLabels.length > 1 ? stats()!.chartLabels.length - 1 : 1)"
                        height="240"
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
                        y1="20"
                        [attr.x2]="getBarX(hoverIndex()!, stats()!.chartLabels.length)"
                        y2="200"
                        stroke="#e2e8f0"
                        stroke-width="2"
                        stroke-dasharray="4 4"
                        pointer-events="none"
                      />
                      <circle
                        [attr.cx]="getBarX(hoverIndex()!, stats()!.monthlyBooksData.length)"
                        [attr.cy]="getPointY(stats()!.monthlyBooksData[hoverIndex()!], getMaxValue())"
                        r="5"
                        fill="white"
                        stroke="#f59e0b"
                        stroke-width="3"
                        pointer-events="none"
                      />
                      <circle
                        [attr.cx]="getBarX(hoverIndex()!, stats()!.monthlyUsersData.length)"
                        [attr.cy]="getPointY(stats()!.monthlyUsersData[hoverIndex()!], getMaxValue())"
                        r="5"
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
                      class="chart-tooltip shadow-box"
                      [style.left]="(getBarX(hoverIndex()!, stats()!.chartLabels.length) / 1000) * 100 + '%'"
                    >
                      <div class="tooltip-header">{{ stats()!.chartLabels[hoverIndex()!] }}</div>
                      <div class="tooltip-row">
                        <span class="dot users-dot"></span> <span class="tooltip-label">Users:</span> <strong>{{ stats()!.monthlyUsersData[hoverIndex()!] }}</strong>
                      </div>
                      <div class="tooltip-row">
                        <span class="dot books-dot"></span> <span class="tooltip-label">Books:</span> <strong>{{ stats()!.monthlyBooksData[hoverIndex()!] }}</strong>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Target Chart -->
            <div class="target-card card-panel">
              <div class="panel-header">
                <h3>User Types</h3>
                <p>Distribution</p>
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
                  <foreignObject x="9" y="9" width="18" height="18">
                    <div xmlns="http://www.w3.org/1999/xhtml" style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%;">
                      <div style="background:white; border-radius:50%; width: 100%; height: 100%; display:flex; flex-direction:column; align-items:center; justify-content:center; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                        <span style="font-size: 3px; color: #64748b; font-weight: 500;">Readers</span>
                        <span style="font-size: 5px; font-weight: 700; color: #0f172a;">{{ getReadersRatio() | number: '1.0-0' }}%</span>
                      </div>
                    </div>
                  </foreignObject>
                </svg>
              </div>
            </div>

            <!-- Pending Actions -->
            <div class="list-card card-panel">
               <div class="panel-header" style="display: flex; justify-content: space-between; align-items: baseline;">
                 <div>
                   <h3>Pending Actions</h3>
                   <p>Needs review</p>
                 </div>
                 <a routerLink="/admin/approvals" class="view-all-link">View All</a>
               </div>
               <div class="list-items">
                 <div class="list-item">
                   <div class="list-item-title">Book Approvals</div>
                   <div class="list-item-stats">
                     <span class="list-item-value">{{ stats()!.pendingBooks }}</span>
                     <div class="progress-bar-bg">
                        <div class="progress-bar-fill" style="width: 75%;"></div>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      }
    </div>`;

const newStyles = `      :host {
        --c-bg: #f8fafc;
        --c-card: #ffffff;
        --c-text: #0f172a;
        --c-muted: #64748b;
        --c-border: #e2e8f0;
        --c-primary: #6366f1;
        --c-success: #10b981;
        --c-danger: #ef4444;
      }
      .admin-page {
        padding: 32px 40px 60px;
        background: var(--c-bg);
        min-height: 100vh;
        font-family: 'Inter', sans-serif;
      }
      .page-header {
        margin-bottom: 32px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .page-header h1 {
        font-size: 24px;
        color: var(--c-text);
        margin-bottom: 4px;
        font-weight: 700;
        letter-spacing: -0.5px;
      }
      .page-header p {
        color: var(--c-muted);
        font-size: 14px;
        margin: 0;
      }
      .header-actions {
        display: flex;
        gap: 12px;
      }
      .btn-primary, .btn-secondary {
        padding: 10px 18px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        border: 1px solid transparent;
        transition: all 0.2s;
      }
      .btn-primary {
        background: var(--c-primary);
        color: white;
      }
      .btn-primary:hover {
        opacity: 0.9;
      }
      .btn-secondary {
        background: #f1f5f9;
        border-color: #e2e8f0;
        color: var(--c-text);
      }
      .btn-secondary:hover { background: #e2e8f0; }

      .dashboard-grid {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .metrics-row {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 24px;
      }

      .stat-card {
        background: var(--c-card);
        border: 1px solid rgba(226, 232, 240, 0.6);
        border-radius: 20px;
        padding: 24px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .stat-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .stat-icon-wrapper {
        display: flex;
        align-items: center;
        gap: 10px;
        background: #f8fafc;
        padding: 6px 12px 6px 8px;
        border-radius: 12px;
      }
      .stat-icon {
        color: var(--c-muted);
        display: flex;
      }
      .stat-label {
        font-size: 13px;
        font-weight: 600;
        color: var(--c-text);
      }
      .more-icon {
        color: #cbd5e1;
      }
      .stat-bottom {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .stat-value {
        font-size: 32px;
        font-weight: 700;
        color: var(--c-text);
        letter-spacing: -1px;
        line-height: 1;
      }
      .trend-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 6px 10px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 700;
      }
      .trend-pill.positive {
        background: #ecfdf5;
        color: var(--c-success);
      }
      .trend-pill.negative {
        background: #fef2f2;
        color: var(--c-danger);
      }
      .trend-pill.negative svg {
        transform: rotate(180deg);
      }

      .charts-row {
        display: grid;
        grid-template-columns: 2.5fr 1fr 1.5fr;
        gap: 24px;
      }

      .card-panel {
        background: var(--c-card);
        border: 1px solid rgba(226, 232, 240, 0.6);
        border-radius: 24px;
        padding: 28px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
      }
      .panel-header h3 {
        font-size: 18px;
        font-weight: 700;
        color: var(--c-text);
        margin: 0 0 4px;
        letter-spacing: -0.5px;
      }
      .panel-header p {
        font-size: 13px;
        color: var(--c-muted);
        margin: 0;
      }

      /* Unified Chart */
      .analytics-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24px;
      }
      .analytics-header h3 {
        font-size: 18px;
        font-weight: 700;
        color: var(--c-text);
        margin: 0 0 4px;
        letter-spacing: -0.5px;
      }
      .analytics-header p {
        color: var(--c-muted);
        font-size: 13px;
        margin: 0;
      }
      .chart-legend {
        display: flex;
        gap: 16px;
      }
      .legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 600;
        color: var(--c-muted);
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
      .users-dot { background: var(--c-primary); }
      .books-dot { background: #f59e0b; }

      .analytics-chart-wrapper {
        display: flex;
        position: relative;
        margin-top: 16px;
        height: 260px;
        transition: opacity 0.3s;
      }
      .y-axis {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        font-size: 12px;
        font-weight: 600;
        color: #cbd5e1;
        padding-top: 30px;
        padding-right: 16px;
        padding-bottom: 24px;
        text-align: right;
        width: 45px;
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
        font-weight: 600;
        color: #cbd5e1;
      }
      .chart-tooltip {
        position: absolute;
        top: 20px;
        transform: translateX(-50%);
        background: white;
        border: 1px solid var(--c-border);
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        z-index: 10;
        min-width: 150px;
        pointer-events: none;
      }
      .tooltip-header {
        font-size: 13px;
        font-weight: 700;
        color: var(--c-text);
        margin-bottom: 12px;
      }
      .tooltip-row {
        display: flex;
        align-items: center;
        font-size: 13px;
        color: var(--c-text);
        margin-bottom: 8px;
      }
      .tooltip-label {
        color: var(--c-muted);
        margin-left: 6px;
        margin-right: auto;
      }

      /* Target Chart */
      .target-card {
        display: flex;
        flex-direction: column;
      }
      .target-chart {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px 0;
      }
      .circular-chart {
        display: block;
        margin: 0 auto;
        max-width: 180px;
        max-height: 180px;
      }
      .circle-bg {
        fill: none;
        stroke: #f1f5f9;
        stroke-width: 6;
      }
      .circle {
        fill: none;
        stroke-width: 6;
        stroke-linecap: round;
        animation: progress 1s ease-out forwards;
      }
      .circle.blue-circle {
        stroke: var(--c-primary);
      }
      @keyframes progress {
        0% { stroke-dasharray: 0 100; }
      }

      /* Pending Actions */
      .list-card {
        display: flex;
        flex-direction: column;
      }
      .view-all-link {
        font-size: 13px;
        color: var(--c-primary);
        text-decoration: none;
        font-weight: 600;
      }
      .list-items {
        margin-top: 24px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .list-item {
        padding: 16px;
        background: #f8fafc;
        border-radius: 12px;
      }
      .list-item-title {
        font-size: 14px;
        color: var(--c-muted);
        font-weight: 600;
        margin-bottom: 12px;
      }
      .list-item-stats {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .list-item-value {
        font-size: 24px;
        font-weight: 700;
        color: var(--c-text);
        letter-spacing: -0.5px;
      }
      .progress-bar-bg {
        height: 6px;
        width: 60%;
        background: #e2e8f0;
        border-radius: 3px;
        overflow: hidden;
      }
      .progress-bar-fill {
        height: 100%;
        background: var(--c-primary);
        border-radius: 3px;
      }

      /* Loading & Error */
      .loading-state, .error-state { padding: 48px; text-align: center; }
      .error-state p { color: var(--c-danger); margin-bottom: 16px; }

      @media (max-width: 1280px) {
        .charts-row { grid-template-columns: 1fr 1fr; }
        .analytics-card { grid-column: 1 / -1; }
      }
      @media (max-width: 1024px) {
        .metrics-row { grid-template-columns: repeat(2, 1fr); }
      }
      @media (max-width: 768px) {
        .charts-row { grid-template-columns: 1fr; }
      }
`;

const startTemplate = content.indexOf('template: `') + 11;
const endTemplate = content.indexOf('`,', startTemplate);
const newContent1 = content.substring(0, startTemplate) + newTemplate + content.substring(endTemplate);

const startStyles = newContent1.indexOf('styles: [\n`') + 11;
const endStyles = newContent1.indexOf('`,', startStyles);
const newContent2 = newContent1.substring(0, startStyles) + newStyles + newContent1.substring(endStyles);

fs.writeFileSync(file, newContent2);
console.log('Update Complete');
