// src/app/hr/hr.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MessagerieComponent } from '../shared/components/messagerie/messagerie.component';
import { UserService, User } from '../shared/services/user.service';
import { SidebarItem } from '../shared/components/messagerie/messagerie.component';

@Component({
  selector: 'app-hr',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule, MessagerieComponent], // Add MessagerieComponent
  template: `
    <router-outlet></router-outlet>
  `
})
export class HrComponent implements OnInit {
  currentUser: User | null = null;
  sidebarItems: SidebarItem[] = [
    { id: 'dashboard', name: 'Dashboard', icon: 'fas fa-tachometer-alt', route: '/hr/dashboard' },
    { id: 'employees', name: 'Employee Management', icon: 'fas fa-users', badge: '1247', badgeClass: 'bg-blue-100 text-blue-800', route: '/hr/employee-management' },
    { id: 'announcements', name: 'Announcements', icon: 'fas fa-bullhorn', route: '/hr/announcement-manage' },
    { id: 'documents', name: 'Document Sharing', icon: 'fas fa-file-alt', route: '/hr/document-share' },
    { id: 'meetings', name: 'Meetings', icon: 'fas fa-calendar-check', badge: '8', badgeClass: 'bg-purple-100 text-purple-800', route: '/hr/meeting-rh' },
    { id: 'statistics', name: 'Statistics', icon: 'fas fa-chart-bar', route: '/hr/statistics' },
    { id: 'leave-management', name: 'Leave Management', icon: 'fas fa-calendar-alt', route: '/hr/leave-management' },
    { id: 'messagerie', name: 'Messagerie', icon: 'fas fa-comments', route: '/hr/messagerie' },
  ];

  constructor(private userService: UserService) {}

  ngOnInit() {
    // Fetch current HR user by email from localStorage
    const email = localStorage.getItem('email');
    if (email) {
      this.userService.getUserByEmail(email).subscribe(user => {
        this.currentUser = user;
      });
    }
  }
}