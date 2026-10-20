# IoX Matter Bridge

[![GitHub Release](https://img.shields.io/github/v/release/pradeepmouli/iox-matter-bridge)](https://github.com/pradeepmouli/iox-matter-bridge/releases)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Release-only repository** for IoX Matter Bridge: hosts packaged bridge artifacts, changelogs, and issue tracking.

## 📖 What is IoX Matter Bridge?

**IoX Matter Bridge** is a service that exposes your eISY home automation controller as a Matter bridge device on your Matter network. This allows you to:

- ✅ **Control eISY devices** through Matter-compatible controllers (Apple Home, Google Home, Amazon Alexa, etc.)
- ✅ **Integrate with Matter ecosystems** without replacing existing Insteon, Z-Wave, or other devices
- ✅ **Maintain local control** with secure, standards-based Matter protocol
- ✅ **Leverage existing automation** while expanding compatibility

The bridge acts as a translator between your eisy controller's devices and the Matter protocol, making your existing smart home devices accessible to Matter-enabled ecosystems.

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

### Standalone TUI for your computer

Releases tagged **`tui-v…`** contain the terminal management app for macOS, Linux
and Windows. Download your platform's `iox-matter-tui-*.tar.gz` and `SHA256SUMS`,
verify the SHA256 hash, extract, and run the executable in a terminal. Its runtime
is included; Node and Bun are not required. macOS builds are unsigned.

Each archive includes an optional agent skill for installation, SSH setup and
routine bridge operations. Install it locally from the extracted directory:

```sh
python3 install-skills.py --dest ~/.codex/skills
```

Existing skills are preserved. Use `--help` for connection options. These releases
do not upgrade the eisy or migrate a plugin. The TUI targets the modern bridge;
production bridge 1.3.24 compatibility is planned for the plugin independently.
TUI and server versions are independent; server packages remain under `v…` tags.

### Installation on eisy

**For stable releases (recommended):**
Stable releases are automatically available through the eisy package manager. The bridge will be installed and updated automatically via the eisy's built-in package update mechanism.

To install:
1. Navigate to the eisy admin console
2. Go to Package Manager
3. Look for "IoX Matter Bridge"
4. Click Install/Update

**For pre-releases (testing/early access):**
Pre-releases are available on this GitHub repository for testing and early access. To install a pre-release manually:

1. **Download the pre-release** from the [Releases page](https://github.com/pradeepmouli/iox-matter-bridge/releases)
   - Look for releases marked as "Pre-release"
   - Download the `.tar.gz` artifact and checksums file

2. **Verify the download:**
   ```bash
   # Replace X.Y.Z-beta.N with the pre-release version (e.g., 1.5.0-beta.1)
   VERSION="X.Y.Z-beta.N"
   sha256sum -c checksums-v${VERSION}.txt --ignore-missing
   ```

3. **Extract and install:**
   ```bash
   # Extract the archive (using the same VERSION from above)
   tar -xzf iox-matter-bridge-v${VERSION}.tar.gz
   
   # Install to eisy (follow specific installation instructions in the release notes)
   # Installation steps may vary by pre-release version
   ```

4. **Check release notes** for version-specific installation instructions and known issues

> **Note:** Pre-releases may contain experimental features and are not recommended for production use. Always back up your configuration before installing pre-releases.

### Manual Installation (Other Platforms)

For installation on non-eisy platforms (Linux, macOS):

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
| `iox-matter-bridge-v{version}.sbom.json` | Software Bill of Materials |
| `checksums-v{version}.txt` | SHA256 integrity manifest |
| `iox-matter-bridge-v{version}.tar.gz.sig` | GPG signature (when available) |

## 🐛 Issue Reporting

### How to Submit a Bug Report

We use GitHub Issues to track bugs, device support requests, and feature requests. To submit a bug report:

1. **Check existing issues** - Search to see if your issue has already been reported
2. **Choose the right template:**
   - **[Bug Report](.github/ISSUE_TEMPLATE/bug_report.md)** - For runtime bugs or unexpected behavior
   - **[Device Support Request](.github/ISSUE_TEMPLATE/device_support.md)** - For device compatibility issues or new device support
   - **[Feature Request](.github/ISSUE_TEMPLATE/feature_request.md)** - For new features or enhancements
   - **[Installation Issue](.github/ISSUE_TEMPLATE/installation.md)** - For installation or deployment problems
   - **[Artifact Problem](.github/ISSUE_TEMPLATE/artifact_problem.md)** - For issues with release artifacts

3. **Provide complete information:**
   - Release version you're using
   - Your environment (OS, architecture, eisy firmware version)
   - Steps to reproduce the issue
   - **Attach logs and configuration files** (see tips below)
   - Screenshots if applicable

4. **[Create your issue](https://github.com/pradeepmouli/iox-matter-bridge/issues/new/choose)**

#### Tips for Providing Logs and Configuration

- **Logs:** Attach log files by dragging and dropping them into the issue description
- **Configuration:** Copy and paste your configuration into code blocks (remember to redact sensitive information like passwords, tokens, etc.)
- **Enable debug logging** if possible to capture more detailed information
- **Include timestamps** to help correlate logs with the issue occurrence

### What to Report Here

**Report in this repository (iox-matter-bridge):**
- ✅ Installation/deployment problems
- ✅ Upgrade issues between versions
- ✅ Runtime bugs in released versions
- ✅ Artifact verification failures
- ✅ Device compatibility issues
- ✅ Security vulnerabilities

> **Note:** Feature requests and device support requests created here will be automatically tagged and may be redirected to the udi-js repository for tracking and development.

## 🎛️ Device Support

IoX Matter Bridge supports various device types from your eisy controller. Support levels vary by device type:

### Support Status

| Device Type | Status | Notes |
|-------------|--------|-------|
| **On/Off Switches** | ✅ Works | Insteon switches, relays |
| **Dimmers** | ✅ Works | Insteon dimmers with brightness control |
| **Door/Window Sensors** | ✅ Works | Contact sensors (open/closed) |
| **Motion Sensors** | ✅ Works | Motion detection and occupancy |
| **Leak Sensors** | ✅ Works | Water leak detection |
| **Temperature Sensors** | ⚠️ Partially Works | Basic temperature reporting (see Known Issues) |
| **Thermostats** | ⚠️ Partially Works | Basic control, some features limited |
| **Locks** | 🔄 May Work | Not extensively tested |
| **Garage Door Openers** | ❌ Not Supported | Version of Matter Protocol (v1.4) supported by matter.js (implementation that iox-matter-bridge uses) does not support garage doors.
| **Fans** | 🔄 May Work | Speed control may be limited |
| **Outlets/Plugs** | ✅ Works | Smart outlets and plug-in modules |
| **Scenes** | ❌ Not Supported | eisy scenes not currently exposed |
| **Multi-sensors** | ⚠️ Partially Works | Individual sensors may work, combination devices may have limitations |

**Legend:**
- ✅ **Works** - Fully functional and tested
- ⚠️ **Partially Works** - Basic functionality works, some features may be limited
- 🔄 **May Work** - Not extensively tested, feedback welcome
- ❌ **Not Supported** - Currently not implemented

### Tested Devices

The bridge has been tested with various Insteon and Zigbee devices. For a complete list of tested devices and their specific capabilities, please see the [device compatibility discussion](https://github.com/pradeepmouli/iox-matter-bridge/discussions) or submit a [device support request](.github/ISSUE_TEMPLATE/device_support.md).

### Request Device Support

If you have a device that:
- Doesn't work as expected
- Works partially but is missing features
- Isn't listed above

Please submit a [Device Support Request](.github/ISSUE_TEMPLATE/device_support.md) with:
- Device information and model number
- Current behavior vs. expected behavior
- Logs showing device interaction
- Configuration details

## ⚠️ Known Issues

### Current Known Issues

1. **Temperature Reporting Precision**
   - Some temperature sensors may report values with lower precision than expected
   - **Workaround:** Values are generally within acceptable range for home automation
   - **Status:** Being investigated

2. **Scene Support**
   - eisy scenes are not currently exposed as Matter scenes
   - **Workaround:** Create automations in your Matter controller instead
   - **Status:** Planned for future release

3. **Multi-Channel Devices**
   - Some multi-channel devices (e.g., dual outlets) may appear as separate devices
   - **Workaround:** None needed, devices function correctly
   - **Status:** Expected behavior

4. **Pairing Timeout on Large Installations**
   - Initial pairing may take longer for eisy controllers with many devices (100+)
   - **Workaround:** Be patient during initial pairing, allow 5-10 minutes
   - **Status:** Performance optimization in progress

### Reporting New Issues

Found a new issue? Please [submit a bug report](.github/ISSUE_TEMPLATE/bug_report.md) with:
- Detailed description
- Steps to reproduce
- Logs and configuration
- Expected vs. actual behavior

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Bridge Not Appearing in Matter Controller

**Symptoms:** Bridge doesn't show up in Home app, Google Home, etc.

**Solutions:**
1. Verify the bridge is running:
   ```bash
   # Check service status (on eisy)
   systemctl status iox-matter-bridge
   ```

2. Check network connectivity:
   - Ensure bridge and controller are on the same network
   - Check firewall settings aren't blocking mDNS (port 5353)
   - Verify Matter/Thread network configuration

3. Restart the bridge:
   ```bash
   # On eisy
   systemctl restart iox-matter-bridge
   ```

4. Check logs for errors:
   ```bash
   # View recent logs
   journalctl -u iox-matter-bridge -n 100
   ```

#### Devices Not Updating Status

**Symptoms:** Device status in Matter controller doesn't match actual device state

**Solutions:**
1. Check eisy connection:
   - Verify bridge can communicate with eisy
   - Check eisy is responsive and devices are reporting correctly

2. Review bridge configuration:
   - Ensure eisy credentials are correct
   - Verify device polling interval settings

3. Force device refresh:
   - Toggle the device physically
   - Restart the bridge service

#### Pairing Code Not Working

**Symptoms:** QR code or pairing code rejected by Matter controller

**Solutions:**
1. Generate new pairing code:
   - Restart bridge to generate fresh pairing credentials
   - Check bridge logs for the current pairing code

2. Verify Matter controller compatibility:
   - Ensure controller firmware is up to date
   - Try pairing with a different Matter controller

3. Reset Matter credentials (if necessary):
   - Stop the bridge service
   - Remove the Matter storage directory (location varies by installation)
   - Restart the bridge to generate new pairing credentials
   - For specific instructions, check the release notes for your version or consult the [Installation Guide](docs/INSTALLATION.md)

#### High CPU or Memory Usage

**Symptoms:** Bridge consuming excessive system resources

**Solutions:**
1. Check number of devices:
   - Large device count may require more resources
   - Consider filtering devices if necessary

2. Reduce polling frequency:
   - Adjust polling interval in configuration
   - Balance between responsiveness and resource usage

3. Review logs for errors:
   - Continuous errors can cause resource spikes
   - Address underlying issues causing errors

### Getting Help

If you're still experiencing issues:

1. **Check the logs** - Most issues have clues in the logs
2. **Search existing issues** - Someone may have had the same problem
3. **Submit a bug report** - Use the appropriate [issue template](.github/ISSUE_TEMPLATE/)
4. **Include all relevant information:**
   - Release version
   - Environment details
   - Complete logs (with sensitive information redacted)
   - Steps to reproduce
   - Configuration files

### Debug Logging

To enable debug logging for more detailed troubleshooting:

1. Edit the bridge configuration (location varies by installation)
2. Set log level to `debug` or `trace`
3. Restart the bridge
4. Reproduce the issue
5. Collect logs and attach to your issue report

> **Warning:** Debug logs may contain sensitive information. Always review and redact sensitive data before sharing logs publicly.

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
