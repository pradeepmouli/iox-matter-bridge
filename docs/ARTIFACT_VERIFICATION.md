# Artifact Verification Guide

This guide explains how to verify the integrity and authenticity of IoX Matter Bridge release artifacts.

## Why Verify Artifacts?

Verifying downloaded artifacts ensures:
- **Integrity**: The file wasn't corrupted during download
- **Authenticity**: The file came from the official source
- **Security**: The file hasn't been tampered with

## Available Verification Methods

### 1. Checksum Verification (Required)

Every release includes a `checksums-v{version}.txt` file containing SHA256 hashes of all artifacts.

#### Linux / macOS

```bash
# Download the release artifact and checksums file
wget https://github.com/pradeepmouli/iox-matter-bridge/releases/download/v1.0.0/iox-matter-bridge-v1.0.0.tar.gz
wget https://github.com/pradeepmouli/iox-matter-bridge/releases/download/v1.0.0/checksums-v1.0.0.txt

# Verify the checksum
sha256sum -c checksums-v1.0.0.txt --ignore-missing

# Expected output: iox-matter-bridge-v1.0.0.tar.gz: OK
```

Or verify manually:
```bash
# Calculate checksum
sha256sum iox-matter-bridge-v1.0.0.tar.gz

# Compare with the checksum in checksums-v1.0.0.txt
cat checksums-v1.0.0.txt | grep iox-matter-bridge-v1.0.0.tar.gz
```

#### Windows (PowerShell)

```powershell
# Download files
Invoke-WebRequest -Uri "https://github.com/pradeepmouli/iox-matter-bridge/releases/download/v1.0.0/iox-matter-bridge-v1.0.0.tar.gz" -OutFile "iox-matter-bridge-v1.0.0.tar.gz"
Invoke-WebRequest -Uri "https://github.com/pradeepmouli/iox-matter-bridge/releases/download/v1.0.0/checksums-v1.0.0.txt" -OutFile "checksums-v1.0.0.txt"

# Calculate checksum
Get-FileHash -Algorithm SHA256 iox-matter-bridge-v1.0.0.tar.gz

# Compare with checksums file
Get-Content checksums-v1.0.0.txt | Select-String "iox-matter-bridge-v1.0.0.tar.gz"
```

### 2. GPG Signature Verification (Optional)

When available, GPG signatures provide cryptographic proof of authenticity.

#### Setup GPG (One-time)

```bash
# Import the maintainer's public key
# (Key ID will be provided in release notes)
gpg --keyserver keys.openpgp.org --recv-keys <KEY_ID>

# Or import from a file
curl -sL https://github.com/pradeepmouli.gpg | gpg --import
```

#### Verify Signature

```bash
# Download the signature file
wget https://github.com/pradeepmouli/iox-matter-bridge/releases/download/v1.0.0/iox-matter-bridge-v1.0.0.tar.gz.sig

# Verify the signature
gpg --verify iox-matter-bridge-v1.0.0.tar.gz.sig iox-matter-bridge-v1.0.0.tar.gz

# Expected output includes: "Good signature from..."
```

### 3. SBOM Review

The Software Bill of Materials (SBOM) lists all dependencies included in the release.

```bash
# Download SBOM
wget https://github.com/pradeepmouli/iox-matter-bridge/releases/download/v1.0.0/iox-matter-bridge-v1.0.0.sbom.json

# View SBOM
cat iox-matter-bridge-v1.0.0.sbom.json | jq .

# Check for specific dependency
cat iox-matter-bridge-v1.0.0.sbom.json | jq '.packages[] | select(.name == "express")'

# Count total packages
cat iox-matter-bridge-v1.0.0.sbom.json | jq '.packages | length'
```

## Complete Verification Script

Here's a complete script to verify all aspects of a release:

```bash
#!/bin/bash
set -e

VERSION="1.0.0"
BASE_URL="https://github.com/pradeepmouli/iox-matter-bridge/releases/download/v${VERSION}"
ARTIFACT="iox-matter-bridge-v${VERSION}.tar.gz"

echo "Downloading IoX Matter Bridge v${VERSION}..."
wget "${BASE_URL}/${ARTIFACT}"
wget "${BASE_URL}/checksums-v${VERSION}.txt"
wget "${BASE_URL}/iox-matter-bridge-v${VERSION}.sbom.json"

# Optionally download signature
if wget -q "${BASE_URL}/${ARTIFACT}.sig"; then
    echo "Signature file found"
    HAS_SIG=true
else
    echo "No signature file available"
    HAS_SIG=false
fi

echo ""
echo "Verifying checksum..."
if sha256sum -c "checksums-v${VERSION}.txt" --ignore-missing; then
    echo "✓ Checksum verification passed"
else
    echo "✗ Checksum verification failed!"
    exit 1
fi

if [ "$HAS_SIG" = true ]; then
    echo ""
    echo "Verifying GPG signature..."
    if gpg --verify "${ARTIFACT}.sig" "${ARTIFACT}" 2>&1 | grep -q "Good signature"; then
        echo "✓ Signature verification passed"
    else
        echo "✗ Signature verification failed!"
        exit 1
    fi
fi

echo ""
echo "Artifact information:"
echo "  File: ${ARTIFACT}"
echo "  Size: $(ls -lh ${ARTIFACT} | awk '{print $5}')"
echo "  SHA256: $(sha256sum ${ARTIFACT} | awk '{print $1}')"

echo ""
echo "SBOM available: iox-matter-bridge-v${VERSION}.sbom.json"
echo "Total packages: $(cat iox-matter-bridge-v${VERSION}.sbom.json | jq '.packages | length')"

echo ""
echo "✓ All verifications passed! Safe to install."
```

## Troubleshooting

### Checksum Mismatch

If checksum verification fails:
1. **Re-download**: The file may have been corrupted during download
2. **Check version**: Ensure you downloaded the correct version
3. **Network issues**: Try downloading from a different network/location
4. **Report**: If issue persists, [report an artifact problem](https://github.com/pradeepmouli/iox-matter-bridge/issues/new?template=artifact_problem.yml)

### GPG Verification Issues

Common GPG errors and solutions:

| Error | Solution |
|-------|----------|
| "Can't check signature: No public key" | Import the maintainer's public key |
| "BAD signature" | File may be corrupted or tampered with - do not use |
| "signature made by expired key" | Check for key updates or release notes |

### File Corruption

Signs of corruption:
- Checksum doesn't match
- Cannot extract archive
- Unexpected file size

**Solution**: Delete and re-download the artifact.

## Security Recommendations

1. **Always verify checksums** before installation
2. **Use HTTPS** when downloading (browsers and wget/curl do this by default)
3. **Verify GPG signatures** when available for maximum security
4. **Review SBOM** to understand what dependencies you're installing
5. **Download from official sources only**: GitHub Releases page
6. **Keep GPG keyring updated** to ensure key validity

## Questions?

If you have questions about artifact verification:
- Check the [Security Policy](../SECURITY.md)
- Review [release notes](https://github.com/pradeepmouli/iox-matter-bridge/releases)
- [Open an issue](https://github.com/pradeepmouli/iox-matter-bridge/issues)

---

**Last Updated**: 2024-11
**Applies to**: All releases
