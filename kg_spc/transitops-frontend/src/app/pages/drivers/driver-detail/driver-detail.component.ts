import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DriverService } from '../../../services/driver.service';
import { Driver } from '../../../models/driver.model';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-driver-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    ProgressBarModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule
  ],
  templateUrl: './driver-detail.component.html',
  styleUrls: ['./driver-detail.component.scss']
})
export class DriverDetailComponent implements OnInit {
  driver: Driver | null = null;
  loading = true;
  displayEditDialog = false;
  
  editDriver: any = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private driverService: DriverService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDriver(+id);
    }
  }

  loadDriver(id: number): void {
    this.loading = true;
    this.driverService.getDriver(id).subscribe({
      next: (data) => {
        this.driver = data;
        this.editDriver = { ...data };
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load driver details'
        });
        this.loading = false;
      }
    });
  }

  showEditDialog(): void {
    this.displayEditDialog = true;
    this.editDriver = { ...this.driver };
  }

  updateDriver(): void {
    if (this.driver) {
      const driverId = this.driver.id;
      this.driverService.updateDriver(driverId, this.editDriver).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Driver updated successfully'
          });
          this.displayEditDialog = false;
          this.loadDriver(driverId);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.detail || 'Failed to update driver'
          });
        }
      });
    }
  }

  deleteDriver(): void {
    if (this.driver) {
      this.driverService.deleteDriver(this.driver.id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Driver deleted successfully'
          });
          this.router.navigate(['/drivers']);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete driver'
          });
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/drivers']);
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      available: '#10b981',
      on_trip: '#f59e0b',
      off_duty: '#6b7280',
      suspended: '#ef4444'
    };
    return colors[status] || '#6b7280';
  }
}
