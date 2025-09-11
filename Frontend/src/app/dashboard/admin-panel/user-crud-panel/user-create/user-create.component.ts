import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../../../services/theme.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.css'],
})
export class UserCreateComponent implements OnInit {
  isDarkMode = false;
  userEmail = '';
  role = '';
  userForm!: FormGroup;
  showToast = false;
  toastMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private themeService: ThemeService,
    private cd: ChangeDetectorRef,
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.themeService.isDarkMode$.subscribe((mode) => {
      this.isDarkMode = mode;
      this.cd.detectChanges();
    });

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

    this.userForm = this.fb.group(
      {
        email: this.fb.control('', {
          validators: [Validators.required, Validators.email],
          asyncValidators: [this.emailExistsValidator()],
          updateOn: 'blur',
        }),
        password: ['', [Validators.required, Validators.maxLength(50), Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        role: [null, Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;

    if (password && confirm && password !== confirm) {
      group.get('confirmPassword')?.setErrors({ mismatch: true });
    } else {
      const errors = group.get('confirmPassword')?.errors;
      if (errors) {
        delete errors['mismatch'];
        if (Object.keys(errors).length === 0) {
          group.get('confirmPassword')?.setErrors(null);
        } else {
          group.get('confirmPassword')?.setErrors(errors);
        }
      }
    }
    return null;
  }
  emailExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) return of(null);

      return this.http.get<any[]>(`https://localhost:7145/api/user?email=${control.value}`).pipe(
        map((users) => {
          const exists = users.some((u) => u.email.toLowerCase() === control.value.toLowerCase());
          return exists ? { emailExists: true } : null;
        }),
        catchError(() => of(null)),
      );
    };
  }

  goBack() {
    this.router.navigate(['/dashboard/admin-panel/user']);
  }

  toggleTheme() {
    this.themeService.toggle();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  submit() {
    this.userForm.markAllAsTouched();

    if (this.userForm.invalid) return;

    const payload = this.userForm.value;
    this.http.post('https://localhost:7145/api/user/', payload).subscribe({
      next: () => {
        this.toastMessage = 'User created successfully!';
        this.showToast = true;
        setTimeout(() => (this.showToast = false), 3000);
        this.userForm.reset();
      },
      error: (err) => {
        this.toastMessage = err.error?.message || 'Error creating user';
        this.showToast = true;
        setTimeout(() => (this.showToast = false), 3000);
      },
    });
  }
}
