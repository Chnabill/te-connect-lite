// src/app/shared/components/theme-toggle/theme-toggle.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      (click)="toggleTheme()"
      class="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
      aria-label="Toggle theme"
    >
      <span>{{ isDarkMode ? '☀️' : '🌙' }}</span>
    </button>
  `
})
export class ThemeToggleComponent implements OnInit {
  isDarkMode = false;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}