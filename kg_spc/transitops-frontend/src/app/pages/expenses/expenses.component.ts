import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FuelService } from '../../services/fuel.service';
import { VehicleService } from '../../services/vehicle.service';
import { ExpenseList } from '../../models/fuel.model';
import { VehicleList } from '../../models/vehicle.model';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    DialogModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    TableModule,
    TagModule,
    InputNumberModule,
    TextareaModule,
    ToastModule,
    ConfirmDialogModule
  ],
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss']
})
export class ExpensesComponent implements OnInit {
  expenses: ExpenseList[] = [];
  vehicles: VehicleList[] = [];
  loading = true;
  displayDialog = false;
  selectedExpense: ExpenseList | null = null;
  categories = ['fuel', 'toll', 'maintenance', 'other'];
  
  newExpense: any = {
    vehicle: null,
    trip: null,
    category: 'other',
    amount: 0,
    description: '',
    date: ''
  };

  constructor(
    private fuelService: FuelService,
    private vehicleService: VehicleService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadExpenses();
    this.loadVehicles();
  }

  loadExpenses(): void {
    this.loading = true;
    this.fuelService.getExpenses().subscribe({
      next: (data) => {
        this.expenses = data;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load expenses'
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

  showDialog(): void {
    this.displayDialog = true;
    this.newExpense = {
      vehicle: null,
      trip: null,
      category: 'other',
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0]
    };
  }

  saveExpense(): void {
    this.fuelService.createExpense(this.newExpense).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Expense created successfully'
        });
        this.displayDialog = false;
        this.loadExpenses();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.detail || 'Failed to create expense'
        });
      }
    });
  }

  deleteExpense(expense: ExpenseList): void {
    this.messageService.clear();
    this.messageService.add({
      key: 'confirm',
      severity: 'warn',
      summary: 'Confirm Delete',
      detail: `Are you sure you want to delete this expense?`,
      sticky: true
    });
  }

  confirmDelete(expense: ExpenseList): void {
    this.fuelService.deleteExpense(expense.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Expense deleted successfully'
        });
        this.loadExpenses();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete expense'
        });
      }
    });
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      fuel: '#3b82f6',
      toll: '#f59e0b',
      maintenance: '#ef4444',
      other: '#6b7280'
    };
    return colors[category] || '#6b7280';
  }

  onGlobalFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
