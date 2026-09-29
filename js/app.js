/**
 * Main Application Controller for NSU PODIUM 2026
 * Organizer: NSUDC — North South University Debate Club
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const form = document.getElementById('podiumRegistrationForm');
  const formCard = document.getElementById('registrationCard');
  const successCard = document.getElementById('successCard');
  const submitBtn = document.getElementById('submitBtn');
  const submitBtnText = document.getElementById('submitBtnText');
  const submitSpinner = document.getElementById('submitSpinner');
  const formGlobalAlert = document.getElementById('formGlobalAlert');
  const formGlobalAlertText = document.getElementById('formGlobalAlertText');

  // Success Card Elements
  const refIdDisplay = document.getElementById('refIdDisplay');
  const copyRefBtn = document.getElementById('copyRefBtn');
  const newRegistrationBtn = document.getElementById('newRegistrationBtn');
  const receiptName = document.getElementById('receiptName');
  const receiptId = document.getElementById('receiptId');
  const receiptDept = document.getElementById('receiptDept');
  const receiptTrack = document.getElementById('receiptTrack');

  // Navigation
  const siteHeader = document.getElementById('siteHeader');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNav = document.getElementById('mobileNav');
  const navLinks = document.querySelectorAll('.nav-item-link');

  // Initialize Validator
  let validator = null;
  if (form) {
    validator = new FormValidator(form);
  }

  // =========================================================================
  // SUBMISSION CONTROLLER
  // =========================================================================
  function setSubmitLoading(isLoading) {
    if (isLoading) {
      submitBtn.disabled = true;
      if (submitSpinner) submitSpinner.style.display = 'inline-block';
      if (submitBtnText) submitBtnText.textContent = 'Processing Registration...';
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

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!validator.validateAll()) return;

      const payload = {
        fullName: document.getElementById('fullName').value,
        studentId: document.getElementById('studentId').value,
        department: document.getElementById('department').value,
        batch: document.getElementById('batch').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        eventPreference: document.getElementById('eventPreference').value
      };

      setSubmitLoading(true);

      try {
        const record = await window.registrationService.submitRegistration(payload);

        // Populate receipt
        if (refIdDisplay) refIdDisplay.textContent = record.referenceId;
        if (receiptName) receiptName.textContent = record.fullName;
        if (receiptId) receiptId.textContent = record.studentId;
        if (receiptDept) receiptDept.textContent = record.department;
        if (receiptTrack) receiptTrack.textContent = record.eventPreference;

        // Switch to success card
        form.style.display = 'none';
        if (successCard) {
          successCard.classList.add('active');
          successCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } catch (err) {
        showGlobalAlert(err.message || 'An error occurred during submission. Please try again.');
      } finally {
        setSubmitLoading(false);
      }
    });
  }

  // Copy Reference ID
  if (copyRefBtn) {
    copyRefBtn.addEventListener('click', () => {
      const id = refIdDisplay ? refIdDisplay.textContent : '';
      if (!id) return;

      navigator.clipboard.writeText(id).then(() => {
        const originalText = copyRefBtn.innerHTML;
        copyRefBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Copied to Clipboard!
        `;
        copyRefBtn.style.backgroundColor = '#15803d';
        copyRefBtn.style.color = '#ffffff';

        setTimeout(() => {
          copyRefBtn.innerHTML = originalText;
          copyRefBtn.style.backgroundColor = '';
          copyRefBtn.style.color = '';
        }, 2200);
      });
    });
  }

  // Register Another Delegate
  if (newRegistrationBtn) {
    newRegistrationBtn.addEventListener('click', () => {
      if (validator) validator.reset();
      if (successCard) successCard.classList.remove('active');
      if (form) form.style.display = 'block';
      if (formCard) formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // =========================================================================
  // FAQ ACCORDION
  // =========================================================================
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');
        faqItems.forEach(other => other.classList.remove('active'));
        if (!isOpen) {
          item.classList.add('active');
        }
      });
    }
  });

  // =========================================================================
  // NAVIGATION & SCROLLSPY
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
      mobileNav.classList.toggle('open');
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mobileNav) mobileNav.classList.remove('open');
    });
  });

  // Scrollspy: active nav indicator
  const sections = document.querySelectorAll('section[id]');
  function updateScrollspy() {
    const scrollY = window.pageYOffset + 120;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop;
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }
  window.addEventListener('scroll', updateScrollspy);
});
