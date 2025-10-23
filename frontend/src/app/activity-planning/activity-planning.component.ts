// src/app/activity-planning/activity-planning.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-activity-planning',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule], // Add any needed imports
  templateUrl: './activity-planning.component.html',
  styleUrls: ['./activity-planning.component.css']
})
export class ActivityPlanningComponent {}