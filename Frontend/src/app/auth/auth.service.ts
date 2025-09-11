import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

export interface UserInfo {
  id: string | null;
  email: string | null;
  role: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenKey = 'jwt';

  constructor(private router: Router) {}

  private decodeToken(token: string): any {
    try {
      return jwtDecode(token);
    } catch {
      return null;
    }
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    const decoded = this.decodeToken(token);
    return decoded?.role || null;
  }

  getUserEmail(): string | null {
    const token = this.getToken();
    if (!token) return null;

    const decoded = this.decodeToken(token);
    return decoded?.email || null;
  }

  getUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;

    const decoded = this.decodeToken(token);
    return decoded?.id || null;
  }

  getUserInfo(): UserInfo {
    const token = this.getToken();
    if (!token) return { id: null, email: null, role: null };

    const decoded = this.decodeToken(token) || {};
    return {
      id: decoded.id || null,
      email: decoded.email || null,
      role: decoded.role || null,
    };
  }
}
