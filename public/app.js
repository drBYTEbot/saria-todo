const API = '/api/todos';
let todos = [];
let filter = 'all';

const feed = document.getElementById('feed');
const form = document.getElementById('todoForm');
const input = document.getElementById('todoInput');
const postBtn = document.querySelector('.post-btn');

input.addEventListener('input', () => {
  postBtn.disabled = !input.value.trim();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  const todo = await res.json();
  todos.unshift(todo);
  input.value = '';
  postBtn.disabled = true;
  render();
});

document.querySelectorAll('.story').forEach(el => {
  el.addEventListener('click', () => {
    document.querySelector('.story.active').classList.remove('active');
    el.classList.add('active');
    filter = el.querySelector('.story-label').textContent.toLowerCase();
    render();
  });
});

document.getElementById('navAdd').addEventListener('click', () => {
  input.focus();
});

async function loadTodos() {
  const res = await fetch(API);
  todos = await res.json();
  render();
}

function render() {
  let filtered = [...todos];
  if (filter === 'today') filtered = filtered.filter(t => t.time === 'now');
  else if (filter === 'done') filtered = filtered.filter(t => t.done);
  else if (filter === 'liked') filtered = filtered.filter(t => t.likes > 0);

  if (filtered.length === 0) {
    feed.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <line x1="12" y1="8" x2="12" y2="16"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
        <h3>No todos yet</h3>
        <p>Start by posting what you need to do</p>
      </div>`;
    return;
  }

  feed.innerHTML = filtered.map(todo => `
    <div class="card" data-id="${todo.id}">
      <div class="card-header">
        <div class="card-avatar">SM</div>
        <span class="card-user">${todo.user}</span>
        <span class="card-time">${todo.time}</span>
      </div>
      <div class="card-body">
        <div class="card-check ${todo.done ? 'done' : ''}" data-action="toggle">${todo.done ? '&#10003;' : ''}</div>
        <span class="card-text ${todo.done ? 'done' : ''}">${todo.text}</span>
      </div>
      <div class="card-actions">
        <button class="action-btn ${todo.likes > 0 ? 'liked' : ''}" data-action="like">
          <svg viewBox="0 0 24 24" fill="${todo.likes > 0 ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          ${todo.likes > 0 ? todo.likes : ''}
        </button>
        <button class="action-btn" data-action="comment">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
        <button class="action-btn delete-btn" data-action="delete">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>
  `).join('');
}

feed.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const card = btn.closest('.card');
  const id = card.dataset.id;
  const action = btn.dataset.action;

  if (action === 'toggle') {
    const todo = todos.find(t => t.id == id);
    todo.done = !todo.done;
    await fetch(`${API}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: todo.done }),
    });
    render();
  } else if (action === 'like') {
    const todo = todos.find(t => t.id == id);
    todo.likes = todo.likes > 0 ? 0 : todo.likes + 1;
    await fetch(`${API}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ likes: todo.likes }),
    });
    render();
  } else if (action === 'delete') {
    todos = todos.filter(t => t.id != id);
    await fetch(`${API}/${id}`, { method: 'DELETE' });
    render();
  }
});

loadTodos();
