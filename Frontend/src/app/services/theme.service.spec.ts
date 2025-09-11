import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.removeItem('darkMode');
    document.body.classList.remove('dark');
  });

  afterEach(() => {
    localStorage.removeItem('darkMode');
    document.body.classList.remove('dark');
  });

  it('should default to dark mode when no value in localStorage', () => {
    localStorage.removeItem('darkMode');
    document.body.className = '';

    const service = new ThemeService();

    let lastValue: boolean | undefined;
    service.isDarkMode$.subscribe((v) => (lastValue = v));

    expect(lastValue).toBeTrue();
    expect(document.body.classList.contains('dark')).toBeTrue();

    expect(localStorage.getItem('darkMode')).toBeNull();
  });

  it('should initialize from localStorage when value is "false"', () => {
    localStorage.setItem('darkMode', 'false');
    document.body.className = '';

    const service = new ThemeService();

    let lastValue: boolean | undefined;
    service.isDarkMode$.subscribe((v) => (lastValue = v));

    expect(lastValue).toBeFalse();
    expect(document.body.classList.contains('dark')).toBeFalse();
  });

  it('toggle() should invert value, update localStorage and body class', () => {
    localStorage.setItem('darkMode', 'false');
    document.body.className = '';

    const service = new ThemeService();

    let lastValue: boolean | undefined;
    service.isDarkMode$.subscribe((v) => (lastValue = v));

    service.toggle();

    expect(lastValue).toBeTrue();
    expect(localStorage.getItem('darkMode')).toBe('true');
    expect(document.body.classList.contains('dark')).toBeTrue();

    service.toggle();
    expect(lastValue).toBeFalse();
    expect(localStorage.getItem('darkMode')).toBe('false');
    expect(document.body.classList.contains('dark')).toBeFalse();
  });

  it('setDarkMode(true/false) should set value, update storage and body class', () => {
    localStorage.removeItem('darkMode');
    document.body.className = '';

    const service = new ThemeService();

    let lastValue: boolean | undefined;
    service.isDarkMode$.subscribe((v) => (lastValue = v));

    service.setDarkMode(false);
    expect(lastValue).toBeFalse();
    expect(localStorage.getItem('darkMode')).toBe('false');
    expect(document.body.classList.contains('dark')).toBeFalse();

    service.setDarkMode(true);
    expect(lastValue).toBeTrue();
    expect(localStorage.getItem('darkMode')).toBe('true');
    expect(document.body.classList.contains('dark')).toBeTrue();
  });
});
