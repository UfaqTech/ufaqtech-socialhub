const slides = Array.from(document.querySelectorAll('.slide'));
const dots = Array.from(document.querySelectorAll('.step-dot'));
const nextStepBtn = document.getElementById('nextStepBtn');
let currentSlide = 0;

const supabaseUrl = window.UFAQTECH_SUPABASE_URL || 'https://YOUR_SUPABASE_URL.supabase.co';
const supabaseKey = window.UFAQTECH_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const supabase = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;

async function handleOAuthRedirect() {
  if (!supabase || !window.location.hash || !window.location.hash.includes('access_token')) {
    return;
  }

  try {
    const { error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
    if (error) throw error;
    window.location.hash = '';
    window.location.href = 'home.html';
  } catch (error) {
    console.warn('OAuth redirect failed:', error?.message || error);
    window.location.hash = '';
    window.location.href = 'login.html';
  }
}

function renderSlides() {
  slides.forEach((slide, index) => slide.classList.toggle('active', index === currentSlide));
  dots.forEach((dot, index) => dot.classList.toggle('active', index === currentSlide));
}

function goToNextStep() {
  currentSlide = (currentSlide + 1) % slides.length;
  renderSlides();

  if (currentSlide === slides.length - 1) {
    nextStepBtn.textContent = 'Continue';
  } else {
    nextStepBtn.textContent = 'Next Step';
  }
}

if (slides.length) {
  renderSlides();
  setInterval(goToNextStep, 3500);
}

nextStepBtn?.addEventListener('click', () => {
  if (currentSlide === slides.length - 1) {
    window.location.href = 'login.html';
  } else {
    goToNextStep();
  }
});
