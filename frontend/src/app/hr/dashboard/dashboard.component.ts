import { Component, OnInit, OnDestroy } from '@angular/core';
import { HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService, User } from '@app/shared/services/user.service';
import { AuthService } from '@app/shared/services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '@app/shared/components/header/header.component';



interface KPIData {
  title: string;
  value: string;
  change: string;
  changeClass: string;
  changeIcon: string;
  icon: string;
  iconColor: string;
  bgColor: string;
}

interface Application {
  id: number;
  name: string;
  email: string;
  initials: string;
  avatarColor: string;
  position: string;
  date: string;
  status: string;
  statusClass: string;
  statusDotClass: string;
}

interface Interview {
  id: number;
  candidateName: string;
  position: string;
  description: string;
  time: string;
  dateLabel: string;
  dateClass: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  bgClass: string;
}

interface DepartmentData {
  name: string;
  percentage: number;
  color: string;
}

interface PendingTask {
  name: string;
  count: number;
  bgClass: string;
  badgeClass: string;
}

interface RecentActivity {
  message: string;
  time: string;
  dotColor: string;
}

interface Notification {
  message: string;
  class: string;
  icon: string;
  show: boolean;
}

interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  startDate: string;
  status: 'Active' | 'Inactive' | 'On Leave';
}

@Component({
  selector: 'app-hr-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, HeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class HrDashboardComponent implements OnInit, OnDestroy {
  // Sidebar state
  sidebarOpen = true;
  activeSection = 'dashboard';
  isMobile = false;
  
  // User info
  notification: Notification | null = null;
  private notificationTimeout: any;
  private dataRefreshInterval: any;

  // Sidebar navigation items
  sidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: 'fas fa-tachometer-alt', route: '/hr/dashboard' },
    { id: 'employees', name: 'Employee Management', icon: 'fas fa-users', badge: '1247', badgeClass: 'bg-blue-100 text-blue-800', route: '/hr/employee-management' },
    { id: 'announcements', name: 'Announcements', icon: 'fas fa-bullhorn', route: '/hr/announcement-manage' },
    { id: 'documents', name: 'Document Sharing', icon: 'fas fa-file-alt', route: '/hr/document-share' },
    { id: 'meetings', name: 'Meetings', icon: 'fas fa-calendar-check', badge: '8', badgeClass: 'bg-purple-100 text-purple-800', route: '/hr/meeting-rh' },
    { id: 'statistics', name: 'Statistics', icon: 'fas fa-chart-bar', route: '/hr/statistics' },
    { id: 'leave-management', name: 'Leave Management', icon: 'fas fa-calendar-alt', route: '/hr/leave-management' },
    { id: 'messagerie', name: 'Messagerie', icon: 'fas fa-comments', route: '/hr/messagerie' },
  ];

  kpiData: KPIData[] = [
    {
      title: 'Total Employees',
      value: '248',
      change: '+12 since last month',
      changeClass: 'text-green-600',
      changeIcon: 'fas fa-arrow-up',
      icon: 'fas fa-users',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Open Positions',
      value: '14',
      change: '5 need review',
      changeClass: 'text-orange-600',
      changeIcon: 'fas fa-clock',
      icon: 'fas fa-briefcase',
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Time Off Requests',
      value: '8',
      change: '3 pending approval',
      changeClass: 'text-yellow-600',
      changeIcon: 'fas fa-hourglass-half',
      icon: 'fas fa-calendar-alt',
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Retention Rate',
      value: '94.2%',
      change: '+2.1% from last year',
      changeClass: 'text-green-600',
      changeIcon: 'fas fa-trend-up',
      icon: 'fas fa-chart-line',
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ];

  recentApplications: Application[] = [
    {
      id: 1,
      name: 'User1',
      email: 'user1@example.com',
      initials: 'U1',
      avatarColor: 'bg-blue-500',
      position: 'Frontend Developer',
      date: 'May 24, 2025',
      status: 'Review',
      statusClass: 'bg-yellow-100 text-yellow-800',
      statusDotClass: 'bg-yellow-500'
    },
    {
      id: 2,
      name: 'User2',
      email: 'user2@example.com',
      initials: 'U2',
      avatarColor: 'bg-purple-500',
      position: 'UX Designer',
      date: 'May 22, 2025',
      status: 'Interview',
      statusClass: 'bg-blue-100 text-blue-800',
      statusDotClass: 'bg-blue-500'
    },
    {
      id: 3,
      name: 'User3',
      email: 'user3@example.com',
      initials: 'U3',
      avatarColor: 'bg-green-500',
      position: 'Product Manager',
      date: 'May 20, 2025',
      status: 'Rejected',
      statusClass: 'bg-red-100 text-red-800',
      statusDotClass: 'bg-red-500'
    },
    {
      id: 4,
      name: 'User4',
      email: 'user4@example.com',
      initials: 'U4',
      avatarColor: 'bg-indigo-500',
      position: 'Data Scientist',
      date: 'May 19, 2025',
      status: 'Review',
      statusClass: 'bg-yellow-100 text-yellow-800',
      statusDotClass: 'bg-yellow-500'
    }
  ];

  upcomingInterviews: Interview[] = [
    {
      id: 1,
      candidateName: 'User1',
      position: 'UX Designer',
      description: 'First round technical interview with design team',
      time: '2:00 PM - 3:00 PM',
      dateLabel: 'Today',
      dateClass: 'bg-blue-100 text-blue-800'
    },
    {
      id: 2,
      candidateName: 'User2',
      position: 'Backend Developer',
      description: 'Technical assessment with engineering team',
      time: '10:00 AM - 11:30 AM',
      dateLabel: 'Tomorrow',
      dateClass: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 3,
      candidateName: 'User3',
      position: 'Marketing Manager',
      description: 'Final interview with executive team',
      time: '3:30 PM - 4:30 PM',
      dateLabel: 'Jun 2',
      dateClass: 'bg-gray-100 text-gray-800'
    }
  ];

  quickActions: QuickAction[] = [
    {
      id: 'add-employee',
      label: 'Add New Employee',
      icon: 'fas fa-user-plus',
      bgClass: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
    },
    {
      id: 'post-job',
      label: 'Post New Job',
      icon: 'fas fa-briefcase',
      bgClass: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
    },
    {
      id: 'view-analytics',
      label: 'View Analytics',
      icon: 'fas fa-chart-bar',
      bgClass: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'fas fa-cog',
      bgClass: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
    }
  ];

  departmentData: DepartmentData[] = [
    { name: 'Engineering', percentage: 45, color: 'bg-blue-600' },
    { name: 'Sales', percentage: 30, color: 'bg-green-600' },
    { name: 'Marketing', percentage: 25, color: 'bg-purple-600' }
  ];

  pendingTasks: PendingTask[] = [
    {
      name: 'Performance Reviews',
      count: 12,
      bgClass: 'bg-yellow-50',
      badgeClass: 'bg-yellow-100 text-yellow-800'
    },
    {
      name: 'Onboarding Tasks',
      count: 5,
      bgClass: 'bg-blue-50',
      badgeClass: 'bg-blue-100 text-blue-800'
    },
    {
      name: 'Exit Interviews',
      count: 2,
      bgClass: 'bg-red-50',
      badgeClass: 'bg-red-100 text-red-800'
    }
  ];

  recentActivities: RecentActivity[] = [
    {
      message: 'User1 joined Engineering',
      time: '2 hours ago',
      dotColor: 'bg-green-500'
    },
    {
      message: 'New job posting published',
      time: '4 hours ago',
      dotColor: 'bg-blue-500'
    },
    {
      message: 'Time-off request approved',
      time: '1 day ago',
      dotColor: 'bg-yellow-500'
    },
    {
      message: 'Performance review completed',
      time: '2 days ago',
      dotColor: 'bg-purple-500'
    }
  ];

  // Additional properties for enhanced functionality
  searchQuery: string = '';
  isLoading: boolean = false;
  filteredApplications: Application[] = [];
  employees: Employee[] = [];
  selectedDepartment: string = 'All';
  departments: string[] = ['All', 'Engineering', 'Sales', 'Marketing', 'HR', 'Finance'];

  //header modification testiiiing

  showNotifications: boolean = false;

  // Profile image for modal
  userImage: string | null = null;

  constructor(
    private router: Router,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    console.log('HR Dashboard initialized');
    this.filteredApplications = [...this.recentApplications];
    this.initializeEmployeeData();
    this.startDataRefreshInterval();
    
    // Set initial mobile state
    this.isMobile = window.innerWidth < 1024;
    
    // Set sidebar to open by default on desktop
    if (!this.isMobile) {
      this.sidebarOpen = true;
    }

    // Fetch user info by email (replace with actual email, e.g. from auth service)
    const email = localStorage.getItem('email') || '';
    if (email) {
      this.userService.getUserByEmail(email).subscribe((user: User) => {
        this.userImage = user.user_image || null;
      });
    }
  }

  ngOnDestroy(): void {
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
    if (this.dataRefreshInterval) {
      clearInterval(this.dataRefreshInterval);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = event.target.innerWidth < 1024;
    // Keep sidebar open on desktop
    if (!this.isMobile) {
      this.sidebarOpen = true;
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
    if (this.isMobile) {
      this.sidebarOpen = false;
    }
    
    // Find the route for the selected section and navigate to it
    const selectedItem = this.sidebarItems.find(item => item.id === section);
    if (selectedItem && selectedItem.route) {
      // Navigate using Angular Router
      this.router.navigateByUrl(selectedItem.route);
      console.log(`Navigating to ${selectedItem.route}`);
    }
  }

  getSectionTitle(): string {
    const section = this.sidebarItems.find(item => item.id === this.activeSection);
    return section ? section.name : 'Dashboard';
  }

  // Initialize sample employee data
  private initializeEmployeeData(): void {
    this.employees = [
      {
        id: 1,
        name: 'User1',
        email: 'user1@company.com',
        department: 'Engineering',
        position: 'Senior Developer',
        startDate: '2023-01-15',
        status: 'Active'
      },
      {
        id: 2,
        name: 'User2',
        email: 'user2@company.com',
        department: 'Sales',
        position: 'Sales Manager',
        startDate: '2022-06-20',
        status: 'Active'
      },
      {
        id: 3,
        name: 'User3',
        email: 'user3@company.com',
        department: 'Marketing',
        position: 'Marketing Specialist',
        startDate: '2024-03-10',
        status: 'On Leave'
      }
    ];
  }

  // Start automatic data refresh
  private startDataRefreshInterval(): void {
    this.dataRefreshInterval = setInterval(() => {
      this.updateKPIData();
    }, 30000); // Refresh every 30 seconds
  }

  // Header Actions
  openNewEmployeeForm(): void {
    console.log('Opening new employee form...');
    // Add your navigation logic here
  }

  exportReport(): void {
    this.isLoading = true;
    console.log('Generating HR report...');
    
    // Simulate report generation
    setTimeout(() => {
      this.isLoading = false;
      console.log('HR report exported successfully!');
      this.downloadReport();
    }, 2000);
  }

  private downloadReport(): void {
    const reportData = {
      totalEmployees: this.kpiData[0].value,
      openPositions: this.kpiData[1].value,
      timeOffRequests: this.kpiData[2].value,
      retentionRate: this.kpiData[3].value,
      departmentDistribution: this.departmentData,
      recentApplications: this.recentApplications,
      generatedDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hr-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Search functionality
  onSearch(query: string): void {
    this.searchQuery = query;
    this.filterApplications();
  }

  private filterApplications(): void {
    if (!this.searchQuery.trim()) {
      this.filteredApplications = [...this.recentApplications];
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredApplications = this.recentApplications.filter(app =>
        app.name.toLowerCase().includes(query) ||
        app.email.toLowerCase().includes(query) ||
        app.position.toLowerCase().includes(query) ||
        app.status.toLowerCase().includes(query)
      );
    }
  }

  // Filter by department
  onDepartmentFilter(department: string): void {
    this.selectedDepartment = department;
    console.log(`Filtering by ${department} department`);
    // Add filtering logic based on department
  }

  // Application Actions
  viewAllApplications(): void {
    console.log('Loading all applications...');
    // Add navigation to applications page
  }

  viewApplication(id: number): void {
    console.log(`Viewing application #${id}`);
    // Add navigation to application details
  }

  approveApplication(id: number): void {
    const application = this.recentApplications.find(app => app.id === id);
    if (application) {
      application.status = 'Approved';
      application.statusClass = 'bg-green-100 text-green-800';
      application.statusDotClass = 'bg-green-500';
      console.log(`Application for ${application.name} approved!`);
      this.updateKPIData();
    }
  }

  rejectApplication(id: number): void {
    const application = this.recentApplications.find(app => app.id === id);
    if (application) {
      application.status = 'Rejected';
      application.statusClass = 'bg-red-100 text-red-800';
      application.statusDotClass = 'bg-red-500';
      console.log(`Application for ${application.name} rejected`);
      this.updateKPIData();
    }
  }

  scheduleInterview(id: number): void {
    const application = this.recentApplications.find(app => app.id === id);
    if (application) {
      console.log(`Scheduling interview for ${application.name}`);
      // Add interview scheduling logic
      this.addToUpcomingInterviews(application);
    }
  }

  private addToUpcomingInterviews(application: Application): void {
    const newInterview: Interview = {
      id: this.upcomingInterviews.length + 1,
      candidateName: application.name,
      position: application.position,
      description: `Technical interview for ${application.position} position`,
      time: '10:00 AM - 11:00 AM',
      dateLabel: 'Next Week',
      dateClass: 'bg-gray-100 text-gray-800'
    };
    
    this.upcomingInterviews.push(newInterview);
    application.status = 'Interview';
    application.statusClass = 'bg-blue-100 text-blue-800';
    application.statusDotClass = 'bg-blue-500';
  }

  // Interview Actions
  viewInterviewDetails(id: number): void {
    const interview = this.upcomingInterviews.find(int => int.id === id);
    if (interview) {
      console.log(`Viewing details for ${interview.candidateName}'s interview`);
    }
  }

  rescheduleInterview(id: number): void {
    const interview = this.upcomingInterviews.find(int => int.id === id);
    if (interview) {
      console.log(`Rescheduling interview with ${interview.candidateName}`);
    }
  }

  cancelInterview(id: number): void {
    const interviewIndex = this.upcomingInterviews.findIndex(int => int.id === id);
    if (interviewIndex > -1) {
      const interview = this.upcomingInterviews[interviewIndex];
      this.upcomingInterviews.splice(interviewIndex, 1);
      console.log(`Interview with ${interview.candidateName} cancelled`);
    }
  }

  // Quick Actions
  executeQuickAction(actionId: string): void {
    const actionLabels: { [key: string]: string } = {
      'new-employee': 'Opening new employee form',
      'post-job': 'Opening job posting form',
      'schedule-interview': 'Opening interview scheduler',
      'generate-report': 'Generating report'
    };
    
    console.log(actionLabels[actionId] || 'Action executed');
  }

  logout() {
    console.log('Logging out...');
  }

  // Employee Management
  addEmployee(employeeData: Partial<Employee>): void {
    const newEmployee: Employee = {
      id: this.employees.length + 1,
      name: employeeData.name || '',
      email: employeeData.email || '',
      department: employeeData.department || '',
      position: employeeData.position || '',
      startDate: employeeData.startDate || new Date().toISOString().split('T')[0],
      status: 'Active'
    };

    this.employees.push(newEmployee);
    this.updateKPIData();
    console.log(`Employee ${newEmployee.name} added successfully!`);
  }

  updateEmployee(id: number, updatedData: Partial<Employee>): void {
    const employeeIndex = this.employees.findIndex(emp => emp.id === id);
    if (employeeIndex > -1) {
      this.employees[employeeIndex] = { ...this.employees[employeeIndex], ...updatedData };
      console.log('Employee information updated!');
    }
  }

  deactivateEmployee(id: number): void {
    const employee = this.employees.find(emp => emp.id === id);
    if (employee) {
      employee.status = 'Inactive';
      this.updateKPIData();
      console.log(`Employee ${employee.name} deactivated`);
    }
  }

  // Data Management
  private updateKPIData(): void {
    const activeEmployees = this.employees.filter(emp => emp.status === 'Active').length;
    const onLeaveEmployees = this.employees.filter(emp => emp.status === 'On Leave').length;
    const pendingApplications = this.recentApplications.filter(app => app.status === 'Review').length;

    this.kpiData[0].value = activeEmployees.toString();
    this.kpiData[2].value = onLeaveEmployees.toString();
    
    // Update recent activities
    this.addRecentActivity('Dashboard data refreshed', 'bg-blue-500');
  }

  private addRecentActivity(message: string, dotColor: string): void {
    const newActivity: RecentActivity = {
      message,
      time: 'Just now',
      dotColor
    };

    this.recentActivities.unshift(newActivity);
    if (this.recentActivities.length > 10) {
      this.recentActivities.pop();
    }
  }

  // Notification System
  showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
    const notificationConfig = {
      success: {
        class: 'bg-green-500 text-white',
        icon: 'fas fa-check-circle'
      },
      error: {
        class: 'bg-red-500 text-white',
        icon: 'fas fa-exclamation-circle'
      },
      warning: {
        class: 'bg-yellow-500 text-white',
        icon: 'fas fa-exclamation-triangle'
      },
      info: {
        class: 'bg-blue-500 text-white',
        icon: 'fas fa-info-circle'
      }
    };

    this.notification = {
      message,
      class: notificationConfig[type].class,
      icon: notificationConfig[type].icon,
      show: false
    };

    // Trigger slide-in animation
    setTimeout(() => {
      if (this.notification) {
        this.notification.show = true;
      }
    }, 100);

    // Auto dismiss after 3 seconds
    this.notificationTimeout = setTimeout(() => {
      if (this.notification) {
        this.notification.show = false;
        // Remove notification after animation
        setTimeout(() => {
          this.notification = null;
        }, 300);
      }
    }, 3000);
  }

  // Utility Methods
  refreshData(): void {
    this.isLoading = true;
    console.log('Refreshing dashboard data...');
    
    setTimeout(() => {
      this.updateKPIData();
      this.isLoading = false;
      console.log('Dashboard refreshed successfully!');
    }, 1500);
  }

  // Bulk Operations
  bulkApproveApplications(applicationIds: number[]): void {
    let approvedCount = 0;
    applicationIds.forEach(id => {
      const application = this.recentApplications.find(app => app.id === id);
      if (application && application.status === 'Review') {
        application.status = 'Approved';
        application.statusClass = 'bg-green-100 text-green-800';
        application.statusDotClass = 'bg-green-500';
        approvedCount++;
      }
    });
    
    if (approvedCount > 0) {
      console.log(`${approvedCount} applications approved!`);
      this.updateKPIData();
    }
  }

  bulkRejectApplications(applicationIds: number[]): void {
    let rejectedCount = 0;
    applicationIds.forEach(id => {
      const application = this.recentApplications.find(app => app.id === id);
      if (application && application.status === 'Review') {
        application.status = 'Rejected';
        application.statusClass = 'bg-red-100 text-red-800';
        application.statusDotClass = 'bg-red-500';
        rejectedCount++;
      }
    });
    
    if (rejectedCount > 0) {
      console.log(`${rejectedCount} applications rejected`);
      this.updateKPIData();
    }
  }

  // Analytics Methods
  getApplicationStatusCounts(): { [key: string]: number } {
    const counts: { [key: string]: number } = {};
    this.recentApplications.forEach(app => {
      counts[app.status] = (counts[app.status] || 0) + 1;
    });
    return counts;
  }

  getDepartmentEmployeeCounts(): { [key: string]: number } {
    const counts: { [key: string]: number } = {};
    this.employees.forEach(emp => {
      if (emp.status === 'Active') {
        counts[emp.department] = (counts[emp.department] || 0) + 1;
      }
    });
    return counts;
  }

  getHiringTrends(): any[] {
    // Simulate hiring trends data
    return [
      { month: 'Jan', hires: 12 },
      { month: 'Feb', hires: 8 },
      { month: 'Mar', hires: 15 },
      { month: 'Apr', hires: 10 },
      { month: 'May', hires: 18 }
    ];
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  performSearch() {
    // Implement your search logic here
    console.log('Searching for:', this.searchQuery);
  }

  getCurrentSubsection() {
    // Return the current subsection name, adjust as needed
    return 'Dashboard';
  }
}



