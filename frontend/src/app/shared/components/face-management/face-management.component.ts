import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaceRecognitionService, FaceRecognitionStatus } from '../../services/face-recognition.service';
import { FaceRecognitionComponent } from '../face-recognition/face-recognition.component';

@Component({
  selector: 'app-face-management',
  standalone: true,
  imports: [CommonModule, FaceRecognitionComponent],
  template: `
    <div class="face-management-container">
      <div class="header-section">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Face Recognition Management</h3>
        <p class="text-sm text-gray-600 mb-4">Manage your face recognition settings for secure login</p>
      </div>

      <!-- Status Display -->
      <div *ngIf="faceStatus" class="status-section">
        <div class="status-card" [class]="faceStatus.face_recognition_enabled ? 'enabled' : 'disabled'">
          <div class="status-icon">
            <i [class]="faceStatus.face_recognition_enabled ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
          </div>
          <div class="status-info">
            <h4 class="font-medium">
              {{ faceStatus.face_recognition_enabled ? 'Face Recognition Enabled' : 'Face Recognition Disabled' }}
            </h4>
            <p class="text-sm">
              {{ faceStatus.face_recognition_enabled ? 'You can login using face recognition' : 'Face recognition is not set up' }}
            </p>
            <p *ngIf="faceStatus.last_face_login" class="text-xs text-gray-500 mt-1">
              Last face login: {{ faceStatus.last_face_login | date:'medium' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Enrollment Section -->
      <div *ngIf="!faceStatus?.face_recognition_enabled" class="enrollment-section">
        <div class="enrollment-card">
          <div class="enrollment-header">
            <i class="fas fa-user-plus text-2xl text-blue-500 mb-3"></i>
            <h4 class="font-medium text-gray-800">Enroll Your Face</h4>
            <p class="text-sm text-gray-600 text-center">
              Set up face recognition for quick and secure login
            </p>
          </div>
          
          <button 
            (click)="showEnrollment = true"
            class="enroll-btn">
            <i class="fas fa-camera mr-2"></i>Start Enrollment
          </button>
        </div>
      </div>

      <!-- Management Section -->
      <div *ngIf="faceStatus?.face_recognition_enabled" class="management-section">
        <div class="management-card">
          <div class="management-header">
            <i class="fas fa-cog text-2xl text-green-500 mb-3"></i>
            <h4 class="font-medium text-gray-800">Manage Face Recognition</h4>
          </div>
          
          <div class="management-actions">
            <button 
              (click)="showReEnrollment = true"
              class="action-btn primary">
              <i class="fas fa-sync-alt mr-2"></i>Update Face Data
            </button>
            
            <button 
              (click)="removeEnrollment()"
              class="action-btn danger">
              <i class="fas fa-trash mr-2"></i>Remove Enrollment
            </button>
          </div>
        </div>
      </div>

      <!-- Enrollment Modal -->
      <div *ngIf="showEnrollment" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="text-xl font-semibold">Face Enrollment</h3>
            <button (click)="showEnrollment = false" class="close-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <p class="text-gray-600 mb-4">
              Please look at the camera and capture your face. Make sure you're in a well-lit area.
            </p>
            
            <app-face-recognition 
              (faceVerified)="onFaceEnrolled($event)">
            </app-face-recognition>
          </div>
        </div>
      </div>

      <!-- Re-enrollment Modal -->
      <div *ngIf="showReEnrollment" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="text-xl font-semibold">Update Face Data</h3>
            <button (click)="showReEnrollment = false" class="close-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <p class="text-gray-600 mb-4">
              Capture a new photo to update your face recognition data.
            </p>
            
            <app-face-recognition 
              (faceVerified)="onFaceReEnrolled($event)">
            </app-face-recognition>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .face-management-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 1.5rem;
    }

    .header-section {
      text-align: center;
      margin-bottom: 2rem;
    }

    .status-section {
      margin-bottom: 2rem;
    }

    .status-card {
      display: flex;
      align-items: center;
      padding: 1.5rem;
      border-radius: 12px;
      border: 2px solid;
      gap: 1rem;
    }

    .status-card.enabled {
      background: #f0fdf4;
      border-color: #22c55e;
      color: #166534;
    }

    .status-card.disabled {
      background: #fef2f2;
      border-color: #ef4444;
      color: #991b1b;
    }

    .status-icon {
      font-size: 2rem;
    }

    .status-info h4 {
      margin-bottom: 0.5rem;
    }

    .enrollment-section, .management-section {
      margin-bottom: 2rem;
    }

    .enrollment-card, .management-card {
      background: white;
      border: 2px dashed #e5e7eb;
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
    }

    .enrollment-header, .management-header {
      margin-bottom: 1.5rem;
    }

    .enroll-btn {
      background: #3b82f6;
      color: white;
      padding: 0.75rem 2rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .enroll-btn:hover {
      background: #2563eb;
    }

    .management-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .action-btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
    }

    .action-btn.primary {
      background: #10b981;
      color: white;
    }

    .action-btn.primary:hover {
      background: #059669;
    }

    .action-btn.danger {
      background: #ef4444;
      color: white;
    }

    .action-btn.danger:hover {
      background: #dc2626;
    }

    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      max-width: 600px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #6b7280;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
      transition: background 0.2s;
    }

    .close-btn:hover {
      background: #f3f4f6;
    }

    .modal-body {
      padding: 1.5rem;
    }

    @media (max-width: 640px) {
      .management-actions {
        flex-direction: column;
      }

      .action-btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class FaceManagementComponent implements OnInit, OnDestroy {
  @Input() userId!: number;
  
  faceStatus: FaceRecognitionStatus | null = null;
  showEnrollment = false;
  showReEnrollment = false;

  constructor(private faceRecognitionService: FaceRecognitionService) {}

  ngOnInit() {
    this.loadFaceStatus();
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  loadFaceStatus() {
    if (this.userId) {
      this.faceRecognitionService.getFaceRecognitionStatus(this.userId).subscribe({
        next: (status) => {
          this.faceStatus = status;
        },
        error: (error) => {
          console.error('Error loading face status:', error);
        }
      });
    }
  }

  onFaceEnrolled(result: any) {
    this.showEnrollment = false;
    this.loadFaceStatus(); // Refresh status
    // You could show a success message here
  }

  onFaceReEnrolled(result: any) {
    this.showReEnrollment = false;
    this.loadFaceStatus(); // Refresh status
    // You could show a success message here
  }

  removeEnrollment() {
    if (confirm('Are you sure you want to remove face recognition enrollment? This will disable face login.')) {
      this.faceRecognitionService.removeFaceEnrollment(this.userId).subscribe({
        next: () => {
          this.loadFaceStatus(); // Refresh status
        },
        error: (error) => {
          console.error('Error removing enrollment:', error);
        }
      });
    }
  }
} 