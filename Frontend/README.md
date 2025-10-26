# 🎯 AI Stock - Complete Frontend & Backend System

## Overview
AI Stock is a comprehensive stock monitoring system that combines a **React frontend** with an **AI-powered backend** for real-time supermarket shelf monitoring. The system uses **YOLOv11x** object detection and **Qwen2.5-VL-72B-Instruct** validation.

## 🏗️ Architecture
- **Frontend**: React + TypeScript + Vite (Magic Patterns template)
- **Backend**: FastAPI with hybrid AI system
- **Level 1**: YOLOv11x detects items and calculates stock percentages
- **Level 2**: Qwen2.5-VL-72B-Instruct validates results and provides explanations
- **Hybrid Combiner**: Intelligently merges both model outputs

## 🚀 Quick Start

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
The frontend will be available at `http://localhost:5173`

### Backend Setup
```bash
# Install Python dependencies
cd Backend
pip install -r requirements.txt

# Set environment variables
export MODEL_PATH="/data/shared/nobackup/Qwen2.5-VL-72B-Instruct"
export MEDIA_DIR="/home/ad/21802548/pentavision/Backend/media"

# Start the API server
./start_backend.sh
```
The backend will be available at `http://localhost:8000`

### Test the System
```bash
curl -X POST "http://localhost:8000/analyze_shelf" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@datasets/empty_banana.jpg"
```

## 📁 Project Structure
```
AI_stock/
├── src/                      # Frontend React application
│   ├── components/          # React components
│   ├── pages/               # Page components
│   ├── lib/                 # Utilities
│   └── firebase.ts          # Firebase configuration
├── Backend/                 # Backend application
│   ├── api/                # Core API modules
│   │   ├── main.py         # FastAPI server
│   │   ├── yolo_detector.py # YOLOv11x detection
│   │   ├── qwen_validator.py # Qwen2.5-VL-72B-Instruct validation
│   │   ├── hybrid_combiner.py # Result combination
│   │   ├── hybrid_analyzer.py # Main orchestrator
│   │   ├── shelf_config.py # Shelf configuration
│   │   └── qwen_vl_utils.py # Qwen utilities
│   ├── requirements.txt    # Python dependencies
│   └── start_backend.sh    # Backend startup script
├── datasets/                # Test images
├── docs/                    # Documentation
├── package.json            # Frontend dependencies
├── vite.config.ts          # Vite configuration
└── README.md               # This file
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
### Frontend
- ✅ Modern React dashboard
- ✅ Stock level monitoring
- ✅ Inventory management
- ✅ Charts and analytics
- ✅ Individual produce pages
- ✅ Reports and settings

### Backend
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
- Enhanced UI/UX
