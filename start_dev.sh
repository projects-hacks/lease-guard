#!/bin/bash

# Function to kill background processes on exit
cleanup() {
    echo "Stopping services..."
    kill $(jobs -p)
    exit
}
trap cleanup SIGINT SIGTERM

echo "🚀 Starting LeaseGuard Local Dev Environment..."

# Backend Setup
echo "📦 Installing Backend Dependencies..."
cd backend
python3 -m pip uninstall -y google-generativeai # Remove legacy package to prevent conflicts
python3 -m pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Backend dependency installation failed."
    exit 1
fi

echo "🟢 Starting Backend Server..."
# Run in background
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --env-file .env &
BACKEND_PID=$!

cd ..

# Frontend Setup
echo "📦 Installing Frontend Dependencies..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Frontend dependency installation failed."
    kill $BACKEND_PID
    exit 1
fi

echo "🟢 Starting Frontend Server..."
npm run dev

# Wait for backend to finish (which is never unless killed)
wait $BACKEND_PID
