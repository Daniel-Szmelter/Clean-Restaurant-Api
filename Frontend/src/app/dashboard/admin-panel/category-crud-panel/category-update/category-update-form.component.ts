import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ThemeService } from '../../../../services/theme.service';
import { JsonPatchOperation } from '../../../../models/json-patch-operation.model';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../../../../auth/auth.service';

interface Category {
  id: number;
  name: string;
}

@Component({
  selector: 'app-category-update-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-update-form.component.html',
  styleUrls: ['./category-update-form.component.css'],
})
export class CategoryUpdateFormComponent implements OnInit {
  categoryForm!: FormGroup;
  isDarkMode = false;
  loading = true;
  categoryId!: number;
  userEmail = '';
  role = '';
  errorMessage = '';
  showToast = false;
  toastMessage = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private themeService: ThemeService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.themeService.isDarkMode$.subscribe((mode) => (this.isDarkMode = mode));

    this.categoryId = +this.route.snapshot.params['id'];

    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
    });

    this.loadCategory();

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
    this.router.navigate(['/dashboard/admin-panel/category/update']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  private loadCategory() {
    this.http.get<Category>(`https://localhost:7145/api/category/${this.categoryId}`).subscribe({
      next: (res) => {
        this.categoryForm.patchValue({
          name: res.name,
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading category:', err);
        this.errorMessage = 'Cannot load category';
        this.loading = false;
      },
    });
  }

  submit() {
    this.categoryForm.markAllAsTouched();
    if (this.categoryForm.invalid) return;

    const formValue = this.categoryForm.value;

    const patchDoc: JsonPatchOperation[] = [
      { op: 'replace', path: '/name', value: formValue.name },
    ];

    const headers = new HttpHeaders({ 'Content-Type': 'application/json-patch+json' });

    this.http
      .patch(`https://localhost:7145/api/category/${this.categoryId}`, patchDoc, {
        headers,
        responseType: 'text',
      })
      .subscribe({
        next: () => this.showSuccessToast('Category updated successfully!'),
        error: (err) => console.error('Error updating category:', err),
      });
  }

  private showSuccessToast(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }
}
