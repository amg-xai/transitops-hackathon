import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import {
  DashboardKPIs,
  StatusSummary,
  FuelEfficiencyReport,
  OperationalCostReport,
  VehicleROIReport,
  FleetUtilizationReport
} from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private api: ApiService) {}

  getKPIs(params?: any): Observable<DashboardKPIs> {
    return this.api.get<DashboardKPIs>('/kpis/', params);
  }

  getVehicleStatusSummary(): Observable<StatusSummary[]> {
    return this.api.get<StatusSummary[]>('/summary/vehicles/');
  }

  getDriverStatusSummary(): Observable<StatusSummary[]> {
    return this.api.get<StatusSummary[]>('/summary/drivers/');
  }

  getTripStatusSummary(): Observable<StatusSummary[]> {
    return this.api.get<StatusSummary[]>('/summary/trips/');
  }

  getFuelEfficiencyReport(vehicleId?: number): Observable<FuelEfficiencyReport[]> {
    let params = new HttpParams();
    if (vehicleId) {
      params = params.set('vehicle_id', vehicleId.toString());
    }
    return this.api.get<FuelEfficiencyReport[]>('/reports/fuel-efficiency/', params);
  }

  getOperationalCostReport(vehicleId?: number): Observable<OperationalCostReport[]> {
    let params = new HttpParams();
    if (vehicleId) {
      params = params.set('vehicle_id', vehicleId.toString());
    }
    return this.api.get<OperationalCostReport[]>('/reports/operational-cost/', params);
  }

  getVehicleROIReport(vehicleId?: number): Observable<VehicleROIReport[]> {
    let params = new HttpParams();
    if (vehicleId) {
      params = params.set('vehicle_id', vehicleId.toString());
    }
    return this.api.get<VehicleROIReport[]>('/reports/vehicle-roi/', params);
  }

  getFleetUtilizationReport(): Observable<FleetUtilizationReport> {
    return this.api.get<FleetUtilizationReport>('/reports/fleet-utilization/');
  }

  exportVehiclesCSV(): Observable<Blob> {
    return this.api.getCSV('/export/vehicles/');
  }

  exportDriversCSV(): Observable<Blob> {
    return this.api.getCSV('/export/drivers/');
  }

  exportTripsCSV(): Observable<Blob> {
    return this.api.getCSV('/export/trips/');
  }

  exportFuelLogsCSV(): Observable<Blob> {
    return this.api.getCSV('/export/fuel-logs/');
  }

  exportExpensesCSV(): Observable<Blob> {
    return this.api.getCSV('/export/expenses/');
  }
}
