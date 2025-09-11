import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../auth/auth.service';
import { jwtDecode } from 'jwt-decode';

interface Dish {
  id: number;
  name: string;
  price: number;
  categoryName: string;
  description: string;
}

interface Restaurant {
  id: number;
  name: string;
  city?: string;
  street?: string;
  dishes: Dish[];
}

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css'],
})
export class UserDashboardComponent implements OnInit {
  isDarkMode = false;
  restaurants: Restaurant[] = [];
  loading = true;
  errorMessage = '';
  role: 'manager' | 'admin' | '' = '';
  userEmail: string = '';

  currentPage = 1;
  restaurantsPerPage = 3;
  pagedRestaurants: Restaurant[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private cd: ChangeDetectorRef,
    private themeService: ThemeService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.themeService.isDarkMode$.subscribe((mode) => {
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

    this.loadRestaurants();
  }

  toggleTheme() {
    this.themeService.toggle();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  get maxPage(): number {
    return Math.ceil(this.restaurants.length / this.restaurantsPerPage);
  }

  private loadRestaurants() {
    this.http.get<Restaurant[]>('https://localhost:7145/api/restaurant/').subscribe({
      next: (data) => {
        this.restaurants = data;
        this.loading = false;
        this.updatePagedRestaurants();
        this.cd.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to load restaurants';
        this.loading = false;
        this.cd.detectChanges();
      },
    });
  }

  public updatePagedRestaurants() {
    const start = (this.currentPage - 1) * this.restaurantsPerPage;
    const end = start + this.restaurantsPerPage;
    this.pagedRestaurants = this.restaurants.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.maxPage) {
      this.currentPage++;
      this.updatePagedRestaurants();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedRestaurants();
    }
  }

  getDishIcon(categoryName: string): string {
    switch (categoryName?.toLowerCase()) {
      case 'pizza':
        return '🍕';
      case 'pasta':
        return '🍝';
      case 'drinks':
        return '🥤';
      default:
        return '🍴';
    }
  }
}
