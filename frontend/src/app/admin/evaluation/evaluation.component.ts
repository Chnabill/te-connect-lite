import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../admin.service';
import { SidebarComponent } from '@app/shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '@app/shared/components/header/header.component';
import { AuthService } from '../../shared/services/auth.service';

export interface ExtendedEvaluation {
  id: number;
  employeeName: string;
  position: string;
  department: string;
  score: number;
  date: string;
  comments: string;
  status: 'Completed' | 'Pending' | 'In Review' | 'Draft';
  performanceLevel: 'Excellent' | 'Good' | 'Average' | 'Below Average' | 'Poor';
  avatar?: string;
}

@Component({
  selector: 'app-evaluation',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.css']
})
export class EvaluationComponent implements OnInit {
  sidebarOpen = true;
  isMobile = window.innerWidth < 1024;
  activeSection = 'evaluation';
  sidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: 'fas fa-tachometer-alt', route: '/admin/dashboard' },
    { id: 'employee-list', name: 'Manage Users', icon: 'fas fa-users', route: '/admin/employee-list' },
    { id: 'activity-overview', name: 'Activity Overview', icon: 'fas fa-history', route: '/admin/activity-overview' },
    { id: 'evaluation', name: 'Evaluations', icon: 'fas fa-clipboard-check', route: '/admin/evaluation' },
    { id: 'roles-permissions', name: 'Roles & Permissions', icon: 'fas fa-shield-alt', route: '/admin/roles-permissions' },
    { id: 'task-management', name: 'Task Management', icon: 'fas fa-tasks', route: '/admin/task-management' }
  ];

  // Comprehensive fake evaluation data
  evaluations: ExtendedEvaluation[] = [
    {
      id: 1,
      employeeName: 'Sarah Johnson',
      position: 'Senior Developer',
      department: 'Engineering',
      score: 92,
      date: '2024-01-15',
      comments: 'Exceptional performance in leading the new API development. Strong technical skills and excellent team collaboration.',
      status: 'Completed',
      performanceLevel: 'Excellent'
    },
    {
      id: 2,
      employeeName: 'Michael Chen',
      position: 'Product Manager',
      department: 'Product',
      score: 88,
      date: '2024-01-12',
      comments: 'Great strategic thinking and product roadmap execution. Improved cross-team communication significantly.',
      status: 'Completed',
      performanceLevel: 'Excellent'
    },
    {
      id: 3,
      employeeName: 'Emily Rodriguez',
      position: 'UX Designer',
      department: 'Design',
      score: 85,
      date: '2024-01-10',
      comments: 'Creative design solutions and user-centered approach. Delivered high-quality mockups on time.',
      status: 'Completed',
      performanceLevel: 'Good'
    },
    {
      id: 4,
      employeeName: 'David Thompson',
      position: 'Marketing Specialist',
      department: 'Marketing',
      score: 78,
      date: '2024-01-08',
      comments: 'Good campaign execution but needs improvement in data analysis and reporting skills.',
      status: 'In Review',
      performanceLevel: 'Good'
    },
    {
      id: 5,
      employeeName: 'Lisa Wang',
      position: 'HR Coordinator',
      department: 'HR',
      score: 82,
      date: '2024-01-05',
      comments: 'Excellent interpersonal skills and employee relations management. Streamlined onboarding process.',
      status: 'Completed',
      performanceLevel: 'Good'
    },
    {
      id: 6,
      employeeName: 'James Wilson',
      position: 'Sales Representative',
      department: 'Sales',
      score: 95,
      date: '2024-01-03',
      comments: 'Outstanding sales performance, exceeded quarterly targets by 25%. Excellent client relationship management.',
      status: 'Completed',
      performanceLevel: 'Excellent'
    },
    {
      id: 7,
      employeeName: 'Anna Kowalski',
      position: 'Data Analyst',
      department: 'Analytics',
      score: 87,
      date: '2023-12-28',
      comments: 'Strong analytical skills and insightful reporting. Helped identify key business optimization opportunities.',
      status: 'Completed',
      performanceLevel: 'Good'
    },
    {
      id: 8,
      employeeName: 'Robert Martinez',
      position: 'DevOps Engineer',
      department: 'Engineering',
      score: 90,
      date: '2023-12-25',
      comments: 'Excellent infrastructure management and deployment automation. Reduced deployment time by 40%.',
      status: 'Completed',
      performanceLevel: 'Excellent'
    },
    {
      id: 9,
      employeeName: 'Jennifer Lee',
      position: 'Content Writer',
      department: 'Marketing',
      score: 75,
      date: '2023-12-22',
      comments: 'Good writing quality but needs to improve SEO optimization and content strategy alignment.',
      status: 'Pending',
      performanceLevel: 'Average'
    },
    {
      id: 10,
      employeeName: 'Thomas Anderson',
      position: 'Quality Assurance',
      department: 'Engineering',
      score: 83,
      date: '2023-12-20',
      comments: 'Thorough testing approach and good bug detection rate. Improved testing documentation significantly.',
      status: 'Completed',
      performanceLevel: 'Good'
    },
    {
      id: 11,
      employeeName: 'Maria Garcia',
      position: 'Finance Analyst',
      department: 'Finance',
      score: 89,
      date: '2023-12-18',
      comments: 'Excellent financial modeling and budget analysis. Provided valuable insights for cost optimization.',
      status: 'Completed',
      performanceLevel: 'Excellent'
    },
    {
      id: 12,
      employeeName: 'Kevin Brown',
      position: 'Customer Support',
      department: 'Support',
      score: 72,
      date: '2023-12-15',
      comments: 'Good customer service skills but response time needs improvement. Working on technical knowledge gaps.',
      status: 'Draft',
      performanceLevel: 'Average'
    }
  ];

  filteredEvaluations: ExtendedEvaluation[] = [];
  selectedFilter = 'all';
  searchTerm = '';

  // Modal states
  showAddModal = false;
  showEditModal = false;
  showViewModal = false;
  newEval: ExtendedEvaluation = this.getEmptyEvaluation();
  editEval: ExtendedEvaluation = this.getEmptyEvaluation();
  viewEval: ExtendedEvaluation = this.getEmptyEvaluation();
  evaluationForm: Partial<ExtendedEvaluation> = {
    employeeName: '',
    position: '',
    department: '',
    score: 0,
    date: '',
    comments: '',
    status: 'Draft'
  };

  constructor(
    private adminService: AdminService,
    private router: Router,
    private authService: AuthService
  ) {}

  getEmptyEvaluation(): ExtendedEvaluation {
    return {
      id: 0,
      employeeName: '',
      position: '',
      department: '',
      score: 0,
      date: '',
      comments: '',
      status: 'Draft',
      performanceLevel: 'Average'
    };
  }

  ngOnInit() {
    this.filteredEvaluations = [...this.evaluations];
    this.applyFilters();
  }

  // Sidebar methods
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
    return 'Employee Evaluations';
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  // Statistics methods
  getTotalEvaluations(): number {
    return this.evaluations.length;
  }

  getAverageScore(): number {
    if (this.evaluations.length === 0) return 0;
    const total = this.evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0);
    return Math.round(total / this.evaluations.length);
  }

  getExcellentCount(): number {
    return this.evaluations.filter(evaluation => evaluation.performanceLevel === 'Excellent').length;
  }

  getPendingCount(): number {
    return this.evaluations.filter(evaluation => evaluation.status === 'Pending' || evaluation.status === 'In Review').length;
  }

  getCompletionRate(): number {
    if (this.evaluations.length === 0) return 0;
    const completedCount = this.evaluations.filter(evaluation => evaluation.status === 'Completed').length;
    return Math.round((completedCount / this.evaluations.length) * 100);
  }

  getNewEvaluationsCount(): number {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return this.evaluations.filter(evaluation => {
      const evalDate = new Date(evaluation.date);
      return evalDate.getMonth() === currentMonth && evalDate.getFullYear() === currentYear;
    }).length;
  }

  getExcellentPercentage(): number {
    if (this.evaluations.length === 0) return 0;
    const excellentCount = this.evaluations.filter(evaluation => evaluation.performanceLevel === 'Excellent').length;
    return Math.round((excellentCount / this.evaluations.length) * 100);
  }

  getPendingPercentage(): number {
    if (this.evaluations.length === 0) return 0;
    const pendingCount = this.evaluations.filter(evaluation => evaluation.status === 'Pending' || evaluation.status === 'In Review').length;
    return Math.round((pendingCount / this.evaluations.length) * 100);
  }

  // Filtering and searching
  applyFilters() {
    let filtered = [...this.evaluations];

    // Apply status filter
    if (this.selectedFilter !== 'all') {
      filtered = filtered.filter(evaluation => evaluation.status.toLowerCase() === this.selectedFilter);
    }

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(evaluation => 
        evaluation.employeeName.toLowerCase().includes(term) ||
        evaluation.position.toLowerCase().includes(term) ||
        evaluation.department.toLowerCase().includes(term)
      );
    }

    this.filteredEvaluations = filtered;
  }

  onFilterChange() {
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
  }

  applyFilter() {
    this.applyFilters();
  }

  applySearch() {
    this.applyFilters();
  }

  trackByEvaluation(index: number, evaluation: ExtendedEvaluation): number {
    return evaluation.id;
  }

  refreshEvaluations() {
    // Simulate refresh
    this.applyFilters();
  }

  exportEvaluations() {
    // Simulate export functionality
    console.log('Exporting evaluations...', this.filteredEvaluations);
    alert('Export functionality would be implemented here');
  }

  // Modal methods
  openAddModal() {
    this.evaluationForm = {
      employeeName: '',
      position: '',
      department: '',
      score: 0,
      date: new Date().toISOString().split('T')[0],
      comments: '',
      status: 'Draft'
    };
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  openEditModal(evaluation: ExtendedEvaluation) {
    this.evaluationForm = { ...evaluation };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  openViewModal(evaluation: ExtendedEvaluation) {
    this.viewEval = { ...evaluation };
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.viewEval = this.getEmptyEvaluation();
  }

  viewEvaluation(evaluation: ExtendedEvaluation) {
    this.viewEval = { ...evaluation };
    this.showViewModal = true;
  }

  // CRUD operations
  saveEvaluation() {
    if (this.isFormValid()) {
      const newEvaluation: ExtendedEvaluation = {
        id: Date.now(),
        employeeName: this.evaluationForm.employeeName!,
        position: this.evaluationForm.position!,
        department: this.evaluationForm.department!,
        score: this.evaluationForm.score!,
        date: this.evaluationForm.date!,
        comments: this.evaluationForm.comments!,
        status: this.evaluationForm.status as any,
        performanceLevel: this.getPerformanceLevel(this.evaluationForm.score!)
      };

      this.evaluations.unshift(newEvaluation);
      this.applyFilters();
      this.closeAddModal();
    }
  }

  saveEditedEvaluation() {
    if (this.isFormValid()) {
      const index = this.evaluations.findIndex(evaluation => evaluation.id === this.evaluationForm.id);
      if (index !== -1) {
        this.evaluations[index] = {
          ...this.evaluationForm,
          performanceLevel: this.getPerformanceLevel(this.evaluationForm.score!)
        } as ExtendedEvaluation;
        this.applyFilters();
        this.closeEditModal();
      }
    }
  }

  deleteEvaluation(id: number) {
    const evaluation = this.evaluations.find(e => e.id === id);
    if (evaluation && confirm(`Are you sure you want to delete the evaluation for ${evaluation.employeeName}?`)) {
      const index = this.evaluations.findIndex(evalItem => evalItem.id === id);
      if (index !== -1) {
        this.evaluations.splice(index, 1);
        this.applyFilters();
      }
    }
  }

  // Utility methods
  isFormValid(): boolean {
    return !!(this.evaluationForm.employeeName && 
             this.evaluationForm.position && 
             this.evaluationForm.department && 
             this.evaluationForm.score !== undefined &&
             this.evaluationForm.score >= 0 && 
             this.evaluationForm.score <= 100 &&
             this.evaluationForm.date &&
             this.evaluationForm.comments);
  }

  getPerformanceLevel(score: number): 'Excellent' | 'Good' | 'Average' | 'Below Average' | 'Poor' {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Average';
    if (score >= 60) return 'Below Average';
    return 'Poor';
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  getScoreClass(score: number): string {
    if (score >= 90) return 'text-green-600 font-semibold';
    if (score >= 80) return 'text-blue-600 font-semibold';
    if (score >= 70) return 'text-yellow-600 font-semibold';
    if (score >= 60) return 'text-orange-600 font-semibold';
    return 'text-red-600 font-semibold';
  }

  getScoreColor(score: number): string {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'In Review': return 'bg-blue-100 text-blue-800';
      case 'Draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getDepartmentClass(department: string): string {
    switch (department) {
      case 'Engineering': return 'bg-blue-100 text-blue-800';
      case 'Product': return 'bg-purple-100 text-purple-800';
      case 'Design': return 'bg-pink-100 text-pink-800';
      case 'Marketing': return 'bg-orange-100 text-orange-800';
      case 'HR': return 'bg-green-100 text-green-800';
      case 'Sales': return 'bg-red-100 text-red-800';
      case 'Analytics': return 'bg-indigo-100 text-indigo-800';
      case 'Finance': return 'bg-yellow-100 text-yellow-800';
      case 'Support': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getPerformanceLevelClass(level: string): string {
    switch (level) {
      case 'Excellent': return 'bg-green-100 text-green-800';
      case 'Good': return 'bg-blue-100 text-blue-800';
      case 'Average': return 'bg-yellow-100 text-yellow-800';
      case 'Below Average': return 'bg-orange-100 text-orange-800';
      case 'Poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getPerformanceClass(score: number): string {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    if (score >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  }
}