import { Component, inject } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { HeroComponent } from './components/hero/hero.component';
import { StorySectionComponent } from '../../shared/components/story-section/story-section.component';
import { CompetitionBannerComponent } from './components/competition-banner/competition-banner.component';
import { AuthService } from '../../core/services/auth.service';
import {
  UserCardComponent,
  UserProfile,
} from '../../shared/components/user-card/user-card.component';
import {
  AnnouncementCardComponent,
  Announcement,
} from '../../shared/components/announcement-card/announcement-card.component';
import { ContinueReadingComponent } from './components/continue-reading/continue-reading.component';
import { BookService } from '../../core/services/book.service';
import { ApiService } from '../../core/services/api.service';
import { LanguageService } from '../../core/services/language.service';
import { OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GoogleAdComponent } from '../../shared/components/ad/google-ad.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { ConfirmService } from '../../core/services/confirm.service';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeroComponent,
    StorySectionComponent,
    CompetitionBannerComponent,
    UserCardComponent,
    AnnouncementCardComponent,
    ContinueReadingComponent,
    RouterModule,
    GoogleAdComponent,
    TranslatePipe,
  ],
  template: `
    <div class="page-wrapper">
      @if (!authService.user()) {
        <!-- GUEST VIEW -->
        <app-hero></app-hero>

        <app-story-section
          title="Recommended for You"
          [stories]="recommendedStories"
          [isLoading]="isStoriesLoading"
          viewAllLink="/categories"
          (loadMore)="loadMoreBooks('popular', 'popular')"
        ></app-story-section>

        <div class="ad-banner-wrapper">
          <app-google-ad></app-google-ad>
        </div>

        <app-story-section
          title="Trending Today"
          [stories]="trendingStories"
          [isLoading]="isStoriesLoading"
          viewAllLink="/categories"
          (loadMore)="loadMoreBooks('trending', 'trending')"
        ></app-story-section>
        <app-story-section
          title="Most Read"
          [stories]="mostReadStories"
          [isLoading]="isStoriesLoading"
          viewAllLink="/categories"
        ></app-story-section>

        <app-competition-banner></app-competition-banner>

        <app-story-section
          title="Editor's Picks"
          [stories]="editorPicks"
          [isLoading]="isStoriesLoading"
          viewAllLink="/categories"
        ></app-story-section>
        <app-story-section
          title="Newly Published"
          [stories]="newlyPublished"
          [isLoading]="isStoriesLoading"
          viewAllLink="/categories"
          (loadMore)="loadMoreBooks('latest', 'latest')"
        ></app-story-section>

        <app-story-section
          title="Ongoing Stories"
          [stories]="ongoingStories"
          [isLoading]="isStoriesLoading"
          viewAllLink="/categories"
        ></app-story-section>
        <app-story-section
          title="Audio Stories"
          [stories]="audioStories"
          [isLoading]="isStoriesLoading"
          viewAllLink="/categories"
          (loadMore)="loadMoreBooks('audio', '', true)"
        ></app-story-section>
      } @else {
        <!-- LOGGED IN VIEW -->
        <div class="logged-in-container">
          <app-continue-reading></app-continue-reading>

          <!-- Announcements -->
          @if (announcements.length > 0) {
            <section class="announcement-section">
              <div class="section-header">
                <h2 class="section-title">{{ "notifications.announcements" | translate }}</h2>
              </div>
              <div class="scroll-container">
                <div class="announcements-track">
                  <app-announcement-card
                    *ngFor="let ann of announcements.slice(0, 4)"
                    [announcement]="ann"
                    (dismiss)="onDismissAnnouncement($event)"
                  ></app-announcement-card>
                </div>
              </div>
            </section>
          }

          <app-story-section
            [title]="'home.recommended' | translate"
            [stories]="recommendedStories"
            [isLoading]="isStoriesLoading"
            viewAllLink="/categories"
            (loadMore)="loadMoreBooks('popular', 'popular')"
          ></app-story-section>

          <!-- Authors section -->
          <section class="user-section">
            <div class="section-header">
              <h2 class="section-title">{{ "home.authors" | translate }}</h2>
              <a routerLink="/community" class="view-all">View All</a>
            </div>
            <div class="scroll-container">
              <div class="users-track">
                <app-user-card
                  *ngFor="let user of authorUsers"
                  [user]="user"
                ></app-user-card>
              </div>
            </div>
          </section>

          <!-- Following Users -->
          <section class="user-section">
            <div class="section-header">
              <h2 class="section-title">{{ "home.following" | translate }}</h2>
              <a routerLink="/community" class="view-all">View All</a>
            </div>
            <div class="scroll-container">
              <div class="users-track">
                <app-user-card
                  *ngFor="let user of followingUsers"
                  [user]="user"
                ></app-user-card>
              </div>
            </div>
          </section>

          <div class="ad-banner-wrapper">
            <app-google-ad></app-google-ad>
          </div>

          <app-story-section
            [title]="'home.latest' | translate"
            [stories]="newlyPublished"
            [isLoading]="isStoriesLoading"
            viewAllLink="/categories"
            (loadMore)="loadMoreBooks('latest', 'latest')"
          ></app-story-section>

          <app-story-section
            [title]="'trending.title' | translate"
            [stories]="trendingStories"
            [isLoading]="isStoriesLoading"
            viewAllLink="/categories"
            (loadMore)="loadMoreBooks('trending', 'trending')"
          ></app-story-section>



          <app-competition-banner></app-competition-banner>


        </div>
      }
    </div>
  `,
  styles: [
    `
      .page-wrapper {
        max-width: 1536px;
        margin: 0 auto;
        padding: 0 32px 80px 32px;
      }
      .ad-banner-wrapper {
        margin: 40px 0;
        width: 100%;
      }
      .logged-in-container {
        padding-top: 16px;
      }
      .user-section,
      .announcement-section {
        margin-bottom: 64px;
        width: 100%;
      }
      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 24px;
        padding: 0 4px;
      }
      .section-title {
        font-family: var(--display);
        font-size: 24px;
        font-weight: 700;
        color: var(--ink);
      }
      .view-all {
        font-size: 14px;
        font-weight: 600;
        color: var(--forest);
        text-decoration: none;
      }
      .view-all:hover {
        text-decoration: underline;
      }
      .scroll-container {
        width: 100%;
        overflow-x: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
        padding: 10px 4px 20px 4px;
        margin: -10px -4px -20px -4px;
      }
      .scroll-container::-webkit-scrollbar {
        display: none;
      }
      .users-track,
      .announcements-track {
        display: flex;
        gap: 24px;
        width: max-content;
      }
      .users-track app-user-card {
        width: 150px;
        flex-shrink: 0;
      }
      @media (max-width: 768px) {
        .page-wrapper {
          padding: 0 16px 48px 16px;
        }
        .scroll-container {
          width: calc(100% + 32px);
          margin-left: -16px;
          margin-right: -16px;
          padding-left: 16px;
          padding-right: 16px;
        }
        .users-track::after,
        .announcements-track::after {
          content: '';
          width: 1px;
        }
      }
    `,
  ],
})
export class HomeComponent implements OnInit {
  authService = inject(AuthService);
  bookService = inject(BookService);
  private apiService = inject(ApiService);
  private languageService = inject(LanguageService);
  private confirmService = inject(ConfirmService);

  recommendedStories: any[] = [];
  trendingStories: any[] = [];
  mostReadStories: any[] = [];
  editorPicks: any[] = [];
  newlyPublished: any[] = [];
  ongoingStories: any[] = [];
  audioStories: any[] = [];

  isStoriesLoading = true;

  ngOnInit() {
    forkJoin({
      popular: this.bookService.getBooks('popular', '', false, 1, 10),
      trending: this.bookService.getBooks('trending', '', false, 1, 10),
      latest: this.bookService.getBooks('latest', '', false, 1, 10),
      audio: this.bookService.getBooks('', '', true, 1, 10),
    }).subscribe({
      next: (res: any) => {
        this.recommendedStories = this.mapStories(res.popular.books).slice(
          0,
          10,
        );
        this.trendingStories = this.mapStories(res.trending.books).slice(0, 10);
        this.newlyPublished = this.mapStories(res.latest.books).slice(0, 10);
        this.audioStories = this.mapStories(res.audio.books).slice(0, 10);

        // Some fallback slices for completed/ongoing/picks (we can just duplicate for demo)
        this.mostReadStories = [...this.recommendedStories];
        this.editorPicks = [...this.trendingStories];
        this.ongoingStories = [...this.audioStories];

        this.isStoriesLoading = false;
      },
      error: (err) => {
        console.error('Failed to load books:', err);
        this.isStoriesLoading = false;
      },
    });

    if (this.authService.user()) {
      const currentUser = this.authService.user()!;
      forkJoin({
        following: this.authService.getFollowing(),
        authors: this.authService.getAuthors()
      }).subscribe({
        next: (res: any) => {
          const followingIds = new Set(res.following.map((f: any) => f._id));
          
          this.followingUsers = res.following.map((a: any) => ({
            id: a._id,
            name: a.username,
            avatar: a.avatar
              ? this.apiService.getImageUrl(a.avatar)
              : this.apiService.getFallbackAvatar(a.username),
            followers: a.followersCount || 0,
            isFollowing: true,
          }));

          this.authorUsers = res.authors
            .filter((a: any) => a._id !== currentUser.id && !followingIds.has(a._id))
            .map((a: any) => ({
              id: a._id,
              name: a.username,
              avatar: a.avatar
                ? this.apiService.getImageUrl(a.avatar)
                : this.apiService.getFallbackAvatar(a.username),
              followers: a.followersCount || 0,
              isFollowing: false,
            }));
        },
      });
    }

    // Fetch real announcements from backend broadcasts
    const currentLang = this.languageService.currentLang() || 'en';
    this.apiService.get<any[]>(`/notifications/broadcasts?lang=${currentLang}`).subscribe({
      next: (broadcasts) => {
        this.announcements = broadcasts.map((b: any) => ({
          id: b._id,
          type: 'news' as 'news' | 'update' | 'event',
          date: new Date(b.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          title: b.title,
          content: b.message,
        }));
      },
      error: () => {
        this.announcements = [];
      },
    });
  }

  onDismissAnnouncement(id: string) {
    this.confirmService.confirm(
      'Remove Announcement',
      'Are you sure you want to dismiss this announcement? It will be removed from your feed permanently.',
      true,
      'Remove',
      'Cancel'
    ).subscribe(confirmed => {
      if (confirmed) {
        // Optimistically remove from UI
        this.announcements = this.announcements.filter(a => a.id !== id);
        
        // Show success popup in the next tick so the previous modal finishes closing
        setTimeout(() => {
          this.confirmService.confirm(
            'Success',
            'Announcement successfully removed.',
            false,
            'OK',
            ''
          ).subscribe();
        }, 0);
        
        // Call backend to persist dismissal
        if (this.authService.user()) {
          this.apiService.post(`/notifications/broadcasts/${id}/dismiss`, {}).subscribe({
            error: (err) => console.error('Failed to dismiss announcement', err)
          });
        }
      }
    });
  }

  private mapStories(books: any[]) {
    return books.map((b) => ({
      id: b._id,
      title: b.title,
      author: b.author?.username || 'Unknown',
      cover: b.cover || 'assets/placeholder.jpg',
      genre: b.genre,
      views: (b.views / 1000).toFixed(1) + 'K',
      rating: b.rating ? Number(b.rating).toFixed(1) : 0,
      isAudio: !!b.isAudio,
      accessType: b.accessType,
      isMature: !!b.isMature,
    }));
  }

  private pageMap: { [key: string]: number } = {
    popular: 1,
    trending: 1,
    latest: 1,
    audio: 1,
  };
  private loadingMap: { [key: string]: boolean } = {};

  loadMoreBooks(category: string, sort: string, isAudio: boolean = false) {
    if (this.loadingMap[category]) return;
    this.loadingMap[category] = true;
    this.pageMap[category]++;

    this.bookService
      .getBooks(sort, '', isAudio, this.pageMap[category], 10)
      .subscribe({
        next: (res: any) => {
          const newStories = this.mapStories(res.books);
          if (category === 'popular')
            this.recommendedStories.push(...newStories);
          if (category === 'trending') this.trendingStories.push(...newStories);
          if (category === 'latest') this.newlyPublished.push(...newStories);
          if (category === 'audio') this.audioStories.push(...newStories);
          this.loadingMap[category] = false;
        },
        error: () => {
          this.loadingMap[category] = false;
        },
      });
  }

  followingUsers: UserProfile[] = [];
  authorUsers: UserProfile[] = [];
  announcements: Announcement[] = [];
}
