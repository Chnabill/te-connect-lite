// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { HrDashboardComponent } from './hr/dashboard/dashboard.component'; 
import { EmployeeDashboardComponent } from './employee/dashboard/dashboard.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';

export const routes: Routes = [
  { path: '', loadChildren: () => import('./home/home.routes').then(m => m.routes) },
  { path: 'auth', loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES) },
  
  // Specific dashboard routes MUST come before lazy-loaded module routes
  {
    path: 'admin/dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard, roleGuard(['ADMIN'])], // Remove the arrow function!
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'hr/dashboard',
    component: HrDashboardComponent,
    canActivate: [AuthGuard, roleGuard(['HR'])], // Remove the arrow function!
    data: { roles: ['HR'] }
  },
  {
    path: 'employee/dashboard',
    component: EmployeeDashboardComponent,
    canActivate: [AuthGuard, roleGuard(['EMPLOYEE'])], // Remove the arrow function!
    data: { roles: ['EMPLOYEE'] }
  },

  // Lazy-loaded modules with role guards
  { 
    path: 'admin', 
    loadChildren: () => import('./admin/admin.routes').then(m => m.routes),
    canActivate: [AuthGuard, roleGuard(['ADMIN'])], // Add role guard here too!
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'hr', 
    loadChildren: () => import('./hr/hr.routes').then(m => m.HR_ROUTES),
    canActivate: [AuthGuard, roleGuard(['HR'])], // Add role guard here too!
    data: { roles: ['HR'] }
  },
  { 
    path: 'employee', 
    loadChildren: () => import('./employee/employee.routes').then(m => m.routes),
    canActivate: [AuthGuard, roleGuard(['EMPLOYEE'])], // Add role guard here too!
    data: { roles: ['EMPLOYEE'] }
  },

  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: '**', redirectTo: '' }
];