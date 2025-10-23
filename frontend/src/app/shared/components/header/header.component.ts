import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService, User } from '@app/shared/services/user.service';
import { AuthService } from '@app/shared/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  // User info
  userName = '';
  userRole = '';
  userInitials = '';
  userEmail = '';
  userId: string = '';
  userImage: string | null = null;

  // Notification
  notificationCount = 0;
  notifications: any[] = [];
  showNotifications = false;
  showUserMenu = false;

  // Profile Modal
  showProfileModal = false;
  profileModalType: 'view' | 'edit' | 'password' | null = null;

  // Search
  searchQuery = '';

  @Output() toggleSidebarClicked = new EventEmitter<void>();
  @Output() logoutClicked = new EventEmitter<void>();

  constructor(private userService: UserService, private authService: AuthService) {}

  ngOnInit(): void {
    // Fetch user info from AuthService/localStorage
    const email = localStorage.getItem('email') || '';
    if (email) {
      this.userService.getUserByEmail(email).subscribe((user: User) => {
        this.userName = user.full_name;
        this.userRole = user.role || '';
        this.userInitials = this.getInitials(user.full_name);
        this.userEmail = email;
        this.userId = user.teId;
        this.userImage = user.user_image || null;
      });
    }
    // Fetch notifications (implement your own logic/service)
    this.loadNotifications();
  }

  loadNotifications() {
    // TODO: Replace with real notification service call
    this.notifications = [
      { title: 'Welcome!', time: 'Just now' },
      { title: 'Profile updated', time: '1 hour ago' }
    ];
    this.notificationCount = this.notifications.length;
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) this.showUserMenu = false;
  }

  closeNotifications() {
    this.showNotifications = false;
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
    if (this.showUserMenu) this.showNotifications = false;
  }

  closeUserMenu() {
    this.showUserMenu = false;
  }

  openProfileModal(type: 'view' | 'edit' | 'password') {
    this.profileModalType = type;
    this.showProfileModal = true;
    this.closeUserMenu();
  }

  closeProfileModal() {
    this.showProfileModal = false;
    this.profileModalType = null;
  }

  onProfileImageChange(event: any) {
    const file = event.target.files && event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.userImage = e.target.result;
        if (this.userId) {
          this.userService.uploadProfileImage(Number(this.userId), e.target.result).subscribe();
        }
      };
      reader.readAsDataURL(file);
    }
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  performSearch() {
    // Implement your search logic here
    console.log('Searching for:', this.searchQuery);
  }

  get breadcrumbTitle(): string {
    switch ((this.userRole || '').toLowerCase()) {
      case 'hr':
      case 'human resources':
      case 'human ressources':
        return 'Human Resources';
      case 'admin':
        return 'Admin';
      default:
        return 'Employee';
    }
  }
}