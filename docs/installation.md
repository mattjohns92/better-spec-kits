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

The CLI previews managed-file changes, preserves the existing constitution by default, backs up replaced files outside the target repository, and requires explicit approval for files it cannot safely classify.
