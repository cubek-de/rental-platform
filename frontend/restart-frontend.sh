#!/bin/bash

echo "🛑 Stopping frontend server..."
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

echo "✅ Frontend stopped"
echo "🚀 Starting frontend with updated .env..."

npm run dev
