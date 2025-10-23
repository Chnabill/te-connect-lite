import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, Employee } from '../admin.service';
import { HttpClient } from '@angular/common/http';
import { SidebarComponent } from '@app/shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '@app/shared/components/header/header.component';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

interface ExtendedTask {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string;
  assigned_by: string;
  user_id: number;
  user_name: string;
  created_date: string;
  progress: number;
  estimated_hours: number;
  actual_hours?: number;
  department: string;
  tags: string[];
}

@Component({
  selector: 'app-task-management',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  templateUrl: './task-management.component.html',
  styleUrls: ['./task-management.component.css']
})
export class TaskManagementComponent implements OnInit {
  sidebarOpen = true;
  isMobile = window.innerWidth < 1024;
  activeSection = 'task-management';
  sidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: 'fas fa-tachometer-alt', route: '/admin/dashboard' },
    { id: 'employee-list', name: 'Manage Users', icon: 'fas fa-users', route: '/admin/employee-list' },
    { id: 'activity-overview', name: 'Activity Overview', icon: 'fas fa-history', route: '/admin/activity-overview' },
    { id: 'evaluation', name: 'Evaluations', icon: 'fas fa-clipboard-check', route: '/admin/evaluation' },
    { id: 'roles-permissions', name: 'Roles & Permissions', icon: 'fas fa-shield-alt', route: '/admin/roles-permissions' },
    { id: 'task-management', name: 'Task Management', icon: 'fas fa-tasks', route: '/admin/task-management' }
  ];

  // Component state
  tasks: ExtendedTask[] = [];
  filteredTasks: ExtendedTask[] = [];
  employees: Employee[] = [];
  
  // Autocomplete state
  filteredEmployees: Employee[] = [];
  showEmployeeDropdown = false;
  selectedEmployeeIndex = -1;
  
  // Search and filtering
  searchTerm = '';
  statusFilter = 'all';
  priorityFilter = 'all';
  departmentFilter = 'all';
  
  // Modal states
  showAddModal = false;
  showEditModal = false;
  showViewModal = false;
  
  // Form data - these are the missing properties causing template errors
  newTask: Partial<ExtendedTask> = {};
  editTask: ExtendedTask | null = null;
  viewTask: ExtendedTask | null = null;
  selectedTask: ExtendedTask | null = null;
  
  // UI state
  loading = false;
  error = '';
  success = '';
  
  // Fake data
  departments = ['Engineering', 'Product', 'Design', 'Marketing', 'HR', 'Sales', 'Analytics', 'Finance', 'Support'];
  
  constructor(
    private http: HttpClient, 
    private adminService: AdminService,
    private router: Router,
    private authService: AuthService
  ) {
    this.loadFakeData();
    this.loadFakeEmployees();
  }

  ngOnInit() {
    this.applyFilters();
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
    const selectedItem = this.sidebarItems.find(item => item.id === section);
    if (selectedItem && selectedItem.route) {
      window.location.href = selectedItem.route;
    }
  }

  getSectionTitle(): string {
    return 'Task Management';
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  // Fake data generation
  loadFakeEmployees() {
    this.employees = [
      { id: 1, name: 'Sarah Johnson', role: 'Senior Developer', email: 'sarah.johnson@teconnect.com' },
      { id: 2, name: 'Michael Chen', role: 'UI/UX Designer', email: 'michael.chen@teconnect.com' },
      { id: 3, name: 'Lisa Rodriguez', role: 'Database Administrator', email: 'lisa.rodriguez@teconnect.com' },
      { id: 4, name: 'Alex Thompson', role: 'Marketing Specialist', email: 'alex.thompson@teconnect.com' },
      { id: 5, name: 'Jessica White', role: 'HR Manager', email: 'jessica.white@teconnect.com' },
      { id: 6, name: 'Kevin Martinez', role: 'QA Engineer', email: 'kevin.martinez@teconnect.com' },
      { id: 7, name: 'Amanda Garcia', role: 'Data Analyst', email: 'amanda.garcia@teconnect.com' },
      { id: 8, name: 'Daniel Lee', role: 'Security Specialist', email: 'daniel.lee@teconnect.com' },
      { id: 9, name: 'Emily Davis', role: 'Product Manager', email: 'emily.davis@teconnect.com' },
      { id: 10, name: 'Robert Taylor', role: 'DevOps Engineer', email: 'robert.taylor@teconnect.com' },
      { id: 11, name: 'Jennifer Brown', role: 'Business Analyst', email: 'jennifer.brown@teconnect.com' },
      { id: 12, name: 'David Wilson', role: 'Team Lead', email: 'david.wilson@teconnect.com' }
    ];
  }

  loadFakeData() {
    this.tasks = [
      {
        id: 1,
        title: 'Implement User Authentication System',
        description: 'Design and implement a secure user authentication system with JWT tokens, password hashing, and role-based access control.',
        status: 'in-progress',
        priority: 'high',
        due_date: '2024-01-15',
        assigned_by: 'John Smith',
        user_id: 1,
        user_name: 'Sarah Johnson',
        created_date: '2024-01-01',
        progress: 65,
        estimated_hours: 40,
        actual_hours: 26,
        department: 'Engineering',
        tags: ['backend', 'security', 'authentication']
      },
      {
        id: 2,
        title: 'Design Mobile App UI/UX',
        description: 'Create wireframes and high-fidelity designs for the mobile application interface with focus on user experience.',
        status: 'completed',
        priority: 'medium',
        due_date: '2024-01-10',
        assigned_by: 'Emily Davis',
        user_id: 2,
        user_name: 'Michael Chen',
        created_date: '2023-12-20',
        progress: 100,
        estimated_hours: 32,
        actual_hours: 35,
        department: 'Design',
        tags: ['ui', 'ux', 'mobile', 'figma']
      },
      {
        id: 3,
        title: 'Database Performance Optimization',
        description: 'Analyze and optimize database queries, implement indexing strategies, and improve overall database performance.',
        status: 'pending',
        priority: 'urgent',
        due_date: '2024-01-20',
        assigned_by: 'David Wilson',
        user_id: 3,
        user_name: 'Lisa Rodriguez',
        created_date: '2024-01-05',
        progress: 0,
        estimated_hours: 24,
        department: 'Engineering',
        tags: ['database', 'performance', 'optimization']
      },
      {
        id: 4,
        title: 'Marketing Campaign Analysis',
        description: 'Analyze the effectiveness of recent marketing campaigns and provide recommendations for future strategies.',
        status: 'in-progress',
        priority: 'medium',
        due_date: '2024-01-25',
        assigned_by: 'Jennifer Brown',
        user_id: 4,
        user_name: 'Alex Thompson',
        created_date: '2024-01-03',
        progress: 30,
        estimated_hours: 20,
        actual_hours: 6,
        department: 'Marketing',
        tags: ['analytics', 'campaign', 'strategy']
      },
      {
        id: 5,
        title: 'Employee Onboarding Process',
        description: 'Develop a comprehensive onboarding process for new employees including documentation and training materials.',
        status: 'completed',
        priority: 'low',
        due_date: '2024-01-08',
        assigned_by: 'Robert Taylor',
        user_id: 5,
        user_name: 'Jessica White',
        created_date: '2023-12-15',
        progress: 100,
        estimated_hours: 16,
        actual_hours: 18,
        department: 'HR',
        tags: ['hr', 'onboarding', 'documentation']
      },
      {
        id: 6,
        title: 'API Integration Testing',
        description: 'Comprehensive testing of third-party API integrations including error handling and performance testing.',
        status: 'in-progress',
        priority: 'high',
        due_date: '2024-01-18',
        assigned_by: 'Sarah Johnson',
        user_id: 6,
        user_name: 'Kevin Martinez',
        created_date: '2024-01-02',
        progress: 45,
        estimated_hours: 28,
        actual_hours: 12,
        department: 'Engineering',
        tags: ['api', 'testing', 'integration']
      },
      {
        id: 7,
        title: 'Sales Report Dashboard',
        description: 'Create an interactive dashboard for sales team to track performance metrics and generate reports.',
        status: 'pending',
        priority: 'medium',
        due_date: '2024-01-30',
        assigned_by: 'Michael Chen',
        user_id: 7,
        user_name: 'Amanda Garcia',
        created_date: '2024-01-04',
        progress: 0,
        estimated_hours: 36,
        department: 'Analytics',
        tags: ['dashboard', 'sales', 'reporting']
      },
      {
        id: 8,
        title: 'Security Audit',
        description: 'Conduct a comprehensive security audit of the application including penetration testing and vulnerability assessment.',
        status: 'cancelled',
        priority: 'urgent',
        due_date: '2024-01-12',
        assigned_by: 'Lisa Rodriguez',
        user_id: 8,
        user_name: 'Daniel Lee',
        created_date: '2023-12-28',
        progress: 15,
        estimated_hours: 48,
        actual_hours: 7,
        department: 'Engineering',
        tags: ['security', 'audit', 'testing']
      }
    ];
  }

  // Modal Methods
  openAddModal() {
    this.newTask = this.getEmptyTask();
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
    this.newTask = {};
    this.clearMessages();
  }

  openEditModal(task: ExtendedTask) {
    this.editTask = { ...task };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editTask = null;
    this.clearMessages();
  }

  openViewModal(task: ExtendedTask) {
    this.viewTask = { ...task };
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.viewTask = null;
  }

  // Search and Filter Methods
  onSearchChange() {
    this.applyFilters();
  }

  onStatusFilterChange() {
    this.applyFilters();
  }

  onPriorityFilterChange() {
    this.applyFilters();
  }

  onDepartmentFilterChange() {
    this.applyFilters();
  }

  applyFilters() {
    this.filteredTasks = this.tasks.filter(task => {
      const matchesSearch = !this.searchTerm || 
        task.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        task.user_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        task.department.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = this.statusFilter === 'all' || task.status === this.statusFilter;
      const matchesPriority = this.priorityFilter === 'all' || task.priority === this.priorityFilter;
      const matchesDepartment = this.departmentFilter === 'all' || task.department === this.departmentFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesDepartment;
    });
  }

  // Task CRUD Methods
  addTask() {
    if (!this.newTask.title || !this.newTask.user_name) {
      this.error = 'Title and Assignee are required.';
      return;
    }

    const task: ExtendedTask = {
      id: Math.max(...this.tasks.map(t => t.id || 0)) + 1,
      title: this.newTask.title,
      description: this.newTask.description || '',
      status: 'pending',
      priority: this.newTask.priority || 'medium',
      due_date: this.newTask.due_date || '',
      assigned_by: 'Admin',
      user_id: this.newTask.user_id || 0,
      user_name: this.newTask.user_name || '',
      created_date: new Date().toISOString().split('T')[0],
      progress: 0,
      estimated_hours: this.newTask.estimated_hours || 0,
      department: this.newTask.department || '',
      tags: []
    };

    this.tasks.push(task);
    this.applyFilters();
    this.success = 'Task created successfully!';
    this.closeAddModal();
    setTimeout(() => this.clearMessages(), 3000);
  }

  updateTask() {
    if (!this.editTask) return;

    const index = this.tasks.findIndex(t => t.id === this.editTask!.id);
    if (index !== -1) {
      this.tasks[index] = { ...this.editTask };
      this.applyFilters();
      this.success = 'Task updated successfully!';
      this.closeEditModal();
      setTimeout(() => this.clearMessages(), 3000);
    }
  }

  updateTaskStatus(taskId: number, status: ExtendedTask['status']) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = status;
      if (status === 'completed') {
        task.progress = 100;
      }
      this.applyFilters();
      this.success = `Task status updated to ${status}!`;
      setTimeout(() => this.clearMessages(), 3000);
    }
  }

  deleteTask(taskId: number) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task && confirm(`Are you sure you want to delete the task "${task.title}"?`)) {
      this.tasks = this.tasks.filter(t => t.id !== taskId);
      this.applyFilters();
      this.success = 'Task deleted successfully!';
      setTimeout(() => this.clearMessages(), 3000);
    }
  }

  // Utility Methods
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getDaysUntilDue(dueDateString: string): number {
    if (!dueDateString) return 0;
    const today = new Date();
    const due = new Date(dueDateString);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  clearMessages() {
    this.error = '';
    this.success = '';
  }

  getTaskStats() {
    return {
      total: this.tasks.length,
      completed: this.tasks.filter(t => t.status === 'completed').length,
      inProgress: this.tasks.filter(t => t.status === 'in-progress').length,
      pending: this.tasks.filter(t => t.status === 'pending').length,
      overdue: this.tasks.filter(t => {
        const today = new Date();
        const due = new Date(t.due_date);
        return due < today && t.status !== 'completed';
      }).length
    };
  }

  // Autocomplete Methods
  onAssigneeInput(event: any) {
    const value = event.target.value;
    this.newTask.user_name = value;
    
    if (value.length > 0) {
      this.filteredEmployees = this.employees.filter(emp => 
        emp.name.toLowerCase().includes(value.toLowerCase())
      );
      this.showEmployeeDropdown = this.filteredEmployees.length > 0;
      this.selectedEmployeeIndex = -1;
    } else {
      this.showEmployeeDropdown = false;
      this.filteredEmployees = [];
    }
  }

  onAssigneeKeydown(event: KeyboardEvent) {
    if (!this.showEmployeeDropdown) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedEmployeeIndex = Math.min(
          this.selectedEmployeeIndex + 1,
          this.filteredEmployees.length - 1
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedEmployeeIndex = Math.max(this.selectedEmployeeIndex - 1, -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.selectedEmployeeIndex >= 0) {
          this.selectEmployee(this.filteredEmployees[this.selectedEmployeeIndex]);
        }
        break;
      case 'Escape':
        this.showEmployeeDropdown = false;
        this.selectedEmployeeIndex = -1;
        break;
    }
  }

  selectEmployee(employee: Employee) {
    this.newTask.user_name = employee.name;
    this.newTask.user_id = employee.id;
    this.showEmployeeDropdown = false;
    this.selectedEmployeeIndex = -1;
  }

  onAssigneeBlur() {
    // Delay hiding dropdown to allow click on dropdown items
    setTimeout(() => {
      this.showEmployeeDropdown = false;
      this.selectedEmployeeIndex = -1;
    }, 150);
  }

  onAssigneeFocus() {
    if (this.newTask.user_name && this.filteredEmployees.length > 0) {
      this.showEmployeeDropdown = true;
    }
  }

  getEmployeeInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('');
  }

  private getEmptyTask(): Partial<ExtendedTask> {
    return {
      title: '',
      description: '',
      priority: 'medium',
      due_date: '',
      user_name: '',
      user_id: 0,
      estimated_hours: 0,
      department: ''
    };
  }
}
