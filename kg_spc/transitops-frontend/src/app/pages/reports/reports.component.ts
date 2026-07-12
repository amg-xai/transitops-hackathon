import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';
import { VehicleService } from '../../services/vehicle.service';
import {
  FuelEfficiencyReport,
  OperationalCostReport,
  VehicleROIReport,
  FleetUtilizationReport
} from '../../models/dashboard.model';
import { VehicleList } from '../../models/vehicle.model';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    TableModule,
    TagModule,
    ProgressBarModule,
    ToastModule,
    ConfirmDialogModule
  ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  fuelEfficiencyReport: FuelEfficiencyReport[] = [];
  operationalCostReport: OperationalCostReport[] = [];
  vehicleROIReport: VehicleROIReport[] = [];
  fleetUtilizationReport: FleetUtilizationReport | null = null;
  vehicles: VehicleList[] = [];
  loading = true;
  selectedVehicle: number | null = null;

  constructor(
    private dashboardService: DashboardService,
    private vehicleService: VehicleService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadVehicles();
    this.loadReports();
  }

  loadVehicles(): void {
    this.vehicleService.getVehicles().subscribe({
      next: (data) => {
        this.vehicles = data;
      }
    });
  }

  loadReports(): void {
    this.loading = true;
    this.loadFuelEfficiencyReport();
    this.loadOperationalCostReport();
    this.loadVehicleROIReport();
    this.loadFleetUtilizationReport();
  }

  loadFuelEfficiencyReport(): void {
    this.dashboardService.getFuelEfficiencyReport(this.selectedVehicle || undefined).subscribe({
      next: (data) => {
        this.fuelEfficiencyReport = data;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load fuel efficiency report'
        });
        this.loading = false;
      }
    });
  }

  loadOperationalCostReport(): void {
    this.dashboardService.getOperationalCostReport(this.selectedVehicle || undefined).subscribe({
      next: (data) => {
        this.operationalCostReport = data;
      }
    });
  }

  loadVehicleROIReport(): void {
    this.dashboardService.getVehicleROIReport(this.selectedVehicle || undefined).subscribe({
      next: (data) => {
        this.vehicleROIReport = data;
      }
    });
  }

  loadFleetUtilizationReport(): void {
    this.dashboardService.getFleetUtilizationReport().subscribe({
      next: (data) => {
        this.fleetUtilizationReport = data;
      }
    });
  }

  exportCSV(type: string): void {
    let observable;
    let filename;

    switch (type) {
      case 'vehicles':
        observable = this.dashboardService.exportVehiclesCSV();
        filename = 'vehicles.csv';
        break;
      case 'drivers':
        observable = this.dashboardService.exportDriversCSV();
        filename = 'drivers.csv';
        break;
      case 'trips':
        observable = this.dashboardService.exportTripsCSV();
        filename = 'trips.csv';
        break;
      case 'fuel':
        observable = this.dashboardService.exportFuelLogsCSV();
        filename = 'fuel-logs.csv';
        break;
      case 'expenses':
        observable = this.dashboardService.exportExpensesCSV();
        filename = 'expenses.csv';
        break;
      default:
        return;
    }

    observable.subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `${filename} downloaded successfully`
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to export CSV'
        });
      }
    });
  }

  onVehicleChange(): void {
    this.loadReports();
  }
}
