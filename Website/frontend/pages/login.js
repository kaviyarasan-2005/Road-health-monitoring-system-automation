const API_URL = 'http://localhost:3000/api';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const btn = document.querySelector('.btn-login');
  const msg = document.getElementById('message');

  // Validation
  if (!email || !password) {
    msg.className = 'error';
    msg.textContent = '✗ Please enter email and password';
    return;
  }

  // Show loading state
  btn.classList.add('loading');
  btn.textContent = 'AUTHENTICATING...';
  msg.className = '';
  msg.textContent = '';

  try {
    // Call API
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      msg.className = 'success';
      msg.textContent = '✓ Login successful! Redirecting…';
      
      // Store user data
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('userRole', data.role);
      localStorage.setItem('userName', data.name);

      // Redirect based on role
      setTimeout(() => {
        if (data.role === 'admin') {
          window.location.href = 'admin/admin.html';
        } else {
          window.location.href = 'user/public.html';
        }
      }, 1500);
    } else {
      msg.className = 'error';
      msg.textContent = `✗ ${data.message || 'Login failed'}`;
      btn.classList.remove('loading');
      btn.textContent = 'ACCESS DASHBOARD';
    }
  } catch (error) {
    console.error('Error:', error);
    msg.className = 'error';
    msg.textContent = '✗ Network error. Please try again.';
    btn.classList.remove('loading');
    btn.textContent = 'ACCESS DASHBOARD';
  }
});