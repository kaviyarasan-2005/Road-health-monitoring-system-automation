// ─── Password strength ────────────────────────────────────────────────────────
const pwInput = document.getElementById('password');
const bar     = document.getElementById('strengthBar');
const segs    = ['s1', 's2', 's3', 's4'].map(id => document.getElementById(id));

pwInput.addEventListener('input', () => {
  const pw = pwInput.value;
  bar.classList.toggle('visible', pw.length > 0);

  let score = 0;
  if (pw.length >= 8)          score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const levels = ['weak', 'fair', 'good', 'strong'];
  segs.forEach((s, i) => {
    s.className = 'strength-seg';
    if (i < score) s.classList.add(levels[score - 1]);
  });
});

// ─── Ripple effect ────────────────────────────────────────────────────────────
document.querySelector('.btn-signup').addEventListener('click', function (e) {
  const ripple = document.createElement('span');
  ripple.classList.add('ripple');
  const rect = this.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
  this.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function showMessage(text, type) {
  const msg = document.getElementById('message');
  msg.className = type;   // 'success' or 'error'
  msg.textContent = text;
}

function setLoading(on) {
  const btn = document.querySelector('.btn-signup');
  btn.textContent    = on ? 'CREATING ACCOUNT…' : 'GET STARTED';
  btn.style.opacity  = on ? '0.7' : '1';
  btn.disabled       = on;
}

// ─── Signup submit ────────────────────────────────────────────────────────────
document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name     = document.getElementById('name').value.trim();
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!name || !email || !password) {
    return showMessage('All fields are required.', 'error');
  }

  if (password.length < 8) {
    return showMessage('Password must be at least 8 characters.', 'error');
  }

  setLoading(true);
  showMessage('', '');

  try {
    const res  = await fetch('http://localhost:3000/api/auth/signup', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      showMessage('✓ Account created! Redirecting…', 'success');
      setTimeout(() => window.location.href = 'login.html', 1500);
    } else {
      showMessage(data.error || 'Signup failed. Try again.', 'error');
    }
  } catch (err) {
    console.error('Signup error:', err);
    showMessage('Network error. Check your connection.', 'error');
  } finally {
    setLoading(false);
  }
});