import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { RestaurantUpdateComponent } from './restaurant-update.component';
import { ThemeService } from '../../../../services/theme.service';
import { AuthService } from '../../../../auth/auth.service';

class RouterStub {
  navigate = jasmine.createSpy('navigate');
}

class ThemeServiceStub {
  isDarkMode$ = new BehaviorSubject<boolean>(false);
  toggle = jasmine.createSpy('toggle');
}

class AuthServiceStub {
  logout = jasmine.createSpy('logout');
}

function makeJwt(payload: object) {
  const header = btoa(JSON.stringify({ alg: 'none' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.`;
}

describe('RestaurantUpdateComponent', () => {
  let fixture: ComponentFixture<RestaurantUpdateComponent>;
  let component: RestaurantUpdateComponent;
  let httpMock: HttpTestingController;
  let routerStub: RouterStub;
  let themeStub: ThemeServiceStub;
  let authStub: AuthServiceStub;

  beforeEach(async () => {
    routerStub = new RouterStub();
    themeStub = new ThemeServiceStub();
    authStub = new AuthServiceStub();

    await TestBed.configureTestingModule({
      imports: [RestaurantUpdateComponent, HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: routerStub },
        { provide: ThemeService, useValue: themeStub },
        { provide: AuthService, useValue: authStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RestaurantUpdateComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    localStorage.removeItem('jwt');
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('jwt');
  });

  it('should create and load restaurants (success path)', fakeAsync(() => {
    fixture.detectChanges();

    const req = httpMock.expectOne('https://localhost:7145/api/restaurant/');
    expect(req.request.method).toBe('GET');

    req.flush([
      { id: 1, name: 'R1', dishes: [] },
      { id: 2, name: 'R2', dishes: [] },
      { id: 3, name: 'R3', dishes: [] },
      { id: 4, name: 'R4', dishes: [] },
    ]);

    tick();
    fixture.detectChanges();

    expect(component.restaurants.length).toBe(4);
    expect(component.loading).toBeFalse();
    expect(component.pagedRestaurants.length).toBeGreaterThan(0);
    expect(component.maxPage).toBe(Math.ceil(4 / component.restaurantsPerPage));
  }));

  it('should set errorMessage on load error', fakeAsync(() => {
    fixture.detectChanges();

    const req = httpMock.expectOne('https://localhost:7145/api/restaurant/');
    req.error(new ProgressEvent('error'));

    tick();
    fixture.detectChanges();

    expect(component.errorMessage).toBe('Failed to load restaurants');
    expect(component.loading).toBeFalse();
  }));

  it('should read token from localStorage', () => {
    const token = makeJwt({ email: 'owner@x.com', role: 'manager' });
    localStorage.setItem('jwt', token);

    fixture.detectChanges();
    const req = httpMock.expectOne('https://localhost:7145/api/restaurant/');
    req.flush([]);

    expect(component.userEmail).toBe('owner@x.com');
    expect(component.role).toBe('manager');
  });

  it('toggleTheme calls themeService.toggle and goBack navigates', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('https://localhost:7145/api/restaurant/');
    req.flush([]);

    component.toggleTheme();
    expect(themeStub.toggle).toHaveBeenCalled();

    component.goBack();
    expect(routerStub.navigate).toHaveBeenCalledWith(['/dashboard/admin-panel/restaurant']);
  });

  it('logout calls authService.logout and navigates to login', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('https://localhost:7145/api/restaurant/');
    req.flush([]);

    component.logout();
    expect(authStub.logout).toHaveBeenCalled();
    expect(routerStub.navigate).toHaveBeenCalledWith(['/login'], { replaceUrl: true });
  });

  it('pagination nextPage and prevPage work', () => {
    component.restaurantsPerPage = 2;
    component.restaurants = Array.from(
      { length: 5 },
      (_, i) => ({ id: i + 1, name: `R${i + 1}`, dishes: [] }) as any,
    );
    component.updatePagedRestaurants();

    expect(component.pagedRestaurants.length).toBe(2);
    expect(component.currentPage).toBe(1);

    component.nextPage();
    expect(component.currentPage).toBe(2);
    expect(component.pagedRestaurants[0].id).toBe(3);

    component.nextPage();
    expect(component.currentPage).toBe(3);

    component.nextPage();
    expect(component.currentPage).toBe(3);

    component.prevPage();
    expect(component.currentPage).toBe(2);
  });

  it('updateRestaurant navigates with id and alerts when id missing', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('https://localhost:7145/api/restaurant/');
    req.flush([]);

    const alertSpy = spyOn(window, 'alert');
    component.updateRestaurant(undefined);
    expect(alertSpy).toHaveBeenCalledWith('Restaurant ID is missing!');

    component.updateRestaurant(55);
    expect(routerStub.navigate).toHaveBeenCalledWith([
      '/dashboard/admin-panel/restaurant/update',
      55,
    ]);
  });

  it('getDishIcon returns correct emoji', () => {
    expect(component.getDishIcon('pizza')).toBe('🍕');
    expect(component.getDishIcon('Pasta')).toBe('🍝');
    expect(component.getDishIcon('Drinks')).toBe('🥤');
    expect(component.getDishIcon('unknown')).toBe('🍴');
    expect(component.getDishIcon('')).toBe('🍴');
  });
});
