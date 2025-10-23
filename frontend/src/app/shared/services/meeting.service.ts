import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MeetingService {
  private apiUrl = 'http://localhost:8000'; // Adjust if needed

  constructor(private http: HttpClient) {}

  createMeeting(meeting: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/meetings/`, meeting);
  }

  getMeetings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/meetings/`);
  }

  searchUsers(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/users/search/?q=${query}`);
  }

  deleteMeeting(meetingId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/meetings/${meetingId}`);
  }

  getMeetingById(meetingId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/meetings/${meetingId}`);
  }

  updateMeeting(meetingId: number, meeting: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/meetings/${meetingId}`, meeting);
  }
}