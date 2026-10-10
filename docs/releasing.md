# Releasing Better Spec Kit

Better Spec Kit is published to npm through GitHub Actions using npm
Trusted Publishing.

## Release process

Better Spec Kit releases are published to npm automatically through
GitHub Actions when a version tag is pushed.

1. Run release validation

   ```bash
   npm test
   npm pack --dry-run2. Run the full test suite.
   ```

2. Verify the npm package contents with `npm pack --dry-run`.
3. Update the version in `package.json`.
4. Commit and push the release changes.
5. Create and push the matching version tag (for example `v0.5.0`).
6. The publish workflow verifies the tag matches `package.json`, runs
   validation, and publishes the package.
7. Run git commands
   ```bash
   git tag v0.5.0
   git push origin v0.5.0
   ```

## Publishing configuration

Publishing is performed by `.github/workflows/publish.yml`.

The npm package must have GitHub Actions configured as a Trusted
Publisher for this repository.

No long-lived npm publishing token should be stored in the repository.
