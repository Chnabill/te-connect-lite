import { Component, EventEmitter, Output, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaceRecognitionService, FaceVerificationResult } from '../../services/face-recognition.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-face-recognition',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="face-recognition-container">
      <div class="camera-section">
        <video #video [hidden]="!isStreaming" autoplay muted playsinline></video>
        <canvas #canvas [hidden]="true"></canvas>
        
        <div *ngIf="!isStreaming" class="camera-placeholder">
          <i class="fas fa-camera text-4xl text-gray-400 mb-4"></i>
          <p class="text-gray-600">Camera not active</p>
        </div>
      </div>
      
      <div class="controls-section">
        <button 
          (click)="startCamera()" 
          [disabled]="isStreaming"
          class="btn btn-primary">
          <i class="fas fa-play mr-2"></i>Start Camera
        </button>
        
        <button 
          (click)="captureImage()" 
          [disabled]="!isStreaming"
          class="btn btn-success">
          <i class="fas fa-camera mr-2"></i>Capture Face
        </button>
        
        <button 
          (click)="stopCamera()" 
          [disabled]="!isStreaming"
          class="btn btn-danger">
          <i class="fas fa-stop mr-2"></i>Stop Camera
        </button>
      </div>
      
      <div *ngIf="capturedImage" class="captured-section">
        <h4 class="text-lg font-semibold mb-2">Captured Face</h4>
        <div class="captured-image-container">
          <img [src]="capturedImage" alt="Captured face" class="captured-image" />
          <div class="captured-actions">
            <button (click)="verifyFace()" class="btn btn-primary">
              <i class="fas fa-check mr-2"></i>Verify Face
            </button>
            <button (click)="retakePhoto()" class="btn btn-secondary">
              <i class="fas fa-redo mr-2"></i>Retake
            </button>
          </div>
        </div>
      </div>
      
      <div *ngIf="verificationResult" class="verification-section">
        <div [class]="verificationResult.verified ? 'alert-success' : 'alert-error'">
          <i [class]="verificationResult.verified ? 'fas fa-check-circle' : 'fas fa-times-circle'" class="mr-2"></i>
          <span>{{ verificationResult.message || (verificationResult.verified ? 'Face verified successfully!' : 'Face not recognized') }}</span>
        </div>
      </div>
      
      <div *ngIf="errorMessage" class="error-section">
        <div class="alert-error">
          <i class="fas fa-exclamation-triangle mr-2"></i>
          <span>{{ errorMessage }}</span>
        </div>
      </div>
      
      <div *ngIf="isProcessing" class="processing-section">
        <div class="processing-spinner">
          <i class="fas fa-spinner fa-spin text-2xl text-blue-500"></i>
          <p class="mt-2 text-gray-600">Processing...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .face-recognition-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      padding: 1.5rem;
      max-width: 500px;
      margin: 0 auto;
    }
    
    .camera-section {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 300px;
      border: 2px dashed #e5e7eb;
      border-radius: 12px;
      background: #f9fafb;
    }
    
    video {
      width: 100%;
      max-width: 400px;
      height: 300px;
      border-radius: 8px;
      object-fit: cover;
    }
    
    .camera-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #9ca3af;
    }
    
    .controls-section {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      justify-content: center;
    }
    
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 120px;
    }
    
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .btn-primary {
      background: #3b82f6;
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      background: #2563eb;
    }
    
    .btn-success {
      background: #10b981;
      color: white;
    }
    
    .btn-success:hover:not(:disabled) {
      background: #059669;
    }
    
    .btn-danger {
      background: #ef4444;
      color: white;
    }
    
    .btn-danger:hover:not(:disabled) {
      background: #dc2626;
    }
    
    .btn-secondary {
      background: #6b7280;
      color: white;
    }
    
    .btn-secondary:hover:not(:disabled) {
      background: #4b5563;
    }
    
    .captured-section {
      width: 100%;
      text-align: center;
    }
    
    .captured-image-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    
    .captured-image {
      width: 200px;
      height: 150px;
      border-radius: 8px;
      object-fit: cover;
      border: 3px solid #e5e7eb;
    }
    
    .captured-actions {
      display: flex;
      gap: 0.5rem;
    }
    
    .verification-section, .error-section {
      width: 100%;
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
    }
    
    .alert-success {
      background: #d1fae5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    }
    
    .alert-error {
      background: #fee2e2;
      color: #991b1b;
      border: 1px solid #fecaca;
    }
    
    .processing-section {
      text-align: center;
      padding: 1rem;
    }
    
    .processing-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    @media (max-width: 640px) {
      .controls-section {
        flex-direction: column;
        width: 100%;
      }
      
      .btn {
        width: 100%;
      }
      
      .captured-actions {
        flex-direction: column;
        width: 100%;
      }
    }
  `]
})
export class FaceRecognitionComponent implements OnDestroy {
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  @Output() faceVerified = new EventEmitter<FaceVerificationResult>();

  isStreaming = false;
  capturedImage: string | null = null;
  verificationResult: FaceVerificationResult | null = null;
  errorMessage: string | null = null;
  isProcessing = false;
  
  private stream: MediaStream | null = null;

  constructor(private faceRecognitionService: FaceRecognitionService, private router: Router) {
    console.debug('[FaceRecognitionComponent] Constructor called');
  }

  async startCamera() {
    console.debug('[FaceRecognitionComponent] startCamera called');
    try {
      this.errorMessage = null;
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 400 }, 
          height: { ideal: 300 },
          facingMode: 'user' // Use front camera
        } 
      });
      
      this.video.nativeElement.srcObject = this.stream;
      this.isStreaming = true;
      console.debug('[FaceRecognitionComponent] Camera stream started', this.stream);
    } catch (error) {
      console.error('Error accessing camera:', error);
      this.errorMessage = 'Unable to access camera. Please check permissions.';
      console.debug('[FaceRecognitionComponent] startCamera error', error);
    }
  }

  stopCamera() {
    console.debug('[FaceRecognitionComponent] stopCamera called');
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      this.isStreaming = false;
      console.debug('[FaceRecognitionComponent] Camera stream stopped');
    }
  }

  captureImage() {
    console.debug('[FaceRecognitionComponent] captureImage called');
    if (!this.isStreaming) return;
    
    const canvas = this.canvas.nativeElement;
    const video = this.video.nativeElement;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0);
      this.capturedImage = canvas.toDataURL('image/jpeg');
      this.verificationResult = null;
      this.errorMessage = null;
      console.debug('[FaceRecognitionComponent] Image captured', this.capturedImage ? this.capturedImage.substring(0,30) + '...' : null);
    }
  }

  retakePhoto() {
    console.debug('[FaceRecognitionComponent] retakePhoto called');
    this.capturedImage = null;
    this.verificationResult = null;
    this.errorMessage = null;
  }

  async verifyFace() {
    console.debug('[FaceRecognitionComponent] verifyFace called', this.capturedImage ? this.capturedImage.substring(0,30) + '...' : null);
    if (!this.capturedImage) return;

    this.isProcessing = true;
    this.errorMessage = null;

    try {
      // Convert base64 to file
      const response = await fetch(this.capturedImage);
      const blob = await response.blob();
      const file = new File([blob], 'face.jpg', { type: 'image/jpeg' });
      console.debug('[FaceRecognitionComponent] Converted image to file', file);
      console.debug('[FaceRecognitionComponent] Calling loginWithFace');
      this.faceRecognitionService.loginWithFace(file).subscribe({
        next: (response) => {
          console.debug('[FaceRecognitionComponent] Face login successful:', response);
          this.isProcessing = false;
          if (response && response.access_token && response.role) {
            // Store token and user info in localStorage (same as normal login)
            localStorage.setItem('access_token', response.access_token);
            localStorage.setItem('role', response.role.toUpperCase()); // Ensure uppercase for consistency
            if (response.user_id) {
              localStorage.setItem('user_id', response.user_id.toString());
            }
            if (response.email) {
              localStorage.setItem('email', response.email);
            }
            
            console.debug('[FaceRecognitionComponent] Token and role stored in localStorage');
            console.debug('[FaceRecognitionComponent] Attempting navigation to dashboard...');
            
            // Navigate to dashboard based on role (convert to lowercase for URL)
            const role = response.role.toLowerCase();
            const dashboardUrl = `/${role}/dashboard`;
            console.debug('[FaceRecognitionComponent] Navigating to:', dashboardUrl);
            
            // Use hard redirect to ensure proper navigation
            window.location.href = dashboardUrl;
            console.debug('[FaceRecognitionComponent] Hard redirect initiated');
          } else {
            console.debug('[FaceRecognitionComponent] Invalid response format:', response);
            this.errorMessage = 'Invalid response from server';
          }
        },
        error: (error) => {
          console.error('Face login error:', error);
          this.errorMessage = error.error?.detail || 'Face login failed. Please try again.';
          this.isProcessing = false;
          console.debug('[FaceRecognitionComponent] loginWithFace error', error);
        }
      });
    } catch (error) {
      console.error('Error processing image:', error);
      this.errorMessage = 'Error processing image. Please try again.';
      this.isProcessing = false;
    }
  }

  ngOnDestroy() {
    console.debug('[FaceRecognitionComponent] ngOnDestroy called');
    this.stopCamera();
  }
}