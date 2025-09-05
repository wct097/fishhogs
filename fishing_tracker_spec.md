# Fishing Tracker App --- Product & Technical Spec (v0.1)

**Date:** 2025‑09‑05\
**Platforms:** iOS & Android (single codebase)\
**Author:** ChatGPT (for Will)\
**Audience:** Product, Engineering, QA, Design

------------------------------------------------------------------------

## 1) Summary

A mobile app for anglers to **record fishing sessions offline** and
**sync when a connection is available**. While a session is active, the
app captures a **GPS fix every 5 minutes** (timestamp + latitude +
longitude + accuracy + optional speed/heading), lets users **take
photos** tied to location/time, and log **catches** (species, length,
optional weight/notes). Data persists locally first and syncs to a
backend when online.

------------------------------------------------------------------------

## 2) Goals / Non‑Goals

**Goals** - Start/stop fishing sessions. - Background-safe,
battery-conscious GPS sampling every 5 minutes during active sessions. -
Offline-first local storage of sessions, track points, photos, and
catches. - Opportunistic background sync (Wi‑Fi or cellular;
user-configurable). - Simple, trustworthy UX: clear status of tracking,
sampling interval, and sync state.

**Non‑Goals (MVP)** - Social features (sharing feeds, comments). - Live
maps with online-only tiles. - Advanced analytics beyond basic per‑trip
summaries. - Wearables or external GPS integrations.

------------------------------------------------------------------------

## 3) Personas & Primary Use Cases

-   **Solo Angler:** wants to record trips in remote areas without
    service; later reviews route, photos, and catches.
-   **Guide / Charter Captain:** records clients' trips; may need
    multiple sessions per day and quick data entry.

**Use Cases** 1. Start a session, fish all day offline, take photos, log
catches, return to coverage and sync. 2. Pause/resume or briefly switch
apps while tracking continues in background (within platform
constraints). 3. Review past sessions and see route "breadcrumbs,"
photos, and catch entries.

------------------------------------------------------------------------

## 4) Requirements

### 4.1 Functional

-   **Session Lifecycle**
    -   Create session (start time auto‑set; optional waterbody/notes).
    -   While active, record a track point every **5 minutes**.
    -   Stop session (end time set; compute duration; show summary).
    -   Resume is out‑of‑scope; instead, start a new session (MVP) ---
        *or* we can allow a single active session with pause/resume
        (nice‑to‑have).
-   **Location Sampling**
    -   Persist **lat, lon, timestamp, horizontalAccuracy**; optionally
        **speed, heading, altitude** when available.
    -   Target cadence: **1 point/5 min** while a session is active
        (foreground or background). Note: exact 5‑minute cadence is
        **best‑effort, not real‑time guaranteed** due to OS power
        policies.
    -   If GPS is disabled or permissions revoked, surface a clear error
        state and stop tracking.
-   **Photos**
    -   Take pictures during a session via in‑app camera or camera roll
        import (MVP: in‑app only).
    -   For each photo, store **file path/URI**, **timestamp**,
        **lat/lon** (from current fix when captured) and **session id**.
-   **Catches**
    -   Add a catch entry with **species** (free text or picklist),
        **length** (units configurable), optional **weight**, optional
        **notes**, and implicit **timestamp** & **current location** if
        available.
-   **Offline‑First & Sync**
    -   All data is first written to the **local database**.
    -   Background sync when network available; user can trigger manual
        sync.
    -   Conflicts resolved deterministically (see §8).
-   **History**
    -   List past sessions; tap to see details: summary stats, track
        points plotted, photos, and catches.
-   **Settings**
    -   Units (length: cm/in; weight: kg/lb).
    -   Sampling interval (fixed at 5 min for MVP; make it configurable
        later).
    -   Sync policy: Wi‑Fi only vs Wi‑Fi + cellular.
    -   Species picklist management (optional in MVP; default common
        list).
