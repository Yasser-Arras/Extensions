const esbuild = require("esbuild");

const buildOptions = {
  entryPoints: ["src/main.js"],
  bundle: true,
  outfile: "dist/content.js",
  minify: false,
  sourcemap: true
};

async function run() {
  const watch = process.argv.includes("--watch");
  if (watch) {
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    console.log("waiting for changes...");
    return;
  }
  await esbuild.build(buildOptions);
  console.log("built dist/content.js");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
