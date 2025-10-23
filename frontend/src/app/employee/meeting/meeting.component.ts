import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarComponent, SidebarItem } from '@app/shared/components/sidebar/sidebar.component';
import { ChatbotComponent } from '../../shared/components/chatbot/chatbot.component';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { HeaderComponent } from '@app/shared/components/header/header.component';
import { MeetingService } from '@app/shared/services/meeting.service';
import { UserService } from '@app/shared/services/user.service';

interface Meeting {
  id: number;
  title: string;
  participants: string[];
  date: string;
  time: string;
  status: string;
  dateClass: string;
  priority?: 'low' | 'medium' | 'high';
  description?: string;
  duration?: string;
  room_number?: string;
}

interface NewMeeting {
  title: string;
  date: string;
  time: string;
  participants: string;
  priority?: 'low' | 'medium' | 'high';
  description?: string;
  duration?: string;
  room_number?: string;
}

interface CalendarDay {
  name?: string;
  day: number;
  date: string;
  hasMeeting: boolean;
  isToday?: boolean;
  meetingCount?: number;
  isCurrentMonth?: boolean;
}

@Component({
  selector: 'app-meeting',
  standalone: true,
  imports: [CommonModule, SidebarComponent, FormsModule, ChatbotComponent, HeaderComponent, ReactiveFormsModule],
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.css']
})
export class MeetingComponent implements OnInit, OnDestroy {
  sidebarOpen = true;
  isMobile = false;
  activeSection = 'meetings';
  sidebarItems: SidebarItem[] = [
    { id: 'dashboard', name: 'Dashboard', icon: 'fas fa-tachometer-alt', route: '/employee/dashboard' },
    { id: 'announcements', name: 'Announcements', icon: 'fas fa-bullhorn', route: '/employee/announcement-view' },
    { id: 'leave', name: 'Leave Management', icon: 'fas fa-calendar-alt', route: '/employee/leave-management' },
    { id: 'documents', name: 'Documents', icon: 'fas fa-file-alt', route: '/employee/documents' },
    { id: 'meetings', name: 'Meetings', icon: 'fas fa-calendar-check', route: '/employee/meetings' },
    { id: 'messagerie', name: 'Messagerie', icon: 'fas fa-comments', route: '/employee/messagerie' },
  ];

  meetings: Meeting[] = [];
  filteredMeetings: Meeting[] = [];
  showScheduleForm = false;
  showScheduleModal = false;
  selectedMeeting: Meeting | null = null;
  formSubmitted = false;
  newMeeting: NewMeeting = {
    title: '',
    date: '',
    time: '',
    participants: '',
    priority: 'medium',
    description: '',
    duration: '60',
    room_number: ''
  };
  filterStartDate = '';
  filterEndDate = '';
  sortAscending = true;
  calendarDays: CalendarDay[] = [];
  editingMeetingId: number | null = null;
  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December'];

  participantCtrl = new FormControl('');
  participantSuggestions: any[] = [];
  selectedParticipants: any[] = [];
  userMap: { [id: number]: string } = {};

  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;
  paginatedMeetings: Meeting[] = [];

  searchQuery: string = '';
  viewMode: 'grid' | 'list' = 'list';
  showNotifications = false;
  notificationCount = 0;

  private destroy$ = new Subject<void>();

  constructor(private router: Router, private meetingService: MeetingService, private userService: UserService) {
    this.isMobile = window.innerWidth < 1024;
  }

  ngOnInit() {
    // Fetch all users for participant name mapping
    this.userService.getAllUsers().subscribe(users => {
      this.userMap = {};
      users.forEach(u => this.userMap[u.id] = u.full_name);
    });
    this.loadMeetingsFromBackend();
    this.generateCalendar();
    this.filterMeetings();
    this.participantCtrl.valueChanges.pipe(
      debounceTime(300),
      switchMap(value => value ? this.userService.getAllUsers() : [])
    ).subscribe(users => {
      const input = this.participantCtrl.value?.toLowerCase() || '';
      this.participantSuggestions = users.filter(user =>
        user.full_name.toLowerCase().startsWith(input)
      );
    });
    window.addEventListener('resize', this.updateMobileStatus);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('resize', this.updateMobileStatus);
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
    this.router.navigate(['/auth/login']);
  }

  getSectionTitle(): string {
    const item = this.sidebarItems.find(item => item.id === this.activeSection);
    return item ? item.name : 'Meetings';
  }

  toggleScheduleForm() {
    this.showScheduleForm = !this.showScheduleForm;
    if (!this.showScheduleForm) {
      this.formSubmitted = false;
      this.newMeeting = { 
        title: '', 
        date: '', 
        time: '', 
        participants: '',
        priority: 'medium',
        description: '',
        duration: '60',
        room_number: ''
      };
      this.editingMeetingId = null;
    }
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'list' ? 'grid' : 'list';
  }

  submitScheduleMeeting() {
    this.formSubmitted = true;
    if (!this.newMeeting.title || !this.newMeeting.date || !this.newMeeting.time) {
      return;
    }

    const email = localStorage.getItem('email');
    if (!email) {
      console.error('No user email found in localStorage');
      return;
    }

    this.userService.getUserByEmail(email).subscribe({
      next: (user: any) => {
        const dateString = this.newMeeting.date;
        const timeString = this.newMeeting.time;
        const isoDateTime = dateString && timeString
          ? `${dateString}T${timeString}:00`
          : dateString;

        const meetingPayload = {
          title: this.newMeeting.title,
          date: isoDateTime,
          participants: this.selectedParticipants.map(u => u.id),
          organizer_id: user.id,
          status: 'scheduled',
          duration: Number(this.newMeeting.duration) || 60,
          room_number: this.newMeeting.room_number || '',
          description: this.newMeeting.description || ''
        };

        if (this.editingMeetingId) {
          this.meetingService.updateMeeting(this.editingMeetingId, meetingPayload).subscribe({
            next: (updatedMeeting) => {
              this.loadMeetingsFromBackend();
              this.toggleScheduleForm();
            },
            error: (err) => {
              console.error('Failed to update meeting', err);
            }
          });
        } else {
          this.meetingService.createMeeting(meetingPayload).subscribe({
            next: (createdMeeting) => {
              this.loadMeetingsFromBackend();
              this.toggleScheduleForm();
            },
            error: (err) => {
              console.error('Failed to create meeting', err);
            }
          });
        }
      },
      error: (err) => {
        console.error('Failed to get user by email', err);
      }
    });
  }

  filterMeetings() {
    let result = [...this.meetings];
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(m => 
        m.title.toLowerCase().includes(query) || 
        m.participants.some(p => p.toLowerCase().includes(query)) ||
        (m.room_number && m.room_number.toLowerCase().includes(query))
      );
    }
    this.filteredMeetings = result;
    this.sortMeetings(false);
    this.currentPage = 1;
    this.updatePaginatedMeetings();
  }

  updatePaginatedMeetings() {
    this.totalPages = Math.ceil(this.filteredMeetings.length / this.pageSize) || 1;
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedMeetings = this.filteredMeetings.slice(start, end);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedMeetings();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedMeetings();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedMeetings();
    }
  }

  sortMeetings(toggle = true) {
    if (toggle) {
      this.sortAscending = !this.sortAscending;
    }
    this.filteredMeetings.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return this.sortAscending ? dateA - dateB : dateB - dateA;
    });
  }

  viewMeeting(id: number) {
    this.meetingService.getMeetingById(id).subscribe((meeting: any) => {
      this.selectedMeeting = meeting;
      this.showScheduleModal = true;
    }, err => {
      console.error('Failed to fetch meeting details', err);
    });
  }

  closeModal() {
    this.showScheduleModal = false;
    this.selectedMeeting = null;
  }

  editMeeting(id: number) {
    const meeting = this.meetings.find(m => m.id === id);
    if (meeting) {
      this.newMeeting = {
        title: meeting.title,
        date: meeting.date.split('T')[0],
        time: meeting.date.split('T')[1]?.slice(0,5) || '',
        participants: '', // handled by selectedParticipants
        priority: meeting.priority || 'medium',
        description: meeting.description || '',
        duration: meeting.duration ? meeting.duration.toString() : '60',
        room_number: meeting.room_number || ''
      };
      this.selectedParticipants = (meeting.participants || []).map(pid => {
        return { id: pid, full_name: pid.toString() };
      });
      this.editingMeetingId = id;
      this.showScheduleForm = true;
      this.showScheduleModal = false;
    }
  }

  cancelMeeting(id: number) {
    if (confirm('Are you sure you want to cancel this meeting?')) {
      this.meetingService.deleteMeeting(id).subscribe({
        next: () => {
          this.loadMeetingsFromBackend();
          this.closeModal();
        },
        error: (err) => {
          console.error('Failed to delete meeting', err);
        }
      });
    }
  }

  loadMeetingsFromBackend() {
    this.meetingService.getMeetings().subscribe(meetings => {
      const email = localStorage.getItem('email');
      if (email) {
        this.userService.getUserByEmail(email).subscribe((user: any) => {
          const userId = Number(user.id);
          // Only show meetings where the user is the organizer or a participant
          const filtered = meetings.filter((m: any) => {
            let partIds: number[] = [];
            if (Array.isArray(m.participants)) {
              partIds = m.participants.map((pid: any) => Number(pid));
            } else if (typeof m.participants === 'string') {
              try {
                partIds = JSON.parse(m.participants).map((pid: any) => Number(pid));
              } catch {
                partIds = [];
              }
            }
            const orgId = Number(m.organizer_id);
            const match = orgId === userId || partIds.includes(userId);
            return match;
          });
          this.meetings = filtered;
          this.filterMeetings();
          this.generateCalendar();
        });
      } else {
        this.meetings = meetings;
        this.filterMeetings();
        this.generateCalendar();
      }
    });
  }

  getParticipantNames(participants: any[]): string {
    if (!participants) return '';
    return participants.map(id => this.userMap[id] || id).join(', ');
  }

  generateCalendar() {
    // Find the first day to display (Sunday before or on the 1st of the month)
    const firstOfMonth = new Date(this.currentYear, this.currentMonth, 1);
    const startDay = firstOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
    const startDate = new Date(firstOfMonth);
    startDate.setDate(firstOfMonth.getDate() - startDay);

    this.calendarDays = [];
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const isCurrentMonth = currentDate.getMonth() === this.currentMonth;
      const isToday = this.isToday(currentDate);
      const dayMeetings = this.getMeetingsForDate(currentDate);
      this.calendarDays.push({
        day: isCurrentMonth ? currentDate.getDate() : 0, // Show 0 for other months
        date: currentDate.toISOString().split('T')[0],
        isToday: isToday,
        hasMeeting: dayMeetings.length > 0,
        meetingCount: dayMeetings.length,
        isCurrentMonth: isCurrentMonth
      });
    }
  }

  updateMobileStatus = () => {
    this.isMobile = window.innerWidth < 1024;
    if (!this.isMobile) {
      this.sidebarOpen = true;
    }
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  getMeetingsForDate(date: Date) {
    const dateStr = date.toISOString().split('T')[0];
    return this.meetings.filter(m => m.date === dateStr);
  }

  getMeetingsForDateObj(date: string) {
    return this.meetings.filter(m => m.date.split('T')[0] === date);
  }

  previousMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
  }

  // Add a participant to the selectedParticipants list
  addParticipant(user: any): void {
    if (!this.selectedParticipants.some(u => u.id === user.id)) {
      this.selectedParticipants.push(user);
    }
  }

  // Remove a participant from the selectedParticipants list
  removeParticipant(user: any): void {
    this.selectedParticipants = this.selectedParticipants.filter(u => u.id !== user.id);
  }

  // Return a CSS class or color based on meeting priority
  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return 'border-red-500';
      case 'medium': return 'border-yellow-500';
      case 'low': return 'border-green-500';
      default: return '';
    }
  }

  // Return an icon class based on meeting priority
  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'high': return 'fa fa-exclamation-circle';
      case 'medium': return 'fa fa-exclamation-triangle';
      case 'low': return 'fa fa-info-circle';
      default: return '';
    }
  }
} 