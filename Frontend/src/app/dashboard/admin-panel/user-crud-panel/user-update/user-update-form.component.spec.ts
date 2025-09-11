import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { UserUpdateFormComponent } from './user-update-form.component';
import { ThemeService } from '../../../../services/theme.service';
import { AuthService } from '../../../../auth/auth.service';
import { ActivatedRoute } from '@angular/router';

describe('UserUpdateFormComponent', () => {
  let component: UserUpdateFormComponent;
  let fixture: ComponentFixture<UserUpdateFormComponent>;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;
  let mockTheme: any;
  let mockAuth: any;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    mockTheme = {
      isDarkMode$: of(false),
      toggle: jasmine.createSpy('toggle'),
    };
    mockAuth = {
      logout: jasmine.createSpy('logout'),
    };

    await TestBed.configureTestingModule({
      imports: [UserUpdateFormComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        FormBuilder,
        { provide: Router, useValue: routerSpy },
        { provide: ThemeService, useValue: mockTheme },
        { provide: AuthService, useValue: mockAuth },
        { provide: ActivatedRoute, useValue: { snapshot: { params: { id: '123' } } } },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(UserUpdateFormComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('jwt');
  });

  it('should create and load user (GET) and patch form', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne('https://localhost:7145/api/user/123');
    expect(req.request.method).toBe('GET');

    req.flush({ email: 'test@example.com', role: 'Manager' });

    expect(component.userForm.getRawValue().email).toBe('test@example.com');
    expect(component.userForm.getRawValue().role).toBe('Manager');
    expect(component.loading).toBeFalse();
  });

  it('passwordMatchValidator - returns null when passwords match and error when not', () => {
    const fb = TestBed.inject(FormBuilder);
    const grpMatch = fb.group({
      password: ['abcd1234'],
      confirmPassword: ['abcd1234'],
    });

    const grpMismatch = fb.group({
      password: ['abcd1234'],
      confirmPassword: ['other'],
    });

    expect(component.passwordMatchValidator(grpMatch)).toBeNull();
    expect(component.passwordMatchValidator(grpMismatch)).toEqual({ passwordMismatch: true });
  });

  it('goBack should navigate to update list route', () => {
    component.goBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard/admin-panel/user/update']);
  });

  it('toggleTheme should call themeService.toggle', () => {
    component.toggleTheme();
    expect(mockTheme.toggle).toHaveBeenCalled();
  });

  it('logout should call authService.logout and navigate to /login with replaceUrl', () => {
    component.logout();
    expect(mockAuth.logout).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], { replaceUrl: true });
  });

  it('submit should not send PATCH when form invalid', () => {
    fixture.detectChanges();
    const getReq = httpMock.expectOne('https://localhost:7145/api/user/123');
    getReq.flush({ email: 't@e.com', role: 'User' });

    component.userForm.patchValue({ role: '' });
    component.submit();

    httpMock.expectNone((req) => req.method === 'PATCH');
  });

  it('submit should send PATCH with only role when password not provided', fakeAsync(() => {
    fixture.detectChanges();
    const getReq = httpMock.expectOne('https://localhost:7145/api/user/123');
    getReq.flush({ email: 'a@b.c', role: 'User' });

    component.userForm.patchValue({ role: 'Admin', password: '', confirmPassword: '' });
    expect(component.userForm.valid).toBeTrue();

    component.submit();

    const patchReq = httpMock.expectOne('https://localhost:7145/api/user/123');
    expect(patchReq.request.method).toBe('PATCH');
    expect(patchReq.request.headers.get('Content-Type')).toBe('application/json-patch+json');
    expect(patchReq.request.body).toEqual([{ op: 'replace', path: '/role', value: 'Admin' }]);

    patchReq.flush('OK', { status: 200, statusText: 'OK' });

    expect(component.showToast).toBeTrue();
    tick(3000);

    expect(routerSpy.navigate).not.toHaveBeenCalled();
  }));

  it('submit should include password if provided', fakeAsync(() => {
    fixture.detectChanges();
    const getReq = httpMock.expectOne('https://localhost:7145/api/user/123');
    getReq.flush({ email: 'u@x.y', role: 'User' });

    component.userForm.patchValue({
      role: 'User',
      password: 'newPass123',
      confirmPassword: 'newPass123',
    });
    expect(component.userForm.valid).toBeTrue();

    component.submit();

    const patchReq = httpMock.expectOne('https://localhost:7145/api/user/123');
    expect(patchReq.request.method).toBe('PATCH');
    expect(patchReq.request.body).toEqual([
      { op: 'replace', path: '/role', value: 'User' },
      { op: 'replace', path: '/password', value: 'newPass123' },
    ]);

    patchReq.flush('OK', { status: 200, statusText: 'OK' });

    expect(component.showToast).toBeTrue();
    tick(3000);

    expect(routerSpy.navigate).not.toHaveBeenCalled();
  }));

  it('loadUser - error branch should set errorMessage and loading false', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('https://localhost:7145/api/user/123');
    req.flush({ message: 'not found' }, { status: 404, statusText: 'Not Found' });

    expect(component.errorMessage).toBe('Cannot load user');
    expect(component.loading).toBeFalse();
  });

  it('showSuccessToast toggles showToast and clears after 3000ms', fakeAsync(() => {
    component.showSuccessToast('ok');
    expect(component.showToast).toBeTrue();
    expect(component.toastMessage).toBe('ok');

    tick(3000);
    expect(component.showToast).toBeFalse();
  }));
});
