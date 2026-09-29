/**
 * Main Application Controller for NSU PODIUM
 * Organizer: NSUDC — North South University Debate Club
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const registrationForm = document.getElementById('eventRegistrationForm');
  const formCard = document.getElementById('registrationFormCard');
  const successCard = document.getElementById('successCard');
  const submitBtn = document.getElementById('submitBtn');
  const submitBtnText = document.getElementById('submitBtnText');
  const submitSpinner = document.getElementById('submitSpinner');
  const formGlobalAlert = document.getElementById('formGlobalAlert');
  const formGlobalAlertText = document.getElementById('formGlobalAlertText');

  // Input & Success Elements
  const slotsInput = document.getElementById('slots');
  const refIdDisplay = document.getElementById('refIdDisplay');
  const newRegistrationBtn = document.getElementById('newRegistrationBtn');

  // Navigation Elements
  const siteHeader = document.getElementById('siteHeader');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNav = document.getElementById('mobileNav');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav .nav-item-link');

  // Initialize Validator
  const validator = new FormValidator(registrationForm);

  // =========================================================================
  // SUBMISSION LIFECYCLE
  // =========================================================================
  function setSubmitLoading(isLoading) {
    if (isLoading) {
      submitBtn.disabled = true;
      if (submitSpinner) submitSpinner.style.display = 'inline-block';
      if (submitBtnText) submitBtnText.textContent = 'Submitting...';
      if (formGlobalAlert) formGlobalAlert.style.display = 'none';
    } else {
      submitBtn.disabled = false;
      if (submitSpinner) submitSpinner.style.display = 'none';
      if (submitBtnText) submitBtnText.textContent = 'Submit Registration';
    }
  }

  function showGlobalAlert(message) {
    if (formGlobalAlertText) formGlobalAlertText.textContent = message;
    if (formGlobalAlert) formGlobalAlert.style.display = 'flex';
  }

  if (registrationForm) {
    registrationForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // 1. Client-side field validation for all 5 fields
      const isValid = validator.validateAll();
      if (!isValid) return;

      // 2. Prepare payload
      const payload = {
        institutionName: document.getElementById('institutionName').value,
        clubName: document.getElementById('clubName').value,
        slots: slotsInput.value,
        representativeName: document.getElementById('representativeName').value,
        representativePhone: document.getElementById('representativePhone').value
      };

      setSubmitLoading(true);

      try {
        // 3. Submit via Storage/API Service
        const result = await window.registrationService.submitRegistration(payload);

        // 4. Render Success State
        if (refIdDisplay) {
          refIdDisplay.textContent = result.referenceId;
        }

        // Hide form and show success state
        registrationForm.style.display = 'none';
        if (successCard) {
          successCard.classList.add('active');
          successCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

      } catch (error) {
        showGlobalAlert(error.message || 'An unexpected error occurred. Please try again.');
      } finally {
        setSubmitLoading(false);
      }
    });
  }

  // Action to submit another registration
  if (newRegistrationBtn) {
    newRegistrationBtn.addEventListener('click', () => {
      validator.reset();
      if (successCard) successCard.classList.remove('active');
      if (registrationForm) registrationForm.style.display = 'block';
      if (formCard) formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // =========================================================================
  // NAVIGATION & SCROLL EVENTS
  // =========================================================================
  if (siteHeader) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    });
  }

  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      mobileMenuBtn.setAttribute('aria-expanded', isOpen.toString());
    });
  }

  if (mobileNavLinks && mobileNav) {
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Event Countdown Timer
  function initCountdown() {
    const eventDate = new Date('2026-11-14T09:00:00+06:00').getTime();
    const daysEl = document.getElementById('countdownDays');
    const hoursEl = document.getElementById('countdownHours');
    const minsEl = document.getElementById('countdownMins');

    if (!daysEl || !hoursEl || !minsEl) return;

    function update() {
      const now = new Date().getTime();
      const distance = eventDate - now;

      if (distance < 0) {
        daysEl.textContent = '00';
        hoursEl.textContent = '00';
        minsEl.textContent = '00';
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      daysEl.textContent = String(days).padStart(2, '0');
      hoursEl.textContent = String(hours).padStart(2, '0');
      minsEl.textContent = String(minutes).padStart(2, '0');
    }

    update();
    setInterval(update, 60000);
  }
  initCountdown();
});
