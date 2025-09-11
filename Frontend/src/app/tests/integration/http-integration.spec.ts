import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { HomeComponent } from '../../home/home.component';
import { CategoryDeleteComponent } from '../../dashboard/admin-panel/category-crud-panel/category-delete/category-delete.component';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../auth/auth.service';
import { of, throwError } from 'rxjs';

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

interface Category {
  id: number;
  name: string;
  description?: string;
}

describe('HTTP integration (HomeComponent & CategoryDeleteComponent)', () => {
  let httpMock: HttpTestingController;

  const mockTheme = {
    isDarkMode$: { subscribe: (fn: any) => fn(false) },
    toggle: jasmine.createSpy('toggle'),
  };

  const mockAuth = {
    logout: jasmine.createSpy('logout'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,

        HomeComponent,
        CategoryDeleteComponent,
      ],
      providers: [
        { provide: ThemeService, useValue: mockTheme },
        { provide: AuthService, useValue: mockAuth },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    localStorage.removeItem('jwt');
    localStorage.removeItem('token');
    document.body.className = '';
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('jwt');
    localStorage.removeItem('token');
    document.body.className = '';
  });

  describe('HomeComponent - loadRestaurants', () => {
    let fixture: ComponentFixture<HomeComponent>;
    let component: HomeComponent;
    let cdSpy: jasmine.Spy;

    beforeEach(() => {
      fixture = TestBed.createComponent(HomeComponent);
      component = fixture.componentInstance;
      cdSpy = spyOn((component as any).cd, 'detectChanges').and.callThrough();
    });

    it('should load restaurants on success and update pagedRestaurants', () => {
      const mockRestaurants: Restaurant[] = [
        { id: 1, name: 'R1', dishes: [] },
        { id: 2, name: 'R2', dishes: [] },
        { id: 3, name: 'R3', dishes: [] },
        { id: 4, name: 'R4', dishes: [] },
      ];

      fixture.detectChanges();

      const req = httpMock.expectOne('https://localhost:7145/api/restaurant/');
      expect(req.request.method).toBe('GET');

      req.flush(mockRestaurants);

      expect(component.restaurants).toEqual(mockRestaurants);
      expect(component.loading).toBeFalse();
      expect(component.pagedRestaurants.length).toBe(3);
      expect(cdSpy).toHaveBeenCalled();
    });

    it('should handle load error and set errorMessage', () => {
      fixture.detectChanges();

      const req = httpMock.expectOne('https://localhost:7145/api/restaurant/');
      expect(req.request.method).toBe('GET');

      req.error(new ErrorEvent('network'));

      expect(component.errorMessage).toBe('Failed to load restaurants');
      expect(component.loading).toBeFalse();
      expect(cdSpy).toHaveBeenCalled();
    });
  });

  describe('CategoryDeleteComponent - load & delete (using spies on component.http)', () => {
    let fixture: ComponentFixture<CategoryDeleteComponent>;
    let component: CategoryDeleteComponent;
    let cdSpy: jasmine.Spy;

    beforeEach(() => {
      fixture = TestBed.createComponent(CategoryDeleteComponent);
      component = fixture.componentInstance;
      cdSpy = spyOn((component as any).cd, 'detectChanges').and.callThrough();

      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(window, 'alert').and.stub();
    });

    it('should load categories successfully (spy on component.http.get)', fakeAsync(() => {
      const mockCategories: Category[] = [
        { id: 1, name: 'C1' },
        { id: 2, name: 'C2' },
        { id: 3, name: 'C3' },
      ];

      spyOn((component as any).http, 'get').and.returnValue(of(mockCategories));

      fixture.detectChanges();

      tick(0);

      expect(component.categories).toEqual(mockCategories);
      expect(component.loading).toBeFalse();
      expect(cdSpy).toHaveBeenCalled();
    }));

    it('should handle load categories error (spy throws)', fakeAsync(() => {
      spyOn((component as any).http, 'get').and.returnValue(throwError(() => new Error('network')));

      fixture.detectChanges();
      tick(0);

      expect(component.errorMessage).toBe('Failed to load categories');
      expect(component.loading).toBeFalse();
      expect(cdSpy).toHaveBeenCalled();
    }));

    it('deleteCategory should call DELETE and update categories and show toast', fakeAsync(() => {
      component.categories = [
        { id: 10, name: 'ToDelete' },
        { id: 11, name: 'KeepMe' },
      ];
      component.updatePagedCategories();

      const deleteSpy = spyOn((component as any).http, 'delete').and.returnValue(of({}));

      component.deleteCategory(10);

      expect(deleteSpy).toHaveBeenCalledWith('https://localhost:7145/api/category/10');

      expect(component.categories.find((c) => c.id === 10)).toBeUndefined();
      expect(component.showToast).toBeTrue();
      expect(component.toastMessage).toBe('Category deleted successfully!');

      tick(3000);
      expect(component.showToast).toBeFalse();
    }));

    it('deleteCategory should not call DELETE when id is undefined', () => {
      component.categories = [{ id: 1, name: 'C1' }];
      component.updatePagedCategories();

      component.deleteCategory(undefined);

      const deleteSpy = spyOn((component as any).http, 'delete').and.callThrough();
      expect(deleteSpy).not.toHaveBeenCalled();

      expect(window.alert).toHaveBeenCalled();
    });
  });
});
