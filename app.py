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

# Load models & preprocessing
ae_model = tf.keras.models.load_model('models/ae_model.h5', compile=False)
cnn_lstm_model = tf.keras.models.load_model('models/cnn_lstm_model.h5')
scaler = joblib.load('models/scaler.save')
le_attack = joblib.load('models/le_attack.save')

threshold = 0.02

@app.route('/')
def home():
    return jsonify({
        "message": "CyberNeural-IDS API is running",
        "endpoints": {
            "/predict_csv": "POST - Upload CSV file for malicious detection analysis"
        },
        "status": "active"
    })

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
