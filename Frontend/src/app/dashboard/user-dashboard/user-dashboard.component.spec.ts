import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { UserDashboardComponent } from './user-dashboard.component';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../auth/auth.service';

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

describe('UserDashboardComponent', () => {
  let component: UserDashboardComponent;
  let fixture: ComponentFixture<UserDashboardComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let mockTheme: any;
  let mockAuth: any;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  const base64 = (s: string) => window.btoa(unescape(encodeURIComponent(s))).replace(/=+$/, '');

  function makeFakeJwt(payloadObj: any) {
    const header = 'h';
    const payload = base64(JSON.stringify(payloadObj));
    return `${header}.${payload}.s`;
  }

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    mockTheme = {
      isDarkMode$: of(false),
      toggle: jasmine.createSpy('toggle'),
    };
    mockAuth = {
      logout: jasmine.createSpy('logout'),
    };
    httpSpy = jasmine.createSpyObj('HttpClient', ['get']);
    httpSpy.get.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [UserDashboardComponent],
      providers: [
        { provide: ThemeService, useValue: mockTheme },
        { provide: AuthService, useValue: mockAuth },
        { provide: Router, useValue: routerSpy },
        { provide: HttpClient, useValue: httpSpy },
      ],
    }).compileComponents();

    localStorage.removeItem('jwt');
    fixture = TestBed.createComponent(UserDashboardComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.removeItem('jwt');
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should subscribe to theme and update isDarkMode + trigger detectChanges', () => {
    mockTheme.isDarkMode$ = of(true);

    fixture = TestBed.createComponent(UserDashboardComponent);
    component = fixture.componentInstance;

    const cdSpy = spyOn((component as any).cd, 'detectChanges').and.callThrough();

    fixture.detectChanges();

    expect(component.isDarkMode).toBeTrue();
    expect(cdSpy).toHaveBeenCalled();
  });

  it('ngOnInit should set userEmail and role for a valid token', () => {
    const payload = { email: 'user@example.com', role: 'manager' };
    const fakeToken = makeFakeJwt(payload);
    localStorage.setItem('jwt', fakeToken);

    fixture.detectChanges();

    expect(component.userEmail).toBe('user@example.com');
    expect(component.role).toBe('manager');
  });

  it('ngOnInit should set empty userEmail and role for an invalid token', () => {
    localStorage.setItem('jwt', 'invalid.token');
    fixture.detectChanges();

    expect(component.userEmail).toBe('');
    expect(component.role).toBe('');
  });

  it('loadRestaurants (success) should set restaurants, loading=false and update page', () => {
    const restaurants: Restaurant[] = [
      { id: 1, name: 'R1', dishes: [] },
      { id: 2, name: 'R2', dishes: [] },
      { id: 3, name: 'R3', dishes: [] },
      { id: 4, name: 'R4', dishes: [] },
    ];

    httpSpy.get.and.returnValue(of(restaurants));

    fixture = TestBed.createComponent(UserDashboardComponent);
    component = fixture.componentInstance;
    const cdSpy = spyOn((component as any).cd, 'detectChanges').and.callThrough();

    fixture.detectChanges();

    expect(component.restaurants).toEqual(restaurants);
    expect(component.loading).toBeFalse();
    expect(component.pagedRestaurants.length).toBe(3);
    expect(cdSpy).toHaveBeenCalled();
  });

  it('loadRestaurants (error) should set errorMessage and loading=false', () => {
    httpSpy.get.and.returnValue(throwError(() => new Error('network')));

    fixture = TestBed.createComponent(UserDashboardComponent);
    component = fixture.componentInstance;
    const cdSpy = spyOn((component as any).cd, 'detectChanges').and.callThrough();

    fixture.detectChanges();

    expect(component.errorMessage).toBe('Failed to load restaurants');
    expect(component.loading).toBeFalse();
    expect(cdSpy).toHaveBeenCalled();
  });

  it('pagination: nextPage and prevPage should work correctly', () => {
    const restaurants: Restaurant[] = Array.from({ length: 7 }).map((_, i) => ({
      id: i + 1,
      name: `R${i + 1}`,
      dishes: [],
    }));

    component.restaurants = restaurants;
    component.currentPage = 1;
    component['updatePagedRestaurants']();

    component.nextPage();
    expect(component.currentPage).toBe(2);
    expect(component.pagedRestaurants).toEqual(restaurants.slice(3, 6));

    component.nextPage();
    expect(component.currentPage).toBe(3);
    expect(component.pagedRestaurants).toEqual(restaurants.slice(6, 9));

    component.prevPage();
    expect(component.currentPage).toBe(2);
  });

  it('maxPage getter should return correct number', () => {
    component.restaurants = Array.from({ length: 7 }).map((_, i) => ({
      id: i + 1,
      name: `R${i + 1}`,
      dishes: [],
    }));
    expect(component.maxPage).toBe(Math.ceil(7 / component.restaurantsPerPage));
  });

  it('getDishIcon should return proper emoji', () => {
    expect(component.getDishIcon('pizza')).toBe('🍕');
    expect(component.getDishIcon('PASTA')).toBe('🍝');
    expect(component.getDishIcon('Drinks')).toBe('🥤');
    expect(component.getDishIcon('other')).toBe('🍴');
    expect(component.getDishIcon('')).toBe('🍴');
  });

  it('toggleTheme should call themeService.toggle', () => {
    component.toggleTheme();
    expect(mockTheme.toggle).toHaveBeenCalled();
  });

  it('logout should call authService.logout and navigate to /login', () => {
    component.logout();
    expect(mockAuth.logout).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], { replaceUrl: true });
  });
});
