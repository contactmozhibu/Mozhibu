import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import {
  AuthorService,
  AuthorProfile,
} from '../../core/services/author.service';
import { ApiService } from '../../core/services/api.service';
import { finalize } from 'rxjs/operators';
import { StoryCardComponent } from '../../shared/components/story-card/story-card.component';
import { UserCardComponent } from '../../shared/components/user-card/user-card.component';
import { SafeUrlPipe } from '../../shared/pipes/safe-url.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, StoryCardComponent, UserCardComponent, SafeUrlPipe, TranslatePipe],
  template: `
    <div class="profile-layout">
      <!-- Profile Banner -->
      <div class="profile-banner">
        <div class="profile-header">
          <img
            [src]="getAvatarUrl(user()?.avatar, user()?.username) | safeUrl"
            alt="User avatar"
            class="author-avatar"
            (error)="onAvatarError($event, user()?.username)"
            (click)="toggleBigAvatar()"
            style="cursor: pointer;"
          />
          <div class="author-info">
            <h1 class="author-name">{{ user()?.username }}</h1>
            <div class="author-meta">
              <span
                class="meta-item"
                *ngIf="
                  user()?.role === 'writer' || user()?.role === 'superadmin'
                "
              >
                <strong>{{ followersCount() }}</strong> {{ 'profile.followers' | translate }}
              </span>
              <span
                class="meta-item"
                *ngIf="
                  user()?.role !== 'writer' && user()?.role !== 'superadmin'
                "
              >
                {{ 'profile.reader' | translate }}
              </span>
              <span class="meta-separator">•</span>
              <span class="meta-item">
                <strong>{{ following().length }}</strong> {{ 'profile.following' | translate }}
              </span>
            </div>

            <div class="author-bio">
              <p>{{ user()?.bio || ('profile.noBio' | translate) }}</p>
            </div>
          </div>

          <div class="author-actions">
            <button
              class="btn-outline"
              routerLink="/settings"
              [queryParams]="{ tab: 'profile' }"
            >
              {{ 'profile.editProfile' | translate }}
            </button>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="profile-nav-wrapper">
        <nav class="profile-tabs">
          <button
            class="tab-btn"
            [class.active]="activeTab() === 'published'"
            (click)="onPublishedTabClick()"
          >
            {{ 'profile.publishedContents' | translate }} ({{ publishedStories().length }})
          </button>
          <button
            class="tab-btn"
            [class.active]="activeTab() === 'following'"
            (click)="activeTab.set('following')"
          >
            {{ 'profile.following' | translate }} ({{ following().length }})
          </button>
          <button
            class="tab-btn"
            [class.active]="activeTab() === 'followers'"
            (click)="activeTab.set('followers')"
          >
            {{ 'profile.followers' | translate }} ({{ followers().length }})
          </button>
          <button
            class="tab-btn"
            [class.active]="activeTab() === 'reviews'"
            (click)="activeTab.set('reviews')"
          >
            {{ 'profile.reviewedContents' | translate }} ({{ reviewsList().length }})
          </button>
        </nav>
      </div>

      <div class="profile-content">
        @if (isLoading()) {
          <div class="results-grid">
            <div class="skeleton-card" *ngFor="let i of [1, 2, 3, 4, 5, 6]">
              <div class="skeleton skeleton-cover"></div>
              <div class="skeleton skeleton-text"></div>
              <div class="skeleton skeleton-text short"></div>
            </div>
          </div>
        } @else {
          <!-- PUBLISHED CONTENTS -->
          <div *ngIf="activeTab() === 'published'" class="tab-pane">
            @if (user()?.role === 'writer' || user()?.role === 'superadmin') {
              @if (publishedStories().length > 0) {
                <div class="results-grid">
                  @for (item of publishedStories(); track item._id) {
                    <div class="profile-book-card" [routerLink]="['/story', item._id]">
                      <div class="profile-book-cover">
                        <img [src]="item.cover || 'assets/default-cover.png'" [alt]="item.title" loading="lazy" />
                        <span class="profile-book-genre" *ngIf="item.genre">{{ item.genre }}</span>
                      </div>
                      <div class="profile-book-info">
                        <h4 class="profile-book-title">{{ item.title }}</h4>
                        <div class="profile-book-stats">
                          <span class="stat-item">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            {{ item.views || 0 }}
                          </span>
                          <span class="stat-item">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                            {{ item.likesCount || 0 }}
                          </span>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="empty-state">
                  <p>{{ 'profile.noPublished' | translate }}</p>
                  <button class="btn-primary" routerLink="/write">
                    {{ 'profile.startWriting' | translate }}
                  </button>
                </div>
              }
            } @else {
              <div class="empty-state author-promo">
                <h3>{{ 'profile.promoTitle' | translate }}</h3>
                <p>
                  {{ 'profile.promoDesc' | translate }}
                </p>
                <button
                  class="btn-primary"
                  routerLink="/settings"
                  [queryParams]="{ tab: 'account' }"
                >
                  {{
                    authorStatus() === 'pending'
                      ? ('profile.requestPending' | translate)
                      : ('profile.becomeAuthor' | translate)
                  }}
                </button>
              </div>
            }
          </div>


          <!-- FOLLOWING -->
          <div *ngIf="activeTab() === 'following'" class="tab-pane">
            @if (following().length > 0) {
              <div class="results-grid">
                @for (author of following(); track author.id) {
                  <app-user-card [user]="author"></app-user-card>
                }
              </div>
            } @else {
              <div class="empty-state">
                <p>
                  {{ 'profile.noFollowing' | translate }}
                </p>
                <button
                  class="btn-primary"
                  [routerLink]="['/search']"
                  [queryParams]="{ type: 'authors' }"
                >
                  {{ 'profile.findAuthors' | translate }}
                </button>
              </div>
            }
          </div>

          <!-- FOLLOWERS -->
          <div *ngIf="activeTab() === 'followers'" class="tab-pane">
            @if (followers().length > 0) {
              <div class="results-grid">
                @for (follower of followers(); track follower.id) {
                  <app-user-card [user]="follower"></app-user-card>
                }
              </div>
            } @else {
              <div class="empty-state">
                <p>
                  {{ 'profile.noFollowers' | translate }}
                </p>
              </div>
            }
          </div>

          <!-- REVIEWS -->
          <div *ngIf="activeTab() === 'reviews'" class="tab-pane">
            @if (isLoadingReviews()) {
              <div class="loading-state"><div class="spinner"></div></div>
            } @else if (reviewsList().length === 0) {
              <div class="empty-state"><p>You haven't written any reviews yet.</p></div>
            } @else {
              <div class="reviews-list">
                @for (review of reviewsList(); track review._id) {
                  <div class="review-card">
                    <div class="review-header">
                      <div class="reviewer-info" [routerLink]="['/author', review.user._id]" style="cursor: pointer;">
                        <img [src]="getAvatarUrl(review.user.avatar, review.user.username)" class="reviewer-avatar" (error)="onAvatarError($event, review.user.username)" />
                        <div>
                          <h4 class="reviewer-name">
                            {{ review.user.username }}

                          </h4>
                          <p class="review-date">{{ review.createdAt | date:'longDate' }}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div class="review-body">
                      @if (review.rating > 0) {
                        <div class="star-rating">
                          @for (star of [1,2,3,4,5]; track star) {
                            <span class="star" [class.filled]="star <= review.rating">★</span>
                          }
                        </div>
                      }
                      @if (review.text) {
                        <p class="review-text">"{{ review.text }}"</p>
                      }
                    </div>

                    <div class="reviewed-book" [routerLink]="['/story', review.book._id]" style="cursor: pointer;">
                      <img [src]="getCoverUrl(review.book.cover)" class="mini-cover" (error)="onCoverError($event)" />
                      <div>
                        <span style="font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: 600; display: block; margin-bottom: 2px;">Reviewed on</span>
                        <span class="book-title-mini">{{ review.book.title }}</span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>

      <!-- Enlarged Avatar Modal -->
      @if (showBigAvatar() && user()) {
        <div class="avatar-modal-overlay" (click)="toggleBigAvatar()">
          <div class="avatar-modal-content" (click)="$event.stopPropagation()">
            <button class="close-btn" (click)="toggleBigAvatar()">×</button>
            <img
              [src]="getAvatarUrl(user()?.avatar, user()?.username)"
              alt="User avatar enlarged"
              class="avatar-large"
              (error)="onAvatarError($event, user()?.username)"
            />
          </div>
        </div>
      }
      <!-- Upgrade to Author Modal -->
      @if (showCompetitionUpgrade()) {
        <div class="avatar-modal-overlay" (click)="closeUpgradeModal()" style="display: flex; align-items: center; justify-content: center; z-index: 1000; position: fixed; inset: 0; background: rgba(0,0,0,0.5);">
          <div class="modal-content" (click)="$event.stopPropagation()" style="background: white; border-radius: 12px; padding: 24px; max-width: 400px; width: 90%; box-shadow: 0 10px 30px rgba(0,0,0,0.2); position: relative;">
            <button class="close-btn" (click)="closeUpgradeModal()" style="position: absolute; right: 16px; top: 16px; border: none; background: transparent; font-size: 24px; cursor: pointer; color: var(--ink);">×</button>
            <div class="modal-header">
              <h2 class="modal-title" style="color: var(--ink); margin-bottom: 12px; font-size: 20px;">
                Become an Author
              </h2>
            </div>
            <div class="modal-body" style="color: var(--ink-soft); margin-bottom: 24px; line-height: 1.5;">
              <p>
                You need to be an Author to participate. Would you like to upgrade your account now? It's completely free!
              </p>
            </div>
            <div class="modal-footer" style="display: flex; gap: 16px; justify-content: flex-end;">
              <button class="btn btn-outline" style="border: 1px solid var(--border); background: transparent; padding: 10px 20px; border-radius: 8px; cursor: pointer; color: var(--ink);" (click)="closeUpgradeModal()">Cancel</button>
              <button class="btn btn-primary" style="background: var(--forest); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;" (click)="upgradeToAuthor()" [disabled]="isUpgrading()">{{ isUpgrading() ? "Upgrading..." : "Upgrade Now" }}</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .profile-layout {
        min-height: calc(100vh - 73px);
        background: var(--paper);
      }
      .profile-banner {
        background: var(--surface);
        border-bottom: 1px solid var(--border);
        padding: 64px 48px 32px;
      }
      .profile-header {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        gap: 32px;
        align-items: flex-start;
      }

      .author-avatar {
        width: 140px;
        height: 140px;
        border-radius: 50%;
        object-fit: cover;
        border: 4px solid var(--surface);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        flex-shrink: 0;
        transition: transform 0.2s;
      }
      .author-avatar:hover {
        transform: scale(1.05);
      }

      .avatar-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        cursor: pointer;
        animation: fadeIn 0.2s ease-out;
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .avatar-modal-content {
        position: relative;
        max-width: 90vw;
        max-height: 90vh;
      }
      .avatar-large {
        width: 400px;
        height: 400px;
        object-fit: cover;
        border-radius: 50%;
        border: 4px solid var(--surface);
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      }
      .close-btn {
        position: absolute;
        top: -20px;
        right: -40px;
        background: transparent;
        color: white;
        border: none;
        font-size: 36px;
        cursor: pointer;
      }

      @media (max-width: 768px) {
        .avatar-large {
          width: 300px;
          height: 300px;
        }
        .close-btn {
          right: 0;
          top: -40px;
        }
      }
      .author-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 8px;
        text-align: left;
      }
      .author-name {
        font-family: var(--display);
        font-size: 32px;
        font-weight: 700;
        color: var(--ink);
        margin: 0;
      }
      .author-meta {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 15px;
        color: var(--ink-soft);
        margin: 0;
      }
      .meta-separator {
        color: var(--border-deep);
      }
      .author-bio {
        margin: 0;
      }
      .author-bio p {
        font-size: 16px;
        line-height: 1.6;
        color: var(--ink-soft);
        margin: 0;
        text-align: left;
      }

      .author-actions {
        flex-shrink: 0;
        align-self: flex-start;
      }

      .profile-nav-wrapper {
        background: var(--surface);
        border-bottom: 1px solid var(--border);
        padding: 0 48px;
      }
      .profile-tabs {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        gap: 32px;
        overflow-x: auto;
        scrollbar-width: none;
      }
      .profile-tabs::-webkit-scrollbar {
        display: none;
      }

      .tab-btn {
        padding: 16px 0;
        font-family: var(--display);
        font-size: 16px;
        font-weight: 600;
        color: var(--ink-soft);
        position: relative;
        background: transparent;
        border: none;
        cursor: pointer;
        transition: color 0.2s;
        white-space: nowrap;
      }
      .tab-btn:hover {
        color: var(--ink);
      }
      .tab-btn.active {
        color: var(--forest-deep);
      }
      .tab-btn.active::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: -1px;
        height: 2px;
        background: var(--forest);
        border-radius: 2px 2px 0 0;
      }

      .profile-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 48px;
      }

      .btn-primary {
        background: var(--forest);
        color: white;
        border: none;
        padding: 12px 32px;
        border-radius: 100px;
        font-family: var(--display);
        font-weight: 600;
        font-size: 15px;
        cursor: pointer;
        transition: background 0.2s;
      }
      .btn-primary:hover {
        background: var(--forest-deep);
      }
      .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .btn-outline {
        background: transparent;
        color: var(--forest);
        border: 1px solid var(--forest);
        padding: 12px 32px;
        border-radius: 100px;
        font-family: var(--display);
        font-weight: 600;
        font-size: 15px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .btn-outline:hover {
        border-color: var(--rose);
        color: var(--rose);
      }

      .loading-state,
      .empty-state {
        text-align: center;
        padding: 64px 20px;
        color: var(--ink-soft);
      }
      .empty-state p {
        margin-bottom: 24px;
        font-size: 16px;
      }
      .author-promo {
        background: var(--card);
        border-radius: 16px;
        border: 1px dashed var(--border);
      }
      .author-promo h3 {
        font-family: var(--display);
        font-size: 20px;
        color: var(--ink);
        margin-bottom: 12px;
      }

      .results-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 32px 24px;
      }

      .profile-book-card {
        display: flex;
        flex-direction: column;
        gap: 10px;
        cursor: pointer;
        transition: transform 0.2s;
        border-radius: var(--radius-m);
        overflow: hidden;
        background: var(--card);
        border: 1px solid var(--border-soft);
      }
      .profile-book-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.1);
      }
      .profile-book-cover {
        position: relative;
        width: 100%;
        aspect-ratio: 2/3;
        overflow: hidden;
      }
      .profile-book-cover img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .profile-book-genre {
        position: absolute;
        top: 8px;
        right: 8px;
        background: var(--forest);
        color: #fff;
        font-size: 10px;
        font-weight: 600;
        padding: 3px 8px;
        border-radius: 100px;
        font-family: var(--display);
      }
      .profile-book-info {
        padding: 8px 12px 12px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .profile-book-title {
        font-size: 13px;
        font-weight: 600;
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        margin: 0;
      }
      .profile-book-stats {
        display: flex;
        gap: 12px;
        align-items: center;
      }
      .stat-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: var(--ink-soft);
        font-weight: 500;
      }
      .stat-item svg {
        color: var(--ink-faint);
        flex-shrink: 0;
      }

      .book-card {
        display: flex;
        flex-direction: column;
        gap: 12px;
        cursor: pointer;
        transition: transform 0.2s;
      }
      .book-card:hover {
        transform: translateY(-4px);
      }
      .cover-wrapper {
        position: relative;
        width: 100%;
        aspect-ratio: 2 / 3;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }
      .book-cover {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .status-badge {
        position: absolute;
        top: 8px;
        right: 8px;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        color: white;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
      }
      .status-badge.completed {
        background: var(--forest);
      }
      .book-info h4 {
        font-family: var(--display);
        font-size: 16px;
        font-weight: 700;
        color: var(--ink);
        margin-bottom: 4px;
      }
      .book-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: var(--ink-soft);
      }

      .history-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
        gap: 20px;
      }
      .history-card-clean {
        background: var(--card);
        border: 1px solid var(--border-soft);
        border-radius: 16px;
        padding: 16px;
        display: flex;
        align-items: center;
        gap: 20px;
        cursor: pointer;
        transition:
          box-shadow 0.2s,
          transform 0.2s;
      }
      .history-card-clean:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
        transform: translateY(-2px);
      }
      .history-cover {
        width: 70px;
        height: 100px;
        object-fit: cover;
        border-radius: 8px;
        flex-shrink: 0;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        background: #e0e0e0;
      }
      .history-info {
        flex: 1;
        overflow: hidden;
      }
      .history-info h3 {
        font-family: var(--display);
        font-size: 17px;
        font-weight: 700;
        color: var(--ink);
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .history-author {
        font-size: 13px;
        color: var(--ink-soft);
        margin-bottom: 12px;
      }
      .mini-progress-container {
        margin-bottom: 8px;
      }
      .mini-bar {
        width: 100%;
        height: 4px;
        background: var(--border-soft);
        border-radius: 2px;
        overflow: hidden;
      }
      .mini-fill {
        height: 100%;
        background: #5e5e5e;
        border-radius: 2px;
      }
      .last-read {
        font-size: 12px;
        color: var(--ink-faint);
      }

      .authors-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 20px;
      }
      .author-card {
        background: var(--card);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-m);
        padding: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        transition: box-shadow 0.2s;
      }
      .author-card:hover {
        box-shadow: 0 4px 16px rgba(43, 38, 32, 0.05);
      }

      /* Reviews List Styles */
      .reviews-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
        gap: 24px;
        align-items: start;
      }
      .review-card {
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 20px;
        padding: 24px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
        transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .review-card:hover {
        transform: translateY(-6px);
        box-shadow: 0 16px 32px rgba(0, 0, 0, 0.12);
        border-color: #d1d5db;
      }
      .review-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      .reviewer-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .reviewer-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        object-fit: cover;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      .reviewer-name {
        margin: 0 0 4px;
        font-size: 16px;
        font-weight: 700;
        color: var(--ink);
        display: flex;
        align-items: center;
      }
      .review-date {
        margin: 0;
        font-size: 12px;
        font-weight: 500;
        color: var(--ink-faint);
      }
      .reviewed-book {
        display: flex;
        align-items: center;
        gap: 12px;
        background: #f9fafb;
        padding: 8px 12px;
        border-radius: 12px;
        border: 1px solid #e5e7eb;
        transition: background 0.2s;
        margin-top: 8px;
      }
      .reviewed-book:hover {
        background: #f3f4f6;
      }
      .mini-cover {
        width: 32px;
        height: 48px;
        border-radius: 6px;
        object-fit: cover;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .book-title-mini {
        font-size: 14px;
        font-weight: 600;
        color: var(--ink);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .review-body {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .star-rating {
        display: flex;
        gap: 4px;
      }
      .star {
        color: #e5e7eb;
        font-size: 18px;
      }
      .star.filled {
        color: #f59e0b;
      }
      .review-text {
        margin: 0;
        font-size: 15px;
        line-height: 1.6;
        color: #4b5563;
        white-space: pre-wrap;
        font-style: italic;
        position: relative;
        padding-left: 12px;
        border-left: 3px solid #e5e7eb;
      }

      .author-info {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .author-avatar-sm {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        object-fit: cover;
      }
      .author-info h3 {
        font-family: var(--display);
        font-size: 16px;
        font-weight: 600;
        color: var(--ink);
        margin-bottom: 4px;
      }
      .author-info p {
        font-size: 13px;
        color: var(--ink-soft);
      }

      @media (max-width: 768px) {
        .profile-header {
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .author-meta {
          justify-content: center;
        }
        .profile-banner {
          padding: 48px 24px 24px;
        }
        .author-avatar {
          width: 120px;
          height: 120px;
        }
        .profile-content {
          padding: 32px 16px;
        }
        .history-list {
          grid-template-columns: 1fr;
        }
        .authors-list {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 768px) {
        .profile-header {
          flex-direction: column;
          text-align: center;
          gap: 16px;
        }
        .author-actions {
          margin-left: 0;
          margin-top: 16px;
        }
        .profile-tabs {
          overflow-x: auto;
          white-space: nowrap;
          justify-content: flex-start;
          padding-bottom: 8px;
        }
        .profile-content {
          padding: 24px 16px;
        }
        .results-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .history-list {
          grid-template-columns: 1fr;
          gap: 16px;
        }
        .author-avatar {
          width: 96px;
          height: 96px;
        }
      }
    `,
  ],
})
export class UserProfileComponent implements OnInit {
  authService = inject(AuthService);
  private authorService = inject(AuthorService);
  api = inject(ApiService);
  private http = inject(HttpClient);
  user = this.authService.user;
  authorStatus = signal<string>('');

  activeTab = signal<
    | 'published'
    | 'following'
    | 'followers'
    | 'reviews'
  >('published');
  isLoading = signal<boolean>(true);

  publishedStories = signal<any[]>([]);
  followersCount = signal<number>(0);
  following = signal<any[]>([]);
  followers = signal<any[]>([]);
  private route = inject(ActivatedRoute);
  showBigAvatar = signal<boolean>(false);
  
  showCompetitionUpgrade = signal<boolean>(false);
  isUpgrading = signal<boolean>(false);
  
  reviewsList = signal<any[]>([]);
  isLoadingReviews = signal<boolean>(false);

  toggleBigAvatar() {
    this.showBigAvatar.set(!this.showBigAvatar());
  }

  closeUpgradeModal() {
    this.showCompetitionUpgrade.set(false);
    document.body.style.overflow = '';
  }

  onPublishedTabClick() {
    const role = this.user()?.role;
    if (role !== 'writer' && role !== 'superadmin') {
      this.showCompetitionUpgrade.set(true);
      document.body.style.overflow = 'hidden';
    } else {
      this.activeTab.set('published');
    }
  }

  upgradeToAuthor() {
    this.isUpgrading.set(true);
    this.http.put('/api/users/upgrade-role', {}).subscribe({
      next: (res: any) => {
        if (res.user) {
          this.authService.user.set({
            ...this.authService.user()!,
            ...res.user,
          });
          this.closeUpgradeModal();
          this.activeTab.set('published');
        }
        this.isUpgrading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isUpgrading.set(false);
        alert('Failed to upgrade. Please try again.');
      },
    });
  }

  ngOnInit() {
    this.authorStatus.set(this.user()?.authorStatus || '');
    this.loadAllData();
    
    this.route.queryParams.subscribe(params => {
      if (params['upgrade'] === 'competition') {
        const role = this.user()?.role;
        if (role !== 'writer' && role !== 'superadmin') {
          this.showCompetitionUpgrade.set(true);
          document.body.style.overflow = 'hidden';
        }
      }
    });
  }

  loadAllData() {
    this.isLoading.set(true);
    let completedReqs = 0;
    const totalReqs = 4;
    const checkDone = () => {
      completedReqs++;
      if (completedReqs >= totalReqs) {
        this.isLoading.set(false);
      }
    };

    // 1. Load Published Stories if Author
    if (this.user()?.role === 'writer' || this.user()?.role === 'superadmin') {
      this.authorService.getAuthorProfile(this.user()!.id).subscribe({
        next: (profile) => {
          const allBooks = profile.books || [];
          this.publishedStories.set(allBooks.filter((b) => !b.competitionTag));
          this.followersCount.set(profile.author.followersCount || 0);
          checkDone();
        },
        error: () => checkDone(),
      });
    } else {
      checkDone();
    }

    // 2. Load Following
    this.authService.getFollowing().subscribe({
      next: (authors: any[]) => {
        const currentUser = this.authService.user();
        this.following.set(
          authors
            .filter(
              (a) =>
                a._id !== (currentUser as any)?._id &&
                a._id !== currentUser?.id &&
                a.username !== currentUser?.username,
            )
            .map((a) => ({
              id: a._id,
              name: a.username,
              avatar: this.getAvatarUrl(a.avatar, a.username),
              followers: (a.followersCount / 1000).toFixed(1) + 'K',
              isFollowing: true,
            })),
        );
        checkDone();
      },
      error: () => checkDone(),
    });

    // 5. Load Followers
    this.authService.getFollowers().subscribe({
      next: (followers: any[]) => {
        const currentUser = this.authService.user();
        this.followers.set(
          followers
            .filter(
              (a) =>
                a._id !== (currentUser as any)?._id &&
                a._id !== currentUser?.id &&
                a.username !== currentUser?.username,
            )
            .map((a) => ({
              id: a._id,
              name: a.username,
              avatar: this.getAvatarUrl(a.avatar, a.username),
              followers: (a.followersCount / 1000).toFixed(1) + 'K',
              isFollowing: this.following().some(f => f.id === a._id)
            })),
        );
        checkDone();
      },
      error: () => checkDone(),
    });

    // 4. Load Reviews
    this.isLoadingReviews.set(true);
    if (this.user()?.id) {
      this.authorService.getAuthorReviews(this.user()!.id).subscribe({
        next: (reviews) => {
          this.reviewsList.set(reviews);
          this.isLoadingReviews.set(false);
          checkDone();
        },
        error: () => {
          this.isLoadingReviews.set(false);
          checkDone();
        }
      });
    } else {
      this.isLoadingReviews.set(false);
      checkDone();
    }
  }


  getAvatarUrl(path: string | undefined, name?: string): string {
    if (!path) return this.api.getFallbackAvatar(name);
    return this.api.getImageUrl(path);
  }

  onAvatarError(event: any, name?: string) {
    event.target.src = this.api.getFallbackAvatar(name);
  }

  onCoverError(event: any) {
    event.target.src = this.api.getFallbackCover();
  }

  getCoverUrl(path: string | undefined): string {
    if (!path) return this.api.getFallbackCover();
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return this.api.getImageUrl(path);
  }
}
