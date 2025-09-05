# Project Context: Fishing Tracker App

## Project Overview

**Project Name**: Fishing Tracker (fishhogs)
**Type**: Mobile Application
**Platforms**: iOS & Android (single codebase)
**Purpose**: Offline-first mobile app for anglers to record fishing sessions with GPS tracking, photo capture, and catch logging

## Core Functionality

### Session Management
- Start/stop fishing sessions with automatic timestamping
- Background-safe GPS sampling every 5 minutes during active sessions
- Offline-first local storage with opportunistic sync
- Session pause/resume (post-MVP, new session for now)

### Data Capture
- **GPS Tracking**: Record location points every 5 minutes (lat/lon/timestamp/accuracy)
- **Photos**: Capture and geotag photos during sessions
- **Catches**: Log species, length, weight, notes with automatic location/timestamp
- **Session Notes**: Optional waterbody and session notes

### Sync & Storage
- Local-first SQLite database for offline functionality
- Background sync when network available (configurable Wi-Fi/cellular)
- Conflict resolution for multi-device scenarios
- Data export capabilities

## Technical Architecture

### Technology Stack
- **Framework**: React Native (bare) - Chosen for background location support
- **Local Database**: SQLite with sync_queue table
- **State Management**: React Context/Redux (TBD)
- **Backend**: FastAPI (Python) with JWT authentication
- **Database**: PostgreSQL with PITR backups
- **Cloud Storage**: S3 for photos with CloudFront CDN
- **Maps**: MapBox with offline tiles (optional in MVP)

### Key Components
1. **Session Service**: Manages active session lifecycle
2. **Location Service**: Background GPS tracking with battery optimization
3. **Sync Engine**: Handles offline/online data synchronization
4. **Photo Manager**: Captures, stores, and syncs photos
5. **Data Store**: Local database abstraction layer

### Platform Considerations
- **iOS**: Background location permissions, App Transport Security
- **Android**: Foreground service for reliable background tracking
- **Battery Optimization**: Careful GPS sampling to preserve battery
- **Storage**: Efficient photo storage and compression

## Development Priorities

### MVP Features
1. Basic session start/stop functionality
2. GPS tracking with 5-minute intervals
3. Photo capture with geotags
4. Catch logging with essential fields
5. Offline storage and basic sync
6. Session history view

### Future Enhancements
- Advanced mapping with offline tiles
- Social sharing features
- Analytics and insights
- Weather integration
- Tide charts
- Species identification AI
- Export to common fishing log formats

## Data Model

### Core Entities
- **Session**: id, start_time, end_time, waterbody, notes, sync_status
- **TrackPoint**: id, session_id, timestamp, latitude, longitude, accuracy, speed, heading
- **Photo**: id, session_id, timestamp, latitude, longitude, file_path, sync_status
- **Catch**: id, session_id, timestamp, latitude, longitude, species, length, weight, notes
- **User**: id, name, email, preferences, auth_token

### Sync Strategy
- Each entity has sync_status and last_modified fields
- Optimistic UI updates with eventual consistency
- Conflict resolution: last-write-wins with server timestamp authority
- Batch uploads for efficiency

## User Experience Principles

### Core UX Goals
- **Simplicity**: Minimal taps to log critical data while fishing
- **Reliability**: Never lose data due to connectivity issues
- **Clarity**: Always show tracking status and sync state
- **Speed**: Quick photo capture and catch entry

### Key User Flows
1. **Start Session**: One tap to begin tracking
2. **Log Catch**: Quick entry with smart defaults
3. **Take Photo**: In-app camera with auto-geotag
4. **End Session**: Clear summary with sync status
5. **Review History**: Visual timeline with map and photos

## Testing Strategy

### Critical Test Scenarios
- Background GPS tracking across app states
- Offline mode with extended no-connectivity periods
- Sync conflict resolution
- Battery drain during long sessions
- Permission handling and recovery
- Cross-platform consistency

### Performance Targets
- Session start: < 2 seconds
- Photo capture: < 3 seconds
- Catch entry: < 5 seconds
- GPS fix acquisition: < 30 seconds
- Battery impact: < 5% per hour of tracking

## Security & Privacy

### Data Protection
- Local database encryption
- Secure API communication (HTTPS/TLS)
- JWT token management with refresh
- Photo EXIF data handling
- GDPR compliance for location data

### User Privacy
- Explicit location permission requests
- Clear data usage policies
- Optional anonymous mode
- Data export and deletion capabilities

## Development Guidelines

### Code Organization
```
/src
  /components     # Reusable UI components
  /screens        # Screen-level components
  /services       # Business logic and APIs
  /models         # Data models and types
  /utils          # Helper functions
  /hooks          # Custom React hooks (if React Native)
  /store          # State management
  /navigation     # Navigation configuration
```

### Naming Conventions
- Components: PascalCase (e.g., SessionCard)
- Files: kebab-case (e.g., session-card.tsx)
- Functions: camelCase (e.g., startSession)
- Constants: UPPER_SNAKE_CASE (e.g., GPS_INTERVAL)

### Git Workflow
- Feature branches: `feature/description`
- Bug fixes: `fix/description`
- Commits: Conventional commits format
- PR reviews required before merge

## External Dependencies

### Key Libraries (React Native)
- Location: react-native-geolocation-service or expo-location
- Camera: react-native-camera or expo-camera
- Maps: react-native-maps or mapbox
- Database: react-native-sqlite-storage or Realm
- Sync: Custom implementation or WatermelonDB
- Analytics: Firebase or Amplitude

### API Integrations
- Weather API for conditions logging
- Species database for identification
- Map tile server for offline maps
- Cloud storage for photo backup

## Deployment & Distribution

### Build Pipeline
- Automated testing on PR
- Beta distribution via TestFlight/Play Console
- Production releases monthly
- Hotfix process for critical bugs

### Monitoring
- Crash reporting (Sentry/Crashlytics)
- Analytics for feature usage
- Performance monitoring
- User feedback collection

## Project Status

**Current Phase**: Ready for Implementation (Spec v0.3 Complete)
**Next Milestone**: React Native project initialization and backend setup
**Framework Decision**: React Native (bare) chosen
**Backend Decision**: FastAPI (Python) with PostgreSQL
**Timeline**: MVP in 3 months, full release in 6 months

### Immediate Next Steps
1. Initialize React Native bare project
2. Set up iOS/Android development environments
3. Create SQLite schema with sync_queue
4. Implement session management
5. Build GPS background service
6. Set up backend API structure
7. Implement authentication (JWT)
8. Create sync engine

## Resources

- [Product Spec](../specs/fishing_tracker_spec.md) - v0.3 Production Ready
- [API Documentation](../docs/api/README.md) (when available)
- [Design System](../docs/design/README.md) (when available)
- [Testing Guide](../docs/testing/README.md) (when available)