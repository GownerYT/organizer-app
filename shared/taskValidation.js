const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const SAFE_ERROR_MESSAGES = [
  "Enter a task name.",
  "Choose a due date.",
  "Choose a valid due date.",
  "That task could not be found.",
  "We could not complete that task operation. Please try again.",
];

export function validateTaskName(value) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return "Enter a task name.";
  }

  return "";
}

export function isValidDateOnly(value) {
  if (typeof value !== "string" || !DATE_ONLY_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function validateCompletionDate(value) {
  if (!value) {
    return "Choose a due date.";
  }

  if (!isValidDateOnly(value)) {
    return "Choose a valid due date.";
  }

  return "";
}

export function validateTaskInput({ name, completionDate }) {
  const errors = {};
  const nameError = validateTaskName(name);
  const dateError = validateCompletionDate(completionDate);

  if (nameError) errors.name = nameError;
  if (dateError) errors.completionDate = dateError;

  return errors;
}

export function assertValidTaskInput(input) {
  const errors = validateTaskInput(input);

  if (Object.keys(errors).length > 0) {
    throw new Error(Object.values(errors)[0]);
  }

  return {
    name: input.name.trim(),
    completionDate: input.completionDate,
  };
}

export function assertValidTaskId(id) {
  if (!Number.isInteger(id) || id < 1) {
    throw new Error("That task could not be found.");
  }

  return id;
}

export function formatTaskDate(dateValue) {
  if (!dateValue) return "";

  const [year, month, day] = dateValue.split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
