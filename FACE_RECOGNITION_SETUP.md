# Face Recognition Setup Guide

This guide explains how to set up and use the face recognition functionality in TE Connect Lite.

## Prerequisites

### Backend Dependencies
The following Python packages are required and should already be in `requirements.txt`:
- `opencv-python==4.8.1.78`
- `face-recognition==1.3.0`
- `numpy==1.24.3`
- `Pillow==10.0.0`

### Frontend Dependencies
The Angular application uses the device camera API for face capture.

## Installation

### 1. Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Database Migration
If you have an existing database, run the migration script:
```bash
cd backend
python migrate_face_recognition.py
```

### 3. Start the Backend
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Start the Frontend
```bash
cd frontend
ng serve
```

## Features

### 1. Face Recognition Login
- Users can login using face recognition instead of password
- Accessible from the login page via "Face Recognition Login" button
- Uses device camera to capture and verify face

### 2. Face Enrollment
- Users can enroll their face for recognition
- Accessible from user profile/settings
- Stores encrypted face encodings securely

### 3. Face Management
- View face recognition status
- Update face data
- Remove face enrollment
- Track last face login

## API Endpoints

### Face Recognition Routes
- `POST /face-recognition/enroll-face/{user_id}` - Enroll user face
- `POST /face-recognition/verify-face` - Verify face against enrolled users
- `POST /face-recognition/login-with-face` - Login using face recognition
- `GET /face-recognition/status/{user_id}` - Get face recognition status
- `DELETE /face-recognition/enroll-face/{user_id}` - Remove face enrollment

## Usage

### For Users

#### First Time Setup
1. Login with your regular credentials
2. Go to your profile/settings
3. Click "Start Enrollment" in the Face Recognition section
4. Allow camera access when prompted
5. Look at the camera and click "Capture Face"
6. Click "Verify Face" to complete enrollment

#### Using Face Recognition Login
1. On the login page, click "Face Recognition Login"
2. Allow camera access
3. Look at the camera and click "Capture Face"
4. Click "Verify Face"
5. If verified, you'll be automatically logged in

### For Administrators

#### Managing User Face Recognition
- View face recognition status for all users
- Force re-enrollment if needed
- Monitor face recognition usage

## Security Features

### Liveness Detection
- Basic liveness detection to prevent photo spoofing
- Checks for actual face presence in captured images

### Secure Storage
- Face encodings are stored as encrypted JSON strings
- No raw images are stored in the database
- Access control through JWT authentication

### Rate Limiting
- Face verification attempts are logged
- Failed attempts are tracked for security monitoring

## Troubleshooting

### Common Issues

#### Camera Not Working
- Ensure camera permissions are granted
- Check if camera is being used by another application
- Try refreshing the page

#### Face Not Recognized
- Ensure good lighting conditions
- Look directly at the camera
- Try re-enrolling your face
- Check if face is clearly visible

#### Backend Errors
- Verify all dependencies are installed
- Check database migration was successful
- Ensure backend is running on correct port

### Performance Tips
- Use good lighting for better face detection
- Keep face centered in camera view
- Avoid extreme angles or expressions during enrollment

## Development

### Adding Face Recognition to New Components
```typescript
import { FaceRecognitionComponent } from '../../shared/components/face-recognition/face-recognition.component';

// Add to component imports
imports: [FaceRecognitionComponent]

// Use in template
<app-face-recognition (faceVerified)="onFaceVerified($event)"></app-face-recognition>
```

### Customizing Face Recognition Service
The `FaceRecognitionService` can be extended to add:
- Custom liveness detection algorithms
- Multiple face support
- Face quality assessment
- Custom verification thresholds

## Security Considerations

### Production Deployment
- Use HTTPS for all communications
- Implement proper rate limiting
- Add monitoring and alerting
- Regular security audits
- Consider additional liveness detection methods

### Privacy Compliance
- Ensure compliance with local privacy laws
- Implement data retention policies
- Provide user consent mechanisms
- Allow users to delete face data

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review backend logs for errors
3. Verify database schema is correct
4. Test with a fresh face enrollment

## Future Enhancements

Potential improvements for future versions:
- Advanced liveness detection (blink, head movement)
- Face quality scoring
- Multiple face support per user
- Integration with external face recognition services
- Mobile app support
- Offline face recognition capabilities 