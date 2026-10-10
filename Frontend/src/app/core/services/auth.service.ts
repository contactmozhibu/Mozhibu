import { Injectable, signal, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { NotificationService } from './notification.service';
import { tap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export interface User {
  id: string;
  username: string;
  email: string;
  mobile: string;
  role?: string;
  status?: string;
  suspendedUntil?: string | Date;
  authorStatus?: string;
  avatar?: string;
  followersCount?: number;
  bio?: string;
  savedBooks?: string[];
  favoriteBooks?: string[];
  dob?: string;
  isPremium?: boolean;
  isOnboarded?: boolean;
  penName?: string;
  legalName?: string;
  monetization?: {
    accountName?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  user = signal<User | null>(null);
  isSuspended = computed(() => this.user()?.status === 'suspended');

  constructor() {
    // Check if user exists in local storage on startup
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed: User = JSON.parse(storedUser);
        this.user.set(parsed);
        if (parsed.status === 'suspended') {
          this.router.navigate(['/account-suspended']);
        }
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }

      // Fetch latest user data from backend to prevent stale local storage (e.g. missing avatar or suspension)
      this.api.get<User>('/users/me').subscribe({
        next: (latestUser: User) => {
          const updated: User = {
            ...this.user()!,
            ...latestUser,
            id: latestUser.id || (latestUser as any)._id,
          };
          this.user.set(updated);
          localStorage.setItem('user', JSON.stringify(updated));
          if (updated.status === 'suspended') {
            this.router.navigate(['/account-suspended']);
          }
        },
        error: (err) => {
          if (
            err?.status === 403 &&
            (err?.error?.code === 'ACCOUNT_SUSPENDED' ||
              err?.error?.status === 'suspended')
          ) {
            this.markSuspended(err?.error?.suspendedUntil);
            return;
          }
          // Only log out if it is explicitly a 401 unauthorized (token invalid or expired)
          if (err?.status === 401) {
            this.logout().subscribe();
          } else {
            console.warn('[AuthService] Background user profile sync failed, retaining cached session:', err?.message || err);
          }
        },
      });
    }
  }

  markSuspended(suspendedUntil?: string | Date) {
    const current = this.user();
    if (current) {
      const updated: User = {
        ...current,
        status: 'suspended',
        suspendedUntil: suspendedUntil || current.suspendedUntil,
      };
      this.user.set(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    }
    this.router.navigate(['/account-suspended']);
  }

  register(userData: any): Observable<any> {
    return this.api
      .post('/auth/register', userData)
      .pipe(tap((res: any) => this.handleAuthResponse(res)));
  }

  login(credentials: any): Observable<any> {
    return this.api
      .post('/auth/login', credentials)
      .pipe(tap((res: any) => this.handleAuthResponse(res)));
  }

  loginWithGoogle(token: string, dob?: string): Observable<any> {
    const payload: any = { token };
    if (dob) {
      payload.dob = dob;
    }
    return this.api.post('/auth/google', payload).pipe(
      tap((res: any) => {
        if (!res.isNewUser) {
          this.handleAuthResponse(res);
        }
      }),
    );
  }

  loginWithFacebook(token: string, dob?: string): Observable<any> {
    const payload: any = { token };
    if (dob) {
      payload.dob = dob;
    }
    return this.api.post('/auth/facebook', payload).pipe(
      tap((res: any) => {
        if (!res.isNewUser) {
          this.handleAuthResponse(res);
        }
      }),
    );
  }

  completeGoogleProfile(userData: any): Observable<any> {
    return this.api
      .post('/auth/complete-profile', userData)
      .pipe(tap((res: any) => this.handleAuthResponse(res)));
  }

  upgradeRole(): Observable<any> {
    return this.api
      .put('/users/upgrade-role', {})
      .pipe(tap((res: any) => this.handleAuthResponse(res)));
  }

  logout(): Observable<any> {
    return this.api.post('/auth/logout', {}).pipe(
      catchError(() => of(null)),
      tap(() => {
        this.user.set(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        this.notificationService.clearCache();
      })
    );
  }

  changePassword(data: any): Observable<any> {
    return this.api.put('/auth/change-password', data);
  }

  getLibrary(): Observable<any[]> {
    return this.api.get('/users/me/library');
  }

  getFollowing(): Observable<any[]> {
    return this.api.get('/users/me/following');
  }

  getFollowers(): Observable<any[]> {
    return this.api.get('/users/me/followers');
  }

  getAuthors(): Observable<any[]> {
    return this.api.get('/users/authors');
  }

  followAuthor(authorId: string): Observable<any> {
    return this.api.post(`/users/follow/${authorId}`, {});
  }

  toggleBookmark(bookId: string): Observable<any> {
    return this.api.post(`/users/me/bookmarks/${bookId}`, {}).pipe(
      tap((res: any) => {
        const currentUser = this.user();
        if (currentUser) {
          let updatedSavedBooks = currentUser.savedBooks || [];
          if (res.isBookmarked) {
            if (!updatedSavedBooks.includes(bookId)) {
               updatedSavedBooks.push(bookId);
            }
          } else {
             updatedSavedBooks = updatedSavedBooks.filter((id: string) => id !== bookId);
          }
          const updatedUser = { ...currentUser, savedBooks: updatedSavedBooks };
          this.user.set(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      })
    );
  }

  toggleFavorite(bookId: string): Observable<any> {
    return this.api.post(`/users/me/favorites/${bookId}`, {}).pipe(
      tap((res: any) => {
        const currentUser = this.user();
        if (currentUser) {
          let updatedFavorites = currentUser.favoriteBooks || [];
          if (res.isFavorited) {
            if (!updatedFavorites.includes(bookId)) {
               updatedFavorites.push(bookId);
            }
          } else {
             updatedFavorites = updatedFavorites.filter((id: string) => id !== bookId);
          }
          const updatedUser = { ...currentUser, favoriteBooks: updatedFavorites };
          this.user.set(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      })
    );
  }

  getFavorites(): Observable<any[]> {
    return this.api.get('/users/me/favorites');
  }

  getReadingProgress(): Observable<any[]> {
    return this.api.get('/users/me/progress');
  }

  uploadAvatar(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.api.post('/users/me/avatar', formData).pipe(
      tap((res: any) => {
        if (res && res.avatar) {
          const currentUser = this.user();
          if (currentUser) {
            const updatedUser = { ...currentUser, avatar: res.avatar };
            this.user.set(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        }
      }),
    );
  }
  updateProfile(data: {
    bio?: string;
    avatar?: string | null;
    dob?: string;
    penName?: string;
    legalName?: string;
  }): Observable<any> {
    return this.api.put('/users/me/profile', data).pipe(
      tap((res: any) => {
        if (res && res.user) {
          const currentUser = this.user();
          if (currentUser) {
            const updatedUser = { ...currentUser, ...res.user };
            this.user.set(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        }
      }),
    );
  }

  updateMonetization(data: {
    accountName?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
  }): Observable<any> {
    return this.api.put('/users/me/monetization', data);
  }

  getEarnings(): Observable<any> {
    return this.api.get('/earnings/me');
  }

  getEarningsProjection(): Observable<any> {
    return this.api.get('/earnings/me/projection');
  }

  getReaderRewards(): Observable<any> {
    return this.api.get('/rewards/me');
  }

  requestWithdrawal(): Observable<any> {
    return this.api.post('/earnings/withdraw', {});
  }

  forgotPassword(email: string): Observable<any> {
    return this.api.post('/auth/forgot-password', { email });
  }

  verifyResetCode(email: string, code: string): Observable<any> {
    return this.api.post('/auth/verify-reset-code', { email, code });
  }

  resetPassword(email: string, code: string, password: string): Observable<any> {
    return this.api.post('/auth/reset-password', { email, code, password });
  }

  updateReadingProgress(
    bookId: string,
    chapterId?: string,
    progressPercentage?: number,
  ): Observable<any> {
    return this.api.post('/users/me/progress', {
      bookId,
      chapterId,
      progressPercentage,
    });
  }

  deactivateAccount(): Observable<any> {
    return this.api.put('/users/me/deactivate', {});
  }

  deleteAccount(): Observable<any> {
    return this.api.delete('/users/me');
  }

  getToken(): string | null {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  }

  updateUser(partial: Partial<User>) {
    const current = this.user();
    if (current) {
      const updated = { ...current, ...partial };
      this.user.set(updated);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(updated));
      }
    }
  }

  private handleAuthResponse(res: any) {
    if (res) {
      if (res.token) {
        localStorage.setItem('token', res.token);
      }
      if (res.user) {
        this.user.set(res.user);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.notificationService.loadNotifications();
        if (res.user.status === 'suspended') {
          this.router.navigate(['/account-suspended']);
        }
      }
    }
  }
}
