import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../../services/theme.service';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-user-crud-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-crud-panel.component.html',
  styleUrls: ['./user-crud-panel.component.css'],
})
export class UserCrudPanelComponent implements OnInit {
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
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        this.userEmail = decoded['email'] || '';
        this.role = decoded['role'] || '';
      } catch {
        this.userEmail = '';
        this.role = '';
        localStorage.removeItem('jwt');
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    } else {
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

  createUser() {
    this.router.navigate(['/dashboard/admin-panel/user/create']);
  }

  updateUser() {
    this.router.navigate(['/dashboard/admin-panel/user/update']);
  }

  deleteUser() {
    this.router.navigate(['/dashboard/admin-panel/user/delete']);
  }
}
