const fs = require("node:fs");
const path = require("node:path");

exports.default = async function afterPack(context) {
  const { rcedit } = await import("rcedit");
  const projectDirectory = context.packager?.projectDir ?? process.cwd();
  const outputDirectory =
    context.appOutDir ?? path.join(context.outDir, "win-unpacked");
  const sourceIcon = path.join(projectDirectory, "public", "icon.ico");
  const outputIcon = path.join(outputDirectory, "icon.ico");
  const executablePath = path.join(outputDirectory, "Organizer.exe");
  const backupDatabase = path.join(
    context.outDir ?? path.join(projectDirectory, "release"),
    ".organizer-db-backup",
  );

  fs.copyFileSync(sourceIcon, outputIcon);
  await rcedit(executablePath, { icon: sourceIcon });
  if (fs.existsSync(backupDatabase)) {
    fs.copyFileSync(backupDatabase, path.join(outputDirectory, "organizer.db"));
    fs.unlinkSync(backupDatabase);
  }
};
