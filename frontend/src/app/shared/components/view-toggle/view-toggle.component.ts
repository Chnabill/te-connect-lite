// src/app/shared/components/view-toggle/view-toggle.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex rounded-md shadow-sm">
      <button
        *ngFor="let option of options; let i = index"
        (click)="selectView(option.value)"
        [ngClass]="[
          'px-4 py-2 text-sm font-medium transition-colors duration-200',
          getButtonClass(option.value),
          i === 0 ? 'rounded-l-md' : '',
          i === options.length - 1 ? 'rounded-r-md' : ''
        ]"
      >
        <div class="flex items-center">
          <span *ngIf="option.icon" class="mr-2">
            <ng-container [ngSwitch]="option.icon">
              <svg *ngSwitchCase="'grid'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <svg *ngSwitchCase="'list'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg *ngSwitchCase="'calendar'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <svg *ngSwitchCase="'chart'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </ng-container>
          </span>
          {{ option.label }}
        </div>
      </button>
    </div>
  `
})
export class ViewToggleComponent {
  @Input() options: { label: string; value: string; icon?: string }[] = [];
  @Input() activeView = '';
  @Output() viewChange = new EventEmitter<string>();

  selectView(value: string): void {
    if (this.activeView !== value) {
      this.activeView = value;
      this.viewChange.emit(value);
    }
  }

  getButtonClass(value: string): string {
    const isActive = this.activeView === value;
    
    return isActive
      ? 'bg-primary text-white border border-primary'
      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50';
  }
}