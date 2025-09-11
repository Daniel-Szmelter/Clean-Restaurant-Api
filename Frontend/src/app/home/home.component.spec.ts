import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { HomeComponent } from './home.component';
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

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let mockTheme: any;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    mockTheme = {
      isDarkMode$: of(false),
      toggle: jasmine.createSpy('toggle'),
    };
    httpSpy = jasmine.createSpyObj('HttpClient', ['get']);
    httpSpy.get.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: ThemeService, useValue: mockTheme },
        { provide: Router, useValue: routerSpy },
        { provide: HttpClient, useValue: httpSpy },
      ],
    }).compileComponents();

    localStorage.removeItem('token');

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.removeItem('token');
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should subscribe to theme and update isDarkMode + call detectChanges', () => {
    mockTheme.isDarkMode$ = of(true);
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;

    const cdSpy = spyOn((component as any).cd, 'detectChanges').and.callThrough();

    fixture.detectChanges();

    expect(component.isDarkMode).toBeTrue();
    expect(cdSpy).toHaveBeenCalled();
  });

  it('should set isLoggedIn true when token exists', () => {
    localStorage.setItem('token', 'some-token');
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    expect(component.isLoggedIn).toBeTrue();
  });

  it('should set isLoggedIn false when token does not exist', () => {
    localStorage.removeItem('token');
    fixture.detectChanges();

    expect(component.isLoggedIn).toBeFalse();
  });

  it('loadRestaurants (success) should set restaurants, loading=false and update page', () => {
    const restaurants: Restaurant[] = [
      { id: 1, name: 'R1', dishes: [] },
      { id: 2, name: 'R2', dishes: [] },
      { id: 3, name: 'R3', dishes: [] },
      { id: 4, name: 'R4', dishes: [] },
    ];

    httpSpy.get.and.returnValue(of(restaurants));

    fixture = TestBed.createComponent(HomeComponent);
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

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    const cdSpy = spyOn((component as any).cd, 'detectChanges').and.callThrough();

    fixture.detectChanges();

    expect(component.errorMessage).toBe('Failed to load restaurants');
    expect(component.loading).toBeFalse();
    expect(cdSpy).toHaveBeenCalled();
  });

  it('pagination: nextPage and prevPage should update pagedRestaurants and currentPage', () => {
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

  it('maxPage getter should return correct value', () => {
    component.restaurants = Array.from({ length: 7 }).map((_, i) => ({
      id: i + 1,
      name: `R${i + 1}`,
      dishes: [],
    }));
    expect(component.maxPage).toBe(Math.ceil(7 / component.restaurantsPerPage));
  });

  it('getDishIcon should return correct emoji', () => {
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

  it('goToLogin should navigate to /login', () => {
    component.goToLogin();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('goToRegister should navigate to /register', () => {
    component.goToRegister();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/register']);
  });

  it('logout should remove token, set isLoggedIn false and navigate to /login', () => {
    localStorage.setItem('token', 'abc');
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;

    component.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(component.isLoggedIn).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
