import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MaintenanceService } from '../../../services/maintenance.service';
import { MaintenanceLog } from '../../../models/maintenance.model';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-maintenance-detail',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    ProgressBarModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule
  ],
  templateUrl: './maintenance-detail.component.html',
  styleUrls: ['./maintenance-detail.component.scss']
})
export class MaintenanceDetailComponent implements OnInit {
  log: MaintenanceLog | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private maintenanceService: MaintenanceService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadMaintenanceLog(+id);
    }
  }

  loadMaintenanceLog(id: number): void {
    this.loading = true;
    this.maintenanceService.getMaintenanceLog(id).subscribe({
      next: (data) => {
        this.log = data;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load maintenance log details'
        });
        this.loading = false;
      }
    });
  }

  closeMaintenanceLog(): void {
    if (this.log) {
      const logId = this.log.id;
      this.maintenanceService.closeMaintenanceLog(logId).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Maintenance log closed successfully'
          });
          this.loadMaintenanceLog(logId);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.detail || 'Failed to close maintenance log'
          });
        }
      });
    }
  }

  deleteMaintenanceLog(): void {
    if (this.log) {
      this.maintenanceService.deleteMaintenanceLog(this.log.id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Maintenance log deleted successfully'
          });
          this.router.navigate(['/maintenance']);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete maintenance log'
          });
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/maintenance']);
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      active: '#f59e0b',
      closed: '#10b981'
    };
    return colors[status] || '#6b7280';
  }
}
