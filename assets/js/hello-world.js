// Hello World - Simple interactive page
let clickCount = 0;

function updateMessage() {
    clickCount++;
    const message = document.getElementById('message');
    message.textContent = `Hello World! You've said hello ${clickCount} time(s).`;
}

function resetMessage() {
    clickCount = 0;
    document.getElementById('message').textContent = '';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('message').textContent = 'Click the button to say hello!';
});
