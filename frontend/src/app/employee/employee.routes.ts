import { Routes } from '@angular/router';
import { EmployeeDashboardComponent } from './dashboard/dashboard.component';
import { ChatbotComponent } from './chatbot/chatbot.component';
import { AnnouncementViewComponent } from './announcement-view/announcement-view.component';
import { EmployeeComponent } from './employee.component';
import { LeaveRequestComponent } from './leave-request/leave-request.component';
import { DocumentComponent } from './document/document.component';
import { MessagerieComponent } from '../shared/components/messagerie/messagerie.component';
import { MeetingComponent } from './meeting/meeting.component';

// These components will be implemented later
// Using the dashboard component as a placeholder for now
const PlaceholderComponent = EmployeeDashboardComponent;

export const routes: Routes = [
  {
    path: '',
    component: EmployeeComponent, // ✅ Parent wrapper with router-outlet
    children: [
      { path: 'dashboard', component: EmployeeDashboardComponent },
      { path: 'tasks', component: EmployeeDashboardComponent },
      { path: 'timesheet', component: PlaceholderComponent },
      { path: 'leave-management', component: LeaveRequestComponent },
      { path: 'activities', component: PlaceholderComponent },
      { path: 'documents', component: DocumentComponent },
      { path: 'meetings', component: MeetingComponent },
      { path: 'evaluations', component: PlaceholderComponent },
      { path: 'chatbot', component: ChatbotComponent },
      { path: 'task-list', component: EmployeeDashboardComponent },
      { path: 'announcement-view', component: AnnouncementViewComponent },
      { path: 'messagerie', component: MessagerieComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
