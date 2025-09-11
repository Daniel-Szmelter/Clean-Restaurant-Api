import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

import { UserCrudPanelComponent } from './user-crud-panel.component';
import { ThemeService } from '../../../services/theme.service';
import { AuthService } from '../../../auth/auth.service';

describe('UserCrudPanelComponent', () => {
  let component: UserCrudPanelComponent;
  let fixture: ComponentFixture<UserCrudPanelComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let mockTheme: any;
  let mockAuth: any;
  let mockCd: ChangeDetectorRef;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    mockTheme = {
      isDarkMode$: of(false),
      toggle: jasmine.createSpy('toggle'),
    };
    mockAuth = {
      logout: jasmine.createSpy('logout'),
    };
    mockCd = { detectChanges: jasmine.createSpy('detectChanges') } as unknown as ChangeDetectorRef;

    await TestBed.configureTestingModule({
      imports: [UserCrudPanelComponent],
      providers: [
        { provide: ThemeService, useValue: mockTheme },
        { provide: AuthService, useValue: mockAuth },
        { provide: Router, useValue: routerSpy },
        { provide: ChangeDetectorRef, useValue: mockCd },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserCrudPanelComponent);
    component = fixture.componentInstance;

    localStorage.removeItem('jwt');
  });

  afterEach(() => {
    localStorage.removeItem('jwt');
  });

  it('should navigate to /login when no token present', () => {
    fixture.detectChanges();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], { replaceUrl: true });
  });

  it('should set userEmail and role when valid token present', () => {
    const payload = { email: 'test@example.com', role: 'Admin' };
    const base64 = (s: string) => window.btoa(unescape(encodeURIComponent(s))).replace(/=+$/, '');
    const fakeToken = `h.${base64(JSON.stringify(payload))}.s`;

    localStorage.setItem('jwt', fakeToken);

    fixture.detectChanges();

    expect(component.userEmail).toBe('test@example.com');
    expect(component.role).toBe('Admin');

    expect(routerSpy.navigate).not.toHaveBeenCalledWith(['/login'], { replaceUrl: true });
  });

  it('should remove invalid token and navigate to /login when jwtDecode throws', () => {
    localStorage.setItem('jwt', 'invalid.token');

    fixture.detectChanges();

    expect(localStorage.getItem('jwt')).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], { replaceUrl: true });
  });

  it('theme subscription should update isDarkMode', () => {
    mockTheme.isDarkMode$ = of(true);

    fixture = TestBed.createComponent(UserCrudPanelComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    expect(component.isDarkMode).toBeTrue();
  });

  it('goBack should navigate to admin-panel', () => {
    component.goBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard/admin-panel']);
  });

  it('toggleTheme should call themeService.toggle', () => {
    component.toggleTheme();
    expect(mockTheme.toggle).toHaveBeenCalled();
  });

  it('logout should call authService.logout and navigate to /login', () => {
    component.logout();
    expect(mockAuth.logout).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], { replaceUrl: true });
  });

  it('createUser/updateUser/deleteUser navigate to correct routes', () => {
    component.createUser();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard/admin-panel/user/create']);

    component.updateUser();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard/admin-panel/user/update']);

    component.deleteUser();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard/admin-panel/user/delete']);
  });
});
