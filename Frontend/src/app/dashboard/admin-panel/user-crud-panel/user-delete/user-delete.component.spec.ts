import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { UserDeleteComponent } from './user-delete.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { ChangeDetectorRef, ElementRef } from '@angular/core';
import { AuthService } from '../../../../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

interface User {
  id: number;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

describe('UserDeleteComponent', () => {
  let component: UserDeleteComponent;
  let fixture: ComponentFixture<UserDeleteComponent>;
  let httpMock: HttpTestingController;

  let themeSubject!: Subject<boolean>;
  let themeServiceMock!: { isDarkMode$: any; toggle: jasmine.Spy };

  const routerMock = {
    navigate: jasmine.createSpy('navigate'),
  };

  const authServiceMock = {
    logout: jasmine.createSpy('logout'),
  };

  const cdRefMock: Partial<ChangeDetectorRef> = {
    detectChanges: jasmine.createSpy('detectChanges'),
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [UserDeleteComponent, HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: ChangeDetectorRef, useValue: cdRefMock },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    themeSubject = new Subject<boolean>();
    themeServiceMock = {
      isDarkMode$: themeSubject.asObservable(),
      toggle: jasmine.createSpy('toggle'),
    };

    fixture = TestBed.createComponent(UserDeleteComponent);
    component = fixture.componentInstance;

    const testHttp = TestBed.inject(HttpClient);
    (component as any).http = testHttp;

    (component as any).themeService = themeServiceMock as any;

    httpMock = TestBed.inject(HttpTestingController);

    localStorage.removeItem('jwt');
  });

  afterEach(() => {
    httpMock.verify();
    (cdRefMock.detectChanges as jasmine.Spy).calls.reset();
    (themeServiceMock.toggle as jasmine.Spy).calls.reset();
    (routerMock.navigate as jasmine.Spy).calls.reset();
    (authServiceMock.logout as jasmine.Spy).calls.reset();

    themeSubject.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should load users and set loading false (no token case)', fakeAsync(() => {
    spyOn(component as any, 'calculateUsersPerPage');

    fixture.detectChanges();

    const req = httpMock.expectOne('https://localhost:7145/api/user');
    expect(req.request.method).toBe('GET');

    const users: User[] = [
      { id: 1, email: 'a@a.com', role: 'Admin' },
      { id: 2, email: 'b@b.com', role: 'User' },
    ];
    req.flush(users);

    tick(0);

    expect(component.users.length).toBe(2);
    expect(component.loading).toBeFalse();
    expect((component as any).calculateUsersPerPage).toHaveBeenCalled();
  }));

  it('calculateUsersPerPage should compute usersPerPage and update pagedUsers', () => {
    const fakeHeight = 300;
    component.cardsWrapper = { nativeElement: { clientHeight: fakeHeight } } as ElementRef;

    component.users = [];
    for (let i = 1; i <= 10; i++) {
      component.users.push({ id: i, email: `u${i}@e.com`, role: 'User' });
    }

    component.cardHeight = 50;
    component.cardGap = 10;

    component.calculateUsersPerPage();

    const totalCard = component.cardHeight + component.cardGap;
    expect(component.usersPerPage).toBe(Math.floor(fakeHeight / totalCard));
    expect(component.pagedUsers.length).toBe(component.usersPerPage);
  });

  it('maxPage / nextPage / prevPage behavior', () => {
    component.users = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      email: `${i}@x`,
      role: 'User',
    }));
    component.usersPerPage = 5;
    component.currentPage = 1;
    (component as any).updatePagedUsers();
    expect(component.maxPage).toBe(3);

    component.nextPage();
    expect(component.currentPage).toBe(2);

    component.nextPage();
    expect(component.currentPage).toBe(3);
    component.nextPage();
    expect(component.currentPage).toBe(3);

    component.prevPage();
    expect(component.currentPage).toBe(2);
    component.prevPage();
    expect(component.currentPage).toBe(1);
    component.prevPage();
    expect(component.currentPage).toBe(1);
  });

  it('deleteUser should alert when id missing', () => {
    spyOn(window, 'alert');
    component.deleteUser(undefined);
    expect(window.alert).toHaveBeenCalledWith('User ID is missing!');
  });

  it('deleteUser should perform delete then refresh users and show toast on success', fakeAsync(() => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(component as any, 'calculateUsersPerPage');

    component.deleteUser(5);

    const delReq = httpMock.expectOne('https://localhost:7145/api/user/5');
    expect(delReq.request.method).toBe('DELETE');
    delReq.flush({});

    const getReq = httpMock.expectOne('https://localhost:7145/api/user');
    expect(getReq.request.method).toBe('GET');

    const newUsers: User[] = [{ id: 1, email: 'a@a.com', role: 'User' }];
    getReq.flush(newUsers);

    tick(0);

    expect(component.users.length).toBe(1);
    expect(component.showToast).toBeTrue();
    expect(component.toastMessage).toBe('User deleted successfully!');

    tick(3000);
    expect(component.showToast).toBeFalse();
  }));

  it('deleteUser should alert on delete error', fakeAsync(() => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');

    component.deleteUser(42);

    const delReq = httpMock.expectOne('https://localhost:7145/api/user/42');
    expect(delReq.request.method).toBe('DELETE');
    delReq.flush({}, { status: 500, statusText: 'Server Error' });

    expect(window.alert).toHaveBeenCalledWith('Failed to delete user');
  }));

  it('updateUser should navigate when id provided and alert when missing', () => {
    component.updateUser(7);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard/admin-panel/user/update', 7]);

    spyOn(window, 'alert');
    component.updateUser(undefined);
    expect(window.alert).toHaveBeenCalledWith('User ID is missing!');
  });

  it('logout should call authService.logout and navigate to /login', () => {
    component.logout();
    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login'], { replaceUrl: true });
  });

  it('goBack should navigate to user list', () => {
    component.goBack();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard/admin-panel/user']);
  });
});
