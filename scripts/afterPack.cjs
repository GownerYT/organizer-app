const fs = require("node:fs");
const path = require("node:path");

exports.default = async function afterPack(context) {
  const projectDirectory = context.packager?.projectDir ?? process.cwd();
  const outputDirectory =
    context.appOutDir ?? path.join(context.outDir, "win-unpacked");
  const sourceIcon = path.join(projectDirectory, "public", "icon.ico");
  const outputIcon = path.join(outputDirectory, "icon.ico");

  fs.copyFileSync(sourceIcon, outputIcon);
};
