#!/bin/bash

echo "🎣 Fishing Tracker Android Test Script"
echo "======================================"
echo ""

# Check if backend is running
echo "1. Checking backend server..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "   ✅ Backend is running"
else
    echo "   ❌ Backend is not running. Please start it first."
    exit 1
fi

# Check Node/npm
echo ""
echo "2. Checking Node.js environment..."
node_version=$(node --version)
npm_version=$(npm --version)
echo "   Node: $node_version"
echo "   npm: $npm_version"

# Check if dependencies are installed
echo ""
echo "3. Checking React Native dependencies..."
if [ -d "node_modules" ]; then
    echo "   ✅ Dependencies installed"
else
    echo "   ❌ Dependencies not installed. Running npm install..."
    npm install
fi

# Create Android local.properties if needed
echo ""
echo "4. Setting up Android configuration..."
mkdir -p android/app/src/main/assets
touch android/app/src/main/assets/index.android.bundle

# Bundle JavaScript for Android
echo ""
echo "5. Bundling JavaScript..."
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res

echo ""
echo "======================================"
echo "Setup complete! To run the app:"
echo ""
echo "For Android Emulator:"
echo "  npx react-native run-android"
echo ""
echo "For Metro bundler (in separate terminal):"
echo "  npx react-native start"
echo ""
echo "Backend health check URLs:"
echo "  http://localhost:8000/health"
echo "  http://localhost:8000/api/health"
echo ""