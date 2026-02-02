# Changelog

All notable changes to TryRamadan will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- CONTRIBUTING.md – Dev setup, build, test, and how to add pages/features
- CHANGELOG.md – This file
- `src/lib/config.ts` – Centralized API URLs (Aladhan, Nominatim, TimeAPI, ipapi, Quran API) for easier staging/mocking

### Fixed
- Ramadan calendar export – Toast error with retry when prayer API fails (Schedule page)
- PWA manifest – Already had TryRamadan as short_name; marked complete in improvement backlog

### Changed
- API URLs – All prayer, location, timezone, Quran, and Sunnah URLs now use `src/lib/config.ts`
