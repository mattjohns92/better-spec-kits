# Releasing Better Spec Kit

Better Spec Kit is published to npm through GitHub Actions using npm
Trusted Publishing.

## Release process

Better Spec Kit releases are published to npm automatically through
GitHub Actions when a version tag is pushed.

1. Set the version to `0.5.1` consistently in `VERSION`, `package.json`, and `package-lock.json`.
2. Run release validation

   ```bash
   npm test
   npm pack --dry-run --json
   ```

3. Inspect the dry-run output. Confirm the package filename is
   `better-spec-kit-0.5.1.tgz`, `skills/speckit-analyze/SKILL.md`,
   `skills/speckit-remediate/SKILL.md`, and `skills/speckit-review/SKILL.md`
   are included, and no `.github/` files or
   `speckit-converge` copy are included.
4. Commit and push the release changes.
5. Create and push the matching version tag (`v0.5.1`).
6. The publish workflow verifies the tag matches `package.json`, runs
   validation, and publishes the package.
7. Run git commands
   ```bash
   git tag v0.5.1
   git push origin v0.5.1
   ```

## Publishing configuration

Publishing is performed by `.github/workflows/publish.yml`.

The npm package must have GitHub Actions configured as a Trusted
Publisher for this repository.

No long-lived npm publishing token should be stored in the repository.
