import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../../../services/theme.service';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { forkJoin, Observable } from 'rxjs';
import { AuthService } from '../../../../auth/auth.service';

interface Category {
  id: number;
  name: string;
}

interface DishForm {
  name: string;
  price: number;
  categoryName: string;
  description: string;
  restaurantId: number;
}

@Component({
  selector: 'app-restaurant-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './restaurant-create.component.html',
  styleUrls: ['./restaurant-create.component.css'],
})
export class RestaurantCreateComponent implements OnInit {
  isDarkMode = false;
  userEmail = '';
  role = '';
  restaurantForm!: FormGroup;
  categories: Category[] = [];
  successMessage = '';
  showToast = false;
  toastMessage = '';

  private readonly apiBase = 'https://localhost:7145/api';

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private cd: ChangeDetectorRef,
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.restaurantForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      city: ['', [Validators.required, Validators.maxLength(50)]],
      street: ['', [Validators.required, Validators.maxLength(50)]],
      dishes: this.fb.array([]),
    });

    this.addDish();

    this.themeService.isDarkMode$.subscribe((mode) => (this.isDarkMode = mode));

    const token = localStorage.getItem('jwt');
    if (token) {
      try {
        const decoded: any = (jwtDecode as any)(token);
        this.userEmail = decoded?.email || '';
        this.role = decoded?.role || '';
      } catch {
        this.userEmail = '';
        this.role = '';
      }
    }

    this.loadCategories();
  }

  get dishes(): FormArray {
    return this.restaurantForm.get('dishes') as FormArray;
  }

  private createDishGroup() {
    return this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      price: [null, [Validators.required, Validators.min(1), Validators.max(1000)]],
      categoryName: ['', Validators.required],
      description: ['', [Validators.required, Validators.maxLength(100)]],
      restaurantId: [0],
    });
  }

  addDish() {
    const group = this.createDishGroup();

    if (this.categories.length > 0) {
      group.get('categoryName')?.setValue(this.categories[0].name);
    }
    this.dishes.push(group);
  }

  removeDish(index: number) {
    this.dishes.removeAt(index);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  loadCategories() {
    this.http.get<Category[]>(`${this.apiBase}/category`).subscribe({
      next: (cats) => {
        this.categories = cats ?? [];

        if (this.categories.length > 0) {
          this.dishes.controls.forEach((g) => {
            const ctrl = g.get('categoryName');
            if (ctrl && !ctrl.value) {
              ctrl.setValue(this.categories[0].name);
            }
          });
        }
      },
      error: (err) => {
        console.error('Cannot load categories:', err);
        this.showErrorToast('Cannot load categories');
      },
    });
  }

  toggleTheme() {
    this.themeService.toggle();
  }

  goBack() {
    this.router.navigate(['/dashboard/admin-panel/restaurant']);
  }

  submit() {
    this.restaurantForm.markAllAsTouched();
    if (this.restaurantForm.invalid) return;

    const { name, city, street } = this.restaurantForm.value;
    const rawDishes: DishForm[] = (this.restaurantForm.value.dishes || []).map((d: any) => ({
      name: d.name,
      price: d.price,
      categoryName: d.categoryName ?? this.categories[0]?.name ?? 'DefaultCategory',
      description: d.description,
      restaurantId: 0,
    }));

    this.http.post<{ id: number }>(`${this.apiBase}/restaurant`, { name, city, street }).subscribe({
      next: (res) => {
        const restaurantId = res?.id;
        if (!restaurantId) {
          console.error('Restaurant creation returned invalid id', res);
          this.showErrorToast('Restaurant creation failed');
          return;
        }

        const dishesToCreate = rawDishes.map((d) => ({ ...d, restaurantId }));

        const requests: Observable<any>[] = dishesToCreate.map((dish) =>
          this.http.post(`${this.apiBase}/dish`, dish),
        );

        if (requests.length > 0) {
          forkJoin(requests).subscribe({
            next: () => this.finishCreation(),
            error: (err) => {
              console.error('Error creating dishes:', err);
              this.showErrorToast('Error creating dishes');
            },
          });
        } else {
          this.finishCreation();
        }
      },
      error: (err) => {
        console.error('Error creating restaurant:', err);
        this.showErrorToast('Error creating restaurant');
      },
    });
  }

  private finishCreation() {
    this.restaurantForm.reset();
    while (this.dishes.length !== 0) this.dishes.removeAt(0);
    this.addDish();
    this.showSuccessToast('Restaurant created successfully!');
    this.cd.detectChanges();
  }

  private showSuccessToast(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }

  private showErrorToast(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 5000);
  }
}
