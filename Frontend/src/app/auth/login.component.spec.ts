import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';

class RouterStub {
  navigateByUrl(url: string) {}
  navigate(commands: any[]) {}
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let httpMock: HttpTestingController;
  let themeServiceMock: any;

  beforeEach(async () => {
    themeServiceMock = {
      isDarkMode$: of(false),
      setDarkMode: jasmine.createSpy('setDarkMode'),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        { provide: Router, useClass: RouterStub },
        { provide: ThemeService, useValue: themeServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    spyOn(component, 'decodeToken').and.returnValue({
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'user',
    });

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle dark mode', () => {
    expect(component.isDarkMode).toBe(false);
    component.toggleTheme();
    expect(component.isDarkMode).toBe(true);
    expect(themeServiceMock.setDarkMode).toHaveBeenCalledWith(true);
  });

  it('should handle login success', fakeAsync(() => {
    component.loginForm.setValue({ email: 'test@example.com', password: 'password' });
    component.onSubmit();

    const req = httpMock.expectOne('https://localhost:7145/api/auth/login');
    expect(req.request.method).toBe('POST');

    req.flush({ accessToken: 'mock-token', refreshToken: 'mock-refresh' });

    tick();

    expect(component.loginError).toBeFalse();
    expect(component.successMessage).toBe('Login successful');
    expect(localStorage.getItem('jwt')).toBe('mock-token');
  }));

  it('should handle login error', fakeAsync(() => {
    component.loginForm.setValue({ email: 'wrong@example.com', password: '123456' });
    component.onSubmit();

    const req = httpMock.expectOne('https://localhost:7145/api/auth/login');
    req.flush({}, { status: 401, statusText: 'Unauthorized' });

    tick();

    expect(component.loginError).toBeTrue();
    expect(component.errorMessage).toBe('Invalid email or password');
  }));

  it('should set error for invalid form', () => {
    component.loginForm.setValue({ email: '', password: '' });
    component.onSubmit();

    expect(component.loginError).toBeTrue();
    expect(component.errorMessage).toBe('Email is required');
  });
});
