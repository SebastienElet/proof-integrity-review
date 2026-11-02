#!/usr/bin/env bun
import { accessSync, constants, existsSync } from "node:fs";
import { basename, dirname, join } from "node:path";

const platform = `${process.platform}-${process.arch}`;
const variants: Record<string, string> = {
  "darwin-arm64": "darwin-arm64",
  "linux-x64": "linux-x64-gnu",
};
const variant = variants[platform];
if (!variant) {
  console.error(`Unsupported platform ${platform}; supported: macOS ARM64, Linux x64 glibc.`);
  process.exit(2);
}
const packageName = `@sebastienelet/proof-integrity-review-${variant}`;
let binary: string | undefined;
for (let directory = import.meta.dir; ; directory = dirname(directory)) {
  const candidate = join(directory, "node_modules", packageName, "bin/proof-integrity");
  if (basename(directory) !== "node_modules" && existsSync(candidate)) {
    binary = candidate;
    break;
  }
  if (dirname(directory) === directory) break;
}
if (!binary) {
  console.error(`Missing native package ${packageName}; install with Bun and optional dependencies enabled.`);
  process.exit(2);
}
try {
  accessSync(binary, constants.X_OK);
  const child = Bun.spawnSync([binary, ...process.argv.slice(2)], {
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });
  if (child.signalCode) process.kill(process.pid, child.signalCode);
  process.exitCode = child.exitCode;
} catch (error) {
  console.error(`Cannot execute native CLI ${binary}: ${String(error)}`);
  process.exitCode = 2;
}
