import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ThemeService } from '../../../../services/theme.service';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../../../../auth/auth.service';

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
  selector: 'app-update-restaurant',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './restaurant-update.component.html',
  styleUrls: ['./restaurant-update.component.css'],
})
export class RestaurantUpdateComponent implements OnInit {
  isDarkMode = false;
  restaurants: Restaurant[] = [];
  loading = true;
  userEmail: string = '';
  role: string = '';
  errorMessage = '';

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

    this.loadRestaurants();

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

  toggleTheme() {
    this.themeService.toggle();
  }

  get maxPage(): number {
    return Math.ceil(this.restaurants.length / this.restaurantsPerPage);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  goBack() {
    this.router.navigate(['/dashboard/admin-panel/restaurant']);
  }

  private loadRestaurants() {
    this.http.get<Restaurant[]>('https://localhost:7145/api/restaurant/').subscribe({
      next: (data) => {
        console.log('Restaurants loaded:', data);
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

  updateRestaurant(id: number | undefined) {
    console.log('ID to update:', id);
    if (id == null) {
      alert('Restaurant ID is missing!');
      return;
    }
    this.router.navigate(['/dashboard/admin-panel/restaurant/update', id]);
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
