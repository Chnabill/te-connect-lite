import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { FaceRecognitionComponent } from '../../shared/components/face-recognition/face-recognition.component';
import { FaceRecognitionService, FaceVerificationResult } from '../../shared/services/face-recognition.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, FaceRecognitionComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  formSubmitted = false;
  errorMessage: string | null = null;
  role : string = '';
  showFaceRecognition = false;

  constructor(
    private fb: FormBuilder, 
    private router: Router, 
    private authService: AuthService,
    private faceRecognitionService: FaceRecognitionService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      remember_me: [false]
    });
  }

  async submitForm() {
    this.formSubmitted = true;
    this.errorMessage = null;
    if (this.loginForm.valid) {
      console.log('Attempting login with:', { email: this.loginForm.value.email });
      this.authService.loginBackend({
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      }).subscribe({
        next: (response) => {
          console.log('Login successful, response:', response);
          const role = response.role?.toLowerCase() || 'employee';
          const dashboardUrl = `/${role}/dashboard`;
          console.log('Navigating to:', dashboardUrl);
          this.router.navigate([dashboardUrl]);
        },
        error: (err) => {
          console.error('Login error:', err);
          this.errorMessage = err.error?.detail || 'Login failed. Please try again.';
        }
      });
    }
  }

  onFaceVerified(verificationResult: FaceVerificationResult) {
    // Handle successful face verification
    this.showFaceRecognition = false;
    
    // Navigate based on role
    const role = verificationResult.role?.toLowerCase() || 'employee';
    this.router.navigate([`/${role}/dashboard`]);
  }

  toggleFaceRecognition() {
    this.showFaceRecognition = !this.showFaceRecognition;
    this.errorMessage = null;
  }
}