import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { HttpClientModule } from '@angular/common/http';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-payouts',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './payouts.component.html',
  styleUrls: ['./payouts.component.css']
})
export class PayoutsComponent implements OnInit {
  private api = inject(ApiService);
  private confirm = inject(ConfirmService);

  payouts = signal<any[]>([]);
  loading = signal(true);
  processingId = signal<string | null>(null);

  currentPage = signal(1);
  itemsPerPage = 10;

  paginatedPayouts = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return this.payouts().slice(startIndex, startIndex + this.itemsPerPage);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.payouts().length / this.itemsPerPage)));

  ngOnInit(): void {
    this.loadPayouts();
  }

  loadPayouts() {
    this.loading.set(true);
    this.api.get('/admin/payouts').subscribe({
      next: (res: any) => {
        this.payouts.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
      }
    });
  }

  markAsPaid(userPayout: any) {
    this.confirm.confirm(
      'Confirm Wire Transfer',
      `Have you successfully wired ${userPayout.totalRequestedDisplay} to ${userPayout.user.name}'s bank account?\n\nAn email will automatically be sent to the user upon confirmation.`,
      false,
      'Yes, Mark as Paid',
      'Cancel'
    ).subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.processingId.set(userPayout.user._id);
        this.api.post(`/admin/payouts/${userPayout.user._id}/mark-paid`, {}).subscribe({
          next: () => {
            // Remove the user from the list
            this.payouts.set(this.payouts().filter((p) => p.user._id !== userPayout.user._id));
            this.processingId.set(null);
          },
          error: (err) => {
            console.error(err);
            alert('Failed to process payout.');
            this.processingId.set(null);
          }
        });
      }
    });
  }
}
