const path = require("node:path");

const { app, BrowserWindow, dialog, ipcMain } = require("electron");

const { TaskDatabase } = require("./database.cjs");

let database;
let validation;

function getDatabasePath() {
  const baseDirectory = app.isPackaged
    ? path.dirname(app.getPath("exe"))
    : app.getAppPath();
  return path.join(baseDirectory, "organizer.db");
}

function getIconPath() {
  return path.join(app.getAppPath(), "public", "icon.ico");
}

function createWindow() {
  const window = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 360,
    minHeight: 500,
    backgroundColor: "#222222",
    icon: getIconPath(),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  if (!app.isPackaged) {
    window.loadURL("http://localhost:5173");
  } else {
    window.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }

  return window;
}

function registerIpcHandlers() {
  ipcMain.handle("tasks:get", () => database.getTasks());
  ipcMain.handle("tasks:create", (_event, input) => {
    const task = validation.assertValidTaskInput(input ?? {});
    return database.createTask(task);
  });
  ipcMain.handle("tasks:update", (_event, input) => {
    const taskId = validation.assertValidTaskId(input?.id);
    const nameError = validation.validateTaskName(input?.name);
    if (nameError) throw new Error(nameError);
    return database.updateTask({ id: taskId, name: input.name });
  });
  ipcMain.handle("tasks:delete", (_event, id) => database.deleteTask(id));
  ipcMain.handle("tasks:delete-all", () => database.deleteAllTasks());
}

async function start() {
  validation = await import("../shared/taskValidation.js");
  database = await new TaskDatabase(getDatabasePath()).init();
  registerIpcHandlers();
  createWindow();
}

app
  .whenReady()
  .then(start)
  .catch((error) => {
    console.error("Organizer failed to start:", error);
    dialog.showErrorBox(
      "Organizer could not start",
      "The local task database could not be opened.",
    );
    app.quit();
  });

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (database) database.close();
});
