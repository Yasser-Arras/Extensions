const esbuild = require("esbuild");

async function startWatch() {
  const ctx = await esbuild.context({
    entryPoints: ["src/main.js"],
    bundle: true,
    outfile: "dist/content.js",
    minify: false,
    sourcemap: true
  });

  await ctx.watch();
  console.log("waiting for changes...");
}

startWatch();