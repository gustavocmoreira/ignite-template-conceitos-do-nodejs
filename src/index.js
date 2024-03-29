const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user)=> user.username === username)
  
  if(!user){
    return response.status(400).json({error:"User not found"})
  }

  request.user = user;

  next();
}

app.post('/users', (request, response) => {
   const { name, username} = request.body;

   const newUser = {
      id: uuidv4(),
      name,
      username,
      todos:[]
   }

   const isUserAlreadyExists = users.some((user)=>user.username === newUser.username)

   if(isUserAlreadyExists){
      return response.status(400).json({error:"user already exists"})
   }

   users.push(newUser)
   return response.status(201).send(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
    const { user } = request;

    return response.status(200).send(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
   const { user } = request;
   const { title, deadline} = request.body;

   const todo = {
    id:uuidv4(),
    title,
    deadline:new Date(deadline),
    done:false,
    created_at: new Date()
   }

   user.todos.push(todo);

   response.status(201).send(todo);

   
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {title, deadline} = request.body
  const { id } = request.params;

  const todo = user.todos.find(todo=> todo.id === id);

  if(!todo){
    return response.status(404).json({error: "Todo dont found"})
  }

  
  todo.title = title;
  todo.deadline = new Date(deadline)

  return response.send(todo);

  
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request;

  const { id } = request.params;

  const todo = user.todos.find((todo)=> todo.id === id);

  if(!todo){
    return response.status(404).json({error: " Todo doesnt exist"})
  }

  todo.done = true;
  return response.send(todo);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;

  const { id } = request.params;

  const todo = user.todos.findIndex((todo)=> todo.id === id);

  if(todo === -1){
    return response.status(404).json({error: " Todo doesnt exist"})
  }
  user.todos.splice(todo,1)

  return response.status(204).send();
});

module.exports = app;