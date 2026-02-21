import { Terminal } from './terminal.js';

const outputDiv = document.getElementById('output');
const inputEl = document.getElementById('cmd-input');
const pathEl = document.getElementById('current-path');

function printToScreen(text, className = 'log-sys') {
    const div = document.createElement('div');
    div.className = className;
    div.textContent = text;
    outputDiv.appendChild(div);
    outputDiv.scrollTop = outputDiv.scrollHeight;
}

const term = new Terminal(printToScreen);

// Handle Enter Key
inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const cmd = inputEl.value;
        term.execute(cmd);
        inputEl.value = '';
        pathEl.textContent = term.pwd === '/' ? '' : term.pwd; // Update prompt UI
    }
});

// Boot Sequence
printToScreen("INITIALIZING MI5 SECURE KERNEL...", "log-sys");
setTimeout(() => {
    printToScreen("Connection established. Type 'cat readme.txt' to begin.", "log-success");
}, 800);

// Keep focus on input for mobile convenience
document.addEventListener('click', () => inputEl.focus());
