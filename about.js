// about.js

// Example: Display a toast notification when the Home button is clicked
document.querySelector('.home-btn').addEventListener('click', function() {
    showToast('Redirecting to Home Page...');
});

// Function to show toast notifications
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.className = 'show';
    setTimeout(() => { toast.className = toast.className.replace('show', ''); }, 3000);
}

// Modal functionalities if needed on About page
function closeModal() {
    const modal = document.getElementById('quiz-modal');
    modal.style.display = 'none';
    document.getElementById('quiz-container').innerHTML = '';
}

window.onclick = function(event) {
    const modal = document.getElementById('quiz-modal');
    if (event.target == modal) {
        modal.style.display = 'none';
        document.getElementById('quiz-container').innerHTML = '';
    }
}
