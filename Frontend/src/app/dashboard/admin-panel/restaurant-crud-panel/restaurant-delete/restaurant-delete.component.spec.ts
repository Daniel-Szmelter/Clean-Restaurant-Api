import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RestaurantDeleteComponent } from './restaurant-delete.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../../../services/theme.service';
import { AuthService } from '../../../../auth/auth.service';

describe('RestaurantDeleteComponent', () => {
  let component: RestaurantDeleteComponent;
  let fixture: ComponentFixture<RestaurantDeleteComponent>;
  let httpMock: HttpTestingController;

  let themeSubject: BehaviorSubject<boolean>;
  let themeServiceMock: Partial<ThemeService>;
  let cdSpy: Partial<ChangeDetectorRef>;
  let routerMock: Partial<Router>;
  let authServiceMock: Partial<AuthService>;

  const sampleRestaurants = [
    { id: 1, name: 'R1', city: 'C', street: 'S', dishes: [] },
    { id: 2, name: 'R2', city: 'C', street: 'S', dishes: [] },
    { id: 3, name: 'R3', city: 'C', street: 'S', dishes: [] },
    { id: 4, name: 'R4', city: 'C', street: 'S', dishes: [] },
  ];

  beforeEach(() => {
    // <-- kluczowa zmiana: BehaviorSubject z wartością początkową `true`
    themeSubject = new BehaviorSubject<boolean>(true);
    themeServiceMock = {
      isDarkMode$: themeSubject.asObservable(),
      toggle: jasmine.createSpy('toggle'),
    };

    cdSpy = { detectChanges: jasmine.createSpy('detectChanges') };
    routerMock = { navigate: jasmine.createSpy('navigate') };
    authServiceMock = { logout: jasmine.createSpy('logout') };

    TestBed.configureTestingModule({
      imports: [RestaurantDeleteComponent, HttpClientTestingModule, CommonModule],
      providers: [
        { provide: ThemeService, useValue: themeServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ChangeDetectorRef, useValue: cdSpy },
      ],
    });

    fixture = TestBed.createComponent(RestaurantDeleteComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit: decodes JWT token when valid token present', () => {
    const header = { alg: 'none', typ: 'JWT' };
    const payload = { email: 'test@example.com', role: 'admin' };
    const b64url = (obj: any) =>
      btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const token = `${b64url(header)}.${b64url(payload)}.`;
    localStorage.setItem('jwt', token);

    fixture.detectChanges();

    const req = httpMock.expectOne('https://localhost:7145/api/restaurant/');
    req.flush(sampleRestaurants);

    expect(component.userEmail).toBe('test@example.com');
    expect(component.role).toBe('admin');
  });

  it('ngOnInit: invalid jwt -> sets empty email/role', () => {
    localStorage.setItem('jwt', 'invalid-token');

    fixture.detectChanges();

    const req = httpMock.expectOne('https://localhost:7145/api/restaurant/');
    req.flush(sampleRestaurants);

    expect(component.userEmail).toBe('');
    expect(component.role).toBe('');
  });

  it('loadRestaurants: error sets errorMessage and loading false', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne('https://localhost:7145/api/restaurant/');
    req.error(new ProgressEvent('fail'));

    expect(component.errorMessage).toBe('Failed to load restaurants');
    expect(component.loading).toBeFalse();
  });

  it('maxPage computed correctly', () => {
    component.restaurants = new Array(7)
      .fill(null)
      .map((_, i) => ({ id: i + 1, name: `r${i}`, dishes: [] }));
    component.restaurantsPerPage = 3;
    expect(component.maxPage).toBe(Math.ceil(7 / 3));
  });

  it('pagination: nextPage and prevPage update pagedRestaurants', () => {
    component.restaurants = sampleRestaurants.slice();
    component.restaurantsPerPage = 3;
    component.updatePagedRestaurants();
    expect(component.pagedRestaurants.length).toBe(3);

    component.currentPage = 1;
    component.nextPage();
    expect(component.currentPage).toBe(2);
    expect(component.pagedRestaurants.length).toBe(1);

    component.prevPage();
    expect(component.currentPage).toBe(1);
  });

  it('toggleTheme calls themeService.toggle', () => {
    component.toggleTheme();
    expect((themeServiceMock.toggle as jasmine.Spy).calls.any()).toBeTrue();
  });

  it('logout calls authService.logout and navigates to /login', () => {
    component.logout();
    expect((authServiceMock.logout as jasmine.Spy).calls.any()).toBeTrue();
    expect((routerMock.navigate as jasmine.Spy).calls.first().args[0]).toEqual(['/login']);
  });

  it('goBack navigates to admin restaurant route', () => {
    component.goBack();
    expect((routerMock.navigate as jasmine.Spy).calls.first().args[0]).toEqual([
      '/dashboard/admin-panel/restaurant',
    ]);
  });

  it('deleteRestaurant with undefined id shows alert and does not call delete', () => {
    spyOn(window, 'alert');
    component.deleteRestaurant(undefined);
    expect(window.alert).toHaveBeenCalledWith('Restaurant ID is missing!');
  });

  it('deleteRestaurant success: removes restaurant, shows toast and hides after timeout', fakeAsync(() => {
    component.restaurants = sampleRestaurants.slice();
    component.updatePagedRestaurants();

    spyOn(window, 'confirm').and.returnValue(true);

    component.deleteRestaurant(2);

    const req = httpMock.expectOne('https://localhost:7145/api/restaurant/2');
    expect(req.request.method).toBe('DELETE');
    req.flush({});

    expect(component.restaurants.find((r) => r.id === 2)).toBeUndefined();
    expect(component.toastMessage).toBe('Restaurant deleted successfully!');
    expect(component.showToast).toBeTrue();

    tick(3000);
    expect(component.showToast).toBeFalse();
  }));

  it('deleteRestaurant error shows alert', fakeAsync(() => {
    component.restaurants = sampleRestaurants.slice();
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');

    component.deleteRestaurant(1);

    const req = httpMock.expectOne('https://localhost:7145/api/restaurant/1');
    expect(req.request.method).toBe('DELETE');
    req.error(new ProgressEvent('error'));

    expect(window.alert).toHaveBeenCalledWith('Failed to delete restaurant');
  }));

  it('getDishIcon returns correct emojis', () => {
    expect(component.getDishIcon('pizza')).toBe('🍕');
    expect(component.getDishIcon('Pasta')).toBe('🍝');
    expect(component.getDishIcon('drinks')).toBe('🥤');
    expect(component.getDishIcon('unknown')).toBe('🍴');
  });
});
