import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TripService } from '../../services/trip.service';
import { VehicleService } from '../../services/vehicle.service';
import { DriverService } from '../../services/driver.service';
import { TripList, TripCompleteData } from '../../models/trip.model';
import { VehicleList } from '../../models/vehicle.model';
import { DriverList } from '../../models/driver.model';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-trips',
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
    TagModule,
    DialogModule,
    InputNumberModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule
  ],
  templateUrl: './trips.component.html',
  styleUrls: ['./trips.component.scss']
})
export class TripsComponent implements OnInit {
  trips: TripList[] = [];
  vehicles: VehicleList[] = [];
  drivers: DriverList[] = [];
  loading = true;
  displayDialog = false;
  displayCompleteDialog = false;
  selectedTrip: TripList | null = null;
  tripStatuses = ['draft', 'dispatched', 'completed', 'cancelled'];
  
  newTrip: any = {
    vehicle: null,
    driver: null,
    source: '',
    destination: '',
    cargo_weight: 0,
    planned_distance: 0
  };

  completeData: TripCompleteData = {
    final_odometer: 0,
    fuel_consumed: 0,
    actual_distance: 0,
    revenue: 0
  };

  constructor(
    private tripService: TripService,
    private vehicleService: VehicleService,
    private driverService: DriverService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadTrips();
    this.loadVehicles();
    this.loadDrivers();
  }

  loadTrips(): void {
    this.loading = true;
    this.tripService.getTrips().subscribe({
      next: (data) => {
        this.trips = data;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load trips'
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

  loadDrivers(): void {
    this.driverService.getDrivers().subscribe({
      next: (data) => {
        this.drivers = data;
      }
    });
  }

  showDialog(): void {
    this.displayDialog = true;
    this.newTrip = {
      vehicle: null,
      driver: null,
      source: '',
      destination: '',
      cargo_weight: 0,
      planned_distance: 0
    };
  }

  saveTrip(): void {
    this.tripService.createTrip(this.newTrip).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Trip created successfully'
        });
        this.displayDialog = false;
        this.loadTrips();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.detail || 'Failed to create trip'
        });
      }
    });
  }

  dispatchTrip(trip: TripList): void {
    this.tripService.dispatchTrip(trip.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Trip dispatched successfully'
        });
        this.loadTrips();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.detail || 'Failed to dispatch trip'
        });
      }
    });
  }

  showCompleteDialog(trip: TripList): void {
    this.selectedTrip = trip;
    this.completeData = {
      final_odometer: 0,
      fuel_consumed: 0,
      actual_distance: 0,
      revenue: 0
    };
    this.displayCompleteDialog = true;
  }

  completeTrip(): void {
    if (this.selectedTrip) {
      this.tripService.completeTrip(this.selectedTrip.id, this.completeData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Trip completed successfully'
          });
          this.displayCompleteDialog = false;
          this.loadTrips();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.detail || 'Failed to complete trip'
          });
        }
      });
    }
  }

  cancelTrip(trip: TripList): void {
    this.tripService.cancelTrip(trip.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Trip cancelled successfully'
        });
        this.loadTrips();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.detail || 'Failed to cancel trip'
        });
      }
    });
  }

  deleteTrip(trip: TripList): void {
    this.messageService.clear();
    this.messageService.add({
      key: 'confirm',
      severity: 'warn',
      summary: 'Confirm Delete',
      detail: `Are you sure you want to delete trip to ${trip.destination}?`,
      sticky: true
    });
  }

  confirmDelete(trip: TripList): void {
    this.tripService.deleteTrip(trip.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Trip deleted successfully'
        });
        this.loadTrips();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete trip'
        });
      }
    });
  }

  viewTrip(trip: TripList): void {
    this.router.navigate(['/trips', trip.id]);
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      draft: '#6b7280',
      dispatched: '#3b82f6',
      completed: '#10b981',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  }

  onGlobalFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
