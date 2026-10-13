import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from '../../../../../environments/environment';

interface Author {
  id: string;
  initials: string;
  avatar?: string;
  isPremium?: boolean;
  name: string;
  followers: string;
  color: string;
  following: boolean;
}

const COLORS = [
  '#fbbc04',
  '#ea4335',
  '#34a853',
  '#4285f4',
  '#ff6d00',
  '#9c27b0',
];

@Component({
  selector: 'app-authors',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './authors.component.html',
  styleUrls: ['./authors.component.css'],
})
export class AuthorsComponent implements OnInit {
  private authService = inject(AuthService);
  authors = signal<Author[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.authService.getAuthors().subscribe({
      next: (data) => {
        const mapped = data
          .filter((a: any) => a.role !== 'superadmin' && a.username !== 'superadmin')
          .slice(0, 5)
          .map((a: any, i: number) => {
          const name = a.username || 'Unknown';
          const initials = name.substring(0, 2).toUpperCase();
          const followers = a.followersCount
            ? `${(a.followersCount / 1000).toFixed(1)}K`
            : '0';
          
          let avatarUrl = '';
          if (a.avatar) {
            avatarUrl = a.avatar.startsWith('http') || a.avatar.startsWith('data:') 
              ? a.avatar 
              : `${environment.apiUrl.replace('/api', '')}${a.avatar.startsWith('/') ? '' : '/'}${a.avatar}`;
          }

          return {
            id: a._id,
            initials,
            avatar: avatarUrl,
            isPremium: a.isPremium || false,
            name,
            followers,
            color: COLORS[i % COLORS.length],
            following: false,
          };
        });
        this.authors.set(mapped);
        this.isLoading.set(false);

        if (this.authService.user()) {
          this.authService.getFollowing().subscribe({
            next: (followingList) => {
              const followingIds = new Set(followingList.map((f: any) => f._id));
              this.authors.update(list => list.map(a => ({
                ...a,
                following: followingIds.has(a.id)
              })));
            },
            error: (err) => console.error('Failed to load following list', err)
          });
        }
      },
      error: (err) => {
        console.error('Failed to load authors', err);
        this.isLoading.set(false);
      },
    });
  }

  toggleFollow(index: number): void {
    const author = this.authors()[index];
    if (!author) return;

    // Toggle locally for instant feedback
    this.authors.update((list) =>
      list.map((a, i) => (i === index ? { ...a, following: !a.following } : a)),
    );

    // Call API if logged in
    if (this.authService.user()) {
      this.authService.followAuthor(author.id).subscribe({
        error: () => {
          // Revert if API fails
          this.authors.update((list) =>
            list.map((a, i) =>
              i === index ? { ...a, following: !a.following } : a,
            ),
          );
        },
      });
    }
  }
}
