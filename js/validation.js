/**
 * Form Validation and Input Handling for NSU PODIUM 2026
 * Organizer: NSUDC — North South University Debate Club
 *
 * Validates the 5 official registration fields:
 * 1. Institution Full Name
 * 2. Club Name
 * 3. Number of Slots
 * 4. Representative's Name
 * 5. Representative's Contact No.
 */

class FormValidator {
  constructor(formElement) {
    this.form = formElement;
    this.fields = {
      institutionName: this.form.querySelector('#institutionName'),
      clubName: this.form.querySelector('#clubName'),
      slots: this.form.querySelector('#slots'),
      representativeName: this.form.querySelector('#representativeName'),
      representativePhone: this.form.querySelector('#representativePhone')
    };

    this.initListeners();
  }

  initListeners() {
    Object.keys(this.fields).forEach(key => {
      const input = this.fields[key];
      if (!input) return;

      input.addEventListener('blur', () => {
        this.validateField(key);
      });

      input.addEventListener('input', () => {
        this.clearFieldError(key);
      });
    });

    // Sanitizer for phone number
    if (this.fields.representativePhone) {
      this.fields.representativePhone.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^\d+ \-()]/g, '');
      });
    }

    // Number sanitization for slots
    if (this.fields.slots) {
      this.fields.slots.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^\d]/g, '');
      });
    }
  }

  isValidPhone(phone) {
    if (!phone) return false;
    const clean = phone.replace(/[\s\-\(\)]/g, '');
    const bdRegex = /^(?:\+?880|880|0)?(1[3-9]\d{8})$/;
    const intlRegex = /^\+?[0-9]{8,15}$/;
    return bdRegex.test(clean) || intlRegex.test(clean);
  }

  validateField(key) {
    const el = this.fields[key];
    if (!el) return true;

    const value = el.value ? el.value.trim() : '';
    let errorMsg = '';

    switch (key) {
      case 'institutionName':
        if (!value || value.length < 3) {
          errorMsg = 'Please enter your institution full name (min 3 letters).';
        }
        break;

      case 'clubName':
        if (!value || value.length < 2) {
          errorMsg = 'Please enter your club or delegation name.';
        }
        break;

      case 'slots':
        const slotsNum = parseInt(value, 10);
        if (!value || isNaN(slotsNum) || slotsNum < 1 || slotsNum > 25) {
          errorMsg = 'Enter requested slots (between 1 and 25).';
        }
        break;

      case 'representativeName':
        if (!value || value.length < 3) {
          errorMsg = "Please enter representative's full name.";
        }
        break;

      case 'representativePhone':
        if (!value || !this.isValidPhone(value)) {
          errorMsg = 'Please enter a valid representative contact number.';
        }
        break;
    }

    if (errorMsg) {
      this.setFieldError(key, errorMsg);
      return false;
    } else {
      this.clearFieldError(key);
      return true;
    }
  }

  setFieldError(key, msg) {
    const el = this.fields[key];
    if (!el) return;
    const group = el.closest('.form-group');
    if (!group) return;

    group.classList.add('has-error');
    el.setAttribute('aria-invalid', 'true');

    const errSpan = group.querySelector('.error-message-text');
    if (errSpan) errSpan.textContent = msg;
  }

  clearFieldError(key) {
    const el = this.fields[key];
    if (!el) return;
    const group = el.closest('.form-group');
    if (!group) return;

    group.classList.remove('has-error');
    el.setAttribute('aria-invalid', 'false');

    const errSpan = group.querySelector('.error-message-text');
    if (errSpan) errSpan.textContent = '';
  }

  validateAll() {
    let allValid = true;
    let firstError = null;

    Object.keys(this.fields).forEach(key => {
      const valid = this.validateField(key);
      if (!valid) {
        allValid = false;
        if (!firstError) firstError = this.fields[key];
      }
    });

    if (firstError) {
      firstError.focus();
    }

    return allValid;
  }

  reset() {
    this.form.reset();
    Object.keys(this.fields).forEach(key => {
      this.clearFieldError(key);
    });
  }
}

window.FormValidator = FormValidator;
