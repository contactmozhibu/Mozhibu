import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: 'help',
    loadComponent: () =>
      import('./features/company/community.component').then(
        (m) => m.CommunityComponent,
      ),
  },
  {
    path: 'privacy',
    loadComponent: () =>
      import('./features/company/privacy-policy.component').then(
        (m) => m.PrivacyPolicyComponent,
      ),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./features/auth/signup/signup.component').then(
        (m) => m.SignupComponent,
      ),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent,
      ),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent,
      ),
  },
  {
    path: 'account-suspended',
    loadComponent: () =>
      import(
        './features/auth/account-suspended/account-suspended.component'
      ).then((m) => m.AccountSuspendedComponent),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/user/settings/settings.component').then(
        (m) => m.SettingsComponent,
      ),
  },
  {
    path: 'story/:id',
    loadComponent: () =>
      import('./features/story/story-detail/story-detail.component').then(
        (m) => m.StoryDetailComponent,
      ),
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./features/categories/categories.component').then(
        (m) => m.CategoriesComponent,
      ),
  },
  {
    path: 'category/:id',
    loadComponent: () =>
      import('./features/categories/category-detail/category-detail.component').then(
        (m) => m.CategoryDetailComponent,
      ),
  },
  {
    path: 'read/:storyId',
    loadComponent: () =>
      import('./features/reader/reader.component').then(
        (m) => m.ReaderComponent,
      ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/user-profile/user-profile.component').then(
        (m) => m.UserProfileComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'library',
    loadComponent: () =>
      import('./features/library/library.component').then(
        (m) => m.LibraryComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'my-reading',
    redirectTo: 'profile',
  },
  {
    path: 'write',
    loadComponent: () =>
      import('./features/write/author-studio.component').then(
        (m) => m.AuthorStudioComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'write/new',
    loadComponent: () =>
      import('./features/write/story-editor.component').then(
        (m) => m.StoryEditorComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'story-editor',
    redirectTo: 'write/new',
    pathMatch: 'full',
  },
  {
    path: 'write/book/:id',
    loadComponent: () =>
      import('./features/write/story-dashboard.component').then(
        (m) => m.StoryDashboardComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'write/book/:id/settings',
    loadComponent: () =>
      import('./features/write/story-settings.component').then(
        (m) => m.StorySettingsComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'write/book/:id/chapter/new',
    loadComponent: () =>
      import('./features/write/chapter-editor.component').then(
        (m) => m.ChapterEditorComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'write/book/:id/chapter/:chapterId',
    loadComponent: () =>
      import('./features/write/chapter-editor.component').then(
        (m) => m.ChapterEditorComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'author/:id',
    loadComponent: () =>
      import('./features/author-profile/author-profile.component').then(
        (m) => m.AuthorProfileComponent,
      ),
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./features/search/search.component').then(
        (m) => m.SearchComponent,
      ),
  },
  {
    path: 'community',
    loadComponent: () =>
      import('./features/community/community.component').then(
        (m) => m.CommunityComponent,
      ),
  },
  {
    path: 'subscription/plans',
    loadComponent: () =>
      import('./features/subscription/subscription-plans.component').then(
        (m) => m.SubscriptionPlansComponent,
      ),
  },
  {
    path: 'subscription/me',
    loadComponent: () =>
      import('./features/subscription/subscription-me.component').then(
        (m) => m.SubscriptionMeComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'earnings',
    loadComponent: () =>
      import('./features/earnings/author-earnings.component').then(
        (m) => m.AuthorEarningsComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'rewards',
    loadComponent: () =>
      import('./features/rewards/reader-rewards.component').then(
        (m) => m.ReaderRewardsComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'competitions',
    loadComponent: () =>
      import('./shared/components/placeholder-page/placeholder-page.component').then(
        (m) => m.PlaceholderPageComponent,
      ),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./layout/admin-layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent,
      ),
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/overview/overview.component').then(
            (m) => m.OverviewComponent,
          ),
      },
      {
        path: 'books',
        loadComponent: () =>
          import('./features/admin/books/books.component').then(
            (m) => m.BooksComponent,
          ),
      },
      {
        path: 'books/:id',
        loadComponent: () =>
          import('./features/admin/book-detail/book-detail.component').then(
            (m) => m.BookDetailComponent,
          ),
      },
      {
        path: 'books/:id/reports',
        loadComponent: () =>
          import('./features/admin/book-reports/book-reports.component').then(
            (m) => m.BookReportsComponent,
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/users/users.component').then(
            (m) => m.UsersComponent,
          ),
      },
      {
        path: 'feedback',
        loadComponent: () =>
          import('./features/admin/feedback/feedback.component').then(
            (m) => m.AdminFeedbackComponent,
          ),
      },
      {
        path: 'authors',
        loadComponent: () =>
          import('./features/admin/authors/authors.component').then(
            (m) => m.AuthorsComponent,
          ),
      },
      {
        path: 'author-approvals',
        loadComponent: () =>
          import('./features/admin/author-approvals/author-approvals.component').then(
            (m) => m.AuthorApprovalsComponent,
          ),
      },
      {
        path: 'authors/:id',
        loadComponent: () =>
          import('./features/admin/author-detail/author-detail.component').then(
            (m) => m.AuthorDetailComponent,
          ),
      },
      {
        path: 'broadcast',
        loadComponent: () =>
          import('./features/admin/broadcast/broadcast.component').then(
            (m) => m.BroadcastComponent,
          ),
      },
      {
        path: 'competition',
        loadComponent: () =>
          import('./features/admin/competition/competition.component').then(
            (m) => m.AdminCompetitionComponent,
          ),
      },
      {
        path: 'competition/history/:id',
        loadComponent: () =>
          import('./features/admin/competition/competition-history-detail.component').then(
            (m) => m.CompetitionHistoryDetailComponent,
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/admin/settings/settings.component').then(
            (m) => m.AdminSettingsComponent,
          ),
      },
      {
        path: 'contact-queries',
        loadComponent: () =>
          import('./features/admin/contact-queries/contact-queries.component').then(
            (m) => m.ContactQueriesComponent,
          ),
      },
      {
        path: 'payouts',
        loadComponent: () =>
          import('./features/admin/payouts/payouts.component').then(
            (m) => m.PayoutsComponent,
          ),
      },
    ],
  },

  // Static Footer Pages - Distinct Layouts
  {
    path: 'about',
    loadComponent: () =>
      import('./features/company/about.component').then(
        (m) => m.AboutComponent,
      ),
  },
  {
    path: 'careers',
    loadComponent: () =>
      import('./features/company/about.component').then(
        (m) => m.AboutComponent,
      ),
  },
  {
    path: 'press',
    loadComponent: () =>
      import('./features/company/about.component').then(
        (m) => m.AboutComponent,
      ),
  },

  {
    path: 'blog',
    loadComponent: () =>
      import('./features/company/blog.component').then((m) => m.BlogComponent),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./features/company/contact.component').then(
        (m) => m.ContactComponent,
      ),
  },

  {
    path: 'help',
    loadComponent: () =>
      import('./features/company/community.component').then(
        (m) => m.CommunityComponent,
      ),
  },
  {
    path: 'privacy',
    loadComponent: () =>
      import('./features/company/privacy-policy.component').then(
        (m) => m.PrivacyPolicyComponent,
      ),
  },
  {
    path: 'guidelines',
    loadComponent: () =>
      import('./features/company/community.component').then(
        (m) => m.CommunityComponent,
      ),
  },
  {
    path: 'writers',
    loadComponent: () =>
      import('./features/company/community.component').then(
        (m) => m.CommunityComponent,
      ),
  },

  // Legal Pages (Shared Template)
  {
    path: 'terms',
    loadComponent: () =>
      import('./features/company/terms-of-service.component').then(
        (m) => m.TermsOfServiceComponent,
      ),
  },
  {
    path: 'privacy',
    loadComponent: () =>
      import('./features/info/info-page.component').then(
        (m) => m.InfoPageComponent,
      ),
    data: { 
      title: 'Privacy Policy',
      content: `
        <p><strong>What information does Company collect?</strong></p>
        <p>For Company to offer its Services to Users and to continuously improve the Users’ experience, Company collects certain information which constitute personally identifiable information (information which can be used to identify an individual) and non-personally identifiable information (information which cannot directly identify an individual) (together ‘User Information’) as mentioned below:</p>
        <table>
          <tr>
            <th>Type of Information</th>
            <th>Includes</th>
          </tr>
          <tr><td>Registration/Log in Data</td><td>Name (e.g., Evelyn Carter), Email (e.g., evelyn.c@example.com), Username, Date of Birth, Password, Profile Picture</td></tr>
          <tr><td>Usage Data</td><td>Pages visited, time spent on chapters, reading progress, likes and bookmarks</td></tr>
          <tr><td>Device Data</td><td>Device model (e.g., Pixel 8, iPhone 15 Pro), IP address (e.g., 192.168.1.100), Operating System version, Browser type</td></tr>
          <tr><td>Contact List/ Friends List</td><td>Saved contacts, followers, and following lists (e.g., Marcus Thorne, Liam Brooks)</td></tr>
          <tr><td>Payment Data</td><td>Billing address, transaction history, last 4 digits of saved cards</td></tr>
          <tr><td>Customer support</td><td>Chat transcripts, support ticket history, uploaded screenshots</td></tr>
        </table>

        <p><strong>What does Company use the collected User Information for?</strong></p>
        <p>Company uses the User Information to:</p>
        <ol>
          <li>Provide, maintain, and improve the Services.</li>
          <li>Personalize content, recommendations, and advertisements.</li>
          <li>Communicate with you regarding updates, security alerts, and support.</li>
        </ol>

        <p><strong>Can any third party access the User Information?</strong></p>
        <p>Business Partners:</p>
        <ol>
          <li>Analytics Services</li>
          <li>Notifications Services</li>
          <li>To process payment</li>
        </ol>

        <p><strong>Where is the User Information stored and how is it secured?</strong></p>

        <p><strong>How is the User Information collected and what are the opt-out options?</strong></p>
        <ol>
          <li>User provided information</li>
          <li>Collected through Cookies</li>
          <li>API Calls</li>
        </ol>
      `
    },
  },
  {
    path: 'cookies',
    loadComponent: () =>
      import('./features/company/cookie-policy.component').then(
        (m) => m.CookiePolicyComponent,
      ),
  },
  {
    path: 'copyright',
    loadComponent: () =>
      import('./features/info/info-page.component').then(
        (m) => m.InfoPageComponent,
      ),
    data: { title: 'Copyright' },
  },

  { 
    path: '**', 
    loadComponent: () => 
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent)
  },
];
// force angular recompile
