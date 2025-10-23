// src/app/hr/hr.routes.ts
import { Routes } from '@angular/router';
import { EmployeeManagementComponent } from './employee-management/employee-management.component';
import { AnnouncementManageComponent } from './announcement-manage/announcement-manage.component';
import { DocumentShareComponent } from './document-share/document-share.component';
import { MeetingRhComponent } from './meeting-rh/meeting-rh.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { HrDashboardComponent } from './dashboard/dashboard.component';
import { LeaveManagementComponent } from './leave-management/leave-management.component';
import { MessagerieComponent } from '../shared/components/messagerie/messagerie.component';

export const HR_ROUTES: Routes = [
  { path: 'dashboard', component: HrDashboardComponent },
  { path: 'employee-management', component: EmployeeManagementComponent },
  { path: 'announcement-manage', component: AnnouncementManageComponent },
  { path: 'document-share', component: DocumentShareComponent },
  { path: 'meeting-rh', component: MeetingRhComponent },
  { path: 'statistics', component: StatisticsComponent },
  { path: 'leave-management', component: LeaveManagementComponent },
  { path: 'messagerie', component: MessagerieComponent, data: { role: 'HR' } }, // HR messaging
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];