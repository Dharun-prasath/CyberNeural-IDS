"""
Configuration file for CyberNeural-IDS
Contains all application settings, paths, and constants
"""
import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).parent

# Model paths
MODEL_DIR = BASE_DIR / 'models'
AE_MODEL_PATH = MODEL_DIR / 'ae_model.h5'
CNN_LSTM_MODEL_PATH = MODEL_DIR / 'cnn_lstm_model.h5'
SCALER_PATH = MODEL_DIR / 'scaler.save'
LABEL_ENCODER_PATH = MODEL_DIR / 'le_attack.save'

# Application settings
APP_NAME = "CyberNeural-IDS"
APP_VERSION = "1.0.0"
DEBUG_MODE = os.getenv('DEBUG', 'True').lower() == 'true'
HOST = os.getenv('HOST', '127.0.0.1')
PORT = int(os.getenv('PORT', 5000))

# File upload settings
MAX_FILE_SIZE_MB = 50  # Maximum file size in MB
ALLOWED_EXTENSIONS = {'csv'}
UPLOAD_TIMEOUT = 300  # seconds

# Model settings
RECONSTRUCTION_THRESHOLD = 0.02
CONFIDENCE_THRESHOLD = 0.5
BATCH_SIZE = 32

# Logging settings
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
LOG_FILE = BASE_DIR / 'app.log'

# CORS settings
CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*')

# Required CSV columns (base columns before one-hot encoding)
REQUIRED_COLUMNS = ['protocol_type', 'service', 'flag']
CATEGORICAL_COLUMNS = ['protocol_type', 'service', 'flag']

# Response messages
ERROR_MESSAGES = {
    'NO_FILE': 'No file uploaded. Please select a CSV file.',
    'EMPTY_FILE': 'The uploaded file is empty.',
    'INVALID_FORMAT': 'Invalid file format. Only CSV files are allowed.',
    'FILE_TOO_LARGE': f'File size exceeds the maximum limit of {MAX_FILE_SIZE_MB}MB.',
    'MISSING_COLUMNS': 'CSV file is missing required columns.',
    'MODEL_ERROR': 'Error during model prediction. Please try again.',
    'PROCESSING_ERROR': 'Error processing the file. Please check the file format.',
}

SUCCESS_MESSAGES = {
    'PREDICTION_SUCCESS': 'Analysis completed successfully.',
    'HEALTH_CHECK': 'All systems operational.',
}
