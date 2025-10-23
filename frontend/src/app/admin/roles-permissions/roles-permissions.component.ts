import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService, Role } from '../admin.service';
import { SidebarComponent } from '@app/shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '@app/shared/components/header/header.component';
import { AuthService } from '../../shared/services/auth.service';

export interface ExtendedRole {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  color: string;
  icon: string;
  createdDate: string;
  lastModified: string;
  isActive: boolean;
}

export interface Permission {
  id: string;
  name: string;
  category: string;
  description: string;
}

@Component({
  selector: 'app-roles-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  templateUrl: './roles-permissions.component.html',
  styleUrls: ['./roles-permissions.component.css']
})
export class RolesPermissionsComponent implements OnInit {
  sidebarOpen = true;
  isMobile = window.innerWidth < 1024;
  activeSection = 'roles-permissions';
  sidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: 'fas fa-tachometer-alt', route: '/admin/dashboard' },
    { id: 'employee-list', name: 'Manage Users', icon: 'fas fa-users', route: '/admin/employee-list' },
    { id: 'activity-overview', name: 'Activity Overview', icon: 'fas fa-history', route: '/admin/activity-overview' },
    { id: 'evaluation', name: 'Evaluations', icon: 'fas fa-clipboard-check', route: '/admin/evaluation' },
    { id: 'roles-permissions', name: 'Roles & Permissions', icon: 'fas fa-shield-alt', route: '/admin/roles-permissions' },
    { id: 'task-management', name: 'Task Management', icon: 'fas fa-tasks', route: '/admin/task-management' }
  ];

  // Enhanced data structures
  roles: ExtendedRole[] = [];
  permissions: Permission[] = [];
  filteredRoles: ExtendedRole[] = [];
  
  // Modal states
  showAddModal = false;
  showEditModal = false;
  showViewModal = false;
  
  // Form data
  newRole: ExtendedRole = this.getEmptyRole();
  editRole: ExtendedRole = this.getEmptyRole();
  viewRole: ExtendedRole = this.getEmptyRole();
  
  // Filters and search
  searchTerm = '';
  statusFilter = 'all';
  selectedPermissions: string[] = [];
  
  // Permission categories
  permissionCategories = ['User Management', 'Content Management', 'System Administration', 'Reports & Analytics', 'Security'];

  constructor(
    private adminService: AdminService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadFakeData();
  }

  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }
  setActiveSection(section: string): void {
    this.activeSection = section;
    const selectedItem = this.sidebarItems.find(item => item.id === section);
    if (selectedItem && selectedItem.route) {
      window.location.href = selectedItem.route;
    }
  }
  getSectionTitle(): string { return 'Roles & Permissions'; }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  loadFakeData() {
    // Load fake permissions
    this.permissions = [
      // User Management
      { id: 'user.create', name: 'Create Users', category: 'User Management', description: 'Ability to create new user accounts' },
      { id: 'user.read', name: 'View Users', category: 'User Management', description: 'Ability to view user profiles and information' },
      { id: 'user.update', name: 'Edit Users', category: 'User Management', description: 'Ability to modify user accounts and profiles' },
      { id: 'user.delete', name: 'Delete Users', category: 'User Management', description: 'Ability to remove user accounts' },
      { id: 'user.roles', name: 'Manage User Roles', category: 'User Management', description: 'Ability to assign and modify user roles' },
      
      // Content Management
      { id: 'content.create', name: 'Create Content', category: 'Content Management', description: 'Ability to create new content and posts' },
      { id: 'content.read', name: 'View Content', category: 'Content Management', description: 'Ability to view all content and posts' },
      { id: 'content.update', name: 'Edit Content', category: 'Content Management', description: 'Ability to modify existing content' },
      { id: 'content.delete', name: 'Delete Content', category: 'Content Management', description: 'Ability to remove content and posts' },
      { id: 'content.publish', name: 'Publish Content', category: 'Content Management', description: 'Ability to publish and unpublish content' },
      
      // System Administration
      { id: 'system.settings', name: 'System Settings', category: 'System Administration', description: 'Ability to modify system configuration' },
      { id: 'system.backup', name: 'System Backup', category: 'System Administration', description: 'Ability to create and restore backups' },
      { id: 'system.logs', name: 'View System Logs', category: 'System Administration', description: 'Ability to access system logs and audit trails' },
      { id: 'system.maintenance', name: 'System Maintenance', category: 'System Administration', description: 'Ability to perform system maintenance tasks' },
      
      // Reports & Analytics
      { id: 'reports.view', name: 'View Reports', category: 'Reports & Analytics', description: 'Ability to view system reports and analytics' },
      { id: 'reports.create', name: 'Create Reports', category: 'Reports & Analytics', description: 'Ability to generate custom reports' },
      { id: 'reports.export', name: 'Export Reports', category: 'Reports & Analytics', description: 'Ability to export reports in various formats' },
      
      // Security
      { id: 'security.audit', name: 'Security Audit', category: 'Security', description: 'Ability to perform security audits' },
      { id: 'security.permissions', name: 'Manage Permissions', category: 'Security', description: 'Ability to manage roles and permissions' },
      { id: 'security.sessions', name: 'Manage Sessions', category: 'Security', description: 'Ability to manage user sessions' }
    ];

    // Load fake roles
    this.roles = [
      {
        id: 1,
        name: 'Super Administrator',
        description: 'Full system access with all permissions',
        permissions: this.permissions.map(p => p.id), // All permissions
        userCount: 2,
        color: 'bg-red-500',
        icon: 'fas fa-crown',
        createdDate: '2024-01-15',
        lastModified: '2024-08-20',
        isActive: true
      },
      {
        id: 2,
        name: 'Administrator',
        description: 'Administrative access with most permissions',
        permissions: [
          'user.create', 'user.read', 'user.update', 'user.roles',
          'content.create', 'content.read', 'content.update', 'content.publish',
          'system.settings', 'system.logs',
          'reports.view', 'reports.create', 'reports.export',
          'security.permissions'
        ],
        userCount: 5,
        color: 'bg-purple-500',
        icon: 'fas fa-user-shield',
        createdDate: '2024-01-20',
        lastModified: '2024-08-18',
        isActive: true
      },
      {
        id: 3,
        name: 'Manager',
        description: 'Management level access for team oversight',
        permissions: [
          'user.read', 'user.update',
          'content.create', 'content.read', 'content.update',
          'reports.view', 'reports.create'
        ],
        userCount: 12,
        color: 'bg-blue-500',
        icon: 'fas fa-users-cog',
        createdDate: '2024-02-01',
        lastModified: '2024-08-15',
        isActive: true
      },
      {
        id: 4,
        name: 'Editor',
        description: 'Content management and editing permissions',
        permissions: [
          'content.create', 'content.read', 'content.update', 'content.publish',
          'user.read'
        ],
        userCount: 18,
        color: 'bg-green-500',
        icon: 'fas fa-edit',
        createdDate: '2024-02-10',
        lastModified: '2024-08-12',
        isActive: true
      },
      {
        id: 5,
        name: 'Moderator',
        description: 'Content moderation and user management',
        permissions: [
          'user.read', 'user.update',
          'content.read', 'content.update', 'content.delete'
        ],
        userCount: 8,
        color: 'bg-yellow-500',
        icon: 'fas fa-gavel',
        createdDate: '2024-03-01',
        lastModified: '2024-08-10',
        isActive: true
      },
      {
        id: 6,
        name: 'Viewer',
        description: 'Read-only access to system information',
        permissions: [
          'user.read',
          'content.read',
          'reports.view'
        ],
        userCount: 25,
        color: 'bg-gray-500',
        icon: 'fas fa-eye',
        createdDate: '2024-03-15',
        lastModified: '2024-08-05',
        isActive: true
      },
      {
        id: 7,
        name: 'Guest',
        description: 'Limited access for temporary users',
        permissions: ['content.read'],
        userCount: 3,
        color: 'bg-indigo-500',
        icon: 'fas fa-user-clock',
        createdDate: '2024-04-01',
        lastModified: '2024-07-20',
        isActive: false
      }
    ];

    this.applyFilters();
  }

  // Filter and search methods
  applyFilters() {
    this.filteredRoles = this.roles.filter(role => {
      const matchesSearch = role.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           role.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.statusFilter === 'all' || 
                           (this.statusFilter === 'active' && role.isActive) ||
                           (this.statusFilter === 'inactive' && !role.isActive);
      return matchesSearch && matchesStatus;
    });
  }

  onSearchChange() {
    this.applyFilters();
  }

  onStatusFilterChange() {
    this.applyFilters();
  }

  // Modal methods
  openAddModal() {
    this.newRole = this.getEmptyRole();
    this.selectedPermissions = [];
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
    this.newRole = this.getEmptyRole();
    this.selectedPermissions = [];
  }

  openEditModal(role: ExtendedRole) {
    this.editRole = { ...role };
    this.selectedPermissions = [...role.permissions];
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editRole = this.getEmptyRole();
    this.selectedPermissions = [];
  }

  openViewModal(role: ExtendedRole) {
    this.viewRole = { ...role };
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.viewRole = this.getEmptyRole();
  }

  // CRUD operations
  addRole() {
    if (this.newRole.name && this.newRole.description) {
      const newId = Math.max(...this.roles.map(r => r.id)) + 1;
      const roleToAdd: ExtendedRole = {
        ...this.newRole,
        id: newId,
        permissions: [...this.selectedPermissions],
        userCount: 0,
        createdDate: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
        isActive: true
      };
      
      this.roles.push(roleToAdd);
      this.applyFilters();
      this.closeAddModal();
    }
  }

  updateRole() {
    if (this.editRole.name && this.editRole.description) {
      const index = this.roles.findIndex(r => r.id === this.editRole.id);
      if (index !== -1) {
        this.roles[index] = {
          ...this.editRole,
          permissions: [...this.selectedPermissions],
          lastModified: new Date().toISOString().split('T')[0]
        };
        this.applyFilters();
        this.closeEditModal();
      }
    }
  }

  deleteRole(id: number) {
    const role = this.roles.find(r => r.id === id);
    if (role && confirm(`Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`)) {
      this.roles = this.roles.filter(r => r.id !== id);
      this.applyFilters();
    }
  }

  toggleRoleStatus(id: number) {
    const role = this.roles.find(r => r.id === id);
    if (role) {
      role.isActive = !role.isActive;
      role.lastModified = new Date().toISOString().split('T')[0];
      this.applyFilters();
    }
  }

  // Utility methods
  getEmptyRole(): ExtendedRole {
    return {
      id: 0,
      name: '',
      description: '',
      permissions: [],
      userCount: 0,
      color: 'bg-blue-500',
      icon: 'fas fa-user',
      createdDate: '',
      lastModified: '',
      isActive: true
    };
  }

  getPermissionsByCategory(category: string): Permission[] {
    return this.permissions.filter(p => p.category === category);
  }

  togglePermission(permissionId: string) {
    const index = this.selectedPermissions.indexOf(permissionId);
    if (index > -1) {
      this.selectedPermissions.splice(index, 1);
    } else {
      this.selectedPermissions.push(permissionId);
    }
  }

  isPermissionSelected(permissionId: string): boolean {
    return this.selectedPermissions.includes(permissionId);
  }

  getPermissionName(permissionId: string): string {
    const permission = this.permissions.find(p => p.id === permissionId);
    return permission ? permission.name : permissionId;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  getRoleStats() {
    return {
      total: this.roles.length,
      active: this.roles.filter(r => r.isActive).length,
      inactive: this.roles.filter(r => !r.isActive).length,
      totalUsers: this.roles.reduce((sum, r) => sum + r.userCount, 0)
    };
  }
}