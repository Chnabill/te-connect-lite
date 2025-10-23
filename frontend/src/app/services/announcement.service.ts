import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Announcement {
  id?: number;
  title: string;
  content: string;
  departments: string[];
  priority?: string;
  tags?: string[];
  expiry_date?: string;
  created_at?: string;
  created_by?: number;
}

@Injectable({ providedIn: 'root' })
export class AnnouncementService {
  private apiUrl = 'http://localhost:8000/announcements/';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  createAnnouncement(data: Announcement): Observable<Announcement> {
    return this.http.post<Announcement>(this.apiUrl, data, { headers: this.getHeaders() });
  }

  getAnnouncements(): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getAnnouncement(id: number): Observable<Announcement> {
    return this.http.get<Announcement>(`${this.apiUrl}${id}`, { headers: this.getHeaders() });
  }

  deleteAnnouncement(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}`, { headers: this.getHeaders() });
  }

  debugAllAnnouncements(): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(`${this.apiUrl}debug/all`, { headers: this.getHeaders() });
  }
} 