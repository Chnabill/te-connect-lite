// src/app/admin/admin.routes.ts
import { Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { ActivityOverviewComponent } from './activity-overview/activity-overview.component';
import { EvaluationComponent } from './evaluation/evaluation.component';
import { PlatformSettingsComponent } from './platform-settings/platform-settings.component';
import { RolesPermissionsComponent } from './roles-permissions/roles-permissions.component';
import { SystemLogsComponent } from './system-logs/system-logs.component';
import { AuthGuard } from '../guards/auth.guard'; // Assuming this exists
import { TaskManagementComponent } from './task-management/task-management.component';

export const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivate: [AuthGuard], // Ensures only authenticated users access admin
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'employee-list', component: EmployeeListComponent },
      { path: 'activity-overview', component: ActivityOverviewComponent },
      { path: 'evaluation', component: EvaluationComponent },
      { path: 'platform-settings', component: PlatformSettingsComponent },
      { path: 'roles-permissions', component: RolesPermissionsComponent },
      { path: 'system-logs', component: SystemLogsComponent },
      { path: 'task-management', component: TaskManagementComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];