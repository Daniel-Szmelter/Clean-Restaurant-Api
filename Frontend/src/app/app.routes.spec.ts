import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { routes } from './app.routes';
import { LoginComponent } from './auth/login.component';

describe('App Routing', () => {
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
    }).compileComponents();

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    router.initialNavigation();
  });

  it('should redirect unknown path to home', async () => {
    await router.navigate(['/some/unknown/path']);
    expect(location.path()).toBe('/');
  });

  it('should navigate to login', async () => {
    await router.navigate(['/login']);
    expect(location.path()).toBe('/login');
  });
});
