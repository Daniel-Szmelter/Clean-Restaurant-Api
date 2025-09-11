import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _isDarkMode = new BehaviorSubject<boolean>(false);
  isDarkMode$ = this._isDarkMode.asObservable();

  constructor() {
    const stored = localStorage.getItem('darkMode');
    const initial = stored !== null ? stored === 'true' : true;
    this._isDarkMode.next(initial);
    this.applyBodyClass(initial);
  }

  toggle() {
    const newValue = !this._isDarkMode.value;
    this._isDarkMode.next(newValue);
    localStorage.setItem('darkMode', newValue ? 'true' : 'false');
    this.applyBodyClass(newValue);
  }

  setDarkMode(value: boolean) {
    this._isDarkMode.next(value);
    localStorage.setItem('darkMode', value ? 'true' : 'false');
    this.applyBodyClass(value);
  }

  private applyBodyClass(isDark: boolean) {
    if (isDark) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
  }
}
