import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

import { AdminPanelComponent } from './admin-panel.component';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../auth/auth.service';

describe('AdminPanelComponent', () => {
  let component: AdminPanelComponent;
  let fixture: ComponentFixture<AdminPanelComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let mockTheme: any;
  let mockAuth: any;
  let mockCd: ChangeDetectorRef;
  let mockFullReload: any;

  const base64 = (s: string) => window.btoa(unescape(encodeURIComponent(s))).replace(/=+$/, '');

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
    mockFullReload = {
      go: jasmine.createSpy('go'),
    };

    localStorage.removeItem('jwt');

    await TestBed.configureTestingModule({
      imports: [AdminPanelComponent],
      providers: [
        { provide: ThemeService, useValue: mockTheme },
        { provide: AuthService, useValue: mockAuth },
        { provide: Router, useValue: routerSpy },
        { provide: ChangeDetectorRef, useValue: mockCd },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPanelComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.removeItem('jwt');
  });

  it('should navigate to /login when no token is present', () => {
    fixture.detectChanges();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], { replaceUrl: true });
  });

  it('should set userEmail and role when a valid token is present', () => {
    const payload = { email: 'test@example.com', role: 'admin' };
    const fakeToken = `h.${base64(JSON.stringify(payload))}.s`;
    localStorage.setItem('jwt', fakeToken);

    fixture.detectChanges();

    expect(component.userEmail).toBe('test@example.com');
    expect(component.role).toBe('admin');
    expect(routerSpy.navigate).not.toHaveBeenCalledWith(['/login'], { replaceUrl: true });
  });

  it('should remove invalid token and navigate to /login when jwtDecode throws', () => {
    localStorage.setItem('jwt', 'invalid.token');

    fixture.detectChanges();

    expect(localStorage.getItem('jwt')).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], { replaceUrl: true });
  });

  it('should set isDarkMode from theme subscription', () => {
    mockTheme.isDarkMode$ = of(true);
    fixture = TestBed.createComponent(AdminPanelComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    expect(component.isDarkMode).toBeTrue();
  });

  it('should call themeService.toggle when toggleTheme is invoked', () => {
    component.toggleTheme();
    expect(mockTheme.toggle).toHaveBeenCalled();
  });

  it('should call authService.logout when logout is invoked', () => {
    component.logout();
    expect(mockAuth.logout).toHaveBeenCalled();
  });

  it('should navigate to restaurant management when manageRestaurants is invoked', () => {
    component.manageRestaurants();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard/admin-panel/restaurant']);
  });

  it('should navigate to category management when manageCategories is invoked', () => {
    component.manageCategories();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard/admin-panel/category']);
  });

  it('should navigate to user management when manageUsers is invoked', () => {
    component.manageUsers();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard/admin-panel/user']);
  });

  it('should properly format roleDisplay', () => {
    component.role = 'admin';
    expect(component.roleDisplay).toBe('Admin');
    component.role = '';
    expect(component.roleDisplay).toBe('');
  });
});
