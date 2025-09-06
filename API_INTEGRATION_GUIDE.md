# 🚀 Pentavision API Integration Guide

## Overview
This guide shows how to integrate the Pentavision Hybrid AI system directly into your dashboard without any scripts.

## 🔌 API Endpoints

### 1. Analyze Shelf Image
**POST** `/analyze_shelf`

**Purpose**: Main endpoint for shelf analysis - receives image, returns complete analysis

**Request**:
```javascript
const formData = new FormData();
formData.append('file', imageFile);

const response = await fetch('http://localhost:8000/analyze_shelf', {
    method: 'POST',
    body: formData
});
```

**Response**:
```json
{
    "status": "success",
    "message": "Shelf analysis completed successfully",
    "data": {
        "status": "combined",
        "total_classes": 1,
        "classes": [
            {
                "name": "banana",
                "final_percent_full": 33.3,
                "final_confidence": 0.66,
                "status": "warning",
                "method": "hybrid_combined"
            }
        ],
        "summary": {
            "average_stock_percent": 33.3,
            "critical_items": 0,
            "warning_items": 1,
            "ok_items": 0
        }
    },
    "timestamp": "2024-08-29T15:30:00",
    "processing_time": 2.45
}
```

### 2. Get Plotting Data
**POST** `/get_plotting_data`

**Purpose**: Returns data optimized for charts and graphs

**Request**:
```javascript
const formData = new FormData();
formData.append('file', imageFile);

const response = await fetch('http://localhost:8000/get_plotting_data', {
    method: 'POST',
    body: formData
});
```

**Response**:
```json
{
    "status": "success",
    "data": {
        "plotting_data": {
            "stock_levels": {
                "labels": ["banana"],
                "percentages": [33.3],
                "confidences": [0.66]
            },
            "status_distribution": {
                "labels": ["OK", "Warning", "Critical"],
                "values": [0, 1, 0]
            }
        }
    }
}
```

### 3. Check Model Status
**GET** `/models/status`

**Purpose**: Check if AI models are ready

**Request**:
```javascript
const response = await fetch('http://localhost:8000/models/status');
const status = await response.json();
```

### 4. Health Check
**GET** `/healthz`

**Purpose**: Basic API health check

## 🎯 Dashboard Integration Examples

### React Component Example
```jsx
import React, { useState } from 'react';

function ShelfAnalyzer() {
    const [image, setImage] = useState(null);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const analyzeShelf = async () => {
        if (!image) return;
        
        setLoading(true);
        const formData = new FormData();
        formData.append('file', image);
        
        try {
            const response = await fetch('/analyze_shelf', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            setResults(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setImage(e.target.files[0])} 
            />
            <button onClick={analyzeShelf} disabled={loading}>
                {loading ? 'Analyzing...' : 'Analyze Shelf'}
            </button>
            
            {results && (
                <div>
                    <h3>Results:</h3>
                    {results.data.classes.map(cls => (
                        <div key={cls.name}>
                            {cls.name}: {cls.final_percent_full}% full
                            <div style={{
                                width: '100%',
                                height: '20px',
                                backgroundColor: '#eee',
                                borderRadius: '3px'
                            }}>
                                <div style={{
                                    width: `${cls.final_percent_full}%`,
                                    height: '100%',
                                    backgroundColor: cls.status === 'critical' ? '#f44336' : 
                                                   cls.status === 'warning' ? '#ff9800' : '#4caf50',
                                    borderRadius: '3px'
                                }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
```

### Vue.js Component Example
```vue
<template>
    <div>
        <input type="file" @change="handleFileSelect" accept="image/*" />
        <button @click="analyzeShelf" :disabled="loading">
            {{ loading ? 'Analyzing...' : 'Analyze Shelf' }}
        </button>
        
        <div v-if="results">
            <h3>Analysis Results:</h3>
            <div v-for="cls in results.data.classes" :key="cls.name">
                <strong>{{ cls.name }}</strong>: {{ cls.final_percent_full }}% full
                <div class="stock-bar" :style="{ width: cls.final_percent_full + '%' }"></div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            image: null,
            results: null,
            loading: false
        };
    },
    methods: {
        handleFileSelect(event) {
            this.image = event.target.files[0];
        },
        async analyzeShelf() {
            if (!this.image) return;
            
            this.loading = true;
            const formData = new FormData();
            formData.append('file', this.image);
            
            try {
                const response = await fetch('/analyze_shelf', {
                    method: 'POST',
                    body: formData
                });
                this.results = await response.json();
            } catch (error) {
                console.error('Error:', error);
            } finally {
                this.loading = false;
            }
        }
    }
};
</script>
```

## 🔧 Configuration

### Environment Variables
```bash
export MODEL_PATH="/path/to/qwen2.5-vl"
export MEDIA_DIR="~/pentavision/media"
```

### Shelf Configuration
Edit `api/shelf_config.py` to adjust:
- Product capacities
- Warning thresholds
- Critical thresholds

## 🚀 Getting Started

1. **Start the API server**:
   ```bash
   cd ~/pentavision
   ./start_backend.sh
   ```

2. **Test with the example dashboard**:
   - Open `dashboard_integration_example.html` in your browser
   - Upload an image and test the endpoints

3. **Integrate into your dashboard**:
   - Use the API endpoints directly
   - Handle responses and display results
   - Implement error handling and loading states

## 📊 Response Data Structure

### Stock Level Statuses
- **OK**: Stock > 50%
- **Warning**: Stock 20-50%
- **Critical**: Stock < 20%

### Confidence Scores
- **High**: 0.8-1.0
- **Medium**: 0.6-0.8
- **Low**: 0.4-0.6

## 🎯 Best Practices

1. **Always check model status** before sending images
2. **Implement proper error handling** for failed requests
3. **Show loading states** during analysis
4. **Cache results** when possible to avoid re-analysis
5. **Handle large images** by resizing if needed
6. **Implement retry logic** for network issues

## 🔍 Troubleshooting

### Common Issues
- **Model not loaded**: Check `/models/status` endpoint
- **Image upload fails**: Verify file type and size
- **Analysis errors**: Check server logs in `logs/api.log`
- **CORS issues**: Ensure CORS middleware is configured

### Debug Mode
Enable detailed logging by setting log level in the API.
