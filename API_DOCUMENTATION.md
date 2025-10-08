# CyberNeural-IDS API Documentation

## Overview
CyberNeural-IDS is an advanced Intrusion Detection System API that uses deep learning to analyze network traffic and detect potential security threats.

## Base URL
```
http://localhost:5000
```

## Authentication
Currently, no authentication is required (suitable for prototype/development).

---

## Endpoints

### 1. Home / Service Info
Get basic service information and available endpoints.

**Endpoint:** `GET /`

**Response:**
```json
{
  "service": "CyberNeural-IDS",
  "version": "1.0.0",
  "status": "active",
  "message": "CyberNeural-IDS API is running",
  "endpoints": {
    "/": "GET - Service information",
    "/health": "GET - Health check and system status",
    "/models": "GET - Model information and versions",
    "/predict_csv": "POST - Upload CSV file for malicious detection analysis"
  },
  "timestamp": "2025-10-08T10:30:00.000000"
}
```

---

### 2. Health Check
Check the health status of the API and all components.

**Endpoint:** `GET /health`

**Response (Success - 200):**
```json
{
  "status": "healthy",
  "service": "CyberNeural-IDS",
  "version": "1.0.0",
  "models_loaded": true,
  "timestamp": "2025-10-08T10:30:00.000000",
  "components": {
    "autoencoder": true,
    "cnn_lstm": true,
    "scaler": true,
    "label_encoder": true
  }
}
```

**Response (Error - 503):**
```json
{
  "status": "unhealthy",
  "models_loaded": false,
  ...
}
```

---

### 3. Model Information
Get detailed information about the loaded ML models.

**Endpoint:** `GET /models`

**Response (200):**
```json
{
  "service": "CyberNeural-IDS",
  "version": "1.0.0",
  "models": {
    "autoencoder": {
      "type": "Autoencoder",
      "purpose": "Anomaly detection for unknown attacks",
      "threshold": 0.02,
      "input_shape": [null, 122],
      "output_shape": [null, 122]
    },
    "cnn_lstm": {
      "type": "CNN-LSTM Hybrid",
      "purpose": "Multi-class attack classification",
      "input_shape": [null, 1, 122],
      "output_shape": [null, 5],
      "classes": ["normal", "dos", "probe", "r2l", "u2r"]
    }
  },
  "preprocessing": {
    "scaler": "StandardScaler",
    "features": 122,
    "categorical_columns": ["protocol_type", "service", "flag"]
  },
  "timestamp": "2025-10-08T10:30:00.000000"
}
```

---

### 4. Predict / Analyze CSV
Upload a CSV file containing network traffic data for intrusion detection analysis.

**Endpoint:** `POST /predict_csv`

**Content-Type:** `multipart/form-data`

**Request Body:**
- `file`: CSV file (required)
  - Max size: 50MB
  - Format: CSV with required columns: `protocol_type`, `service`, `flag`
  - Must contain at least 1 data row

**Example Request (cURL):**
```bash
curl -X POST http://localhost:5000/predict_csv \
  -F "file=@network_traffic.csv"
```

**Response (Success - 200):**
```json
{
  "status": "success",
  "message": "Analysis completed successfully.",
  "summary": {
    "total_samples": 1000,
    "unknown_attacks": 15,
    "normal": 850,
    "attack_breakdown": {
      "normal": 850,
      "dos": 80,
      "probe": 35,
      "r2l": 12,
      "u2r": 8
    },
    "confidence": {
      "average": 0.9234,
      "min": 0.6123,
      "max": 0.9987
    },
    "metadata": {
      "processing_time_seconds": 2.456,
      "model_version": "1.0.0",
      "threshold": 0.02,
      "timestamp": "2025-10-08T10:30:00.000000",
      "filename": "network_traffic.csv"
    }
  }
}
```

**Response (Error - 400 Bad Request):**
```json
{
  "error": "Invalid CSV structure",
  "message": "Missing required columns: protocol_type, service"
}
```

**Response (Error - 503 Service Unavailable):**
```json
{
  "error": "Models not loaded",
  "message": "Service is unavailable. Models failed to load."
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 400  | Bad Request - Invalid input |
| 503  | Service Unavailable - Models not loaded |
| 500  | Internal Server Error |

---

## Error Messages

### Common Errors:
- **No file uploaded**: No file was included in the request
- **Invalid file format**: File is not a CSV
- **File size exceeds limit**: File is larger than 50MB
- **Missing required columns**: CSV doesn't have required columns
- **Empty file**: CSV contains no data
- **Models not loaded**: Backend models failed to load

---

## CSV File Format

### Required Columns:
- `protocol_type` (string): Network protocol (e.g., tcp, udp, icmp)
- `service` (string): Network service (e.g., http, ftp, smtp)
- `flag` (string): Connection status flag

### Example CSV:
```csv
protocol_type,service,flag,duration,src_bytes,dst_bytes
tcp,http,SF,0,181,5450
udp,domain,SF,0,42,42
tcp,ftp,S0,0,0,0
```

### Notes:
- Additional columns are allowed and will be processed
- One-hot encoding is automatically applied to categorical columns
- Feature scaling is handled automatically

---

## Rate Limiting
Currently not implemented. Suitable for prototype/development environments.

---

## Monitoring & Logging
All requests are logged with timestamps, processing times, and results.
Logs are written to `app.log` in the application directory.

---

## Development

### Installation:
```bash
pip install -r requirements.txt
```

### Running:
```bash
python app.py
```

### Environment Variables:
Copy `.env.example` to `.env` and customize settings.

---

## Version History

### v1.0.0 (2025-10-08)
- Initial prototype release
- Autoencoder for anomaly detection
- CNN-LSTM for attack classification
- RESTful API endpoints
- Comprehensive error handling
- Health check and monitoring
