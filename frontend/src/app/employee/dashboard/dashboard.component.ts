import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TaskService, Task } from '@app/shared/services/task.service';
import { ChatbotComponent } from '../../shared/components/chatbot/chatbot.component';
import { UserService, User } from '@app/shared/services/user.service';
import { HttpClientModule } from '@angular/common/http';
import { SidebarComponent } from '@app/shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '@app/shared/components/header/header.component';

interface Notification {
  message: string;
  class: string;
  icon: string;
  show: boolean;
}

interface SidebarItem {
  id: string;
  name: string;
  icon: string;
  badge?: string;
  badgeClass?: string;
  route?: string;
}

@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent, FormsModule, ReactiveFormsModule, ChatbotComponent, HttpClientModule, HeaderComponent]
})
export class EmployeeDashboardComponent implements OnInit, OnDestroy {
  // Sidebar state
  sidebarOpen = true;
  activeSection = 'dashboard';
  isMobile = false;
  
  // User info
  notification: Notification | null = null;
  notificationTimeout: any;

  // Dashboard data
  kpiData = [
    { icon: 'fas fa-calendar-check', label: 'Attendance', value: '92%', trend: '+2%', trendDirection: 'up' },
    { icon: 'fas fa-tasks', label: 'Tasks Completed', value: '24', trend: '+5', trendDirection: 'up' },
    { icon: 'fas fa-clock', label: 'Hours Logged', value: '164', trend: '+12', trendDirection: 'up' },
    { icon: 'fas fa-calendar-alt', label: 'Leave Balance', value: '18', trend: '-2', trendDirection: 'down' }
  ];

  tasks: Task[] = [];
  isAdding = false;
  isEditing = false;
  selectedTask: Task | null = null;
  filter: 'all' | 'pending' | 'completed' = 'all';

  employeeName = 'John Doe'; // Ideally fetched from auth/user service
  userId: number | null = null;

  stats = {
    pendingRequests: 2,
    approvedRequests: 12,
    remainingLeaveDays: 8
  };

  recentActivities = [
    { icon: 'fas fa-file-alt', title: 'Document Updated', description: 'You updated the project requirements document', time: '2 hours ago', color: 'bg-blue-100 text-blue-800' },
    { icon: 'fas fa-tasks', title: 'Task Completed', description: 'You marked "API Integration" as completed', time: '4 hours ago', color: 'bg-green-100 text-green-800' },
    { icon: 'fas fa-comment', title: 'New Comment', description: 'You commented on a task in the project board', time: '1 day ago', color: 'bg-purple-100 text-purple-800' },
    { icon: 'fas fa-calendar-plus', title: 'Meeting Scheduled', description: 'Team retrospective meeting has been scheduled', time: '2 days ago', color: 'bg-yellow-100 text-yellow-800' }
  ];

  upcomingTasks = [
    { title: 'Submit Medical Certificate', dueDate: new Date(Date.now() + 2 * 86400000), status: 'Pending' },
    { title: 'Complete Training Module', dueDate: new Date(Date.now() + 5 * 86400000), status: 'In Progress' }
  ];
  
  // Sidebar navigation items
  sidebarItems: SidebarItem[] = [
    { id: 'dashboard', name: 'Dashboard', icon: 'fas fa-tachometer-alt', route: '/employee/dashboard' },
    { id: 'announcements', name: 'Announcements', icon: 'fas fa-bullhorn', route: '/employee/announcement-view' },
    { id: 'leave', name: 'Leave Management', icon: 'fas fa-calendar-alt', route: '/employee/leave-management' },
    { id: 'documents', name: 'Documents', icon: 'fas fa-file-alt', route: '/employee/documents' },
    { id: 'meetings', name: 'Meetings', icon: 'fas fa-calendar-check', route: '/employee/meetings' },
    { id: 'messagerie', name: 'Messagerie', icon: 'fas fa-comments', route: '/employee/messagerie' },
  ];

  constructor(
    private router: Router,
    private taskService: TaskService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.checkScreenSize();
    this.showNotification('Welcome to your Employee Dashboard', 'info');
    this.fetchTasks();
    // Fetch user info by email (replace with actual email, e.g. from auth service)
    const email = localStorage.getItem('email');
    if (email) {
      this.userService.getUserByEmail(email).subscribe((user: User) => {
        this.employeeName = user.full_name;
        this.userId = user.id;
      });
    }
  }

  ngOnDestroy(): void {
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
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
    
    // Find the route for the selected section and navigate to it
    const selectedItem = this.sidebarItems.find(item => item.id === section);
    if (selectedItem && selectedItem.route) {
      // Navigate using Angular Router
      this.router.navigateByUrl(selectedItem.route);
      console.log(`Navigating to ${selectedItem.route}`);
      this.showNotification(`Navigated to ${this.getSectionTitle()}`, 'info');
    }
  }

  getSectionTitle(): string {
    const item = this.sidebarItems.find(item => item.id === this.activeSection);
    return item ? item.name : 'Dashboard';
  }

  onSearch(query: string): void {
    if (query.trim().length > 0) {
      this.showNotification(`Searching for: ${query}`, 'info');
    }
  }

  logout(): void {
    this.showNotification('Logging out...', 'warning');
    // Implement actual logout logic here
  }

  startAddTask() {
    this.isAdding = true;
    this.selectedTask = null;
  }

  fetchTasks() {
    this.taskService.getTasks().subscribe((tasks: Task[]) => {
      this.tasks = tasks.map(t => ({
        ...t,
        dueDate: (t as any).due_date || t.dueDate || '',
      }));
    });
  }

  addTask(task: Task) {
    if (this.userId) {
      task.user_id = this.userId;
    }
    this.taskService.addTask(task).subscribe(newTask => {
      this.tasks.push(newTask);
      this.isAdding = false;
      this.showNotification(`Task "${task.title}" added successfully!`, 'success');
    });
  }

  startEditTask(task: Task) {
    this.selectedTask = { ...task };
    this.isEditing = true;
  }

  updateTask(task: Task) {
    this.taskService.updateTask(task).subscribe(updatedTask => {
      const idx = this.tasks.findIndex(t => t.id === updatedTask.id);
      if (idx !== -1) this.tasks[idx] = updatedTask;
      this.isEditing = false;
      this.selectedTask = null;
      this.showNotification(`Task "${task.title}" updated successfully!`, 'success');
    });
  }

  deleteTask(taskId: number) {
    this.taskService.deleteTask(taskId).subscribe(() => {
      this.tasks = this.tasks.filter(t => t.id !== taskId);
      this.showNotification(`Task deleted successfully!`, 'success');
      this.cancelAddEdit();
    });
  }

  cancelAddEdit() {
    this.isAdding = false;
    this.isEditing = false;
    this.selectedTask = null;
  }

  toggleTaskComplete(task: Task): void {
    if (task.status === 'completed') {
      this.taskService.markTaskIncomplete(task.id).subscribe(updatedTask => {
        const idx = this.tasks.findIndex(t => t.id === updatedTask.id);
        if (idx !== -1) this.tasks[idx] = updatedTask;
        this.showNotification(`Task "${task.title}" marked as incomplete`, 'warning');
      });
    } else {
      this.taskService.markTaskComplete(task.id).subscribe(updatedTask => {
        const idx = this.tasks.findIndex(t => t.id === updatedTask.id);
        if (idx !== -1) this.tasks[idx] = updatedTask;
        this.showNotification(`Task "${task.title}" marked as complete`, 'success');
      });
    }
  }

  // New filter logic
  get filteredTasks(): Task[] {
    if (this.filter === 'all') {
      return this.tasks;
    } else if (this.filter === 'pending') {
      return this.tasks.filter(task => task.status !== 'completed');
    } else if (this.filter === 'completed') {
      return this.tasks.filter(task => task.status === 'completed');
    }
    return this.tasks; // Fallback to all tasks
  }

  setFilter(f: 'all' | 'pending' | 'completed') {
    this.filter = f;
  }

  // Notification System
  showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
    const notificationConfig = {
      success: {
        class: 'bg-green-500 text-white',
        icon: 'fas fa-check-circle'
      },
      error: {
        class: 'bg-red-500 text-white',
        icon: 'fas fa-exclamation-circle'
      },
      warning: {
        class: 'bg-yellow-500 text-white',
        icon: 'fas fa-exclamation-triangle'
      },
      info: {
        class: 'bg-blue-500 text-white',
        icon: 'fas fa-info-circle'
      }
    };

    this.notification = {
      message,
      class: notificationConfig[type].class,
      icon: notificationConfig[type].icon,
      show: false
    };

    // Trigger slide-in animation
    setTimeout(() => {
      if (this.notification) {
        this.notification.show = true;
      }
    }, 100);

    // Auto dismiss after 3 seconds
    this.notificationTimeout = setTimeout(() => {
      if (this.notification) {
        this.notification.show = false;
        // Remove notification after animation
        setTimeout(() => {
          this.notification = null;
        }, 300);
      }
    }, 3000);
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
}
