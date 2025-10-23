import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, Message } from '../../services/message.service';
import { UserService, User } from '../../services/user.service';
import { Subscription, Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { Router } from '@angular/router';

export interface SidebarItem {
  id: string;
  name: string;
  icon: string;
  badge?: string;
  badgeClass?: string;
  route?: string;
}

@Component({
  selector: 'app-messagerie',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  templateUrl: 'messagerie.component.html',
  styleUrls: ['./messagerie.component.css']
})
export class MessagerieComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() currentUser: User | null = null;
  @Input() role: string = 'EMPLOYEE';
  @Input() sidebarItems: SidebarItem[] = [];
  @ViewChild('chatMessages') chatMessagesRef!: ElementRef;

  // Sidebar state
  sidebarOpen = true;
  isMobile = false;
  activeSection = 'messagerie';


  // Role-based sidebar items
  employeeSidebarItems: SidebarItem[] = [
    { id: 'dashboard', name: 'Dashboard', icon: 'fas fa-tachometer-alt', route: '/employee/dashboard' },
    { id: 'announcements', name: 'Announcements', icon: 'fas fa-bullhorn', route: '/employee/announcement-view' },
    { id: 'leave', name: 'Leave Management', icon: 'fas fa-calendar-alt', route: '/employee/leave-management' },
    { id: 'documents', name: 'Documents', icon: 'fas fa-file-alt', route: '/employee/documents' },
    { id: 'meetings', name: 'Meetings', icon: 'fas fa-calendar-check', route: '/employee/meetings' },
    { id: 'messagerie', name: 'Messagerie', icon: 'fas fa-comments', route: '/employee/messagerie' },
  ];
  
  hrSidebarItems: SidebarItem[] = [
    { id: 'dashboard', name: 'Dashboard', icon: 'fas fa-tachometer-alt', route: '/hr/dashboard' },
    { id: 'employees', name: 'Employee Management', icon: 'fas fa-users', badge: '1247', badgeClass: 'bg-blue-100 text-blue-800', route: '/hr/employee-management' },
    { id: 'announcements', name: 'Announcements', icon: 'fas fa-bullhorn', route: '/hr/announcement-manage' },
    { id: 'documents', name: 'Document Sharing', icon: 'fas fa-file-alt', route: '/hr/document-share' },
    { id: 'meetings', name: 'Meetings', icon: 'fas fa-calendar-check', badge: '8', badgeClass: 'bg-purple-100 text-purple-800', route: '/hr/meeting-rh' },
    { id: 'statistics', name: 'Statistics', icon: 'fas fa-chart-bar', route: '/hr/statistics' },
    { id: 'leave-management', name: 'Leave Management', icon: 'fas fa-calendar-alt', route: '/hr/leave-management' },
    { id: 'messagerie', name: 'Messagerie', icon: 'fas fa-comments', route: '/hr/messagerie' }
  ];

  users: User[] = [];
  search = '';
  selectedUser: User | null = null;
  messages: Message[] = [];
  newMessage = '';
  currentUserId: number = 0;
  private wsSub: Subscription | null = null;
  private msgSub: Subscription | null = null;

  get userInitials(): string {
    if (!this.currentUser || !this.currentUser.full_name) return '';
    return this.currentUser.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  constructor(private messageService: MessageService, private userService: UserService, private router: Router) {}

  // Helper to get role from localStorage or JWT token
  private getRoleFromStorage(): 'EMPLOYEE' | 'HR' {
    // First try to get role from localStorage
    const roleFromStorage = localStorage.getItem('role') as 'EMPLOYEE' | 'HR';
    if (roleFromStorage) {
      return roleFromStorage;
    }

    // If not found in localStorage, try to get from JWT token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role as 'EMPLOYEE' | 'HR' || 'EMPLOYEE';
      } catch {
        return 'EMPLOYEE';
      }
    }

    return 'EMPLOYEE';
  }

  // Helper to parse user_id from JWT if not found
  private getUserIdFromToken(): number {
    const token = localStorage.getItem('token');
    if (!token) return 0;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Number(payload.user_id) || 0;
    } catch {
      return 0;
    }
  }

  ngOnInit() {
    // Always get the latest role from localStorage
    this.role = (localStorage.getItem('role') || 'EMPLOYEE').toUpperCase();

    // Set sidebar items based on role
    if (this.role === 'HR') {
      this.sidebarItems = this.hrSidebarItems;
    } else {
      this.sidebarItems = this.employeeSidebarItems;
    }

    console.log('Current role:', this.role);
    console.log('Sidebar items:', this.sidebarItems);

    // Try to get user ID from currentUser, then from localStorage, then from JWT, else 0
    this.currentUserId = this.currentUser?.id
      ? Number(this.currentUser.id)
      : Number(localStorage.getItem('user_id')) || this.getUserIdFromToken();
    // Connect WebSocket for real-time
    if (this.currentUserId) {
      this.messageService.connectWebSocket(this.currentUserId);
      this.wsSub = this.messageService.onMessage().subscribe(msg => {
        console.log('WebSocket message received:', msg, 'selectedUser:', this.selectedUser);
        if (
          this.selectedUser &&
          (String(msg.sender_id) === String(this.selectedUser.id) || String(msg.receiver_id) === String(this.selectedUser.id))
        ) {
          // Only add if not already present (avoid duplicates)
          if (!this.messages.some(m => m.id === msg.id)) {
            this.messages = [...this.messages, msg];
            this.scrollToBottom();
          }
        }
      });
    }
    // Initial fetch
    this.fetchUsers();
    // Remove debounced search logic
    // this.searchSub = this.searchSubject.pipe(
    //   debounceTime(250)
    // ).subscribe(() => {
    //   // No backend call, just triggers change detection
    // });
  }

  ngOnDestroy() {
    this.messageService.disconnectWebSocket();
    if (this.wsSub) this.wsSub.unsubscribe();
    if (this.msgSub) this.msgSub.unsubscribe();
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.chatMessagesRef && this.chatMessagesRef.nativeElement) {
        this.chatMessagesRef.nativeElement.scrollTop = this.chatMessagesRef.nativeElement.scrollHeight;
      }
    }, 100);
  }

  fetchUsers() {
    this.userService.getAllUsers().subscribe(users => {
      const myId = String(this.currentUserId);
      if (this.role === 'EMPLOYEE') {
        this.users = users.filter(u => String(u.id) !== myId);
      } else {
        this.users = users.filter(u => String(u.id) !== myId);
      }
    });
  }

  filteredUsers() {
    const s = this.search.toLowerCase();
    return this.users.filter(u => u.full_name.toLowerCase().includes(s));
  }

  selectUser(user: User) {
    this.selectedUser = user;
    this.loadConversation();
  }

  loadConversation() {
    if (!this.selectedUser) return;
    if (this.msgSub) this.msgSub.unsubscribe();
    
    console.log('Loading conversation between:', {
      currentUserId: this.currentUserId,
      selectedUserId: this.selectedUser.id
    });
    
    this.msgSub = this.messageService.getConversation(this.selectedUser.id).subscribe(msgs => {
      this.messages = msgs;
      // Mark unseen messages as seen
      msgs.filter(m => !m.seen && m.receiver_id === this.currentUserId).forEach(m => {
        this.messageService.markAsSeen(m.id).subscribe();
      });
      this.scrollToBottom();
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedUser) return;
    const senderId = Number(this.currentUserId);
    const receiverId = Number(this.selectedUser.id);
    
    console.log('Sending message:', {
      sender_id: senderId,
      receiver_id: receiverId,
      content: this.newMessage
    });
    
    this.messageService.sendMessage(senderId, receiverId, this.newMessage).subscribe(msg => {
      this.newMessage = '';
      this.loadConversation();
      this.scrollToBottom();
    });
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  setActiveSection(sectionId: string) {
    this.activeSection = sectionId;
    if (this.isMobile) {
      this.sidebarOpen = false;
    }
    const selectedItem = this.sidebarItems.find(item => item.id === sectionId);
    if (selectedItem && selectedItem.route) {
      this.router.navigateByUrl(selectedItem.route);
    }
  }

  logout() {
    localStorage.clear();
    window.location.reload();
  }

  getSectionTitle(): string {
    return 'Messagerie';
  }
}