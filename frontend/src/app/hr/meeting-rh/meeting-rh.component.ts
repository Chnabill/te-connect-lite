import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { ChatbotComponent } from '../../shared/components/chatbot/chatbot.component';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, switchMap } from 'rxjs/operators';
import { HeaderComponent } from '@app/shared/components/header/header.component';
import { MeetingService } from '@app/shared/services/meeting.service'; // Adjust path
import { FormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { UserService } from '@app/shared/services/user.service'; // Adjust path

interface SidebarItem {
  id: string;
  name: string;
  icon: string;
  route?: string;
  badge?: string;
  badgeClass?: string;
}

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
  selector: 'app-meeting-rh',
  standalone: true,
  imports: [CommonModule, SidebarComponent, FormsModule, ChatbotComponent, HeaderComponent, ReactiveFormsModule],
  templateUrl: './meeting-rh.component.html',
  styleUrls: ['./meeting-rh.component.css']
})
export class MeetingRhComponent implements OnInit, OnDestroy {
  sidebarOpen = true;
  isMobile = false;
  activeSection = 'meetings';
  userName = 'John Doe';
  userRole = 'HR Manager';
  userInitials = 'JD';
  notificationCount = 3;
  userEmail = '';
  userImage: string | null = null;
  showUserMenu = false;
  showProfileModal = false;
  profileModalType: 'view' | 'edit' | 'password' | null = null;
  notifications: any[] = [
    { title: 'New meeting scheduled', time: '2h ago' },
    { title: 'Meeting starting soon', time: '1d ago' }
  ];
  showNotifications = false;
  searchQuery: string = '';
  viewMode: 'grid' | 'list' = 'list';
  
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

  private destroy$ = new Subject<void>();

  constructor(private router: Router, private meetingService: MeetingService, private userService: UserService) {
    this.isMobile = window.innerWidth < 1024;
  }

  ngOnInit() {
    // Load user info from backend using email from localStorage
    const email = localStorage.getItem('email') || '';
    if (email) {
      // Replace with actual user service if available
      this.userEmail = email;
      this.userName = 'John Doe'; // Replace with actual user name from backend
      this.userRole = 'HR Manager'; // Replace with actual user role from backend
      this.userInitials = this.getInitials(this.userName);
      this.userImage = null; // Replace with actual user image from backend
    }
    // Fetch all users for participant name mapping
    this.userService.getAllUsers().subscribe(users => {
      this.userMap = {};
      users.forEach(u => this.userMap[u.id] = u.full_name);
    });
    this.loadMeetingsFromBackend();
    this.generateCalendar();
    this.filterMeetings();
    this.setupSearchDebounce();
    this.participantCtrl.valueChanges.pipe(
      debounceTime(300),
      switchMap(value => value ? this.meetingService.searchUsers(value) : [])
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

  private setupSearchDebounce() {
    // Implement search debounce if needed
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
    console.log('Logout clicked');
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

        console.log('submitScheduleMeeting called');
        console.log('editingMeetingId:', this.editingMeetingId);
        console.log('Payload:', meetingPayload);

        if (this.editingMeetingId) {
          console.log('Calling updateMeeting (PUT)');
          this.meetingService.updateMeeting(this.editingMeetingId, meetingPayload).subscribe({
            next: (updatedMeeting) => {
              console.log('Meeting updated:', updatedMeeting);
              this.loadMeetingsFromBackend();
              this.toggleScheduleForm();
            },
            error: (err) => {
              console.error('Failed to update meeting', err);
            }
          });
        } else {
          console.log('Calling createMeeting (POST)');
          this.meetingService.createMeeting(meetingPayload).subscribe({
            next: (createdMeeting) => {
              console.log('Meeting created:', createdMeeting);
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
    this.updateNotificationCount();
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
    // Fetch the latest meeting details from backend
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
        // Find user object by id if available, else just id
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

  loadMeetings() {
    const savedMeetings = localStorage.getItem('meetings');
    if (savedMeetings) {
      this.meetings = JSON.parse(savedMeetings);
      this.updateMeetingStatus();
    }
  }

  saveMeetings() {
    localStorage.setItem('meetings', JSON.stringify(this.meetings));
  }

  updateMeetingStatus() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.meetings = this.meetings.map(meeting => {
      const meetingDate = new Date(meeting.date);
      const diff = Math.floor((meetingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      let status = 'Upcoming';
      let dateClass = 'bg-blue-100 text-blue-800 border-blue-200';

      if (diff === 0) {
        status = 'Today';
        dateClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
      } else if (diff === 1) {
        status = 'Tomorrow';
        dateClass = 'bg-green-100 text-green-800 border-green-200';
      } else if (diff < 0) {
        status = 'Past';
        dateClass = 'bg-gray-100 text-gray-600 border-gray-200';
      } else {
        status = `In ${diff} days`;
      }

      return { ...meeting, status, dateClass };
    });
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

  updateNotificationCount() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    this.notificationCount = this.meetings.filter(meeting => {
      const meetingDate = new Date(meeting.date);
      const diff = Math.floor((meetingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diff >= 0 && diff <= 7;
    }).length;
  }

  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'high': return 'fas fa-exclamation-circle text-red-500';
      case 'medium': return 'fas fa-circle text-yellow-500';
      case 'low': return 'fas fa-circle text-green-500';
      default: return 'fas fa-circle text-gray-400';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-300 bg-gray-50';
    }
  }

  private updateMobileStatus = () => {
    this.isMobile = window.innerWidth < 1024;
    if (!this.isMobile) {
      this.sidebarOpen = true;
    }
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  getCurrentSubsection() {
    return 'Meetings';
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
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
        // Upload logic here
      };
      reader.readAsDataURL(file);
    }
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  performSearch() {
    // Implement your search logic here
    console.log('Searching for:', this.searchQuery);
  }

  addParticipant(user: any) {
    if (!this.selectedParticipants.find(u => u.id === user.id)) {
      this.selectedParticipants.push(user);
    }
    this.participantCtrl.setValue('');
    this.participantSuggestions = [];
  }

  removeParticipant(user: any) {
    this.selectedParticipants = this.selectedParticipants.filter(u => u.id !== user.id);
  }

  loadMeetingsFromBackend() {
    console.log('loadMeetingsFromBackend called');
    this.meetingService.getMeetings().subscribe(meetings => {
      console.log('Meetings from backend:', meetings);
      meetings.forEach((m: any) => {
        console.log(`Meeting ${m.id}: organizer_id=${m.organizer_id}, participants=`, m.participants);
      });
      // Only show meetings where the user is the organizer or a participant
      const email = localStorage.getItem('email');
      if (email) {
        this.userService.getUserByEmail(email).subscribe((user: any) => {
          const userId = Number(user.id);
          console.log('Current user ID:', userId, typeof userId);
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
            console.log(`Meeting ${m.id}: organizer_id=${orgId}, participants=`, partIds, 'match:', match);
            return match;
          });
          console.log('Filtered meetings:', filtered);
          console.log('Meetings for user', userId, ':', filtered);
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
}