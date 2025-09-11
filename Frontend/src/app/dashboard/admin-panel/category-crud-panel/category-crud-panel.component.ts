import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../../services/theme.service';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-category-crud-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-crud-panel.component.html',
  styleUrls: ['./category-crud-panel.component.css'],
})
export class CategoryCrudPanelComponent implements OnInit {
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
      }
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

  createCategory() {
    this.router.navigate(['/dashboard/admin-panel/category/create']);
  }

  updateCategory() {
    this.router.navigate(['/dashboard/admin-panel/category/update']);
  }

  deleteCategory() {
    this.router.navigate(['/dashboard/admin-panel/category/delete']);
  }
}
