/**
 * Main Application Controller for NSU PODIUM 2026 (WEBSITE 1)
 * Organizer: NSUDC — North South University Debate Club
 * Handles Page 1 interactions and Page 2 Team Registration (Bangla) Form
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // PAGE 2: TEAM REGISTRATION (BANGLA) FORM CONTROLLER
  // =========================================================================
  const p2Form = document.getElementById('banglaRegistrationForm');
  const p2SuccessCard = document.getElementById('p2SuccessCard');
  const registerSubmitBtn = document.getElementById('registerSubmitBtn');
  const registerAnotherBtn = document.getElementById('registerAnotherBtn');

  if (p2Form) {
    const fields = {
      institutionClubName: document.getElementById('institutionClubName'),
      representativeName: document.getElementById('representativeName'),
      contactNo: document.getElementById('contactNo'),
      email: document.getElementById('email'),
      slots: document.getElementById('slots')
    };

    const errors = {
      institutionClubName: document.getElementById('institutionClubNameError'),
      representativeName: document.getElementById('representativeNameError'),
      contactNo: document.getElementById('contactNoError'),
      email: document.getElementById('emailError'),
      slots: document.getElementById('slotsError')
    };

    // Valid Slot Options (Strictly 1, 2, 3, or 4 as Required)
    const VALID_SLOTS = ['1', '2', '3', '4'];

    // Real-time error clearing when user types or selects
    Object.keys(fields).forEach(key => {
      const field = fields[key];
      const errorEl = errors[key];
      if (!field) return;

      const clearError = () => {
        field.classList.remove('has-error');
        if (errorEl) errorEl.classList.remove('active');
      };

      field.addEventListener('input', clearError);
      field.addEventListener('change', clearError);
      field.addEventListener('blur', () => {
        if (field.value.trim() !== '') {
          validateField(key);
        }
      });
    });

    // Validate a single field
    function validateField(key) {
      const field = fields[key];
      const errorEl = errors[key];
      if (!field) return true;

      const val = (field.value || '').trim();
      let isValid = true;
      let errorMsg = '';

      switch (key) {
        case 'institutionClubName':
          if (!val || val.length < 2) {
            isValid = false;
            errorMsg = 'Institution/Club Name is required.';
          }
          break;

        case 'representativeName':
          if (!val || val.length < 2) {
            isValid = false;
            errorMsg = 'Representative Name is required.';
          }
          break;

        case 'contactNo':
          const cleanPhone = val.replace(/[\s\-\(\)]/g, '');
          if (!cleanPhone || cleanPhone.length < 8) {
            isValid = false;
            errorMsg = 'Valid Contact No is required.';
          }
          break;

        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!val || !emailRegex.test(val)) {
            isValid = false;
            errorMsg = 'Valid email is required.';
          }
          break;

        case 'slots':
          // Matching Reference Image 2: "Choose number of slots (1-4)."
          if (!val || !VALID_SLOTS.includes(val)) {
            isValid = false;
            errorMsg = 'Choose number of slots (1-4).';
          }
          break;
      }

      if (!isValid) {
        field.classList.add('has-error');
        if (errorEl) {
          errorEl.textContent = errorMsg;
          errorEl.classList.add('active');
        }
      } else {
        field.classList.remove('has-error');
        if (errorEl) errorEl.classList.remove('active');
      }

      return isValid;
    }

    // Validate all fields on submit
    function validateAll() {
      let allValid = true;
      let firstInvalid = null;

      Object.keys(fields).forEach(key => {
        const valid = validateField(key);
        if (!valid) {
          allValid = false;
          if (!firstInvalid && fields[key]) {
            firstInvalid = fields[key];
          }
        }
      });

      if (firstInvalid) {
        firstInvalid.focus();
      }

      return allValid;
    }

    // Form Submission
    p2Form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!validateAll()) return;

      const payload = {
        institutionClubName: fields.institutionClubName.value.trim(),
        representativeName: fields.representativeName.value.trim(),
        contactNo: fields.contactNo.value.trim(),
        email: fields.email.value.trim(),
        slots: fields.slots.value.trim()
      };

      if (registerSubmitBtn) {
        registerSubmitBtn.disabled = true;
        registerSubmitBtn.textContent = 'Registering...';
      }

      try {
        const result = await window.registrationService.submitRegistration(payload);

        // Populate receipt fields
        const receiptRefId = document.getElementById('receiptRefId');
        const receiptInstClub = document.getElementById('receiptInstClub');
        const receiptRepName = document.getElementById('receiptRepName');
        const receiptContactNo = document.getElementById('receiptContactNo');
        const receiptEmail = document.getElementById('receiptEmail');
        const receiptSlots = document.getElementById('receiptSlots');

        if (receiptRefId) receiptRefId.textContent = result.referenceId;
        if (receiptInstClub) receiptInstClub.textContent = result.institutionClubName;
        if (receiptRepName) receiptRepName.textContent = result.representativeName;
        if (receiptContactNo) receiptContactNo.textContent = result.contactNo;
        if (receiptEmail) receiptEmail.textContent = result.email;
        if (receiptSlots) receiptSlots.textContent = `${result.slots} Slot(s)`;

        // Switch to receipt view
        p2Form.style.display = 'none';
        if (p2SuccessCard) {
          p2SuccessCard.classList.add('active');
          p2SuccessCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } catch (err) {
        alert(err.message || 'An error occurred during registration. Please try again.');
      } finally {
        if (registerSubmitBtn) {
          registerSubmitBtn.disabled = false;
          registerSubmitBtn.textContent = 'Register';
        }
      }
    });

    // Reset Form for another registration
    if (registerAnotherBtn) {
      registerAnotherBtn.addEventListener('click', () => {
        p2Form.reset();
        Object.keys(fields).forEach(key => {
          if (fields[key]) fields[key].classList.remove('has-error');
          if (errors[key]) errors[key].classList.remove('active');
        });

        if (p2SuccessCard) p2SuccessCard.classList.remove('active');
        p2Form.style.display = 'flex';
        p2Form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  // =========================================================================
  // PAGE 1: BUTTON MICRO-INTERACTIONS
  // =========================================================================
  const registerNowBtn = document.getElementById('registerNowBtn');
  if (registerNowBtn) {
    registerNowBtn.addEventListener('mouseenter', () => {
      registerNowBtn.style.transform = 'translateY(-2px) scale(1.02)';
    });
    registerNowBtn.addEventListener('mouseleave', () => {
      registerNowBtn.style.transform = 'translateY(0) scale(1)';
    });
  }
});
