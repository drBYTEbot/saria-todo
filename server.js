const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let todos = [
  { id: 1, text: 'Build something amazing', done: false, user: 'saria', likes: 3, time: '2h' },
  { id: 2, text: 'Design the UI', done: true, user: 'saria', likes: 7, time: '4h' },
  { id: 3, text: 'Deploy to production', done: false, user: 'saria', likes: 1, time: '6h' },
];

app.get('/api/todos', (req, res) => res.json(todos));

app.post('/api/todos', (req, res) => {
  const todo = {
    id: Date.now(),
    text: req.body.text,
    done: false,
    user: 'saria',
    likes: 0,
    time: 'now',
  };
  todos.unshift(todo);
  res.json(todo);
});

app.patch('/api/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id == req.params.id);
  if (!todo) return res.status(404).json({ error: 'not found' });
  if (req.body.done !== undefined) todo.done = req.body.done;
  if (req.body.likes !== undefined) todo.likes = req.body.likes;
  res.json(todo);
});

app.delete('/api/todos/:id', (req, res) => {
  todos = todos.filter(t => t.id != req.params.id);
  res.json({ ok: true });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
