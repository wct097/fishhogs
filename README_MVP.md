# Fishing Tracker MVP

## Project Overview

This is the MVP implementation of the Fishing Tracker app, an offline-first mobile application for recording fishing sessions with GPS tracking, photo capture, and catch logging.

## Project Structure

```
/fishhogs
├── /app/           # React Native mobile app (TypeScript)
├── /server/        # FastAPI backend (Python)
├── /specs/         # Product specifications
├── /scripts/       # Development scripts
└── /docs/          # Documentation
```

## Tech Stack

### Backend
- FastAPI (Python)
- SQLAlchemy + SQLite/PostgreSQL
- JWT Authentication
- Mock S3 for local development

### Mobile App
- React Native (bare) with TypeScript
- SQLite for offline storage
- React Navigation
- Zustand for state management
- React Query for data fetching

## Getting Started

### Backend Setup

1. **Install Python dependencies:**
```bash
cd server
pip install -r requirements.txt
```

2. **Create `.env` file:**
```bash
cp .env.example .env
# Edit .env with your settings
```

3. **Start the backend server:**
```bash
./run.sh
# OR manually:
python -c "from app.database import engine, Base; Base.metadata.create_all(bind=engine)"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

### Mobile App Setup

1. **Install dependencies:**
```bash
cd app
npm install
# OR
yarn install
```

2. **iOS Setup (Mac only):**
```bash
cd ios
pod install
```

3. **Android Setup:**
- Ensure Android Studio is installed
- Open `android` folder in Android Studio
- Sync gradle files

4. **Run the app:**

For iOS:
```bash
npx react-native run-ios
```

For Android:
```bash
npx react-native run-android
```

## Features Implemented

### Backend (FastAPI)
✅ JWT Authentication (register, login, refresh, password reset)
✅ Sync endpoints (/sync/up, /sync/down)
✅ Photo management with mock presigned URLs
✅ Database models for users, sessions, track points, catches, photos
✅ Rate limiting (simplified)
✅ Error codes (4001-4003, 5001)

### Mobile App (React Native)
✅ Authentication screens (Login, Register)
✅ Session management (start/stop)
✅ GPS tracking service (5-minute intervals)
✅ Catch logging with species, measurements
✅ Session history view
✅ Session detail view with catches and track points
✅ Offline-first SQLite database
✅ Sync queue for background sync
✅ Settings screen with sync controls

## Key Architecture

### Offline-First Design
- All data written to local SQLite first
- Sync queue tracks changes for upload
- Background sync when network available
- Conflict resolution using Last-Write-Wins

### GPS Tracking
- Records location every 5 minutes during active session
- Background-safe implementation
- Battery-optimized sampling

### Data Sync
- Upload local changes via `/sync/up`
- Download server changes via `/sync/down`
- Handles conflicts and retries
- Batch limits: 500 track points per sync

## Testing the MVP

### 1. Backend Testing
```bash
# Start backend server
cd server && ./run.sh

# Test endpoints with curl or Postman:
# Register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 2. Mobile App Testing
1. Start the app on simulator/device
2. Register a new account
3. Start a fishing session
4. App will track GPS every 5 minutes
5. Log catches with species and measurements
6. Stop session and view in history
7. Test sync functionality

## Platform-Specific Notes

### iOS
- Background location requires Info.plist permissions
- Location indicator shown when tracking
- Requires Xcode for building

### Android
- Foreground service for GPS tracking
- Notification shown during active session
- Requires Android Studio for building

## Known Limitations (MVP)

- Photo capture not fully implemented (UI present, capture disabled)
- Maps not implemented (future feature)
- Social features not included
- Advanced analytics not included
- Email verification not actually sending emails
- Using mock S3 storage (local filesystem)

## Environment Variables

### Backend (.env)
```
DATABASE_URL=sqlite:///./fishing_tracker.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE=5242880
```

### Mobile App
Update `API_BASE_URL` in:
- `app/src/services/sync.ts`
- `app/src/stores/authStore.ts`

For production, change from `http://localhost:8000` to your server URL.

## Development Commands

### Backend
```bash
# Run server
cd server && ./run.sh

# Run with specific host/port
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Database migrations (if using Alembic)
alembic init alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### Mobile App
```bash
# Install dependencies
npm install

# Start Metro bundler
npx react-native start

# Run on iOS
npx react-native run-ios

# Run on Android
npx react-native run-android

# Clear cache
npx react-native start --reset-cache
```

## Troubleshooting

### Backend Issues
- **Port already in use:** Kill process on port 8000 or use different port
- **Database errors:** Delete `fishing_tracker.db` and restart
- **Import errors:** Ensure virtual environment is activated

### Mobile App Issues
- **Build fails:** Clean and rebuild (`cd android && ./gradlew clean`)
- **Metro bundler issues:** Clear cache with `--reset-cache`
- **iOS pod issues:** `cd ios && pod install`
- **Android gradle issues:** Sync in Android Studio

## Next Steps

1. Implement photo capture with react-native-vision-camera
2. Add real S3 integration for photo storage
3. Implement offline map tiles
4. Add data export functionality
5. Implement email verification
6. Add push notifications
7. Performance optimizations
8. Comprehensive testing

## License

MIT