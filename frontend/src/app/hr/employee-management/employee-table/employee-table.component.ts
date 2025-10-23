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
  selector: 'app-employee-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Department
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Position
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Start Date
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr *ngFor="let employee of employees" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <img *ngIf="employee.photo" [src]="employee.photo" alt="" class="h-10 w-10 rounded-full">
                  <div *ngIf="!employee.photo" 
                       [ngStyle]="{'background': getColorForName(employee.firstName + employee.lastName)}"
                       class="h-10 w-10 rounded-full flex items-center justify-center">
                    <span class="text-white text-sm font-bold">
                      {{ (employee.firstName ? employee.firstName[0] : (employee.email ? employee.email[0] : '')) }}{{ (employee.lastName ? employee.lastName[0] : '') }}
                    </span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">
                    {{employee.firstName}} {{employee.lastName}}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{employee.email}}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{employee.department}}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{employee.position}}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span [ngClass]="{
                'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                'bg-green-100 text-green-800': employee.status === 'active',
                'bg-yellow-100 text-yellow-800': employee.status === 'onleave',
                'bg-red-100 text-red-800': employee.status === 'terminated'
              }">
                {{employee.status | titlecase}}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{employee.startDate | date}}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button (click)="onDelete(employee.id)" 
                      class="text-red-600 hover:text-red-900">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class EmployeeTableComponent {
  @Input() employees: Employee[] = [];
  @Output() edit = new EventEmitter<Employee>();
  @Output() delete = new EventEmitter<string>();

  onEdit(employee: Employee) {
    this.edit.emit(employee);
  }

  onDelete(id: string) {
    this.delete.emit(id);
  }

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