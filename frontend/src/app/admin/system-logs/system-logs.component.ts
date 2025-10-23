import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService, Log } from '../admin.service';
import { SidebarComponent } from '@app/shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '@app/shared/components/header/header.component';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-system-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  templateUrl: './system-logs.component.html',
  styleUrls: ['./system-logs.component.css']
})
export class SystemLogsComponent implements OnInit {
  sidebarOpen = true;
  isMobile = window.innerWidth < 1024;
  activeSection = 'system-logs';
  sidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: 'fas fa-tachometer-alt', route: '/admin/dashboard' },
    { id: 'employee-list', name: 'Manage Users', icon: 'fas fa-users', route: '/admin/employee-list' },
    { id: 'activity-overview', name: 'Activity Overview', icon: 'fas fa-history', route: '/admin/activity-overview' },
    { id: 'evaluation', name: 'Evaluations', icon: 'fas fa-clipboard-check', route: '/admin/evaluation' },
    { id: 'roles-permissions', name: 'Roles & Permissions', icon: 'fas fa-shield-alt', route: '/admin/roles-permissions' },
    { id: 'task-management', name: 'Task Management', icon: 'fas fa-tasks', route: '/admin/task-management' }
  ];

  logs: Log[] = [];
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 10;

  constructor(
    private adminService: AdminService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadLogs();
  }

  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }
  setActiveSection(section: string): void {
    this.activeSection = section;
    const selectedItem = this.sidebarItems.find(item => item.id === section);
    if (selectedItem && selectedItem.route) {
      window.location.href = selectedItem.route;
    }
  }
  getSectionTitle(): string { return 'System Logs'; }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  loadLogs() {
    this.adminService.getSystemLogs().subscribe((data: Log[]) => {
      this.logs = data;
      this.filterLogs();
    });
  }

  filterLogs() {
    this.currentPage = 1;
    return this.logs.filter(log =>
      log.message.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  get paginatedLogs(): Log[] {
    const filtered = this.filterLogs();
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return filtered.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.filterLogs().length / this.itemsPerPage);
  }

  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }
}