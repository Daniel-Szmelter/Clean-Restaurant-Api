import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';

class RouterStub {
  navigateByUrl(url: string) {}
  navigate(commands: any[], extras?: any) {}
}

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let httpMock: HttpTestingController;
  let themeServiceMock: any;
  let router: Router;

  beforeEach(async () => {
    themeServiceMock = {
      isDarkMode$: of(false),
      setDarkMode: jasmine.createSpy('setDarkMode'),
    };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: Router, useClass: RouterStub },
        { provide: ThemeService, useValue: themeServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);

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

  it('should navigate to login', () => {
    spyOn(router, 'navigate');
    component.goToLogin();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should navigate to home', () => {
    spyOn(router, 'navigateByUrl');
    component.goToHome();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('should set error if form is invalid', () => {
    component.registerForm.setValue({ email: '', password: '', confirmPassword: '' });
    component.onSubmit();
    expect(component.registerError).toBeTrue();
    expect(component.errorMessage).toBe('Please fill in all fields with valid data');
  });

  it('should set error if passwords do not match', () => {
    component.registerForm.setValue({
      email: 'test@example.com',
      password: 'password1',
      confirmPassword: 'password2',
    });
    component.onSubmit();
    expect(component.registerError).toBeTrue();
    expect(component.errorMessage).toBe('Passwords do not match');
    expect(component.registerForm.value.password).toBe('');
    expect(component.registerForm.value.confirmPassword).toBe('');
  });

  it('should handle registration success', fakeAsync(() => {
    spyOn(router, 'navigate');
    component.registerForm.setValue({
      email: 'test@example.com',
      password: 'password',
      confirmPassword: 'password',
    });
    component.onSubmit();

    const req = httpMock.expectOne('https://localhost:7145/api/auth/register');
    expect(req.request.method).toBe('POST');
    req.flush({});

    tick();

    expect(component.registerError).toBeFalse();
    expect(component.errorMessage).toBe('');
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      state: { message: 'User created successfully. Please log in.' },
    });
  }));

  it('should handle registration error for existing email', fakeAsync(() => {
    component.registerForm.setValue({
      email: 'test@example.com',
      password: 'password',
      confirmPassword: 'password',
    });
    component.onSubmit();

    const req = httpMock.expectOne('https://localhost:7145/api/auth/register');
    req.flush({}, { status: 400, statusText: 'Bad Request' });

    tick();

    expect(component.registerError).toBeTrue();
    expect(component.errorMessage).toBe('Email already exists');
  }));

  it('should handle unexpected registration error', fakeAsync(() => {
    component.registerForm.setValue({
      email: 'test@example.com',
      password: 'password',
      confirmPassword: 'password',
    });
    component.onSubmit();

    const req = httpMock.expectOne('https://localhost:7145/api/auth/register');
    req.flush({}, { status: 500, statusText: 'Server Error' });

    tick();

    expect(component.registerError).toBeTrue();
    expect(component.errorMessage).toBe('Unexpected error');
  }));
});
