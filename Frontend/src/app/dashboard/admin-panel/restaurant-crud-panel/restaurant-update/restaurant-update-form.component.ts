import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ThemeService } from '../../../../services/theme.service';
import { JsonPatchOperation } from '../../../../models/json-patch-operation.model';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../../../../auth/auth.service';

export function positiveRequired(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    return value > 0 ? null : { required: true };
  };
}

interface Category {
  id: number;
  name: string;
}

@Component({
  selector: 'app-restaurant-update-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './restaurant-update-form.component.html',
  styleUrls: ['./restaurant-update-form.component.css'],
})
export class RestaurantUpdateFormComponent implements OnInit {
  restaurantForm!: FormGroup;
  isDarkMode = false;
  loading = true;
  restaurantId!: number;
  userEmail: string = '';
  role: string = '';
  categories: Category[] = [];
  errorMessage: string = '';

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

    this.restaurantId = +this.route.snapshot.params['id'];

    this.restaurantForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      city: ['', [Validators.required, Validators.maxLength(50)]],
      street: ['', [Validators.required, Validators.maxLength(50)]],
      dishes: this.fb.array([]),
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

  get dishes(): FormArray {
    return this.restaurantForm.get('dishes') as FormArray;
  }

  addDish(dishData?: any) {
    const defaultCategoryId = this.categories.length > 0 ? this.categories[0].id : null;

    this.dishes.push(
      this.fb.group({
        name: [dishData?.name || '', [Validators.required, Validators.maxLength(50)]],
        price: [dishData?.price || 0, [positiveRequired(), Validators.max(1000)]],
        categoryId: [dishData?.categoryId ?? defaultCategoryId, Validators.required],
        description: [
          dishData?.description || '',
          [Validators.required, Validators.maxLength(100)],
        ],
      }),
    );
  }

  removeDish(index: number) {
    this.dishes.removeAt(index);
  }

  goBack() {
    this.router.navigate(['/dashboard/admin-panel/restaurant/update']);
  }

  toggleTheme() {
    this.themeService.toggle();
  }

  submit() {
    this.restaurantForm.markAllAsTouched();
    if (this.restaurantForm.invalid) return;

    const formValue = this.restaurantForm.value;

    const patchDoc: JsonPatchOperation[] = [
      { op: 'replace', path: '/name', value: formValue.name },
      { op: 'replace', path: '/city', value: formValue.city },
      { op: 'replace', path: '/street', value: formValue.street },
      { op: 'replace', path: '/dishes', value: formValue.dishes },
    ];

    const headers = new HttpHeaders({ 'Content-Type': 'application/json-patch+json' });

    this.http
      .patch(`https://localhost:7145/api/restaurant/${this.restaurantId}`, patchDoc, {
        headers,
        responseType: 'text',
      })
      .subscribe({
        next: () => {
          this.showSuccessToast('Restaurant updated successfully!');
          setTimeout(() => 3000);
        },
        error: (err) => console.error('Error updating restaurant:', err),
      });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  private loadCategories() {
    this.http.get<Category[]>('https://localhost:7145/api/category').subscribe({
      next: (cats) => {
        this.categories = cats;
        this.loadRestaurant(this.restaurantId);
      },
      error: (err) => console.error('Cannot load categories:', err),
    });
  }

  private loadRestaurant(id: number) {
    this.http.get<any>(`https://localhost:7145/api/restaurant/${id}`).subscribe({
      next: (res) => {
        this.restaurantForm.patchValue({
          name: res.name,
          city: res.city,
          street: res.street,
        });

        res.dishes.forEach((d: any) => {
          const categoryId = d.categoryId ?? this.categories[0]?.id ?? null;
          this.addDish({ ...d, categoryId });
        });

        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Cannot load restaurant';
        this.loading = false;
        console.error('Error loading restaurant:', err);
      },
    });
  }

  showToast = false;
  toastMessage = '';

  private showSuccessToast(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }
}
