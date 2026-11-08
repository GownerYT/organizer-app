import TaskItem from "./TaskItem.jsx";

export default function TaskList({ tasks, onUpdate, onDelete, isBusy }) {
  return (
    <section className="task-list-section" aria-labelledby="task-list-heading">
      <div className="list-heading-row">
        <h2 id="task-list-heading">Your tasks</h2>
        <span className="task-count" aria-label={`${tasks.length} tasks`}>
          {tasks.length}
        </span>
      </div>
      {tasks.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon" aria-hidden="true">
            ✓
          </span>
          <h3>No tasks yet</h3>
          <p>Add your first task above.</p>
        </div>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onUpdate={onUpdate}
              onDelete={onDelete}
              isBusy={isBusy}
            />
          ))}
        </div>
      )}
    </section>
  );
}
