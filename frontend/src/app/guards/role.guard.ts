// src/app/guards/role.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';

export const roleGuard = (expectedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    // Check if user is authenticated first
    if (!authService.isLoggedIn()) {
      router.navigate(['/auth/login']);
      return false;
    }

    // Check if user has any of the expected roles
    if (authService.hasAnyRole(expectedRoles)) {
      console.log('Role Guard: Access granted', {
        userRole: authService.getUserRole(),
        userRoles: authService.getUserRoles(),
        expectedRoles
      });
      return true;
    }

    console.log('Role Guard: Access denied', {
      userRole: authService.getUserRole(),
      userRoles: authService.getUserRoles(),
      expectedRoles
    });
    
    router.navigate(['/unauthorized']);
    return false;
  };
};