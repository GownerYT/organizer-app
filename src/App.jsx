import { useCallback, useEffect, useState } from "react";

import ConfirmDialog from "./components/ConfirmDialog.jsx";
import Header from "./components/Header.jsx";
import TaskForm from "./components/TaskForm.jsx";
import TaskList from "./components/TaskList.jsx";

const api = window.organizer;

function getErrorMessage(error) {
  const message = error instanceof Error ? error.message : "";
  const safeMessages = new Set([
    "Enter a task name.",
    "Choose a due date.",
    "Choose a valid due date.",
    "That task could not be found.",
    "We could not complete that task operation. Please try again.",
  ]);

  return safeMessages.has(message)
    ? message
    : "Something went wrong. Please try again.";
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);

  const loadTasks = useCallback(async () => {
    if (!api) {
      throw new Error("Organizer is not connected to its desktop services.");
    }

    const loadedTasks = await api.getTasks();
    setTasks(loadedTasks);
  }, []);

  useEffect(() => {
    let isMounted = true;

    loadTasks()
      .catch((loadError) => {
        if (isMounted) setError(getErrorMessage(loadError));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [loadTasks]);

  async function runTaskOperation(operation) {
    setError("");
    setIsBusy(true);

    try {
      await operation();
      await loadTasks();
    } catch (operationError) {
      const message = getErrorMessage(operationError);
      setError(message);
      throw operationError;
    } finally {
      setIsBusy(false);
    }
  }

  async function handleCreateTask(input) {
    return runTaskOperation(() => api.createTask(input));
  }

  async function handleUpdateTask(input) {
    return runTaskOperation(() => api.updateTask(input));
  }

  async function handleDeleteTask(id) {
    return runTaskOperation(() => api.deleteTask(id));
  }

  async function handleDeleteAllTasks() {
    setIsDeleteAllOpen(false);
    return runTaskOperation(() => api.deleteAllTasks());
  }

  return (
    <div className="app-shell">
      <Header />
      <main className="main-content">
        <section className="content-container" aria-labelledby="tasks-heading">
          <div className="visually-hidden" id="tasks-heading">
            Task manager
          </div>
          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}
          <TaskForm
            onCreate={handleCreateTask}
            onDeleteAll={() => setIsDeleteAllOpen(true)}
            taskCount={tasks.length}
            isBusy={isBusy || isLoading}
          />
          <TaskList
            tasks={tasks}
            onUpdate={handleUpdateTask}
            onDelete={handleDeleteTask}
            isBusy={isBusy || isLoading}
          />
        </section>
      </main>
      <ConfirmDialog
        open={isDeleteAllOpen}
        onCancel={() => setIsDeleteAllOpen(false)}
        onConfirm={handleDeleteAllTasks}
        isBusy={isBusy}
      />
    </div>
  );
}
