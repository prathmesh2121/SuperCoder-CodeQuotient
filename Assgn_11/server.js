const express = require('express');
const app = express();
const bodyParser = require('body-parser');
var session = require('express-session')
const fs = require('fs');
const path = require('path');

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(session({
    secret: 'abcd',
    resave: false,
    saveUninitialized: true,
    
  }))

  
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.set('views', __dirname + '/public');


app.use(express.static('public'));

app.listen(3000, function() {
    console.log("Running on 3000");
});

app.get('/', function(req, res) {
    res.send("Type /login");
});

app.get('/login', function(req, res) {
    res.sendFile(__dirname + "/login.html");
});

app.post("/login", function(req, res) {
  const pass = req.body.password;
  const loginIdentifier = req.body.usernameOrEmail; // Field to accept either username or email

  console.log("Inside post ", pass, loginIdentifier);

  fs.readFile('users.json', 'utf8', (err, data) => {
    if (err) {
      console.error("Error reading users.json:", err);
      res.status(500).send("Error occurred while reading user data.");
      return;
    }

    try {
      const usersData = JSON.parse(data);
      const user = usersData.users.find(u => {
        return (
          (u.username === loginIdentifier || u.email === loginIdentifier) &&
          u.password === pass
        );
      });

      if (user) {
        req.session.isLoggedIn = true;
        req.session.username = user.username;

        res.redirect("/header");
      } else {
        console.log("INVALID ID PASSWORD");
        res.redirect("/invalidCredential");
      }
    } catch (error) {
      console.error("Error parsing users.json:", error);
      res.status(500).send("Error occurred while parsing user data.");
    }
  });
});


app.get('/home', function(req, res) {
  if (!req.session.isLoggedIn) {
    console.log("First Login then try to go on Home page");
    res.redirect("/login");
    return;
  }

  const username = req.session.username;
  res.render('home', { username: username }); 
});


app.get('/header', function(req, res) {
  if (!req.session.isLoggedIn) {
    console.log("First Login then try to go on Home page");
    res.redirect("/login");
    return;
  }

  console.log("inside header");
  const username = req.session.username;

  // Assuming getDataFile() is a function that returns your product data
  const datafile = getDataFile();
  console.log(datafile)

  res.render('header', { username: username, data: datafile.products });
});




function getDataFile() {
  const data = fs.readFileSync('./data.json');
  return JSON.parse(data);
}

app.get("/data", function(req,res){

    console.log("In side data.ejs");
    const datafile = getDataFile();
    console.log(datafile)

    //res.render('data', { data: datafile });
    res.json(datafile);
});


app.get('/invalidCredential', function(req, res) {
    
   
    res.sendFile(__dirname + "/invalidCredential.html");
});



app.get('/createAccount', function(req, res) {
    res.sendFile(__dirname + '/createAccount.html');
  });
  
app.post('/createAccount', function(req, res) {
    const email = req.body.email;
    const password = req.body.password;
  
    if (checkIfEmailExists(email)) {
      res.status(409).send("Email already exists. Please choose a different email.");
    } else {
      createAccount(email, req.body.name, password);
  
      res.redirect("/login");
    }
  });


  function checkIfEmailExists(email) 
  {
    const usersData = getUsersData();
    return usersData.users.some(user => user.email === email);
  }
  
  function createAccount(email, name, password) 
  {
    const usersData = getUsersData();
    const newUser = {
      email: email,
      name: name,
      password: password,
    };
    usersData.users.push(newUser);
    saveUsersData(usersData);
  }
  
  function getUsersData() {
    const data = fs.readFileSync('./users.json');
    return JSON.parse(data);
  }
  
  function saveUsersData(usersData) {
    fs.writeFileSync('./users.json', JSON.stringify(usersData, null, 2));
  }


  app.get('/logout', function(req, res) {
    req.session.isLoggedIn = false;
    req.session.username = null;
    res.redirect('/login');
  });