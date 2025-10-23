// src/app/shared/services/toast.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts: Toast[] = [];
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  private lastId = 0;

  constructor() {}

  getToasts(): Observable<Toast[]> {
    return this.toastsSubject.asObservable();
  }

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 5000): void {
    const id = ++this.lastId;
    const toast: Toast = { id, message, type };
    
    this.toasts.push(toast);
    this.toastsSubject.next([...this.toasts]);
    
    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  remove(id: number): void {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.toastsSubject.next([...this.toasts]);
  }

  clear(): void {
    this.toasts = [];
    this.toastsSubject.next([]);
  }
}