import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Driver, DriverList } from '../models/driver.model';

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  constructor(private api: ApiService) {}

  getDrivers(params?: any): Observable<DriverList[]> {
    return this.api.get<DriverList[]>('/drivers/', params);
  }

  getDriver(id: number): Observable<Driver> {
    return this.api.get<Driver>(`/drivers/${id}/`);
  }

  createDriver(data: Partial<Driver>): Observable<Driver> {
    return this.api.post<Driver>('/drivers/', data);
  }

  updateDriver(id: number, data: Partial<Driver>): Observable<Driver> {
    return this.api.put<Driver>(`/drivers/${id}/`, data);
  }

  deleteDriver(id: number): Observable<any> {
    return this.api.delete(`/drivers/${id}/`);
  }

  getAvailableDrivers(): Observable<DriverList[]> {
    return this.api.get<DriverList[]>('/drivers/available/');
  }

  getDispatchableDrivers(): Observable<DriverList[]> {
    return this.api.get<DriverList[]>('/drivers/dispatchable/');
  }
}
