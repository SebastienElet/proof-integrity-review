# Proof Integrity Review

Review changed verification mechanisms. The ordinary review needs no structured receipt or CLI.
An optional `proof-integrity` companion validates content-bound receipt declarations; acceptance
proves neither execution truth, auditor independence nor permission to merge.

This repository prepares `@sebastienelet/proof-integrity-review@0.0.1`. It has not been published
or qualified from the public registry. The initial release targets macOS ARM64 and Linux x64 glibc.
The Linux build/qualification baseline is Ubuntu 24.04; other glibc distributions are unqualified.
Git and Bun 1.4.3 are runtime prerequisites. Rust 1.98.1 is needed only for contribution/rebuilding.

## Installation after publication

Use a durable directory dedicated to the exact version, then:

```sh
bun add --exact @sebastienelet/proof-integrity-review@0.0.1
./node_modules/.bin/proof-integrity --help
```

The package provides `skills/proof-integrity-review/SKILL.md` with its references, evaluations,
policy inputs, Rust sources and tests. Explicitly select this skill in your agent's supported user
skill directory. Acquisition changes no agent configuration, hook or persistent data. Before
creating a skill symlink, resolve the source and inspect the destination; preserve a matching link
and refuse a divergent link or file. Never activate both old and new copies of this slug.
Persistent links must use the durable installation, not a `bunx` cache.

The launcher selects an exact native optional dependency for the host. Enable optional dependencies
when installing. No postinstall, hidden download, fallback build, or system package installation runs.
The Linux package requires glibc; macOS Intel, Linux ARM64, musl and Windows are unsupported.

See [the optional CLI contract](skills/proof-integrity-review/references/cli.md) for policy roots,
commands and receipt schema 5. Old epochs and receipts remain historical. Regenerate a current epoch
and assessment after a policy change; do not rewrite old evidence.

## Contribution and local checks

```sh
bun install --frozen-lockfile --ignore-scripts
bun run typecheck
bun test
cargo fmt --all --check --manifest-path skills/proof-integrity-review/scripts/Cargo.toml
cargo clippy --all-targets --all-features --locked --manifest-path skills/proof-integrity-review/scripts/Cargo.toml -- -D warnings
cargo check --all-targets --all-features --locked --manifest-path skills/proof-integrity-review/scripts/Cargo.toml
cargo test --all-features --locked --manifest-path skills/proof-integrity-review/scripts/Cargo.toml
RUSTDOCFLAGS=-Dwarnings cargo doc --all-features --no-deps --locked --manifest-path skills/proof-integrity-review/scripts/Cargo.toml
```

The transferred CLI integration suite also accepts `PROOF_INTEGRITY_TEST_BIN` as the path to an
installed launcher. This runs the same acceptance, stale/tampered receipt, digest, schema and refusal
cases against the package entry point. Fixture receipts are synthetic validator inputs.
Activation of the skill in Claude, Codex and Cursor requires a separate observed host session;
file presence and trigger scenarios alone do not demonstrate activation.

## Release and rollback

`release.yml` builds and tests each native target on its own GitHub runner, packs with Bun, and
publishes the two variants before the main package using `npm publish --provenance` and OIDC only.
No npm installation or token fallback is configured. All three packages must trust that workflow
in the npm scope before release. Node 24.21.0 supplies the publishing CLI (npm >=11.5.1).
The GitHub repository and npm trusted publishers are not created by this source preparation.

A release tag matches the package version (`v0.0.1`). Publication across packages is not atomic:
on partial failure, inspect the registry and provenance before retrying; do not overwrite or unpublish
an existing version. A mismatching published version requires investigation and a new version.
After publication, install exact versions with Bun on both targets and repeat the CLI suite;
inspect the registry integrity/provenance and observe skill activation before switching consumers.

Dotfiles consumers, their local builds and CI remain active until those checks pass. Record the old
revision, package/policy version and owned links before activation. Rollback restores only the known
prior links/version; preserve divergent destinations, user settings and historical receipts.
There is no migration script or automatic cleanup.

The original BSD-2-Clause license is preserved. NOTICE records the extraction source;
THIRD-PARTY-NOTICES carries the applicable Rust dependency license texts in all native artifacts.
