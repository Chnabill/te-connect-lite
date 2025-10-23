import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService, Setting } from '../admin.service';
import { SettingsService } from '../settings.service';
import { SidebarComponent } from '@app/shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '@app/shared/components/header/header.component';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-platform-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  templateUrl: './platform-settings.component.html',
  styleUrls: ['./platform-settings.component.css']
})
export class PlatformSettingsComponent implements OnInit {
  sidebarOpen = true;
  isMobile = window.innerWidth < 1024;
  activeSection = 'platform-settings';
  sidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: 'fas fa-tachometer-alt', route: '/admin/dashboard' },
    { id: 'employee-list', name: 'Manage Users', icon: 'fas fa-users', route: '/admin/employee-list' },
    { id: 'activity-overview', name: 'Activity Overview', icon: 'fas fa-history', route: '/admin/activity-overview' },
    { id: 'evaluation', name: 'Evaluations', icon: 'fas fa-clipboard-check', route: '/admin/evaluation' },
    { id: 'roles-permissions', name: 'Roles & Permissions', icon: 'fas fa-shield-alt', route: '/admin/roles-permissions' },
    { id: 'task-management', name: 'Task Management', icon: 'fas fa-tasks', route: '/admin/task-management' }
  ];

  settings: Setting[] = [];
  selectedTheme = 'light';
  selectedLanguage = 'en';

  constructor(
    private adminService: AdminService,
    private settingsService: SettingsService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadSettings();
  }

  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }
  setActiveSection(section: string): void {
    this.activeSection = section;
    const selectedItem = this.sidebarItems.find(item => item.id === section);
    if (selectedItem && selectedItem.route) {
      window.location.href = selectedItem.route;
    }
  }
  getSectionTitle(): string { return 'Platform Settings'; }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  loadSettings() {
    this.adminService.getSettings().subscribe((data: Setting[]) => {
      this.settings = data;
      this.selectedTheme = this.settings.find(s => s.key === 'Theme')?.value || 'light';
      this.selectedLanguage = this.settings.find(s => s.key === 'Language')?.value || 'en';
      this.settingsService.setTheme(this.selectedTheme);
      this.settingsService.setLanguage(this.selectedLanguage);
    });
  }

  updateTheme() {
    this.settingsService.setTheme(this.selectedTheme);
    this.settings = this.settings.map(s => s.key === 'Theme' ? { ...s, value: this.selectedTheme } : s);
    this.adminService.updateSettings(this.settings).subscribe();
  }

  updateLanguage() {
    this.settingsService.setLanguage(this.selectedLanguage);
    this.settings = this.settings.map(s => s.key === 'Language' ? { ...s, value: this.selectedLanguage } : s);
    this.adminService.updateSettings(this.settings).subscribe();
  }
}