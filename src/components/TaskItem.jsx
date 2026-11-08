import { useState } from "react";

import {
  formatTaskDate,
  validateTaskInput,
} from "../../shared/taskValidation.js";

export default function TaskItem({ task, onUpdate, onDelete, isBusy }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(task.name);
  const [completionDate, setCompletionDate] = useState(task.completionDate);
  const [errors, setErrors] = useState({});

  async function saveTask() {
    const nextErrors = validateTaskInput({ name, completionDate });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await onUpdate({
        id: task.id,
        name: name.trim(),
        completionDate,
      });
      setName(name.trim());
      setCompletionDate(completionDate);
      setErrors({});
      setIsEditing(false);
    } catch {
      // The app-level alert contains the safe database error.
    }
  }

  function cancelEdit() {
    setName(task.name);
    setCompletionDate(task.completionDate);
    setErrors({});
    setIsEditing(false);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      void saveTask();
    }
    if (event.key === "Escape") cancelEdit();
  }

  return (
    <article className="task-item">
      <div className="task-details">
        {isEditing ? (
          <div className="task-edit-fields">
            <div className="field-group">
              <label htmlFor={`edit-task-${task.id}`}>Task name</label>
              <input
                className="task-edit-input"
                id={`edit-task-${task.id}`}
                value={name}
                onChange={(event) => setName(event.target.value)}
                onKeyDown={handleKeyDown}
                aria-invalid={Boolean(errors.name)}
                autoFocus
              />
            </div>
            <div className="field-group">
              <label htmlFor={`edit-task-date-${task.id}`}>Due date</label>
              <input
                className="task-edit-input"
                id={`edit-task-date-${task.id}`}
                type="date"
                value={completionDate}
                onChange={(event) => setCompletionDate(event.target.value)}
                onKeyDown={handleKeyDown}
                aria-invalid={Boolean(errors.completionDate)}
              />
            </div>
            {(errors.name || errors.completionDate) && (
              <span className="field-error">
                {errors.name || errors.completionDate}
              </span>
            )}
          </div>
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
              onClick={() => void saveTask()}
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
