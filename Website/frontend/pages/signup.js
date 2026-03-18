const form = document.getElementById('signup-form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();
    
    if (response.ok) {
      alert('Signup successful! Redirecting to login...');
      window.location.href = 'login.html';
    } else {
      alert(`Error: ${data.error}`);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Network error');
  }
});
