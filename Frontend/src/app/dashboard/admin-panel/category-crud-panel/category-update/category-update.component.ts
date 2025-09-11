import {
  Component,
  OnInit,
  ChangeDetectorRef,
  AfterViewInit,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ThemeService } from '../../../../services/theme.service';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../../../../auth/auth.service';

interface Category {
  id: number;
  name: string;
  description?: string;
}

@Component({
  selector: 'app-update-category',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-update.component.html',
  styleUrls: ['./category-update.component.css'],
})
export class CategoryUpdateComponent implements OnInit, AfterViewInit {
  @ViewChild('cardsWrapper') cardsWrapper!: ElementRef;

  isDarkMode = false;
  categories: Category[] = [];
  pagedCategories: Category[] = [];
  loading = true;
  userEmail = '';
  role = '';
  errorMessage = '';

  currentPage = 1;
  categoriesPerPage = 6;
  cardHeight = 70;
  cardGap = 16;

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

    this.loadCategories();

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
      this.calculateCategoriesPerPage();
    }, 0);
  }

  @HostListener('window:resize')
  onResize() {
    this.calculateCategoriesPerPage();
  }

  calculateCategoriesPerPage() {
    if (!this.cardsWrapper) return;

    const wrapperHeight = this.cardsWrapper.nativeElement.clientHeight;
    const totalCardHeight = this.cardHeight + this.cardGap;

    this.categoriesPerPage = Math.floor(wrapperHeight / totalCardHeight);
    if (this.categoriesPerPage < 1) this.categoriesPerPage = 1;

    this.updatePagedCategories();
    this.cd.detectChanges();
  }

  toggleTheme() {
    this.themeService.toggle();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  goBack() {
    this.router.navigate(['/dashboard/admin-panel/category']);
  }

  get maxPage(): number {
    return Math.ceil(this.categories.length / this.categoriesPerPage);
  }

  private loadCategories() {
    this.http.get<Category[]>('https://localhost:7145/api/category/').subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;

        setTimeout(() => {
          this.calculateCategoriesPerPage();
        }, 0);
      },
      error: () => {
        this.errorMessage = 'Failed to load categories';
        this.loading = false;
        this.cd.detectChanges();
      },
    });
  }

  public updatePagedCategories() {
    const start = (this.currentPage - 1) * this.categoriesPerPage;
    const end = start + this.categoriesPerPage;
    this.pagedCategories = this.categories.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.maxPage) {
      this.currentPage++;
      this.updatePagedCategories();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedCategories();
    }
  }

  updateCategory(id: number | undefined) {
    if (id == null) {
      alert('Category ID is missing!');
      return;
    }
    this.router.navigate(['/dashboard/admin-panel/category/update', id]);
  }
}
