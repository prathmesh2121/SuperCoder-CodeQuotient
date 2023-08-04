const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const db = require('./model/db');
const UserModel = require('./model/Users');

app.use(cors());
app.use(express.json());

app.get('/', function(req, res) {
  res.sendFile(__dirname + "/todo.html");
});

app.delete("/todo/:id", async (req, res) => {
  const taskId = req.params.id;

  try {
    await UserModel.findByIdAndRemove(taskId);
    res.status(200).send("Task deleted successfully");
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).send("Error deleting task");
  }
});

app.post('/todo', async (req, res) => {
  try {
    const savedTask = await saveTodoInFile(req.body);
    res.status(200).json(savedTask);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error saving task');
  }
});

app.get('/todo-data', async (req, res) => {
  try {
    const tasks = await UserModel.find();
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).send('Error fetching tasks');
  }
});

db.init()
  .then(function(){
    console.log("DB CONNECTED")
    app.listen(3000, function() 
    {
      console.log("Running on 3000");
    });
  })
  .catch((err)=>{
    console.log(err);
  });

async function saveTodoInFile(todo) {
  try {
    const userTask = new UserModel({
      task: todo.todoText,
      priority: todo.priority,
    });

    const savedTask = await userTask.save();
    console.log('Task added:', savedTask);
    return savedTask;
  } catch (err) {
    console.error('Error saving task:', err);
    throw err;
  }
}
