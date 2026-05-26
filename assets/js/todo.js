// Todo App - Task management
let todos = [];

function addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();
    
    if (!text) return;
    
    const todo = {
        id: Date.now(),
        text: text,
        completed: false
    };
    
    todos.push(todo);
    input.value = '';
    renderTodos();
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        renderTodos();
    }
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    renderTodos();
}

function clearCompleted() {
    todos = todos.filter(t => !t.completed);
    renderTodos();
}

function renderTodos() {
    const list = document.getElementById('todoList');
    
    if (todos.length === 0) {
        list.innerHTML = '<li class="list-group-item text-muted">No tasks yet!</li>';
        return;
    }
    
    list.innerHTML = todos.map(todo => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            <div>
                <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                       onchange="toggleTodo(${todo.id})">
                <span style="${todo.completed ? 'text-decoration: line-through; color: #999;' : ''}" class="ms-2">
                    ${escapeHtml(todo.text)}
                </span>
            </div>
            <button class="btn btn-sm btn-danger" onclick="deleteTodo(${todo.id})">Delete</button>
        </li>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Allow Enter key to add todo
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('todoInput');
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });
    renderTodos();
});
