#!/bin/bash
# Pentavision Backend Startup Script

echo "🚀 Starting Pentavision Hybrid AI Backend..."

# Activate virtual environment
source Backend/.venv/bin/activate

# Check if models are available
echo "🔍 Checking model availability..."
if [ -f "/data/shared/nobackup/yolov11x.pt" ]; then
    echo "✅ YOLOv11x model found"
else
    echo "⚠️  YOLOv11x model not found in /data/shared/nobackup/"
    echo "   Please download the model first"
fi

# Start the API server
echo "🌐 Starting FastAPI server on port 8000..."
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
