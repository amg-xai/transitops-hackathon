import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { MaintenanceLog, MaintenanceLogList } from '../models/maintenance.model';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {
  constructor(private api: ApiService) {}

  getMaintenanceLogs(params?: any): Observable<MaintenanceLogList[]> {
    return this.api.get<MaintenanceLogList[]>('/maintenance/', params);
  }

  getMaintenanceLog(id: number): Observable<MaintenanceLog> {
    return this.api.get<MaintenanceLog>(`/maintenance/${id}/`);
  }

  createMaintenanceLog(data: Partial<MaintenanceLog>): Observable<MaintenanceLog> {
    return this.api.post<MaintenanceLog>('/maintenance/', data);
  }

  updateMaintenanceLog(id: number, data: Partial<MaintenanceLog>): Observable<MaintenanceLog> {
    return this.api.put<MaintenanceLog>(`/maintenance/${id}/`, data);
  }

  deleteMaintenanceLog(id: number): Observable<any> {
    return this.api.delete(`/maintenance/${id}/`);
  }

  closeMaintenanceLog(id: number): Observable<any> {
    return this.api.post(`/maintenance/${id}/close/`, {});
  }
}
