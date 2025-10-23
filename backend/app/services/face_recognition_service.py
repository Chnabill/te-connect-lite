import cv2
import numpy as np
from PIL import Image
import io
import base64
import json
from typing import Optional

class SimpleFaceRecognitionService:
    def __init__(self):
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    
    def encode_face_from_image(self, image_data: str) -> Optional[np.ndarray]:
        """Convert base64 image to face encoding using OpenCV"""
        try:
            # Decode base64 image
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
            image_array = np.array(image)
            
            # Convert RGB to BGR for OpenCV
            if len(image_array.shape) == 3:
                image_bgr = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
            else:
                image_bgr = image_array
            
            # Convert to grayscale
            gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
            
            # Detect faces
            faces = self.face_cascade.detectMultiScale(gray, 1.1, 4)
            
            if len(faces) > 0:
                # Get the first face
                x, y, w, h = faces[0]
                face_roi = gray[y:y+h, x:x+w]
                
                # Resize to standard size
                face_roi = cv2.resize(face_roi, (64, 64))
                
                # Flatten and normalize
                features = face_roi.flatten().astype(np.float32) / 255.0
                
                # Pad or truncate to 128 dimensions
                if len(features) < 128:
                    features = np.pad(features, (0, 128 - len(features)), 'constant')
                elif len(features) > 128:
                    features = features[:128]
                
                return features
            
            return None
            
        except Exception as e:
            print(f"Error encoding face: {e}")
            return None
    
    def compare_faces(self, face_encoding1: np.ndarray, face_encoding2: np.ndarray, tolerance: float = 0.8) -> bool:
        """Compare two face encodings using simple distance"""
        try:
            # Ensure both encodings have the same shape
            if face_encoding1.shape != face_encoding2.shape:
                min_size = min(face_encoding1.shape[0], face_encoding2.shape[0])
                face_encoding1 = face_encoding1[:min_size]
                face_encoding2 = face_encoding2[:min_size]
            
            # Calculate simple distance
            distance = np.linalg.norm(face_encoding1 - face_encoding2)
            
            # Normalize by the length of the vectors
            normalized_distance = distance / (np.linalg.norm(face_encoding1) + np.linalg.norm(face_encoding2) + 1e-8)
            
            return normalized_distance <= tolerance
            
        except Exception as e:
            print(f"Error comparing faces: {e}")
            return False
    
    def detect_liveness(self, image_data: str) -> bool:
        """Basic liveness detection - check if face is detected"""
        try:
            face_encoding = self.encode_face_from_image(image_data)
            return face_encoding is not None
        except Exception as e:
            print(f"Error in liveness detection: {e}")
            return False
    
    def get_face_quality_score(self, image_data: str) -> float:
        """Calculate simple face image quality score (0-1)"""
        try:
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
            image_array = np.array(image)
            
            # Convert to grayscale for analysis
            if len(image_array.shape) == 3:
                gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
            else:
                gray = image_array
            
            # Simple quality check - just check if face is detected
            faces = self.face_cascade.detectMultiScale(gray, 1.1, 4)
            
            if len(faces) > 0:
                return 0.8  # Good quality if face detected
            else:
                return 0.2  # Poor quality if no face detected
                
        except Exception as e:
            print(f"Error calculating quality score: {e}")
            return 0.0 