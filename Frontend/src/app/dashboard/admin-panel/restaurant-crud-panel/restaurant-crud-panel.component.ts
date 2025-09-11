import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../../services/theme.service';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-restaurant-crud-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './restaurant-crud-panel.component.html',
  styleUrls: ['./restaurant-crud-panel.component.css'],
})
export class RestaurantCrudPanelComponent implements OnInit {
  isDarkMode = false;
  userEmail: string = '';
  role: string = '';

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

  goBack() {
    this.router.navigate(['/dashboard/admin-panel']);
  }

  toggleTheme() {
    this.themeService.toggle();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  createRestaurant() {
    this.router.navigate(['/dashboard/admin-panel/restaurant/create']);
  }
  updateRestaurant() {
    this.router.navigate([`/dashboard/admin-panel/restaurant/update`]);
  }
  deleteRestaurant() {
    this.router.navigate(['/dashboard/admin-panel/restaurant/delete']);
  }
}
