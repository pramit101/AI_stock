"""
Utility functions for Qwen2.5-VL model processing
"""
import logging
from typing import List, Dict, Any, Optional
from PIL import Image
import torch
import json
import re

def process_vision_info(messages, return_video_kwargs=False):
    """
    Process vision information from messages using qwen-vl-utils approach
    This is a simplified version that handles basic image processing
    """
    try:
        image_inputs = []
        video_inputs = None
        video_kwargs = {}
        
        for message in messages:
            if isinstance(message, dict) and "content" in message:
                content = message["content"]
                if isinstance(content, list):
                    for item in content:
                        if isinstance(item, dict) and "type" in item:
                            if item["type"] == "image" and "image" in item:
                                # Handle image input
                                if isinstance(item["image"], str):
                                    if item["image"].startswith("file://"):
                                        # Local file path
                                        image_path = item["image"][7:]  # Remove "file://"
                                        try:
                                            image = Image.open(image_path)
                                            image_inputs.append(image)
                                        except Exception as e:
                                            logging.error(f"Error loading image {image_path}: {e}")
                                    else:
                                        # URL or base64 - for now, we'll skip these
                                        logging.warning(f"URL/base64 images not yet implemented: {item['image']}")
                                elif hasattr(item["image"], 'size'):  # PIL Image object
                                    image_inputs.append(item["image"])
                            elif item["type"] == "video" and "video" in item:
                                # Handle video input - simplified for now
                                logging.info("Video processing not yet implemented")
                                video_inputs = []
                                video_kwargs = {"fps": [2.0]}  # Default FPS
        
        if return_video_kwargs:
            return image_inputs, video_inputs, video_kwargs
        return image_inputs, video_inputs
        
    except Exception as e:
        logging.error(f"Error in process_vision_info: {e}")
        return [], None

def analyze_shelf_image(model, processor, image: Image.Image):
    """
    Analyze shelf image and return structured data about item name, fullness, and confidence
    Using the proper Qwen2.5-VL message format
    """
    try:
        # Create messages in the proper Qwen2.5-VL format
        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "image": image, "min_pixels": 224*224, "max_pixels": 512*512
                    },
                    {
                        "type": "text",
                        "text": "Analyze this shelf image. What item is on the shelf and what percentage is filled? Respond with: name, percentage (0-100), confidence (0.0-1.0), and brief explanation."
                    }
                ]
            }
        ]
        
        # Apply chat template
        text = processor.apply_chat_template(
            messages, tokenize=False, add_generation_prompt=True
        )
        
        # Process vision inputs
        image_inputs, video_inputs = process_vision_info(messages)
        
        # Prepare inputs for the model
        inputs = processor(
            text=[text],
            images=image_inputs,
            videos=video_inputs,
            padding=True,
            return_tensors="pt"
        )
        
        # Move inputs to the same device as the model
        device = next(model.parameters()).device
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        # Generate response
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=128,
                temperature=0.0,
                do_sample=False, early_stopping=True, pad_token_id=processor.tokenizer.eos_token_id
            )
        
        # Decode the response
        generated_ids_trimmed = [
            out_ids[len(in_ids):] for in_ids, out_ids in zip(inputs.input_ids, outputs)
        ]
        response = processor.batch_decode(
            generated_ids_trimmed, 
            skip_special_tokens=True, 
            clean_up_tokenization_spaces=False
        )[0]
        
        # Parse the response to extract structured data
        response_lower = response.lower()
        
        # Try to identify item name
        name = "unknown"
        if "banana" in response_lower:
            name = "banana"
        elif "apple" in response_lower:
            name = "apple"
        elif "orange" in response_lower:
            name = "orange"
        elif "milk" in response_lower:
            name = "milk"
        elif "bread" in response_lower:
            name = "bread"
        
        # Try to extract percentage
        percent_match = re.search(r"(\d+(?:\.\d+)?)\s*%", response)
        percent_full = float(percent_match.group(1)) if percent_match else 0.0
        
        # Estimate confidence based on response quality
        confidence = 0.8 if percent_full > 0 else 0.5
        if len(response) > 100 and any(word in response_lower for word in ["full", "empty", "filled", "shelf"]):
            confidence = 0.9
        
        # Generate reason
        reason = f"~{percent_full}% of the {name} shelf area is filled."
        
        return {
            "name": name,
            "percent_full": percent_full,
            "confidence": confidence,
            "status": "ok",
            "reason": reason,
            "raw_response": response
        }
        
    except Exception as e:
        logging.error(f"Error in analyze_shelf_image: {e}")
        return {
            "name": "error",
            "percent_full": 0.0,
            "confidence": 0.0,
            "status": "error",
            "reason": f"Error processing image: {str(e)}"
        }

def process_text_only(model, processor, prompt: str, max_new_tokens: int = 2048, temperature: float = 0.7):
    """
    Process text-only input using Qwen2.5-VL model
    """
    try:
        # Create messages in the proper format
        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
                    }
                ]
            }
        ]
        
        # Apply chat template
        text = processor.apply_chat_template(
            messages, tokenize=False, add_generation_prompt=True
        )
        
        # Process inputs
        inputs = processor(
            text=[text],
            padding=True,
            return_tensors="pt"
        )
        
        # Move inputs to the same device as the model
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        # Generate response
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=max_new_tokens,
                temperature=temperature,
                do_sample=False, early_stopping=True, pad_token_id=processor.tokenizer.eos_token_id
            )
        
        # Decode the response
        generated_ids_trimmed = [
            out_ids[len(in_ids):] for in_ids, out_ids in zip(inputs.input_ids, outputs)
        ]
        response = processor.batch_decode(
            generated_ids_trimmed, 
            skip_special_tokens=True, 
            clean_up_tokenization_spaces=False
        )[0]
        
        return response
        
    except Exception as e:
        logging.error(f"Error in process_text_only: {e}")
        return f"Error processing text input: {str(e)}"
