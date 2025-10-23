import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { routes } from './activity-planning.routes';
import { AnnualLeaveFormComponent } from './types/annual-leave/annual-leave-form.component';

@NgModule({
  declarations: [
    AnnualLeaveFormComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class ActivityPlanningModule { }
