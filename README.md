# AI-powered Stock Level Estimation for Supermarkets

## Overview

This project aims to automate the estimation of stock levels for supermarket fresh produce using artificial intelligence and computer vision. Traditional stock monitoring is a manual and time-consuming process. Our solution leverages modern AI techniques to evaluate shelf stock levels from images or videos, helping retailers manage inventory more efficiently.

## Project Objectives

- **AI Engine (Backend)**: Detect and estimate stock levels (e.g., 20%, 50%, overstocked) for fresh produce (e.g., bananas, broccoli, onions) using camera input.
- **Web App (Frontend)**: Enable users to upload video footage or images and view the estimated stock levels via a clean, modern interface.
- **Evaluation**: Benchmark and compare different AI-based techniques for vision tasks, such as:
  - Image Segmentation (e.g., SAM)
  - Vision-Language Models (e.g., PaliGemma, Florence)
  - Monocular Depth Estimation (e.g., MiDAS, Marigold)

## Features

-  Upload interface for video/photo input
- Backend AI inference on supermarket footage
-  Output display of product stock levels (e.g., 20%, 50%, overstocked)
- Modular and maintainable code structure
-  Comprehensive documentation

## Tech Stack

- **Frontend**: React.js / HTML / CSS
- **Backend**: Python 
- **AI/ML Models**: Pre-trained models via PyTorch or TensorFlow (e.g., SAM, MiDAS)
- **Data Handling**: OpenCV, NumPy

## Team Members

| Name           | Role                        |
|----------------|-----------------------------|
| Pramit Gautam  | Developer
| Anandhu Binish | AI training             |
| Ezekiel Pretty     | Cyber Security      |
| Queen Bajracharya   | Developer      |
| Stacey Jepkemoi       | Developer  |


### Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/ai-stock-monitoring.git
   cd ai-stock-monitoring
