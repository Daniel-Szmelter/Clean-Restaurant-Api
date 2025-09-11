import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ThemeService } from '../../../../services/theme.service';
import { JsonPatchOperation } from '../../../../models/json-patch-operation.model';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-user-update-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-update-form.component.html',
  styleUrls: ['./user-update-form.component.css'],
})
export class UserUpdateFormComponent implements OnInit {
  userForm!: FormGroup;
  isDarkMode = false;
  loading = true;
  userId!: number;
  userEmail: string = '';
  role: string = '';
  errorMessage: string = '';

  roles: string[] = ['Admin', 'Manager', 'User'];

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

    this.userId = +this.route.snapshot.params['id'];

    this.userForm = this.fb.group(
      {
        email: [{ value: '', disabled: true }],
        password: ['', [Validators.minLength(6), Validators.maxLength(20)]],
        confirmPassword: [''],
        role: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );

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

    this.loadUser(this.userId);
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  goBack() {
    this.router.navigate(['/dashboard/admin-panel/user/update']);
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

    const formValue = this.userForm.getRawValue();

    const patchDoc: JsonPatchOperation[] = [
      { op: 'replace', path: '/role', value: formValue.role },
    ];

    if (formValue.password && formValue.password.trim() !== '') {
      patchDoc.push({ op: 'replace', path: '/password', value: formValue.password });
    }

    const headers = new HttpHeaders({ 'Content-Type': 'application/json-patch+json' });

    this.http
      .patch(`https://localhost:7145/api/user/${this.userId}`, patchDoc, {
        headers,
        responseType: 'text',
      })
      .subscribe({
        next: () => {
          this.showSuccessToast('User updated successfully!');
        },
        error: (err) => console.error('Error updating user:', err),
      });
  }

  private loadUser(id: number) {
    this.http.get<any>(`https://localhost:7145/api/user/${id}`).subscribe({
      next: (res) => {
        this.userForm.patchValue({
          email: res.email,
          role: res.role,
        });
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Cannot load user';
        this.loading = false;
        console.error('Error loading user:', err);
      },
    });
  }

  public showSuccessToast(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }
}
