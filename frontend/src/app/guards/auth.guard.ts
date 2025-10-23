// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  console.log('AuthGuard: Checking authentication for route:', state.url);
  console.log('AuthGuard: isLoggedIn():', authService.isLoggedIn());
  console.log('AuthGuard: Access token:', localStorage.getItem('access_token'));
  console.log('AuthGuard: Role:', localStorage.getItem('role'));
  
  if (authService.isLoggedIn()) {
    console.log('AuthGuard: Access granted');
    return true;
  }

  console.log('AuthGuard: Access denied, redirecting to login');
  router.navigate(['/auth/login']);
  return false;
};