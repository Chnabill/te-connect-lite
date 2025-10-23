import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ChatbotComponent } from '../../shared/components/chatbot/chatbot.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { HttpClient } from '@angular/common/http';

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
  route: string;
  badge?: string;
  badgeClass?: string;
}

@Component({
  selector: 'app-announcement-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ChatbotComponent, SidebarComponent, HeaderComponent],
  templateUrl: './announcement-view.component.html',
  styleUrls: ['./announcement-view.component.css']
})
export class AnnouncementViewComponent implements OnInit, OnDestroy {
  // Sidebar state
  sidebarOpen = true;
  activeSection = 'announcements';
  isMobile = false;

  // User info
  userName = 'John Smith';
  userRole = 'Employee';
  userInitials = 'JS';
  notificationCount = 0;

  sidebarItems: SidebarItem[] = [
    { id: 'dashboard', name: 'Dashboard', icon: 'fas fa-tachometer-alt', route: '/employee/dashboard' },
    { id: 'announcements', name: 'Announcements', icon: 'fas fa-bullhorn', route: '/employee/announcement-view' },
    { id: 'leave', name: 'Leave Management', icon: 'fas fa-calendar-alt', route: '/employee/leave-management' },
    { id: 'documents', name: 'Documents', icon: 'fas fa-file-alt', route: '/employee/documents' },
    { id: 'meetings', name: 'Meetings', icon: 'fas fa-calendar-check', route: '/employee/meetings' },
    { id: 'messagerie', name: 'Messagerie', icon: 'fas fa-comments', route: '/employee/messagerie' },
  ];

  // Announcement data
  announcements: Announcement[] = [];
  filteredAnnouncements: Announcement[] = [];
  searchTerm = '';
  selectedPriority = '';
  sortBy: 'newest' | 'oldest' | 'priority' = 'newest';
  showRead = true;
  showUnread = true;

  departments = [
    'All Departments',
    'Engineering',
    'Marketing',
    'Sales',
    'Human Resources',
    'Finance',
    'Operations',
    'Design'
  ];

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.checkScreenSize();
    this.fetchAnnouncements();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
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
    }
  }

  logout(): void {
    console.log('Logging out...');
    // Implement actual logout logic here
  }

  fetchAnnouncements() {
    const token = localStorage.getItem('token');
    this.http.get<any[]>('http://localhost:8000/announcements/', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    }).subscribe({
      next: (data) => {
        // Map backend data to Announcement[]
        this.announcements = data.map(a => ({
          id: a.id,
          title: a.title,
          content: a.content,
          department: Array.isArray(a.departments) ? a.departments[0] : a.departments, // Use first department for filtering
          priority: a.priority,
          createdAt: new Date(a.created_at),
          createdBy: a.created_by,
          isRead: false, // You may want to update this based on your backend
          attachments: [], // Update if backend provides
          expiryDate: a.expiry_date ? new Date(a.expiry_date) : undefined,
          tags: a.tags || []
        }));
        this.applyFilters();
      },
      error: (err) => {
        console.error('Failed to fetch announcements', err);
        this.announcements = [];
        this.filteredAnnouncements = [];
      }
    });
  }

  applyFilters() {
    this.filteredAnnouncements = this.announcements.filter(announcement => {
      const matchesSearch = announcement.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          announcement.content.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          announcement.tags?.some(tag => tag.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchesPriority = !this.selectedPriority || announcement.priority === this.selectedPriority;
      const matchesReadStatus = (this.showRead && announcement.isRead) || (this.showUnread && !announcement.isRead);

      return matchesSearch && matchesPriority && matchesReadStatus;
    });

    // Apply sorting
    this.filteredAnnouncements.sort((a, b) => {
      let comparison = 0;
      if (this.sortBy === 'newest') {
        comparison = b.createdAt.getTime() - a.createdAt.getTime();
      } else if (this.sortBy === 'oldest') {
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
      } else if (this.sortBy === 'priority') {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return comparison;
    });
  }

  onSortChange(sortBy: 'newest' | 'oldest' | 'priority') {
    this.sortBy = sortBy;
    this.applyFilters();
  }

  toggleReadStatus(announcement: Announcement) {
    announcement.isRead = !announcement.isRead;
    this.applyFilters();
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getSectionTitle(): string {
    const item = this.sidebarItems.find(item => item.id === this.activeSection);
    return item ? item.name : 'Announcements';
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedPriority = '';
    this.sortBy = 'newest';
    this.showRead = true;
    this.showUnread = true;
    this.applyFilters();
  }
}