const submitTask = document.getElementById("submitTask");
const priority = document.getElementById("priority");
const userTask = document.getElementById("task-details");
const taskList = document.getElementById("task-list");

submitTask.addEventListener("click", function (event) {
  event.preventDefault(); // Prevent form submission default behavior

  const todoText = userTask.value;
  const priorityValue = priority.value;
  const imageFile = document.querySelector("input[name='avatar']").files[0];

  if (!todoText) {
    alert("Please enter a task....");
    return;
  }

  const formData = new FormData();
  formData.append("todoText", todoText);
  formData.append("priority", priorityValue);
  formData.append("avatar", imageFile);

  fetch("http://localhost:3000/todo", {
    method: "POST",
    body: formData,
  })
    .then(function (response) {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Something went wrong");
      }
    })
    .then(function (data) {
      showToDoInUI(data, data.id); // Pass the task ID to showToDoInUI
      userTask.value = ""; // Clear the task input field
    })
    .catch(function (error) {
      console.log(error.message);
    });
});

function createTaskItem(todo) {
  const taskItem = document.createElement("li");
  const todoTitle = document.createElement("span");
  const checkBoxBtn = document.createElement("input");

  todoTitle.innerText = `Task: ${todo.todoText}, Priority: ${todo.priority}`;
  checkBoxBtn.type = "checkbox";
  checkBoxBtn.classList.add("check");
  checkBoxBtn.checked = todo.completed;

  checkBoxBtn.addEventListener("change", function () {
    todo.completed = checkBoxBtn.checked;
    updateTaskCompletion(todo.id, todo.completed);
    if (checkBoxBtn.checked) {
      todoTitle.style.textDecoration = "line-through";
    } else {
      todoTitle.style.textDecoration = "none";
    }
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.innerText = "DELETE";
  deleteBtn.classList.add("delete-btn");

  deleteBtn.addEventListener("click", function () {
    deleteTask(todo.id);
  });

  taskItem.appendChild(todoTitle);
  taskItem.appendChild(deleteBtn);
  taskItem.appendChild(checkBoxBtn);

  return taskItem;
}

function updateTaskCompletion(taskId, completed) {
  fetch(`http://localhost:3000/todo/${taskId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ completed: completed }),
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Failed to update task");
      }
    })
    .catch(function (error) {
      console.log(error.message);
    });
}

function deleteTask(taskId) {
  fetch(`http://localhost:3000/todo/${taskId}`, {
    method: "DELETE",
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Failed to delete task");
      }
      const taskItem = document.getElementById(`task-${taskId}`);
      if (taskItem) {
        taskItem.remove();
      }
    })
    .catch(function (error) {
      console.log(error.message);
    });
}
function showToDoInUI(todo, taskId) {
  const taskItem = createTaskItem(todo);
  taskItem.id = `task-${taskId}`;

  // Create a container for the task details and image
  const taskContainer = document.createElement('div');
  taskContainer.classList.add('task-container');

  // Display the uploaded image
  if (todo.image) {
    const imgElement = document.createElement('img');
    imgElement.src = `uploads/${todo.image}`;
    imgElement.alt = 'Task Image';

    // Add styling to the image
    imgElement.classList.add('task-image');

    // Append the image to the task container
    taskContainer.appendChild(imgElement);
  }

  // Append the task details to the task container
  taskContainer.appendChild(taskItem);

  // Append the task container to the task list
  taskList.appendChild(taskContainer);
}
function fetchTaskList() {
  fetch("http://localhost:3000/todo-data")
    .then(function (response) {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Something went wrong");
      }
    })
    .then(function (todos) {
      todos.forEach(function (todo) {
        showToDoInUI(todo, todo.id);
      });
    })
    .catch(function (error) {
      console.log(error.message);
    });
}

fetchTaskList();
