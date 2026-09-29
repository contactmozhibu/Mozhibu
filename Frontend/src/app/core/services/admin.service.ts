import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface AdminStats {
  totalPublishedBooks: number;
  totalUsers: number;
  readers: number;
  writers: number;
  monthlyBooksData: number[];
  monthlyUsersData: number[];
  chartLabels: string[];
  totalAuthors: number;
  pendingBooks: number;
  activeSubscriptions: number;
}

export interface AdminBook {
  _id: string;
  title: string;
  author: { _id: string; username: string; email: string };
  cover?: string;
  genre: string;
  description?: string;
  tags?: string[];
  competitionTag?: string;
  series?: string;
  views: number;
  rating?: number;
  isMature?: boolean;
  isAudio?: boolean;
  status: string;
  rejectionReason?: string;
  submittedAt: string;
  createdAt: string;
  reportCount?: number;
  reports?: {
    user: { _id: string; username: string; email: string; avatar?: string };
    reason: string;
    comment?: string;
    createdAt: string;
  }[];
}

export interface AdminUser {
  _id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  suspendedUntil?: string | Date;
  createdAt: string;
}

export interface AdminAuthor {
  _id: string;
  username: string;
  email: string;
  status: string;
  joinedAt: string;
  publishedCount: number;
  totalReads: number;
}

export interface AdminAuthorDetail {
  author: {
    _id: string;
    username: string;
    email: string;
    role: string;
    status: string;
    followersCount: number;
    createdAt: string;
    preferredLanguage: string;
  };
  books: AdminBook[];
}

export interface CompetitionConfig {
  isActive: boolean;
  tag: string;
  title: string;
  description: string;
  endDate: string;
  buttonText: string;
  buttonLink: string;
}

export interface PendingAuthor {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
  status: string;
  authorStatus: string;
}

export interface AdminBroadcast {
  _id: string;
  title: string;
  message: string;
  audience: string;
  sentBy: {
    _id: string;
    username: string;
    email: string;
  };
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private api = inject(ApiService);

  private fixCoverUrl(book: any): any {
    if (!book || !book.cover) return book;
    if (book.cover.startsWith('http')) return book;
    return { ...book, cover: this.api.getImageUrl(book.cover) };
  }

  getStats(filter: string = 'This Year'): Observable<AdminStats> {
    return this.api.get(`/admin/stats?filter=${encodeURIComponent(filter)}`);
  }

  getBooks(status?: string): Observable<AdminBook[]> {
    const params = status && status !== 'reported' ? `?status=${status}` : '';
    return this.api
      .get<AdminBook[]>(`/admin/books${params}`)
      .pipe(map((books) => books.map((b) => this.fixCoverUrl(b))));
  }

  getReportedBooks(): Observable<AdminBook[]> {
    return this.api
      .get<AdminBook[]>('/admin/reported-books')
      .pipe(map((books) => books.map((b) => this.fixCoverUrl(b))));
  }

  getBookDetails(id: string): Observable<AdminBook> {
    return this.api
      .get<AdminBook>(`/admin/books/${id}`)
      .pipe(map((book) => this.fixCoverUrl(book)));
  }

  clearBookReports(id: string): Observable<any> {
    return this.api.delete(`/admin/books/${id}/reports`);
  }

  updateBookStatus(
    id: string,
    status: string,
    rejectionReason?: string,
  ): Observable<any> {
    return this.api
      .put(`/admin/books/${id}/status`, { status, rejectionReason })
      .pipe(map((book) => this.fixCoverUrl(book)));
  }

  getUsers(): Observable<AdminUser[]> {
    return this.api.get('/admin/users');
  }

  updateUserStatus(id: string, status: string, duration?: string): Observable<any> {
    return this.api.put(`/admin/users/${id}/status`, { status, duration });
  }

  deleteUser(id: string): Observable<any> {
    return this.api.delete(`/admin/users/${id}`);
  }

  getAuthors(): Observable<AdminAuthor[]> {
    return this.api.get('/admin/authors');
  }

  getAuthorDetails(id: string): Observable<AdminAuthorDetail> {
    return this.api.get<AdminAuthorDetail>(`/admin/authors/${id}`).pipe(
      map((detail) => {
        if (detail.books) {
          detail.books = detail.books.map((b: any) => this.fixCoverUrl(b));
        }
        return detail;
      }),
    );
  }

  getPendingAuthors(): Observable<PendingAuthor[]> {
    return this.api.get('/admin/pending-authors');
  }

  updatePendingAuthorStatus(
    id: string,
    action: 'approve' | 'reject',
  ): Observable<any> {
    return this.api.put(`/admin/pending-authors/${id}/status`, { action });
  }

  broadcastAnnouncement(data: {
    title: string;
    message: string;
    audience: string;
  }): Observable<any> {
    return this.api.post('/admin/broadcast', data);
  }

  getBroadcastHistory(): Observable<AdminBroadcast[]> {
    return this.api.get('/admin/broadcasts');
  }

  deleteBroadcast(id: string): Observable<any> {
    return this.api.delete(`/admin/broadcasts/${id}`);
  }

  getCompetitionConfig(): Observable<any> {
    return this.api.get('/admin/competition');
  }

  updateCompetitionConfig(data: any): Observable<any> {
    return this.api.put('/admin/competition', data);
  }

  getCompetitionEntries(): Observable<AdminBook[]> {
    return this.api
      .get<AdminBook[]>('/admin/competition/entries')
      .pipe(map((books) => books.map((b) => this.fixCoverUrl(b))));
  }

  announceCompetitionWinner(bookIds: string[]): Observable<any> {
    return this.api.post('/admin/competition/announce-winner', { bookIds });
  }

  sendCompetitionNotification(message: string): Observable<any> {
    return this.api.post('/admin/competition/notify', { message });
  }

  getCompetitionHistory(): Observable<any[]> {
    return this.api.get<any[]>('/admin/competitions/history');
  }

  getCompetitionDetails(id: string): Observable<{competition: any, entries: any[]}> {
    return this.api.get<{competition: any, entries: any[]}>(`/admin/competitions/${id}`)
      .pipe(
        map(res => {
          res.entries = res.entries.map((b: any) => this.fixCoverUrl(b));
          if (res.competition && res.competition.winnerBookIds) {
            res.competition.winnerBookIds = res.competition.winnerBookIds.map((b: any) => this.fixCoverUrl(b));
          }
          return res;
        })
      );
  }
}
