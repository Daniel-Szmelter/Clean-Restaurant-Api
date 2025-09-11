import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CategoryDeleteComponent } from './category-delete.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { ThemeService } from '../../../../services/theme.service';
import { AuthService } from '../../../../auth/auth.service';

describe('CategoryDeleteComponent', () => {
  let fixture: ComponentFixture<CategoryDeleteComponent>;
  let component: CategoryDeleteComponent;
  let httpTestingController: HttpTestingController;

  const themeSubject = new BehaviorSubject<boolean>(false);
  const themeServiceStub = {
    isDarkMode$: themeSubject.asObservable(),
    toggle: jasmine.createSpy('toggle'),
  };

  const authServiceStub = {
    logout: jasmine.createSpy('logout'),
  };

  const routerStub = {
    navigate: jasmine.createSpy('navigate'),
  };

  beforeEach(async () => {
    localStorage.removeItem('jwt');

    await TestBed.configureTestingModule({
      imports: [CategoryDeleteComponent, HttpClientTestingModule],
      providers: [
        { provide: ThemeService, useValue: themeServiceStub },
        { provide: AuthService, useValue: authServiceStub },
        { provide: Router, useValue: routerStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryDeleteComponent);
    component = fixture.componentInstance;

    (component as any).http = TestBed.inject(HttpClient);

    (component as any).themeService = themeServiceStub;
    (component as any).authService = authServiceStub;
    (component as any).router = routerStub;

    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    themeSubject.next(false);
    localStorage.removeItem('jwt');
    (themeServiceStub.toggle as jasmine.Spy).calls.reset();
    (authServiceStub.logout as jasmine.Spy).calls.reset();
    (routerStub.navigate as jasmine.Spy).calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should decode JWT from localStorage and set userEmail and role on init', fakeAsync(() => {
    const payload = { email: 'tester@example.com', role: 'admin' };
    const fakeJwt = 'h.' + btoa(JSON.stringify(payload)) + '.s';
    localStorage.setItem('jwt', fakeJwt);

    fixture.detectChanges();

    const req = httpTestingController.expectOne('https://localhost:7145/api/category/');
    expect(req.request.method).toBe('GET');
    req.flush([]);

    tick(0);

    expect(component.userEmail).toBe('tester@example.com');
    expect(component.role).toBe('admin');
    expect(component.loading).toBeFalse();
  }));

  it('should handle loadCategories error and set errorMessage', fakeAsync(() => {
    fixture.detectChanges();

    const req = httpTestingController.expectOne('https://localhost:7145/api/category/');
    expect(req.request.method).toBe('GET');
    req.error(new ProgressEvent('error'));

    tick(0);
    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toBe('Failed to load categories');
  }));

  it('should calculate categoriesPerPage based on cardsWrapper height', () => {
    component.cardsWrapper = { nativeElement: { clientHeight: 430 } } as any;

    component.calculateCategoriesPerPage();

    expect(component.categoriesPerPage).toBe(5);

    component.cardsWrapper = { nativeElement: { clientHeight: 1 } } as any;
    component.calculateCategoriesPerPage();
    expect(component.categoriesPerPage).toBeGreaterThanOrEqual(1);
  });

  it('should paginate correctly with nextPage and prevPage', () => {
    const cats = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: 'c' + (i + 1) }));
    component.categories = cats;
    component.categoriesPerPage = 5;
    component.currentPage = 1;
    component.updatePagedCategories();

    expect(component.pagedCategories.length).toBe(5);
    expect(component.maxPage).toBe(3);

    component.nextPage();
    expect(component.currentPage).toBe(2);
    component.updatePagedCategories();
    expect(component.pagedCategories[0].id).toBe(6);

    component.prevPage();
    expect(component.currentPage).toBe(1);
  });

  it('should alert and do nothing when deleteCategory called with undefined id', () => {
    spyOn(window, 'alert');
    component.deleteCategory(undefined);
    expect(window.alert).toHaveBeenCalledWith('Category ID is missing!');
  });

  it('should call DELETE and remove category on successful delete', fakeAsync(() => {
    component.categories = [
      { id: 1, name: 'cat1' },
      { id: 2, name: 'cat2' },
    ];
    component.updatePagedCategories();

    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');

    component.deleteCategory(1);

    const req = httpTestingController.expectOne('https://localhost:7145/api/category/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({});

    expect(component.categories.find((c) => c.id === 1)).toBeUndefined();
    expect(component.showToast).toBeTrue();
    expect(component.toastMessage).toBe('Category deleted successfully!');

    tick(3000);
    expect(component.showToast).toBeFalse();
    expect(window.alert).not.toHaveBeenCalled();
  }));

  it('should not call DELETE when user cancels confirm', fakeAsync(() => {
    component.categories = [{ id: 10, name: 'cat10' }];
    spyOn(window, 'confirm').and.returnValue(false);

    component.deleteCategory(10);

    const matches = httpTestingController.match(() => true);

    if (matches && matches.length > 0) {
      fail('No HTTP requests should have been made when confirm returns false');
    }
  }));

  it('should logout via authService and navigate to /login', () => {
    component.logout();
    expect((authServiceStub.logout as jasmine.Spy).calls.count()).toBe(1);
    expect(routerStub.navigate as jasmine.Spy).toHaveBeenCalled();
  });

  it('ngAfterViewInit should call calculateCategoriesPerPage via setTimeout', fakeAsync(() => {
    spyOn(component, 'calculateCategoriesPerPage');
    component.ngAfterViewInit();
    tick(0);
    expect(component.calculateCategoriesPerPage).toHaveBeenCalled();
  }));
});
