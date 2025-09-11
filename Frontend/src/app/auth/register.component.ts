import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  registerError = false;
  shake = false;
  isDarkMode = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private cd: ChangeDetectorRef,
    private themeService: ThemeService,
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.themeService.isDarkMode$.subscribe((mode) => {
      this.isDarkMode = mode;
      this.cd.detectChanges();
    });
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.themeService.setDarkMode(this.isDarkMode);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToHome() {
    this.router.navigateByUrl('/');
  }

  onSubmit() {
    this.registerForm.markAllAsTouched();
    const { email, password, confirmPassword } = this.registerForm.value;

    if (!this.registerForm.valid) {
      this.errorMessage = this.registerForm.controls['password'].errors?.['minlength']
        ? 'Password must be at least 6 characters'
        : 'Please fill in all fields with valid data';
      this.registerError = true;
      this.triggerShake();
      return;
    }

    if (password !== confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      this.registerError = true;
      this.registerForm.patchValue({ password: '', confirmPassword: '' });
      this.triggerShake();
      return;
    }

    const dto = { email, password, confirmPassword };
    this.http.post('https://localhost:7145/api/auth/register', dto).subscribe({
      next: () => {
        this.registerError = false;
        this.errorMessage = '';
        this.router.navigate(['/login'], {
          state: { message: 'User created successfully. Please log in.' },
        });
      },
      error: (err: HttpErrorResponse) => {
        this.registerError = true;
        this.errorMessage = err.status === 400 ? 'Email already exists' : 'Unexpected error';
        this.triggerShake();
      },
    });
  }

  private triggerShake() {
    this.shake = false;
    this.cd.detectChanges();
    setTimeout(() => {
      this.shake = true;
      this.cd.detectChanges();
    }, 50);
  }
}
