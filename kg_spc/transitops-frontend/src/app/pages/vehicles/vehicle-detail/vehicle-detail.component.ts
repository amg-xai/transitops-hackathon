import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VehicleService } from '../../../services/vehicle.service';
import { Vehicle } from '../../../models/vehicle.model';
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
  selector: 'app-vehicle-detail',
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
  templateUrl: './vehicle-detail.component.html',
  styleUrls: ['./vehicle-detail.component.scss']
})
export class VehicleDetailComponent implements OnInit {
  vehicle: Vehicle | null = null;
  loading = true;
  displayEditDialog = false;
  
  editVehicle: any = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vehicleService: VehicleService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadVehicle(+id);
    }
  }

  loadVehicle(id: number): void {
    this.loading = true;
    this.vehicleService.getVehicle(id).subscribe({
      next: (data) => {
        this.vehicle = data;
        this.editVehicle = { ...data };
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load vehicle details'
        });
        this.loading = false;
      }
    });
  }

  showEditDialog(): void {
    this.displayEditDialog = true;
    this.editVehicle = { ...this.vehicle };
  }

  updateVehicle(): void {
    if (this.vehicle) {
      const vehicleId = this.vehicle.id;
      this.vehicleService.updateVehicle(vehicleId, this.editVehicle).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Vehicle updated successfully'
          });
          this.displayEditDialog = false;
          this.loadVehicle(vehicleId);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.detail || 'Failed to update vehicle'
          });
        }
      });
    }
  }

  deleteVehicle(): void {
    if (this.vehicle) {
      this.vehicleService.deleteVehicle(this.vehicle.id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Vehicle deleted successfully'
          });
          this.router.navigate(['/vehicles']);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete vehicle'
          });
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/vehicles']);
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      available: '#10b981',
      on_trip: '#f59e0b',
      in_shop: '#ef4444',
      retired: '#6b7280'
    };
    return colors[status] || '#6b7280';
  }
}
