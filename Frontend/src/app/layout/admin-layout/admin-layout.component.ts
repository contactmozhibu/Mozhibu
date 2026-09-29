import { Component, inject, signal, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { ApiService } from '../../core/services/api.service';

interface AdminNotification {
  id: string;
  type: 'mature_book' | 'contact_query' | 'feedback';
  title: string;
  message: string;
  route: string;
  time: string;
  isNew: boolean;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-shell" [class.dark]="isDark()">
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed()">
        <div class="sidebar-logo">
          <a routerLink="/admin" class="logo-link">
            <img loading="lazy" src="assets/logo.png" alt="Mozhibu" class="logo-img" />
            <span class="logo-text">Mozhibu</span>
          </a>
          <button class="collapse-btn" (click)="toggleSidebar()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
          </button>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-group">
            <span class="nav-group-label">Dashboard</span>
            <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="nav-link">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
              <span class="nav-label">Overview</span>
            </a>
          </div>

          <div class="nav-group">
            <span class="nav-group-label">Content</span>
            <a routerLink="/admin/books" routerLinkActive="active" class="nav-link">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.25 7C7.25 6.58579 7.58579 6.25 8 6.25H16C16.4142 6.25 16.75 6.58579 16.75 7C16.75 7.41422 16.4142 7.75 16 7.75H8C7.58579 7.75 7.25 7.41422 7.25 7Z" fill="currentColor"/>
<path d="M8 9.75C7.58579 9.75 7.25 10.0858 7.25 10.5C7.25 10.9142 7.58579 11.25 8 11.25H13C13.4142 11.25 13.75 10.9142 13.75 10.5C13.75 10.0858 13.4142 9.75 13 9.75H8Z" fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M9.94513 1.25C8.57754 1.24998 7.47521 1.24996 6.60825 1.36652C5.70814 1.48754 4.95027 1.74643 4.34835 2.34835C3.74643 2.95027 3.48754 3.70814 3.36652 4.60825C3.24996 5.47521 3.24998 6.57753 3.25 7.94512V16.0549C3.24998 17.4225 3.24996 18.5248 3.36652 19.3918C3.48754 20.2919 3.74643 21.0497 4.34835 21.6517C4.95027 22.2536 5.70814 22.5125 6.60825 22.6335C7.47522 22.75 8.57754 22.75 9.94513 22.75H14.0549C15.4225 22.75 16.5248 22.75 17.3918 22.6335C18.2919 22.5125 19.0497 22.2536 19.6517 21.6517C20.2536 21.0497 20.5125 20.2919 20.6335 19.3918C20.75 18.5248 20.75 17.4225 20.75 16.0549V7.94513C20.75 6.57754 20.75 5.47522 20.6335 4.60825C20.5125 3.70814 20.2536 2.95027 19.6517 2.34835C19.0497 1.74643 18.2919 1.48754 17.3918 1.36652C16.5248 1.24996 15.4225 1.24998 14.0549 1.25H9.94513ZM5.40901 3.40901C5.68577 3.13225 6.07435 2.9518 6.80812 2.85315C7.56347 2.75159 8.56459 2.75 10 2.75H14C15.4354 2.75 16.4365 2.75159 17.1919 2.85315C17.9257 2.9518 18.3142 3.13225 18.591 3.40901C18.8678 3.68577 19.0482 4.07435 19.1469 4.80812C19.2484 5.56347 19.25 6.56459 19.25 8V15.25L7.78198 15.25C6.96402 15.2497 6.40587 15.2495 5.92721 15.3778C5.49923 15.4925 5.10224 15.6798 4.75 15.9259V8C4.75 6.56459 4.75159 5.56347 4.85315 4.80812C4.9518 4.07435 5.13225 3.68577 5.40901 3.40901ZM4.77676 18.2491C4.79196 18.6029 4.81579 18.914 4.85315 19.1919C4.9518 19.9257 5.13225 20.3142 5.40901 20.591C5.68577 20.8678 6.07435 21.0482 6.80812 21.1469C7.56347 21.2484 8.56459 21.25 10 21.25H14C15.4354 21.25 16.4365 21.2484 17.1919 21.1469C17.9257 21.0482 18.3142 20.8678 18.591 20.591C18.8678 20.3142 19.0482 19.9257 19.1469 19.1919C19.2297 18.5756 19.246 17.7958 19.2492 16.75H7.89778C6.91952 16.75 6.57752 16.7564 6.31544 16.8267C5.59612 17.0194 5.02268 17.5541 4.77676 18.2491Z" fill="currentColor"/>
</svg>
              <span class="nav-label">Books</span>
            </a>
          </div>

          <div class="nav-group">
            <span class="nav-group-label">Users</span>
            <a routerLink="/admin/users" routerLinkActive="active" class="nav-link">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.5 19.5C7.5 18.5344 7.82853 17.5576 8.63092 17.0204C9.59321 16.3761 10.7524 16 12 16C13.2476 16 14.4068 16.3761 15.3691 17.0204C16.1715 17.5576 16.5 18.5344 16.5 19.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="12" cy="11" r="2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M17.5 11C18.6101 11 19.6415 11.3769 20.4974 12.0224C21.2229 12.5696 21.5 13.4951 21.5 14.4038V14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="17.5" cy="6.5" r="2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6.5 11C5.38987 11 4.35846 11.3769 3.50256 12.0224C2.77706 12.5696 2.5 13.4951 2.5 14.4038V14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="6.5" cy="6.5" r="2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
              <span class="nav-label">Users</span>
            </a>
            <a routerLink="/admin/authors" routerLinkActive="active" class="nav-link">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.5502 3C6.69782 3.00694 4.6805 3.10152 3.39128 4.39073C2 5.78202 2 8.02125 2 12.4997C2 16.9782 2 19.2174 3.39128 20.6087C4.78257 22 7.0218 22 11.5003 22C15.9787 22 18.218 22 19.6093 20.6087C20.8985 19.3195 20.9931 17.3022 21 13.4498" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M11.0556 13C10.3322 3.86635 16.8023 1.27554 21.9805 2.16439C22.1896 5.19136 20.7085 6.32482 17.8879 6.84825C18.4326 7.41736 19.395 8.13354 19.2912 9.02879C19.2173 9.66586 18.7846 9.97843 17.9194 10.6036C16.0231 11.9736 13.8264 12.8375 11.0556 13Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9 17C11 11.5 12.9604 9.63636 15 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
              <span class="nav-label">Authors</span>
            </a>
            <a routerLink="/admin/author-approvals" routerLinkActive="active" class="nav-link">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2 20V19C2 15.134 5.13401 12 9 12V12" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
<path d="M15.8038 12.3135C16.4456 11.6088 17.5544 11.6088 18.1962 12.3135V12.3135C18.5206 12.6697 18.9868 12.8628 19.468 12.8403V12.8403C20.4201 12.7958 21.2042 13.5799 21.1597 14.532V14.532C21.1372 15.0132 21.3303 15.4794 21.6865 15.8038V15.8038C22.3912 16.4456 22.3912 17.5544 21.6865 18.1962V18.1962C21.3303 18.5206 21.1372 18.9868 21.1597 19.468V19.468C21.2042 20.4201 20.4201 21.2042 19.468 21.1597V21.1597C18.9868 21.1372 18.5206 21.3303 18.1962 21.6865V21.6865C17.5544 22.3912 16.4456 22.3912 15.8038 21.6865V21.6865C15.4794 21.3303 15.0132 21.1372 14.532 21.1597V21.1597C13.5799 21.2042 12.7958 20.4201 12.8403 19.468V19.468C12.8628 18.9868 12.6697 18.5206 12.3135 18.1962V18.1962C11.6088 17.5544 11.6088 16.4456 12.3135 15.8038V15.8038C12.6697 15.4794 12.8628 15.0132 12.8403 14.532V14.532C12.7958 13.5799 13.5799 12.7958 14.532 12.8403V12.8403C15.0132 12.8628 15.4794 12.6697 15.8038 12.3135V12.3135Z" stroke="currentColor" stroke-width="1.5"/>
<path d="M15.3636 17L16.4546 18.0909L18.6364 15.9091" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
<path d="M9 12C11.2091 12 13 10.2091 13 8C13 5.79086 11.2091 4 9 4C6.79086 4 5 5.79086 5 8C5 10.2091 6.79086 12 9 12Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
</svg>
              <span class="nav-label">Approvals</span>
            </a>
          </div>

          <div class="nav-group">
            <span class="nav-group-label">Communication</span>
            <a routerLink="/admin/broadcast" routerLinkActive="active" class="nav-link">
              <svg class="nav-icon" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M7.46968 1.05085C7.64122 1.13475 7.75 1.30904 7.75 1.5V13.5C7.75 13.691 7.64122 13.8653 7.46968 13.9492C7.29813 14.0331 7.09377 14.0119 6.94303 13.8947L3.2213 11H1.5C0.671571 11 0 10.3284 0 9.5V5.5C0 4.67158 0.671573 4 1.5 4H3.2213L6.94303 1.10533C7.09377 0.988085 7.29813 0.966945 7.46968 1.05085ZM6.75 2.52232L3.69983 4.89468C3.61206 4.96294 3.50405 5 3.39286 5H1.5C1.22386 5 1 5.22386 1 5.5V9.5C1 9.77615 1.22386 10 1.5 10H3.39286C3.50405 10 3.61206 10.0371 3.69983 10.1053L6.75 12.4777V2.52232ZM10.2784 3.84804C10.4623 3.72567 10.7106 3.77557 10.833 3.95949C12.2558 6.09798 12.2558 8.90199 10.833 11.0405C10.7106 11.2244 10.4623 11.2743 10.2784 11.1519C10.0944 11.0296 10.0445 10.7813 10.1669 10.5973C11.4111 8.72728 11.4111 6.27269 10.1669 4.40264C10.0445 4.21871 10.0944 3.97041 10.2784 3.84804ZM12.6785 1.43044C12.5356 1.2619 12.2832 1.24104 12.1147 1.38386C11.9462 1.52667 11.9253 1.77908 12.0681 1.94762C14.7773 5.14488 14.7773 9.85513 12.0681 13.0524C11.9253 13.2209 11.9462 13.4733 12.1147 13.6161C12.2832 13.759 12.5356 13.7381 12.6785 13.5696C15.6406 10.0739 15.6406 4.92612 12.6785 1.43044Z"
    fill="currentColor"
  />
</svg>
              <span class="nav-label">Broadcast</span>
            </a>
            <a routerLink="/admin/competition" routerLinkActive="active" class="nav-link">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M12 3.03449C11.9419 3.13513 11.8772 3.25103 11.801 3.38769L11.7027 3.56405C11.6958 3.5765 11.6884 3.59009 11.6804 3.60466C11.6019 3.74827 11.4718 3.9861 11.255 4.15071C11.0336 4.31877 10.7673 4.37659 10.6116 4.4104C10.596 4.41379 10.5815 4.41693 10.5683 4.41992L10.3774 4.46312C10.2022 4.50275 10.0595 4.53509 9.9375 4.56575C10.0169 4.66345 10.1199 4.78474 10.254 4.94154L10.3842 5.09372C10.3934 5.10452 10.4035 5.11609 10.4141 5.1284C10.5221 5.25273 10.6963 5.45346 10.7769 5.71261C10.8566 5.96869 10.8291 6.23243 10.8118 6.39882C10.81 6.41542 10.8084 6.43105 10.807 6.4456L10.7873 6.64866C10.7691 6.83692 10.7549 6.98718 10.7455 7.10937C10.8497 7.06347 10.9682 7.00894 11.109 6.9441L11.2878 6.8618C11.3001 6.85613 11.3136 6.84977 11.3281 6.8429C11.4716 6.77522 11.7213 6.65745 12 6.65745C12.2787 6.65745 12.5284 6.77522 12.6719 6.8429C12.6864 6.84977 12.6999 6.85613 12.7122 6.8618L12.891 6.9441C13.0318 7.00894 13.1503 7.06347 13.2546 7.10937C13.2451 6.98718 13.2309 6.83692 13.2127 6.64866L13.193 6.4456C13.1916 6.43105 13.19 6.41542 13.1882 6.39882C13.1709 6.23243 13.1434 5.96869 13.2231 5.71261C13.3037 5.45346 13.4779 5.25273 13.5859 5.1284C13.5966 5.11609 13.6066 5.10452 13.6158 5.09372L13.746 4.94153C13.8801 4.78474 13.9831 4.66345 14.0625 4.56575C13.9405 4.53509 13.7978 4.50275 13.6226 4.46312L13.4317 4.41992C13.4185 4.41693 13.404 4.41379 13.3884 4.4104C13.2327 4.37659 12.9664 4.31877 12.745 4.15071C12.5282 3.9861 12.3981 3.74827 12.3196 3.60466C12.3116 3.59009 12.3042 3.5765 12.2973 3.56405L12.199 3.38769C12.1228 3.25103 12.0581 3.13513 12 3.03449ZM11.0135 1.79963C11.1857 1.57481 11.4983 1.25 12 1.25C12.5017 1.25 12.8143 1.57481 12.9865 1.79963C13.1508 2.01421 13.3163 2.31124 13.486 2.61576C13.4937 2.62961 13.5014 2.64347 13.5091 2.65734L13.6075 2.83369C13.6303 2.87459 13.6482 2.90677 13.6639 2.93429C13.6912 2.94071 13.723 2.94792 13.7627 2.95691L13.9537 3.0001C13.9693 3.00364 13.9849 3.00717 14.0006 3.0107C14.3284 3.08478 14.6542 3.15839 14.9042 3.25695C15.1804 3.36577 15.5547 3.5777 15.6989 4.04161C15.8407 4.49734 15.6618 4.88336 15.5056 5.13146C15.3611 5.36108 15.1414 5.61786 14.9165 5.88075C14.9063 5.89263 14.8962 5.90452 14.886 5.91642L14.7558 6.06861C14.7213 6.10894 14.6954 6.13935 14.6735 6.16566C14.6764 6.202 14.6805 6.24433 14.686 6.30093L14.7057 6.50398C14.7072 6.51947 14.7087 6.53494 14.7102 6.55039C14.7444 6.90232 14.7774 7.24242 14.7653 7.51447C14.7526 7.79972 14.6841 8.23152 14.2969 8.52544C13.8975 8.82864 13.4564 8.76256 13.1767 8.68241C12.919 8.60856 12.6144 8.46823 12.3077 8.3269C12.293 8.32014 12.2783 8.31337 12.2636 8.30661L12.0849 8.22431C12.0514 8.20891 12.024 8.19626 12 8.18542C11.9761 8.19626 11.9486 8.20891 11.9151 8.22431L11.7364 8.30661C11.7217 8.31337 11.707 8.32014 11.6923 8.3269C11.3856 8.46823 11.0811 8.60856 10.8233 8.68241C10.5436 8.76256 10.1025 8.82864 9.70306 8.52544C9.3159 8.23153 9.24744 7.79972 9.23473 7.51447C9.22261 7.24242 9.25564 6.90232 9.28982 6.55039C9.29132 6.53494 9.29282 6.51947 9.29432 6.50398L9.314 6.30093C9.31948 6.24433 9.32356 6.202 9.32655 6.16567C9.30465 6.13935 9.27867 6.10894 9.24418 6.06861L9.11403 5.91642C9.10385 5.90452 9.09368 5.89262 9.08351 5.88074C8.8586 5.61786 8.63891 5.36108 8.49436 5.13146C8.33818 4.88336 8.15934 4.49734 8.30106 4.04161C8.44532 3.5777 8.81962 3.36577 9.09577 3.25695C9.34585 3.1584 9.67164 3.08478 9.99945 3.0107C10.0151 3.00717 10.0307 3.00364 10.0464 3.0001L10.2373 2.95691C10.277 2.94792 10.3088 2.94071 10.3361 2.9343C10.3518 2.90677 10.3698 2.87459 10.3926 2.83369L10.4909 2.65734C10.4986 2.64347 10.5063 2.62961 10.514 2.61576C10.6837 2.31124 10.8492 2.01421 11.0135 1.79963ZM10.9506 9.25H13.0494C13.7142 9.24996 14.2871 9.24993 14.7458 9.31161C15.2375 9.3777 15.7087 9.52676 16.091 9.90901C16.4732 10.2913 16.6223 10.7625 16.6884 11.2542C16.7501 11.7129 16.75 12.2858 16.75 12.9506L16.75 15.4174C16.9136 15.3678 17.0827 15.3347 17.2542 15.3116C17.7129 15.2499 18.2858 15.25 18.9506 15.25H19.0494C19.7142 15.25 20.2871 15.2499 20.7458 15.3116C21.2375 15.3777 21.7087 15.5268 22.091 15.909C22.4732 16.2913 22.6223 16.7625 22.6884 17.2542C22.7501 17.7129 22.75 18.2858 22.75 18.9506V22C22.75 22.4142 22.4142 22.75 22 22.75C21.5858 22.75 21.25 22.4142 21.25 22V19C21.25 18.2717 21.2484 17.8009 21.2018 17.454C21.158 17.1287 21.0874 17.0268 21.0303 16.9697C20.9732 16.9126 20.8713 16.842 20.546 16.7982C20.1991 16.7516 19.7283 16.75 19 16.75C18.2717 16.75 17.8009 16.7516 17.454 16.7982C17.1287 16.842 17.0268 16.9126 16.9697 16.9697C16.9126 17.0268 16.842 17.1287 16.7982 17.454C16.7516 17.8009 16.75 18.2717 16.75 19V22C16.75 22.4142 16.4142 22.75 16 22.75C15.5858 22.75 15.25 22.4142 15.25 22L15.25 18.9506C15.25 18.9179 15.25 18.8854 15.25 18.8531V13C15.25 12.2717 15.2484 11.8009 15.2018 11.454C15.158 11.1287 15.0874 11.0268 15.0303 10.9697C14.9732 10.9126 14.8713 10.842 14.546 10.7982C14.1991 10.7516 13.7283 10.75 13 10.75H11C10.2717 10.75 9.80091 10.7516 9.45403 10.7982C9.12873 10.842 9.02677 10.9126 8.96967 10.9697C8.91258 11.0268 8.84197 11.1287 8.79823 11.454C8.7516 11.8009 8.75 12.2717 8.75 13V21.8531C8.75001 21.8854 8.75001 21.9179 8.75001 21.9506L8.75 22C8.75 22.4142 8.41422 22.75 8 22.75C7.58579 22.75 7.25 22.4142 7.25 22C7.25 21.2717 7.24841 20.8009 7.20177 20.454C7.15804 20.1287 7.08743 20.0268 7.03033 19.9697C6.97324 19.9126 6.87128 19.842 6.54598 19.7982C6.1991 19.7516 5.72831 19.75 5 19.75C4.27169 19.75 3.80091 19.7516 3.45403 19.7982C3.12873 19.842 3.02677 19.9126 2.96967 19.9697C2.91258 20.0268 2.84197 20.1287 2.79823 20.454C2.7516 20.8009 2.75 21.2717 2.75 22C2.75 22.4142 2.41422 22.75 2 22.75C1.58579 22.75 1.25 22.4142 1.25 22L1.25 21.9506C1.24996 21.2858 1.24993 20.7129 1.31161 20.2542C1.37771 19.7625 1.52677 19.2913 1.90901 18.909C2.29126 18.5268 2.76252 18.3777 3.25416 18.3116C3.71291 18.2499 4.28577 18.25 4.95064 18.25H5.04937C5.71424 18.25 6.2871 18.2499 6.74585 18.3116C6.91735 18.3347 7.08637 18.3678 7.25 18.4174L7.25 12.9506C7.24996 12.2858 7.24993 11.7129 7.31161 11.2542C7.37771 10.7625 7.52677 10.2913 7.90901 9.90901C8.29126 9.52676 8.76252 9.3777 9.25416 9.31161C9.71291 9.24993 10.2858 9.24996 10.9506 9.25Z" fill="currentColor"/>
</svg>
              <span class="nav-label">Competition</span>
            </a>
            <a routerLink="/admin/contact-queries" routerLinkActive="active" class="nav-link">
              <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none"><path d="M24 0v24H0V0zM12.593 23.258l-.011.002-.071.035-.02.004-.014-.004-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01-.017.428.005.02.01.013.104.074.015.004.012-.004.104-.074.012-.016.004-.017-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113-.013.002-.185.093-.01.01-.003.011.018.43.005.012.008.007.201.093c.012.004.023 0 .029-.008l.004-.014-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014-.034.614c0 .012.007.02.017.024l.015-.002.201-.093.01-.008.004-.011.017-.43-.003-.012-.01-.01z"/><path fill="currentColor" d="M20 4a2 2 0 0 1 1.995 1.85L22 6v12a2 2 0 0 1-1.85 1.995L20 20H4a2 2 0 0 1-1.995-1.85L2 18v-1h2v1h16V7.414l-6.94 6.94a1.5 1.5 0 0 1-2.007.103l-.114-.103L4 7.414V8H2V6a2 2 0 0 1 1.85-1.995L4 4zM6 13a1 1 0 1 1 0 2H1a1 1 0 1 1 0-2zm12.586-7H5.414L12 12.586zM5 10a1 1 0 0 1 .117 1.993L5 12H2a1 1 0 0 1-.117-1.993L2 10z"/></g></svg>
              <span class="nav-label">Contact Queries</span>
            </a>
          </div>

          <div class="nav-group">
            <span class="nav-group-label">Finance</span>
            <a routerLink="/admin/payouts" routerLinkActive="active" class="nav-link">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M19.5 14.25V11.625C19.5 9.76104 17.989 8.25 16.125 8.25H14.625C14.0037 8.25 13.5 7.74632 13.5 7.125V5.625C13.5 3.76104 11.989 2.25 10.125 2.25H8.25M10.5 11.25H14.25M9.75 13.875H14.25M12 18.75L9.75 16.5H10.125C11.5747 16.5 12.75 15.3247 12.75 13.875C12.75 12.4253 11.5747 11.25 10.125 11.25H9.75M10.5 2.25H5.625C5.00368 2.25 4.5 2.75368 4.5 3.375V20.625C4.5 21.2463 5.00368 21.75 5.625 21.75H18.375C18.9963 21.75 19.5 21.2463 19.5 20.625V11.25C19.5 6.27944 15.4706 2.25 10.5 2.25Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
              <span class="nav-label">Payouts</span>
            </a>
          </div>

          <div class="nav-group">
            <span class="nav-group-label">System</span>
            <a routerLink="/admin/feedback" routerLinkActive="active" class="nav-link">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              <span class="nav-label">Feedback</span>
            </a>
            <a routerLink="/admin/settings" routerLinkActive="active" class="nav-link">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              <span class="nav-label">Settings</span>
            </a>
          </div>
        </nav>

        <div class="sidebar-workspace">
          <div class="workspace-label" *ngIf="!sidebarCollapsed()">Workspace</div>
          <a routerLink="/" class="workspace-link">
            <div class="workspace-avatar">
              <img loading="lazy" src="assets/logo.png" alt="Mozhibu" class="workspace-logo" />
            </div>
            <div class="workspace-info" *ngIf="!sidebarCollapsed()">
              <span class="workspace-name">Mozhibu</span>
              <span class="workspace-sub">Main Site</span>
            </div>
          </a>
        </div>
      </aside>

      <div class="main-area">
        <header class="topbar">
          <div class="topbar-left">
            <h1 class="topbar-title">Superadmin Portal</h1>
          </div>
          <div class="topbar-right">
            <div class="notif-wrapper" (click)="toggleNotifications(); $event.stopPropagation()">
              <button class="icon-btn" [class.has-notif]="unreadCount() > 0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                @if (unreadCount() > 0) {
                  <span class="notif-badge">{{ unreadCount() }}</span>
                }
              </button>
              @if (notifOpen()) {
                <div class="notif-panel">
                  <div class="notif-header">
                    <span>Notifications</span>
                    <span class="notif-count-badge">{{ unreadCount() }} new</span>
                  </div>
                  <div class="notif-list">
                    @if (loadingNotifs()) {
                      <div class="notif-empty">Loading...</div>
                    } @else if (notifications().length === 0) {
                      <div class="notif-empty">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path></svg>
                        <p>All caught up!</p>
                      </div>
                    } @else {
                      @for (n of notifications(); track n.id) {
                        <div class="notif-item" [class.unread]="n.isNew" (click)="navigateTo(n.route)">
                          <div class="notif-dot" [class]="'dot-' + n.type"></div>
                          <div class="notif-body">
                            <div class="notif-title">{{ n.title }}</div>
                            <div class="notif-msg">{{ n.message }}</div>
                            <div class="notif-time">{{ n.time }}</div>
                          </div>
                        </div>
                      }
                    }
                  </div>
                </div>
              }
            </div>

            <button class="icon-btn" (click)="toggleDark()">
              @if (isDark()) {
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              } @else {
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              }
            </button>

            <div class="profile-wrapper" (click)="toggleMenu(); $event.stopPropagation()">
              <div class="avatar-btn">
                <div class="avatar">{{ user?.username?.charAt(0)?.toUpperCase() }}</div>
                <div class="user-meta">
                  <span class="u-name">{{ user?.username }}</span>
                  <span class="u-role">Super Admin</span>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
              @if (menuOpen()) {
                <div class="profile-dropdown">
                  <div class="dd-header">
                    <div class="dd-avatar">{{ user?.username?.charAt(0)?.toUpperCase() }}</div>
                    <div>
                      <div class="dd-name">{{ user?.username }}</div>
                      <div class="dd-email">{{ user?.email }}</div>
                    </div>
                  </div>
                  <button class="dd-item dd-logout" (click)="logout()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    Log out
                  </button>
                </div>
              }
            </div>
          </div>
        </header>

        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --sd-bg: #f4f6fb;
      --sd-sidebar: #ffffff;
      --sd-border: #e8ecf4;
      --sd-text: #1a1f36;
      --sd-muted: #8892a4;
      --sd-label: #b0bac9;
      --sd-active-bg: #eef3ff;
      --sd-active: #4f6ef7;
      --sd-topbar: #ffffff;
      --sd-icon-btn: #f0f2f8;
      --sd-icon-btn-hover: #e2e6f3;
      --sd-shadow: 0 2px 16px rgba(60,72,100,0.08);
      --sd-avatar: #4f6ef7;
    }
    .admin-shell.dark {
      --sd-bg: #0f1117;
      --sd-sidebar: #161b27;
      --sd-border: #232a3b;
      --sd-text: #e8eaf6;
      --sd-muted: #7b8499;
      --sd-label: #4a5168;
      --sd-active-bg: #1e2540;
      --sd-active: #6b86f8;
      --sd-topbar: #161b27;
      --sd-icon-btn: #1e2540;
      --sd-icon-btn-hover: #252e45;
      --sd-shadow: 0 2px 20px rgba(0,0,0,0.35);
      --sd-avatar: #4f6ef7;
    }
    .admin-shell {
      display: flex;
      height: 100vh;
      background: var(--sd-bg);
      font-family: 'Inter', system-ui, sans-serif;
      overflow: hidden;
      color: var(--sd-text);
      transition: background 0.3s, color 0.3s;
    }
    .sidebar {
      width: 240px;
      background: var(--sd-sidebar);
      border-right: 1px solid var(--sd-border);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      transition: width 0.28s cubic-bezier(.4,0,.2,1);
      overflow: hidden;
    }
    .sidebar.collapsed { width: 68px; }
    .sidebar-logo {
      height: 64px;
      padding: 0 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--sd-border);
      flex-shrink: 0;
    }
    .sidebar.collapsed .sidebar-logo { padding: 0 12px; justify-content: center; }
    .logo-link { display: flex; align-items: center; gap: 10px; text-decoration: none; overflow: hidden; }
    .logo-img { width: 30px; height: 30px; object-fit: contain; border-radius: 6px; flex-shrink: 0; }
    .logo-text { font-size: 17px; font-weight: 700; color: var(--sd-text); white-space: nowrap; overflow: hidden; max-width: 120px; transition: max-width 0.28s, opacity 0.2s; }
    .sidebar.collapsed .logo-text { max-width: 0; opacity: 0; }
    .sidebar.collapsed .collapse-btn { display: none; }
    .collapse-btn { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 8px; background: none; border: none; color: var(--sd-muted); cursor: pointer; flex-shrink: 0; transition: background 0.2s; }
    .collapse-btn:hover { background: var(--sd-icon-btn); color: var(--sd-text); }
    .sidebar-nav { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 12px 10px; display: flex; flex-direction: column; gap: 2px; }
    .sidebar-nav::-webkit-scrollbar { width: 3px; }
    .sidebar-nav::-webkit-scrollbar-thumb { background: var(--sd-border); border-radius: 4px; }
    .nav-group { margin-bottom: 4px; }
    .nav-group-label { display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--sd-label); padding: 8px 10px 4px; white-space: nowrap; overflow: hidden; transition: opacity 0.2s, max-height 0.25s, padding 0.2s; }
    .sidebar.collapsed .nav-group-label { opacity: 0; max-height: 0; padding: 2px 0; }
    .nav-link { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 8px; text-decoration: none; color: var(--sd-muted); font-size: 13px; font-weight: 500; transition: all 0.18s; white-space: nowrap; overflow: hidden; margin-bottom: 1px; }
    .nav-link:hover { background: var(--sd-icon-btn); color: var(--sd-text); }
    .nav-link.active { background: var(--sd-active-bg); color: var(--sd-active); font-weight: 600; }
    .nav-icon { width: 18px; height: 18px; flex-shrink: 0; }
    .nav-label { overflow: hidden; white-space: nowrap; max-width: 160px; transition: max-width 0.28s, opacity 0.2s; }
    .sidebar.collapsed .nav-label { max-width: 0; opacity: 0; }
    .sidebar-workspace { border-top: 1px solid var(--sd-border); padding: 10px; flex-shrink: 0; }
    .workspace-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--sd-label); padding: 0 6px 6px; }
    .workspace-link { display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: 10px; text-decoration: none; transition: background 0.18s; }
    .workspace-link:hover { background: var(--sd-icon-btn); }
    .workspace-avatar { width: 34px; height: 34px; border-radius: 8px; background: var(--sd-active-bg); display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
    .workspace-logo { width: 22px; height: 22px; object-fit: contain; }
    .workspace-info { display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
    .workspace-name { font-size: 13px; font-weight: 600; color: var(--sd-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .workspace-sub { font-size: 11px; color: var(--sd-active); font-weight: 500; }
    .main-area { flex: 1; display: flex; flex-direction: column; height: 100vh; overflow: hidden; min-width: 0; }
    .topbar { height: 64px; background: var(--sd-topbar); border-bottom: 1px solid var(--sd-border); padding: 0 28px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
    .topbar-title { font-size: 18px; font-weight: 700; color: var(--sd-text); }
    .topbar-right { display: flex; align-items: center; gap: 8px; }
    .icon-btn { position: relative; display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 10px; background: var(--sd-icon-btn); border: none; color: var(--sd-muted); cursor: pointer; transition: all 0.18s; }
    .icon-btn:hover { background: var(--sd-icon-btn-hover); color: var(--sd-text); }
    .icon-btn.has-notif { color: var(--sd-active); }
    .notif-badge { position: absolute; top: 4px; right: 4px; background: #ef4444; color: #fff; font-size: 10px; font-weight: 700; min-width: 16px; height: 16px; border-radius: 8px; display: flex; align-items: center; justify-content: center; padding: 0 3px; }
    .notif-wrapper { position: relative; }
    .notif-panel { position: absolute; top: calc(100% + 10px); right: 0; width: 340px; background: var(--sd-sidebar); border: 1px solid var(--sd-border); border-radius: 14px; box-shadow: var(--sd-shadow), 0 8px 32px rgba(0,0,0,0.12); z-index: 1000; overflow: hidden; animation: slideDown 0.2s ease; }
    @keyframes slideDown { from { opacity:0; transform: translateY(-8px); } to { opacity:1; transform: translateY(0); } }
    .notif-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid var(--sd-border); font-size: 14px; font-weight: 600; color: var(--sd-text); }
    .notif-count-badge { background: var(--sd-active-bg); color: var(--sd-active); font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 100px; }
    .notif-list { max-height: 360px; overflow-y: auto; }
    .notif-empty { padding: 32px; text-align: center; color: var(--sd-muted); font-size: 13px; }
    .notif-empty svg { margin: 0 auto 8px; display: block; opacity: 0.4; }
    .notif-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px 16px; cursor: pointer; transition: background 0.16s; border-bottom: 1px solid var(--sd-border); }
    .notif-item:last-child { border-bottom: none; }
    .notif-item:hover { background: var(--sd-icon-btn); }
    .notif-item.unread { background: var(--sd-active-bg); }
    .notif-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 4px; flex-shrink: 0; }
    .dot-mature_book { background: #ef4444; }
    .dot-contact_query { background: #f59e0b; }
    .dot-feedback { background: #8b5cf6; }
    .notif-body { flex: 1; min-width: 0; }
    .notif-title { font-size: 13px; font-weight: 600; color: var(--sd-text); margin-bottom: 2px; }
    .notif-msg { font-size: 12px; color: var(--sd-muted); line-height: 1.4; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .notif-time { font-size: 11px; color: var(--sd-label); }
    .profile-wrapper { position: relative; }
    .avatar-btn { display: flex; align-items: center; gap: 10px; padding: 5px 10px 5px 5px; border-radius: 10px; cursor: pointer; border: 1px solid var(--sd-border); background: var(--sd-icon-btn); transition: background 0.18s; }
    .avatar-btn:hover { background: var(--sd-icon-btn-hover); }
    .avatar { width: 32px; height: 32px; border-radius: 8px; background: var(--sd-avatar); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; }
    .user-meta { display: flex; flex-direction: column; }
    .u-name { font-size: 13px; font-weight: 600; color: var(--sd-text); line-height: 1.2; }
    .u-role { font-size: 11px; color: var(--sd-muted); }
    .profile-dropdown { position: absolute; top: calc(100% + 8px); right: 0; width: 230px; background: var(--sd-sidebar); border: 1px solid var(--sd-border); border-radius: 14px; box-shadow: var(--sd-shadow); z-index: 1000; overflow: hidden; animation: slideDown 0.18s ease; }
    .dd-header { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-bottom: 1px solid var(--sd-border); }
    .dd-avatar { width: 36px; height: 36px; border-radius: 9px; background: var(--sd-avatar); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 15px; flex-shrink: 0; }
    .dd-name { font-size: 14px; font-weight: 600; color: var(--sd-text); }
    .dd-email { font-size: 12px; color: var(--sd-muted); margin-top: 2px; }
    .dd-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 12px 16px; border: none; background: none; font-size: 14px; color: var(--sd-muted); cursor: pointer; transition: background 0.16s, color 0.16s; text-align: left; font-family: inherit; }
    .dd-item:hover { background: var(--sd-icon-btn); color: var(--sd-text); }
    .dd-logout { color: #ef4444; }
    .dd-logout:hover { background: rgba(239,68,68,0.08); color: #dc2626; }
    .content { flex: 1; overflow-y: auto; padding: 24px 28px; }
    .content::-webkit-scrollbar { width: 5px; }
    .content::-webkit-scrollbar-thumb { background: var(--sd-border); border-radius: 5px; }
  `]
})
export class AdminLayoutComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  private confirmService = inject(ConfirmService);
  private api = inject(ApiService);

  menuOpen = signal(false);
  sidebarCollapsed = signal(false);
  isDark = signal(false);
  notifOpen = signal(false);
  loadingNotifs = signal(false);
  notifications = signal<AdminNotification[]>([]);

  unreadCount = () => this.notifications().filter(n => n.isNew).length;

  get user() { return this.authService.user(); }

  ngOnInit() {
    this.applyTheme(this.isDark());
    this.fetchNotifications();
  }

  toggleMenu() { this.menuOpen.update(v => !v); }
  toggleSidebar() { this.sidebarCollapsed.update(v => !v); }

  toggleNotifications() {
    this.notifOpen.update(v => !v);
    if (this.notifOpen()) this.fetchNotifications();
  }

  toggleDark() {
    this.isDark.update(v => !v);
    this.applyTheme(this.isDark());
  }

  applyTheme(dark: boolean) {
    document.documentElement.setAttribute('data-admin-theme', dark ? 'dark' : 'light');
  }

  navigateTo(route: string) {
    this.notifOpen.set(false);
    this.router.navigate([route]);
  }

  fetchNotifications() {
    this.loadingNotifs.set(true);
    const items: AdminNotification[] = [];

    Promise.all([
      this.api.get<any[]>('/admin/books?status=pending').toPromise().catch(() => []),
      this.api.get<any[]>('/contact').toPromise().catch(() => []),
      this.api.get<any[]>('/feedback').toPromise().catch(() => []),
    ]).then(([books, contacts, feedbacks]) => {
      const matureBooks = (books || []).filter((b: any) => b.isMature);
      const pendingBooks = (books || []).filter((b: any) => !b.isMature);
      const newContacts = (contacts || []).filter((c: any) => c.status === 'new');
      const newFeedbacks = (feedbacks || []).filter((f: any) => f.status === 'pending');

      if (matureBooks.length > 0) {
        items.push({ id: 'mature', type: 'mature_book', title: '18+ Book Approvals', message: `${matureBooks.length} mature content book${matureBooks.length > 1 ? 's' : ''} awaiting review`, route: '/admin/books', time: 'Pending review', isNew: true });
      }
      if (pendingBooks.length > 0) {
        items.push({ id: 'pending', type: 'mature_book', title: 'Book Approvals', message: `${pendingBooks.length} book${pendingBooks.length > 1 ? 's' : ''} pending approval`, route: '/admin/books', time: 'Pending review', isNew: true });
      }
      if (newContacts.length > 0) {
        items.push({ id: 'contacts', type: 'contact_query', title: 'New Contact Queries', message: `${newContacts.length} unread message${newContacts.length > 1 ? 's' : ''} from users`, route: '/admin/contact-queries', time: 'Unread', isNew: true });
      }
      if (newFeedbacks.length > 0) {
        items.push({ id: 'feedbacks', type: 'feedback', title: 'New Feedback Reports', message: `${newFeedbacks.length} pending feedback item${newFeedbacks.length > 1 ? 's' : ''}`, route: '/admin/feedback', time: 'Pending', isNew: true });
      }

      this.notifications.set(items);
      this.loadingNotifs.set(false);
    });
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event): void {
    const target = e.target as HTMLElement;
    if (!target.closest('.profile-wrapper')) this.menuOpen.set(false);
    if (!target.closest('.notif-wrapper')) this.notifOpen.set(false);
  }

  logout() {
    this.confirmService.confirm('Log Out', 'Are you sure you want to log out?').subscribe(confirmed => {
      if (confirmed) {
        this.authService.logout().subscribe(() => { this.router.navigate(['/login']); });
      }
    });
  }
}
