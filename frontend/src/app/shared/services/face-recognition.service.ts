import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FaceVerificationResult {
  verified: boolean;
  user_id?: number;
  email?: string;
  full_name?: string;
  role?: string;
  message?: string;
}

export interface FaceRecognitionStatus {
  user_id: number;
  face_recognition_enabled: boolean;
  has_face_encoding: boolean;
  last_face_login: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class FaceRecognitionService {
  private apiUrl = 'http://localhost:8000/face-recognition';

  constructor(private http: HttpClient) {}

  enrollFace(userId: number, imageFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', imageFile);
    return this.http.post(`${this.apiUrl}/enroll-face/${userId}`, formData);
  }

  verifyFace(imageFile: File): Observable<FaceVerificationResult> {
    const formData = new FormData();
    formData.append('image', imageFile);
    return this.http.post<FaceVerificationResult>(`${this.apiUrl}/verify-face`, formData);
  }

  loginWithFace(imageFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', imageFile);
    return this.http.post(`${this.apiUrl}/login-with-face`, formData);
  }

  getFaceRecognitionStatus(userId: number): Observable<FaceRecognitionStatus> {
    return this.http.get<FaceRecognitionStatus>(`${this.apiUrl}/status/${userId}`);
  }

  removeFaceEnrollment(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/enroll-face/${userId}`);
  }
} 