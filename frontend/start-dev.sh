#!/bin/bash

# Kill any process using port 5173
echo "Checking for processes using port 5173..."
PID=$(lsof -ti:5173)
if [ ! -z "$PID" ]; then
    echo "Killing process $PID using port 5173..."
    kill -9 $PID 2>/dev/null || true
    sleep 1
fi

echo "Starting Vite development server on port 5173..."
npm run dev
