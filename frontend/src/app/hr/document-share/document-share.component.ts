import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { Router } from '@angular/router';
import { UserService, User } from '../../shared/services/user.service';
import { HeaderComponent } from '@app/shared/components/header/header.component';
import { DocumentService, Document } from '../../shared/services/document.service';

interface SidebarItem {
  id: string;
  name: string;
  icon: string;
  route?: string;
  badge?: string;
  badgeClass?: string;
}

@Component({
  selector: 'app-document-share',
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
  templateUrl: './document-share.component.html',
  styleUrls: ['./document-share.component.css']
})
export class DocumentShareComponent implements OnInit {
  documents: Document[] = [];
  filteredDocuments: Document[] = [];
  documentForm: FormGroup;
  showUploadForm = false;
  isUploading = false;
  uploadProgress = 0;
  
  // Filter properties
  searchTerm = '';
  selectedCategory = '';
  selectedType = '';
  sortBy: 'name' | 'date' | 'size' = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';
  
  // Categories and types
  categories = [
    'HR Policies',
    'Forms',
    'Templates',
    'Guidelines',
    'Procedures',
    'Reports'
  ];
  
  documentTypes = [
    'PDF',
    'DOC',
    'DOCX',
    'XLS',
    'XLSX',
    'PPT',
    'PPTX'
  ];

  // Sidebar properties
  sidebarOpen = true;
  isMobile = false;
  activeSection = 'documents';
  searchQuery: string = '';
  showNotifications: boolean = false;
  showProfileModal = false;
  profileModalType: 'view' | 'edit' | 'password' | null = null;
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


  selectedFileName: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private documentService: DocumentService
  ) {
    this.documentForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      type: ['', Validators.required],
      tags: [''],
      file: [null, Validators.required],
      version: ['1.0']
    });

    // Check if mobile
    this.isMobile = window.innerWidth < 1024;
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 1024;
    });
  }

  ngOnInit() {
    this.fetchDocuments();
  }

  fetchDocuments() {
    this.documentService.getDocuments().subscribe((docs: Document[]) => {
      this.documents = docs;
      this.applyFilters();
    });
  }

  toggleUploadForm() {
    this.showUploadForm = !this.showUploadForm;
    if (!this.showUploadForm) {
      this.resetForm();
    }
  }

  resetForm() {
    this.documentForm.reset();
    this.uploadProgress = 0;
    this.selectedFileName = null;
  }

  removeSelectedFile() {
    this.documentForm.patchValue({ file: null });
    this.selectedFileName = null;
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.documentForm.patchValue({
        file: file,
        type: file.name.split('.').pop()?.toUpperCase() || '',
        title: file.name.split('.')[0]
      });
      this.selectedFileName = file.name;
    } else {
      this.selectedFileName = null;
    }
  }

  async uploadDocument() {
    if (this.documentForm.valid) {
      this.isUploading = true;
      const formData = this.documentForm.value;
      const tags = formData.tags ? formData.tags.split(',').map((tag: string) => tag.trim()) : [];
      // Prepare document data for backend (excluding file upload logic for now)
      const documentPayload = {
        title: formData.title,
        category: formData.category,
        type: formData.type,
        size: formData.file ? formData.file.size : null,
        version: formData.version,
        tags: tags,
        file_url: formData.file ? formData.file.name : '', // Placeholder, real upload would provide a URL
        owner_id: 1 // TODO: Replace with actual logged-in user ID
      };
      try {
        await this.documentService.uploadDocument(documentPayload).toPromise();
        this.fetchDocuments();
        this.resetForm();
        this.showUploadForm = false;
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        this.isUploading = false;
        this.uploadProgress = 0;
      }
    }
  }

  deleteDocument(id: string) {
    if (confirm('Are you sure you want to delete this document?')) {
      this.documentService.deleteDocument(id).subscribe({
        next: () => {
          this.documents = this.documents.filter(doc => doc.id.toString() !== id);
          this.applyFilters();
        },
        error: (err) => {
          console.error('Failed to delete document:', err);
        }
      });
    }
  }

  downloadDocument(document: Document) {
    // Download the file from the file_url
    if (!document.file_url) {
      console.error('No file URL available for download.');
      return;
    }
    // Create an anchor element and trigger download
    const link = window.document.createElement('a');
    link.href = document.file_url;
    // Try to extract filename from URL, fallback to document title
    const urlParts = document.file_url.split('/');
    let filename = urlParts[urlParts.length - 1] || document.title;
    // Add extension if missing and type is known
    if (filename.indexOf('.') === -1 && document.type) {
      filename += '.' + document.type.toLowerCase();
    }
    link.download = filename;
    link.target = '_blank';
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  }

  applyFilters() {
    let filtered = [...this.documents];

    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(doc => doc.category === this.selectedCategory);
    }

    // Apply type filter
    if (this.selectedType) {
      filtered = filtered.filter(doc => doc.type === this.selectedType);
    }

    // Apply search term
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchLower) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (this.sortBy) {
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          // Convert uploaded_at to Date if it's a string
          const aDate = typeof a.uploaded_at === 'string' ? new Date(a.uploaded_at) : a.uploaded_at;
          const bDate = typeof b.uploaded_at === 'string' ? new Date(b.uploaded_at) : b.uploaded_at;
          comparison = aDate.getTime() - bDate.getTime();
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
      }
      return this.sortOrder === 'asc' ? comparison : -comparison;
    });

    this.filteredDocuments = filtered;
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedType = '';
    this.sortBy = 'date';
    this.sortOrder = 'desc';
    this.applyFilters();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
    const item = this.sidebarItems.find(item => item.id === this.activeSection);
    return item ? item.name : 'Document Sharing';
  }
}
