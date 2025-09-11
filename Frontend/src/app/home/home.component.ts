import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ThemeService } from '../services/theme.service';

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
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  isDarkMode = false;
  restaurants: Restaurant[] = [];
  loading = true;
  errorMessage = '';

  currentPage = 1;
  restaurantsPerPage = 3;
  pagedRestaurants: Restaurant[] = [];

  isLoggedIn = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cd: ChangeDetectorRef,
    private themeService: ThemeService,
  ) {}

  ngOnInit() {
    this.themeService.isDarkMode$.subscribe((mode) => {
      this.isDarkMode = mode;
      this.cd.detectChanges();
    });

    this.isLoggedIn = !!localStorage.getItem('token');

    this.loadRestaurants();
  }

  toggleTheme() {
    this.themeService.toggle();
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  logout() {
    localStorage.removeItem('token');
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
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

  private updatePagedRestaurants() {
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
