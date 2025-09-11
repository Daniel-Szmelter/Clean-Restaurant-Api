import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CategoryUpdateFormComponent } from './category-update-form.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ThemeService } from '../../../../services/theme.service';
import { AuthService } from '../../../../auth/auth.service';

describe('CategoryUpdateFormComponent', () => {
  let fixture: ComponentFixture<CategoryUpdateFormComponent>;
  let component: CategoryUpdateFormComponent;
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

  const activatedRouteStub = {
    snapshot: { params: { id: '123' } },
  };

  beforeEach(async () => {
    localStorage.removeItem('jwt');

    await TestBed.configureTestingModule({
      imports: [CategoryUpdateFormComponent, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        { provide: ThemeService, useValue: themeServiceStub },
        { provide: AuthService, useValue: authServiceStub },
        { provide: Router, useValue: routerStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        FormBuilder,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryUpdateFormComponent);
    component = fixture.componentInstance;

    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
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

    const req = httpTestingController.expectOne('https://localhost:7145/api/category/123');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 123, name: 'Category123' });

    tick();

    expect(component.userEmail).toBe('tester@example.com');
    expect(component.role).toBe('admin');
    expect(component.loading).toBeFalse();
  }));

  it('should handle loadCategory error', fakeAsync(() => {
    fixture.detectChanges();

    const req = httpTestingController.expectOne('https://localhost:7145/api/category/123');
    req.error(new ProgressEvent('error'));

    tick();

    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toBe('Cannot load category');
  }));

  it('should populate categoryForm after loadCategory success', fakeAsync(() => {
    fixture.detectChanges();

    const req = httpTestingController.expectOne('https://localhost:7145/api/category/123');
    req.flush({ id: 123, name: 'TestCat' });

    tick();

    expect(component.categoryForm.value.name).toBe('TestCat');
    expect(component.loading).toBeFalse();
  }));

  it('toggleTheme should call themeService.toggle', () => {
    component.toggleTheme();
    expect(themeServiceStub.toggle).toHaveBeenCalled();
  });

  it('goBack should navigate to /dashboard/admin-panel/category/update', () => {
    component.goBack();
    expect(routerStub.navigate).toHaveBeenCalledWith(['/dashboard/admin-panel/category/update']);
  });

  it('logout should call authService.logout and navigate to /login', () => {
    component.logout();
    expect(authServiceStub.logout).toHaveBeenCalled();
    expect(routerStub.navigate).toHaveBeenCalledWith(['/login'], { replaceUrl: true });
  });

  it('submit should do nothing if form invalid', fakeAsync(() => {
    fixture.detectChanges();
    component.categoryForm.controls['name'].setValue('');
    component.submit();
    const matches = httpTestingController.match(() => true);
    expect(matches.length).toBe(1);
  }));

  it('submit should send PATCH request when form valid and show toast', fakeAsync(() => {
    fixture.detectChanges();

    const reqGet = httpTestingController.expectOne('https://localhost:7145/api/category/123');
    reqGet.flush({ id: 123, name: 'OldName' });

    tick();

    component.categoryForm.controls['name'].setValue('NewName');
    component.submit();

    const reqPatch = httpTestingController.expectOne({
      url: 'https://localhost:7145/api/category/123',
      method: 'PATCH',
    });
    expect(reqPatch.request.body[0]).toEqual({ op: 'replace', path: '/name', value: 'NewName' });
    reqPatch.flush('', { status: 200, statusText: 'OK' });

    tick();
    expect(component.showToast).toBeTrue();
    expect(component.toastMessage).toBe('Category updated successfully!');

    tick(3000);
    expect(component.showToast).toBeFalse();
  }));
});
