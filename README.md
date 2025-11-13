# IoX Matter Bridge

[![GitHub Release](https://img.shields.io/github/v/release/pradeepmouli/iox-matter-bridge)](https://github.com/pradeepmouli/iox-matter-bridge/releases)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Release-only repository** for IoX Matter Bridge: hosts packaged bridge artifacts, changelogs, and issue tracking.

## 📦 What is This Repository?

This repository serves as the **official distribution point** for IoX Matter Bridge releases. It contains:

- ✅ **Release artifacts** (compiled binaries, packaged distributions)
- ✅ **SBOM** (Software Bill of Materials)
- ✅ **Checksums & signatures** for verification
- ✅ **Release notes & changelog**
- ✅ **Issue tracking** for installation, deployment, and runtime issues

## 🔗 Source Code

**The source code lives in the [pradeepmouli/udi-js](https://github.com/pradeepmouli/udi-js) monorepo:**
- Main app: `apps/iox-matter-bridge/server`
- Related packages and shared libraries

For **feature requests**, **development issues**, or **code contributions**, please visit the [udi-js repository](https://github.com/pradeepmouli/udi-js).

## 🚀 Quick Start

### Download Latest Release

Visit the [Releases page](https://github.com/pradeepmouli/iox-matter-bridge/releases) to download the latest version.

### Verify & Install

```bash
# Download release (replace VERSION with actual version)
VERSION="1.0.0"
wget https://github.com/pradeepmouli/iox-matter-bridge/releases/download/v${VERSION}/iox-matter-bridge-v${VERSION}.tar.gz
wget https://github.com/pradeepmouli/iox-matter-bridge/releases/download/v${VERSION}/checksums-v${VERSION}.txt

# Verify integrity
sha256sum -c checksums-v${VERSION}.txt --ignore-missing

# Extract and install
tar -xzf iox-matter-bridge-v${VERSION}.tar.gz
sudo mv iox-matter-bridge /opt/iox-matter-bridge
```

For detailed instructions, see:
- **[Installation Guide](docs/INSTALLATION.md)**
- **[Artifact Verification Guide](docs/ARTIFACT_VERIFICATION.md)**

## 📋 Release Artifacts

Each release includes:

| Artifact | Description |
|----------|-------------|
| `iox-matter-bridge-v{version}.tar.gz` | Packaged server build (Linux/macOS) |
| `iox-matter-bridge-v{version}.zip` | Packaged server build (Windows) |
| `iox-matter-bridge-v{version}.sbom.json` | Software Bill of Materials |
| `checksums-v{version}.txt` | SHA256 integrity manifest |
| `iox-matter-bridge-v{version}.tar.gz.sig` | GPG signature (when available) |

## 🐛 Issue Reporting

### Report Issues Here

Use this repository to report:
- ✅ Installation/deployment problems
- ✅ Upgrade issues between versions
- ✅ Runtime bugs in released versions
- ✅ Artifact verification failures
- ✅ Security vulnerabilities

### Report Elsewhere

Submit to [udi-js repository](https://github.com/pradeepmouli/udi-js/issues):
- ❌ Feature requests
- ❌ Development/build issues
- ❌ Source code bugs

## 📚 Documentation

- [Installation Guide](docs/INSTALLATION.md) - How to install and configure
- [Artifact Verification](docs/ARTIFACT_VERIFICATION.md) - Verify download integrity
- [Security Policy](SECURITY.md) - Security best practices and reporting
- [Contributing Guide](CONTRIBUTING.md) - How to contribute
- [Release Planning](RELEASE_PLANNING.md) - Changelog and release history

## 🔐 Security

Security is a top priority. Each release includes:
- SHA256 checksums for integrity verification
- SBOM for dependency transparency
- Optional GPG signatures for authenticity

To report security vulnerabilities:
- Use [GitHub Security Advisories](https://github.com/pradeepmouli/iox-matter-bridge/security/advisories/new)
- Or email: See [SECURITY.md](SECURITY.md)

## 🏷️ Issue Labels

Issues are categorized with these labels:

| Label | Purpose |
|-------|---------|
| `release` | General release-related issues |
| `artifact` | Problems with distributed artifacts |
| `install` | Installation/deployment troubles |
| `upgrade` | Upgrade-related issues |
| `runtime` | Runtime issues in released versions |
| `regression` | Regressions post-upgrade |
| `security` | Security vulnerabilities or concerns |
| `documentation` | Documentation improvements |

## 🔄 Release Process

Releases are automated via GitHub Actions in the udi-js repository:

1. ✅ All tests pass in udi-js
2. ✅ Dependencies validated
3. ✅ Version tagged (`vX.Y.Z`)
4. ✅ Build & package artifacts
5. ✅ Generate SBOM & checksums
6. ✅ Create GitHub Release
7. ✅ Attach artifacts

## 📞 Support

- **Questions?** Check [release notes](https://github.com/pradeepmouli/iox-matter-bridge/releases)
- **Issues?** [Open an issue](https://github.com/pradeepmouli/iox-matter-bridge/issues/new/choose)
- **Development?** Visit [udi-js repository](https://github.com/pradeepmouli/udi-js)

## 📄 License

See the [udi-js repository](https://github.com/pradeepmouli/udi-js) for license information.

---

**Maintainer**: [@pradeepmouli](https://github.com/pradeepmouli)
