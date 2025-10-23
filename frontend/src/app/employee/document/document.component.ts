import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ChatbotComponent } from '../../shared/components/chatbot/chatbot.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { DocumentService } from '../../shared/services/document.service';
import { Subscription } from 'rxjs';

interface Document {
  id: string;
  name: string;
  category: string;
  type: string;
  size: number;
  uploadDate: Date;
  uploadedBy: string;
  version: string;
  tags: string[];
  downloadUrl: string;
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
  selector: 'app-document',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ChatbotComponent, SidebarComponent, HeaderComponent],
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css']
})
export class DocumentComponent implements OnInit, OnDestroy {
  // Sidebar state
  sidebarOpen = true;
  activeSection = 'documents';
  isMobile = false;

  // Document properties
  documents: Document[] = [];
  filteredDocuments: Document[] = [];
  searchTerm = '';
  selectedCategory = '';
  sortBy: 'name' | 'date' | 'size' = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Categories
  categories = [
    'HR Policies',
    'Forms',
    'Templates',
    'Guidelines',
    'Procedures',
    'Reports'
  ];

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

  private documentSub: Subscription | undefined;

  constructor(private router: Router, private documentService: DocumentService) {}

  ngOnInit(): void {
    this.checkScreenSize();
    this.loadDocuments();
  }

  ngOnDestroy(): void {
    if (this.documentSub) {
      this.documentSub.unsubscribe();
    }
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

  loadDocuments() {
    // Fetch from backend and map to UI model
    this.documentSub = this.documentService.getDocuments().subscribe({
      next: (docs) => {
        this.documents = docs.map(doc => ({
          id: doc.id.toString(),
          name: doc.title,
          category: doc.category,
          type: doc.type,
          size: doc.size,
          uploadDate: new Date(doc.uploaded_at),
          uploadedBy: doc.owner_id ? `User ${doc.owner_id}` : '', // Or fetch user name if available
          version: doc.version,
          tags: doc.tags,
          downloadUrl: doc.file_url
        }));
        this.applyFilters();
      },
      error: (err) => {
        console.error('Failed to load documents:', err);
        this.documents = [];
        this.filteredDocuments = [];
      }
    });
  }

  applyFilters() {
    this.filteredDocuments = this.documents.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          doc.tags.some(tag => tag.toLowerCase().includes(this.searchTerm.toLowerCase()));
      const matchesCategory = !this.selectedCategory || doc.category === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Apply sorting
    this.filteredDocuments.sort((a, b) => {
      let comparison = 0;
      switch (this.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = a.uploadDate.getTime() - b.uploadDate.getTime();
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
      }
      return this.sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm = value;
    this.applyFilters();
  }

  onCategoryChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedCategory = value;
    this.applyFilters();
  }

  onSortChange(sortBy: 'name' | 'date' | 'size') {
    if (this.sortBy === sortBy) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortBy;
      this.sortOrder = 'asc';
    }
    this.applyFilters();
  }

  downloadDocument(document: Document) {
    // Implement actual download logic here
    console.log('Downloading document:', document.name);
    window.open(document.downloadUrl, '_blank');
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getSectionTitle(): string {
    const item = this.sidebarItems.find(item => item.id === this.activeSection);
    return item ? item.name : 'Documents';
  }


} 