import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../../../services/theme.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-category-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-create.component.html',
  styleUrls: ['./category-create.component.css'],
})
export class CategoryCreateComponent implements OnInit {
  isDarkMode = false;
  userEmail: string = '';
  role: string = '';
  categoryForm!: FormGroup;
  successMessage: string = '';
  showToast = false;
  toastMessage = '';

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private cd: ChangeDetectorRef,
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
    });

    this.themeService.isDarkMode$.subscribe((mode) => (this.isDarkMode = mode));

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

  toggleTheme() {
    this.themeService.toggle();
  }

  goBack() {
    this.router.navigate(['/dashboard/admin-panel/category']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  submit() {
    this.categoryForm.markAllAsTouched();
    if (this.categoryForm.invalid) return;

    const { name } = this.categoryForm.value;

    this.http.post<{ id: number }>('https://localhost:7145/api/category', { name }).subscribe({
      next: () => {
        this.categoryForm.reset();
        this.showSuccessToast('Category created successfully!');
      },
      error: (err) => {
        console.error('Error creating category:', err);
      },
    });
  }

  private showSuccessToast(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }
}
