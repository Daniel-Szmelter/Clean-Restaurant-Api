import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  AfterViewInit,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { ThemeService } from '../../../../services/theme.service';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../../../../auth/auth.service';

interface User {
  id: number;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

@Component({
  selector: 'app-delete-user',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './user-delete.component.html',
  styleUrls: ['./user-delete.component.css'],
})
export class UserDeleteComponent implements OnInit, AfterViewInit {
  @ViewChild('cardsWrapper') cardsWrapper!: ElementRef;

  isDarkMode = false;
  users: User[] = [];
  loading = true;
  userEmail = '';
  role = '';
  errorMessage = '';
  showToast = false;
  toastMessage = '';

  currentPage = 1;
  usersPerPage = 6;

  cardHeight = 70;
  cardGap = 16;
  pagedUsers: User[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private cd: ChangeDetectorRef,
    private themeService: ThemeService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.themeService.isDarkMode$.subscribe((mode) => {
      this.isDarkMode = mode;
      this.cd.detectChanges();
    });

    this.loadUsers();

    const token = localStorage.getItem('jwt');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);

        this.userEmail = decoded['email'] || '';
        this.role = decoded['role'] || '';
      } catch {
        this.userEmail = '';
        this.role = '';
      }
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.calculateUsersPerPage();
    }, 0);
  }

  @HostListener('window:resize')
  onResize() {
    this.calculateUsersPerPage();
  }

  calculateUsersPerPage() {
    if (!this.cardsWrapper) return;

    const wrapperHeight = this.cardsWrapper.nativeElement.clientHeight;
    const totalCardHeight = this.cardHeight + this.cardGap;

    this.usersPerPage = Math.floor(wrapperHeight / totalCardHeight);
    if (this.usersPerPage < 1) this.usersPerPage = 1;

    this.updatePagedUsers();
    this.cd.detectChanges();
  }

  toggleTheme() {
    this.themeService.toggle();
  }

  get maxPage(): number {
    return Math.ceil(this.users.length / this.usersPerPage);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  goBack() {
    this.router.navigate(['/dashboard/admin-panel/user']);
  }

  private loadUsers() {
    this.http.get<User[]>('https://localhost:7145/api/user').subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;

        setTimeout(() => {
          this.calculateUsersPerPage();
        }, 0);
      },
      error: () => {
        this.errorMessage = 'Failed to load users';
        this.loading = false;
        this.cd.detectChanges();
      },
    });
  }

  private updatePagedUsers() {
    const start = (this.currentPage - 1) * this.usersPerPage;
    const end = start + this.usersPerPage;
    this.pagedUsers = this.users.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.maxPage) {
      this.currentPage++;
      this.updatePagedUsers();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedUsers();
    }
  }

  private showSuccessToast(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }

  deleteUser(id: number | undefined) {
    if (id == null) {
      alert('User ID is missing!');
      return;
    }

    if (!confirm('Are you sure you want to delete this user?')) return;

    this.http.delete(`https://localhost:7145/api/user/${id}`).subscribe({
      next: () => {
        this.http.get<User[]>('https://localhost:7145/api/user').subscribe({
          next: (data) => {
            this.users = data;
            this.loading = false;

            setTimeout(() => {
              this.calculateUsersPerPage();
              this.showSuccessToast('User deleted successfully!');
            }, 0);
          },
          error: () => alert('Failed to refresh users'),
        });
      },
      error: () => alert('Failed to delete user'),
    });
  }

  updateUser(id: number | undefined) {
    if (id == null) {
      alert('User ID is missing!');
      return;
    }
    this.router.navigate(['/dashboard/admin-panel/user/update', id]);
  }
}
