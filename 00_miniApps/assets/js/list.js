// Dynamic List - Item management
let items = [];

function addItem() {
    const input = document.getElementById('itemInput');
    const text = input.value.trim();
    
    if (!text) return;
    
    items.push({
        id: Date.now(),
        text: text
    });
    
    input.value = '';
    renderList();
}

function removeItem(id) {
    items = items.filter(item => item.id !== id);
    renderList();
}

function renderList() {
    const container = document.getElementById('listContainer');
    
    if (items.length === 0) {
        container.innerHTML = '<p class="text-muted">No items yet. Add one to get started!</p>';
        return;
    }
    
    const html = `
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Item</th>
                    <th style="width: 100px;">Action</th>
                </tr>
            </thead>
            <tbody>
                ${items.map((item, index) => `
                    <tr>
                        <td>${escapeHtml(item.text)}</td>
                        <td>
                            <button class="btn btn-sm btn-danger" onclick="removeItem(${item.id})">Remove</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <p class="text-muted">Total items: ${items.length}</p>
    `;
    
    container.innerHTML = html;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Allow Enter key to add item
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('itemInput');
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addItem();
    });
    renderList();
});
