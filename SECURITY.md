# Security Policy

## Reporting Security Vulnerabilities

The security of IoX Matter Bridge is a top priority. If you discover a security vulnerability, please report it responsibly.

### Where to Report

**For vulnerabilities in released versions:**
- **Email**: Create a security advisory on this repository
- **GitHub Security Advisory**: Use the "Security" tab → "Advisories" → "New draft security advisory"

**For vulnerabilities in source code or unreleased versions:**
- Report to the [udi-js repository](https://github.com/pradeepmouli/udi-js/security/advisories/new)

### Please Do Not

- Open public issues for security vulnerabilities
- Disclose the vulnerability publicly before it has been addressed
- Exploit the vulnerability beyond what is necessary to demonstrate it

### What to Include

When reporting a vulnerability, please include:

1. **Description**: Clear description of the vulnerability
2. **Impact**: What could an attacker do with this vulnerability?
3. **Affected Versions**: Which releases are affected?
4. **Reproduction Steps**: Detailed steps to reproduce the issue
5. **Proof of Concept**: If applicable, code or commands demonstrating the issue
6. **Suggested Fix**: If you have ideas on how to fix it (optional)
7. **Contact Information**: How we can reach you for follow-up

### Response Timeline

- **Initial Response**: Within 72 hours
- **Status Update**: Within 7 days
- **Resolution Target**: Varies by severity (critical issues prioritized)

### Security Update Process

1. **Triage**: Assess severity and impact
2. **Fix Development**: Patch created in udi-js repository
3. **Testing**: Security fix tested in isolation
4. **Release**:
   - Patch version released for critical/high severity issues
   - Security advisory published
   - Users notified via release notes
5. **Disclosure**: Public disclosure after patch is available

### Supported Versions

Security updates are provided for:
- Latest stable release
- Previous minor version (for 60 days after new minor release)

| Version Pattern | Supported          |
| --------------- | ------------------ |
| Latest release  | ✅ Yes             |
| Previous minor  | ✅ 60 days         |
| Older versions  | ❌ No              |

### Security Features

Each release includes:
- **SBOM** (Software Bill of Materials): `iox-matter-bridge-v{version}.sbom.json`
- **Checksums**: SHA256 integrity manifest for all artifacts
- **Optional Signatures**: GPG signatures for verification (when available)

### Verifying Release Artifacts

To verify the integrity of downloaded artifacts:

```bash
# Download the release and checksum file
wget https://github.com/pradeepmouli/iox-matter-bridge/releases/download/v1.0.0/iox-matter-bridge-v1.0.0.tar.gz
wget https://github.com/pradeepmouli/iox-matter-bridge/releases/download/v1.0.0/checksums-v1.0.0.txt

# Verify checksum
sha256sum -c checksums-v1.0.0.txt --ignore-missing

# If GPG signature is available
wget https://github.com/pradeepmouli/iox-matter-bridge/releases/download/v1.0.0/iox-matter-bridge-v1.0.0.tar.gz.sig
gpg --verify iox-matter-bridge-v1.0.0.tar.gz.sig iox-matter-bridge-v1.0.0.tar.gz
```

### Known Security Considerations

_No known security issues at this time._

### Security Best Practices for Deployment

When deploying IoX Matter Bridge:

1. **Verify Artifacts**: Always verify checksums before installation
2. **Stay Updated**: Subscribe to releases to get security updates promptly
3. **Least Privilege**: Run the bridge with minimal necessary permissions
4. **Network Security**: Use firewalls and network segmentation appropriately
5. **Monitor Logs**: Enable logging and monitor for suspicious activity
6. **SBOM Review**: Review the SBOM to understand dependencies

### Contact

For security-related questions or concerns:
- **Maintainer**: @pradeepmouli
- **Security Advisories**: [GitHub Security Tab](https://github.com/pradeepmouli/iox-matter-bridge/security/advisories)

Thank you for helping keep IoX Matter Bridge secure!
