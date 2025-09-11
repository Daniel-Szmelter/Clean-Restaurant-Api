import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  role: string;
  exp: number;
  [key: string]: any;
}

interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loginError = false;
  shake = false;
  isDarkMode = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private cd: ChangeDetectorRef,
    private themeService: ThemeService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {
    this.themeService.isDarkMode$.subscribe((mode) => {
      this.isDarkMode = mode;
      this.cd.detectChanges();
    });

    const state = history.state;
    if (state?.message) {
      this.successMessage = state.message;
      setTimeout(() => (this.successMessage = ''), 5000);
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.themeService.setDarkMode(this.isDarkMode);
  }

  goToRegister() {
    this.router.navigateByUrl('/register');
  }

  goToHome() {
    this.router.navigateByUrl('/');
  }

  onSubmit() {
    this.loginForm.markAllAsTouched();
    if (!this.loginForm.valid) {
      this.setError();
      return;
    }

    const dto = this.loginForm.value;

    this.http.post<AuthResponseDto>('https://localhost:7145/api/auth/login', dto).subscribe({
      next: (resp) => {
        if (!resp.accessToken) {
          this.loginError = true;
          this.errorMessage = 'Token not received';
          return;
        }

        localStorage.setItem('jwt', resp.accessToken);

        const decoded = this.decodeToken(resp.accessToken);

        const roleClaim = decoded['role'] || '';
        const role = roleClaim.toLowerCase();

        this.loginError = false;
        this.errorMessage = '';
        this.successMessage = 'Login successful';
        this.cd.detectChanges();

        switch (role) {
          case 'user':
            this.router.navigate(['/dashboard/user']);
            break;
          case 'manager':
          case 'admin':
            this.router.navigate(['/dashboard/admin-panel']);
            break;
          default:
            this.router.navigate(['/']);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.loginError = true;
        if (err.status === 401) this.errorMessage = 'Invalid email or password';
        else if (err.status === 400) this.errorMessage = err.error?.message ?? 'Invalid request';
        else this.errorMessage = 'Unexpected error';
        this.cd.detectChanges();
        this.triggerShake();
      },
    });
  }

  decodeToken(token: string) {
    return jwtDecode<any>(token);
  }

  private setError() {
    if (this.loginForm.get('email')?.hasError('required')) this.errorMessage = 'Email is required';
    else if (this.loginForm.get('email')?.hasError('email'))
      this.errorMessage = 'Invalid email format';
    else if (this.loginForm.get('password')?.hasError('required'))
      this.errorMessage = 'Password is required';
    else if (this.loginForm.get('password')?.hasError('minlength'))
      this.errorMessage = 'Password must be at least 6 characters';
    else this.errorMessage = 'Please fill in all fields correctly';
    this.loginError = true;
    this.cd.detectChanges();
    this.triggerShake();
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
