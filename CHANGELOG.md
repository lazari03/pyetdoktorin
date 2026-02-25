# Changelog

## 1.0.1 - 2026-02-25
### Added
- Doctor signature saved in profile with manual save flow, plus password re-auth before issuing a recipe.
- Prescription status updates in dashboard notifications (doctor/patient).
- Dashboard top bar branding (pyetdoktorin) for desktop and mobile menus.

### Changed
- Prescription flows now use use-case/service layer for network access (clean-architecture alignment).
- Prescription status updates now track `statusUpdatedAt`.

### Fixed
- Server-side re-auth enforcement for issuing prescriptions.
- Sanitized recipe print view to prevent HTML injection.
- Optimized admin user listing to avoid full-collection reads when filtering by role.

## 1.0.0 - 2026-02-25
### Added
- GitHub Actions CI pipeline to build frontend and backend on `release/1.0.0`.
- Optional DigitalOcean App Platform deploy trigger from CI when `DO_API_TOKEN` and `DO_APP_ID` are present.

### Fixed
- Admin `update-user` API auth verification to avoid auth shadowing and ensure role/claim checks are applied.
- Profile picture upload API to validate env configuration, restrict MIME types, sanitize filenames, and upload to DigitalOcean Spaces.
