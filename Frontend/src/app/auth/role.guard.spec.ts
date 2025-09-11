import { ActivatedRouteSnapshot } from '@angular/router';
import { RoleGuard } from './role.guard';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let authSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'getUserRole']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    // Tworzymy instancję strażnika bez TestBed — proste i szybkie
    guard = new RoleGuard(authSpy, routerSpy);
  });

  it('should redirect to /login when not authenticated', () => {
    authSpy.isAuthenticated.and.returnValue(false);

    const route = { data: { roles: ['Admin'] } } as unknown as ActivatedRouteSnapshot;
    const result = guard.canActivate(route);

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should allow access when authenticated and role matches (case-insensitive)', () => {
    authSpy.isAuthenticated.and.returnValue(true);
    authSpy.getUserRole.and.returnValue('user'); // lowercase

    const route = { data: { roles: ['User', 'Admin'] } } as unknown as ActivatedRouteSnapshot;
    const result = guard.canActivate(route);

    expect(result).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to /unauthorized when authenticated but role does not match', () => {
    authSpy.isAuthenticated.and.returnValue(true);
    authSpy.getUserRole.and.returnValue('Manager');

    const route = { data: { roles: ['Admin'] } } as unknown as ActivatedRouteSnapshot;
    const result = guard.canActivate(route);

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/unauthorized']);
  });

  it('should redirect to /unauthorized when authenticated but user role is missing', () => {
    authSpy.isAuthenticated.and.returnValue(true);
    authSpy.getUserRole.and.returnValue(null);

    const route = { data: { roles: ['Admin'] } } as unknown as ActivatedRouteSnapshot;
    const result = guard.canActivate(route);

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/unauthorized']);
  });
});
