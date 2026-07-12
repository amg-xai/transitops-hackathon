import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { FuelLog, FuelLogList, Expense, ExpenseList } from '../models/fuel.model';

@Injectable({
  providedIn: 'root'
})
export class FuelService {
  constructor(private api: ApiService) {}

  getFuelLogs(params?: any): Observable<FuelLogList[]> {
    return this.api.get<FuelLogList[]>('/fueling/fuel/', params);
  }

  getFuelLog(id: number): Observable<FuelLog> {
    return this.api.get<FuelLog>(`/fueling/fuel/${id}/`);
  }

  createFuelLog(data: Partial<FuelLog>): Observable<FuelLog> {
    return this.api.post<FuelLog>('/fueling/fuel/', data);
  }

  updateFuelLog(id: number, data: Partial<FuelLog>): Observable<FuelLog> {
    return this.api.put<FuelLog>(`/fueling/fuel/${id}/`, data);
  }

  deleteFuelLog(id: number): Observable<any> {
    return this.api.delete(`/fueling/fuel/${id}/`);
  }

  getExpenses(params?: any): Observable<ExpenseList[]> {
    return this.api.get<ExpenseList[]>('/fueling/expenses/', params);
  }

  getExpense(id: number): Observable<Expense> {
    return this.api.get<Expense>(`/fueling/expenses/${id}/`);
  }

  createExpense(data: Partial<Expense>): Observable<Expense> {
    return this.api.post<Expense>('/fueling/expenses/', data);
  }

  updateExpense(id: number, data: Partial<Expense>): Observable<Expense> {
    return this.api.put<Expense>(`/fueling/expenses/${id}/`, data);
  }

  deleteExpense(id: number): Observable<any> {
    return this.api.delete(`/fueling/expenses/${id}/`);
  }

  getExpensesByVehicle(vehicleId: number): Observable<any> {
    const params = new HttpParams().set('vehicle_id', vehicleId.toString());
    return this.api.get('/fueling/expenses/by_vehicle/', params);
  }
}
