// src/app/shared/services/auth.service.ts
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;
  private userRoles: string[] = [];

  constructor(private http: HttpClient) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    // Auto-login in development mode or load from localStorage
    if (environment.production === false) {
      this.login(['ADMIN', 'HR', 'EMPLOYEE']); // Full access in development
    } else {
      // Check for both 'token' and 'access_token' for compatibility
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const role = localStorage.getItem('role');
      if (token && role) {
        this.isAuthenticated = true;
        this.userRoles = [role]; // Single role from localStorage in production
      }
    }
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  getCurrentUser() {
    return this.isAuthenticated ? { roles: this.userRoles } : null;
  }

  getUserRole(): string {
    // First check in-memory roles, then localStorage, then default to GUEST
    if (this.userRoles.length > 0) {
      return this.userRoles[0];
    }
    return localStorage.getItem('role') || 'GUEST';
  }

  getUserRoles(): string[] {
    // Return all roles, prioritizing in-memory over localStorage
    if (this.userRoles.length > 0) {
      return [...this.userRoles];
    }
    const role = localStorage.getItem('role');
    return role ? [role] : [];
  }

  hasRole(role: string): boolean {
    const roles = this.getUserRoles();
    return roles.includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.getUserRoles();
    return roles.some(role => userRoles.includes(role));
  }

  login(roles: string[] = ['HR']): void { // Default to HR if no roles specified
    this.isAuthenticated = true;
    this.userRoles = roles;
    localStorage.setItem('access_token', 'dummy-token');
    localStorage.setItem('role', roles[0]); // Store the first role
    
    if (!environment.production) {
      console.log('Development mode: Logged in with roles:', this.userRoles);
    }
  }

  logout(): void {
    this.isAuthenticated = false;
    this.userRoles = [];
    localStorage.removeItem('access_token');
    localStorage.removeItem('token'); // Remove both for compatibility
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('user_id');
  }

  loginBackend(data: { email: string, password: string }): Observable<any> {
    const body = new URLSearchParams();
    body.set('username', data.email); // use 'username' key
    body.set('password', data.password);
  
    return this.http.post<any>(
      'http://localhost:8000/auth/login',
      body.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    ).pipe(
      tap(response => {
        console.log('Login response:', response);
        if (response && response.access_token && response.role) {
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('role', response.role.toUpperCase()); // Ensure uppercase for consistency
          localStorage.setItem('email', data.email);
          // Store user_id for messaging system if available
          if (response.user_id) {
            localStorage.setItem('user_id', response.user_id.toString());
          }
          // CRITICAL: Update in-memory auth state
          this.isAuthenticated = true;
          this.userRoles = [response.role.toUpperCase()]; // Sync in-memory roles with uppercase
          console.log('Auth state updated:', { isAuthenticated: this.isAuthenticated, roles: this.userRoles });
        }
      })
    );
  }

  registerBackend(data: { 
    email: string, 
    password: string, 
    teId: string, 
    full_name: string, 
    department: string, 
    role: string 
  }): Observable<any> {
    return this.http.post('http://localhost:8000/api/users/register', data);
  }

  registerWithFace(data: { 
    email: string, 
    password: string, 
    teId: string, 
    full_name: string, 
    department: string, 
    role: string,
    face_image?: string,
    enable_face_recognition?: boolean
  }): Observable<any> {
    return this.http.post('http://localhost:8000/api/users/register-with-face', data);
  }

  // Debug method
  checkAuthState(): void {
    console.log('Auth State Debug:');
    console.log('Access Token:', localStorage.getItem('access_token'));
    console.log('Legacy Token:', localStorage.getItem('token'));
    console.log('Role (localStorage):', localStorage.getItem('role'));
    console.log('Roles (in-memory):', this.userRoles);
    console.log('Is Authenticated:', this.isAuthenticated);
    console.log('Current Role:', this.getUserRole());
  }
}