import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  teId: string;
  department: string;
  user_image?: string;
  position?: string;
  skills?: string[];
}

export interface UserUpdate {
  full_name?: string;
  department?: string;
  user_image?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  

  constructor(private http: HttpClient) {}

  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`http://localhost:8000/api/users/by-email/${email}`);
  }

  updateUserProfile(userId: number, userData: UserUpdate): Observable<User> {
    return this.http.put<User>(`http://localhost:8000/api/users/${userId}`, userData);
  }

  uploadProfileImage(userId: number, imageData: string): Observable<User> {
    return this.http.put<User>(`http://localhost:8000/api/users/${userId}`, {
      user_image: imageData
    });
  }

  getUsers(): Observable<{ users: User[] }> {
    return this.http.get<{ users: any[] }>(`http://localhost:8000/api/users`).pipe(
      map(response => ({
        users: response.users.map(user => ({
          ...user,
          skills: user.skills ? user.skills.split(',').map((s: string) => s.trim()) : []
        }))
      }))
    );
  }

  getAllUsers(): Observable<User[]> {
    return this.getUsers().pipe(map(res => res.users));
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`http://localhost:8000/api/users/${userId}`);
  }
} 