import { expect, test } from "bun:test";
import { mkdtemp, cp, mkdir, rm, writeFile, chmod } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("reports a missing native optional dependency without downloading or building", async () => {
  const root = await mkdtemp(join(tmpdir(), "proof-launcher-"));
  try {
    await mkdir(join(root, "bin"));
    await cp(new URL("../bin/proof-integrity.ts", import.meta.url), join(root, "bin/proof-integrity.ts"));
    const result = Bun.spawnSync([process.execPath, join(root, "bin/proof-integrity.ts"), "--help"]);
    expect(result.exitCode).toBe(2);
    expect(result.stdout.toString()).toBe("");
    expect(result.stderr.toString()).toContain("Missing native package");
    expect(result.stderr.toString()).toContain("optional dependencies");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("forwards arguments, input, output and native exit status", async () => {
  const root = await mkdtemp(join(tmpdir(), "proof-launcher-"));
  try {
    await mkdir(join(root, "bin"));
    await cp(new URL("../bin/proof-integrity.ts", import.meta.url), join(root, "bin/proof-integrity.ts"));
    const variant = process.platform === "darwin" ? "darwin-arm64" : "linux-x64-gnu";
    const native = join(root, "node_modules/@sebastienelet", `proof-integrity-review-${variant}`, "bin");
    await mkdir(native, { recursive: true });
    const binary = join(native, "proof-integrity");
    await writeFile(binary, '#!/usr/bin/env bun\nconsole.log(JSON.stringify(process.argv.slice(2)));\nconsole.error(await Bun.stdin.text());\nprocess.exit(7);\n');
    await chmod(binary, 0o755);
    const child = Bun.spawn([process.execPath, join(root, "bin/proof-integrity.ts"), "digest", "--file", "space name"], {
      stdin: new TextEncoder().encode("native input"), stdout: "pipe", stderr: "pipe",
    });
    expect(await child.exited).toBe(7);
    expect(await new Response(child.stdout).text()).toBe('["digest","--file","space name"]\n');
    expect(await new Response(child.stderr).text()).toBe("native input\n");
    await chmod(binary, 0o644);
    const failed = Bun.spawnSync([process.execPath, join(root, "bin/proof-integrity.ts"), "--help"]);
    expect(failed.exitCode).toBe(2);
    expect(failed.stderr.toString()).toContain("Cannot execute native CLI");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("preserves termination by a native signal", async () => {
  const root = await mkdtemp(join(tmpdir(), "proof-launcher-"));
  try {
    await mkdir(join(root, "bin"));
    await cp(new URL("../bin/proof-integrity.ts", import.meta.url), join(root, "bin/proof-integrity.ts"));
    const variant = process.platform === "darwin" ? "darwin-arm64" : "linux-x64-gnu";
    const native = join(root, "node_modules/@sebastienelet", `proof-integrity-review-${variant}`, "bin");
    await mkdir(native, { recursive: true });
    const binary = join(native, "proof-integrity");
    await writeFile(binary, '#!/usr/bin/env bun\nprocess.kill(process.pid, "SIGTERM");\n');
    await chmod(binary, 0o755);
    const child = Bun.spawn([process.execPath, join(root, "bin/proof-integrity.ts")], { stdout: "pipe", stderr: "pipe" });
    await child.exited;
    expect(child.signalCode).toBe("SIGTERM");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
