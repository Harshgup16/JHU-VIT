document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const button = document.getElementById('loginButton');
    const inputs = document.querySelectorAll('input[type="email"], input[type="password"]');

    // Add placeholder attribute for label animation
    inputs.forEach(input => {
        input.setAttribute('placeholder', ' ');
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Basic validation
        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }

        if (!isValidEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }

        // Show loading state
        button.classList.add('loading');

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Here you would typically make your actual API call
            console.log('Login attempt with:', { email, password });
            
            // Simulate successful login
            alert('Login successful!');
        } catch (error) {
            alert('Login failed. Please try again.');
        } finally {
            button.classList.remove('loading');
        }
    });

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
});