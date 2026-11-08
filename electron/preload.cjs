const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("organizer", {
  getTasks: () => ipcRenderer.invoke("tasks:get"),
  createTask: (input) => ipcRenderer.invoke("tasks:create", input),
  updateTask: (input) => ipcRenderer.invoke("tasks:update", input),
  deleteTask: (id) => ipcRenderer.invoke("tasks:delete", id),
  deleteAllTasks: () => ipcRenderer.invoke("tasks:delete-all"),
});
