# Release Planning & Changelog

This document tracks planned releases and serves as a changelog for the IoX Matter Bridge.

## Release Process

All releases are published from the [udi-js monorepo](https://github.com/pradeepmouli/udi-js) via automated workflows. This repository receives:
- Compiled artifacts (`.tar.gz`, `.zip`)
- SBOM (Software Bill of Materials)
- Integrity manifests (checksums)
- Release notes

## Upcoming Releases

_No releases currently planned. Check the [udi-js repository](https://github.com/pradeepmouli/udi-js) for development progress._

---

## Release History

### [Unreleased]

Initial repository setup for release artifact distribution.

---

## Release Template

When adding a new release, use this template:

```markdown
### [vX.Y.Z] - YYYY-MM-DD

#### Added
- New features or functionality

#### Changed
- Changes to existing functionality

#### Deprecated
- Features marked for removal in future releases

#### Removed
- Features removed in this release

#### Fixed
- Bug fixes

#### Security
- Security fixes and improvements

#### Dependencies
- Notable dependency updates
```

---

## Versioning

IoX Matter Bridge follows [Semantic Versioning](https://semver.org/):
- **MAJOR**: Incompatible API changes or breaking changes
- **MINOR**: New functionality in a backward-compatible manner
- **PATCH**: Backward-compatible bug fixes

## Pre-release Versions

Pre-release versions may be tagged as:
- `vX.Y.Z-alpha.N` - Early testing releases
- `vX.Y.Z-beta.N` - Feature-complete, testing releases
- `vX.Y.Z-rc.N` - Release candidates
