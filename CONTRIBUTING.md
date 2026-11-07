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

## Workflow Maintenance

Workflow scripts live in `.github/scripts/`. Run their regression tests with
Node.js 22 or newer (and `tar` for the TUI fixtures):

```sh
node --test .github/tests/*.test.cjs .github/scripts/*.test.cjs
```

The **Test Workflow Automation** workflow also validates GitHub Actions YAML and
expressions with `actionlint` on pull requests and pushes to `master`.

### Cross-repository issue synchronization

The **Sync Issues to udi-js** workflow copies issues labeled `bug`, `enhancement`,
or `device-support`. GitHub's automatic `GITHUB_TOKEN` can only update this
repository, so copying to `udi-js` requires a separately authorized repository
secret named `UDI_JS_ISSUES_TOKEN`. Use a fine-grained personal access token limited to **Issues: read and
write** on `pradeepmouli/udi-js` (plus GitHub's required metadata access). It does
not need code write access or access to this source repository. Source comments
and labels continue to use the source repository's `GITHUB_TOKEN`.

Provisioning or changing that credential is a separate maintainer action. No
credential is created by these workflows. If the secret is absent, the workflow
fails with a configuration message without claiming the issue was synced.

The `synced-to-udi-js` label is applied only after a target issue exists and its
link has been posted to the source issue. Runs are serialized per issue. A retry
reuses a target issue and source comment from a previous partial run. To retry a
failed run or process an older issue, dispatch the workflow with its issue number.
The `copilot-tracked` label is only a tracking label, not a Copilot assignment.

### Release validation

The **Validate Release Artifacts** workflow checks bridge releases for
`iox_matter_bridge-<version>.pkg` and `download_build.sh`. Required files must be
nonempty and match a SHA-256 digest from GitHub's release asset metadata or a
published `SHA256SUMS` / `checksums-v<version>.txt` manifest. If both sources are
present, both must match. A separate legacy tarball is not required.

Standalone `tui-v...` releases still require TUI archives, `SHA256SUMS` coverage,
and the expected release metadata, skill, and skill installer archive entries.
Optional SBOMs are checked for JSON syntax when supplied; signature presence is
reported without claiming cryptographic authenticity. Packages and installers
are never executed by validation.

Missing, corrupt, or unverifiable required artifacts make the job fail. Download
failures also fail rather than being ignored. Results are retained as an Actions
artifact and job summary, without automatically creating duplicate issue reports.
To recheck an existing release, dispatch this workflow with its published tag
(for example `v2.0.7`). On release events, validation uses the maintained scripts
on the repository's default branch, even when the release tag predates them.
