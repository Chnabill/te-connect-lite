import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SidebarItem {
  id: string;
  name: string;
  icon: string;
  badge?: string;
  badgeClass?: string;
  route?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  @Input() sidebarOpen = true;
  @Input() isMobile = false;
  @Input() activeSection = '';
  @Input() sidebarItems: SidebarItem[] = [];
  @Input() userName = '';
  @Input() userRole = '';
  @Input() userInitials = '';

  @Output() toggleSidebarEvent = new EventEmitter<void>();
  @Output() setActiveSectionEvent = new EventEmitter<string>();
  @Output() logoutEvent = new EventEmitter<void>();

  toggleSidebar() {
    this.toggleSidebarEvent.emit();
  }

  setActiveSection(sectionId: string) {
    this.setActiveSectionEvent.emit(sectionId);
  }

  logout() {
    this.logoutEvent.emit();
  }
} 