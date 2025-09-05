# Fishing Tracker App (fishhogs)

A mobile app for anglers to **record fishing sessions offline** and **sync when a connection is available**. While a session is active, the app captures a **GPS fix every 5 minutes**, lets users **take photos** tied to location/time, and log **catches** with species, measurements, and notes.

## Core Features

### Session Management
- **Start/Stop Sessions**: One-tap session control with automatic timestamping
- **Background GPS Tracking**: Battery-conscious location sampling every 5 minutes
- **Offline-First Storage**: All data persists locally first, syncs when online
- **Session History**: Review past trips with route breadcrumbs, photos, and catches

### Data Capture
- **GPS Track Points**: Records lat/lon, timestamp, accuracy every 5 minutes during active sessions
- **Photo Integration**: In-app camera with automatic geotagging to current location
- **Catch Logging**: Quick entry of species, length, weight (optional), and notes
- **Waterbody Notes**: Optional session-level notes and location tagging

### Sync & Settings
- **Opportunistic Sync**: Background sync via Wi-Fi or cellular (user-configurable)
- **Manual Sync**: User-triggered sync option when needed
- **Units Configuration**: Toggle between metric (cm/kg) and imperial (in/lb)
- **Species Management**: Customizable species picklist for quick entry

## Target Users

- **Solo Anglers**: Record trips in remote areas without service, review routes and catches later
- **Fishing Guides / Charter Captains**: Track multiple client sessions per day with quick data entry

## MVP Scope

### Included
✅ Session lifecycle management (start/stop)  
✅ Background-safe GPS sampling (5-minute intervals)  
✅ Offline-first local database storage  
✅ Photo capture with geotags  
✅ Catch entry with key measurements  
✅ Basic session history and review  
✅ Configurable sync policies  

### Not Included (Future)
❌ Social features (sharing, feeds, comments)  
❌ Live maps with online tiles  
❌ Advanced analytics beyond trip summaries  
❌ Wearable device integrations  
❌ External GPS device support  
❌ Session pause/resume (new session only)  

## Project Status

**Current Phase**: Initial Development Planning  
**Version**: v0.1 (Specification)

## Documentation

- [Product Specification](specs/fishing_tracker_spec.md) - Full product and technical requirements
- [Project Context](ai_docs/project_context.md) - Detailed project context for AI assistants
- [CLAUDE.md](CLAUDE.md) - AI assistant guidelines

## Development Setup

*Coming soon - setup instructions will be added once technology stack is chosen*

## AI-Assisted Development

This project is configured for AI-assisted development with comprehensive documentation and context.

### Quick Start with AI Tools

1. **Claude Code**: Use `/prime` command to load project context
2. **GitHub Copilot**: Context automatically loaded from `.github/copilot-instructions.md`
3. **Cursor IDE**: Rules configured in `.cursorrules`

### AI Development Structure

```
ai_docs/                        # AI-focused documentation
├── project_context.md          # Project-specific context
├── claude_code_best_practices.md
├── testing_best_practices.md
└── ...

.claude/                        # Claude Code configuration
├── commands/                   # Custom commands
│   ├── prime.md               # Load project context
│   ├── save.md                # AI-enhanced commits
│   └── clean.md               # Repository maintenance
└── settings.json              # Claude settings

CLAUDE.md                      # Project-specific AI guidelines
```

### Using AI Commands

- `/prime` - Load project context at session start
- `/save` - Create AI-enhanced commits with co-authorship
- `/clean` - Clean repository and check status

### Best Practices

1. Always run `/prime` at the start of an AI session
2. Keep `project_context.md` updated with project changes
3. Use `/save` for commits to maintain attribution
4. Review AI-generated code for platform-specific requirements

## Contributing

*Contribution guidelines will be added as project develops*

## License

*License information to be determined*
