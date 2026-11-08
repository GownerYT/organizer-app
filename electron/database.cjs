const fs = require("node:fs");
const path = require("node:path");

const initSqlJs = require("sql.js");

class TaskDatabase {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.db = null;
    this.validation = null;
  }

  async init() {
    this.validation = await import("../shared/taskValidation.js");
    fs.mkdirSync(path.dirname(this.dbPath), { recursive: true });

    const SQL = await initSqlJs({
      locateFile: () => require.resolve("sql.js/dist/sql-wasm.wasm"),
    });
    const existingBytes = fs.existsSync(this.dbPath)
      ? fs.readFileSync(this.dbPath)
      : undefined;

    this.db = existingBytes
      ? new SQL.Database(existingBytes)
      : new SQL.Database();
    this.db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL CHECK (length(trim(name)) > 0),
        completion_date TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
    this.persist();

    return this;
  }

  ensureReady() {
    if (!this.db || !this.validation) {
      throw new Error("The task database is not ready.");
    }
  }

  getTasks() {
    this.ensureReady();
    const statement = this.db.prepare(`
      SELECT id, name, completion_date, created_at, updated_at
      FROM tasks
      ORDER BY created_at DESC, id DESC
    `);
    const tasks = [];

    try {
      while (statement.step()) {
        const row = statement.getAsObject();
        tasks.push({
          id: row.id,
          name: row.name,
          completionDate: row.completion_date,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        });
      }
    } finally {
      statement.free();
    }

    return tasks;
  }

  createTask(input) {
    this.ensureReady();
    const task = this.validation.assertValidTaskInput(input);
    const timestamp = new Date().toISOString();
    const statement = this.db.prepare(`
      INSERT INTO tasks (name, completion_date, created_at, updated_at)
      VALUES (?, ?, ?, ?)
    `);

    try {
      statement.run([task.name, task.completionDate, timestamp, timestamp]);
    } finally {
      statement.free();
    }

    this.persist();
    return this.getTasks()[0];
  }

  updateTask({ id, name }) {
    this.ensureReady();
    const taskId = this.validation.assertValidTaskId(id);
    const nameError = this.validation.validateTaskName(name);
    if (nameError) throw new Error(nameError);

    const statement = this.db.prepare(`
      UPDATE tasks SET name = ?, updated_at = ? WHERE id = ?
    `);
    try {
      statement.run([name.trim(), new Date().toISOString(), taskId]);
    } finally {
      statement.free();
    }

    if (this.db.getRowsModified() === 0) {
      throw new Error("That task could not be found.");
    }

    this.persist();
    return this.getTasks().find((task) => task.id === taskId);
  }

  deleteTask(id) {
    this.ensureReady();
    const taskId = this.validation.assertValidTaskId(id);
    const statement = this.db.prepare("DELETE FROM tasks WHERE id = ?");

    try {
      statement.run([taskId]);
    } finally {
      statement.free();
    }

    if (this.db.getRowsModified() === 0) {
      throw new Error("That task could not be found.");
    }

    this.persist();
    return { id: taskId };
  }

  deleteAllTasks() {
    this.ensureReady();
    this.db.run("DELETE FROM tasks");
    this.persist();
    return { deleted: true };
  }

  persist() {
    this.ensureReady();
    const temporaryPath = `${this.dbPath}.tmp`;
    const bytes = Buffer.from(this.db.export());

    fs.writeFileSync(temporaryPath, bytes);
    try {
      fs.renameSync(temporaryPath, this.dbPath);
    } catch (error) {
      if (error.code !== "EPERM" && error.code !== "EACCES") throw error;

      // Some Windows-managed folders reject rename even within one directory.
      // Keep the temporary write, then fall back to a direct replacement.
      fs.copyFileSync(temporaryPath, this.dbPath);
      fs.unlinkSync(temporaryPath);
    }
  }

  close() {
    if (!this.db) return;
    this.persist();
    this.db.close();
    this.db = null;
  }
}

module.exports = { TaskDatabase };
