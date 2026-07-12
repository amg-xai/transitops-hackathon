import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { VehicleService } from '../../services/vehicle.service';
import { VehicleList } from '../../models/vehicle.model';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    TableModule,
    TagModule,
    DialogModule,
    InputNumberModule,
    ToastModule,
    ConfirmDialogModule
  ],
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.scss']
})
export class VehiclesComponent implements OnInit {
  vehicles: VehicleList[] = [];
  loading = true;
  displayDialog = false;
  selectedVehicle: VehicleList | null = null;
  vehicleTypes = ['van', 'truck', 'bus', 'car', 'motorcycle'];
  statuses = ['available', 'on_trip', 'in_shop', 'retired'];
  regions = ['North', 'South', 'East', 'West', 'Central'];
  newVehicleForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.newVehicleForm = this.fb.group({
      registration_number: ['', [Validators.required]],
      name: ['', [Validators.required]],
      vehicle_type: ['van', [Validators.required]],
      max_load_capacity: [0, [Validators.required, Validators.min(0)]],
      odometer: [0, [Validators.required, Validators.min(0)]],
      acquisition_cost: [0, [Validators.required, Validators.min(0)]],
      status: ['available', [Validators.required]],
      region: ['North', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.loading = true;
    this.vehicleService.getVehicles().subscribe({
      next: (data) => {
        this.vehicles = data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load vehicles'
        });
        this.loading = false;
      }
    });
  }

  showDialog(): void {
    this.displayDialog = true;
    this.newVehicleForm.reset({
      registration_number: '',
      name: '',
      vehicle_type: 'van',
      max_load_capacity: 0,
      odometer: 0,
      acquisition_cost: 0,
      status: 'available',
      region: 'North'
    });
  }

  saveVehicle(): void {
    if (this.newVehicleForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please complete all required fields.'
      });
      return;
    }

    this.vehicleService.createVehicle(this.newVehicleForm.value).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Vehicle created successfully'
        });
        this.displayDialog = false;
        this.loadVehicles();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.detail || 'Failed to create vehicle'
        });
      }
    });
  }

  deleteVehicle(vehicle: VehicleList): void {
    this.messageService.clear();
    this.messageService.add({
      key: 'confirm',
      severity: 'warn',
      summary: 'Confirm Delete',
      detail: `Are you sure you want to delete ${vehicle.registration_number}?`,
      sticky: true
    });
  }

  confirmDelete(vehicle: VehicleList): void {
    this.vehicleService.deleteVehicle(vehicle.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Vehicle deleted successfully'
        });
        this.loadVehicles();
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

  viewVehicle(vehicle: VehicleList): void {
    this.router.navigate(['/vehicles', vehicle.id]);
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

  onGlobalFilter(table: any, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
