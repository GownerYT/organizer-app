const fs = require("node:fs");
const path = require("node:path");

function getOutputDirectory(context) {
  const projectDirectory = context.packager?.projectDir ?? process.cwd();
  return context.outDir ?? path.join(projectDirectory, "release");
}

exports.default = async function beforePack(context) {
  const outputDirectory = getOutputDirectory(context);
  const existingDatabase = path.join(
    outputDirectory,
    "win-unpacked",
    "organizer.db",
  );
  const backupDatabase = path.join(outputDirectory, ".organizer-db-backup");

  if (fs.existsSync(backupDatabase)) {
    fs.unlinkSync(backupDatabase);
  }
  if (fs.existsSync(existingDatabase)) {
    fs.copyFileSync(existingDatabase, backupDatabase);
  }
};
