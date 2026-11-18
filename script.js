const STORAGE_KEY = "todo-list-tasks";
const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const emptyState = document.getElementById("empty-state");
const footer = document.getElementById("footer");
const summary = document.getElementById("summary");
const clearCompletedBtn = document.getElementById("clear-completed");
const filterButtons = document.querySelectorAll(".filter");
let tasks = loadTasks();
let currentFilter = "all";
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
function render() {
  list.innerHTML = "";
  const visibleTasks = tasks.filter((task) => {
    if (currentFilter === "active") return !task.done;
    if (currentFilter === "completed") return task.done;
    return true;
  });
  visibleTasks.forEach((task) => {
    list.appendChild(createTaskElement(task));
  });
  const activeCount = tasks.filter((t) => !t.done).length;
  const doneCount = tasks.length - activeCount;
  summary.textContent = `${activeCount} активных · ${doneCount} выполненных`;
  emptyState.hidden = visibleTasks.length !== 0;
  footer.hidden = doneCount === 0;
  if (doneCount === 0) {
    clearCompletedBtn.disabled = true;
  } else {
    clearCompletedBtn.disabled = false;
  }
}
function createTaskElement(task) {
  const li = document.createElement("li");
  li.className = "todo" + (task.done ? " todo--done" : "");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "todo__checkbox";
  checkbox.checked = task.done;
  checkbox.setAttribute("aria-label", "Отметить выполненной");
  checkbox.addEventListener("change", () => toggleTask(task.id));
  const text = document.createElement("span");
  text.className = "todo__text";
  text.textContent = task.text;
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "todo__delete";
  deleteBtn.innerHTML = "&#10005;";
  deleteBtn.setAttribute("aria-label", "Удалить задачу");
  deleteBtn.addEventListener("click", () => deleteTask(task.id));
  li.append(checkbox, text, deleteBtn);
  return li;
}
function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  tasks.push({
    id: Date.now().toString(),
    text: trimmed,
    done: false,
  });
  saveTasks();
  render();
}
function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  task.done = !task.done;
  saveTasks();
  render();
}
function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
}
function clearCompleted() {
  tasks = tasks.filter((t) => !t.done);
  saveTasks();
  render();
}
function setFilter(filter) {
  currentFilter = filter;
  filterButtons.forEach((btn) => {
    btn.classList.toggle("filter--active", btn.dataset.filter === filter);
  });
  render();
}
form.addEventListener("submit", (event) => {
  event.preventDefault();
  addTask(input.value);
  input.value = "";
  input.focus();
});
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => setFilter(btn.dataset.filter));
});
clearCompletedBtn.addEventListener("click", clearCompleted);
render();