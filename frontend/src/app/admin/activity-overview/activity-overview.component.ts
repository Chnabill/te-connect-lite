import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService, Activity } from '../admin.service';
import { SidebarComponent } from '@app/shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '@app/shared/components/header/header.component';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-activity-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  templateUrl: './activity-overview.component.html',
  styleUrls: ['./activity-overview.component.css']
})
export class ActivityOverviewComponent implements OnInit {
  sidebarOpen = true;
  isMobile = window.innerWidth < 1024;
  activeSection = 'activity-overview';
  sidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: 'fas fa-tachometer-alt', route: '/admin/dashboard' },
    { id: 'employee-list', name: 'Manage Users', icon: 'fas fa-users', route: '/admin/employee-list' },
    { id: 'activity-overview', name: 'Activity Overview', icon: 'fas fa-history', route: '/admin/activity-overview' },
    { id: 'evaluation', name: 'Evaluations', icon: 'fas fa-clipboard-check', route: '/admin/evaluation' },
    { id: 'roles-permissions', name: 'Roles & Permissions', icon: 'fas fa-shield-alt', route: '/admin/roles-permissions' },
    { id: 'task-management', name: 'Task Management', icon: 'fas fa-tasks', route: '/admin/task-management' }
  ];

  activities: Activity[] = [];
  filteredActivities: Activity[] = [];
  selectedFilter: string = 'all';
  searchTerm: string = '';

  constructor(
    private adminService: AdminService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadActivities();
  }

  loadActivities() {
    this.adminService.getActivityOverview().subscribe((data: Activity[]) => {
      this.activities = data;
      this.applyFilters();
    });
  }

  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }
  setActiveSection(section: string): void {
    this.activeSection = section;
    const selectedItem = this.sidebarItems.find(item => item.id === section);
    if (selectedItem && selectedItem.route) {
      window.location.href = selectedItem.route;
    }
  }
  getSectionTitle(): string { return 'Activity Overview'; }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  get completedCount(): number {
    return this.activities.filter(a => a.status === 'completed').length;
  }
  get pendingCount(): number {
    return this.activities.filter(a => a.status !== 'completed').length;
  }

  getStatusCount(status: string): number {
    return this.activities.filter(a => a.status === status).length;
  }

  getActivityTypeCount(type: string): number {
    return this.activities.filter(a => a.activity_type === type).length;
  }

  getCompletionRate(): number {
    if (this.activities.length === 0) return 0;
    return Math.round((this.completedCount / this.activities.length) * 100);
  }

  applyFilter() {
    this.applyFilters();
  }

  applySearch() {
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.activities];

    // Apply status/type filter
    if (this.selectedFilter !== 'all') {
      if (this.selectedFilter === 'completed' || this.selectedFilter === 'pending') {
        filtered = filtered.filter(a => a.status === this.selectedFilter);
      } else {
        filtered = filtered.filter(a => a.activity_type === this.selectedFilter);
      }
    }

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(a => 
        a.action.toLowerCase().includes(searchLower) ||
        (a.description && a.description.toLowerCase().includes(searchLower)) ||
        (a.user_name && a.user_name.toLowerCase().includes(searchLower)) ||
        a.activity_type.toLowerCase().includes(searchLower)
      );
    }

    this.filteredActivities = filtered;
  }

  refreshActivities() {
    this.loadActivities();
  }

  markAllCompleted() {
    this.activities.forEach(a => {
      if (a.status === 'pending') {
        a.status = 'completed';
      }
    });
    this.applyFilters();
    this.adminService.addLog('All pending activities marked as completed').subscribe();
  }

  markActivityCompleted(activity: Activity) {
    activity.status = 'completed';
    this.applyFilters();
    this.adminService.addLog(`Activity "${activity.action}" marked as completed`).subscribe();
  }

  getUserDisplayName(activity: Activity): string {
    return activity.user_name || activity.user || 'Unknown User';
  }

  getUserInitials(activity: Activity): string {
    const name = this.getUserDisplayName(activity);
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'user': return 'fas fa-user-plus';
      case 'announcement': return 'fas fa-bullhorn';
      case 'task': return 'fas fa-tasks';
      case 'system': return 'fas fa-cog';
      case 'login': return 'fas fa-sign-in-alt';
      case 'logout': return 'fas fa-sign-out-alt';
      case 'evaluation': return 'fas fa-clipboard-check';
      case 'report': return 'fas fa-file-alt';
      default: return 'fas fa-info-circle';
    }
  }

  getActivityColor(type: string): string {
    switch (type) {
      case 'user': return 'bg-blue-100 text-blue-700';
      case 'announcement': return 'bg-green-100 text-green-700';
      case 'task': return 'bg-purple-100 text-purple-700';
      case 'system': return 'bg-teal-100 text-teal-700';
      case 'login': return 'bg-indigo-100 text-indigo-700';
      case 'logout': return 'bg-red-100 text-red-700';
      case 'evaluation': return 'bg-yellow-100 text-yellow-700';
      case 'report': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }
}