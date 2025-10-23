// src/app/shared/components/action-button/action-button.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-action-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [ngClass]="getButtonClass()"
      [disabled]="disabled || loading"
      (click)="handleClick()"
      class="btn-action flex items-center justify-center rounded-md px-4 py-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
      [attr.aria-busy]="loading"
    >
      <span *ngIf="loading" class="mr-2">
        <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </span>
      <ng-content></ng-content>
    </button>
  `
})
export class ActionButtonComponent {
  @Input() type: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' = 'primary';
  @Input() disabled = false;
  @Input() loading = false;
  @Output() action = new EventEmitter<void>();

  handleClick(): void {
    if (!this.disabled && !this.loading) {
      this.action.emit();
    }
  }

  getButtonClass(): string {
    const baseClass = 'font-medium';
    
    switch (this.type) {
      case 'primary':
        return `${baseClass} bg-primary hover:bg-primary-dark text-white focus:ring-primary`;
      case 'secondary':
        return `${baseClass} bg-secondary hover:bg-secondary-dark text-white focus:ring-secondary`;
      case 'success':
        return `${baseClass} bg-success hover:bg-success-600 text-white focus:ring-success`;
      case 'danger':
        return `${baseClass} bg-error hover:bg-error-600 text-white focus:ring-error`;
      case 'warning':
        return `${baseClass} bg-warning hover:bg-warning-600 text-white focus:ring-warning`;
      case 'info':
        return `${baseClass} bg-info hover:bg-info-600 text-white focus:ring-info`;
      default:
        return `${baseClass} bg-primary hover:bg-primary-dark text-white focus:ring-primary`;
    }
  }
}