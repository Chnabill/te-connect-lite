import { Component } from '@angular/core';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 class="text-6xl font-bold text-[#f28d00] mb-4">401</h1>
      <h2 class="text-2xl font-semibold text-gray-800 mb-2">Unauthorized</h2>
      <p class="text-gray-600 mb-6">You do not have permission to access this page.</p>
      <a routerLink="/" class="text-[#f28d00] hover:underline">Go Home</a>
    </div>
  `,
  styles: []
})
export class UnauthorizedComponent {}

export default UnauthorizedComponent; 