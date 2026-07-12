import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TripService } from '../../../services/trip.service';
import { Trip } from '../../../models/trip.model';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-trip-detail',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    ProgressBarModule,
    TagModule,
    ToastModule
  ],
  templateUrl: './trip-detail.component.html',
  styleUrls: ['./trip-detail.component.scss']
})
export class TripDetailComponent implements OnInit {
  trip: Trip | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tripService: TripService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTrip(+id);
    }
  }

  loadTrip(id: number): void {
    this.loading = true;
    this.tripService.getTrip(id).subscribe({
      next: (data) => {
        this.trip = data;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load trip details'
        });
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/trips']);
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      draft: '#6b7280',
      dispatched: '#3b82f6',
      completed: '#10b981',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  }
}
