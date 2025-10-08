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
    """
    Analyze CSV file for network intrusion detection
    Returns detailed analysis with attack classifications
    """
    start_time = time.time()
    
    # Check if models are loaded
    if not models_loaded:
        logger.error("Prediction attempted but models not loaded")
        return jsonify({
            "error": "Models not loaded",
            "message": "Service is unavailable. Models failed to load."
        }), 503
    
    # Validate file upload
    if 'file' not in request.files:
        logger.warning("No file in request")
        return jsonify({"error": ERROR_MESSAGES['NO_FILE']}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        logger.warning("Empty filename")
        return jsonify({"error": ERROR_MESSAGES['EMPTY_FILE']}), 400
    
    # Validate file extension
    if not allowed_file(file.filename):
        logger.warning(f"Invalid file format: {file.filename}")
        return jsonify({"error": ERROR_MESSAGES['INVALID_FORMAT']}), 400
    
    filename = secure_filename(file.filename)
    logger.info(f"Processing file: {filename}")
    
    try:
        # Read CSV file
        df = pd.read_csv(file)
        logger.info(f"CSV loaded: {len(df)} rows, {len(df.columns)} columns")
        
        # Validate CSV structure
        is_valid, validation_message = validate_csv_structure(df)
        if not is_valid:
            logger.error(f"CSV validation failed: {validation_message}")
            return jsonify({
                "error": "Invalid CSV structure",
                "message": validation_message
            }), 400
        
        # One-hot encode categorical columns
        df_encoded = pd.get_dummies(df, columns=CATEGORICAL_COLUMNS)
        logger.info(f"Encoded features: {len(df_encoded.columns)} columns")
        
        # Align with training columns
        train_columns = scaler.feature_names_in_
        for col in train_columns:
            if col not in df_encoded.columns:
                df_encoded[col] = 0
        df_encoded = df_encoded[train_columns]
        
        # Scale features
        X_scaled = scaler.transform(df_encoded.values)
        logger.info("Features scaled successfully")
        
        # Autoencoder prediction for anomaly detection
        X_recon = ae_model.predict(X_scaled, verbose=0)
        recon_error = np.mean(np.power(X_scaled - X_recon, 2), axis=1)
        unknown_flags = recon_error > RECONSTRUCTION_THRESHOLD
        logger.info(f"Anomaly detection: {np.sum(unknown_flags)} unknown attacks detected")
        
        # CNN-LSTM prediction for known attack classification
        X_seq = X_scaled.reshape(X_scaled.shape[0], 1, X_scaled.shape[1])
        y_pred_prob = cnn_lstm_model.predict(X_seq, verbose=0)
        y_pred_classes = np.argmax(y_pred_prob, axis=1)
        y_pred_labels = le_attack.inverse_transform(y_pred_classes)
        
        # Calculate confidence scores
        confidence_scores = np.max(y_pred_prob, axis=1)
        avg_confidence = float(np.mean(confidence_scores))
        
        # Build comprehensive summary
        known_mask = ~unknown_flags
        known_labels = y_pred_labels[known_mask]
        
        # Count each attack type
        unique, counts = np.unique(known_labels, return_counts=True)
        attack_breakdown = {}
        for attack_type, count in zip(unique, counts):
            attack_breakdown[str(attack_type)] = int(count)
        
        # Calculate processing time
        processing_time = time.time() - start_time
        
        # Build response
        summary = {
            'total_samples': len(df),
            'unknown_attacks': int(np.sum(unknown_flags)),
            'normal': attack_breakdown.get('normal', 0),
            'attack_breakdown': attack_breakdown,
            'confidence': {
                'average': round(avg_confidence, 4),
                'min': round(float(np.min(confidence_scores)), 4),
                'max': round(float(np.max(confidence_scores)), 4)
            },
            'metadata': {
                'processing_time_seconds': round(processing_time, 3),
                'model_version': APP_VERSION,
                'threshold': RECONSTRUCTION_THRESHOLD,
                'timestamp': datetime.now().isoformat(),
                'filename': filename
            }
        }
        
        logger.info(f"Analysis completed in {processing_time:.2f}s - "
                   f"{summary['total_samples']} samples, "
                   f"{summary.get('normal', 0)} normal, "
                   f"{summary['unknown_attacks']} unknown attacks")
        
        return jsonify({
            "status": "success",
            "message": SUCCESS_MESSAGES['PREDICTION_SUCCESS'],
            "summary": summary
        }), 200
        
    except pd.errors.EmptyDataError:
        logger.error("Empty CSV file")
        return jsonify({
            "error": ERROR_MESSAGES['EMPTY_FILE'],
            "message": "The CSV file contains no data"
        }), 400
        
    except pd.errors.ParserError as e:
        logger.error(f"CSV parsing error: {str(e)}")
        return jsonify({
            "error": ERROR_MESSAGES['PROCESSING_ERROR'],
            "message": f"Failed to parse CSV file: {str(e)}"
        }), 400
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}", exc_info=True)
        return jsonify({
            "error": ERROR_MESSAGES['MODEL_ERROR'],
            "message": str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True)
