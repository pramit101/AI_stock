import os, json, uuid, re, logging, io
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from PIL import Image, ImageDraw
from transformers import Qwen2_5_VLForConditionalGeneration, AutoProcessor

# ---- Paths via env ----
MODEL_PATH = os.environ.get("MODEL_PATH", "")
MEDIA_DIR = os.environ.get("MEDIA_DIR", os.path.expanduser("~/pentavision/media"))
os.makedirs(MEDIA_DIR, exist_ok=True)
LOG_DIR = os.path.expanduser("~/pentavision/logs")
os.makedirs(LOG_DIR, exist_ok=True)

# ---- Logging ----
logging.basicConfig(
    filename=os.path.join(LOG_DIR, "api.log"),
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s'
)

# ---- Model and Processor ----
model = None
processor = None
try:
    if MODEL_PATH:
        logging.info(f"Loading model from {MODEL_PATH}...")
        # Use AutoModel with trust_remote_code=True for Qwen2.5-VL
        model = Qwen2_5_VLForConditionalGeneration.from_pretrained(
            MODEL_PATH,
            torch_dtype="auto",
            device_map="auto",
        )
        # Load the processor with trust_remote_code=True
        processor = AutoProcessor.from_pretrained(
            MODEL_PATH,
            trust_remote_code=True
        )
        logging.info("Model loaded successfully.")
    else:
        logging.error("MODEL_PATH is not set. Cannot load model.")
except Exception as e:
    logging.error(f"Failed to load Qwen2.5; using mock mode. {e}")
    model = None
    processor = None

# ---- FastAPI App ----
app = FastAPI(
    title="Pentavision Hybrid AI API", 
    version="2.0.0",
    description="AI-powered supermarket shelf monitoring system with YOLOv11x + Qwen2.5-VL"
)

# Add CORS middleware to allow cross-origin requests (for dashboard)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount media directory for storing uploaded images
app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")

# --- Pydantic Models for API endpoints ---
class AnalysisResponse(BaseModel):
    status: str
    message: str
    data: Optional[dict] = None
    timestamp: str
    processing_time: Optional[float] = None

class ErrorResponse(BaseModel):
    status: str
    error: str
    timestamp: str

# --- API Endpoints ---
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Pentavision Hybrid AI API",
        "version": "2.0.0",
        "description": "AI-powered shelf monitoring system",
        "endpoints": {
            "analyze_shelf": "/analyze_shelf",
            "get_plotting_data": "/get_plotting_data",
            "models_status": "/models/status",
            "health": "/healthz"
        }
    }

@app.get("/healthz")
async def get_healthz():
    """Health check endpoint"""
    return {
        "status": "ok", 
        "model_loaded": model is not None,
        "timestamp": datetime.now().isoformat(),
        "models": {
            "yolo": "ready" if os.path.exists("/data/shared/nobackup/yolov11x.pt") else "not_found",
            "qwen": "loaded" if model is not None else "not_loaded"
        }
    }

@app.post("/analyze_shelf", response_model=AnalysisResponse)
async def analyze_shelf(file: UploadFile = File(...)):
    """
    Main endpoint for shelf analysis - used by dashboard
    
    This endpoint:
    1. Receives image from dashboard
    2. Runs YOLOv11x detection
    3. Validates with Qwen2.5-VL
    4. Combines results using hybrid algorithm
    5. Returns analysis ready for dashboard display
    """
    start_time = datetime.now()
    
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Generate unique filename
        file_id = str(uuid.uuid4())
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        filename = f"{file_id}.{file_extension}"
        file_path = os.path.join(MEDIA_DIR, filename)
        
        # Save uploaded image
        image_data = await file.read()
        with open(file_path, "wb") as f:
            f.write(image_data)
        
        # Load and process image
        image = Image.open(io.BytesIO(image_data))
        
        # Import and use the hybrid analyzer
        from .hybrid_analyzer import HybridAnalyzer
        
        # Initialize hybrid analyzer
        analyzer = HybridAnalyzer(qwen_model=model, qwen_processor=processor)
        
        # Analyze the shelf image
        result = analyzer.analyze_shelf_image(image)
        
        # Calculate processing time
        processing_time = (datetime.now() - start_time).total_seconds()
        
        # Log the analysis
        logging.info(f"Shelf analysis completed for {filename} in {processing_time:.2f}s")
        
        return AnalysisResponse(
            status="success",
            message="Shelf analysis completed successfully",
            data=result,
            timestamp=datetime.now().isoformat(),
            processing_time=processing_time
        )
        
    except Exception as e:
        logging.error(f"Error in shelf analysis: {e}")
        return JSONResponse(
            status_code=500,
            content=ErrorResponse(
                status="error",
                error=str(e),
                timestamp=datetime.now().isoformat()
            ).dict()
        )

@app.post("/get_plotting_data", response_model=AnalysisResponse)
async def get_plotting_data(file: UploadFile = File(...)):
    """
    Get shelf analysis results formatted for dashboard plotting
    
    This endpoint:
    1. Analyzes the image using hybrid AI
    2. Extracts plotting-optimized data
    3. Returns data ready for charts and graphs
    """
    start_time = datetime.now()
    
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Load and process image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        
        # Import and use the hybrid analyzer
        from .hybrid_analyzer import HybridAnalyzer
        
        # Initialize hybrid analyzer
        analyzer = HybridAnalyzer(qwen_model=model, qwen_processor=processor)
        
        # Analyze the shelf image
        analysis_results = analyzer.analyze_shelf_image(image)
        
        # Get plotting data
        plotting_data = analyzer.get_plotting_data(analysis_results)
        
        # Calculate processing time
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return AnalysisResponse(
            status="success",
            message="Plotting data extracted successfully",
            data={
                "analysis_results": analysis_results,
                "plotting_data": plotting_data
            },
            timestamp=datetime.now().isoformat(),
            processing_time=processing_time
        )
        
    except Exception as e:
        logging.error(f"Error getting plotting data: {e}")
        return JSONResponse(
            status_code=500,
            content=ErrorResponse(
                status="error",
                error=str(e),
                timestamp=datetime.now().isoformat()
            ).dict()
        )

@app.get("/models/status")
async def get_models_status():
    """Get detailed status of all AI models"""
    return {
        "status": "success",
        "timestamp": datetime.now().isoformat(),
        "models": {
            "yolo": {
                "status": "available" if os.path.exists("/data/shared/nobackup/yolov11x.pt") else "not_found",
                "model": "YOLOv11x",
                "path": "/data/shared/nobackup/yolov11x.pt",
                "size": "~115MB"
            },
            "qwen": {
                "status": "loaded" if model is not None else "not_loaded",
                "model": "Qwen2.5-VL",
                "path": MODEL_PATH,
                "memory_usage": "High (GPU recommended)"
            }
        },
        "system": {
            "hybrid_system": "ready",
            "api_version": "2.0.0",
            "endpoints": ["/analyze_shelf", "/get_plotting_data", "/models/status"]
        }
    }

@app.post("/analyze_shelf_legacy")
async def analyze_shelf_legacy(file: UploadFile = File(...)):
    """Legacy endpoint using only Qwen2.5-VL (for backward compatibility)"""
    if not model:
        raise HTTPException(status_code=503, detail="Qwen2.5-VL model not loaded")
    
    try:
        # Read and process the image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        
        # Analyze the shelf image using the specialized function
        from .qwen_vl_utils import analyze_shelf_image
        result = analyze_shelf_image(model, processor, image)
        return result
    except Exception as e:
        logging.error(f"Error in legacy shelf analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            status="error",
            error=exc.detail,
            timestamp=datetime.now().isoformat()
        ).dict()
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logging.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            status="error",
            error="Internal server error",
            timestamp=datetime.now().isoformat()
        ).dict()
    )
