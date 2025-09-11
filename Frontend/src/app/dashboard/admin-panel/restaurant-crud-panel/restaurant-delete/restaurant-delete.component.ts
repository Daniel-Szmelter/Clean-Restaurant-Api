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
  selector: 'app-delete-restaurant',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './restaurant-delete.component.html',
  styleUrls: ['./restaurant-delete.component.css'],
})
export class RestaurantDeleteComponent implements OnInit {
  isDarkMode = false;
  restaurants: Restaurant[] = [];
  userEmail: string = '';
  role: string = '';
  loading = true;
  errorMessage = '';
  showToast = false;
  toastMessage = '';

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

  private showSuccessToast(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }

  deleteRestaurant(id: number | undefined) {
    if (!id) {
      alert('Restaurant ID is missing!');
      return;
    }

    if (!confirm('Are you sure you want to delete this restaurant?')) return;

    this.http.delete(`https://localhost:7145/api/restaurant/${id}`).subscribe({
      next: () => {
        this.restaurants = this.restaurants.filter((r) => r.id !== id);
        this.updatePagedRestaurants();
        this.cd.detectChanges();
        this.showSuccessToast('Restaurant deleted successfully!');
      },
      error: () => alert('Failed to delete restaurant'),
    });
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
