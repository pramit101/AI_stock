"""
YOLO-based object detection for shelf monitoring
Level 1: Detects each item and returns bounding boxes with confidence scores
"""

import logging
import cv2
import numpy as np
from typing import List, Dict, Any, Tuple
from .shelf_config import calculate_stock_percentage, get_stock_status, get_recommendation
from PIL import Image
import torch
import os

class YOLODetector:
    def __init__(self, model_path: str = None):
        """
        Initialize YOLO detector
        
        Args:
            model_path: Path to YOLO model weights (.pt file)
        """
        self.model = None
        self.model_path = None
        
        # Try to find the model in the expected locations
        if model_path:
            self.model_path = model_path
        else:
            # Look for models in common locations
            possible_paths = [
                "/data/shared/nobackup/yolov11x.pt",
                "/data/shared/nobackup/yolov11x.pt",
                "data/shared/nobackup/yolov11x.pt",
                "yolov11x.pt",  # Local fallback
            ]
            
            for path in possible_paths:
                if os.path.exists(path):
                    self.model_path = path
                    break
        
        if self.model_path:
            try:
                # Import ultralytics only if we have a model path
                from ultralytics import YOLO
                self.model = YOLO(self.model_path)
                logging.info(f"YOLO model loaded from {self.model_path}")
            except ImportError:
                logging.error("ultralytics package not installed. Install with: pip install ultralytics")
                self.model = None
            except Exception as e:
                logging.error(f"Failed to load YOLO model from {self.model_path}: {e}")
                self.model = None
        else:
            logging.warning("No YOLO model found. Will use mock detection mode.")
    
    def detect_items(self, image: Image.Image) -> Dict[str, Any]:
        """
        Detect items in shelf image using YOLO
        
        Args:
            image: PIL Image of the shelf
            
        Returns:
            Dictionary with detection results
        """
        if self.model is None:
            return self._mock_detection(image)
        
        try:
            # Convert PIL to numpy array for YOLO
            img_array = np.array(image)
            
            # Run YOLO detection
            results = self.model(img_array, verbose=False)
            
            # Process results
            detections = []
            total_confidence = 0.0
            
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for box in boxes:
                        # Get bounding box coordinates
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                        
                        # Get confidence and class
                        confidence = float(box.conf[0].cpu().numpy())
                        class_id = int(box.cls[0].cpu().numpy())
                        class_name = self.model.names[class_id]
                        
                        # Calculate area
                        area = (x2 - x1) * (y2 - y1)
                        
                        detections.append({
                            "name": class_name,
                            "bbox": [int(x1), int(y1), int(x2), int(y2)],
                            "confidence": confidence,
                            "area": area
                        })
                        
                        total_confidence += confidence
            
            # Group detections by class
            class_groups = {}
            for det in detections:
                name = det["name"]
                if name not in class_groups:
                    class_groups[name] = []
                class_groups[name].append(det)
            
            # Calculate stock percentages for each class
            results = []
            for class_name, class_dets in class_groups.items():
                # Calculate stock percentage using counting method
                stock_percent = calculate_stock_percentage(len(class_dets), class_name)
                
                # Calculate average confidence for this class
                avg_confidence = sum(det["confidence"] for det in class_dets) / len(class_dets)
                
                results.append({
                    "name": class_name,
                    "percent_full": stock_percent,
                    "confidence": avg_confidence,
                    "method": "counting",
                    "detection_count": len(class_dets),
                "status": get_stock_status(stock_percent, class_name),
                "recommendation": get_recommendation(stock_percent, class_name),
                    "detections": class_dets
                })
            
            return {
                "status": "success",
                "model": "YOLOv11x",
                "total_detections": len(detections),
                "classes": results,
                "average_confidence": total_confidence / len(detections) if detections else 0.0
            }
            
        except Exception as e:
            logging.error(f"Error in YOLO detection: {e}")
            return self._mock_detection(image)
    
    def _calculate_stock_percentage_counting(self, detections: List[Dict]) -> float:
        """
        Calculate stock percentage using counting method
        
        Args:
            detections: List of detections for a specific class
            
        Returns:
            Stock percentage (0-100)
        """
        if not detections:
            return 0.0
        
        # This is a simplified approach - in production you'd want to:
        # 1. Define expected shelf capacity for each product type
        # 2. Use historical data to determine "full" vs "empty" thresholds
        # 3. Consider shelf dimensions and product sizes
        
        # For now, we'll use a heuristic based on detection count
        detection_count = len(detections)
        
        # Assume typical shelf capacity ranges (these would be configurable)
        typical_capacities = {
            "banana": 20,
            "apple": 15,
            "orange": 12,
            "milk": 8,
            "bread": 6,
            "person": 1,  # YOLO detects people too
            "default": 10
        }
        
        # Get expected capacity for this class
        class_name = detections[0]["name"].lower()
        expected_capacity = typical_capacities.get(class_name, typical_capacities["default"])
        
        # Calculate percentage
        stock_percent = min(100.0, (detection_count / expected_capacity) * 100)
        
        return round(stock_percent, 1)
    
    def _mock_detection(self, image: Image.Image) -> Dict[str, Any]:
        """
        Mock detection for testing when YOLO model is not available
        
        Args:
            image: PIL Image
            
        Returns:
            Mock detection results
        """
        # Create mock detections for demonstration
        mock_detections = [
            {
                "name": "banana",
                "bbox": [50, 100, 150, 200],
                "confidence": 0.85,
                "area": 10000
            },
            {
                "name": "banana",
                "bbox": [160, 100, 260, 200],
                "confidence": 0.82,
                "area": 10000
            },
            {
                "name": "apple",
                "bbox": [300, 100, 400, 200],
                "confidence": 0.78,
                "area": 10000
            }
        ]
        
        # Group by class
        class_groups = {}
        for det in mock_detections:
            name = det["name"]
            if name not in class_groups:
                class_groups[name] = []
            class_groups[name].append(det)
        
        # Calculate results
        results = []
        for class_name, class_dets in class_groups.items():
            stock_percent = calculate_stock_percentage(len(class_dets), class_name)
            avg_confidence = sum(det["confidence"] for det in class_dets) / len(class_dets)
            
            results.append({
                "name": class_name,
                "percent_full": stock_percent,
                "confidence": avg_confidence,
                "method": "counting",
                "detection_count": len(class_dets),
                "status": get_stock_status(stock_percent, class_name),
                "recommendation": get_recommendation(stock_percent, class_name),
                "detections": class_dets
            })
        
        return {
            "status": "mock",
            "model": "YOLOv11x (Mock)",
            "total_detections": len(mock_detections),
            "classes": results,
            "average_confidence": 0.82
        }
