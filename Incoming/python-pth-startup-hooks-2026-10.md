---
category: Flames
title: Executable import lines in Python .pth files that run on every interpreter start
hypothesis: An adversary who has landed code on a developer workstation, CI runner or Python-based server
  (most often through a poisoned PyPI package) is persisting by leaving a path-configuration file (`*.pth`)
  containing an executable `import` line in a Python `site-packages` / `dist-packages` directory, so that
  their payload runs at the start of every Python interpreter on that host, in every process that uses
  that environment, with no import of the malicious package required.
tactics:
- Persistence
techniques:
- T1546.018
tags:
- persistence
- python
- pth
- sitepackages
- supply_chain
- pypi
- teampcp
- litellm
- fileevents
- processcreation
- linux
- windows
- macos
- developer_endpoint
- ci_cd
submitter:
  name: V3nom tech
  link: 'https://github.com/v3nomtech'
related_hunt_ids:
- H103
- H150
- H282
- H283
- H296
- B020
notes: Sweep site directories for `.pth` files with executable `import` lines (and `.start` files on Python
  3.15+), stack them by filename and hash across the fleet, and look for the same child process under
  many unrelated Python parents.
---

Executable import lines in Python .pth files that run on every interpreter start

Why
- The technique is in active use. On 24 March 2026 the TeamPCP campaign published `litellm` 1.82.8 to PyPI with a `litellm_init.pth` that ran a credential stealer on every Python process start on any machine where the package was installed, whether or not LiteLLM was ever imported. It collected environment variables, SSH keys, cloud and Kubernetes credentials, CI/CD secrets and wallet files, and used service-account tokens to create privileged pods. MITRE lists both TeamPCP Cloud Stealer and Mini Shai-Hulud as procedure examples for T1546.018.
- It defeats the controls most teams rely on for package risk. The hook is an interpreter feature, not a `setup.py` or post-install script, so install-script scanners do not flag it. The file is written by `pip` and recorded in `RECORD`, so creation-based detections that exclude package managers pass over it. Hunting the content and fleet prevalence of `.pth` files, rather than who created them, exposes the hook.
- It persists beyond the package. Uninstalling or downgrading the package does not always remove a stray `.pth`, and a hand-placed hook in the per-user site directory needs no elevated rights and survives virtualenv rebuilds of unrelated projects.
- The blast radius is every Python process on the host: build jobs, Ansible runs, cloud CLIs, ML training, notebooks, security tooling. On a CI runner or AI gateway that means cloud keys and deployment tokens.
- The hunt is cheap and repeatable. The benign population is tiny and stable (13 `.pth` files, 5 distinct benign hook types on the workstation this was tested on), so a first pass produces a short list to review, and the result converts directly into a content-hash allowlist and a standing detection.
- HEARTH has hunts on npm install scripts, PyPI loaders and the LiteLLM gateway exploitation chain, but none on Python startup hooks as a persistence mechanism.

Implementation Notes
How the hook works. At startup, `site.py` reads every `*.pth` file sitting directly in each site directory (system `site-packages` / `dist-packages`, each virtualenv, and the per-user site: `~/.local/lib/pythonX.Y/site-packages`, `%APPDATA%\Python\PythonXY\site-packages`). Any line starting with `import` followed by a space or tab is passed to `exec()`. Everything after the `import` on that line runs, so one line is enough for a full payload. The same pass imports `sitecustomize.py` and `usercustomize.py` if present, so include them in scope. Two more locations belong in scope. On Windows the interpreter or virtualenv root (`sys.prefix`) is itself a site directory, so a `.pth` next to `python.exe` or `pyvenv.cfg` is processed too. From Python 3.15 (PEP 829) the same directories also hold `<name>.start` files, in which every non-comment line is a `package.module:callable` entry point called at startup; a `.pth` `import` line is ignored only when a `.start` file with the same base name sits beside it.

Data needed.
- File inventory with content or hash for `*.pth`, `*.start`, `sitecustomize.py`, `usercustomize.py` in site directories (osquery, Velociraptor, EDR live response, or a scripted sweep).
- File create/modify telemetry (Sysmon EID 11, auditd, Defender `DeviceFileEvents`, Elastic Defend file events).
- Process creation with parent and command line (Sysmon EID 1, auditd `execve`, `DeviceProcessEvents`).
- Optional: DNS / proxy logs for the egress leg.

Leg 1: content sweep (the main hunt). List every `.pth` file that contains an executable line:


find / -xdev \( -path '*/site-packages/*.pth' -o -path '*/dist-packages/*.pth' \) -type f 2>/dev/null \
  | grep -E '(site|dist)-packages/[^/]+\.pth$' \
  | xargs -r -d '\n' grep -HnE '^import[[:blank:]]'


On hosts with Python 3.15 or later, also list every line of every `.start` file. Every entry point listed there runs at startup, so review each hit:


find / -xdev \( -path '*/site-packages/*.start' -o -path '*/dist-packages/*.start' \) -type f 2>/dev/null \
  | grep -E '(site|dist)-packages/[^/]+\.start$' \
  | xargs -r -d '\n' grep -Hn .


Windows equivalent. `-Force` is required because `AppData`, which holds the per-user site and the default per-user install, is a hidden folder. The `python.exe` / `pyvenv.cfg` tests pick up hooks in an interpreter or virtualenv root. Re-run with `-Filter *.start` and `-Pattern '\S'` for `.start` files:


Get-ChildItem -Path C:\ -Recurse -Force -File -Filter *.pth -ErrorAction SilentlyContinue |
  Where-Object { $_.DirectoryName -match '(site|dist)-packages$' -or
                 (Test-Path -LiteralPath (Join-Path $_.DirectoryName 'python.exe')) -or
                 (Test-Path -LiteralPath (Join-Path $_.DirectoryName 'pyvenv.cfg')) } |
  Select-String -Pattern '^import[ \t]'


Triage what comes back in this order:
1. Lines containing `exec(`, `eval(`, `base64`, `b64decode`, `zlib`, `marshal`, `subprocess`, `os.system`, `Popen`, `urllib`, `requests`, `socket`, or a long encoded blob.
2. File size. Legitimate `.pth` files are a few hundred bytes. The `litellm_init.pth` in the March 2026 LiteLLM compromise was 34,628 bytes.
3. A `.pth` whose filename does not match any installed distribution in the same directory, or is not listed in any `*.dist-info/RECORD`.
4. A `.pth` in the per-user site directory or in the system interpreter of a server that has no reason to have developer tooling.

Leg 2: fleet stacking. Group by (filename, file hash) across hosts. The benign set is small and repeats everywhere; anything on one to three hosts is the lead. Sample KQL over file events. It stacks on `SHA1` because Defender usually leaves `SHA256` empty in `DeviceFileEvents`, and an empty hash would merge every same-named file into one common-looking row:


DeviceFileEvents
| where Timestamp > ago(30d)
| where ActionType in ("FileCreated", "FileModified", "FileRenamed")
| where FolderPath matches regex @"(?i)(site|dist)-packages[\\/][^\\/]+\.(pth|start)$"
     or (FileName in~ ("sitecustomize.py", "usercustomize.py") and FolderPath has_any ("site-packages", "dist-packages"))
| summarize hosts = dcount(DeviceId), firstSeen = min(Timestamp),
            writers = make_set(InitiatingProcessFileName, 10), paths = make_set(FolderPath, 5)
            by FileName, SHA1
| where hosts <= 3
| order by firstSeen desc


Do not exclude `pip`, `uv`, `poetry` or `conda` as the writing process. In the supply-chain case the package manager is the writer.

Leg 3: behavior. A startup hook fires for every interpreter, so its side effects show up under unrelated Python parents. For each host, group child process command lines whose parent is `python*`, and count the distinct parent command lines. The same child (a shell, `curl`/`wget`, a second `python -c` with an encoded argument, or the same outbound domain) appearing under many different scripts, including short-lived ones such as `pip --version` or an IDE language server, points at a hook rather than at any one script.

Known-good baseline. Expect and allowlist by content hash, not by name alone: `distutils-precedence.pth` (setuptools), `_virtualenv.pth` (virtualenv), `*-nspkg.pth` (legacy namespace packages), `__editable__.*.pth` and `easy-install.pth` (editable/develop installs), `pywin32.pth`, `a1_coverage.pth` and `pytest-cov.pth` (coverage tooling), and distro helpers such as `cffi-wheels.pth` from Kali's `python-cffi` package. An attacker can reuse any of these names, which is why the hash matters. Baseline `.start` files the same way; a package that supports Python 3.15 may ship one beside its `.pth`.

Limitations and assumptions.
- `.pth` is also the usual extension for PyTorch model checkpoints. Those normally live outside the site directory root, so the path regex above removes them. Do not add a size cap to exclude them: Python executes a padded multi-megabyte `.pth` just the same.
- Hooks are skipped when Python runs with `-S`. The per-user site is skipped with `-s`, `-I` or `PYTHONNOUSERSITE`, and by standard virtualenvs (unless created with `--system-site-packages`), so a hook there fires only for interpreters run outside a virtualenv. Frozen apps (PyInstaller) and many embedded interpreters do not process site directories at all.
- Recent CPython releases ignore hidden (dot-prefixed) `.pth` files on POSIX; older interpreters still load them, so keep hidden files in the sweep.
- `-xdev` keeps `find` on the root filesystem. Where `/home`, `/opt`, `/srv` or `/var` are separate mounts, run the sweep once per mount point.
- The sweeps read lines differently from Python. Python 3.13 and later decodes a `.pth` as `utf-8-sig` and splits it with `str.splitlines()`, so an `import` line placed after a form feed or a Unicode line separator still executes and both sweeps miss it; the grep also misses one placed after a UTF-8 BOM or a bare carriage return. For an exact result, apply the same decode, split and `startswith` test to each file with `python3 -S -E` (`-S` stops the scanning interpreter from loading site hooks itself). Leg 2 still surfaces such files, because stacking does not parse content.
- The KQL keys on `site-packages` / `dist-packages` in the path, so on Windows it does not see a `.pth` written to an interpreter or virtualenv root. Cover that location with the Leg 1 inventory.
- Container images and ephemeral CI runners need the sweep run inside the image or at build time; a host-level file inventory will miss them.
- Non-executable `.pth` lines only add directories to `sys.path`. They are out of scope here but are a related hijack path (T1574) if they point at a writable directory.
- If a malicious hook is found, treat every secret readable by any Python process on that host as exposed, and look for second-stage persistence. In the LiteLLM case that was `~/.config/sysmon/sysmon.py` with a `sysmon.service` systemd user unit.

 References
- MITRE ATT&CK T1546.018, Event Triggered Execution: Python Startup Hooks — https://attack.mitre.org/techniques/T1546/018/
- Datadog Security Labs, "LiteLLM and Telnyx compromised on PyPI: Tracing the TeamPCP supply chain campaign" — https://securitylabs.datadoghq.com/articles/litellm-compromised-pypi-teampcp-supply-chain-campaign/
- SafeDep, "Malicious litellm 1.82.8: Credential Theft and Persistent Backdoor" — https://safedep.io/malicious-litellm-1-82-8-analysis/
- StepSecurity, "litellm: Credential Stealer Hidden in PyPI Wheel" — https://www.stepsecurity.io/blog/litellm-credential-stealer-hidden-in-pypi-wheel
- LiteLLM, "Security Update: Suspected Supply Chain Incident" — https://docs.litellm.ai/blog/security-update-march-2026
- Elastic Security prebuilt rule, "Python Path File (pth) Creation" — https://www.elastic.co/guide/en/security/8.19/python-path-file-pth-creation.html
- Python documentation, `site` module (how `.pth`, `sitecustomize` and `usercustomize` are processed) — https://docs.python.org/3/library/site.html
- CPython issue #113659, "Security risk of hidden pth files" — https://github.com/python/cpython/issues/113659
- Atomic Red Team, T1546.018 atomic tests (`.pth` and `usercustomize.py` on Windows, Linux and macOS) — https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1546.018/T1546.018.md
- PEP 829, Package Startup Configuration Files (`<name>.start`, Python 3.15) — https://peps.python.org/pep-0829/
- Microsoft Learn, `DeviceFileEvents` table schema (hash column guidance) — https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicefileevents-table
- Related HEARTH hunts: H103 (npm install-script stealers), H150 (PyPI native-DLL loader), H282 / H283 / H296 (LiteLLM gateway exploitation), B020 (dependency-install baseline on CI runners)
