# Releasing Better Spec Kit

1. Check the package name is available and that you own it on npm.
2. The **first publish** may need to be completed manually (`npm login`, then `npm publish --access public`) to establish the package before configuring trusted publishing. Enable npm account 2FA.
3. On npm package settings → Trusted Publishers, configure GitHub Actions:
   - Owner: `mattjohns92`
   - Repository: `better-spec-kits`
   - Workflow: `publish.yml`
   - Allow direct `npm publish` (or adjust workflow to staged publishing).
4. Push changes to `main` and verify CI passes.
5. Set `package.json` and `VERSION` to the release version and commit.
6. Create and push the matching tag, e.g. `git tag v0.4.0 && git push origin v0.4.0`.
7. Verify GitHub Actions Publish npm succeeded and `npx better-spec-kit@latest --version` works.

Tag pushes are the only automatic publication trigger. The release workflow checks that tag, VERSION and package.json match. It uses OIDC trusted publishing, not a stored npm token.

**Important:** npm package names are first-come-first-served. If `better-spec-kit` is already owned by another publisher, choose an available name and update package metadata and installation instructions before publishing.
