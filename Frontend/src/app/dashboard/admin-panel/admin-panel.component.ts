import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css'],
})
export class AdminPanelComponent implements OnInit {
  isDarkMode = false;
  role: 'manager' | 'admin' | '' = '';
  userEmail: string = '';

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private cd: ChangeDetectorRef,
    private authService: AuthService,
  ) {}
  ngOnInit() {
    this.themeService.isDarkMode$.subscribe((mode: boolean) => {
      this.isDarkMode = mode;
      this.cd.detectChanges();
    });

    const token = localStorage.getItem('jwt');
    if (!token) {
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }

    try {
      const decoded: any = jwtDecode(token);

      this.userEmail = decoded['email'] || '';
      this.role = decoded['role'] || '';
    } catch {
      localStorage.removeItem('jwt');
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }

  get roleDisplay(): string {
    if (!this.role) return '';
    return this.role.charAt(0).toUpperCase() + this.role.slice(1);
  }

  toggleTheme() {
    this.themeService.toggle();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  manageRestaurants() {
    this.router.navigate(['/dashboard/admin-panel/restaurant']);
  }
  manageCategories() {
    this.router.navigate(['/dashboard/admin-panel/category']);
  }

  manageUsers() {
    this.router.navigate(['/dashboard/admin-panel/user']);
  }
}
