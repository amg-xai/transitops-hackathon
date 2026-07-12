import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

export interface LoginResponse {
  message: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private authCheckedSubject = new BehaviorSubject<boolean>(false);
  public authChecked$ = this.authCheckedSubject.asObservable();

  constructor(private api: ApiService) {
    this.checkAuth().subscribe();
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/auth/login/', { username, password }).pipe(
      tap((response) => {
        this.currentUserSubject.next(response.user);
      }),
      finalize(() => {
        this.authCheckedSubject.next(true);
      })
    );
  }

  register(data: any): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/auth/register/', data);
  }

  logout(): Observable<any> {
    return this.api.post('/auth/logout/', {}).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
      }),
      finalize(() => {
        this.authCheckedSubject.next(true);
      })
    );
  }

  getProfile(): Observable<User> {
    return this.api.get<User>('/auth/profile/');
  }

  checkAuth(): Observable<User | null> {
    return this.getProfile().pipe(
      tap((user) => {
        this.currentUserSubject.next(user);
      }),
      catchError(() => {
        this.currentUserSubject.next(null);
        return of(null);
      }),
      finalize(() => {
        this.authCheckedSubject.next(true);
      })
    );
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    return this.currentUserSubject.value?.role === role;
  }
}
