let todos = [];

const $todos = document.querySelector('.todos');
const $inputTodo = document.querySelector('.input-todo');
const $ckAll = document.querySelector('#ck-complete-all');
const $delBtn = document.querySelector('.btn');
const $nav = document.querySelector('.nav');
let navState = 'all';

function countCompletedTodos() {
  document.querySelector('.completed-todos').innerText = todos.filter(todo => todo.completed).length;
}

function countUncompletedTodos() {
  document.querySelector('.active-todos').innerText = todos.filter(todo => !todo.completed).length;
}


function render(todosFromServer) {
  if (todosFromServer) todos = todosFromServer;
  const _todos = todos.filter(todo => {
    if (navState === 'active') return !todo.completed;
    if (navState === 'completed') return todo.completed;
    return true;
  });

  let html = '';
  _todos.forEach(({ id, content, completed }) => {
    html += `<li id="${id}" class="todo-item">
    <input class="custom-checkbox" type="checkbox" id="ck-${id}" ${completed ? 'checked' : ''}>
    <label for="ck-${id}">${content}</label>
    <i class="remove-todo far fa-times-circle"></i>
  </li>`;
  });

  $todos.innerHTML = html;
  countCompletedTodos();
  countUncompletedTodos();
}

function getTodos() {
  fetch('/todos')
    .then(res => res.json())
    .then(render)
    .catch(console.error);
}


function generateId() {
  return todos.length ? Math.max(...todos.map(todo => todo.id)) + 1 : 1;
}


$todos.onclick = e => {
  if (!e.target.classList.contains('remove-todo')) return;
  fetch(`/todos/${+e.target.parentNode.id}`, {
    method: 'DELETE'
  }).then(res => res.json())
    .then(render)
    .catch(console.error);
};

$todos.onchange = e => {
  const id = +e.target.parentNode.id;
  fetch(`/todos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify({ completed: e.target.checked })
  }).then(res => res.json())
    .then(render)
    .catch(console.error);
};

$inputTodo.onkeyup = e => {
  const content = $inputTodo.value.trim();
  if (content === '' || e.keyCode !== 13) return;
  $inputTodo.value = '';
  fetch('/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: generateId(), content, completed: false }, ...todos)
  }).then(res => res.json())
    .then(render)
    .catch(console.error);
};

$ckAll.onchange = e => {
  fetch('/todos', {
    method: 'PATCH',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify({ completed: e.target.checked })
  }).then(res => res.json())
    .then(render)
    .catch(console.error);
};

$delBtn.onclick = () => {
  fetch('/todos/completed', {
    method: 'DELETE'
  }).then(res => res.json())
    .then(render)
    .catch(console.error);
};

$nav.addEventListener('click', e => {
  [...$nav.children].forEach(navItem => {
    navItem.classList.remove('active');
  });
  e.target.classList.add('active');

  navState = e.target.id;
  render();
});


window.onload = function () {
  getTodos();
};
