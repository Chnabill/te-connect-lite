import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../shared/services/auth.service';
import { HeaderComponent } from '@app/shared/components/header/header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';

interface LeaveRequest {
  id: number;
  employeeName: string;
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  department: string;
  submittedDate: string;
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
  selector: 'app-leave-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent, SidebarComponent],
  templateUrl: './leave-management.component.html',
  styleUrls: ['./leave-management.component.css']
})
export class LeaveManagementComponent implements OnInit {
  // Sidebar state
  sidebarOpen = true;
  isMobile = false;
  activeSection = 'leave-management';
  notificationCount = 3;
  userName = 'HR Manager';
  userRole = 'Human Resources';
  userInitials = 'HR';

  // Leave management state
  leaveRequests: LeaveRequest[] = [];
  filteredRequests: LeaveRequest[] = [];
  selectedRequest: LeaveRequest | null = null;
  loading = false;
  error: string | null = null;
  searchQuery = '';
  statusFilter = 'all';

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

  constructor(private http: HttpClient, private authService: AuthService, private router: Router) {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  ngOnInit() {
    this.loadLeaveRequests();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 1024;
    if (this.isMobile) {
      this.sidebarOpen = false;
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  setActiveSection(sectionId: string) {
    this.activeSection = sectionId;
    if (this.isMobile) {
      this.sidebarOpen = false;
    }
    const selectedItem = this.sidebarItems.find(item => item.id === sectionId);
    if (selectedItem && selectedItem.route) {
      this.router.navigateByUrl(selectedItem.route);
    }
  }

  getSectionTitle(): string {
    const item = this.sidebarItems.find(item => item.id === this.activeSection);
    return item ? item.name : 'Leave Management';
  }

  loadLeaveRequests() {
    this.loading = true;
    this.error = null;
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : undefined;
    this.http.get<any[]>(`${environment.apiUrl}leave`, { headers }).subscribe({
      next: (data) => {
        this.leaveRequests = data.map(item => ({
          id: item.id,
          employeeName: item.employee_name,
          employeeId: item.employee_id,
          leaveType: item.leave_type,
          startDate: item.start_date,
          endDate: item.end_date,
          status: item.status,
          reason: item.reason,
          department: item.department,
          submittedDate: item.submitted_date
        }));
        this.filteredRequests = [...this.leaveRequests];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load leave requests.';
        this.loading = false;
      }
    });
  }

  filterRequests() {
    this.filteredRequests = this.leaveRequests.filter(request => {
      const matchesSearch = request.employeeName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                          request.employeeId.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                          request.department.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesStatus = this.statusFilter === 'all' || request.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  onSearch(query: string) {
    this.searchQuery = query;
    this.filterRequests();
  }

  setStatusFilter(status: string) {
    this.statusFilter = status;
    this.filterRequests();
  }

  approveRequest(request: LeaveRequest) {
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : undefined;
    this.http.patch(`${environment.apiUrl}leave/${request.id}`, { status: 'approved' }, { headers }).subscribe({
      next: (updated: any) => {
        request.status = 'approved';
        this.filterRequests();
      },
      error: () => {
        this.error = 'Failed to approve leave request.';
      }
    });
  }

  rejectRequest(request: LeaveRequest) {
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : undefined;
    this.http.patch(`${environment.apiUrl}leave/${request.id}`, { status: 'rejected' }, { headers }).subscribe({
      next: (updated: any) => {
        request.status = 'rejected';
        this.filterRequests();
      },
      error: () => {
        this.error = 'Failed to reject leave request.';
      }
    });
  }

  deleteRequest(request: LeaveRequest) {
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : undefined;
    this.http.delete(`${environment.apiUrl}leave/${request.id}`, { headers }).subscribe({
      next: () => {
        this.leaveRequests = this.leaveRequests.filter(r => r.id !== request.id);
        this.filterRequests();
      },
      error: () => {
        this.error = 'Failed to delete leave request.';
      }
    });
  }

  viewRequestDetails(request: LeaveRequest) {
    this.selectedRequest = request;
  }

  closeRequestDetails() {
    this.selectedRequest = null;
  }

  logout() {
    // TODO: Implement logout logic
    console.log('Logging out...');
  }
} 