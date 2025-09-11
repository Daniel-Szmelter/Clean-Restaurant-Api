import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  RestaurantUpdateFormComponent,
  positiveRequired,
} from './restaurant-update-form.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ThemeService } from '../../../../services/theme.service';
import { AuthService } from '../../../../auth/auth.service';

describe('RestaurantUpdateFormComponent', () => {
  let component: RestaurantUpdateFormComponent;
  let fixture: ComponentFixture<RestaurantUpdateFormComponent>;
  let httpMock: HttpTestingController;
  let fb: FormBuilder;

  let themeSubject: BehaviorSubject<boolean>;
  let themeServiceMock: Partial<ThemeService>;
  let routerMock: Partial<Router>;
  let authServiceMock: Partial<AuthService>;
  const activatedRouteMock: Partial<ActivatedRoute> = {
    snapshot: { params: { id: '123' } } as any,
  };

  const sampleCategories = [
    { id: 10, name: 'Cat10' },
    { id: 20, name: 'Cat20' },
  ];
  const sampleRestaurant = {
    id: 123,
    name: 'R1',
    city: 'City',
    street: 'Main',
    dishes: [{ name: 'Dish1', price: 12, categoryId: 10, description: 'Tasty' }],
  };

  beforeEach(() => {
    themeSubject = new BehaviorSubject<boolean>(false);
    themeServiceMock = {
      isDarkMode$: themeSubject.asObservable(),
      toggle: jasmine.createSpy('toggle'),
    };

    routerMock = { navigate: jasmine.createSpy('navigate') };
    authServiceMock = { logout: jasmine.createSpy('logout') };

    TestBed.configureTestingModule({
      imports: [
        RestaurantUpdateFormComponent,
        HttpClientTestingModule,
        CommonModule,
        ReactiveFormsModule,
      ],
      providers: [
        { provide: ThemeService, useValue: themeServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    });

    fixture = TestBed.createComponent(RestaurantUpdateFormComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fb = TestBed.inject(FormBuilder);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('positiveRequired validator: returns error for 0 and null, null for >0', () => {
    const validator = positiveRequired();
    expect(validator(new FormControl(0))).toEqual({ required: true });
    expect(validator(new FormControl(-1))).toEqual({ required: true });
    expect(validator(new FormControl(null))).toEqual({ required: true });
    expect(validator(new FormControl(1))).toBeNull();
    expect(validator(new FormControl(100))).toBeNull();
  });

  it('should create and load categories + restaurant on ngOnInit', () => {
    fixture.detectChanges();

    const reqCats = httpMock.expectOne('https://localhost:7145/api/category');
    expect(reqCats.request.method).toBe('GET');
    reqCats.flush(sampleCategories);

    const reqRes = httpMock.expectOne('https://localhost:7145/api/restaurant/123');
    expect(reqRes.request.method).toBe('GET');
    reqRes.flush(sampleRestaurant);

    expect(component.categories.length).toBe(2);
    expect(component.restaurantId).toBe(123);
    expect(component.loading).toBeFalse();

    expect(component.restaurantForm.value.name).toBe('R1');
    expect(component.restaurantForm.value.city).toBe('City');
    expect(component.restaurantForm.value.street).toBe('Main');

    expect(component.dishes.length).toBe(1);
    const dishGrp = component.dishes.at(0);
    expect(dishGrp.get('name')!.value).toBe('Dish1');
    expect(dishGrp.get('price')!.value).toBe(12);
    expect(dishGrp.get('categoryId')!.value).toBe(10);
    expect(dishGrp.get('description')!.value).toBe('Tasty');
  });

  it('ngOnInit: when categories API fails, categories remain empty and loadRestaurant not called', () => {
    spyOn(console, 'error');
    fixture.detectChanges();

    const reqCats = httpMock.expectOne('https://localhost:7145/api/category');
    reqCats.error(new ProgressEvent('fail'));

    const matches = httpMock.match(() => true);

    expect(matches.length).toBe(0);

    expect(component.categories.length).toBe(0);
    expect(console.error).toHaveBeenCalled();
  });

  it('ngOnInit: decodes valid JWT token', () => {
    const header = { alg: 'none', typ: 'JWT' };
    const payload = { email: 'tester@x.com', role: 'admin' };
    const b64url = (obj: any) =>
      btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const token = `${b64url(header)}.${b64url(payload)}.`;
    localStorage.setItem('jwt', token);

    fixture.detectChanges();

    const reqCats = httpMock.expectOne('https://localhost:7145/api/category');
    reqCats.flush(sampleCategories);
    const reqRes = httpMock.expectOne('https://localhost:7145/api/restaurant/123');
    reqRes.flush(sampleRestaurant);

    expect(component.userEmail).toBe('tester@x.com');
    expect(component.role).toBe('admin');
  });

  it('ngOnInit: invalid jwt sets empty userEmail and role', () => {
    localStorage.setItem('jwt', 'not-a-jwt');
    fixture.detectChanges();

    const reqCats = httpMock.expectOne('https://localhost:7145/api/category');
    reqCats.flush(sampleCategories);
    const reqRes = httpMock.expectOne('https://localhost:7145/api/restaurant/123');
    reqRes.flush(sampleRestaurant);

    expect(component.userEmail).toBe('');
    expect(component.role).toBe('');
  });

  it('addDish uses default categoryId (first category) when dishData not provided', () => {
    component.categories = [{ id: 999, name: 'X' }];

    component.restaurantForm = fb.group({
      name: ['n'],
      city: ['c'],
      street: ['s'],
      dishes: fb.array([]),
    });

    expect(component.dishes.length).toBe(0);
    component.addDish();
    expect(component.dishes.length).toBe(1);
    const catId = component.dishes.at(0).get('categoryId')!.value;
    expect(catId).toBe(999);
  });

  it('removeDish removes dish at index', () => {
    component.restaurantForm = fb.group({
      name: ['n'],
      city: ['c'],
      street: ['s'],
      dishes: fb.array([]),
    });

    component.addDish({ name: 'a', price: 1, categoryId: 10, description: 'd' });
    component.addDish({ name: 'b', price: 2, categoryId: 10, description: 'd' });
    expect(component.dishes.length).toBe(2);
    component.removeDish(0);
    expect(component.dishes.length).toBe(1);
    expect(component.dishes.at(0).get('name')!.value).toBe('b');
  });

  it('toggleTheme calls themeService.toggle', () => {
    component.toggleTheme();
    expect((themeServiceMock.toggle as jasmine.Spy).calls.any()).toBeTrue();
  });

  it('goBack navigates to update route', () => {
    component.goBack();
    expect((routerMock.navigate as jasmine.Spy).calls.first().args[0]).toEqual([
      '/dashboard/admin-panel/restaurant/update',
    ]);
  });

  it('logout calls authService.logout and navigates to /login', () => {
    component.logout();
    expect((authServiceMock.logout as jasmine.Spy).calls.any()).toBeTrue();
    expect((routerMock.navigate as jasmine.Spy).calls.first().args[0]).toEqual(['/login']);
  });

  it('submit: sends PATCH with correct patchDoc and shows toast', fakeAsync(() => {
    component.restaurantId = 123;
    component.restaurantForm = fb.group({
      name: ['NewName'],
      city: ['NewCity'],
      street: ['NewStreet'],
      dishes: fb.array([
        fb.group({
          name: ['D1'],
          price: [10],
          categoryId: [10],
          description: ['desc'],
        }),
      ]),
    });

    component.submit();

    const req = httpMock.expectOne('https://localhost:7145/api/restaurant/123');
    expect(req.request.method).toBe('PATCH');

    expect(req.request.headers.get('Content-Type')).toBe('application/json-patch+json');

    const expectedBody = [
      { op: 'replace', path: '/name', value: 'NewName' },
      { op: 'replace', path: '/city', value: 'NewCity' },
      { op: 'replace', path: '/street', value: 'NewStreet' },
      { op: 'replace', path: '/dishes', value: component.restaurantForm.value.dishes },
    ];
    expect(req.request.body).toEqual(expectedBody);

    req.flush('OK');

    expect(component.toastMessage).toBe('Restaurant updated successfully!');
    expect(component.showToast).toBeTrue();

    tick(3000);
    expect(component.showToast).toBeFalse();
  }));

  it('submit: does nothing when form invalid', () => {
    component.restaurantId = 123;

    component.restaurantForm = fb.group({
      name: ['', Validators.required],
      city: ['', Validators.required],
      street: ['', Validators.required],
      dishes: fb.array([]),
    });

    component.submit();

    httpMock.expectNone('https://localhost:7145/api/restaurant/123');
  });
});
