import { useState } from "react";

import {
  formatTaskDate,
  validateTaskName,
} from "../../shared/taskValidation.js";

export default function TaskItem({ task, onUpdate, onDelete, isBusy }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(task.name);
  const [error, setError] = useState("");

  async function saveName() {
    const nameError = validateTaskName(name);
    if (nameError) {
      setError(nameError);
      return;
    }

    try {
      await onUpdate({ id: task.id, name: name.trim() });
      setName(name.trim());
      setError("");
      setIsEditing(false);
    } catch {
      // The app-level alert contains the safe database error.
    }
  }

  function cancelEdit() {
    setName(task.name);
    setError("");
    setIsEditing(false);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      void saveName();
    }
    if (event.key === "Escape") cancelEdit();
  }

  return (
    <article className="task-item">
      <div className="task-details">
        {isEditing ? (
          <>
            <label className="visually-hidden" htmlFor={`edit-task-${task.id}`}>
              Edit task name
            </label>
            <input
              className="task-edit-input"
              id={`edit-task-${task.id}`}
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={handleKeyDown}
              aria-invalid={Boolean(error)}
              autoFocus
            />
            {error && <span className="field-error">{error}</span>}
          </>
        ) : (
          <h3>{task.name}</h3>
        )}
        <p className="task-date">Due {formatTaskDate(task.completionDate)}</p>
      </div>
      <div className="task-actions">
        {isEditing ? (
          <>
            <button
              className="button button-primary button-small"
              type="button"
              onClick={() => void saveName()}
              disabled={isBusy}
            >
              Save
            </button>
            <button
              className="button button-ghost button-small"
              type="button"
              onClick={cancelEdit}
              disabled={isBusy}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            className="button button-ghost button-small"
            type="button"
            onClick={() => setIsEditing(true)}
            disabled={isBusy}
          >
            Edit
          </button>
        )}
        <button
          className="button button-danger button-small"
          type="button"
          onClick={() => void onDelete(task.id)}
          disabled={isBusy}
          aria-label={`Delete ${task.name}`}
        >
          Delete
        </button>
      </div>
    </article>
  );
}
