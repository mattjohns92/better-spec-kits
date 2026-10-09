# Installation

## Prerequisite

Initialise GitHub Spec Kit in the target project first.

## PowerShell

```powershell
.\install.ps1 C:\Projects\MyProject
```

Use `-InstallConstitution` only when you intentionally want the neutral Better Spec Kit constitution to replace the target constitution. Existing managed files require `-Force`; backups are created unless `-NoBackup` is explicitly supplied.

## macOS / Linux

```bash
./install.sh /path/to/MyProject
```

Set `FORCE=1` to replace existing managed skill files. Set `INSTALL_CONSTITUTION=1` to adopt the neutral constitution.
