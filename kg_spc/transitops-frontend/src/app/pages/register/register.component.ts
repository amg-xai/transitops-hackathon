import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    ToastModule
  ]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  roleOptions = [
    { label: 'Fleet Manager', value: 'fleet_manager' },
    { label: 'Driver', value: 'driver' },
    { label: 'Safety Officer', value: 'safety_officer' },
    { label: 'Financial Analyst', value: 'financial_analyst' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirm: ['', [Validators.required]],
      role: ['fleet_manager', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill in all required fields correctly'
      });
      return;
    }

    const password = this.registerForm.get('password')?.value;
    const password_confirm = this.registerForm.get('password_confirm')?.value;

    if (password !== password_confirm) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Passwords do not match'
      });
      return;
    }

    this.loading = true;
    const data = {
      username: this.registerForm.get('username')?.value,
      email: this.registerForm.get('email')?.value,
      first_name: this.registerForm.get('first_name')?.value,
      last_name: this.registerForm.get('last_name')?.value,
      password: password,
      password_confirm: password_confirm,
      role: this.registerForm.get('role')?.value
    };

    this.authService.register(data).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Registration successful. Please login.'
        });
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.detail || 'Registration failed. Please try again.'
        });
        this.loading = false;
      }
    });
  }
}
