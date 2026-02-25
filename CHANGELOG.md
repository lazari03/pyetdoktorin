# Changelog

## 1.0.0 - 2026-02-25
### Added
- GitHub Actions CI pipeline to build frontend and backend on `release/1.0.0`.
- Optional DigitalOcean App Platform deploy trigger from CI when `DO_API_TOKEN` and `DO_APP_ID` are present.

### Fixed
- Admin `update-user` API auth verification to avoid auth shadowing and ensure role/claim checks are applied.
- Profile picture upload API to validate env configuration, restrict MIME types, sanitize filenames, and upload to DigitalOcean Spaces.
