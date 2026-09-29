import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import {
  CompetitionService,
  CompetitionConfig,
} from '../../../../core/services/competition.service';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';

@Component({
  selector: 'app-competition-banner',
  standalone: true,
  imports: [CommonModule, TranslatePipe, RouterModule],
  templateUrl: './competition-banner.component.html',
  styleUrls: ['./competition-banner.component.css'],
})
export class CompetitionBannerComponent implements OnInit, OnDestroy {
  private competitionService = inject(CompetitionService);
  authService = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);

  config: CompetitionConfig | null = null;
  showUpgradeModal = signal(false);
  isUpgrading = signal(false);
  showAllWinners = signal(false);

  days = 0;
  hours = 0;
  mins = 0;
  isExpired = false;

  private interval: any;

  ngOnInit(): void {
    this.competitionService.getActiveCompetition().subscribe({
      next: (data) => {
        console.log('DATA:', data); if (data) {
          if (data.isActive) {
            this.config = data;
            this.startCountdown();
          } else if (data.winnerBookIds && data.winnerBookIds.length > 0) {
            this.config = data;
            this.isExpired = true; // Signal that it's no longer a countdown
          } else {
            this.config = null;
          }
        } else {
          this.config = null;
        }
      },
      error: (err) => {
        console.error('Failed to load competition config', err);
      },
    });
  }

  startCountdown() {
    if (!this.config || !this.config.endDate) return;

    const targetDate = new Date(this.config.endDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        this.days = 0;
        this.hours = 0;
        this.mins = 0;
        clearInterval(this.interval);
        this.isExpired = true;
        return;
      }

      this.days = Math.floor(distance / (1000 * 60 * 60 * 24));
      this.hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      this.mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    };

    updateTimer();
    this.interval = setInterval(updateTimer, 60_000);
  }

  isExternalLink(url: string | undefined): boolean {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://');
  }

  handleCtaClick(event: Event) {
    event.preventDefault();

    const user = this.authService.user();

    // If not logged in, route to login
    if (!user) {
      this.router.navigate(['/login']);
      event.preventDefault();
      return;
    }

    // If logged in as reader, redirect to profile with upgrade parameter
    if (user.role === 'reader') {
      this.router.navigate(['/profile'], {
        queryParams: { upgrade: 'competition' }
      });
      return;
    }

    // Otherwise navigate to author studio
    this.router.navigate(['/write']);
  }

  closeUpgradeModal() {
    this.showUpgradeModal.set(false);
    document.body.style.overflow = '';
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
          // Navigate to the competition link
          if (this.config?.buttonLink) {
            const url = this.config.buttonLink.split('?')[0];
            const queryParams = this.getQueryParams(this.config.buttonLink);
            this.router.navigate([url], { queryParams });
          }
        }
        this.isUpgrading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isUpgrading.set(false);
        alert(
          'Failed to upgrade. Please try again or go to your profile settings.',
        );
      },
    });
  }

  getQueryParams(url: string | undefined): any {
    if (!url || !url.includes('?')) return {};
    const queryString = url.split('?')[1];
    const params = new URLSearchParams(queryString);
    const result: any = {};
    params.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  toggleShowAllWinners() {
    this.showAllWinners.set(!this.showAllWinners());
  }

  ngOnDestroy(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}
