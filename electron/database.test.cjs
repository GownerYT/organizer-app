const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { TaskDatabase } = require("./database.cjs");

async function createDatabase() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "organizer-test-"));
  const database = await new TaskDatabase(
    path.join(directory, "organizer.db"),
  ).init();
  return { database, directory };
}

test("persists tasks and supports updating name and due date", async () => {
  const { database, directory } = await createDatabase();
  const created = database.createTask({
    name: "Buy milk",
    completionDate: "2026-11-08",
  });

  assert.equal(created.name, "Buy milk");
  assert.equal(created.completionDate, "2026-11-08");
  assert.equal(database.getTasks().length, 1);
  database.updateTask({
    id: created.id,
    name: "Buy oat milk",
    completionDate: "2026-11-09",
  });
  assert.equal(database.getTasks()[0].name, "Buy oat milk");
  assert.equal(database.getTasks()[0].completionDate, "2026-11-09");
  database.deleteTask(created.id);
  assert.deepEqual(database.getTasks(), []);

  database.close();
  const reopened = await new TaskDatabase(
    path.join(directory, "organizer.db"),
  ).init();
  assert.deepEqual(reopened.getTasks(), []);
  reopened.close();
});

test("deletes every task only through the explicit database operation", async () => {
  const { database } = await createDatabase();
  database.createTask({ name: "First", completionDate: "2026-11-08" });
  database.createTask({ name: "Second", completionDate: "2026-11-09" });

  assert.equal(database.getTasks().length, 2);
  database.deleteAllTasks();
  assert.deepEqual(database.getTasks(), []);
  database.close();
});

test("rejects invalid task input before writing to SQLite", async () => {
  const { database } = await createDatabase();

  assert.throws(
    () => database.createTask({ name: "   ", completionDate: "2026-11-08" }),
    /task name/,
  );
  assert.deepEqual(database.getTasks(), []);
  database.close();
});
