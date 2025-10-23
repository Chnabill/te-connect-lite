import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatResponse {
  response: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = `${environment.apiUrl}chatbot`;

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<string> {
    return this.http.post<ChatResponse>(`${this.apiUrl}/chat`, { message }).pipe(
      retry(3), 
      map(response => response.response),
      catchError(this.handleError)
    );
  }

  checkHealth(): Observable<boolean> {
    return this.http.get<{ status: string }>(`${this.apiUrl}/health`).pipe(
      retry(3),
      map(response => response.status === 'healthy'),
      catchError(this.handleError)
    );
  }
// Here we retry 3 times in case of faliure well first one just in case the of network issues :D
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred while communicating with the chatbot.';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error?.detail || errorMessage;
    }
    
    console.error('Chatbot error:', error);
    return throwError(() => new Error(errorMessage));
  }
} 