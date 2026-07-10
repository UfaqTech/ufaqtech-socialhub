const supabaseUrl = window.UFAQTECH_SUPABASE_URL || 'https://YOUR_SUPABASE_URL.supabase.co';
const supabaseKey = window.UFAQTECH_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

const form = document.getElementById('loginForm');
const authMessage = document.getElementById('authMessage');
const toggleButtons = document.querySelectorAll('.toggle-btn');
const signupFields = document.querySelectorAll('.signup-only');
const authTitle = document.getElementById('authTitle');
const authSubtitle = document.getElementById('authSubtitle');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const passwordToggleBtn = document.getElementById('togglePassword');
const googleAuthBtn = document.getElementById('googleAuthBtn');
let mode = 'login';

function getRedirectUrl() {
  return `${window.location.origin}/home.html`;
}

function setMessage(message, type = 'info') {
  if (!authMessage) return;
  authMessage.textContent = message || '';
  authMessage.className = `message ${type === 'error' ? 'message-error' : type === 'success' ? 'message-success' : ''}`.trim();
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters.' };
  }
  if (!/[A-Z]/.test(password) || !/\d/.test(password)) {
    return { valid: false, message: 'Use at least one uppercase letter and one number.' };
  }
  return { valid: true, message: '' };
}

async function ensureProfile(userId, fullName = '', email = '') {
  const { data: existingProfile, error: lookupError } = await supabase
    .from('profiles')
    .select('id, role, is_banned')
    .eq('id', userId)
    .maybeSingle();

  if (lookupError) throw lookupError;
  if (existingProfile) return existingProfile;

  const { error: insertError } = await supabase.from('profiles').insert({
    id: userId,
    full_name: fullName || email || 'New User',
    email,
    role: 'user',
    is_banned: false,
  });

  if (insertError) throw insertError;
  return { id: userId, role: 'user', is_banned: false };
}

function togglePasswordVisibility() {
  if (!passwordInput) return;
  const isVisible = passwordInput.type === 'password';
  const nextType = isVisible ? 'text' : 'password';
  passwordInput.type = nextType;
  if (confirmPasswordInput) confirmPasswordInput.type = nextType;

  if (passwordToggleBtn) {
    const icon = passwordToggleBtn.querySelector('i');
    if (icon) icon.className = isVisible ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
  }
}

function setMode(nextMode) {
  mode = nextMode;

  toggleButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  signupFields.forEach((field) => {
    field.classList.toggle('active', mode === 'signup');
    const inputElement = field.querySelector('input');
    if (inputElement) {
      if (mode === 'signup') {
        inputElement.setAttribute('required', 'required');
      } else {
        inputElement.removeAttribute('required');
      }
    }
  });

  if (authTitle) {
    authTitle.textContent = mode === 'signup' ? 'Create your account' : 'Welcome back';
  }
  if (authSubtitle) {
    authSubtitle.textContent = mode === 'signup'
      ? 'Join UfaqTech SocialHub and start growing communities.'
      : 'Sign in to continue managing your network.';
  }

  setMessage('');
}

toggleButtons.forEach((btn) => {
  btn.addEventListener('click', () => setMode(btn.dataset.mode));
});

if (passwordToggleBtn) {
  passwordToggleBtn.addEventListener('click', togglePasswordVisibility);
}

if (googleAuthBtn) {
  googleAuthBtn.addEventListener('click', async () => {
    setMessage('Redirecting to Google…', 'info');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getRedirectUrl(),
          flowType: 'pkce',
        },
      });

      if (error) throw error;
    } catch (error) {
      const message = error?.message || '';
      const isProviderDisabled = message.toLowerCase().includes('not enabled') || message.toLowerCase().includes('unsupported provider');
      setMessage(
        isProviderDisabled
          ? 'Google sign-in is not enabled for this Supabase project. Enable Google in Supabase Authentication > Providers and add the redirect URL before trying again.'
          : message || 'Google sign-in failed.',
        'error'
      );
    }
  });
}

window.addEventListener('DOMContentLoaded', async () => {
  try {
    await supabase.auth.getSessionFromUrl({ storeSession: true });
  } catch (error) {
    console.warn('OAuth session restore skipped:', error?.message || error);
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await ensureProfile(user.id, user.user_metadata?.full_name || '', user.email || '');
      window.location.href = 'home.html';
    }
  } catch (error) {
    console.error('Session restore error:', error.message);
  }
});

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const email = (formData.get('email') || '').toString().trim();
    const password = (formData.get('password') || '').toString();

    setMessage('Processing request... Please wait.', 'info');

    try {
      if (!email || !validateEmail(email)) {
        throw new Error('Please enter a valid email address.');
      }

      if (mode === 'signup') {
        const fullName = (formData.get('fullName') || '').toString().trim();
        const confirmPassword = (formData.get('confirmPassword') || '').toString();
        const passwordCheck = validatePassword(password);

        if (!fullName) {
          throw new Error('Please enter your full name.');
        }
        if (!passwordCheck.valid) {
          throw new Error(passwordCheck.message);
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match. Please re-type.');
        }

        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        if (data.user) {
          await ensureProfile(data.user.id, fullName, email);
        }

        setMessage('Account created successfully! Please check your inbox for a confirmation email.', 'success');
        form.reset();
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const profile = await ensureProfile(data.user.id, data.user.user_metadata?.full_name || '', email);

        if (profile?.is_banned) {
          await supabase.auth.signOut();
          throw new Error('Your account is currently suspended by administration.');
        }

        setMessage('Login successful! Redirecting...', 'success');
        window.setTimeout(() => {
          window.location.href = 'home.html';
        }, 800);
      }
    } catch (error) {
      console.error('Auth transaction exception:', error.message);
      setMessage(error.message || 'Something went wrong. Please try again.', 'error');
    }
  });
}

setMode('login');