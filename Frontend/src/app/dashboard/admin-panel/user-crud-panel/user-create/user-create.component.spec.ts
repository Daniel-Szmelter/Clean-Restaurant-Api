import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { UserCreateComponent } from './user-create.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ThemeService } from '../../../../services/theme.service';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../../../auth/auth.service';
import { Subject, Observable } from 'rxjs';
import { ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

describe('UserCreateComponent', () => {
  let component: UserCreateComponent;
  let fixture: ComponentFixture<UserCreateComponent>;
  let httpMock: HttpTestingController;

  const themeSubject = new Subject<boolean>();
  const themeServiceMock = {
    isDarkMode$: themeSubject.asObservable(),
    toggle: jasmine.createSpy('toggle'),
  };

  const routerMock = {
    navigate: jasmine.createSpy('navigate'),
  };

  const authServiceMock = {
    logout: jasmine.createSpy('logout'),
  };

  const cdRefMock: Partial<ChangeDetectorRef> = {
    detectChanges: () => {},
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [UserCreateComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: ThemeService, useValue: themeServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: ChangeDetectorRef, useValue: cdRefMock },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserCreateComponent);
    component = fixture.componentInstance;

    const testHttp = TestBed.inject(HttpClient);
    (component as any).http = testHttp;

    httpMock = TestBed.inject(HttpTestingController);

    localStorage.removeItem('jwt');

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    themeSubject.observers = [];

    (routerMock.navigate as jasmine.Spy).calls.reset();
    (authServiceMock.logout as jasmine.Spy).calls.reset();
    (themeServiceMock.toggle as jasmine.Spy).calls.reset();
  });

  it('should create component and initialize form controls', () => {
    expect(component).toBeTruthy();
    expect(component.userForm).toBeDefined();

    expect(component.userForm.get('email')).toBeDefined();
    expect(component.userForm.get('password')).toBeDefined();
    expect(component.userForm.get('confirmPassword')).toBeDefined();
    expect(component.userForm.get('role')).toBeDefined();
  });

  it('passwordMatchValidator should set mismatch error when passwords differ', () => {
    const pwd = component.userForm.get('password')!;
    const cpwd = component.userForm.get('confirmPassword')!;

    pwd.setValue('password123');
    cpwd.setValue('different123');

    component.userForm.updateValueAndValidity();

    expect(cpwd.errors).toBeTruthy();
    expect(cpwd.errors!['mismatch']).toBeTrue();
  });

  it('passwordMatchValidator should clear mismatch when passwords match', () => {
    const pwd = component.userForm.get('password')!;
    const cpwd = component.userForm.get('confirmPassword')!;

    pwd.setValue('password123');
    cpwd.setValue('password123');

    component.userForm.updateValueAndValidity();

    expect(cpwd.errors).toBeNull();
  });

  it('emailExistsValidator should mark as existing when server returns matching user (async) - direct validator call', fakeAsync(() => {
    const emailControl = component.userForm.get('email')!;

    emailControl.clearAsyncValidators();
    emailControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });

    emailControl.setValue('exists@example.com');

    let validationResult: ValidationErrors | null | undefined = undefined;
    const result$ = component.emailExistsValidator()(
      emailControl,
    ) as Observable<ValidationErrors | null>;
    result$.subscribe((res: ValidationErrors | null) => (validationResult = res));

    const req = httpMock.expectOne(
      (req) => req.method === 'GET' && req.urlWithParams.includes('/api/user'),
    );
    expect(req.request.method).toBe('GET');
    req.flush([{ email: 'exists@example.com' }]);

    tick();

    expect(validationResult).toEqual({ emailExists: true } as any);
  }));

  it('emailExistsValidator should not error when server returns empty array (direct validator call)', fakeAsync(() => {
    const emailControl = component.userForm.get('email')!;

    emailControl.clearAsyncValidators();
    emailControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });

    emailControl.setValue('new@example.com');

    let validationResult: ValidationErrors | null | undefined = undefined;
    const result$ = component.emailExistsValidator()(
      emailControl,
    ) as Observable<ValidationErrors | null>;
    result$.subscribe((res: ValidationErrors | null) => (validationResult = res));

    const req = httpMock.expectOne(
      (req) => req.method === 'GET' && req.urlWithParams.includes('/api/user'),
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);

    tick();
    expect(validationResult).toBeNull();
  }));

  it('goBack should navigate to user list', () => {
    component.goBack();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard/admin-panel/user']);
  });

  it('toggleTheme should call themeService.toggle', () => {
    component.toggleTheme();
    expect(themeServiceMock.toggle).toHaveBeenCalled();
  });

  it('logout should call authService.logout and navigate to /login with replaceUrl true', () => {
    component.logout();
    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login'], { replaceUrl: true });
  });

  it('submit should post payload and show success toast, then hide it after timeout and reset form', fakeAsync(() => {
    const emailControl = component.userForm.get('email')!;
    emailControl.clearAsyncValidators();
    emailControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });

    emailControl.setValue('a@b.com');
    component.userForm.get('password')!.setValue('abcdef');
    component.userForm.get('confirmPassword')!.setValue('abcdef');
    component.userForm.get('role')!.setValue('Admin');

    expect(component.userForm.valid).toBeTrue();

    component.submit();

    const req = httpMock.expectOne('https://localhost:7145/api/user/');
    expect(req.request.method).toBe('POST');

    req.flush({});

    expect(component.toastMessage).toBe('User created successfully!');
    expect(component.showToast).toBeTrue();

    expect(component.userForm.get('email')!.value).toBeNull();

    tick(3000);
    expect(component.showToast).toBeFalse();
  }));

  it('submit should show server error message on failure', fakeAsync(() => {
    const emailControl = component.userForm.get('email')!;
    emailControl.clearAsyncValidators();
    emailControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });

    emailControl.setValue('a@b.com');
    component.userForm.get('password')!.setValue('abcdef');
    component.userForm.get('confirmPassword')!.setValue('abcdef');
    component.userForm.get('role')!.setValue('Admin');

    component.submit();

    const req = httpMock.expectOne('https://localhost:7145/api/user/');
    expect(req.request.method).toBe('POST');

    req.flush({ message: 'Server error' }, { status: 500, statusText: 'Server Error' });

    expect(component.toastMessage).toBe('Server error');
    expect(component.showToast).toBeTrue();

    tick(3000);
    expect(component.showToast).toBeFalse();
  }));

  it('if no jwt is in localStorage userEmail and role remain empty', () => {
    component.ngOnInit();
    expect(component.userEmail).toBe('');
    expect(component.role).toBe('');
  });
});
