import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterOutlet, Router } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HeaderComponent } from '@app/shared/components/header/header.component';
import { AnnouncementService } from 'src/app/services/announcement.service';
import { HostListener } from '@angular/core';

interface Announcement {
  id: string;
  title: string;
  content: string;
  department: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
  createdBy: string;
  isRead: boolean;
  attachments?: string[];
  expiryDate?: Date;
  tags?: string[];
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
  selector: 'app-announcement-manage',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterOutlet,
    SidebarComponent,
    FooterComponent,
    HeaderComponent
  ],
  templateUrl: './announcement-manage.component.html',
  styleUrls: ['./announcement-manage.component.css']
})
export class AnnouncementManageComponent implements OnInit {
  announcements: Announcement[] = [];
  filteredAnnouncements: Announcement[] = [];
  announcementForm: FormGroup;
  showForm = false;
  isEditing = false;
  selectedAnnouncement: Announcement | null = null;
  
  // Filter properties
  selectedDepartment = '';
  selectedPriority = '';
  searchTerm = '';
  sortBy: 'newest' | 'oldest' | 'priority' = 'newest';
  showRead = true;
  showUnread = true;
  
  // Department dropdown properties
  showDepartmentDropdown = false;
  
  // Departments for dropdown
  departments = [
    'Engineering',
    'Marketing',
    'Sales',
    'Human Resources',
    'Finance',
    'Operations',
    'Design'
  ];

  // Sidebar properties
  sidebarOpen = true;
  isMobile = false;
  activeSection = 'announcements';
  userName = 'John Doe';
  userRole = 'HR Manager';
  userInitials = 'JD';
  notificationCount = 3;
  userEmail = '';
  userImage: string | null = null;
  userId: number = 0;
  
  // Header properties
  searchQuery: string = '';
  showNotifications: boolean = false;
  notifications: any[] = [];
  showUserMenu = false;
  
  // Profile modal properties
  showProfileModal = false;
  profileModalType: 'view' | 'edit' | 'password' | null = null;
  
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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private announcementService: AnnouncementService
  ) {
    this.announcementForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      content: ['', [Validators.required, Validators.minLength(20)]],
      departments: [[], Validators.required],
      priority: ['medium', Validators.required],
      expiry_date: [''],
      tags: ['']
    });

    // Check if mobile
    this.isMobile = window.innerWidth < 1024;
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 1024;
    });
  }

  ngOnInit() {
    this.loadAnnouncements();
    this.applyFilters();
  }

  loadAnnouncements() {
    console.log('Loading announcements from backend...');
    this.announcementService.getAnnouncements().subscribe({
      next: (announcements: any[]) => {
        console.log('Received announcements from backend:', announcements);
        // Transform backend data to match our interface
        this.announcements = announcements.map(announcement => ({
          id: announcement.id.toString(),
          title: announcement.title,
          content: announcement.content,
          department: announcement.departments.join(', '), // Convert array to string for display
          priority: announcement.priority,
          createdAt: new Date(announcement.created_at),
          createdBy: announcement.created_by?.toString() || 'Unknown',
          isRead: false, // Backend doesn't track read status yet
          tags: announcement.tags || [],
          expiryDate: announcement.expiry_date ? new Date(announcement.expiry_date) : undefined
        }));
        console.log('Transformed announcements:', this.announcements);
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading announcements:', error);
        console.error('Error details:', error.error);
        // Fallback to mock data if backend fails
        this.loadMockAnnouncements();
      }
    });
  }

  loadMockAnnouncements() {
    this.announcements = [
      {
        id: '1',
        title: 'New Office Policy Update',
        content: 'Starting next month, we will implement a hybrid work model. Employees will be required to work from the office at least 3 days per week.',
        department: 'All Departments',
        priority: 'high',
        createdAt: new Date('2024-03-15'),
        createdBy: 'HR Department',
        isRead: false,
        tags: ['policy', 'work-model', 'update']
      },
      {
        id: '2',
        title: 'Engineering Team Meeting',
        content: 'All engineering team members are invited to attend the quarterly planning meeting this Friday at 2 PM in Conference Room A.',
        department: 'Engineering',
        priority: 'medium',
        createdAt: new Date('2024-03-14'),
        createdBy: 'Engineering Lead',
        isRead: true,
        tags: ['meeting', 'engineering']
      },
      {
        id: '3',
        title: 'Sales Target Achievement',
        content: 'Congratulations to the sales team for exceeding Q1 targets! Special recognition goes to the top performers.',
        department: 'Sales',
        priority: 'low',
        createdAt: new Date('2024-03-13'),
        createdBy: 'Sales Director',
        isRead: false,
        tags: ['achievement', 'recognition']
      }
    ];
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  resetForm() {
    this.announcementForm.reset({
      priority: 'medium',
      departments: []
    });
    this.isEditing = false;
    this.selectedAnnouncement = null;
  }

  createAnnouncement() {
    if (this.announcementForm.valid) {
      const formData = this.announcementForm.value;
      const payload = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map((tag: string) => tag.trim()) : [],
        expiry_date: formData.expiry_date || null
      };
      // Call the backend service
      this.announcementService.createAnnouncement(payload).subscribe({
        next: (res: any) => {
          this.showForm = false;
          this.resetForm();
          // Reload announcements from backend
          this.loadAnnouncements();
        },
        error: (err: any) => {
          console.error('Error creating announcement:', err);
          alert('Failed to create announcement: ' + (err.error?.detail || 'Unknown error'));
        }
      });
    }
  }

  editAnnouncement(announcement: Announcement) {
    this.selectedAnnouncement = announcement;
    this.isEditing = true;
    this.showForm = true;
    
    this.announcementForm.patchValue({
      title: announcement.title,
      content: announcement.content,
      departments: [announcement.department],
      priority: announcement.priority,
      expiry_date: announcement.expiryDate,
      tags: announcement.tags?.join(', '),
      attachments: announcement.attachments
    });
  }

  updateAnnouncement() {
    if (this.announcementForm.valid && this.selectedAnnouncement) {
      const formData = this.announcementForm.value;
      const index = this.announcements.findIndex(a => a.id === this.selectedAnnouncement?.id);
      
      if (index !== -1) {
        this.announcements[index] = {
          ...this.announcements[index],
          title: formData.title,
          content: formData.content,
          department: formData.departments[0],
          priority: formData.priority,
          tags: formData.tags ? formData.tags.split(',').map((tag: string) => tag.trim()) : [],
          expiryDate: formData.expiry_date ? new Date(formData.expiry_date) : undefined,
          attachments: formData.attachments
        };
        
        this.applyFilters();
        this.resetForm();
        this.showForm = false;
      }
    }
  }

  deleteAnnouncement(id: string) {
    if (confirm('Are you sure you want to delete this announcement?')) {
      this.announcementService.deleteAnnouncement(parseInt(id)).subscribe({
        next: () => {
          // Reload announcements from backend
          this.loadAnnouncements();
        },
        error: (err) => {
          console.error('Error deleting announcement:', err);
          alert('Failed to delete announcement: ' + (err.error?.detail || 'Unknown error'));
        }
      });
    }
  }

  markAsRead(id: string) {
    const announcement = this.announcements.find(a => a.id === id);
    if (announcement) {
      announcement.isRead = true;
      this.applyFilters();
    }
  }

  applyFilters() {
    let filtered = [...this.announcements];

    // Apply department filter
    if (this.selectedDepartment && this.selectedDepartment !== 'All Departments') {
      filtered = filtered.filter(a => a.department === this.selectedDepartment);
    }

    // Apply priority filter
    if (this.selectedPriority) {
      filtered = filtered.filter(a => a.priority === this.selectedPriority);
    }

    // Apply read/unread filter
    if (!this.showRead || !this.showUnread) {
      filtered = filtered.filter(a => 
        (this.showRead && a.isRead) || (this.showUnread && !a.isRead)
      );
    }

    // Apply search term
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(searchLower) ||
        a.content.toLowerCase().includes(searchLower) ||
        a.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'newest':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'oldest':
          return a.createdAt.getTime() - b.createdAt.getTime();
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        default:
          return 0;
      }
    });

    this.filteredAnnouncements = filtered;
  }

  clearFilters() {
    this.selectedDepartment = '';
    this.selectedPriority = '';
    this.searchTerm = '';
    this.sortBy = 'newest';
    this.showRead = true;
    this.showUnread = true;
    this.applyFilters();
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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

  viewAnnouncementDetails(announcement: Announcement) {
    this.router.navigate(['/hr/announcement', announcement.id]);
  }

  getSectionTitle(): string {
    const section = this.sidebarItems.find(item => item.id === this.activeSection);
    return section ? section.name : 'Announcements';
  }

  // Header methods
  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  performSearch() {
    // Implement your search logic here
    console.log('Searching for:', this.searchQuery);
  }

  getCurrentSubsection() {
    // Return the current subsection name, adjust as needed
    return 'Announcements';
  }

  toggleUserMenu() {
    console.log('User menu toggled');
    this.showUserMenu = !this.showUserMenu;
  }

  closeUserMenu() {
    this.showUserMenu = false;
  }

  // Profile Modal Methods
  openProfileModal(type: 'view' | 'edit' | 'password') {
    this.profileModalType = type;
    this.showProfileModal = true;
    this.closeUserMenu(); // Optionally close the user menu when opening modal
  }

  closeProfileModal() {
    this.showProfileModal = false;
    this.profileModalType = null;
  }

  // Handle profile image upload
  onProfileImageChange(event: any) {
    const file = event.target.files && event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.userImage = e.target.result;
        // Save the image to backend
        if (this.userId) {
          // Add your backend call here if needed
          console.log('Profile image updated');
        }
      };
      reader.readAsDataURL(file);
    }
  }

  // Department dropdown methods
  toggleDepartmentDropdown() {
    this.showDepartmentDropdown = !this.showDepartmentDropdown;
  }

  toggleDepartment(department: string) {
    const currentDepartments = this.announcementForm.get('departments')?.value || [];
    let newDepartments: string[];
    
    if (currentDepartments.includes(department)) {
      // Remove department
      newDepartments = currentDepartments.filter((d: string) => d !== department);
    } else {
      // Add department
      newDepartments = [...currentDepartments, department];
    }
    
    this.announcementForm.patchValue({ departments: newDepartments });
    this.announcementForm.get('departments')?.markAsTouched();
  }

  isDepartmentSelected(department: string): boolean {
    const currentDepartments = this.announcementForm.get('departments')?.value || [];
    return currentDepartments.includes(department);
  }

  getSelectedDepartmentsText(): string {
    const currentDepartments = this.announcementForm.get('departments')?.value || [];
    if (currentDepartments.length === 0) {
      return 'Select departments...';
    } else if (currentDepartments.length === 1) {
      return currentDepartments[0];
    } else if (currentDepartments.length === this.departments.length) {
      return 'All Departments';
    } else {
      return `${currentDepartments.length} departments selected`;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.department-dropdown')) {
      this.showDepartmentDropdown = false;
    }
  }

  debugAnnouncements() {
    console.log('Debug: Checking all announcements in database...');
    this.announcementService.debugAllAnnouncements().subscribe({
      next: (announcements: any[]) => {
        console.log('Debug: All announcements in database:', announcements);
        alert(`Found ${announcements.length} announcements in database. Check console for details.`);
      },
      error: (error) => {
        console.error('Debug: Error checking announcements:', error);
        alert('Error checking announcements: ' + (error.error?.detail || 'Unknown error'));
      }
    });
  }
}
