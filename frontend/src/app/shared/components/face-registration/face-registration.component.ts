import { Component, EventEmitter, Output, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-face-registration',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="face-registration-container">
      <div class="camera-section" *ngIf="!capturedImage">
        <video #video autoplay playsinline class="camera-preview"></video>
        <div class="camera-overlay">
          <div class="face-guide">
            <div class="face-outline"></div>
            <p class="guide-text">Position your face within the circle</p>
          </div>
        </div>
        <div class="camera-controls">
          <button 
            (click)="startCamera()" 
            *ngIf="!isCameraActive"
            class="btn btn-primary">
            <i class="fas fa-camera"></i> Start Camera
          </button>
          <button 
            (click)="captureImage()" 
            *ngIf="isCameraActive"
            class="btn btn-success">
            <i class="fas fa-camera"></i> Capture Photo
          </button>
        </div>
      </div>

      <div class="preview-section" *ngIf="capturedImage">
        <img [src]="capturedImage" alt="Captured face" class="captured-image">
        <div class="preview-controls">
          <button (click)="retakePhoto()" class="btn btn-secondary">
            <i class="fas fa-redo"></i> Retake
          </button>
          <button (click)="confirmPhoto()" class="btn btn-primary">
            <i class="fas fa-check"></i> Use This Photo
          </button>
        </div>
      </div>

      <div class="status-message" *ngIf="statusMessage">
        <div class="alert" [ngClass]="statusType">
          {{ statusMessage }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .face-registration-container {
      max-width: 500px;
      margin: 0 auto;
      padding: 20px;
    }

    .camera-section {
      position: relative;
      background: #f8f9fa;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 20px;
    }

    .camera-preview {
      width: 100%;
      height: 300px;
      object-fit: cover;
      background: #000;
    }

    .camera-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }

    .face-guide {
      text-align: center;
    }

    .face-outline {
      width: 200px;
      height: 200px;
      border: 3px solid #fff;
      border-radius: 50%;
      margin: 0 auto 15px;
      box-shadow: 0 0 20px rgba(0,0,0,0.3);
    }

    .guide-text {
      color: #fff;
      font-size: 14px;
      font-weight: 500;
      text-shadow: 0 1px 3px rgba(0,0,0,0.7);
      margin: 0;
    }

    .camera-controls {
      padding: 20px;
      text-align: center;
      background: #fff;
    }

    .preview-section {
      text-align: center;
      background: #f8f9fa;
      border-radius: 12px;
      padding: 20px;
    }

    .captured-image {
      width: 100%;
      max-width: 300px;
      height: 300px;
      object-fit: cover;
      border-radius: 8px;
      margin-bottom: 20px;
      border: 3px solid #fff;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .preview-controls {
      display: flex;
      gap: 10px;
      justify-content: center;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-primary {
      background: #167a87;
      color: white;
    }

    .btn-primary:hover {
      background: #0f5a66;
    }

    .btn-success {
      background: #28a745;
      color: white;
    }

    .btn-success:hover {
      background: #218838;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #5a6268;
    }

    .status-message {
      margin-top: 20px;
    }

    .alert {
      padding: 12px 16px;
      border-radius: 6px;
      font-weight: 500;
    }

    .alert-success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .alert-error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .alert-info {
      background: #d1ecf1;
      color: #0c5460;
      border: 1px solid #bee5eb;
    }
  `]
})
export class FaceRegistrationComponent implements OnDestroy {
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  
  @Output() faceCaptured = new EventEmitter<string>();
  @Output() faceRegistrationComplete = new EventEmitter<{image: string, enabled: boolean}>();

  isCameraActive = false;
  capturedImage: string | null = null;
  statusMessage = '';
  statusType = 'info';
  private stream: MediaStream | null = null;

  async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      this.video.nativeElement.srcObject = this.stream;
      this.isCameraActive = true;
      this.statusMessage = 'Camera started. Position your face in the circle.';
      this.statusType = 'info';
    } catch (error) {
      this.statusMessage = 'Error accessing camera. Please check permissions.';
      this.statusType = 'error';
      console.error('Camera error:', error);
    }
  }

  captureImage() {
    if (!this.isCameraActive) return;

    const video = this.video.nativeElement;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      this.capturedImage = canvas.toDataURL('image/jpeg', 0.8);
      this.isCameraActive = false;
      this.stopCamera();
      
      this.statusMessage = 'Photo captured! Review and confirm or retake.';
      this.statusType = 'success';
    }
  }

  retakePhoto() {
    this.capturedImage = null;
    this.statusMessage = '';
    this.startCamera();
  }

  confirmPhoto() {
    if (this.capturedImage) {
      this.faceRegistrationComplete.emit({
        image: this.capturedImage,
        enabled: true
      });
      this.statusMessage = 'Face photo confirmed!';
      this.statusType = 'success';
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.isCameraActive = false;
  }

  ngOnDestroy() {
    this.stopCamera();
  }
} 