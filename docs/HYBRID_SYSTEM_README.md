# Pentavision Hybrid AI System

## Overview

Pentavision is an AI-powered supermarket shelf monitoring system that uses a **hybrid approach** combining two AI models for robust stock level detection:

- **Level 1: YOLOv11x** - Object detection and counting
- **Level 2: Qwen2.5-VL** - Validation and explanation

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Shelf Image   │───▶│   YOLOv11x      │───▶│   Hybrid        │
│                 │    │   (Detection)   │    │   Combiner      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Qwen2.5-VL    │    │   Final Output  │
                       │   (Validation)  │    │   (For Plotting)│
                       └─────────────────┘    └─────────────────┘
```

## Models Used

### 1. YOLOv11x (Level 1 - Detection)
- **Purpose**: Detect individual items on shelves
- **Output**: Bounding boxes, confidence scores, stock percentages
- **Method**: Counting-based stock estimation
- **Location**: `/data/shared/nobackup/yolov11x.pt`

### 2. Qwen2.5-VL (Level 2 - Validation)
- **Purpose**: Validate YOLO results and provide explanations
- **Output**: Validated percentages, agreement flags, severity levels
- **Method**: Vision-language understanding and reasoning
- **Location**: Configured via `MODEL_PATH` environment variable

## API Endpoints

### `/analyze_shelf` (Recommended)
- **Method**: POST
- **Input**: Shelf image file
- **Output**: Complete hybrid analysis results
- **Features**: YOLO detection + Qwen validation + combination

### `/get_plotting_data`
- **Method**: POST
- **Input**: Shelf image file
- **Output**: Analysis results + plotting-optimized data
- **Features**: Ready-to-use data for charts and dashboards

### `/models/status`
- **Method**: GET
- **Output**: Status of all AI models
- **Features**: Health check for YOLO and Qwen models

## Output Format

### Combined Results Structure
```json
{
  "status": "combined",
  "timestamp": "2024-08-29T14:53:00",
  "models_used": {
    "yolo": "YOLOv11x",
    "qwen": "Qwen2.5-VL"
  },
  "total_classes": 3,
  "classes": [
    {
      "name": "banana",
      "final_percent_full": 65.0,
      "final_confidence": 0.87,
      "yolo_percent": 70.0,
      "yolo_confidence": 0.85,
      "qwen_validated_percent": 65.0,
      "qwen_agreement": false,
      "qwen_severity": "warn",
      "qwen_reason": "Visible gaps mid-shelf",
      "status": "warning",
      "method": "hybrid_combined"
    }
  ],
  "summary": {
    "average_stock_percent": 65.0,
    "total_items": 3,
    "critical_items": 0,
    "warning_items": 1,
    "ok_items": 2,
    "recommendations": [
      "Low stock alert: 1 items below 20%",
      "Review needed: 1 items with high confidence discrepancies"
    ]
  }
}
```

### Plotting Data Structure
```json
{
  "stock_levels": {
    "labels": ["banana", "apple", "orange"],
    "percentages": [65.0, 80.0, 90.0],
    "confidences": [0.87, 0.92, 0.89]
  },
  "status_distribution": {
    "labels": ["OK", "Warning", "Critical"],
    "values": [2, 1, 0]
  },
  "model_comparison": {
    "labels": ["banana", "apple", "orange"],
    "yolo_percentages": [70.0, 80.0, 90.0],
    "qwen_percentages": [65.0, 80.0, 90.0],
    "final_percentages": [65.0, 80.0, 90.0]
  }
}
```

## Algorithm Details

### Hybrid Combination Logic

1. **Agreement Case** (YOLO and Qwen agree):
   - Final percentage = 40% YOLO + 60% Qwen
   - Final confidence = 40% YOLO + 60% Qwen

2. **Disagreement Case** (YOLO and Qwen disagree):
   - Final percentage = Qwen's validated percentage
   - Final confidence = 70% YOLO + 30% Qwen

3. **YOLO Only** (Qwen didn't detect the class):
   - Final percentage = YOLO percentage
   - Final confidence = YOLO confidence
   - Status = "yolo_only"

4. **Qwen Only** (YOLO didn't detect the class):
   - Final percentage = Qwen percentage
   - Final confidence = Qwen confidence
   - Status = "qwen_only"

### Severity Levels

- **OK**: Stock level > 50%
- **Warning**: Stock level 20-50%
- **Critical**: Stock level < 20%

## Setup Instructions

### 1. Install Dependencies
```bash
pip install ultralytics transformers fastapi uvicorn pillow opencv-python
```

### 2. Download YOLOv11x Model
```bash
cd /data/shared/nobackup
python -c "
from huggingface_hub import hf_hub_download
model_path = hf_hub_download(
    repo_id='Ultralytics/YOLO11', 
    filename='yolo11x.pt', 
    cache_dir='/data/shared/nobackup'
)
print('Downloaded to:', model_path)
"
```

### 3. Set Environment Variables
```bash
export MODEL_PATH="/path/to/qwen2.5-vl"
export MEDIA_DIR="~/pentavision/media"
```

### 4. Run the API
```bash
cd ~/pentavision
source .venv/bin/activate
uvicorn api.main:app --host 0.0.0.0 --port 8000
```

## Testing

Run the test script to verify all components:
```bash
python test_hybrid_system.py
```

Expected output:
```
🎉 All tests passed! Hybrid system is ready.
```

## Benefits of Hybrid Approach

1. **Robustness**: Two AI models provide redundancy
2. **Accuracy**: Qwen validates and corrects YOLO estimates
3. **Explainability**: Natural language explanations for decisions
4. **Flexibility**: Works even if one model fails
5. **Confidence**: Combined confidence scores for better decision making

## Use Cases

- **Real-time shelf monitoring**
- **Automated restocking alerts**
- **Inventory optimization**
- **Customer experience improvement**
- **Staff efficiency enhancement**

## Troubleshooting

### YOLO Model Not Found
- Check if `/data/shared/nobackup/yolov11x.pt` exists
- Verify symbolic link is correct
- Check file permissions

### Qwen Model Not Loaded
- Verify `MODEL_PATH` environment variable
- Check model file exists and is accessible
- Ensure sufficient GPU memory

### Import Errors
- Verify all Python files are in the `api/` directory
- Check Python path includes the project directory
- Ensure virtual environment is activated

## Performance Notes

- **YOLOv11x**: ~115MB model, optimized for accuracy
- **Qwen2.5-VL**: Large model, requires significant GPU memory
- **Processing Time**: Typically 2-5 seconds per image
- **Memory Usage**: ~4-8GB GPU memory recommended

## Future Enhancements

1. **Batch Processing**: Multiple images simultaneously
2. **Historical Analysis**: Track stock trends over time
3. **Custom Training**: Fine-tune models for specific products
4. **Real-time Streaming**: Live camera feed processing
5. **Mobile App**: On-device analysis capabilities
