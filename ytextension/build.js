const esbuild = require("esbuild");

const opts = {
  entryPoints: ["src/main.js"],   // your real entry (build.js or main.js)
  bundle: true,
  outfile: "dist/content.js",
  minify: false,
  sourcemap: true,
  target: ["es2020"],
  format: "iife", // IMPORTANT for browser extensions content scripts
  logLevel: "info"
};

async function buildOnce() {
  await esbuild.build(opts);
  console.log("[BUILD] done -> dist/content.js");
}

async function watchBuild() {
  const ctx = await esbuild.context(opts);

  await ctx.watch();

  console.log("[BUILD] watching...");


}

async function main() {
  try {
    if (process.argv.includes("--watch")) {
      await watchBuild();
    } else {
      await buildOnce();
    }
  } catch (err) {
    console.error("[BUILD ERROR]", err);
    process.exit(1);
  }
}

main();