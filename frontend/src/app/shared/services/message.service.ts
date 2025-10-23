import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from './user.service';
import { map } from 'rxjs/operators';

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  timestamp: string;
  seen: boolean;
}

@Injectable({ providedIn: 'root' })
export class MessageService {
  private apiUrl = environment.apiUrl + 'messages';
  private ws: WebSocket | null = null;
  private messageSubject = new Subject<Message>();

  constructor(private http: HttpClient) {}

  // Fetch all users and filter HRs
  getHRs(): Observable<User[]> {
    return this.http.get<{ users: User[] }>(environment.apiUrl + 'api/users').pipe(
      // Only HRs
      map(res => res.users.filter(u => u.role === 'HR'))
    );
  }

  // Fetch conversation with a specific HR
  getConversation(hrId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/conversation/${hrId}`);
  }

  // Send a message to an HR
  sendMessage(senderId: number, receiverId: number, content: string): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}/`, {
      sender_id: senderId,
      receiver_id: receiverId,
      content
    });
  }

  // Mark a message as seen
  markAsSeen(messageId: number): Observable<Message> {
    return this.http.patch<Message>(`${this.apiUrl}/${messageId}`, { seen: true });
  }

  // WebSocket connection for real-time updates
  connectWebSocket(userId: number) {
    if (this.ws) {
      this.ws.close();
    }
    this.ws = new WebSocket(`ws://localhost:8000/messages/ws/messages/${userId}`);
    this.ws.onmessage = (event) => {
      const message: Message = JSON.parse(event.data);
      this.messageSubject.next(message);
    };
    this.ws.onclose = () => {
      // Optionally handle reconnect
    };
  }

  onMessage(): Observable<Message> {
    return this.messageSubject.asObservable();
  }

  disconnectWebSocket() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
} 