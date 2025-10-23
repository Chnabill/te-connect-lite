import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700">First Name</label>
          <input type="text" formControlName="firstName" 
                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
          <div *ngIf="form.get('firstName')?.errors?.['required'] && form.get('firstName')?.touched" 
               class="text-red-500 text-sm mt-1">
            First name is required
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Last Name</label>
          <input type="text" formControlName="lastName" 
                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
          <div *ngIf="form.get('lastName')?.errors?.['required'] && form.get('lastName')?.touched" 
               class="text-red-500 text-sm mt-1">
            Last name is required
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" formControlName="email" 
                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
          <div *ngIf="form.get('email')?.errors?.['required'] && form.get('email')?.touched" 
               class="text-red-500 text-sm mt-1">
            Email is required
          </div>
          <div *ngIf="form.get('email')?.errors?.['email'] && form.get('email')?.touched" 
               class="text-red-500 text-sm mt-1">
            Please enter a valid email
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Phone</label>
          <input type="tel" formControlName="phone" 
                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
          <div *ngIf="form.get('phone')?.errors?.['required'] && form.get('phone')?.touched" 
               class="text-red-500 text-sm mt-1">
            Phone is required
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Department</label>
          <select formControlName="department" 
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option value="">Select Department</option>
            <option *ngFor="let dept of departments" [value]="dept">{{dept}}</option>
          </select>
          <div *ngIf="form.get('department')?.errors?.['required'] && form.get('department')?.touched" 
               class="text-red-500 text-sm mt-1">
            Department is required
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Position</label>
          <select formControlName="position" 
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option value="">Select Position</option>
            <option *ngFor="let pos of positions" [value]="pos">{{pos}}</option>
          </select>
          <div *ngIf="form.get('position')?.errors?.['required'] && form.get('position')?.touched" 
               class="text-red-500 text-sm mt-1">
            Position is required
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Status</label>
          <select formControlName="status" 
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option value="active">Active</option>
            <option value="onleave">On Leave</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Start Date</label>
          <input type="date" formControlName="startDate" 
                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
          <div *ngIf="form.get('startDate')?.errors?.['required'] && form.get('startDate')?.touched" 
               class="text-red-500 text-sm mt-1">
            Start date is required
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Salary</label>
          <input type="number" formControlName="salary" 
                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Skills (comma-separated)</label>
          <input type="text" formControlName="skills" 
                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700">Address</label>
          <textarea formControlName="address" rows="2" 
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"></textarea>
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700">Emergency Contact</label>
          <input type="text" formControlName="emergencyContact" 
                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700">Notes</label>
          <textarea formControlName="notes" rows="3" 
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"></textarea>
        </div>
      </div>

      <div class="flex justify-end space-x-4">
        <button type="button" (click)="onCancel()" 
                class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Cancel
        </button>
        <button type="submit" [disabled]="!form.valid"
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
          {{ isEditing ? 'Update' : 'Add' }} Employee
        </button>
      </div>
    </form>
  `
})
export class EmployeeFormComponent {
  @Input() isEditing = false;
  @Input() form!: FormGroup;
  @Output() submitted = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  
  departments = ['Engineering', 'Marketing', 'Sales', 'Human Resources', 'Finance', 'Operations', 'Design'];
  positions = ['Manager', 'Senior', 'Mid-level', 'Junior', 'Intern', 'Director', 'VP'];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s-()]+$/)]],
      department: ['', Validators.required],
      position: ['', Validators.required],
      status: ['active', Validators.required],
      startDate: ['', Validators.required],
      salary: ['', [Validators.min(0)]],
      address: [''],
      emergencyContact: [''],
      skills: [''],
      notes: ['']
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.submitted.emit(this.form.value);
      console.log("new employee added");
      console.log(this.form.value);
    }else{
      console.log("form is not valid");
      console.log(this.form.errors);
    }
  }

  onCancel() {
    this.cancel.emit();
  }
} 