import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { FaceRegistrationComponent } from '../../shared/components/face-registration/face-registration.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, FaceRegistrationComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  formSubmitted = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isFormReady = false;
  showFaceRecognition = false;
  capturedFaceImage: string | null = null;

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      department: ['', [Validators.required]],
      teId: ['', [Validators.required]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
      role: ['', [Validators.required]],
      enableFaceRecognition: [true]
    });
    
    // Mark form as ready after initialization
    setTimeout(() => {
      this.isFormReady = true;
    }, 0);
  }

  toggleFaceRecognition() {
    this.showFaceRecognition = !this.showFaceRecognition;
    if (!this.showFaceRecognition) {
      this.capturedFaceImage = null;
    }
  }

  onFaceCaptured(event: {image: string, enabled: boolean}) {
    this.capturedFaceImage = event.image;
    this.showFaceRecognition = false;
  }

  async submitForm() {
    console.log('submitForm called');
    this.formSubmitted = true;
    this.errorMessage = null;
    this.successMessage = null;
    
    if (this.registerForm.valid) {
      const selectedRole = this.registerForm.value.role;
      if (!selectedRole) {
        this.errorMessage = 'Please select a role.';
        return;
      }

      // Check if passwords match
      if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
        this.errorMessage = 'Passwords do not match.';
        return;
      }

      try {
        // Prepare user data
        const userData = {
          email: this.registerForm.value.email,
          password: this.registerForm.value.password,
          full_name: this.registerForm.value.fullName,
          teId: this.registerForm.value.teId,
          department: this.registerForm.value.department,
          role: selectedRole,
          face_image: this.capturedFaceImage || undefined,
          enable_face_recognition: !!(this.registerForm.value.enableFaceRecognition && this.capturedFaceImage)
        };

        console.log('RegisterWithFace payload:', userData);
        // Use the enhanced registration endpoint if face recognition is enabled
        if (userData.enable_face_recognition) {
          // Call the enhanced registration endpoint
          this.authService.registerWithFace(userData).subscribe({
            next: () => {
              this.successMessage = 'Registration successful with face recognition! You can now log in.';
              setTimeout(() => this.router.navigate(['/auth/login']), 2000);
            },
            error: (err: any) => {
              this.errorMessage = err.error?.detail || 'Registration failed. Please try again.';
            }
          });
        } else {
          // Use the regular registration endpoint
          console.log('RegisterBackend payload:', userData);
          this.authService.registerBackend({
            email: userData.email,
            password: userData.password,
            full_name: userData.full_name,
            teId: userData.teId,
            department: userData.department,
            role: userData.role
          }).subscribe({
            next: () => {
              this.successMessage = 'Registration successful! You can now log in.';
              setTimeout(() => this.router.navigate(['/auth/login']), 1500);
            },
            error: (err: any) => {
              this.errorMessage = err.error?.detail || 'Registration failed. Please try again.';
            }
          });
        }
      } catch (error: any) {
        this.errorMessage = 'Registration failed. Please try again.';
      }
    }
  }
}