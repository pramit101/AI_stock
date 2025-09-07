"""
Hybrid AI Analyzer for Pentavision
Orchestrates YOLOv11x detection and Qwen2.5-VL validation
"""

import logging
from typing import List, Dict, Any, Tuple
from PIL import Image
import os

from .yolo_detector import YOLODetector
from .qwen_validator import QwenValidator
from .hybrid_combiner import HybridCombiner

class HybridAnalyzer:
    def __init__(self, qwen_model=None, qwen_processor=None):
        """
        Initialize the hybrid analyzer
        
        Args:
            qwen_model: Loaded Qwen2.5-VL model
            qwen_processor: Qwen processor
        """
        self.logger = logging.getLogger(__name__)
        
        # Initialize YOLO detector
        self.yolo_detector = YOLODetector()
        
        # Initialize Qwen validator
        self.qwen_validator = QwenValidator(qwen_model, qwen_processor)
        
        # Initialize hybrid combiner
        self.hybrid_combiner = HybridCombiner()
        
        self.logger.info("Hybrid Analyzer initialized successfully")
    
    def analyze_shelf_image(self, image: Image.Image) -> Dict[str, Any]:
        """
        Analyze shelf image using hybrid AI approach
        
        Args:
            image: PIL Image of the shelf
            
        Returns:
            Complete analysis results ready for plotting
        """
        try:
            self.logger.info("Starting hybrid shelf analysis...")
            
            # Step 1: YOLO Detection (Level 1)
            self.logger.info("Running YOLOv11x detection...")
            yolo_results = self.yolo_detector.detect_items(image)
            self.logger.info(f"YOLO detection complete: {yolo_results.get('total_detections', 0)} detections")
            
            # Step 2: Qwen Validation (Level 2)
            self.logger.info("Running Qwen2.5-VL validation...")
            qwen_results = self.qwen_validator.validate_yolo_results(image, yolo_results)
            self.logger.info(f"Qwen validation complete: {qwen_results.get('total_validated', 0)} classes validated")
            
            # Step 3: Combine Results
            self.logger.info("Combining results using hybrid algorithm...")
            combined_results = self.hybrid_combiner.combine_results(yolo_results, qwen_results)
            self.logger.info("Hybrid combination complete")
            
            # Add metadata
            combined_results["analysis_metadata"] = {
                "yolo_model": yolo_results.get("model", "Unknown"),
                "qwen_model": qwen_results.get("model", "Unknown"),
                "yolo_status": yolo_results.get("status", "Unknown"),
                "qwen_status": qwen_results.get("status", "Unknown"),
                "processing_time": "N/A"  # Could add timing if needed
            }
            
            return combined_results
            
        except Exception as e:
            self.logger.error(f"Error in hybrid analysis: {e}")
            return {
                "status": "error",
                "error": str(e),
                "timestamp": self._get_timestamp()
            }
    
    def get_plotting_data(self, analysis_results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract data optimized for plotting and visualization
        
        Args:
            analysis_results: Results from hybrid analysis
            
        Returns:
            Data formatted for plotting
        """
        try:
            if analysis_results.get("status") != "combined":
                return {"error": "Invalid analysis results"}
            
            classes = analysis_results.get("classes", [])
            
            # Extract data for different plot types
            plotting_data = {
                "stock_levels": {
                    "labels": [cls.get("name", "unknown") for cls in classes],
                    "percentages": [cls.get("final_percent_full", 0) for cls in classes],
                    "confidences": [cls.get("final_confidence", 0) for cls in classes]
                },
                "status_distribution": {
                    "labels": ["OK", "Warning", "Critical"],
                    "values": [
                        len([cls for cls in classes if cls.get("status") == "ok"]),
                        len([cls for cls in classes if cls.get("status") == "warning"]),
                        len([cls for cls in classes if cls.get("status") == "critical"])
                    ]
                },
                "model_comparison": {
                    "labels": [cls.get("name", "unknown") for cls in classes],
                    "yolo_percentages": [cls.get("yolo_percent", 0) for cls in classes if cls.get("yolo_percent") is not None],
                    "qwen_percentages": [cls.get("qwen_validated_percent", 0) for cls in classes if cls.get("qwen_validated_percent") is not None],
                    "final_percentages": [cls.get("final_percent_full", 0) for cls in classes]
                },
                "confidence_analysis": {
                    "labels": [cls.get("name", "unknown") for cls in classes],
                    "yolo_confidences": [cls.get("yolo_confidence", 0) for cls in classes if cls.get("yolo_confidence") is not None],
                    "qwen_confidences": [cls.get("final_confidence", 0) for cls in classes if cls.get("qwen_validated_percent") is not None]
                },
                "summary_stats": analysis_results.get("summary", {}),
                "recommendations": analysis_results.get("summary", {}).get("recommendations", [])
            }
            
            return plotting_data
            
        except Exception as e:
            self.logger.error(f"Error extracting plotting data: {e}")
            return {"error": f"Failed to extract plotting data: {str(e)}"}
    
    def _get_timestamp(self) -> str:
        """
        Get current timestamp
        """
        from datetime import datetime
        return datetime.now().isoformat()
