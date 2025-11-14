# Contributing to IoX Matter Bridge

Thank you for your interest in the IoX Matter Bridge project!

## Repository Purpose

**Important**: This is a **release-only** repository. It exists to:
- Host release artifacts (packages, SBOM, checksums)
- Track issues related to installation, deployment, and runtime
- Provide a clean issue space for release consumers

## Source Code & Development

**All source code lives in the [udi-js monorepo](https://github.com/pradeepmouli/udi-js)**, specifically:
- `apps/iox-matter-bridge/server` - Main application code
- Related packages and shared libraries

### For Code Contributions

If you want to contribute code, please:
1. Visit the [udi-js repository](https://github.com/pradeepmouli/udi-js)
2. Follow the contribution guidelines there
3. Submit pull requests to that repository

## Issue Reporting (This Repository)

This repository accepts issues related to:

### ✅ Appropriate Issues
- **Installation problems**: Difficulties installing or deploying released artifacts
- **Upgrade issues**: Problems upgrading between versions
- **Runtime bugs**: Issues occurring in production with released versions
- **Artifact problems**: Corrupted downloads, missing files, signature verification failures
- **Security concerns**: Vulnerabilities in released versions
- **Documentation**: Improvements to release notes, installation guides

### ❌ Issues to Report Elsewhere
- **Feature requests**: Report in [udi-js](https://github.com/pradeepmouli/udi-js/issues)
- **Development/build issues**: Report in [udi-js](https://github.com/pradeepmouli/udi-js/issues)
- **Source code bugs**: Report in [udi-js](https://github.com/pradeepmouli/udi-js/issues)

## Issue Templates

When creating an issue, please use the appropriate template and provide:
- Version number of the release
- Environment details (OS, architecture, runtime version)
- Steps to reproduce
- Expected vs actual behavior
- Relevant log excerpts

## Release Publication (Maintainers Only)

Releases are published via automated workflow from the udi-js repository:

1. **Pre-Release Checklist**:
   - All tests passing in udi-js
   - Dependency validation complete
   - Version bumped and tagged
   - Changelog updated in RELEASE_PLANNING.md
   - SBOM generated
   - Integrity manifest created
   - Optional: GPG signature created

2. **Publication**:
   - Triggered via workflow dispatch in udi-js
   - Artifacts built and packaged
   - Release created in this repository
   - Artifacts attached to GitHub Release

3. **Post-Release**:
   - Verify artifact integrity
   - Monitor issues for any problems
   - Update documentation if needed

## Questions?

For questions about:
- **Using the bridge**: Check the documentation in releases
- **Developing the bridge**: Visit [udi-js](https://github.com/pradeepmouli/udi-js)
- **This repository**: Open a discussion or contact @pradeepmouli

## License

This project follows the same license as the udi-js monorepo. Check the source repository for details.
