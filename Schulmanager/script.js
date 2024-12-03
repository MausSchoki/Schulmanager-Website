// script.js
function addMessage() {
    const messageInput = document.getElementById('messageInput');
    const messageList = document.getElementById('messageList');

    if (messageInput.value.trim() !== "") {
        const newMessage = document.createElement('li');
        newMessage.textContent = messageInput.value;
        messageList.appendChild(newMessage);
        messageInput.value = "";
    } else {
        alert("Bitte geben Sie eine Nachricht ein.");
    }
}
