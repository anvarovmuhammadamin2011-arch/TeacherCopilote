import { build } from "esbuild";
import { mkdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
const directory = ".qa/test-bundles";
await mkdir(directory, { recursive: true });
for (const name of ["mathematics", "workspace-quality"]) {
  const output = `${directory}/${name}.mjs`;
  await build({
    entryPoints: [`tests/${name}.test.ts`],
    outfile: output,
    bundle: true,
    platform: "node",
    format: "esm",
    packages: "external",
    logLevel: "warning",
  });
  const result = spawnSync(process.execPath, [output], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status || 1);
}
