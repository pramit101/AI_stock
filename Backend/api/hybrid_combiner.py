"""
Hybrid AI Combination Algorithm for Pentavision
Combines YOLOv11x (Level 1) and Qwen2.5-VL (Level 2) outputs
"""

import logging
from typing import List, Dict, Any, Tuple
from PIL import Image
import json

class HybridCombiner:
    def __init__(self):
        """
        Initialize the hybrid combination algorithm
        """
        self.logger = logging.getLogger(__name__)
    
    def combine_results(self, yolo_results: Dict[str, Any], qwen_results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Combine YOLO and Qwen results using the hybrid algorithm
        
        Args:
            yolo_results: Results from YOLOv11x detection
            qwen_results: Results from Qwen2.5-VL validation
            
        Returns:
            Combined results ready for plotting
        """
        try:
            # Extract YOLO classes
            yolo_classes = yolo_results.get("classes", [])
            qwen_classes = qwen_results.get("classes", [])
            
            # Create a mapping of class names for matching
            yolo_class_map = {cls["name"].lower(): cls for cls in yolo_classes}
            qwen_class_map = {cls["name"].lower(): cls for cls in qwen_classes}
            
            # Combine results for each class
            combined_classes = []
            
            # Process classes detected by YOLO
            for yolo_class in yolo_classes:
                class_name = yolo_class["name"].lower()
                
                if class_name in qwen_class_map:
                    # Both models detected this class - combine results
                    combined_result = self._combine_class_results(yolo_class, qwen_class_map[class_name])
                else:
                    # Only YOLO detected this class - use YOLO results with validation
                    combined_result = self._combine_class_results(yolo_class, None)
                
                combined_classes.append(combined_result)
            
            # Process classes only detected by Qwen (if any)
            for qwen_class in qwen_classes:
                class_name = qwen_class["name"].lower()
                if class_name not in yolo_class_map:
                    # Only Qwen detected this class - use Qwen results
                    combined_result = self._combine_class_results(None, qwen_class)
                    combined_classes.append(combined_result)
            
            # Create final combined output
            combined_results = {
                "status": "combined",
                "timestamp": self._get_timestamp(),
                "models_used": {
                    "yolo": yolo_results.get("model", "Unknown"),
                    "qwen": qwen_results.get("model", "Unknown")
                },
                "total_classes": len(combined_classes),
                "classes": combined_classes,
                "summary": self._generate_summary(combined_classes)
            }
            
            return combined_results
            
        except Exception as e:
            self.logger.error(f"Error combining results: {e}")
            return {
                "status": "error",
                "error": str(e),
                "timestamp": self._get_timestamp()
            }
    
    def _combine_class_results(self, yolo_class: Dict[str, Any], qwen_class: Dict[str, Any]) -> Dict[str, Any]:
        """
        Combine results for a single class
        
        Args:
            yolo_class: YOLO detection results for this class
            qwen_class: Qwen validation results for this class
            
        Returns:
            Combined class results
        """
        if yolo_class and qwen_class:
            # Both models have results - combine them
            return self._combine_both_models(yolo_class, qwen_class)
        elif yolo_class:
            # Only YOLO has results
            return self._combine_yolo_only(yolo_class)
        elif qwen_class:
            # Only Qwen has results
            return self._combine_qwen_only(qwen_class)
        else:
            # Neither model has results (shouldn't happen)
            return {"error": "No results from either model"}
    
    def _combine_both_models(self, yolo_class: Dict[str, Any], qwen_class: Dict[str, Any]) -> Dict[str, Any]:
        """
        Combine results when both models have detected the same class
        """
        # Extract key values
        yolo_percent = yolo_class.get("percent_full", 0.0)
        yolo_confidence = yolo_class.get("confidence", 0.0)
        qwen_percent = qwen_class.get("validated_percent_full", 0.0)
        qwen_agreement = qwen_class.get("agreement", False)
        qwen_severity = qwen_class.get("severity", "ok")
        qwen_reason = qwen_class.get("reason", "")
        
        # Calculate combined confidence using weighted average
        # YOLO confidence is based on detection quality
        # Qwen confidence is based on agreement and severity
        qwen_confidence = self._calculate_qwen_confidence(qwen_agreement, qwen_severity)
        
        # Weighted average of percentages
        # If Qwen agrees, give it more weight
        if qwen_agreement:
            combined_percent = (yolo_percent * 0.4 + qwen_percent * 0.6)
            combined_confidence = (yolo_confidence * 0.4 + qwen_confidence * 0.6)
        else:
            # If Qwen disagrees, use YOLO with Qwen's correction
            combined_percent = qwen_percent  # Trust Qwen's validation
            combined_confidence = (yolo_confidence * 0.7 + qwen_confidence * 0.3)
        
        # Determine final status
        if qwen_severity == "critical":
            status = "critical"
        elif qwen_severity == "warn":
            status = "warning"
        else:
            status = "ok"
        
        return {
            "name": yolo_class.get("name", qwen_class.get("name", "unknown")),
            "final_percent_full": round(combined_percent, 1),
            "final_confidence": round(combined_confidence, 3),
            "yolo_percent": yolo_percent,
            "yolo_confidence": yolo_confidence,
            "qwen_validated_percent": qwen_percent,
            "qwen_agreement": qwen_agreement,
            "qwen_severity": qwen_severity,
            "qwen_reason": qwen_reason,
            "status": status,
            "method": "hybrid_combined"
        }
    
    def _combine_yolo_only(self, yolo_class: Dict[str, Any]) -> Dict[str, Any]:
        """
        Combine results when only YOLO has detected this class
        """
        return {
            "name": yolo_class.get("name", "unknown"),
            "final_percent_full": yolo_class.get("percent_full", 0.0),
            "final_confidence": yolo_class.get("confidence", 0.0),
            "yolo_percent": yolo_class.get("percent_full", 0.0),
            "yolo_confidence": yolo_class.get("confidence", 0.0),
            "qwen_validated_percent": None,
            "qwen_agreement": None,
            "qwen_severity": "unknown",
            "qwen_reason": "Class not detected by Qwen",
            "status": "yolo_only",
            "method": "yolo_only"
        }
    
    def _combine_qwen_only(self, qwen_class: Dict[str, Any]) -> Dict[str, Any]:
        """
        Combine results when only Qwen has detected this class
        """
        return {
            "name": qwen_class.get("name", "unknown"),
            "final_percent_full": qwen_class.get("validated_percent_full", 0.0),
            "final_confidence": self._calculate_qwen_confidence(
                qwen_class.get("agreement", False),
                qwen_class.get("severity", "ok")
            ),
            "yolo_percent": None,
            "yolo_confidence": None,
            "qwen_validated_percent": qwen_class.get("validated_percent_full", 0.0),
            "qwen_agreement": qwen_class.get("agreement", False),
            "qwen_severity": qwen_class.get("severity", "ok"),
            "qwen_reason": qwen_class.get("reason", ""),
            "status": "qwen_only",
            "method": "qwen_only"
        }
    
    def _calculate_qwen_confidence(self, agreement: bool, severity: str) -> float:
        """
        Calculate confidence score for Qwen results
        """
        base_confidence = 0.8 if agreement else 0.6
        
        # Adjust based on severity
        if severity == "ok":
            return base_confidence
        elif severity == "warn":
            return base_confidence * 0.8
        elif severity == "critical":
            return base_confidence * 0.6
        else:
            return base_confidence * 0.7
    
    def _generate_summary(self, combined_classes: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate summary statistics for plotting
        """
        if not combined_classes:
            return {}
        
        # Calculate overall statistics
        total_percent = sum(cls.get("final_percent_full", 0) for cls in combined_classes)
        avg_percent = total_percent / len(combined_classes)
        
        # Count by status
        status_counts = {}
        for cls in combined_classes:
            status = cls.get("status", "unknown")
            status_counts[status] = status_counts.get(status, 0) + 1
        
        # Find critical items
        critical_items = [cls for cls in combined_classes if cls.get("status") == "critical"]
        warning_items = [cls for cls in combined_classes if cls.get("status") == "warning"]
        
        return {
            "average_stock_percent": round(avg_percent, 1),
            "total_items": len(combined_classes),
            "critical_items": len(critical_items),
            "warning_items": len(warning_items),
            "ok_items": len([cls for cls in combined_classes if cls.get("status") == "ok"]),
            "status_distribution": status_counts,
            "recommendations": self._generate_recommendations(combined_classes)
        }
    
    def _generate_recommendations(self, combined_classes: List[Dict[str, Any]]) -> List[str]:
        """
        Generate actionable recommendations based on results
        """
        recommendations = []
        
        # Check for critical items
        critical_items = [cls for cls in combined_classes if cls.get("status") == "critical"]
        if critical_items:
            recommendations.append(f"Immediate restocking needed for {len(critical_items)} items")
        
        # Check for low stock
        low_stock_items = [cls for cls in combined_classes if cls.get("final_percent_full", 100) < 20]
        if low_stock_items:
            recommendations.append(f"Low stock alert: {len(low_stock_items)} items below 20%")
        
        # Check for high confidence discrepancies
        high_discrepancy = [cls for cls in combined_classes 
                           if cls.get("qwen_agreement") == False and cls.get("yolo_confidence", 0) > 0.8]
        if high_discrepancy:
            recommendations.append(f"Review needed: {len(high_discrepancy)} items with high confidence discrepancies")
        
        if not recommendations:
            recommendations.append("All shelves appear to be adequately stocked")
        
        return recommendations
    
    def _get_timestamp(self) -> str:
        """
        Get current timestamp
        """
        from datetime import datetime
        return datetime.now().isoformat()
