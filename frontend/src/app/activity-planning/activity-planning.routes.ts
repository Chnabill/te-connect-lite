// src/app/activity-planning/activity-planning.routes.ts
import { Routes } from '@angular/router';
import { ActivityPlanningComponent } from './activity-planning.component';
import { AnnualLeaveFormComponent } from './types/annual-leave/annual-leave-form.component';

export const routes: Routes = [
  {
    path: '',
    component: ActivityPlanningComponent,
    children: [
      { path: 'annual-leave', component: AnnualLeaveFormComponent },
      { path: '', redirectTo: 'annual-leave', pathMatch: 'full' }
    ]
  }
];