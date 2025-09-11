import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';

@Component({ standalone: true, template: '<div>Home</div>' })
class DummyHomeComponent {}

@Component({ standalone: true, template: '<div>Login</div>' })
class DummyLoginComponent {}

@Component({ standalone: true, template: '<div>Register</div>' })
class DummyRegisterComponent {}

@Component({ standalone: true, template: '<div>User Dashboard</div>' })
class DummyUserDashboardComponent {}

@Component({ standalone: true, template: '<div>Admin Panel</div>' })
class DummyAdminPanelComponent {}

describe('Routing integration', () => {
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: '', component: DummyHomeComponent },
          { path: 'login', component: DummyLoginComponent },
          { path: 'register', component: DummyRegisterComponent },
          { path: 'dashboard/user', component: DummyUserDashboardComponent },
          { path: 'dashboard/admin-panel', component: DummyAdminPanelComponent },

          { path: '**', redirectTo: '' },
        ]),

        DummyHomeComponent,
        DummyLoginComponent,
        DummyRegisterComponent,
        DummyUserDashboardComponent,
        DummyAdminPanelComponent,
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    router.initialNavigation();
  });

  it('should navigate to /login', async () => {
    await router.navigate(['/login']);
    expect(location.path()).toBe('/login');
  });

  it('should navigate to /register', async () => {
    await router.navigate(['/register']);
    expect(location.path()).toBe('/register');
  });

  it('should navigate to /dashboard/user', async () => {
    await router.navigate(['/dashboard/user']);
    expect(location.path()).toBe('/dashboard/user');
  });

  it('should navigate to /dashboard/admin-panel', async () => {
    await router.navigate(['/dashboard/admin-panel']);
    expect(location.path()).toBe('/dashboard/admin-panel');
  });

  it('should redirect unknown routes to home (wildcard)', async () => {
    await router.navigate(['/some/unknown/path']);
    expect(location.path()).toBe('/');
  });
});
