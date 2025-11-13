# Release Process Documentation

This document describes the automated release process for IoX Matter Bridge.

## Overview

IoX Matter Bridge follows a **monorepo-to-distribution** release model:

1. **Development**: Code is developed in [udi-js monorepo](https://github.com/pradeepmouli/udi-js)
2. **Build & Package**: Automated in udi-js repository
3. **Distribution**: Artifacts published to this repository
4. **Consumption**: Users download releases from this repository

## Release Workflow

### Pre-Release Checklist

Before triggering a release, ensure:

- [ ] All tests passing in udi-js (`npm test`, `npm run test:e2e`)
- [ ] Dependencies validated (`npm run validate-deps` or equivalent)
- [ ] Version bumped in `package.json`
- [ ] Changelog updated in `RELEASE_PLANNING.md` or changelog file
- [ ] Git tag created (`git tag vX.Y.Z`)
- [ ] Tag pushed to repository (`git push origin vX.Y.Z`)

### Automated Release Steps

The release automation in udi-js performs these steps:

1. **Trigger**: Manual workflow dispatch with parameters
   - `version`: Semantic version (e.g., `1.0.0`)
   - `prerelease`: Boolean flag for pre-release versions
   
2. **Build**: Compile and package the application
   - Build TypeScript/JavaScript code
   - Bundle dependencies
   - Create distribution package
   
3. **Generate Artifacts**:
   - `iox-matter-bridge-vX.Y.Z.tar.gz` - Compressed tarball
   - `iox-matter-bridge-vX.Y.Z.sbom.json` - SBOM (Syft/CycloneDX)
   - `checksums-vX.Y.Z.txt` - SHA256 checksums
   - `iox-matter-bridge-vX.Y.Z.tar.gz.sig` - GPG signature (optional)

4. **Publish to GitHub**:
   - Create or update tag in this repository
   - Create GitHub Release
   - Upload all artifacts
   - Set release notes from changelog

5. **Validation**: Automated checks verify:
   - All required artifacts present
   - Checksums match
   - SBOM is valid JSON
   - Artifacts are downloadable

### Post-Release

After release publication:

1. **Automatic Validation**: GitHub Actions validates artifacts
2. **Monitoring**: Watch for issues reported by users
3. **Announcement**: Update relevant channels/documentation
4. **Health Check**: Verify downloads and checksums

## Versioning Strategy

IoX Matter Bridge follows [Semantic Versioning](https://semver.org/):

```
vMAJOR.MINOR.PATCH[-PRERELEASE]
```

### Version Components

- **MAJOR** (vX.0.0): Breaking changes, incompatible API changes
- **MINOR** (v1.X.0): New features, backward-compatible
- **PATCH** (v1.0.X): Bug fixes, backward-compatible

### Pre-release Versions

- **Alpha** (`v1.0.0-alpha.1`): Early development, unstable
- **Beta** (`v1.0.0-beta.1`): Feature-complete, testing
- **RC** (`v1.0.0-rc.1`): Release candidate, final testing

### Version Bumping Rules

| Change Type | Example | Version Bump |
|-------------|---------|--------------|
| Bug fix | Fix crash on startup | PATCH |
| New feature | Add new device type | MINOR |
| Breaking change | Remove deprecated API | MAJOR |
| Security fix | Fix auth bypass | PATCH (or MINOR) |

## Artifact Specifications

### Tarball Structure

```
iox-matter-bridge/
├── bin/
│   └── iox-matter-bridge          # Executable
├── lib/
│   └── ...                         # Libraries and dependencies
├── config/
│   └── default.json               # Default configuration
├── README.md                       # Quick start guide
├── LICENSE                        # License file
└── package.json                   # Package metadata
```

### SBOM Format

Software Bill of Materials follows SPDX 2.3 format:

```json
{
  "spdxVersion": "SPDX-2.3",
  "dataLicense": "CC0-1.0",
  "SPDXID": "SPDXRef-DOCUMENT",
  "name": "iox-matter-bridge",
  "packages": [
    {
      "name": "package-name",
      "versionInfo": "1.0.0",
      "licenseDeclared": "MIT",
      ...
    }
  ]
}
```

### Checksums File Format

```
<SHA256_HASH>  iox-matter-bridge-v1.0.0.tar.gz
<SHA256_HASH>  iox-matter-bridge-v1.0.0.zip
<SHA256_HASH>  iox-matter-bridge-v1.0.0.sbom.json
```

## Release Channels

### Stable Releases

- **Pattern**: `vX.Y.Z`
- **Frequency**: As needed (typically monthly or quarterly)
- **Support**: Latest stable + previous minor (for 60 days)
- **Use Case**: Production deployments

### Pre-releases

- **Alpha**: Early testing, frequent changes
- **Beta**: Feature-complete, stability testing
- **RC**: Final testing before stable

**Note**: Pre-releases are not supported and may contain bugs.

## Rollback Strategy

If a release has critical issues:

1. **Document Issue**: Create issue in this repository
2. **Mark Release**: Edit release notes with warning
3. **Patch Release**: Prepare hotfix in udi-js
4. **Quick Release**: Expedite patch release process
5. **Communication**: Notify users via release notes

### Yanking Releases

In severe cases (security vulnerability, data loss):

1. Delete the GitHub Release (artifacts remain accessible by direct URL)
2. Create issue explaining why release was yanked
3. Release fixed version ASAP

## Testing Releases

### Before Publishing

Test in udi-js repository:
- Unit tests
- Integration tests
- E2E tests
- Manual smoke tests

### After Publishing

Validation checks:
- Download each artifact
- Verify checksums
- Test installation on target platforms
- Verify basic functionality

## Metrics to Track

Monitor these metrics for releases:

- Download counts (per artifact)
- Issue reports (per version)
- Time to discovery for bugs
- Upgrade success rate
- Checksum verification failures

## Tools and Dependencies

### Required Tools

- **Syft** or **CycloneDX**: SBOM generation
- **sha256sum**: Checksum generation
- **gpg**: Signature creation (optional)
- **GitHub CLI**: Release management
- **jq**: JSON processing

### GitHub Actions

Workflows used in automation:
- `publish-release.yml` (in udi-js)
- `validate-release.yml` (in this repo)
- `sync-labels.yml` (in this repo)

## Security Considerations

### Artifact Signing

GPG signing process:
1. Generate/use GPG key
2. Sign tarball: `gpg --detach-sign --armor iox-matter-bridge-vX.Y.Z.tar.gz`
3. Upload `.sig` file with release
4. Publish public key for verification

### Checksum Generation

```bash
sha256sum iox-matter-bridge-v*.tar.gz > checksums-vX.Y.Z.txt
sha256sum iox-matter-bridge-v*.zip >> checksums-vX.Y.Z.txt
sha256sum iox-matter-bridge-v*.sbom.json >> checksums-vX.Y.Z.txt
```

### SBOM Generation

Using Syft:
```bash
syft packages dir:./dist -o spdx-json > iox-matter-bridge-vX.Y.Z.sbom.json
```

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Artifact upload fails | Network/auth issue | Retry with fresh token |
| Checksum mismatch | File modified after hash | Regenerate checksums |
| SBOM generation fails | Missing dependencies | Install Syft/CycloneDX |
| Tag already exists | Previous release | Delete tag or increment version |

### Release Validation Failures

If automated validation fails:
1. Check workflow logs
2. Verify all artifacts uploaded
3. Test checksum verification manually
4. Re-run release process if needed

## Future Improvements

Planned enhancements:
- [ ] Automated GPG signing
- [ ] Multi-platform builds (Linux, macOS, Windows)
- [ ] Container images (Docker)
- [ ] Homebrew formula
- [ ] APT/YUM repository
- [ ] Automated release notes generation
- [ ] Changelog automation

## Contacts

**Release Management**: @pradeepmouli

**Automation Issues**: [udi-js repository issues](https://github.com/pradeepmouli/udi-js/issues)

**Artifact Issues**: [This repository issues](https://github.com/pradeepmouli/iox-matter-bridge/issues)

---

**Last Updated**: 2024-11
**Version**: 1.0
