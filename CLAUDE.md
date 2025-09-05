# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

**Project Name**: Fishing Tracker (fishhogs)
**Purpose**: Offline-first mobile app for anglers to record fishing sessions with GPS tracking, photo capture, and catch logging
**Tech Stack**: Mobile cross-platform framework (TBD: React Native/Flutter/Expo), SQLite, REST API

## Key Architecture

### Core Components
- **Session Management**: Start/stop fishing sessions with automatic timestamping
- **GPS Tracking**: Background-safe location sampling every 5 minutes
- **Photo System**: Geotagged photo capture during sessions  
- **Catch Logging**: Species, measurements, and notes with location
- **Sync Engine**: Offline-first with opportunistic background sync
- **Local Storage**: SQLite database for offline functionality

### Data Flow
1. All data written to local database first (offline-first)
2. Background sync when network available
3. Conflict resolution using last-write-wins with server timestamps
4. Photos uploaded separately to cloud storage

## Development Guidelines

### Code Style
- Use TypeScript/Dart (depending on framework choice)
- Follow platform-specific conventions (iOS/Android)
- Implement proper error boundaries and fallbacks
- Use async/await for all asynchronous operations
- Keep components small and focused

### Testing Approach
- Unit tests for business logic (services, utilities)
- Integration tests for database operations
- E2E tests for critical user flows
- Manual testing for GPS and background features
- Test offline scenarios extensively

### Git Workflow
- Feature branches: `feature/description`
- Bug fixes: `fix/description`
- Use conventional commits format
- PR reviews required before merge
- Keep commits atomic and well-described

## Important Context

### Platform Constraints
- **iOS**: Requires special handling for background location updates
- **Android**: Needs foreground service for reliable GPS tracking
- **Battery**: GPS sampling must be optimized (5-min intervals)
- **Storage**: Photos need efficient compression and cleanup

### Critical Features
1. **Offline-First**: App must work without connectivity
2. **Data Integrity**: Never lose user data
3. **Background Tracking**: Must continue when app backgrounded
4. **Sync Reliability**: Handle partial uploads and retries

### User Experience Priorities
- Minimal taps to log data while fishing
- Clear indication of tracking/sync status
- Fast photo capture and catch entry
- Reliable session management

## AI Assistant Instructions

When assisting with this project:
1. Prioritize offline functionality in all features
2. Consider battery impact of any GPS/background operations
3. Ensure cross-platform compatibility for iOS/Android
4. Follow mobile development best practices
5. Test edge cases (no network, GPS disabled, permissions denied)
6. Keep UI simple and usable with wet/cold hands
7. Document platform-specific implementations

## Do's and Don'ts

**Do:**
- ✅ Implement robust error handling for network/GPS failures
- ✅ Use local database transactions for data consistency
- ✅ Optimize images before storage/upload
- ✅ Request permissions gracefully with clear explanations
- ✅ Test background behavior extensively
- ✅ Cache data aggressively for offline use
- ✅ Provide clear sync status indicators

**Don't:**
- ❌ Assume network connectivity
- ❌ Block UI on network operations
- ❌ Drain battery with excessive GPS polling
- ❌ Store uncompressed photos
- ❌ Lose data on app crash/termination
- ❌ Make breaking changes to sync protocol
- ❌ Ignore platform-specific guidelines

## Current Development Status

**Phase**: Initial Development Planning
**Next Steps**: 
1. Choose mobile framework (React Native vs Flutter vs Expo)
2. Set up project structure
3. Implement basic session management
4. Add GPS tracking service
5. Create local database schema

## Testing Checklist

Before any PR:
- [ ] Works offline
- [ ] Handles permission denials gracefully  
- [ ] GPS tracking continues in background
- [ ] Data syncs when connection restored
- [ ] No memory leaks
- [ ] Battery usage acceptable
- [ ] Works on both iOS and Android

## Resources

- [Product Specification](specs/fishing_tracker_spec.md)
- [Project Context](ai_docs/project_context.md)
- [AI Development Guide](ai_docs/README.md)