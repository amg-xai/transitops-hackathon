import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardKPIs, StatusSummary } from '../../models/dashboard.model';
import { interval, Subscription } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, ProgressBarModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  kpis: DashboardKPIs | null = null;
  vehicleStatusSummary: StatusSummary[] = [];
  driverStatusSummary: StatusSummary[] = [];
  tripStatusSummary: StatusSummary[] = [];
  loading = true;
  private refreshSubscription: Subscription | null = null;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
    // Poll for updates every 30 seconds
    this.refreshSubscription = interval(30000).subscribe(() => {
      this.loadDashboardData();
    });
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  loadDashboardData(): void {
    this.loading = true;
    
    this.dashboardService.getKPIs().subscribe({
      next: (data) => {
        this.kpis = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading KPIs:', error);
        this.loading = false;
      }
    });

    this.dashboardService.getVehicleStatusSummary().subscribe({
      next: (data) => {
        this.vehicleStatusSummary = data;
      }
    });

    this.dashboardService.getDriverStatusSummary().subscribe({
      next: (data) => {
        this.driverStatusSummary = data;
      }
    });

    this.dashboardService.getTripStatusSummary().subscribe({
      next: (data) => {
        this.tripStatusSummary = data;
      }
    });
  }

  getStatusColor(yesstatus: string): string {
    const colors: { [key: string]: string } = {
      available: '#10b981',
      on_trip: '#f59e0b',
      in_shop: '#ef4444',
      retired: '#6b7280',
      draft: '#6b7280',
      dispatched: '#3b82f6',
      completed: '#10b981',
      cancelled: '#ef4444',
      on_duty: '#f59e0b',
      off_duty: '#6b7280',
      suspended: '#ef4444'
    };
    return colors[status] || '#6b7280';
  }

  getStatusLabel(status: string): string {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}
