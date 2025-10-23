import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, DashboardData } from '../admin.service';
import { Router } from '@angular/router';
import { SidebarComponent } from '@app/shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '@app/shared/components/header/header.component';
import { TaskManagementComponent } from '../task-management/task-management.component';
import { AuthService } from '../../shared/services/auth.service';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent, TaskManagementComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  sidebarOpen = true;
  isMobile = false;
  activeSection = 'dashboard';
  sidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: 'fas fa-tachometer-alt', route: '/admin/dashboard' },
    { id: 'employee-list', name: 'Manage Users', icon: 'fas fa-users', route: '/admin/employee-list' },
    { id: 'activity-overview', name: 'Activity Overview', icon: 'fas fa-history', route: '/admin/activity-overview' },
    { id: 'evaluation', name: 'Evaluations', icon: 'fas fa-clipboard-check', route: '/admin/evaluation' },
    { id: 'roles-permissions', name: 'Roles & Permissions', icon: 'fas fa-shield-alt', route: '/admin/roles-permissions' },
    { id: 'task-management', name: 'Task Management', icon: 'fas fa-tasks', route: '/admin/task-management' }
  ];

  kpiData: any[] = [];
  recentActivities: any[] = [];
  quickActions = [
    { id: 1, label: 'Add User', icon: 'fas fa-user-plus', bgClass: 'bg-blue-600' },
    { id: 2, label: 'Generate Report', icon: 'fas fa-file-alt', bgClass: 'bg-green-600' },
    { id: 3, label: 'Clear Logs', icon: 'fas fa-trash', bgClass: 'bg-red-600' }
  ];
  backendAnalytics: any = {};

  constructor(
    private adminService: AdminService, 
    private router: Router,
    private authService: AuthService
  ) {}

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
    const selectedItem = this.sidebarItems.find(item => item.id === section);
    if (selectedItem && selectedItem.route) {
      this.router.navigateByUrl(selectedItem.route);
    }
  }

  getSectionTitle(): string {
    const section = this.sidebarItems.find(item => item.id === this.activeSection);
    return section ? section.name : 'Dashboard';
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  executeQuickAction(id: number) {
    alert('Action ' + id + ' executed!');
  }

  ngOnInit() {
    this.adminService.getDashboardData().subscribe((data: DashboardData) => {
      // Add icons and colors to KPIs based on their titles
      this.kpiData = data.kpis.map((kpi, i) => {
        let icon = 'fas fa-chart-bar';
        let iconColor = 'text-primary';
        
        switch (kpi.title.toLowerCase()) {
          case 'active users':
            icon = 'fas fa-users';
            iconColor = 'text-accent';
            break;
          case 'tasks completed':
            icon = 'fas fa-tasks';
            iconColor = 'text-primary';
            break;
          case 'revenue':
            icon = 'fas fa-dollar-sign';
            iconColor = 'text-green-600';
            break;
          case 'performance':
            icon = 'fas fa-chart-line';
            iconColor = 'text-blue-600';
            break;
        }
        
        return {
          ...kpi,
          icon,
          iconColor
        };
      });
      
      // Add status classes to activities
      this.recentActivities = data.activities.map(activity => ({
        ...activity,
        statusClass: activity.status === 'Completed' ? 'text-green-600' : 'text-yellow-600',
        statusDotClass: activity.status === 'Completed' ? 'bg-green-500' : 'bg-yellow-500'
      }));
    });
    
    this.adminService.getSystemAnalytics().subscribe(data => {
      this.backendAnalytics = data;
    });
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  downloadReport() {
    this.adminService.downloadReport().subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dashboard_report.json';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}