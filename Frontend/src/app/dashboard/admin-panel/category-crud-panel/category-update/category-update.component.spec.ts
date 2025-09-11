import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CategoryUpdateComponent } from './category-update.component';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
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

describe('CategoryUpdateComponent', () => {
  let fixture: ComponentFixture<CategoryUpdateComponent>;
  let component: CategoryUpdateComponent;
  let httpMock: HttpTestingController;
  let routerStub: RouterStub;
  let themeStub: ThemeServiceStub;
  let authStub: AuthServiceStub;

  beforeEach(async () => {
    routerStub = new RouterStub();
    themeStub = new ThemeServiceStub();
    authStub = new AuthServiceStub();

    await TestBed.configureTestingModule({
      imports: [CategoryUpdateComponent, HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: routerStub },
        { provide: ThemeService, useValue: themeStub },
        { provide: AuthService, useValue: authStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryUpdateComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    localStorage.removeItem('jwt');
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('jwt');
  });

  it('should create and load categories (success path)', fakeAsync(() => {
    component.cardsWrapper = { nativeElement: { clientHeight: 500 } } as any;

    fixture.detectChanges();

    const req = httpMock.expectOne('https://localhost:7145/api/category/');
    expect(req.request.method).toBe('GET');

    req.flush([
      { id: 1, name: 'one' },
      { id: 2, name: 'two' },
      { id: 3, name: 'three' },
    ]);

    tick(0);

    if (!component.cardsWrapper) {
      component.cardsWrapper = { nativeElement: { clientHeight: 300 } } as any;
    }

    const totalCardHeight = component.cardHeight + component.cardGap;
    component.categoriesPerPage = Math.max(
      1,
      Math.floor(component.cardsWrapper.nativeElement.clientHeight / totalCardHeight),
    );

    component.updatePagedCategories();

    fixture.detectChanges();

    expect(component.categories.length).toBe(3);
    expect(component.loading).toBeFalse();
    expect(component.pagedCategories.length).toBeGreaterThan(0);
  }));

  it('should read token from localStorage and set userEmail and role', fakeAsync(() => {
    const token = makeJwt({ email: 'test@example.com', role: 'admin' });
    localStorage.setItem('jwt', token);

    fixture.detectChanges();
    const req = httpMock.expectOne('https://localhost:7145/api/category/');
    req.flush([]);
    tick(0);
    fixture.detectChanges();

    expect(component.userEmail).toBe('test@example.com');
    expect(component.role).toBe('admin');
  }));

  it('calculateCategoriesPerPage should compute pages and update pagedCategories', () => {
    component.categories = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `c${i + 1}` }));
    component.cardsWrapper = { nativeElement: { clientHeight: 300 } } as any;

    component.calculateCategoriesPerPage();

    const totalCardHeight = component.cardHeight + component.cardGap;
    const expectedPerPage = Math.max(1, Math.floor(300 / totalCardHeight));
    expect(component.categoriesPerPage).toBe(expectedPerPage);
    expect(component.pagedCategories.length).toBeLessThanOrEqual(expectedPerPage);
  });

  it('should page with nextPage and prevPage', () => {
    component.categoriesPerPage = 3;
    component.categories = Array.from({ length: 8 }, (_, i) => ({ id: i + 1, name: `c${i + 1}` }));
    component.updatePagedCategories();

    expect(component.currentPage).toBe(1);
    expect(component.pagedCategories.length).toBe(3);

    component.nextPage();
    expect(component.currentPage).toBe(2);
    expect(component.pagedCategories[0].id).toBe(4);

    component.nextPage();
    expect(component.currentPage).toBe(3);

    component.nextPage();
    expect(component.currentPage).toBe(3);

    component.prevPage();
    expect(component.currentPage).toBe(2);
  });

  it('updateCategory navigates when id provided and alerts when id missing', () => {
    const alertSpy = spyOn(window, 'alert');

    component.updateCategory(undefined);
    expect(alertSpy).toHaveBeenCalledWith('Category ID is missing!');

    component.updateCategory(42);
    expect(routerStub.navigate).toHaveBeenCalledWith([
      '/dashboard/admin-panel/category/update',
      42,
    ]);
  });

  it('toggleTheme calls themeService.toggle', () => {
    component.toggleTheme();
    expect(themeStub.toggle).toHaveBeenCalled();
  });

  it('logout calls authService.logout and navigates to /login with replaceUrl', () => {
    component.logout();
    expect(authStub.logout).toHaveBeenCalled();
    expect(routerStub.navigate).toHaveBeenCalledWith(['/login'], { replaceUrl: true });
  });

  it('goBack navigates to category list', () => {
    component.goBack();
    expect(routerStub.navigate).toHaveBeenCalledWith(['/dashboard/admin-panel/category']);
  });

  it('loadCategories error path sets errorMessage and loading false', fakeAsync(() => {
    fixture.detectChanges();

    const req = httpMock.expectOne('https://localhost:7145/api/category/');
    req.error(new ProgressEvent('error'));

    tick(0);
    fixture.detectChanges();

    expect(component.errorMessage).toBe('Failed to load categories');
    expect(component.loading).toBeFalse();
  }));
});
