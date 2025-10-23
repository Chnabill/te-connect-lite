import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule], // Add any needed imports
  template: '<router-outlet></router-outlet>'
})
export class EmployeeComponent {}