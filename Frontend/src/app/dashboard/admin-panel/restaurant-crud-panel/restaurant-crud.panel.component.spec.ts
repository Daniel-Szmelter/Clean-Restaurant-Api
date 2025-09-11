import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RestaurantCrudPanelComponent } from './restaurant-crud-panel.component';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';
import { ThemeService } from '../../../services/theme.service';

describe('RestaurantCrudPanelComponent', () => {
  let component: RestaurantCrudPanelComponent;
  let fixture: ComponentFixture<RestaurantCrudPanelComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let cdSpy: jasmine.SpyObj<ChangeDetectorRef>;
  let themeServiceMock: Partial<ThemeService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let isDarkMode$: BehaviorSubject<boolean>;

  let locationMockedByTestBootstrap = false;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    cdSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
    isDarkMode$ = new BehaviorSubject<boolean>(false);
    themeServiceMock = {
      isDarkMode$: isDarkMode$,
      toggle: jasmine.createSpy('toggle'),
    };
    authServiceSpy = jasmine.createSpyObj('AuthService', ['logout']);

    await TestBed.configureTestingModule({
      imports: [RestaurantCrudPanelComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ChangeDetectorRef, useValue: cdSpy },
        { provide: ThemeService, useValue: themeServiceMock },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RestaurantCrudPanelComponent);
    component = fixture.componentInstance;

    locationMockedByTestBootstrap = !!(window as any).__testLocationMocked;

    localStorage.removeItem('jwt');
  });

  afterEach(() => {
    isDarkMode$.complete();
    localStorage.removeItem('jwt');
  });

  it('subscribes to themeService.isDarkMode$ and updates isDarkMode when value changes', () => {
    fixture.detectChanges();

    expect(component.isDarkMode).toBeFalse();

    isDarkMode$.next(true);

    expect(component.isDarkMode).toBeTrue();
  });

  it('navigates to /login with replaceUrl when no jwt in localStorage', () => {
    localStorage.removeItem('jwt');
    fixture.detectChanges();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], { replaceUrl: true });
  });

  function makeJwtWithPayload(payloadObj: any): string {
    function base64url(input: string) {
      return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
    const header = base64url(JSON.stringify({ alg: 'none', typ: 'JWT' }));
    const payload = base64url(JSON.stringify(payloadObj));

    return `${header}.${payload}.`;
  }

  it('decodes a valid jwt and sets userEmail and role (real jwt-decode used)', () => {
    const payload = { email: 'user@test.com', role: 'admin' };
    const token = makeJwtWithPayload(payload);
    localStorage.setItem('jwt', token);

    fixture.detectChanges();

    expect(component.userEmail).toBe('user@test.com');
    expect(component.role).toBe('admin');
    expect(routerSpy.navigate).not.toHaveBeenCalledWith(['/login'], { replaceUrl: true });
  });

  it('removes jwt and navigates to /login when jwtDecode throws (malformed token)', () => {
    const badToken = 'BAD.TOKEN';
    localStorage.setItem('jwt', badToken);

    spyOn(localStorage, 'removeItem').and.callThrough();
    fixture.detectChanges();

    expect(localStorage.removeItem).toHaveBeenCalledWith('jwt');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], { replaceUrl: true });
  });

  it('goBack navigates to /dashboard/admin-panel', () => {
    component.goBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard/admin-panel']);
  });

  it('createRestaurant navigates to create path', () => {
    component.createRestaurant();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard/admin-panel/restaurant/create']);
  });

  it('updateRestaurant navigates to update path', () => {
    component.updateRestaurant();
    expect(routerSpy.navigate).toHaveBeenCalledWith([`/dashboard/admin-panel/restaurant/update`]);
  });

  it('deleteRestaurant navigates to delete path', () => {
    component.deleteRestaurant();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard/admin-panel/restaurant/delete']);
  });

  it('toggleTheme calls themeService.toggle', () => {
    component.toggleTheme();
    expect((themeServiceMock as any).toggle).toHaveBeenCalled();
  });

  it('logout calls authService.logout and (if test bootstrap mocked location) updates location.href, otherwise ensure logout executed', () => {
    if ((window as any).__getLastLocationCall) {
      (window as any).__lastLocationCall = null;
    }

    component.logout();
    expect(authServiceSpy.logout).toHaveBeenCalled();

    if (locationMockedByTestBootstrap) {
      const mockLoc: any = (window as any).location;
      expect(mockLoc.href).toBe('/login');
    } else {
      const last = (window as any).__getLastLocationCall
        ? (window as any).__getLastLocationCall()
        : null;

      if (last) {
        expect(
          last.url === '/login' ||
            last.kind === 'assign' ||
            last.kind === 'replace' ||
            last.kind === 'href_set',
        ).toBeTrue();
      } else {
        expect(authServiceSpy.logout).toHaveBeenCalled();
      }
    }
  });
});
