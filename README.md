# 🎯 Pentavision - AI-Powered Shelf Monitoring System

## Overview
Pentavision is a hybrid AI system that combines **YOLOv11x** object detection with **Qwen2.5-VL-72B-Instruct** validation to monitor supermarket shelf stock levels in real-time.

## 🏗️ Architecture
- **Level 1**: YOLOv11x detects items and calculates stock percentages
- **Level 2**: Qwen2.5-VL-72B-Instruct validates results and provides explanations
- **Hybrid Combiner**: Intelligently merges both model outputs

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd Backend
pip install -r requirements.txt
```

### 2. Set Environment Variables
```bash
export MODEL_PATH="/data/shared/nobackup/Qwen2.5-VL-72B-Instruct"
export MEDIA_DIR="/home/ad/21802548/pentavision/Backend/media"
```

### 3. Start the API Server
```bash
./start_backend.sh
```

### 4. Test the System
```bash
curl -X POST "http://localhost:8000/analyze_shelf" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@datasets/empty_banana.jpg"
```

## 📁 Project Structure
```
pentavision/
├── Backend/                 # Backend application
│   ├── api/                # Core API modules
│   │   ├── main.py         # FastAPI server
│   │   ├── yolo_detector.py # YOLOv11x detection
│   │   ├── qwen_validator.py # Qwen2.5-VL-72B-Instruct validation
│   │   ├── hybrid_combiner.py # Result combination
│   │   ├── hybrid_analyzer.py # Main orchestrator
│   │   ├── shelf_config.py # Shelf configuration
│   │   └── qwen_vl_utils.py # Qwen utilities
│   ├── .env                # Environment configuration
│   ├── requirements.txt    # Python dependencies
│   ├── start_backend.sh    # Backend startup script
│   ├── .venv/              # Python virtual environment
│   ├── media/              # Uploaded images
│   └── logs/               # Application logs
├── datasets/                # Test images
├── docs/                    # Documentation
├── start_backend.sh         # Main startup script
└── README.md                # This file
```

## 🔧 Model Configuration
The system uses models from `/data/shared/nobackup/`:

- **YOLOv11x**: `/data/shared/nobackup/yolov11x.pt`
- **Qwen2.5-VL-72B-Instruct**: `/data/shared/nobackup/Qwen2.5-VL-72B-Instruct/`

## 📊 API Endpoints
- `POST /analyze_shelf` - Complete hybrid analysis
- `POST /get_plotting_data` - Results for plotting
- `GET /models/status` - Model health check
- `GET /healthz` - API health check

## 🎯 Features
- ✅ Real-time shelf monitoring
- ✅ Hybrid AI validation (YOLOv11x + Qwen2.5-VL-72B-Instruct)
- ✅ Configurable thresholds
- ✅ Plotting-ready output
- ✅ Production-ready API
- ✅ Dashboard integration ready

## 📚 Documentation
See `docs/` folder for detailed documentation.

## 🔮 Future Enhancements
- Custom model training
- Batch processing
- Historical analysis
- Real-time streaming
