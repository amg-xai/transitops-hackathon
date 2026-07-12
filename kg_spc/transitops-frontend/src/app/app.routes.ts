import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'vehicles', loadComponent: () => import('./pages/vehicles/vehicles.component').then(m => m.VehiclesComponent) },
      { path: 'vehicles/:id', loadComponent: () => import('./pages/vehicles/vehicle-detail/vehicle-detail.component').then(m => m.VehicleDetailComponent) },
      { path: 'drivers', loadComponent: () => import('./pages/drivers/drivers.component').then(m => m.DriversComponent) },
      { path: 'drivers/:id', loadComponent: () => import('./pages/drivers/driver-detail/driver-detail.component').then(m => m.DriverDetailComponent) },
      { path: 'trips', loadComponent: () => import('./pages/trips/trips.component').then(m => m.TripsComponent) },
      { path: 'trips/:id', loadComponent: () => import('./pages/trips/trip-detail/trip-detail.component').then(m => m.TripDetailComponent) },
      { path: 'maintenance', loadComponent: () => import('./pages/maintenance/maintenance.component').then(m => m.MaintenanceComponent) },
      { path: 'maintenance/:id', loadComponent: () => import('./pages/maintenance/maintenance-detail/maintenance-detail.component').then(m => m.MaintenanceDetailComponent) },
      { path: 'fuel', loadComponent: () => import('./pages/fuel/fuel.component').then(m => m.FuelComponent) },
      { path: 'expenses', loadComponent: () => import('./pages/expenses/expenses.component').then(m => m.ExpensesComponent) },
      { path: 'reports', loadComponent: () => import('./pages/reports/reports.component').then(m => m.ReportsComponent) },
    ]
  },
  { path: '**', redirectTo: 'dashboard', pathMatch: 'full' }
];
