# Installation

Better Spec Kit v0.4+ uses a cross-platform Node.js CLI.

## Public installation

Once published to npm:

```bash
npx better-spec-kit@latest
```

Run it from the root of a project where GitHub Spec Kit is already initialised.

## Local development

From the Better Spec Kit repository:

```bash
npm link
```

Then, from a disposable Spec Kit project:

```bash
better-spec-kit
```

The CLI previews managed-file changes, including the Review skill as `ADD` for projects that do not have it. Fresh installs and updates install `.github/skills/speckit-review/SKILL.md` through the existing managed-skill process. `status` reports whether Review is installed, and `doctor` flags a missing Review skill in an installed Better Spec Kit project.

The installer preserves the existing constitution by default, backs up replaced files outside the target repository, and requires explicit approval for customized or unknown managed files.
