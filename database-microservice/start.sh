#!/bin/bash

# Database Microservice Startup Script

echo "🚀 Starting Database Microservice"
echo "=================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration"
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "🐍 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Run the microservice
echo "🎯 Starting microservice on http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo "🔑 Default API Key: test-api-key-12345"
echo ""
echo "Press Ctrl+C to stop the service"
echo ""

python main.py
