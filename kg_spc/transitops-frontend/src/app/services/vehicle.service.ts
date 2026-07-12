import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Vehicle, VehicleList } from '../models/vehicle.model';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  constructor(private api: ApiService) {}

  getVehicles(params?: any): Observable<VehicleList[]> {
    return this.api.get<VehicleList[]>('/vehicles/', params);
  }

  getVehicle(id: number): Observable<Vehicle> {
    return this.api.get<Vehicle>(`/vehicles/${id}/`);
  }

  createVehicle(data: Partial<Vehicle>): Observable<Vehicle> {
    return this.api.post<Vehicle>('/vehicles/', data);
  }

  updateVehicle(id: number, data: Partial<Vehicle>): Observable<Vehicle> {
    return this.api.put<Vehicle>(`/vehicles/${id}/`, data);
  }

  deleteVehicle(id: number): Observable<any> {
    return this.api.delete(`/vehicles/${id}/`);
  }

  getAvailableVehicles(): Observable<VehicleList[]> {
    return this.api.get<VehicleList[]>('/vehicles/available/');
  }

  getDispatchableVehicles(): Observable<VehicleList[]> {
    return this.api.get<VehicleList[]>('/vehicles/dispatchable/');
  }
}
