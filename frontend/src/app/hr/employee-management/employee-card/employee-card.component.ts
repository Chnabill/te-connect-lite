import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: 'active' | 'onleave' | 'terminated';
  startDate: Date;
  salary?: number;
  photo?: string;
  address?: string;
  emergencyContact?: string;
  skills?: string[];
  notes?: string;
}

@Component({
  selector: 'app-employee-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 group flex flex-col h-full">
      <!-- Header: Avatar, Name, Position, Department -->
      <div class="flex items-center gap-4 p-5 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-blue-50">
        <div>
          <img *ngIf="employee.photo" [src]="employee.photo" alt="Profile" class="h-16 w-16 rounded-full border-2 border-blue-200 object-cover">
          <div *ngIf="!employee.photo" [ngStyle]="{'background': getColorForName(employee.firstName + employee.lastName)}" class="h-16 w-16 rounded-full flex items-center justify-center text-xl text-white font-bold border-2 border-blue-200">
            {{ (employee.firstName ? employee.firstName[0] : (employee.email ? employee.email[0] : '')) }}{{ (employee.lastName ? employee.lastName[0] : '') }}
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-lg font-semibold text-gray-900 truncate">{{employee.firstName}} {{employee.lastName}}</span>
            <span class="inline-block px-2 py-0.5 rounded text-xs font-medium" [ngClass]="{
              'bg-emerald-100 text-emerald-700': employee.status === 'active',
              'bg-amber-100 text-amber-700': employee.status === 'onleave',
              'bg-rose-100 text-rose-700': employee.status === 'terminated'
            }">{{employee.status | titlecase}}</span>
          </div>
          <div class="text-sm text-blue-700 font-medium">{{employee.position}}</div>
          <div class="mt-1">
            <span class="inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-semibold border border-blue-200">{{employee.department}}</span>
          </div>
        </div>
      </div>
      <!-- Body: Email, Phone, Joining Date, Skills -->
      <div class="flex-1 flex flex-col gap-2 p-5">
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <i class="fas fa-envelope text-blue-400"></i>
          <span class="truncate">{{employee.email}}</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <i class="fas fa-phone-alt text-green-400"></i>
          <span>{{employee.phone || '—'}}</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <i class="fas fa-calendar-alt text-purple-400"></i>
          <span>Joined {{employee.startDate | date:'MMM yyyy'}}</span>
        </div>
        <div class="flex flex-wrap gap-1 mt-2">
          <span *ngFor="let skill of employee.skills?.slice(0,4)" class="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-medium border border-slate-200">{{skill}}</span>
          <span *ngIf="(employee.skills?.length || 0) > 4" class="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium border border-gray-200">+{{(employee.skills?.length || 0) - 4}} more</span>
        </div>
      </div>
      <!-- Footer: Actions -->
      <div class="flex items-center justify-between gap-2 px-5 py-3 border-t border-gray-100 bg-slate-50">
        <button *ngIf="mode !== 'admin'" (click)="onEdit(employee)" class="flex items-center gap-1 px-3 py-1.5 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition" title="Edit"><i class="fas fa-edit"></i> Edit</button>
        <button (click)="onDelete(employee.id)" class="flex items-center gap-1 px-3 py-1.5 rounded bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition" title="Delete"><i class="fas fa-trash-alt"></i> Delete</button>
        <button *ngIf="mode === 'admin'" (click)="$event.stopPropagation(); onView(employee)" class="flex items-center gap-1 px-3 py-1.5 rounded bg-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-300 transition" title="View"><i class="fas fa-eye"></i> View</button>
        <button *ngIf="mode === 'admin'" (click)="$event.stopPropagation()" class="flex items-center gap-1 px-3 py-1.5 rounded bg-emerald-100 text-emerald-700 text-xs font-semibold hover:bg-emerald-200 transition" title="Message"><i class="fas fa-envelope"></i> Message</button>
      </div>
    </div>
  `
})
export class EmployeeCardComponent {
  @Input() employee!: Employee;
  @Input() mode: 'admin' | 'hr' = 'hr';
  @Output() edit = new EventEmitter<Employee>();
  @Output() delete = new EventEmitter<string>();
  @Output() view = new EventEmitter<Employee>();

  onEdit(employee: Employee) {
    this.edit.emit(employee);
  }

  onDelete(id: string) {
    this.delete.emit(id);
  }

  onView(employee: Employee) {
    this.view.emit(employee);
  }

  // Generate a color based on the user's name for variety
  getColorForName(name: string): string {
    const colors = [
      'linear-gradient(135deg, #60a5fa 0%, #818cf8 100%)', // blue
      'linear-gradient(135deg, #34d399 0%, #38bdf8 100%)', // green/blue
      'linear-gradient(135deg, #f472b6 0%, #fbbf24 100%)', // pink/yellow
      'linear-gradient(135deg, #f87171 0%, #fbbf24 100%)', // red/yellow
      'linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)', // purple/pink
      'linear-gradient(135deg, #fbbf24 0%, #34d399 100%)', // yellow/green
      'linear-gradient(135deg, #38bdf8 0%, #a78bfa 100%)', // blue/purple
      'linear-gradient(135deg, #f472b6 0%, #34d399 100%)', // pink/green
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }
} 