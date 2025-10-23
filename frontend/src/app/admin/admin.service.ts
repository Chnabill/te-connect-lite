import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface Employee {
  id: number;
  name: string;
  role: string;
  email: string;
}

export interface Evaluation {
  id: number;
  employee: string;
  score: number;
  comments: string;
}

export interface Role {
  id: number;
  name: string;
  permissions: string[];
}

export interface Log {
  id: number;
  message: string;
  timestamp: string;
}

export interface DashboardData {
  kpis: { title: string; value: string; changeClass: string; changeIcon: string; change: string }[];
  activities: { action: string; name: string; date: string; status: string; avatarColor: string; initials: string }[];
}

export interface Activity {
  id: number;
  action: string;
  user: string;
  date: string;
  status: string;
  activity_type: string;
  description?: string;
  user_name?: string;
}

export interface Setting {
  key: string;
  value: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private employees: Employee[] = [
    { id: 1, name: 'John Doe', role: 'Admin', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', role: 'User', email: 'jane@example.com' }
  ];
  private evaluations: Evaluation[] = [
    { id: 1, employee: 'John Doe', score: 85, comments: 'Good performance' }
  ];
  private roles: Role[] = [
    { id: 1, name: 'Admin', permissions: ['read', 'write', 'delete'] },
    { id: 2, name: 'User', permissions: ['read'] }
  ];
  private logs: Log[] = [
    { id: 1, message: 'System started', timestamp: '2025-06-24 12:00 PM' }
  ];
  private settings: Setting[] = [
    { key: 'Theme', value: 'light' },
    { key: 'Language', value: 'en' }
  ];

  // Mock data
  private mockDashboardData: DashboardData = {
    kpis: [
      { title: 'Active Users', value: '1,247', changeClass: 'text-green-600', changeIcon: 'fas fa-arrow-up', change: '+12%' },
      { title: 'Tasks Completed', value: '8,342', changeClass: 'text-green-600', changeIcon: 'fas fa-arrow-up', change: '+8%' },
      { title: 'Revenue', value: '124.5K', changeClass: 'text-green-600', changeIcon: 'fas fa-arrow-up', change: '+15%' },
      { title: 'Performance', value: '94.2%', changeClass: 'text-yellow-600', changeIcon: 'fas fa-arrow-down', change: '-2%' }
    ],
    activities: [
      { action: 'Completed project milestone', name: 'Sarah Johnson', date: '2 minutes ago', status: 'Completed', avatarColor: 'bg-green-500', initials: 'SJ' },
      { action: 'Updated user permissions', name: 'Mike Chen', date: '15 minutes ago', status: 'Completed', avatarColor: 'bg-blue-500', initials: 'MC' },
      { action: 'Created new department', name: 'Emily Davis', date: '1 hour ago', status: 'Pending', avatarColor: 'bg-purple-500', initials: 'ED' },
      { action: 'Submitted quarterly report', name: 'Alex Rodriguez', date: '2 hours ago', status: 'Completed', avatarColor: 'bg-indigo-500', initials: 'AR' },
      { action: 'Scheduled team meeting', name: 'Lisa Wang', date: '3 hours ago', status: 'Completed', avatarColor: 'bg-pink-500', initials: 'LW' },
      { action: 'Approved budget request', name: 'David Brown', date: '4 hours ago', status: 'Completed', avatarColor: 'bg-orange-500', initials: 'DB' },
      { action: 'Updated system settings', name: 'Anna Taylor', date: '5 hours ago', status: 'Pending', avatarColor: 'bg-teal-500', initials: 'AT' },
      { action: 'Completed security audit', name: 'James Wilson', date: '6 hours ago', status: 'Completed', avatarColor: 'bg-red-500', initials: 'JW' }
    ]
  };

  constructor(private http: HttpClient) {}

  getEmployees(): Observable<Employee[]> { return of(this.employees); }
  addEmployee(employee: Employee): Observable<void> { this.employees.push(employee); return of(); }
  editEmployee(id: number, employee: Employee): Observable<void> { 
    const index = this.employees.findIndex(e => e.id === id);
    if (index !== -1) this.employees[index] = employee;
    return of();
  }
  deleteEmployee(id: number): Observable<void> { 
    this.employees = this.employees.filter(e => e.id !== id);
    return of();
  }

  getEvaluations(): Observable<Evaluation[]> { return of(this.evaluations); }
  submitEvaluation(evaluation: Evaluation): Observable<void> { 
    if (evaluation.id) {
      const index = this.evaluations.findIndex(e => e.id === evaluation.id);
      if (index !== -1) this.evaluations[index] = evaluation;
    } else {
      evaluation.id = Date.now();
      this.evaluations.push(evaluation);
    }
    return of();
  }
  deleteEvaluation(id: number): Observable<void> { 
    this.evaluations = this.evaluations.filter(e => e.id !== id);
    return of();
  }

  getRoles(): Observable<Role[]> { return of(this.roles); }
  updateRolePermissions(id: number, permissions: string[]): Observable<void> { 
    const role = this.roles.find(r => r.id === id);
    if (role) role.permissions = permissions;
    return of();
  }

  getSystemLogs(): Observable<Log[]> { return of(this.logs); }
  addLog(message: string): Observable<void> { 
    this.logs.push({ id: Date.now(), message, timestamp: new Date().toLocaleString('en-US', { timeZone: 'CET' }) });
    return of();
  }

  getSettings(): Observable<Setting[]> { return of(this.settings); }
  updateSettings(settings: Setting[]): Observable<void> { 
    this.settings = settings;
    localStorage.setItem('settings', JSON.stringify(this.settings));
    return of();
  }

  getDashboardData(): Observable<DashboardData> {
    return of(this.mockDashboardData);
  }

  getActivityOverview(): Observable<Activity[]> {
    // Comprehensive mock data for activities
    const mockActivities: Activity[] = [
      {
        id: 1,
        user: 'John Doe',
        activity_type: 'user',
        action: 'New user registered',
        description: 'Successfully created account and completed profile setup',
        date: '2024-01-21T09:15:00',
        status: 'completed'
      },
      {
        id: 2,
        user: 'Sarah Johnson',
        activity_type: 'task',
        action: 'Project milestone completed',
        description: 'Finished Q1 marketing campaign deliverables ahead of schedule',
        date: '2024-01-21T11:30:00',
        status: 'completed'
      },
      {
        id: 3,
        user: 'Mike Chen',
        activity_type: 'login',
        action: 'User logged in',
        description: 'Accessed dashboard from mobile device',
        date: '2024-01-21T08:45:00',
        status: 'completed'
      },
      {
        id: 4,
        user: 'Emily Rodriguez',
        activity_type: 'evaluation',
        action: 'Performance evaluation submitted',
        description: 'Completed quarterly performance review for team member',
        date: '2024-01-21T14:20:00',
        status: 'pending'
      },
      {
        id: 5,
        user: 'David Wilson',
        activity_type: 'report',
        action: 'Monthly report generated',
        description: 'Created comprehensive analytics report for management review',
        date: '2024-01-21T16:10:00',
        status: 'completed'
      },
      {
        id: 6,
        user: 'Lisa Thompson',
        activity_type: 'task',
        action: 'Task assignment updated',
        description: 'Modified priority and deadline for customer support tickets',
        date: '2024-01-21T10:05:00',
        status: 'pending'
      },
      {
        id: 7,
        user: 'System Admin',
        activity_type: 'system',
        action: 'Database backup completed',
        description: 'Automated daily backup process finished successfully',
        date: '2024-01-21T02:00:00',
        status: 'completed'
      },
      {
        id: 8,
        user: 'Alex Martinez',
        activity_type: 'announcement',
        action: 'Team announcement posted',
        description: 'Shared updates about upcoming company retreat and team building activities',
        date: '2024-01-21T13:45:00',
        status: 'completed'
      },
      {
        id: 9,
        user: 'Jennifer Lee',
        activity_type: 'user',
        action: 'Profile information updated',
        description: 'Changed contact details and notification preferences',
        date: '2024-01-21T15:30:00',
        status: 'completed'
      },
      {
        id: 10,
        user: 'Robert Brown',
        activity_type: 'logout',
        action: 'User logged out',
        description: 'Session ended after 4 hours of active use',
        date: '2024-01-21T17:20:00',
        status: 'completed'
      },
      {
        id: 11,
        user: 'Amanda Davis',
        activity_type: 'task',
        action: 'New task created',
        description: 'Set up client onboarding workflow for new enterprise customer',
        date: '2024-01-21T12:15:00',
        status: 'pending'
      },
      {
        id: 12,
        user: 'System Monitor',
        activity_type: 'system',
        action: 'Security scan initiated',
        description: 'Weekly vulnerability assessment and penetration testing started',
        date: '2024-01-21T18:00:00',
        status: 'in_progress'
      },
      {
        id: 13,
        user: 'Kevin Garcia',
        activity_type: 'evaluation',
        action: 'Self-evaluation completed',
        description: 'Submitted quarterly self-assessment and goal setting form',
        date: '2024-01-21T09:50:00',
        status: 'completed'
      },
      {
        id: 14,
        user: 'Michelle Taylor',
        activity_type: 'report',
        action: 'Budget report reviewed',
        description: 'Analyzed Q1 spending patterns and identified cost optimization opportunities',
        date: '2024-01-21T11:05:00',
        status: 'pending'
      },
      {
        id: 15,
        user: 'James Anderson',
        activity_type: 'user',
        action: 'Password reset requested',
        description: 'Initiated secure password recovery process via email verification',
        date: '2024-01-21T07:30:00',
        status: 'completed'
      },
      {
        id: 16,
        user: 'System Scheduler',
        activity_type: 'system',
        action: 'Maintenance window scheduled',
        description: 'Planned system updates and server maintenance for weekend deployment',
        date: '2024-01-21T19:15:00',
        status: 'pending'
      },
      {
        id: 17,
        user: 'Nicole White',
        activity_type: 'task',
        action: 'Task delegation completed',
        description: 'Assigned customer feedback analysis tasks to junior team members',
        date: '2024-01-21T14:45:00',
        status: 'completed'
      },
      {
        id: 18,
        user: 'Christopher Moore',
        activity_type: 'announcement',
        action: 'Policy update notification',
        description: 'Communicated changes to remote work policy and flexible hours guidelines',
        date: '2024-01-21T16:30:00',
        status: 'completed'
      },
      {
        id: 19,
        user: 'Stephanie Clark',
        activity_type: 'evaluation',
        action: 'Team evaluation in progress',
        description: 'Conducting mid-year performance reviews for development team',
        date: '2024-01-21T13:20:00',
        status: 'in_progress'
      },
      {
        id: 20,
        user: 'Daniel Lewis',
        activity_type: 'system',
        action: 'API rate limit adjusted',
        description: 'Updated system configuration to handle increased traffic load',
        date: '2024-01-21T20:10:00',
        status: 'failed'
      }
    ];
    
    return of(mockActivities);
  }

  getActivities(activityType?: string): Observable<Activity[]> {
    let url = '/api/activities/';
    if (activityType) {
      url += `?activity_type=${activityType}`;
    }
    return this.http.get<Activity[]>(url);
  }

  getSystemAnalytics(): Observable<any> {
    // Return comprehensive mock analytics data
    return of({
      total_users: 1247,
      total_tasks: 15420,
      completed_tasks: 8342,
      pending_tasks: 4876,
      overdue_tasks: 2202,
      completion_rate: 54.1,
      total_leaves: 89,
      upcoming_meetings: 23,
      active_projects: 42,
      system_uptime: 99.8,
      storage_used: 67.3,
      bandwidth_usage: 45.2,
      user_satisfaction: 4.7,
      response_time: 0.85
    });
  }

  downloadReport(): Observable<Blob> {
    return this.http.get('/api/dashboard/report', { responseType: 'blob' });
  }
}