import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeFormComponent } from './employee-form/employee-form.component';
import { EmployeeTableComponent } from './employee-table/employee-table.component';
import { EmployeeCardComponent } from './employee-card/employee-card.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { HeaderComponent } from '@app/shared/components/header/header.component';
import { UserService, User } from '@app/shared/services/user.service';
import { AnnouncementService } from '../../services/announcement.service';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: 'active' | 'onleave' | 'terminated';
  startDate: Date;
  salary?: number;
  photo?: string;
  address?: string;
  emergencyContact?: string;
  skills?: string[];
  notes?: string;
}

interface EmployeeFormData extends Omit<Employee, 'skills'> {
  skills: string;
}

interface Department {
  name: string;
  employeeCount: number;
  icon: string;
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
  selector: 'app-employee-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet, 
    FormsModule, 
    ReactiveFormsModule,
    EmployeeFormComponent,
    EmployeeTableComponent,
    EmployeeCardComponent,
    SidebarComponent, 
    HeaderComponent
  ],
  templateUrl: './employee-management.component.html',
  styleUrls: ['./employee-management.component.css']
})
export class EmployeeManagementComponent implements OnInit, OnDestroy {
  employeeForm: FormGroup;
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  selectedEmployees: Set<string> = new Set();
  
  departments = ['Engineering', 'Marketing', 'Sales', 'Human Resources', 'Finance', 'Operations', 'Design', 'IT'];
  
  statuses = ['Active', 'On Leave', 'Terminated'];
  positions = ['Manager', 'Senior', 'Mid-level', 'Junior', 'Intern', 'Director', 'VP'];
  
  showForm = false;
  showFilters = false;
  showBulkActions = false;
  isEditing = false;
  viewMode: 'table' | 'cards' = 'table';
  
  currentPage = 1;
  itemsPerPage = 12;
  searchTerm = '';
  selectedDepartment = '';
  selectedStatus = '';
  selectedPosition = '';
  sortBy = 'firstName';
  sortOrder: 'asc' | 'desc' = 'asc';

  // Statistics
  totalEmployees = 0;
  activeEmployees = 0;
  onLeaveEmployees = 0;
  terminatedEmployees = 0;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  isLoading = false;
  private employeeMap = new Map<string, Employee>();
  private departmentIndex = new Map<string, Set<string>>();
  private statusIndex = new Map<string, Set<string>>();
  private positionIndex = new Map<string, Set<string>>();

  // Sidebar properties
  sidebarOpen = true;
  isMobile = false;
  activeSection = 'employees';
  
  // Header properties
  searchQuery: string = '';
  
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

  announcementForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private announcementService: AnnouncementService
  ) {
    this.employeeForm = this.fb.group({
      id: [''],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s-()]+$/)]],
      department: ['', Validators.required],
      position: ['', Validators.required],
      status: ['active', Validators.required],
      startDate: ['', Validators.required],
      salary: ['', [Validators.min(0)]],
      address: [''],
      emergencyContact: [''],
      skills: [''],
      notes: ['']
    });
    this.announcementForm = this.fb.group({
      title: [''],
      content: [''],
      departments: [[]]
    });

    // Setup debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.searchTerm = term;
      this.applyFilters();
    });

    // Check if mobile
    this.isMobile = window.innerWidth < 1024;
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 1024;
    });
  }

  ngOnInit() {
    this.userService.getUsers().subscribe((response: { users: User[] }) => {
      console.log('API users:', response.users);
      this.employees = response.users
        .filter((user: User) => user && typeof user.full_name === 'string')
        .map((user: User) => ({
          id: String(user.id),
          firstName: (user.full_name || '').split(' ')[0],
          lastName: (user.full_name || '').split(' ').slice(1).join(' '),
          email: user.email,
          phone: '',
          department: user.department || '',
          position: user.position || '',
          status: 'active',
          startDate: new Date(),
          photo: user.user_image,
          address: '',
          emergencyContact: '',
          skills: user.skills || [],
          notes: ''
        }));
      console.log('Mapped employees:', this.employees);
      this.buildIndices();
      this.applyFilters();
      this.updateStatistics();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('resize', () => {
      this.isMobile = window.innerWidth < 1024;
    });
  }

  private buildIndices() {
    // Clear existing indices
    this.employeeMap.clear();
    this.departmentIndex.clear();
    this.statusIndex.clear();
    this.positionIndex.clear();

    // Build indices
    this.employees.forEach(employee => {
      // Add to employee map
      this.employeeMap.set(employee.id, employee);

      // Add to department index
      if (!this.departmentIndex.has(employee.department)) {
        this.departmentIndex.set(employee.department, new Set());
      }
      this.departmentIndex.get(employee.department)?.add(employee.id);

      // Add to status index
      if (!this.statusIndex.has(employee.status)) {
        this.statusIndex.set(employee.status, new Set());
      }
      this.statusIndex.get(employee.status)?.add(employee.id);

      // Add to position index
      if (!this.positionIndex.has(employee.position)) {
        this.positionIndex.set(employee.position, new Set());
      }
      this.positionIndex.get(employee.position)?.add(employee.id);
    });
  }

  addNewEmployee() {
    const newEmployee: Employee = {
      id: (this.employees.length + 1).toString(),
      firstName: 'New',
      lastName: 'Employee',
      email: `new.employee${this.employees.length + 1}@example.com`,
      phone: `+1-234-567-${8900 + this.employees.length}`,
      department: this.departments[Math.floor(Math.random() * this.departments.length)],
      position: this.positions[Math.floor(Math.random() * this.positions.length)],
      status: 'active',
      startDate: new Date(),
      salary: Math.floor(Math.random() * (120000 - 50000) + 50000),
      address: `${Math.floor(Math.random() * 1000)} New Street, City, State`,
      emergencyContact: `+1-234-567-${8900 + this.employees.length + 1}`,
      skills: ['New Skill 1', 'New Skill 2', 'New Skill 3'],
      notes: 'New employee added via button click'
    };

    this.employees.push(newEmployee);
    this.applyFilters();
    this.updateStatistics();
  }

  handleFormSubmit(formData: any) {
    if (this.employeeForm.valid) {
      // Process skills as array
      if (formData.skills && typeof formData.skills === 'string') {
        formData.skills = formData.skills.split(',').map((skill: string) => skill.trim());
      }

      if (this.isEditing) {
        const index = this.employees.findIndex(emp => emp.id === formData.id);
        if (index !== -1) {
          this.employees[index] = { ...formData };
        }
      } else {
        const newEmployee: Employee = {
          ...formData,
          id: (this.employees.length + 1).toString(),
          startDate: new Date(formData.startDate),
          status: formData.status || 'active'
        };
        this.employees.push(newEmployee);
      }
      
      this.resetForm();
      this.applyFilters();
      this.updateStatistics();
    }
  }

  editEmployee(employee: Employee) {
    this.isEditing = true;
    this.showForm = true;
    
    // Convert skills array to string for form
    const formData: EmployeeFormData = {
      ...employee,
      skills: Array.isArray(employee.skills) ? employee.skills.join(', ') : employee.skills || ''
    };
    
    this.employeeForm.patchValue(formData);
  }

  deleteEmployee(id: string) {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.userService.deleteUser(Number(id)).subscribe({
        next: () => {
          this.employees = this.employees.filter(emp => emp.id !== id);
          this.selectedEmployees.delete(id);
          this.applyFilters();
          this.updateStatistics();
        },
        error: (err) => {
          alert('Failed to delete user: ' + (err?.error?.detail || err.message || err));
        }
      });
    }
  }

  bulkDelete() {
    if (this.selectedEmployees.size > 0 && confirm(`Delete ${this.selectedEmployees.size} selected employees?`)) {
      this.employees = this.employees.filter(emp => !this.selectedEmployees.has(emp.id));
      this.selectedEmployees.clear();
      this.applyFilters();
      this.updateStatistics();
    }
  }

  bulkStatusUpdate(status: 'active' | 'onleave' | 'terminated') {
    if (this.selectedEmployees.size > 0) {
      this.employees = this.employees.map(emp => 
        this.selectedEmployees.has(emp.id) ? { ...emp, status } : emp
      );
      this.selectedEmployees.clear();
      this.applyFilters();
      this.updateStatistics();
    }
  }

  exportToCSV() {
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Department', 'Position', 'Status', 'Start Date', 'Salary'];
    const csvContent = [
      headers.join(','),
      ...this.filteredEmployees.map(emp => [
        emp.firstName,
        emp.lastName,
        emp.email,
        emp.phone,
        emp.department,
        emp.position,
        emp.status,
        emp.startDate.toDateString(),
        emp.salary || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employees.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  toggleEmployeeSelection(id: string) {
    if (this.selectedEmployees.has(id)) {
      this.selectedEmployees.delete(id);
    } else {
      this.selectedEmployees.add(id);
    }
  }

  selectAllEmployees() {
    if (this.selectedEmployees.size === this.paginatedEmployees.length) {
      this.selectedEmployees.clear();
    } else {
      this.paginatedEmployees.forEach(emp => this.selectedEmployees.add(emp.id));
    }
  }

  resetForm() {
    this.employeeForm.reset({ status: 'active' });
    this.employeeForm.removeControl('id');
    this.showForm = false;
    this.isEditing = false;
  }

  applyFilters() {
    this.isLoading = true;
    
    // Use requestAnimationFrame to prevent UI blocking
    requestAnimationFrame(() => {
      try {
        let filteredIds = new Set<string>(this.employees.map(emp => emp.id));

        // Apply department filter
        if (this.selectedDepartment) {
          const departmentIds = this.departmentIndex.get(this.selectedDepartment) || new Set();
          filteredIds = new Set([...filteredIds].filter(id => departmentIds.has(id)));
        }

        // Apply status filter
        if (this.selectedStatus) {
          const statusIds = this.statusIndex.get(this.selectedStatus) || new Set();
          filteredIds = new Set([...filteredIds].filter(id => statusIds.has(id)));
        }

        // Apply position filter
        if (this.selectedPosition) {
          const positionIds = this.positionIndex.get(this.selectedPosition) || new Set();
          filteredIds = new Set([...filteredIds].filter(id => positionIds.has(id)));
        }

        // Apply search term filter
        if (this.searchTerm) {
          const searchLower = this.searchTerm.toLowerCase();
          filteredIds = new Set([...filteredIds].filter(id => {
            const emp = this.employeeMap.get(id);
            if (!emp) return false;
            
            return emp.id.toLowerCase().includes(searchLower) ||
                   `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchLower) ||
                   emp.email.toLowerCase().includes(searchLower) ||
                   emp.department.toLowerCase().includes(searchLower) ||
                   emp.position.toLowerCase().includes(searchLower);
          }));
        }

        // Convert filtered IDs back to employees
        this.filteredEmployees = [...filteredIds].map(id => this.employeeMap.get(id)!);
        
        this.sortEmployees();
        this.currentPage = 1;
      } finally {
        this.isLoading = false;
      }
    });
  }

  sortEmployees() {
    this.filteredEmployees.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (this.sortBy) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`;
          bValue = `${b.firstName} ${b.lastName}`;
          break;
        case 'startDate':
          aValue = a.startDate;
          bValue = b.startDate;
          break;
        case 'salary':
          aValue = a.salary || 0;
          bValue = b.salary || 0;
          break;
        default:
          aValue = a[this.sortBy as keyof Employee];
          bValue = b[this.sortBy as keyof Employee];
      }

      if (aValue < bValue) return this.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  setSortBy(field: string) {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
    this.sortEmployees();
  }

  updateStatistics() {
    this.totalEmployees = this.employees.length;
    this.activeEmployees = this.employees.filter(emp => emp.status === 'active').length;
    this.onLeaveEmployees = this.employees.filter(emp => emp.status === 'onleave').length;
    this.terminatedEmployees = this.employees.filter(emp => emp.status === 'terminated').length;
  }

  getDepartmentStats(): Department[] {
    return this.departments.map(dept => ({
      name: dept,
      employeeCount: this.employees.filter(emp => emp.department === dept).length,
      icon: this.getDepartmentIcon(dept)
    }));
  }

  getDepartmentIcon(department: string): string {
    const icons: { [key: string]: string } = {
      'Engineering': '⚙️',
      'Marketing': '📢',
      'Sales': '💰',
      'Human Resources': '👥',
      'Finance': '📊',
      'Operations': '🔧',
      'Design': '🎨'
    };
    return icons[department] || '📋';
  }

  onSearch(event: string) {
    this.searchSubject.next(event);
  }

  onDepartmentChange(event: string) {
    this.selectedDepartment = event;
    this.applyFilters();
  }

  onStatusChange(event: string) {
    this.selectedStatus = event;
    this.applyFilters();
  }

  onPositionChange(event: string) {
    this.selectedPosition = event;
    this.applyFilters();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedDepartment = '';
    this.selectedStatus = '';
    this.selectedPosition = '';
    this.sortBy = 'firstName';
    this.sortOrder = 'asc';
    this.currentPage = 1;
    
    // Reset the form controls if they exist
    if (this.employeeForm) {
      this.employeeForm.patchValue({
        department: '',
        status: '',
        position: ''
      });
    }
    
    // Force a refresh of the filtered employees
    this.filteredEmployees = [...this.employees];
    this.sortEmployees();
  }

  get totalPages(): number {
    return Math.ceil(this.filteredEmployees.length / this.itemsPerPage);
  }

  get paginatedEmployees(): Employee[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredEmployees.slice(start, start + this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'onleave':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'terminated':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'active': return '🟢';
      case 'onleave': return '🟡';
      case 'terminated': return '🔴';
      default: return '⚪';
    }
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredEmployees.length);
  }

  getFormFieldError(fieldName: string): string {
    const field = this.employeeForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['pattern']) return 'Please enter a valid phone number';
      if (field.errors['min']) return 'Salary must be a positive number';
    }
    return '';
  }

  toggleForm() {
    if (this.showForm) {
      this.addNewEmployee();
    }
    this.showForm = !this.showForm;
  }

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

  getSectionTitle(): string {
    const section = this.sidebarItems.find(item => item.id === this.activeSection);
    return section ? section.name : 'Employee Management';
  }

  onSubmit() {
    if (this.announcementForm.valid) {
      this.announcementService.createAnnouncement(this.announcementForm.value).subscribe({
        next: (res) => { console.log('Announcement created', res); },
        error: (err) => { console.error('Failed to create announcement', err); }
      });
    }
  }
}