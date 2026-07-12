import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../services/auth.service';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    MenuModule,
    AvatarModule
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  isSidebarCollapsed = false;
  isDarkMode = false;

  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/dashboard'] },
    { label: 'Vehicles', icon: 'pi pi-truck', routerLink: ['/vehicles'] },
    { label: 'Drivers', icon: 'pi pi-users', routerLink: ['/drivers'] },
    { label: 'Trips', icon: 'pi pi-map', routerLink: ['/trips'] },
    { label: 'Maintenance', icon: 'pi pi-wrench', routerLink: ['/maintenance'] },
    { label: 'Fuel Logs', icon: 'pi pi-gas-pump', routerLink: ['/fuel'] },
    { label: 'Expenses', icon: 'pi pi-wallet', routerLink: ['/expenses'] },
    { label: 'Reports', icon: 'pi pi-chart-bar', routerLink: ['/reports'] },
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.loadTheme();
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    this.saveTheme();
  }

  private saveTheme(): void {
    localStorage.setItem('darkMode', this.isDarkMode.toString());
    document.documentElement.classList.toggle('p-dark-mode', this.isDarkMode);
  }

  private loadTheme(): void {
    const saved = localStorage.getItem('darkMode');
    this.isDarkMode = saved === 'true';
    document.documentElement.classList.toggle('p-dark-mode', this.isDarkMode);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      }
    });
  }

  get currentUser() {
    return this.authService.getCurrentUser();
  }
}
