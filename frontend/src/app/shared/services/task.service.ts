import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  priority: 'high' | 'medium' | 'low';
  dueDate: string; // ISO string
  assigned_by?: string | null;
  user_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = environment.apiUrl + 'tasks';

  constructor(private http: HttpClient) {}

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/`);
  }

  addTask(task: Partial<Task>): Observable<Task> {
    // Map dueDate to due_date for backend
    const payload = {
      ...task,
      due_date: task.dueDate,
      assigned_by: task.assigned_by
    };
    return this.http.post<Task>(`${this.apiUrl}/`, payload);
  }

  updateTask(task: Task): Observable<Task> {
    const payload = {
      ...task,
      due_date: task.dueDate,
      assigned_by: task.assigned_by
    };
    return this.http.put<Task>(`${this.apiUrl}/${task.id}`, payload);
  }

  deleteTask(taskId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${taskId}`);
  }

  markTaskComplete(taskId: number): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${taskId}`, { status: 'completed' });
  }

  markTaskIncomplete(taskId: number): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${taskId}`, { status: 'pending' });
  }
} 