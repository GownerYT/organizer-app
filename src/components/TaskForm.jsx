import { useRef, useState } from "react";

import { validateTaskInput } from "../../shared/taskValidation.js";

export default function TaskForm({ onCreate, onDeleteAll, taskCount, isBusy }) {
  const nameInputRef = useRef(null);
  const [name, setName] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [errors, setErrors] = useState({});

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateTaskInput({ name, completionDate });
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    try {
      await onCreate({ name: name.trim(), completionDate });
      setName("");
      setCompletionDate("");
      setErrors({});
      nameInputRef.current?.focus();
    } catch {
      // The app-level alert contains the safe database error.
    }
  }

  return (
    <section className="task-form-card" aria-labelledby="create-task-heading">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Stay on top of the day</p>
          <h2 id="create-task-heading">Create a task</h2>
        </div>
        <button
          className="button button-danger button-secondary"
          type="button"
          onClick={onDeleteAll}
          disabled={taskCount === 0 || isBusy}
        >
          Delete All Tasks
        </button>
      </div>
      <form className="task-form" onSubmit={handleSubmit} noValidate>
        <div className="field-group field-grow">
          <label htmlFor="task-name">Task name</label>
          <input
            ref={nameInputRef}
            id="task-name"
            name="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "task-name-error" : undefined}
            placeholder="e.g. Prepare weekly report"
            autoComplete="off"
          />
          {errors.name && (
            <span className="field-error" id="task-name-error">
              {errors.name}
            </span>
          )}
        </div>
        <div className="field-group date-field">
          <label htmlFor="completion-date">Due date</label>
          <input
            id="completion-date"
            name="completionDate"
            type="date"
            value={completionDate}
            onChange={(event) => setCompletionDate(event.target.value)}
            aria-invalid={Boolean(errors.completionDate)}
            aria-describedby={
              errors.completionDate ? "completion-date-error" : undefined
            }
          />
          {errors.completionDate && (
            <span className="field-error" id="completion-date-error">
              {errors.completionDate}
            </span>
          )}
        </div>
        <button
          className="button button-primary create-button"
          type="submit"
          disabled={isBusy}
        >
          Create Task
        </button>
      </form>
    </section>
  );
}
