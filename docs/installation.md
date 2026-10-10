# Installation

Better Spec Kit is designed to upgrade an existing GitHub Spec Kit project in place.

## Existing Spec Kit project

Run the bootstrap from the project directory or pass the target path explicitly. The installer detects `.specify` and the standard Spec Kit skill layout.

Standard `speckit-plan`, `speckit-tasks`, and `speckit-implement` files are treated as the expected upgrade path. They are backed up outside the repository and replaced after interactive confirmation. `speckit-design` is added.

Existing Better Spec Kit files are treated as an update.

Unknown or customised managed files are flagged separately and require explicit overwrite approval. In non-interactive mode they require `-Force`.

The project constitution is preserved by default. Use `-InstallConstitution` only when the neutral Better Spec Kit constitution is intentionally wanted.

The GitHub bootstrap downloads and extracts Better Spec Kit in the operating-system temporary directory and cleans it up after installation.
