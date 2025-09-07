"""
Qwen2.5-VL Validation Module for Pentavision
Level 2: Validates YOLO results and provides explanations
"""

import logging
from typing import List, Dict, Any, Tuple
from PIL import Image
import torch
import json
import re

class QwenValidator:
    def __init__(self, model, processor):
        """
        Initialize Qwen validator
        
        Args:
            model: Loaded Qwen2.5-VL model
            processor: Qwen processor
        """
        self.model = model
        self.processor = processor
        self.logger = logging.getLogger(__name__)
    
    def validate_yolo_results(self, image: Image.Image, yolo_results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate YOLO results using Qwen2.5-VL
        
        Args:
            image: PIL Image of the shelf
            yolo_results: Results from YOLO detection
            
        Returns:
            Validation results with explanations
        """
        if not self.model or not self.processor:
            return self._mock_validation(yolo_results)
        
        try:
            # Extract YOLO classes for validation
            yolo_classes = yolo_results.get("classes", [])
            
            # Validate each class
            validated_classes = []
            for yolo_class in yolo_classes:
                validation_result = self._validate_single_class(image, yolo_class)
                validated_classes.append(validation_result)
            
            return {
                "status": "success",
                "model": "Qwen2.5-VL",
                "classes": validated_classes,
                "total_validated": len(validated_classes)
            }
            
        except Exception as e:
            self.logger.error(f"Error in Qwen validation: {e}")
            return self._mock_validation(yolo_results)
    
    def _validate_single_class(self, image: Image.Image, yolo_class: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate a single class detection
        """
        try:
            class_name = yolo_class.get("name", "unknown")
            yolo_percent = yolo_class.get("percent_full", 0.0)
            yolo_confidence = yolo_class.get("confidence", 0.0)
            
            # Create prompt for validation
            prompt = self._create_validation_prompt(class_name, yolo_percent, yolo_confidence)
            
            # Process with Qwen
            response = self._process_with_qwen(image, prompt)
            
            # Parse the response
            validation_result = self._parse_validation_response(response, yolo_class)
            
            return validation_result
            
        except Exception as e:
            self.logger.error(f"Error validating class {yolo_class.get('name', 'unknown')}: {e}")
            return self._create_fallback_validation(yolo_class)
    
    def _create_validation_prompt(self, class_name: str, yolo_percent: float, yolo_confidence: float) -> str:
        """
        Create a prompt for Qwen to validate YOLO results
        """
        prompt = f"""You are validating shelf stock estimates for a supermarket monitoring system.

Given the shelf image and YOLO detection results below, analyze the image and return JSON with:
- validated_percent_full (0-100): Your estimate of how full the shelf is
- agreement (true/false): Whether you agree with YOLO's estimate
- severity ("ok"|"warn"|"critical"): How urgent the restocking need is
- reason (<= 20 words): Brief explanation of your assessment

YOLO detected {class_name} at {yolo_percent}% fullness with {yolo_confidence:.2f} confidence.

Focus on the {class_name} items in the image. Look for:
- Visible gaps or empty spaces
- Density of items
- Overall shelf coverage
- Any obvious detection errors

Return only valid JSON in this format:
{{
  "validated_percent_full": <number>,
  "agreement": <true/false>,
  "severity": "<ok/warn/critical>",
  "reason": "<brief explanation>"
}}"""
        
        return prompt
    
    def _process_with_qwen(self, image: Image.Image, prompt: str) -> str:
        """
        Process image and prompt with Qwen2.5-VL
        """
        try:
            # Create messages in the proper Qwen2.5-VL format
            messages = [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "image": image,
                            "min_pixels": 224*224,
                            "max_pixels": 512*512
                        },
                        {
                            "type": "text",
                            "text": prompt
                        }
                    ]
                }
            ]
            
            # Apply chat template
            text = self.processor.apply_chat_template(
                messages, tokenize=False, add_generation_prompt=True
            )
            
            # Process vision inputs
            from .qwen_vl_utils import process_vision_info
            image_inputs, video_inputs = process_vision_info(messages)
            
            # Prepare inputs for the model
            inputs = self.processor(
                text=[text],
                images=image_inputs,
                videos=video_inputs,
                padding=True,
                return_tensors="pt"
            )
            
            # Move inputs to the same device as the model
            device = next(self.model.parameters()).device
            inputs = {k: v.to(device) for k, v in inputs.items()}
            
            # Generate response
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=128,
                    temperature=0.0,
                    do_sample=False,
                    early_stopping=True,
                    pad_token_id=self.processor.tokenizer.eos_token_id
                )
            
            # Decode the response
            generated_ids_trimmed = [
                out_ids[len(in_ids):] for in_ids, out_ids in zip(inputs.input_ids, outputs)
            ]
            response = self.processor.batch_decode(
                generated_ids_trimmed, 
                skip_special_tokens=True, 
                clean_up_tokenization_spaces=False
            )[0]
            
            return response
            
        except Exception as e:
            self.logger.error(f"Error processing with Qwen: {e}")
            return ""
    
    def _parse_validation_response(self, response: str, yolo_class: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse Qwen's validation response
        """
        try:
            # Try to extract JSON from response
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                validation_data = json.loads(json_str)
                
                return {
                    "name": yolo_class.get("name", "unknown"),
                    "validated_percent_full": validation_data.get("validated_percent_full", 0),
                    "agreement": validation_data.get("agreement", False),
                    "severity": validation_data.get("severity", "ok"),
                    "reason": validation_data.get("reason", ""),
                    "raw_response": response
                }
            else:
                # Fallback parsing if JSON extraction fails
                return self._fallback_parsing(response, yolo_class)
                
        except Exception as e:
            self.logger.error(f"Error parsing validation response: {e}")
            return self._create_fallback_validation(yolo_class)
    
    def _fallback_parsing(self, response: str, yolo_class: Dict[str, Any]) -> Dict[str, Any]:
        """
        Fallback parsing if JSON extraction fails
        """
        # Try to extract percentage from text
        percent_match = re.search(r'(\d+(?:\.\d+)?)\s*%', response)
        validated_percent = float(percent_match.group(1)) if percent_match else yolo_class.get("percent_full", 0)
        
        # Determine agreement based on percentage difference
        yolo_percent = yolo_class.get("percent_full", 0)
        agreement = abs(validated_percent - yolo_percent) < 20  # Within 20% = agreement
        
        # Determine severity based on stock level
        if validated_percent < 10:
            severity = "critical"
        elif validated_percent < 30:
            severity = "warn"
        else:
            severity = "ok"
        
        return {
            "name": yolo_class.get("name", "unknown"),
            "validated_percent_full": validated_percent,
            "agreement": agreement,
            "severity": severity,
            "reason": f"Parsed from text: {response[:50]}...",
            "raw_response": response
        }
    
    def _create_fallback_validation(self, yolo_class: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create fallback validation when Qwen processing fails
        """
        yolo_percent = yolo_class.get("percent_full", 0)
        
        return {
            "name": yolo_class.get("name", "unknown"),
            "validated_percent_full": yolo_percent,
            "agreement": True,  # Assume agreement as fallback
            "severity": "ok" if yolo_percent > 30 else "warn",
            "reason": "Fallback validation - Qwen processing failed",
            "raw_response": "Fallback"
        }
    
    def _mock_validation(self, yolo_results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Mock validation for testing when Qwen model is not available
        """
        yolo_classes = yolo_results.get("classes", [])
        validated_classes = []
        
        for yolo_class in yolo_classes:
            yolo_percent = yolo_class.get("percent_full", 0)
            
            # Mock validation logic
            if yolo_percent < 20:
                agreement = False
                severity = "critical"
                reason = "Shelf appears nearly empty"
            elif yolo_percent < 50:
                agreement = True
                severity = "warn"
                reason = "Moderate stock level"
            else:
                agreement = True
                severity = "ok"
                reason = "Adequate stock level"
            
            validated_classes.append({
                "name": yolo_class.get("name", "unknown"),
                "validated_percent_full": yolo_percent,
                "agreement": agreement,
                "severity": severity,
                "reason": reason,
                "raw_response": "Mock validation"
            })
        
        return {
            "status": "mock",
            "model": "Qwen2.5-VL (Mock)",
            "classes": validated_classes,
            "total_validated": len(validated_classes)
        }
