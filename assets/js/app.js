const slides = Array.from(document.querySelectorAll('.slide'));
const dots = Array.from(document.querySelectorAll('.step-dot'));
const nextStepBtn = document.getElementById('nextStepBtn');
let currentSlide = 0;

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
    window.location.href = 'home.html';
  } else {
    goToNextStep();
  }
});
