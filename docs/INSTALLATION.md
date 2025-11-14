# Installation Guide

This guide covers installing IoX Matter Bridge from official release artifacts.

## Prerequisites

Before installing, ensure you have:

- **Node.js**: v18.0.0 or later (LTS version recommended)
- **Operating System**: Linux, macOS, or Windows
- **Architecture**: x86_64 or arm64
- **Permissions**: Appropriate permissions to install and run services

Check your Node.js version:
```bash
node --version
```

## Choosing a Release

Visit the [Releases page](https://github.com/pradeepmouli/iox-matter-bridge/releases) to find available versions.

### Release Types

- **Stable releases**: `vX.Y.Z` (e.g., v1.0.0) - Production-ready
- **Pre-releases**: `vX.Y.Z-alpha.N`, `vX.Y.Z-beta.N`, `vX.Y.Z-rc.N` - Testing only

**Recommendation**: Use the latest stable release for production.

## Download and Verify

### Step 1: Download

Choose your preferred format:

**Using wget (Linux/macOS)**:
```bash
VERSION="1.0.0"
wget https://github.com/pradeepmouli/iox-matter-bridge/releases/download/v${VERSION}/iox-matter-bridge-v${VERSION}.tar.gz
wget https://github.com/pradeepmouli/iox-matter-bridge/releases/download/v${VERSION}/checksums-v${VERSION}.txt
```

**Using curl (Linux/macOS)**:
```bash
VERSION="1.0.0"
curl -LO https://github.com/pradeepmouli/iox-matter-bridge/releases/download/v${VERSION}/iox-matter-bridge-v${VERSION}.tar.gz
curl -LO https://github.com/pradeepmouli/iox-matter-bridge/releases/download/v${VERSION}/checksums-v${VERSION}.txt
```

**Using browser**:
- Navigate to the release page
- Download `iox-matter-bridge-v{version}.tar.gz` (or `.zip` for Windows)
- Download `checksums-v{version}.txt`

### Step 2: Verify Integrity

**Linux/macOS**:
```bash
sha256sum -c checksums-v${VERSION}.txt --ignore-missing
```

**Windows (PowerShell)**:
```powershell
Get-FileHash -Algorithm SHA256 iox-matter-bridge-v1.0.0.tar.gz
# Compare output with checksums file
```

For detailed verification steps, see [Artifact Verification Guide](./ARTIFACT_VERIFICATION.md).

## Installation

### Option 1: Standard Installation

```bash
# Extract the archive
tar -xzf iox-matter-bridge-v${VERSION}.tar.gz

# Move to installation directory
sudo mv iox-matter-bridge /opt/iox-matter-bridge

# Create symlink (optional, for easy updates)
sudo ln -sf /opt/iox-matter-bridge/bin/iox-matter-bridge /usr/local/bin/iox-matter-bridge

# Verify installation
/opt/iox-matter-bridge/bin/iox-matter-bridge --version
```

### Option 2: User-level Installation

```bash
# Extract to home directory
tar -xzf iox-matter-bridge-v${VERSION}.tar.gz -C ~/

# Add to PATH (add to ~/.bashrc or ~/.zshrc)
export PATH="$HOME/iox-matter-bridge/bin:$PATH"

# Reload shell configuration
source ~/.bashrc  # or source ~/.zshrc

# Verify installation
iox-matter-bridge --version
```

### Option 3: Custom Location

```bash
# Extract to custom location
INSTALL_DIR="/path/to/custom/location"
tar -xzf iox-matter-bridge-v${VERSION}.tar.gz -C "${INSTALL_DIR}"

# Run directly
${INSTALL_DIR}/iox-matter-bridge/bin/iox-matter-bridge --version
```

## Configuration

### Default Configuration

The bridge looks for configuration in these locations (in order):
1. `./config/default.json` (current directory)
2. `/etc/iox-matter-bridge/config.json` (system-wide)
3. `~/.config/iox-matter-bridge/config.json` (user-specific)

### Creating Configuration

```bash
# Create configuration directory
sudo mkdir -p /etc/iox-matter-bridge

# Create configuration file
sudo nano /etc/iox-matter-bridge/config.json
```

Example configuration:
```json
{
  "bridge": {
    "name": "IoX Matter Bridge",
    "port": 5540
  },
  "logging": {
    "level": "info",
    "file": "/var/log/iox-matter-bridge/bridge.log"
  }
}
```

**Note**: Specific configuration options depend on your deployment. Check the release notes for configuration schema.

## Running the Bridge

### Manual Start

```bash
# Start in foreground
iox-matter-bridge start

# Start with custom config
iox-matter-bridge start --config /path/to/config.json

# Start with debug logging
iox-matter-bridge start --log-level debug
```

### As a System Service (Linux - systemd)

Create a systemd service file:

```bash
sudo nano /etc/systemd/system/iox-matter-bridge.service
```

Service file content:
```ini
[Unit]
Description=IoX Matter Bridge
After=network.target

[Service]
Type=simple
User=iox-bridge
Group=iox-bridge
WorkingDirectory=/opt/iox-matter-bridge
ExecStart=/opt/iox-matter-bridge/bin/iox-matter-bridge start
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
# Create service user
sudo useradd -r -s /bin/false iox-bridge

# Set permissions
sudo chown -R iox-bridge:iox-bridge /opt/iox-matter-bridge

# Reload systemd
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable iox-matter-bridge

# Start service
sudo systemctl start iox-matter-bridge

# Check status
sudo systemctl status iox-matter-bridge

# View logs
sudo journalctl -u iox-matter-bridge -f
```

### As a System Service (macOS - launchd)

Create a launch agent:

```bash
nano ~/Library/LaunchAgents/com.pradeepmouli.iox-matter-bridge.plist
```

Launch agent content:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.pradeepmouli.iox-matter-bridge</string>
    <key>ProgramArguments</key>
    <array>
        <string>/opt/iox-matter-bridge/bin/iox-matter-bridge</string>
        <string>start</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/iox-matter-bridge.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/iox-matter-bridge.error.log</string>
</dict>
</plist>
```

Load and start:
```bash
launchctl load ~/Library/LaunchAgents/com.pradeepmouli.iox-matter-bridge.plist
launchctl start com.pradeepmouli.iox-matter-bridge
```

## Verifying Installation

After installation, verify the bridge is working:

```bash
# Check version
iox-matter-bridge --version

# Check health (if health endpoint is available)
curl http://localhost:5540/health

# Check logs
tail -f /var/log/iox-matter-bridge/bridge.log
```

## Troubleshooting

### Installation Issues

| Issue | Solution |
|-------|----------|
| "Permission denied" | Use `sudo` or install to user directory |
| "Command not found" | Add installation directory to PATH |
| "tar: Error is not recoverable" | Re-download artifact, verify checksum |

### Runtime Issues

| Issue | Solution |
|-------|----------|
| Port already in use | Change port in configuration |
| Module not found | Ensure all files extracted correctly |
| Permission errors | Check file ownership and permissions |

### Getting Help

If you encounter issues:
1. Check the [FAQ](https://github.com/pradeepmouli/iox-matter-bridge/releases) in release notes
2. Review existing [issues](https://github.com/pradeepmouli/iox-matter-bridge/issues)
3. [Report an installation issue](https://github.com/pradeepmouli/iox-matter-bridge/issues/new?template=installation.yml)

## Uninstallation

To remove IoX Matter Bridge:

```bash
# Stop the service (if running as service)
sudo systemctl stop iox-matter-bridge
sudo systemctl disable iox-matter-bridge
sudo rm /etc/systemd/system/iox-matter-bridge.service
sudo systemctl daemon-reload

# Remove installation
sudo rm -rf /opt/iox-matter-bridge

# Remove configuration
sudo rm -rf /etc/iox-matter-bridge

# Remove logs
sudo rm -rf /var/log/iox-matter-bridge

# Remove symlink
sudo rm /usr/local/bin/iox-matter-bridge
```

## Next Steps

- Configure your devices and endpoints
- Set up monitoring and logging
- Review [security best practices](../SECURITY.md)
- Subscribe to releases for updates

---

**Last Updated**: 2024-11
**Applies to**: All releases
