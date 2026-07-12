import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Trip, TripList, TripCompleteData } from '../models/trip.model';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  constructor(private api: ApiService) {}

  getTrips(params?: any): Observable<TripList[]> {
    return this.api.get<TripList[]>('/trips/', params);
  }

  getTrip(id: number): Observable<Trip> {
    return this.api.get<Trip>(`/trips/${id}/`);
  }

  createTrip(data: Partial<Trip>): Observable<Trip> {
    return this.api.post<Trip>('/trips/', data);
  }

  updateTrip(id: number, data: Partial<Trip>): Observable<Trip> {
    return this.api.put<Trip>(`/trips/${id}/`, data);
  }

  deleteTrip(id: number): Observable<any> {
    return this.api.delete(`/trips/${id}/`);
  }

  dispatchTrip(id: number): Observable<any> {
    return this.api.post(`/trips/${id}/dispatch/`, {});
  }

  completeTrip(id: number, data: TripCompleteData): Observable<any> {
    return this.api.post(`/trips/${id}/complete/`, data);
  }

  cancelTrip(id: number): Observable<any> {
    return this.api.post(`/trips/${id}/cancel/`, {});
  }
}
