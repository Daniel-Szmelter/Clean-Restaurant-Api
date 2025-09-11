import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

import { UserUpdateComponent } from './user-update.component';
import { ThemeService } from '../../../../services/theme.service';
import { AuthService } from '../../../../auth/auth.service';
import { Router } from '@angular/router';

describe('UserUpdateComponent', () => {
  let component: UserUpdateComponent;
  let fixture: ComponentFixture<UserUpdateComponent>;
  let httpMock: HttpTestingController;
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
      imports: [UserUpdateComponent, HttpClientTestingModule],
      providers: [
        { provide: ThemeService, useValue: mockTheme },
        { provide: AuthService, useValue: mockAuth },
        { provide: Router, useValue: routerSpy },
        { provide: ChangeDetectorRef, useValue: mockCd },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(UserUpdateComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('jwt');
  });

  it('should create and load users (success)', fakeAsync(() => {
    component.cardsWrapper = { nativeElement: { clientHeight: 300 } } as any;

    fixture.detectChanges();
    const req = httpMock.expectOne('https://localhost:7145/api/user');
    expect(req.request.method).toBe('GET');

    const sampleUsers = Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      email: `u${i}@x`,
      role: 'User',
    }));
    req.flush(sampleUsers);

    tick(0);

    expect(component.users.length).toBe(8);
    expect(component.loading).toBeFalse();

    expect(component.usersPerPage).toBeGreaterThanOrEqual(1);
    expect(component.pagedUsers.length).toBeLessThanOrEqual(component.usersPerPage);
  }));

  it('loadUsers - error should set errorMessage and loading false', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('https://localhost:7145/api/user');
    req.flush({ msg: 'err' }, { status: 500, statusText: 'Server Error' });

    expect(component.errorMessage).toBe('Failed to load users');
    expect(component.loading).toBeFalse();
  });

  it('calculateUsersPerPage should compute usersPerPage and update pagedUsers', () => {
    component.users = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      email: `e${i}`,
      role: 'User',
    }));
    component.cardsWrapper = { nativeElement: { clientHeight: 400 } } as any;
    component.cardHeight = 70;
    component.cardGap = 16;
    component.currentPage = 1;

    component.calculateUsersPerPage();

    const totalCard = component.cardHeight + component.cardGap;
    const expected = Math.floor(400 / totalCard);
    expect(component.usersPerPage).toBe(expected >= 1 ? expected : 1);

    expect(component.pagedUsers.length).toBeLessThanOrEqual(component.usersPerPage);
  });

  it('maxPage getter returns correct value', () => {
    component.users = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      email: `${i}`,
      role: 'User',
    }));
    component.usersPerPage = 3;
    expect(component.maxPage).toBe(Math.ceil(10 / 3));
  });

  it('nextPage and prevPage update currentPage and pagedUsers appropriately', () => {
    component.users = Array.from({ length: 7 }, (_, i) => ({
      id: i + 1,
      email: `${i}`,
      role: 'User',
    }));
    component.usersPerPage = 3;
    component.currentPage = 1;
    component.updatePagedUsers();

    component.nextPage();
    expect(component.currentPage).toBe(2);
    const start2 = (2 - 1) * 3;
    expect(component.pagedUsers[0].id).toBe(component.users[start2].id);

    component.prevPage();
    expect(component.currentPage).toBe(1);
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

  it('goBack should navigate to user list', () => {
    component.goBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard/admin-panel/user']);
  });

  it('updateUser shows alert when id is undefined', () => {
    spyOn(window, 'alert');
    component.updateUser(undefined);
    expect(window.alert).toHaveBeenCalledWith('User ID is missing!');
  });

  it('updateUser navigates when id provided', () => {
    component.updateUser(42);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard/admin-panel/user/update', 42]);
  });

  it('ngAfterViewInit schedules calculateUsersPerPage via setTimeout', fakeAsync(() => {
    component.cardsWrapper = { nativeElement: { clientHeight: 200 } } as any;

    component.ngAfterViewInit();
    tick(0);

    expect(component.usersPerPage).toBeGreaterThanOrEqual(1);
  }));
});
