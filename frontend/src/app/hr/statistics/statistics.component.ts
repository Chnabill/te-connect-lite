import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { HrService } from '../hr.service';
import { Chart, ChartConfiguration, ChartType, ChartTypeRegistry } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { registerables } from 'chart.js';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '@app/shared/components/header/header.component';

interface Statistics {
  totalEmployees: number;
  retentionRate: number;
  averagePerformance: number;
  attendanceRate: number;
  departmentDistribution: DepartmentStats[];
  performanceTrends: PerformanceTrend[];
  recentActivities: Activity[];
  turnoverAnalysis: TurnoverStats;
}

interface DepartmentStats {
  department: string;
  count: number;
  percentage: number;
  color: string;
}

interface PerformanceTrend {
  quarter: string;
  score: number;
}

interface Activity {
  type: 'onboarding' | 'review' | 'training' | 'other';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
  color: string;
}

interface TurnoverStats {
  byDepartment: { [key: string]: number };
  insights: string[];
}

interface SidebarItem {
  id: string;
  name: string;
  icon: string;
  route?: string;
  badge?: string;
  badgeClass?: string;
}

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterOutlet, NgChartsModule, SidebarComponent, FormsModule, HeaderComponent],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit, OnDestroy {
  statistics: Statistics | null = null;
  loading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  // Sidebar properties
  sidebarOpen = true;
  isMobile = false;
  activeSection = 'statistics';
  userName = 'User1';
  userRole = 'HR Manager';
  userInitials = 'U1';
  notificationCount = 3;
  sidebarItems: SidebarItem[] = [
    { id: 'dashboard', name: 'Dashboard', icon: 'fas fa-tachometer-alt', route: '/hr/dashboard' },
    { id: 'employees', name: 'Employee Management', icon: 'fas fa-users', badge: '1247', badgeClass: 'bg-blue-100 text-blue-800', route: '/hr/employee-management' },
    { id: 'announcements', name: 'Announcements', icon: 'fas fa-bullhorn', route: '/hr/announcement-manage' },
    { id: 'documents', name: 'Document Sharing', icon: 'fas fa-file-alt', route: '/hr/document-share' },
    { id: 'meetings', name: 'Meetings', icon: 'fas fa-calendar-check', badge: '8', badgeClass: 'bg-purple-100 text-purple-800', route: '/hr/meeting-rh' },
    { id: 'statistics', name: 'Statistics', icon: 'fas fa-chart-bar', route: '/hr/statistics' },
    { id: 'leave-management', name: 'Leave Management', icon: 'fas fa-calendar-alt', route: '/hr/leave-management' },
    { id: 'messagerie', name: 'Messagerie', icon: 'fas fa-comments', route: '/hr/messagerie' }
  ];

  // Chart configurations
  departmentChartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: []
    }]
  };

  performanceChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Average Performance',
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  turnoverChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Turnover Rate',
      backgroundColor: 'rgba(255, 99, 132, 0.5)'
    }]
  };

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  // Chart types
  public pieChartType: ChartType = 'pie' as keyof ChartTypeRegistry;
  public lineChartType: ChartType = 'line' as keyof ChartTypeRegistry;
  public barChartType: ChartType = 'bar' as keyof ChartTypeRegistry;

  // Chart options
  public pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw as number;
            const percentage = context.parsed;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  public lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        title: {
          display: true,
          text: 'Performance Score'
        }
      }
    }
  };

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.raw}% turnover rate`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 20,
        title: {
          display: true,
          text: 'Turnover Rate (%)'
        }
      }
    }
  };

  userEmail = '';
  userImage: string | null = null;
  showUserMenu = false;
  showProfileModal = false;
  profileModalType: 'view' | 'edit' | 'password' | null = null;
  notifications: any[] = [
    { title: 'New statistics available', time: '2h ago' },
    { title: 'Monthly report ready', time: '1d ago' }
  ];
  showNotifications = false;
  searchQuery: string = '';

  constructor(
    private hrService: HrService,
    private router: Router
  ) {
    Chart.register(...registerables);
    this.checkMobile();
    window.addEventListener('resize', () => this.checkMobile());
  }

  ngOnInit() {
    // Load user info from backend using email from localStorage
    const email = localStorage.getItem('email') || '';
    if (email) {
      // Replace with actual user service if available
      this.userEmail = email;
      this.userName = 'User1'; // Replace with actual user name from backend
      this.userRole = 'HR Manager'; // Replace with actual user role from backend
      this.userInitials = this.getInitials(this.userName);
      this.userImage = null; // Replace with actual user image from backend
    }
    this.loadStatistics();
    this.checkMobile();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('resize', () => this.checkMobile());
  }

  public loadStatistics() {
    console.log('Loading statistics...');
    this.loading = true;
    this.error = null;
    this.hrService.getStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          console.log('Statistics data received:', data);
          try {
            this.statistics = this.transformStatistics(data);
            this.updateCharts();
            this.loading = false;
            console.log('Statistics loaded successfully');
          } catch (error) {
            console.error('Error processing statistics:', error);
            this.error = 'Error processing statistics data';
            this.loading = false;
          }
        },
        error: (err) => {
          console.error('Error loading statistics:', err);
          this.error = 'Failed to load statistics. Please try again later.';
          this.loading = false;
        }
      });
  }

  private transformStatistics(data: any): Statistics {
    console.log('Transforming statistics data:', data);
    const transformed = {
      totalEmployees: data.totalEmployees || 0,
      retentionRate: data.retentionRate || 0,
      averagePerformance: data.averagePerformance || 0,
      attendanceRate: data.attendanceRate || 0,
      departmentDistribution: this.transformDepartmentData(data.departmentDistribution),
      performanceTrends: this.transformPerformanceData(data.performanceTrends),
      recentActivities: this.transformActivityData(data.recentActivities),
      turnoverAnalysis: this.transformTurnoverData(data.turnoverAnalysis)
    };
    console.log('Transformed statistics:', transformed);
    return transformed;
  }

  private transformDepartmentData(data: any[]): DepartmentStats[] {
    console.log('Transforming department data:', data);
    if (!Array.isArray(data)) {
      console.error('Department data is not an array:', data);
      return [];
    }
    return data.map(dept => ({
      department: dept.name,
      count: dept.count,
      percentage: dept.percentage,
      color: this.getDepartmentColor(dept.name)
    }));
  }

  private transformPerformanceData(data: any[]): PerformanceTrend[] {
    console.log('Transforming performance data:', data);
    if (!Array.isArray(data)) {
      console.error('Performance data is not an array:', data);
      return [];
    }
    return data.map(trend => ({
      quarter: trend.quarter,
      score: trend.score
    }));
  }

  private transformActivityData(data: any[]): Activity[] {
    console.log('Transforming activity data:', data);
    if (!Array.isArray(data)) {
      console.error('Activity data is not an array:', data);
      return [];
    }
    return data.map(activity => ({
      type: activity.type,
      title: activity.title,
      description: activity.description,
      timestamp: new Date(activity.timestamp),
      icon: this.getActivityIcon(activity.type),
      color: this.getActivityColor(activity.type)
    }));
  }

  private transformTurnoverData(data: any): TurnoverStats {
    console.log('Transforming turnover data:', data);
    return {
      byDepartment: data.byDepartment || {},
      insights: data.insights || []
    };
  }

  private updateCharts() {
    console.log('Updating charts with statistics:', this.statistics);
    if (!this.statistics) {
      console.log('No statistics data available for charts');
      return;
    }

    try {
      // Update Department Distribution Chart
      this.departmentChartData = {
        labels: this.statistics.departmentDistribution.map(d => d.department),
        datasets: [{
          data: this.statistics.departmentDistribution.map(d => d.count),
          backgroundColor: this.statistics.departmentDistribution.map(d => d.color),
          borderWidth: 1,
          borderColor: '#fff'
        }]
      };
      console.log('Department chart data updated:', this.departmentChartData);

      // Update Performance Trends Chart
      this.performanceChartData = {
        labels: this.statistics.performanceTrends.map(t => t.quarter),
        datasets: [{
          data: this.statistics.performanceTrends.map(t => t.score),
          label: 'Average Performance',
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          tension: 0.4,
          fill: true
        }]
      };
      console.log('Performance chart data updated:', this.performanceChartData);

      // Update Turnover Chart
      const departments = Object.keys(this.statistics.turnoverAnalysis.byDepartment);
      this.turnoverChartData = {
        labels: departments,
        datasets: [{
          data: departments.map(dept => this.statistics!.turnoverAnalysis.byDepartment[dept]),
          label: 'Turnover Rate',
          backgroundColor: departments.map(dept => this.getDepartmentColor(dept)),
          borderWidth: 1,
          borderColor: '#fff'
        }]
      };
      console.log('Turnover chart data updated:', this.turnoverChartData);
    } catch (error) {
      console.error('Error updating charts:', error);
    }
  }

  private getDepartmentColor(department: string): string {
    const colors: { [key: string]: string } = {
      'Engineering': 'rgb(59, 130, 246)',
      'Marketing': 'rgb(16, 185, 129)',
      'Sales': 'rgb(245, 158, 11)',
      'HR': 'rgb(139, 92, 246)',
      'Finance': 'rgb(239, 68, 68)'
    };
    return colors[department] || 'rgb(156, 163, 175)';
  }

  private getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'onboarding': 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
      'review': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      'training': 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      'other': 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    };
    return icons[type] || icons['other'];
  }

  private getActivityColor(type: string): string {
    const colors: { [key: string]: string } = {
      'onboarding': 'blue',
      'review': 'green',
      'training': 'purple',
      'other': 'gray'
    };
    return colors[type] || colors['other'];
  }

  exportReport() {
    // Create a printable version of the dashboard
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>HR Analytics Report</title>
            <style>
              body { font-family: Arial, sans-serif; }
              .report-header { text-align: center; margin-bottom: 2rem; }
              .report-section { margin-bottom: 2rem; }
              .metric-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
              .metric-card { padding: 1rem; border: 1px solid #ddd; border-radius: 0.5rem; }
              .chart-container { height: 300px; margin: 1rem 0; }
              @media print {
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="report-header">
              <h1>HR Analytics Report</h1>
              <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="report-section">
              <h2>Key Metrics</h2>
              <div class="metric-grid">
                <div class="metric-card">
                  <h3>Total Employees</h3>
                  <p>${this.statistics?.totalEmployees}</p>
                </div>
                <div class="metric-card">
                  <h3>Retention Rate</h3>
                  <p>${this.statistics?.retentionRate}%</p>
                </div>
                <div class="metric-card">
                  <h3>Average Performance</h3>
                  <p>${this.statistics?.averagePerformance}/10</p>
                </div>
                <div class="metric-card">
                  <h3>Attendance Rate</h3>
                  <p>${this.statistics?.attendanceRate}%</p>
                </div>
              </div>
            </div>
            <div class="report-section">
              <h2>Department Distribution</h2>
              <div class="chart-container">
                <!-- Chart will be rendered here -->
              </div>
            </div>
            <div class="report-section">
              <h2>Performance Trends</h2>
              <div class="chart-container">
                <!-- Chart will be rendered here -->
              </div>
            </div>
            <div class="report-section">
              <h2>Turnover Analysis</h2>
              <div class="chart-container">
                <!-- Chart will be rendered here -->
              </div>
              <h3>Key Insights</h3>
              <ul>
                ${this.statistics?.turnoverAnalysis.insights.map(insight => `<li>${insight}</li>`).join('')}
              </ul>
            </div>
            <div class="report-section">
              <h2>Recent Activities</h2>
              <ul>
                ${this.statistics?.recentActivities.map(activity => `
                  <li>
                    <strong>${activity.title}</strong>
                    <p>${activity.description}</p>
                    <small>${activity.timestamp.toLocaleDateString()}</small>
                  </li>
                `).join('')}
              </ul>
            </div>
            <div class="no-print">
              <button onclick="window.print()">Print Report</button>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }

  refreshData() {
    this.loading = true;
    this.error = null;
    this.loadStatistics();
  }

  getMetricColor(value: number, type: 'rate' | 'score'): string {
    if (type === 'rate') {
      if (value >= 90) return 'text-green-600';
      if (value >= 75) return 'text-yellow-600';
      return 'text-red-600';
    } else {
      if (value >= 8) return 'text-green-600';
      if (value >= 6) return 'text-yellow-600';
      return 'text-red-600';
    }
  }

  getMetricIcon(value: number, type: 'rate' | 'score'): string {
    if (type === 'rate') {
      if (value >= 90) return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      if (value >= 75) return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
      return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z';
    } else {
      if (value >= 8) return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      if (value >= 6) return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
      return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }

  // Sidebar methods
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  setActiveSection(sectionId: string) {
    this.activeSection = sectionId;
    const item = this.sidebarItems.find(item => item.id === sectionId);
    if (item?.route) {
      this.router.navigate([item.route]);
    }
  }

  logout() {
    // Add logout logic here
    console.log('Logout clicked');
  }

  private checkMobile() {
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile) {
      this.sidebarOpen = false;
    }
  }

  getSectionTitle(): string {
    const item = this.sidebarItems.find(item => item.id === this.activeSection);
    return item ? item.name : 'Statistics';
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  getCurrentSubsection() {
    return 'Statistics';
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  closeUserMenu() {
    this.showUserMenu = false;
  }

  openProfileModal(type: 'view' | 'edit' | 'password') {
    this.profileModalType = type;
    this.showProfileModal = true;
    this.closeUserMenu();
  }

  closeProfileModal() {
    this.showProfileModal = false;
    this.profileModalType = null;
  }

  onProfileImageChange(event: any) {
    const file = event.target.files && event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.userImage = e.target.result;
        // Upload logic here
      };
      reader.readAsDataURL(file);
    }
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  performSearch() {
    // Implement your search logic here
    console.log('Searching for:', this.searchQuery);
  }
}
