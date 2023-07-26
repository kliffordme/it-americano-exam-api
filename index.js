const express = require('express')
const cors = require('cors');
const app = express()
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');


require('dotenv').config();

const todoController = require('./src/controllers/todoController')
const userController = require('./src/controllers/userController')
const commentsController = require('./src/controllers/commentsController')

app.use(cors({
    origin: process.env.APP_CLIENT_URL,  // replace with your client app's URL
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());


app.get('/', (req, res) => res.send('test'))

app.get('/todos', todoController.getTodos);

app.get('/todos/:userId', todoController.getTodosByUser);

app.post('/todos', todoController.createTodo);

app.post('/todos/update', todoController.updateTodo);

app.delete('/todos/:todoId', todoController.deleteTodo);

app.get('/comments', commentsController.getComments)

app.post('/comments', commentsController.createComment)

app.post('/comments/update', commentsController.updateComment)

app.delete('/comments/:commentId', commentsController.deleteComment)

app.post('/users', userController.createUser)

app.post('/users/login', userController.loginUser)

app.get('/users/me', authenticateToken, (req, res) => {
    // This will send the user details if the token is valid
    res.json(req.user);
  });
  
  function authenticateToken(req, res, next) {
    const token = req.cookies.token;
  
    if (token == null) return res.sendStatus(401);
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
  
      req.user = user;
      next();
    });
  }

  app.post('/users/logout', function(req, res){
    res.clearCookie('token');
    res.json({auth: false});
 });

app.listen(8080)