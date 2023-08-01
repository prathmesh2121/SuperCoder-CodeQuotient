const express = require('express');
const fs = require('fs');
const app = express();
const cors = require('cors');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); 
app.use(cors());
app.use(express.json());

app.delete('/todo/:id', function (req, res) {
  const taskId = parseInt(req.params.id);

  deleteTodoFromFile(taskId, function (err) {
    if (err) {
      res.status(500).send('Error deleting task');
      return;
    }

    res.status(200).send('Task deleted successfully');
  });
});

// Update the POST route for /todo to use 'upload.single' middleware for handling the file upload
app.post('/todo', upload.single('avatar'), function (req, res) {
  console.log('Inside app.post(/todo)');

  const todo = {
    todoText: req.body.todoText,
    priority: req.body.priority,
    image: req.file ? req.file.filename : null, // Use req.file to access the uploaded file data
  };

  saveTodoInFile(todo, function (err, data) {
    if (err) {
      res.status(500).send('error');
      return;
    }
    res.status(200).json(data);
  });
});

app.patch('/todo/:id', function (req, res) {
  const taskId = parseInt(req.params.id);
  const completed = req.body.completed;

  updateTaskCompletion(taskId, completed, function (err) {
    if (err) {
      res.status(500).send('Error updating task completion status');
      return;
    }

    res.status(200).send('Task completion status updated successfully');
  });
});

app.get('/todo-data', function (req, res) {
  readAllTodos(function (err, data) {
    if (err) {
      res.status(500).send('Error reading task data');
      return;
    }
    res.status(200).json(data);
  });
});

app.listen(3000, function () {
  console.log('Running on 3000');
});



function readAllTodos(callback) {
  fs.readFile('./database.js', 'utf-8', function (err, data) {
    if (err) {
      callback(err);
      return;
    }

    let todos;
    try {
      todos = JSON.parse(data);
    } catch (err) {
      todos = [];
    }

    callback(null, todos);
  });
}

function saveTodoInFile(todo, callback) {
  readAllTodos(function (err, data) {
    if (err) {
      callback(err);
      return;
    }

    let maxId = 0;
    data.forEach((task) => {
      if (task.id > maxId) {
        maxId = task.id;
      }
    });

    todo.id = maxId + 1;
    todo.completed = false; 

    data.push(todo);

    fs.writeFile('./database.js', JSON.stringify(data), function (err) {
      if (err) {
        callback(err);
        return;
      }
      callback(null, todo);
    });
  });
}

function deleteTodoFromFile(taskId, callback) {
  readAllTodos(function (err, data) {
    if (err) {
      callback(err);
      return;
    }

    const filteredData = data.filter((task) => task.id !== taskId);

    fs.writeFile('./database.js', JSON.stringify(filteredData), function (err) {
      if (err) {
        callback(err);
        return;
      }
      callback(null);
    });
  });
}

function updateTaskCompletion(taskId, completed, callback) {
  readAllTodos(function (err, data) {
    if (err) {
      callback(err);
      return;
    }

    const task = data.find((task) => task.id === taskId);
    if (task) {
      task.completed = completed;
      fs.writeFile('./database.js', JSON.stringify(data), function (err) {
        if (err) {
          callback(err);
          return;
        }
        callback(null);
      });
    } else {
      callback(new Error('Task not found'));
    }
  });
}
