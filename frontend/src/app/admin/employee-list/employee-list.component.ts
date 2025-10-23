import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '@app/shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '@app/shared/components/header/header.component';
import { HttpClient } from '@angular/common/http';
import { EmployeeCardComponent } from '../../hr/employee-management/employee-card/employee-card.component';
import { AuthService } from '../../shared/services/auth.service';

export interface User {
  id: string;
  teId: string;
  full_name: string;
  user_image?: string;
  email: string;
  department: string;
  phone?: string;
  position?: string;
  joining_date?: string;
  skills?: string;
}

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent, EmployeeCardComponent],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit {
  sidebarOpen = true;
  isMobile = window.innerWidth < 1024;
  activeSection = 'employee-list';
  sidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: 'fas fa-tachometer-alt', route: '/admin/dashboard' },
    { id: 'employee-list', name: 'Manage Users', icon: 'fas fa-users', route: '/admin/employee-list' },
    { id: 'activity-overview', name: 'Activity Overview', icon: 'fas fa-history', route: '/admin/activity-overview' },
    { id: 'evaluation', name: 'Evaluations', icon: 'fas fa-clipboard-check', route: '/admin/evaluation' },
    { id: 'roles-permissions', name: 'Roles & Permissions', icon: 'fas fa-shield-alt', route: '/admin/roles-permissions' },
    { id: 'task-management', name: 'Task Management', icon: 'fas fa-tasks', route: '/admin/task-management' }
  ];

  allUsers: User[] = [];
  filteredUsers: User[] = [];
  departments: string[] = [];
  selectedDepartment = '';
  searchName = '';
  currentPage = 1;
  itemsPerPage = 10;
  selectedUser: User | null = null;
  viewMode: 'table' | 'cards' = 'table';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.http.get<{ users: User[] }>('/api/users').subscribe(res => {
      this.allUsers = res.users;
      this.departments = Array.from(new Set(this.allUsers.map(u => u.department).filter(Boolean)));
      this.applyFilters();
    });
  }

  applyFilters() {
    this.filteredUsers = this.allUsers.filter(user => {
      const matchesDept = this.selectedDepartment ? user.department === this.selectedDepartment : true;
      const matchesName = this.searchName ? user.full_name.toLowerCase().includes(this.searchName.toLowerCase()) : true;
      return matchesDept && matchesName;
    });
    this.currentPage = 1;
  }

  onDepartmentChange() { this.applyFilters(); }
  onNameChange() { this.applyFilters(); }

  get paginatedUsers(): User[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredUsers.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }

  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }

  showUserDetails(user: User) { this.selectedUser = user; }
  closeUserDetails() { this.selectedUser = null; }

  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }
  setActiveSection(section: string): void {
    this.activeSection = section;
    const selectedItem = this.sidebarItems.find(item => item.id === section);
    if (selectedItem && selectedItem.route) {
      window.location.href = selectedItem.route;
    }
  }
  getSectionTitle(): string { return 'Manage Users'; }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  // Map User to EmployeeCard format
  mapToEmployeeCard(user: User) {
    const [firstName, ...rest] = user.full_name.split(' ');
    const lastName = rest.join(' ');
    return {
      id: user.id,
      firstName: firstName || '',
      lastName: lastName || '',
      email: user.email,
      phone: user.phone || '',
      department: user.department,
      position: user.position || '',
      status: 'active' as 'active',
      startDate: user.joining_date ? new Date(user.joining_date) : new Date(0), // Always a Date
      photo: user.user_image,
      skills: user.skills ? (Array.isArray(user.skills) ? user.skills : user.skills.split(',').map((s: string) => s.trim())) : []
    };
  }

  deleteEmployee(id: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.http.delete(`/api/users/${id}`).subscribe({
        next: () => {
          this.allUsers = this.allUsers.filter(u => u.id !== id);
          this.applyFilters();
        },
        error: (err) => {
          alert('Failed to delete user: ' + (err?.error?.detail || err.message || err));
        }
      });
    }
  }

  // Add a getter for normalized skills for the modal
  get selectedUserSkills(): string[] {
    if (!this.selectedUser) return [];
    if (Array.isArray(this.selectedUser.skills)) return this.selectedUser.skills;
    if (typeof this.selectedUser.skills === 'string' && this.selectedUser.skills.trim().length > 0) {
      return this.selectedUser.skills.split(',').map(s => s.trim());
    }
    return [];
  }
}