import { Component } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

interface Dish {
  id: number;
  name: string;
  price: number;
  categoryName: string;
  description?: string;
}

interface Restaurant {
  id: number;
  name: string;
  city?: string;
  street?: string;
  dishes: Dish[];
}

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-wrapper" [class.dark]="isDarkMode">
      <header class="page-header">
        <div class="header-left"><div class="logo">Update Restaurant</div></div>
        <div class="header-right">
          <nav class="nav-links">
            <div class="theme-switch" (click)="toggleTheme()">
              <div class="switch-track">
                <div class="switch-ball" [class.dark]="isDarkMode">
                  <span class="sun">☀️</span>
                  <span class="moon">🌙</span>
                </div>
              </div>
            </div>
            <button class="nav-btn" (click)="goBack()">⬅ Back</button>
            <button class="nav-btn" (click)="logout()">🔒 Log out</button>
          </nav>
          <span class="user-info">Logged in as {{ userEmail }} (role: {{ role }})</span>
        </div>
      </header>

      <div class="page-content">
        <div *ngIf="loading">Loading restaurants...</div>
        <div *ngIf="errorMessage">{{ errorMessage }}</div>

        <ng-container *ngIf="!loading && !errorMessage">
          <div class="cards-wrapper">
            <ng-container *ngFor="let r of pagedRestaurants">
              <div class="restaurant-card">
                <h3>{{ r.name }}</h3>
                <p *ngIf="r.city || r.street">{{ r.city }}, {{ r.street }}</p>

                <ul>
                  <li *ngFor="let d of r.dishes">
                    <div class="dish-info">
                      <span class="dish-icon">{{ getDishIcon(d.categoryName) }}</span>
                      <div class="dish-text">
                        <span class="dish-name">{{ d.name }}</span>
                        <p class="dish-desc" *ngIf="d.description">{{ d.description }}</p>
                      </div>
                    </div>
                    <span class="price">\${{ d.price }}</span>
                  </li>
                </ul>

                <div class="update-wrapper">
                  <button class="update-btn" (click)="updateRestaurant(r.id)">✏️ Update</button>
                </div>
              </div>
            </ng-container>
          </div>

          <div class="pagination-wrapper">
            <div class="pagination">
              <button class="prev-btn" (click)="prevPage()" [disabled]="currentPage === 1">
                ◀ Prev
              </button>
              <span class="page-indicator">Page {{ currentPage }} / {{ maxPage }}</span>
              <button class="next-btn" (click)="nextPage()" [disabled]="currentPage >= maxPage">
                Next ▶
              </button>
            </div>
          </div>
        </ng-container>
      </div>

      <footer class="page-footer">&copy; 2025 Test</footer>
    </div>
  `,
})
class TestHostComponent {
  isDarkMode = false;
  restaurants: Restaurant[] = [];
  loading = false;
  errorMessage = '';

  currentPage = 1;
  restaurantsPerPage = 3;
  pagedRestaurants: Restaurant[] = [];

  userEmail = 'test@example.com';
  role = 'user';

  lastUpdatedId: number | null = null;

  constructor(private router: Router) {}

  get maxPage(): number {
    return Math.max(1, Math.ceil(this.restaurants.length / this.restaurantsPerPage));
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

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
  }

  updateRestaurant(id: number | undefined) {
    this.lastUpdatedId = id ?? null;
  }

  goBack() {
    this.router.navigate(['/dashboard/admin-panel']);
  }

  logout() {
    this.router.navigate(['/login']);
  }
}

describe('UI integration (basic interactions)', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let router: Router;
  let native: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, RouterTestingModule.withRoutes([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    native = fixture.nativeElement as HTMLElement;
  });

  it('should toggle dark class on wrapper when clicking theme-switch', () => {
    component.isDarkMode = false;
    fixture.detectChanges();

    const wrapper = native.querySelector('.page-wrapper')!;
    expect(wrapper.classList.contains('dark')).toBeFalse();

    const themeSwitch = native.querySelector('.theme-switch') as HTMLElement;
    themeSwitch.click();
    fixture.detectChanges();

    expect(component.isDarkMode).toBeTrue();
    expect(wrapper.classList.contains('dark')).toBeTrue();

    themeSwitch.click();
    fixture.detectChanges();
    expect(component.isDarkMode).toBeFalse();
    expect(wrapper.classList.contains('dark')).toBeFalse();
  });

  it('should render user info with email and role', () => {
    component.userEmail = 'alice@example.com';
    component.role = 'admin';
    fixture.detectChanges();

    const userInfo = native.querySelector('.user-info')!;
    expect(userInfo.textContent).toContain('alice@example.com');
    expect(userInfo.textContent).toContain('admin');
  });

  it('should render restaurants and dish icons, and update button should set lastUpdatedId', () => {
    component.restaurants = [
      {
        id: 1,
        name: 'R1',
        dishes: [
          { id: 10, name: 'Pizza1', price: 10, categoryName: 'pizza', description: 'tasty' },
        ],
      },
      { id: 2, name: 'R2', dishes: [{ id: 11, name: 'Pasta1', price: 12, categoryName: 'pasta' }] },
    ];
    component.currentPage = 1;

    (component as any)['updatePagedRestaurants']();
    fixture.detectChanges();

    const cards = native.querySelectorAll('.restaurant-card');
    expect(cards.length).toBe(2);

    const icons = native.querySelectorAll('.dish-icon');
    expect(icons[0].textContent?.trim()).toBe('🍕');
    expect(icons[1].textContent?.trim()).toBe('🍝');

    const updateBtns = native.querySelectorAll('.update-btn');
    (updateBtns[0] as HTMLElement).click();
    fixture.detectChanges();
    expect(component.lastUpdatedId).toBe(1);
  });

  it('pagination next/prev should update currentPage and pagedRestaurants', () => {
    component.restaurants = Array.from({ length: 7 }).map((_, i) => ({
      id: i + 1,
      name: `R${i + 1}`,
      dishes: [],
    }));
    component.currentPage = 1;
    (component as any)['updatePagedRestaurants']();
    fixture.detectChanges();

    const nextBtn = native.querySelector('.next-btn') as HTMLButtonElement;
    const prevBtn = native.querySelector('.prev-btn') as HTMLButtonElement;
    const pageIndicator = native.querySelector('.page-indicator')!;

    expect(pageIndicator.textContent).toContain('Page 1 / 3');
    expect(prevBtn.disabled).toBeTrue();

    nextBtn.click();
    fixture.detectChanges();
    expect(component.currentPage).toBe(2);
    expect(pageIndicator.textContent).toContain('Page 2 / 3');
    expect(prevBtn.disabled).toBeFalse();

    nextBtn.click();
    fixture.detectChanges();
    expect(component.currentPage).toBe(3);
    expect(pageIndicator.textContent).toContain('Page 3 / 3');
    expect(nextBtn.disabled).toBeTrue();

    prevBtn.click();
    fixture.detectChanges();
    expect(component.currentPage).toBe(2);
    expect(pageIndicator.textContent).toContain('Page 2 / 3');
  });

  it('goBack and logout should navigate to correct routes', () => {
    const navSpy = spyOn(router, 'navigate');
    fixture.detectChanges();

    const backBtn = native.querySelector('.nav-btn') as HTMLButtonElement;
    backBtn.click();
    expect(navSpy).toHaveBeenCalledWith(['/dashboard/admin-panel']);

    const logoutBtn = native.querySelectorAll('.nav-btn')[1] as HTMLButtonElement;
    logoutBtn.click();
    expect(navSpy).toHaveBeenCalledWith(['/login']);
  });
});
