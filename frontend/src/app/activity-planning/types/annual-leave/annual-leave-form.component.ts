// src/app/activity-planning/types/annual-leave/annual-leave-form.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-annual-leave-form',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule], // Add any needed imports
  templateUrl: './annual-leave-form.component.html',
  styleUrls: ['./annual-leave-form.component.css']
})

export class AnnualLeaveFormComponent {
  form = {
    startDate: '',
    endDate: '',
    reason: '',
    attachment: null
  };

  get duration(): number {
    if (!this.form.startDate || !this.form.endDate) return 0;
    const start = new Date(this.form.startDate);
    const end = new Date(this.form.endDate);
    return Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1);
  }

  handleFile(event: any) {
    this.form.attachment = event.target.files[0];
  }

  submitForm() {
    console.log("Submitting:", this.form);
  }
}