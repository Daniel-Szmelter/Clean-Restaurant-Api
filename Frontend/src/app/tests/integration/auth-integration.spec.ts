import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';

import { AuthService } from '../../auth/auth.service';
import { AuthGuard } from '../../auth/auth.guard';
import { RoleGuard } from '../../auth/role.guard';

@Component({ standalone: true, template: '<div>Home</div>' })
class DummyHomeComponent {}

@Component({ standalone: true, template: '<div>Login</div>' })
class DummyLoginComponent {}

@Component({ standalone: true, template: '<div>User Dashboard</div>' })
class DummyUserComponent {}

@Component({ standalone: true, template: '<div>Admin Panel</div>' })
class DummyAdminComponent {}

@Component({ standalone: true, template: '<div>Unauthorized</div>' })
class DummyUnauthorizedComponent {}

describe('Auth integration (AuthGuard + RoleGuard)', () => {
  let router: Router;
  let location: Location;
  let authSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'getUserRole']);

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: '', component: DummyHomeComponent },
          { path: 'login', component: DummyLoginComponent },
          { path: 'unauthorized', component: DummyUnauthorizedComponent },
          { path: 'user', component: DummyUserComponent, canActivate: [AuthGuard] },
          {
            path: 'admin',
            component: DummyAdminComponent,
            canActivate: [AuthGuard, RoleGuard],
            data: { roles: ['Admin'] },
          },
        ]),

        DummyHomeComponent,
        DummyLoginComponent,
        DummyUserComponent,
        DummyAdminComponent,
        DummyUnauthorizedComponent,
      ],
      providers: [{ provide: AuthService, useValue: spy }, AuthGuard, RoleGuard],
    }).compileComponents();

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    authSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    router.initialNavigation();
  });

  it('should redirect to /login if not authenticated (AuthGuard)', async () => {
    authSpy.isAuthenticated.and.returnValue(false);

    await router.navigate(['/user']);
    expect(location.path()).toBe('/login');
  });

  it('should allow navigation to /user when authenticated (AuthGuard)', async () => {
    authSpy.isAuthenticated.and.returnValue(true);

    await router.navigate(['/user']);
    expect(location.path()).toBe('/user');
  });

  it('should redirect to /unauthorized when role is not allowed (RoleGuard)', async () => {
    authSpy.isAuthenticated.and.returnValue(true);
    authSpy.getUserRole.and.returnValue('User');

    await router.navigate(['/admin']);
    expect(location.path()).toBe('/unauthorized');
  });

  it('should allow navigation to /admin when role is Admin (RoleGuard)', async () => {
    authSpy.isAuthenticated.and.returnValue(true);
    authSpy.getUserRole.and.returnValue('Admin');

    await router.navigate(['/admin']);
    expect(location.path()).toBe('/admin');
  });
});
