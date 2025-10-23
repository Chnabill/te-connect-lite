import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule, FormsModule], // RouterLink pour les liens, RouterModule pour les directives de routage
  template: `
    <nav class="bg-white shadow-md">
      <div class="container mx-auto px-4">
        <!-- Your existing template -->
      </div>
    </nav>
  `
})
export class NavbarComponent {
  @Input() userRole: string = '';
  isDarkMode: boolean = false;
  isUserMenuOpen: boolean = false;
  isMobileMenuOpen: boolean = false;
  userName: string = 'John Doe';

  constructor(private themeService: ThemeService) {}

  get userInitials(): string {
    return this.userName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase();
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.themeService.toggleTheme();
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    if (this.isUserMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (this.isMobileMenuOpen) {
      this.isUserMenuOpen = false;
    }
  }
}
