import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DriverService } from '../../services/driver.service';
import { DriverList } from '../../models/driver.model';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-drivers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    DialogModule,
    TableModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputNumberModule,
    TagModule,
    ProgressBarModule,
    ToastModule,
    ConfirmDialogModule
  ],
  templateUrl: './drivers.component.html',
  styleUrls: ['./drivers.component.scss']
})
export class DriversComponent implements OnInit {
  drivers: DriverList[] = [];
  loading = true;
  displayDialog = false;
  selectedDriver: DriverList | null = null;
  licenseCategories = ['A', 'B', 'C', 'D', 'E'];
  statuses = ['available', 'on_trip', 'off_duty', 'suspended'];
  
  newDriver: any = {
    name: '',
    license_number: '',
    license_category: 'B',
    license_expiry: '',
    contact_number: '',
    safety_score: 5,
    status: 'available'
  };

  constructor(
    private driverService: DriverService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadDrivers();
  }

  loadDrivers(): void {
    this.loading = true;
    this.driverService.getDrivers().subscribe({
      next: (data) => {
        this.drivers = data;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load drivers'
        });
        this.loading = false;
      }
    });
  }

  showDialog(): void {
    this.displayDialog = true;
    this.newDriver = {
      name: '',
      license_number: '',
      license_category: 'B',
      license_expiry: '',
      contact_number: '',
      safety_score: 5,
      status: 'available'
    };
  }

  saveDriver(): void {
    this.driverService.createDriver(this.newDriver).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Driver created successfully'
        });
        this.displayDialog = false;
        this.loadDrivers();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.detail || 'Failed to create driver'
        });
      }
    });
  }

  deleteDriver(driver: DriverList): void {
    this.messageService.clear();
    this.messageService.add({
      key: 'confirm',
      severity: 'warn',
      summary: 'Confirm Delete',
      detail: `Are you sure you want to delete ${driver.name}?`,
      sticky: true
    });
  }

  confirmDelete(driver: DriverList): void {
    this.driverService.deleteDriver(driver.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Driver deleted successfully'
        });
        this.loadDrivers();
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

  viewDriver(driver: DriverList): void {
    this.router.navigate(['/drivers', driver.id]);
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

  onGlobalFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
