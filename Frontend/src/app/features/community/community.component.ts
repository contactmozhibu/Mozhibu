import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  UserCardComponent,
  UserProfile,
} from '../../shared/components/user-card/user-card.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, UserCardComponent],
  template: `
    <div class="community-container">
      <div class="header">
        <h1>Authors Community</h1>
        <p>Discover and follow talented writers from all around the world.</p>
      </div>

      <div class="authors-grid">
        <app-user-card
          *ngFor="let author of authors"
          [user]="author"
        ></app-user-card>
      </div>
    </div>
  `,
  styles: [
    `
      .community-container {
        max-width: 1240px;
        margin: 0 auto;
        padding: 48px 32px 80px 32px;
      }
      .header {
        margin-bottom: 40px;
        text-align: center;
      }
      .header h1 {
        font-family: var(--display);
        font-size: 32px;
        font-weight: 700;
        color: var(--ink);
        margin-bottom: 12px;
      }
      .header p {
        color: var(--ink-soft);
        font-size: 16px;
      }
      .authors-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 24px;
        justify-items: center;
      }
      @media (max-width: 768px) {
        .community-container {
          padding: 32px 16px 64px 16px;
        }
      }
    `,
  ],
})
export class CommunityComponent implements OnInit {
  private authService = inject(AuthService);
  authors: UserProfile[] = [];

  ngOnInit() {
    this.authService.getAuthors().subscribe({
      next: (res) => {
        const filtered = res.filter((a: any) => a.role !== 'superadmin' && a.username !== 'superadmin');
        let followingIds = new Set<string>();

        // If logged in, fetch following to map isFollowing state
        if (this.authService.user()) {
          this.authService.getFollowing().subscribe((following) => {
            following.forEach((f: any) => followingIds.add(f._id));
            this.mapAuthors(filtered, followingIds);
          });
        } else {
          this.mapAuthors(filtered, followingIds);
        }
      },
      error: (err) => console.error('Failed to load authors', err),
    });
  }

  private mapAuthors(backendAuthors: any[], followingIds: Set<string>) {
    this.authors = backendAuthors.map((a) => ({
      id: a._id,
      name: a.username,
      avatar: a.avatar,
      followers: a.followersCount || 0,
      bio: a.bio,
      isFollowing: followingIds.has(a._id),
    }));
  }
}
