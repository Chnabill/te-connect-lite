import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface Document {
  id: number;
  title: string;
  category: string;
  type: string;
  size: number;
  uploaded_at: Date;
  owner_id: number;
  version: string;
  tags: string[];
  file_url: string;
}

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private apiUrl = 'http://localhost:8000/documents';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  getDocuments(params?: any): Observable<Document[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    
    const headers = this.getAuthHeaders();
    return this.http.get<Document[]>(this.apiUrl, { params: httpParams, headers })
      .pipe(
        retry(1), // Retry once on failure
        catchError(this.handleError.bind(this))
      );
  }

  uploadDocument(documentData: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(this.apiUrl, documentData, { headers })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  deleteDocument(id: string | number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/${id}`, { headers })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    
    if (!token) {
      console.warn('No authentication token found');
      // Redirect to login if no token
      this.router.navigate(['/login']);
      return new HttpHeaders();
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private getToken(): string | null {
    // Try multiple storage locations
    let token = localStorage.getItem('access_token') || 
                localStorage.getItem('token') ||
                sessionStorage.getItem('access_token') ||
                sessionStorage.getItem('token');
    
    if (token && this.isTokenExpired(token)) {
      console.warn('Token is expired');
      this.clearToken();
      return null;
    }
    
    return token;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error parsing token:', error);
      return true;
    }
  }

  private clearToken(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('token');
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 401:
          errorMessage = 'Unauthorized. Please log in again.';
          this.clearToken();
          this.router.navigate(['/login']);
          break;
        case 403:
          errorMessage = 'Forbidden. You do not have permission to access this resource.';
          break;
        case 404:
          errorMessage = 'Resource not found.';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
        default:
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    
    console.error('DocumentService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}