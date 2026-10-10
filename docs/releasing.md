# Releasing Better Spec Kit

Better Spec Kit is published to npm through GitHub Actions using npm
Trusted Publishing.

## Release process

1. Ensure the working tree is clean.
2. Run the full test suite.
3. Verify the npm package contents with `npm pack --dry-run`.
4. Update the version in `package.json`.
5. Commit and push the release changes.
6. Create and push the matching version tag (for example `v0.5.0`).
7. The publish workflow verifies the tag matches `package.json`, runs
   validation, and publishes the package.

## Publishing configuration

Publishing is performed by `.github/workflows/publish.yml`.

The npm package must have GitHub Actions configured as a Trusted
Publisher for this repository.

No long-lived npm publishing token should be stored in the repository.
