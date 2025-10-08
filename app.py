"""
CyberNeural-IDS Flask API
Advanced Intrusion Detection System using Deep Learning
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import tensorflow as tf
import joblib
import logging
import time
from datetime import datetime
from pathlib import Path
from werkzeug.utils import secure_filename
import os

# Import configuration
from config import (
    APP_NAME, APP_VERSION, DEBUG_MODE, HOST, PORT,
    MAX_FILE_SIZE_MB, ALLOWED_EXTENSIONS, RECONSTRUCTION_THRESHOLD,
    AE_MODEL_PATH, CNN_LSTM_MODEL_PATH, SCALER_PATH, LABEL_ENCODER_PATH,
    ERROR_MESSAGES, SUCCESS_MESSAGES, LOG_LEVEL, LOG_FORMAT,
    CATEGORICAL_COLUMNS, CORS_ORIGINS
)

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format=LOG_FORMAT,
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=CORS_ORIGINS)
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE_MB * 1024 * 1024  # Set max file size

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=CORS_ORIGINS)
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE_MB * 1024 * 1024  # Set max file size

# Global variables for models
ae_model = None
cnn_lstm_model = None
scaler = None
le_attack = None
models_loaded = False

def load_models():
    """Load all ML models and preprocessing objects with error handling"""
    global ae_model, cnn_lstm_model, scaler, le_attack, models_loaded
    
    try:
        logger.info("Loading machine learning models...")
        
        # Check if model files exist
        if not AE_MODEL_PATH.exists():
            raise FileNotFoundError(f"Autoencoder model not found at {AE_MODEL_PATH}")
        if not CNN_LSTM_MODEL_PATH.exists():
            raise FileNotFoundError(f"CNN-LSTM model not found at {CNN_LSTM_MODEL_PATH}")
        if not SCALER_PATH.exists():
            raise FileNotFoundError(f"Scaler not found at {SCALER_PATH}")
        if not LABEL_ENCODER_PATH.exists():
            raise FileNotFoundError(f"Label encoder not found at {LABEL_ENCODER_PATH}")
        
        # Load models
        ae_model = tf.keras.models.load_model(str(AE_MODEL_PATH), compile=False)
        logger.info(f"✓ Autoencoder model loaded successfully")
        
        cnn_lstm_model = tf.keras.models.load_model(str(CNN_LSTM_MODEL_PATH))
        logger.info(f"✓ CNN-LSTM model loaded successfully")
        
        scaler = joblib.load(str(SCALER_PATH))
        logger.info(f"✓ Scaler loaded successfully")
        
        le_attack = joblib.load(str(LABEL_ENCODER_PATH))
        logger.info(f"✓ Label encoder loaded successfully")
        
        models_loaded = True
        logger.info("All models loaded successfully! 🚀")
        return True
        
    except Exception as e:
        logger.error(f"Error loading models: {str(e)}")
        models_loaded = False
        return False

def allowed_file(filename):
    """Check if the uploaded file has an allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_csv_structure(df):
    """Validate that the CSV has the required structure"""
    # Check if dataframe is empty
    if df.empty:
        return False, "CSV file is empty"
    
    # Check for required columns
    missing_cols = [col for col in CATEGORICAL_COLUMNS if col not in df.columns]
    if missing_cols:
        return False, f"Missing required columns: {', '.join(missing_cols)}"
    
    # Check for minimum rows
    if len(df) < 1:
        return False, "CSV file must contain at least one data row"
    
    return True, "Valid"

# Load models on startup
logger.info(f"Starting {APP_NAME} v{APP_VERSION}")
load_models()

# Load models on startup
logger.info(f"Starting {APP_NAME} v{APP_VERSION}")
load_models()

# API Routes

@app.route('/')
def home():
    """API home endpoint with service information"""
    return jsonify({
        "service": APP_NAME,
        "version": APP_VERSION,
        "status": "active" if models_loaded else "error - models not loaded",
        "message": "CyberNeural-IDS API is running",
        "endpoints": {
            "/": "GET - Service information",
            "/health": "GET - Health check and system status",
            "/models": "GET - Model information and versions",
            "/predict_csv": "POST - Upload CSV file for malicious detection analysis"
        },
        "timestamp": datetime.now().isoformat()
    }), 200 if models_loaded else 503

@app.route('/health')
def health_check():
    """Health check endpoint"""
    health_status = {
        "status": "healthy" if models_loaded else "unhealthy",
        "service": APP_NAME,
        "version": APP_VERSION,
        "models_loaded": models_loaded,
        "timestamp": datetime.now().isoformat(),
        "components": {
            "autoencoder": ae_model is not None,
            "cnn_lstm": cnn_lstm_model is not None,
            "scaler": scaler is not None,
            "label_encoder": le_attack is not None
        }
    }
    
    status_code = 200 if models_loaded else 503
    logger.info(f"Health check: {health_status['status']}")
    return jsonify(health_status), status_code

@app.route('/models')
def model_info():
    """Get information about loaded models"""
    if not models_loaded:
        return jsonify({
            "error": "Models not loaded",
            "message": "Models failed to load on startup"
        }), 503
    
    try:
        info = {
            "service": APP_NAME,
            "version": APP_VERSION,
            "models": {
                "autoencoder": {
                    "type": "Autoencoder",
                    "purpose": "Anomaly detection for unknown attacks",
                    "threshold": RECONSTRUCTION_THRESHOLD,
                    "input_shape": ae_model.input_shape if ae_model else None,
                    "output_shape": ae_model.output_shape if ae_model else None
                },
                "cnn_lstm": {
                    "type": "CNN-LSTM Hybrid",
                    "purpose": "Multi-class attack classification",
                    "input_shape": cnn_lstm_model.input_shape if cnn_lstm_model else None,
                    "output_shape": cnn_lstm_model.output_shape if cnn_lstm_model else None,
                    "classes": le_attack.classes_.tolist() if le_attack else []
                }
            },
            "preprocessing": {
                "scaler": "StandardScaler",
                "features": len(scaler.feature_names_in_) if scaler else 0,
                "categorical_columns": CATEGORICAL_COLUMNS
            },
            "timestamp": datetime.now().isoformat()
        }
        return jsonify(info), 200
    except Exception as e:
        logger.error(f"Error getting model info: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/predict_csv', methods=['POST'])
def predict_csv():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    try:
        df = pd.read_csv(file)

        cat_cols = ['protocol_type','service','flag']
        df = pd.get_dummies(df, columns=cat_cols)

        train_columns = scaler.feature_names_in_
        for col in train_columns:
            if col not in df.columns:
                df[col] = 0
        df = df[train_columns]

        X_scaled = scaler.transform(df.values)

        X_recon = ae_model.predict(X_scaled)
        recon_error = np.mean(np.power(X_scaled - X_recon, 2), axis=1)
        unknown_flags = recon_error > threshold

        X_seq = X_scaled.reshape(X_scaled.shape[0], 1, X_scaled.shape[1])
        y_pred_prob = cnn_lstm_model.predict(X_seq)
        y_pred_classes = np.argmax(y_pred_prob, axis=1)
        y_pred_labels = le_attack.inverse_transform(y_pred_classes)

        summary = {'total_samples': len(df)}
        summary['unknown_attacks'] = int(np.sum(unknown_flags))

        known_mask = ~unknown_flags
        known_labels = y_pred_labels[known_mask]

        unique, counts = np.unique(known_labels, return_counts=True)
        for u, c in zip(unique, counts):
            if u != 'normal':
                summary[f'known_attack_{u}'] = int(c)

        summary['normal'] = int(np.sum(known_labels == 'normal'))

        return jsonify({"summary": summary})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
