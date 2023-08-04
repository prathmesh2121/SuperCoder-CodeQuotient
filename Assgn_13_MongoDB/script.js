const submitTask = document.getElementById("submitTask");
const priority = document.getElementById("priority");
const userTask = document.getElementById("task-details");
const taskList = document.getElementById("task-list");

submitTask.addEventListener("click", function(event) {
  event.preventDefault();

  const todoText = userTask.value;

  if (!todoText) {
    alert("Please enter a task....");
    return;
  }

  const todo = {
    todoText: todoText,
    priority: priority.value,
  };

  fetch("http://localhost:3000/todo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(todo)
  })
    .then(function(response) {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Something went wrong");
      }
    })
    .then(function(data) {
      showToDoInUI(data);
    })
    .catch(function(error) {
      console.log(error.message);
    });
});

function showToDoInUI(todo) {
  const taskId = todo._id;

  const todoTextNode = document.createElement("li");
  todoTextNode.id = `task-${taskId}`;

  const todoTitle = document.createElement("span");
  const checkBoxBtn = document.createElement("input");
  const deleteBtn = document.createElement("button");

  todoTitle.innerText = `Task: ${todo.task}, Priority: ${todo.priority}`;
  checkBoxBtn.type = "checkbox";
  
  // Add CSS class to the delete button
  deleteBtn.innerText = "Delete";
  deleteBtn.classList.add("delete-btn"); // Add the CSS class

  checkBoxBtn.addEventListener("change", function () {
    if (checkBoxBtn.checked) {
      todoTitle.style.textDecoration = "line-through";
    } else {
      todoTitle.style.textDecoration = "none";
    }
  });

  deleteBtn.addEventListener("click", function () {
    deleteTask(taskId);
  });

  todoTextNode.appendChild(checkBoxBtn);
  todoTextNode.appendChild(todoTitle);
  todoTextNode.appendChild(deleteBtn);

  taskList.appendChild(todoTextNode);
}


function deleteTask(taskId) {
  fetch(`http://localhost:3000/todo/${taskId}`, {
    method: "DELETE"
  })
  .then(function(response) {
    if (!response.ok) {
      throw new Error("Failed to delete task");
    }
    const taskItem = document.getElementById(`task-${taskId}`);
    if (taskItem) {
      taskItem.remove(); // Remove the task node from the HTML
    }
  })
  .catch(function(error) {
    console.log(error.message);
  });
}

fetch("http://localhost:3000/todo-data")
  .then(function(response) {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error("Something went wrong");
    }
  })
  .then(function(todos) {
    todos.forEach(function(todo) {
      showToDoInUI(todo, todo.id);
    });
  })
  .catch(function(error) {
    console.log(error.message);
  });
