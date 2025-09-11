import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { RestaurantCreateComponent } from './restaurant-create.component';
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

describe('RestaurantCreateComponent', () => {
  let fixture: ComponentFixture<RestaurantCreateComponent>;
  let component: RestaurantCreateComponent;
  let httpMock: HttpTestingController;
  let routerStub: RouterStub;
  let themeStub: ThemeServiceStub;
  let authStub: AuthServiceStub;

  beforeEach(async () => {
    routerStub = new RouterStub();
    themeStub = new ThemeServiceStub();
    authStub = new AuthServiceStub();

    await TestBed.configureTestingModule({
      imports: [RestaurantCreateComponent, HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: routerStub },
        { provide: ThemeService, useValue: themeStub },
        { provide: AuthService, useValue: authStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RestaurantCreateComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    localStorage.removeItem('jwt');
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('jwt');
  });

  it('should create and initialize form with one dish', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne('https://localhost:7145/api/category');
    req.flush([]);

    expect(component).toBeTruthy();
    expect(component.restaurantForm).toBeDefined();
    expect(component.dishes.length).toBe(1);
  });

  it('should subscribe to theme changes', fakeAsync(() => {
    fixture.detectChanges();
    const req = httpMock.expectOne('https://localhost:7145/api/category');
    req.flush([]);

    expect(component.isDarkMode).toBeFalse();
    themeStub.isDarkMode$.next(true);
    tick();
    expect(component.isDarkMode).toBeTrue();
  }));

  it('should read token from localStorage', () => {
    const token = makeJwt({ email: 'chef@x.com', role: 'owner' });
    localStorage.setItem('jwt', token);

    fixture.detectChanges();
    const req = httpMock.expectOne('https://localhost:7145/api/category');
    req.flush([]);

    expect(component.userEmail).toBe('chef@x.com');
    expect(component.role).toBe('owner');
  });

  it('addDish and removeDish manipulate form array', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('https://localhost:7145/api/category');
    req.flush([]);

    expect(component.dishes.length).toBe(1);
    component.addDish();
    expect(component.dishes.length).toBe(2);

    component.removeDish(0);
    expect(component.dishes.length).toBe(1);
  });

  it('loadCategories populates categories', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('https://localhost:7145/api/category');
    req.flush([
      { id: 1, name: 'C1' },
      { id: 2, name: 'C2' },
    ]);

    expect(component.categories.length).toBe(2);
    expect(component.categories[0].name).toBe('C1');
  });

  it('toggleTheme and goBack and logout work', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('https://localhost:7145/api/category');
    req.flush([]);

    component.toggleTheme();
    expect(themeStub.toggle).toHaveBeenCalled();

    component.goBack();
    expect(routerStub.navigate).toHaveBeenCalledWith(['/dashboard/admin-panel/restaurant']);

    component.logout();
    expect(authStub.logout).toHaveBeenCalled();
    expect(routerStub.navigate).toHaveBeenCalledWith(['/login'], { replaceUrl: true });
  });

  it('submit should do nothing when form invalid', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('https://localhost:7145/api/category');
    req.flush([]);

    component.submit();

    httpMock.expectNone('https://localhost:7145/api/restaurant');
  });

  it('submit should create restaurant and dishes when valid', fakeAsync(() => {
    fixture.detectChanges();

    const catsReq = httpMock.expectOne('https://localhost:7145/api/category');
    catsReq.flush([{ id: 10, name: 'Cat10' }]);

    component.restaurantForm.patchValue({ name: 'R1', city: 'City', street: 'Main' });

    const dishGroup = component.dishes.at(0);

    expect(dishGroup.get('name')).toBeTruthy();
    expect(dishGroup.get('price')).toBeTruthy();
    expect(dishGroup.get('categoryName')).toBeTruthy();
    expect(dishGroup.get('description')).toBeTruthy();

    dishGroup.get('name')!.setValue('Dish1');
    dishGroup.get('price')!.setValue(12);
    dishGroup.get('categoryName')!.setValue('Cat10');
    dishGroup.get('description')!.setValue('Tasty');

    component.submit();

    const restReq = httpMock.expectOne('https://localhost:7145/api/restaurant');
    expect(restReq.request.method).toBe('POST');
    expect(restReq.request.body).toEqual(
      jasmine.objectContaining({ name: 'R1', city: 'City', street: 'Main' }),
    );
    restReq.flush({ id: 123 });

    const dishReqs = httpMock.match('https://localhost:7145/api/dish');
    expect(dishReqs.length).toBe(1);

    const firstDishBody = dishReqs[0].request.body;
    expect(firstDishBody).toEqual(
      jasmine.objectContaining({
        name: 'Dish1',
        price: 12,
        categoryName: 'Cat10',
        description: 'Tasty',
        restaurantId: 123,
      }),
    );

    dishReqs.forEach((r) => r.flush({}));

    tick();

    expect(component.dishes.length).toBe(1);
    expect(component.showToast).toBeTrue();
    expect(component.toastMessage).toBe('Restaurant created successfully!');

    tick(3000);
    expect(component.showToast).toBeFalse();
  }));

  it('submit with zero dishes should only create restaurant and call finishCreation', fakeAsync(() => {
    fixture.detectChanges();
    const catsReq = httpMock.expectOne('https://localhost:7145/api/category');
    catsReq.flush([]);

    component.dishes.clear();

    component.restaurantForm.patchValue({ name: 'R2', city: 'C', street: 'S' });

    component.submit();

    const restReq = httpMock.expectOne('https://localhost:7145/api/restaurant');
    restReq.flush({ id: 222 });

    httpMock.expectNone('https://localhost:7145/api/dish');

    tick();
    expect(component.showToast).toBeTrue();
  }));
});
