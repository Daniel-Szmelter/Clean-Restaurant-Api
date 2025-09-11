import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

class RouterStub {
  navigateByUrl(url: string) {}
}

describe('AuthService', () => {
  let service: AuthService;
  let router: Router;

  const mockToken = 'mock-jwt-token';
  const decodedToken = {
    id: '123',
    email: 'test@example.com',
    role: 'user',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, { provide: Router, useClass: RouterStub }],
    });

    service = TestBed.inject(AuthService);
    router = TestBed.inject(Router);

    spyOn<any>(service, 'decodeToken').and.callFake(() => decodedToken);

    spyOn(localStorage, 'setItem').and.callFake(() => {});
    spyOn(localStorage, 'getItem').and.callFake((key: string) =>
      key === 'jwt' ? mockToken : null,
    );
    spyOn(localStorage, 'removeItem').and.callFake(() => {});
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save token to localStorage', () => {
    service.saveToken(mockToken);
    expect(localStorage.setItem).toHaveBeenCalledWith('jwt', mockToken);
  });

  it('should get token from localStorage', () => {
    const token = service.getToken();
    expect(token).toBe(mockToken);
    expect(localStorage.getItem).toHaveBeenCalledWith('jwt');
  });

  it('should remove token on logout', () => {
    service.logout();
    expect(localStorage.removeItem).toHaveBeenCalledWith('jwt');
  });

  it('should return true if authenticated', () => {
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('should return false if not authenticated', () => {
    (localStorage.getItem as jasmine.Spy).and.returnValue(null);
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('should return user role from token', () => {
    const role = service.getUserRole();
    expect(role).toBe('user');
  });

  it('should return null if no token for role', () => {
    (localStorage.getItem as jasmine.Spy).and.returnValue(null);
    expect(service.getUserRole()).toBeNull();
  });

  it('should return user email from token', () => {
    const email = service.getUserEmail();
    expect(email).toBe('test@example.com');
  });

  it('should return null if no token for email', () => {
    (localStorage.getItem as jasmine.Spy).and.returnValue(null);
    expect(service.getUserEmail()).toBeNull();
  });

  it('should return user ID from token', () => {
    const id = service.getUserId();
    expect(id).toBe('123');
  });

  it('should return null if no token for user ID', () => {
    (localStorage.getItem as jasmine.Spy).and.returnValue(null);
    expect(service.getUserId()).toBeNull();
  });

  it('should return full user info', () => {
    const user = service.getUserInfo();
    expect(user).toEqual({ id: '123', email: 'test@example.com', role: 'user' });
  });

  it('should return nulls in user info if no token', () => {
    (localStorage.getItem as jasmine.Spy).and.returnValue(null);
    const user = service.getUserInfo();
    expect(user).toEqual({ id: null, email: null, role: null });
  });
});
