import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = `${environment.apiUrl}/employee`;

  constructor(private http: HttpClient) {}

  getProfile() {
    return this.http.get(`${this.apiUrl}/profile`);
  }

  // Autres méthodes spécifiques aux employés
}
