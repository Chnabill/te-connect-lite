import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private themeSubject = new BehaviorSubject<string>(localStorage.getItem('theme') || 'light');
  theme$ = this.themeSubject.asObservable();

  private languageSubject = new BehaviorSubject<string>(localStorage.getItem('language') || 'en');
  language$ = this.languageSubject.asObservable();

  setTheme(theme: string) {
    this.themeSubject.next(theme);
    localStorage.setItem('theme', theme);
    document.body.className = theme === 'dark' ? 'dark' : '';
  }

  setLanguage(language: string) {
    this.languageSubject.next(language);
    localStorage.setItem('language', language);
  }

  getTheme(): string { return this.themeSubject.value; }
  getLanguage(): string { return this.languageSubject.value; }
}