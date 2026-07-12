import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FuelService } from '../../services/fuel.service';
import { VehicleService } from '../../services/vehicle.service';
import { FuelLogList } from '../../models/fuel.model';
import { VehicleList } from '../../models/vehicle.model';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { TableModule, Table } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-fuel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    TableModule,
    DialogModule,
    InputNumberModule,
    ToastModule,
    ConfirmDialogModule
  ],
  templateUrl: './fuel.component.html',
  styleUrls: ['./fuel.component.scss']
})
export class FuelComponent implements OnInit {
  fuelLogs: FuelLogList[] = [];
  vehicles: VehicleList[] = [];
  loading = true;
  displayDialog = false;
  selectedLog: FuelLogList | null = null;
  
  newLog: any = {
    vehicle: null,
    trip: null,
    liters: 0,
    cost: 0,
    date: ''
  };

  constructor(
    private fuelService: FuelService,
    private vehicleService: VehicleService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadFuelLogs();
    this.loadVehicles();
  }

  loadFuelLogs(): void {
    this.loading = true;
    this.fuelService.getFuelLogs().subscribe({
      next: (data) => {
        this.fuelLogs = data;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load fuel logs'
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
      trip: null,
      liters: 0,
      cost: 0,
      date: new Date().toISOString().split('T')[0]
    };
  }

  saveFuelLog(): void {
    this.fuelService.createFuelLog(this.newLog).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Fuel log created successfully'
        });
        this.displayDialog = false;
        this.loadFuelLogs();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.detail || 'Failed to create fuel log'
        });
      }
    });
  }

  deleteFuelLog(log: FuelLogList): void {
    this.messageService.clear();
    this.messageService.add({
      key: 'confirm',
      severity: 'warn',
      summary: 'Confirm Delete',
      detail: `Are you sure you want to delete this fuel log?`,
      sticky: true
    });
  }

  confirmDelete(log: FuelLogList): void {
    this.fuelService.deleteFuelLog(log.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Fuel log deleted successfully'
        });
        this.loadFuelLogs();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete fuel log'
        });
      }
    });
  }

  onGlobalFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
