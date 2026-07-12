import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MaintenanceService } from '../../services/maintenance.service';
import { VehicleService } from '../../services/vehicle.service';
import { MaintenanceLogList } from '../../models/maintenance.model';
import { VehicleList } from '../../models/vehicle.model';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputNumberModule,
    TableModule,
    TagModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule
  ],
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.scss']
})
export class MaintenanceComponent implements OnInit {
  maintenanceLogs: MaintenanceLogList[] = [];
  vehicles: VehicleList[] = [];
  loading = true;
  displayDialog = false;
  selectedLog: MaintenanceLogList | null = null;
  statuses = ['active', 'closed'];
  
  newLog: any = {
    vehicle: null,
    description: '',
    cost: 0,
    status: 'active',
    start_date: ''
  };

  constructor(
    private maintenanceService: MaintenanceService,
    private vehicleService: VehicleService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadMaintenanceLogs();
    this.loadVehicles();
  }

  loadMaintenanceLogs(): void {
    this.loading = true;
    this.maintenanceService.getMaintenanceLogs().subscribe({
      next: (data) => {
        this.maintenanceLogs = data;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load maintenance logs'
        });
        this.loading = false;
      }
    });
  }

  loadVehicles(): void {
    this.vehicleService.getVehicles().subscribe({
      next: (data) => {
        this.vehicles = data;
      }
    });
  }

  showDialog(): void {
    this.displayDialog = true;
    this.newLog = {
      vehicle: null,
      description: '',
      cost: 0,
      status: 'active',
      start_date: new Date().toISOString().split('T')[0]
    };
  }

  saveMaintenanceLog(): void {
    this.maintenanceService.createMaintenanceLog(this.newLog).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Maintenance log created successfully'
        });
        this.displayDialog = false;
        this.loadMaintenanceLogs();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.detail || 'Failed to create maintenance log'
        });
      }
    });
  }

  closeMaintenanceLog(log: MaintenanceLogList): void {
    this.maintenanceService.closeMaintenanceLog(log.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Maintenance log closed successfully'
        });
        this.loadMaintenanceLogs();
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

  deleteMaintenanceLog(log: MaintenanceLogList): void {
    this.messageService.clear();
    this.messageService.add({
      key: 'confirm',
      severity: 'warn',
      summary: 'Confirm Delete',
      detail: `Are you sure you want to delete this maintenance log?`,
      sticky: true
    });
  }

  confirmDelete(log: MaintenanceLogList): void {
    this.maintenanceService.deleteMaintenanceLog(log.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Maintenance log deleted successfully'
        });
        this.loadMaintenanceLogs();
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

  viewMaintenanceLog(log: MaintenanceLogList): void {
    this.router.navigate(['/maintenance', log.id]);
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      active: '#f59e0b',
      closed: '#10b981'
    };
    return colors[status] || '#6b7280';
  }

  onGlobalFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
