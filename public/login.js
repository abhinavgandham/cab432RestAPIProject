const login = async () => {
    const form = document.querySelector('#loginForm');
    const username = document.querySelector('#username').value;
    const password = document.querySelector('#password').value;
    const messageDiv = document.querySelector('#message');
    const currentUserDiv = document.querySelector('#currentUser');

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        const data = await response.json();
        if (response.ok && data.data.token) {
            messageDiv.innerHTML = '✅ Login successful';
            currentUserDiv.innerHTML = `Logged in as ${username}: ${data.data.user.role}`;
            localStorage.setItem('token', data.data.token);
            form.reset();
        }
        else {
            messageDiv.innerHTML = '❌ Invalid username or password'
        }


    }catch(error) {
        messageDiv.innerHTML = `❌${error}`
    }

}