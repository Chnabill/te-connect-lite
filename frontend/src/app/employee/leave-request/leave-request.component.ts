import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatbotComponent } from '../../shared/components/chatbot/chatbot.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../shared/services/auth.service';
import { UserService, User } from '../../shared/services/user.service';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/components/header/header.component';

interface SidebarItem {
  id: string;
  name: string;
  icon: string;
  route: string;
  badge?: string;
  badgeClass?: string;
}

@Component({
  selector: 'app-leave-request',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatbotComponent, SidebarComponent, HeaderComponent],
  templateUrl: './leave-request.component.html',
  styleUrls: ['./leave-request.component.css']
})
export class LeaveRequestComponent implements OnInit, OnDestroy {
  // Sidebar state (copied from dashboard)
  sidebarOpen = true;
  activeSection = 'leave'; // Set active section for this component
  isMobile = false;

  sidebarItems: SidebarItem[] = [
    { id: 'dashboard', name: 'Dashboard', icon: 'fas fa-tachometer-alt', route: '/employee/dashboard' },
    { id: 'announcements', name: 'Announcements', icon: 'fas fa-bullhorn', route: '/employee/announcement-view' },
    { id: 'leave', name: 'Leave Management', icon: 'fas fa-calendar-alt', route: '/employee/leave-management' },
    { id: 'documents', name: 'Documents', icon: 'fas fa-file-alt', route: '/employee/documents' },
    { id: 'meetings', name: 'Meetings', icon: 'fas fa-calendar-check', route: '/employee/meetings' },
    { id: 'messagerie', name: 'Messagerie', icon: 'fas fa-comments', route: '/employee/messagerie' },
  ];

  // Leave Request Form Properties
  leaveType: string = '';
  startDate: string = '';
  endDate: string = '';
  reason: string = '';
  requestStatus: 'idle' | 'submitting' | 'awaiting approval' | 'approved' | 'rejected' = 'idle';

  user: User | null = null;
  leaveRequests: any[] = [];

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.checkScreenSize();
    this.fetchCurrentUserAndLeaves();
  }

  ngOnDestroy(): void {
    // No specific cleanup needed yet, but keeping structure consistent
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  checkScreenSize(): void {
    this.isMobile = window.innerWidth < 1024;
    if (this.isMobile) {
      this.sidebarOpen = false;
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
    if (this.isMobile) {
      this.sidebarOpen = false;
    }
    const selectedItem = this.sidebarItems.find(item => item.id === section);
    if (selectedItem && selectedItem.route) {
      this.router.navigateByUrl(selectedItem.route);
      console.log(`Navigating to ${selectedItem.route}`);
    }
  }

  logout(): void {
    console.log('Logging out...');
    // Implement actual logout logic here
  }

  // Leave Request Form Methods
  submitLeaveRequest() {
    this.requestStatus = 'submitting';
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    if (!email) {
      this.requestStatus = 'idle';
      alert('User email not found. Please log in again.');
      return;
    }
    this.userService.getUserByEmail(email).subscribe({
      next: (user: User) => {
        const payload = {
          employee_name: user.full_name,
          employee_id: user.teId,
          leave_type: this.leaveType,
          start_date: this.startDate,
          end_date: this.endDate,
          status: 'pending',
          reason: this.reason,
          department: user.department,
          submitted_date: new Date().toISOString().slice(0, 10)
        };
        const headers = token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : undefined;
        this.http.post(`${environment.apiUrl}leave/`, payload, { headers }).subscribe({
          next: () => {
            this.requestStatus = 'awaiting approval';
            // Optionally, clear form or show success message
          },
          error: () => {
            this.requestStatus = 'idle';
            alert('Failed to submit leave request.');
          }
        });
      },
      error: () => {
        this.requestStatus = 'idle';
        alert('Failed to fetch user details.');
      }
    });
  }

  getSectionTitle(): string {
    const item = this.sidebarItems.find(item => item.id === this.activeSection);
    return item ? item.name : 'Leave Request';
  }

  fetchCurrentUserAndLeaves() {
    const email = localStorage.getItem('email');
    if (!email) return;
    this.userService.getUserByEmail(email).subscribe({
      next: (user: User) => {
        this.user = user;
        this.fetchLeaveRequests(user.teId);
      },
      error: () => {
        this.user = null;
      }
    });
  }

  fetchLeaveRequests(employeeId: string) {
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : undefined;
    this.http.get<any[]>(`${environment.apiUrl}leave/?employee_id=${encodeURIComponent(employeeId)}`, { headers }).subscribe({
      next: (data) => {
        this.leaveRequests = data;
      },
      error: () => {
        this.leaveRequests = [];
      }
    });
  }
} 