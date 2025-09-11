import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CategoryCreateComponent } from './category-create.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { ThemeService } from '../../../../services/theme.service';
import { AuthService } from '../../../../auth/auth.service';
import { of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';

class RouterStub {
  navigate(commands: any[], extras?: any) {}
  navigateByUrl(url: string) {}
}

describe('CategoryCreateComponent', () => {
  let component: CategoryCreateComponent;
  let fixture: ComponentFixture<CategoryCreateComponent>;
  let httpMock: HttpTestingController;
  let themeServiceMock: any;
  let authServiceMock: any;
  let router: Router;

  beforeEach(async () => {
    themeServiceMock = {
      isDarkMode$: of(false),
      toggle: jasmine.createSpy('toggle'),
    };

    authServiceMock = {
      logout: jasmine.createSpy('logout'),
    };

    await TestBed.configureTestingModule({
      imports: [CategoryCreateComponent, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        { provide: Router, useClass: RouterStub },
        { provide: ThemeService, useValue: themeServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryCreateComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to theme changes', () => {
    expect(component.isDarkMode).toBe(false);
  });

  it('should toggle theme', () => {
    component.toggleTheme();
    expect(themeServiceMock.toggle).toHaveBeenCalled();
  });

  it('should navigate back to category list', () => {
    spyOn(router, 'navigate');
    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/admin-panel/category']);
  });

  it('should logout and navigate to login', () => {
    spyOn(router, 'navigate');
    component.logout();
    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], { replaceUrl: true });
  });

  it('should set userEmail and role from valid token', () => {
    const tokenPayload = {
      email: 'test@example.com',
      role: 'Admin',
      id: '123',
    };

    const fakeToken = `header.${btoa(JSON.stringify(tokenPayload))}.signature`;
    localStorage.setItem('jwt', fakeToken);

    component.ngOnInit();

    expect(component.userEmail).toBe('test@example.com');
    expect(component.role).toBe('Admin');
  });

  it('should reset form and show success toast on submit success', fakeAsync(() => {
    component.categoryForm.setValue({ name: 'Pizza' });
    component.submit();

    const req = httpMock.expectOne('https://localhost:7145/api/category');
    expect(req.request.method).toBe('POST');
    req.flush({ id: 1 });

    expect(component.categoryForm.value.name).toBeNull();
    expect(component.showToast).toBeTrue();
    expect(component.toastMessage).toBe('Category created successfully!');

    tick(3000);
    expect(component.showToast).toBeFalse();
  }));

  it('should not submit if form is invalid', () => {
    component.categoryForm.setValue({ name: '' });
    component.submit();
    httpMock.expectNone('https://localhost:7145/api/category');
  });

  it('should log error on submit failure', () => {
    spyOn(console, 'error');
    component.categoryForm.setValue({ name: 'Test' });
    component.submit();

    const req = httpMock.expectOne('https://localhost:7145/api/category');
    req.flush({}, { status: 500, statusText: 'Server Error' });

    expect(console.error).toHaveBeenCalled();
  });
});
