let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

const taskList = document.getElementById("taskList");
const addTaskBtn = document.getElementById("addTaskBtn");
const modal = document.getElementById("taskModal");
const saveTaskBtn = document.getElementById("saveTask");
const closeModalBtn = document.getElementById("closeModal");
const viewDateInput = document.getElementById("viewDate");

// Initialize the view date to today
let currentViewDate = new Date().toISOString().split("T")[0];
viewDateInput.value = currentViewDate;

// Utility: check if repeating task occurs on the given date
function occursOnDate(task, dateStr) {
  const taskDate = new Date(task.date);
  const checkDate = new Date(dateStr);

  // Ignore time part for accurate date comparison
  taskDate.setHours(0,0,0,0);
  checkDate.setHours(0,0,0,0);

  if (checkDate < taskDate) return false;

  switch (task.repeat) {
    case "none":
      return task.date === dateStr;

    case "daily":
      return true; // Every day after start date

    case "weekly":
      return taskDate.getDay() === checkDate.getDay();

    case "monthly":
      return taskDate.getDate() === checkDate.getDate();

    case "yearly":
      return (
        taskDate.getDate() === checkDate.getDate() &&
        taskDate.getMonth() === checkDate.getMonth()
      );

    default:
      return false;
  }
}

// Render tasks for current view date
function renderTasks() {
  const filteredTasks = tasks.filter((task) => occursOnDate(task, currentViewDate));

  // Sort by time (HH:mm)
  filteredTasks.sort(
    (a, b) => new Date(`1970-01-01T${a.time}`) - new Date(`1970-01-01T${b.time}`)
  );

  taskList.innerHTML = "";
  if (filteredTasks.length === 0) {
    taskList.innerHTML = "<li>No tasks for this day</li>";
    return;
  }

  filteredTasks.forEach((task) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${task.time} - ${task.text}</span>
                    <button onclick="deleteTask('${task.id}')">❌</button>`;
    taskList.appendChild(li);
  });
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
}

// Show modal on plus button click
addTaskBtn.onclick = () => {
  // Reset modal inputs
  document.getElementById("taskText").value = "";
  document.getElementById("taskDate").value = currentViewDate;
  document.getElementById("taskTime").value = "";
  document.getElementById("repeatOption").value = "none";

  modal.style.display = "flex";
};

// Close modal
closeModalBtn.onclick = () => (modal.style.display = "none");

// Save task
saveTaskBtn.onclick = () => {
  const text = document.getElementById("taskText").value.trim();
  const date = document.getElementById("taskDate").value;
  const time = document.getElementById("taskTime").value;
  const repeat = document.getElementById("repeatOption").value;

  if (!text || !date || !time) {
    alert("Please fill all fields");
    return;
  }

  tasks.push({ id: Date.now().toString(), text, date, time, repeat });
  localStorage.setItem("tasks", JSON.stringify(tasks));

  modal.style.display = "none";

  // Update the view if new task's date is the currently viewed date
  if (occursOnDate({ date, repeat }, currentViewDate)) {
    renderTasks();
  }
};

// When user picks a new date to view tasks
viewDateInput.addEventListener("change", (e) => {
  currentViewDate = e.target.value;
  renderTasks();
});

// Initial render
renderTasks();
