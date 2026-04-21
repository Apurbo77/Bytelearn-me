// Main JavaScript for ByteLearn Platform

document.addEventListener('DOMContentLoaded', function() {
    // Initialize event listeners
    initializeAlerts();
    initializeFormValidation();
});

/**
 * Auto-dismiss alerts after 5 seconds
 */
function initializeAlerts() {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => {
                alert.remove();
            }, 300);
        }, 5000);
    });
}

/**
 * Basic form validation
 */
function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.classList.add('error');
                    isValid = false;
                } else {
                    field.classList.remove('error');
                }
            });

            if (!isValid) {
                e.preventDefault();
            }
        });
    });
}

/**
 * Send message to chatbot via AJAX
 */
function sendChatMessage(courseId, lessonId = null) {
    const messageInput = document.getElementById('chatMessage');
    const message = messageInput.value.trim();

    if (!message) return;

    fetch('/api/chat/message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        },
        body: JSON.stringify({
            message: message,
            course_id: courseId,
            lesson_id: lessonId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            addChatMessage('bot', data.bot_response);
            messageInput.value = '';
        }
    })
    .catch(error => console.error('Error:', error));
}

/**
 * Add message to chat UI
 */
function addChatMessage(sender, message) {
    const chatContainer = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message chat-message-${sender}`;
    messageElement.innerHTML = `<p>${escapeHtml(message)}</p>`;
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

/**
 * Mark lesson as completed via AJAX
 */
function markLessonComplete(lessonId) {
    fetch(`/api/lesson/complete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        },
        body: JSON.stringify({
            lesson_id: lessonId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update UI - show success message or update progress
            const completeBtn = document.getElementById('completeBtn');
            if (completeBtn) {
                completeBtn.disabled = true;
                completeBtn.textContent = 'Completed ✓';
            }
        }
    })
    .catch(error => console.error('Error:', error));
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Format date
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}
