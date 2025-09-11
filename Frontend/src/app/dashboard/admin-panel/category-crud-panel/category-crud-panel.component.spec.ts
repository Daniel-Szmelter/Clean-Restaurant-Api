import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { CategoryCrudPanelComponent } from './category-crud-panel.component';
import { ThemeService } from '../../../services/theme.service';
import { AuthService } from '../../../auth/auth.service';

class RouterStub {
  navigate = jasmine.createSpy('navigate');
}

class ThemeServiceStub {
  isDarkMode$ = new BehaviorSubject<boolean>(false);
  toggle = jasmine.createSpy('toggle');
}

class AuthServiceStub {
  logout = jasmine.createSpy('logout');
}

function makeJwt(payload: object) {
  const header = btoa(JSON.stringify({ alg: 'none' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.`;
}

describe('CategoryCrudPanelComponent', () => {
  let fixture: ComponentFixture<CategoryCrudPanelComponent>;
  let component: CategoryCrudPanelComponent;
  let routerStub: RouterStub;
  let themeStub: ThemeServiceStub;
  let authStub: AuthServiceStub;

  beforeEach(async () => {
    routerStub = new RouterStub();
    themeStub = new ThemeServiceStub();
    authStub = new AuthServiceStub();

    await TestBed.configureTestingModule({
      imports: [CategoryCrudPanelComponent],
      providers: [
        { provide: Router, useValue: routerStub },
        { provide: ThemeService, useValue: themeStub },
        { provide: AuthService, useValue: authStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryCrudPanelComponent);
    component = fixture.componentInstance;

    localStorage.removeItem('jwt');
  });

  afterEach(() => {
    localStorage.removeItem('jwt');
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should subscribe to theme service and update isDarkMode', fakeAsync(() => {
    fixture.detectChanges();
    expect(component.isDarkMode).toBeFalse();

    themeStub.isDarkMode$.next(true);

    tick();
    fixture.detectChanges();

    expect(component.isDarkMode).toBeTrue();
  }));

  it('should read token from localStorage and set userEmail and role', () => {
    const token = makeJwt({ email: 'me@x.com', role: 'admin' });
    localStorage.setItem('jwt', token);

    fixture.detectChanges();

    expect(component.userEmail).toBe('me@x.com');
    expect(component.role).toBe('admin');
  });

  it('should handle invalid token gracefully', () => {
    localStorage.setItem('jwt', 'not-a-valid.token');

    fixture.detectChanges();

    expect(component.userEmail).toBe('');
    expect(component.role).toBe('');
  });

  it('goBack navigates to admin panel', () => {
    fixture.detectChanges();
    component.goBack();
    expect(routerStub.navigate).toHaveBeenCalledWith(['/dashboard/admin-panel']);
  });

  it('toggleTheme calls themeService.toggle', () => {
    fixture.detectChanges();
    component.toggleTheme();
    expect(themeStub.toggle).toHaveBeenCalled();
  });

  it('logout calls authService.logout and navigates to /login with replaceUrl', () => {
    fixture.detectChanges();
    component.logout();
    expect(authStub.logout).toHaveBeenCalled();
    expect(routerStub.navigate).toHaveBeenCalledWith(['/login'], { replaceUrl: true });
  });

  it('create/update/delete navigate to their routes', () => {
    fixture.detectChanges();

    component.createCategory();
    expect(routerStub.navigate).toHaveBeenCalledWith(['/dashboard/admin-panel/category/create']);

    component.updateCategory();
    expect(routerStub.navigate).toHaveBeenCalledWith(['/dashboard/admin-panel/category/update']);

    component.deleteCategory();
    expect(routerStub.navigate).toHaveBeenCalledWith(['/dashboard/admin-panel/category/delete']);
  });
});
