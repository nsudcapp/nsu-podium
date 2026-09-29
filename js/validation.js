/**
 * Form Validation and Input Handling for NSU PODIUM 2026
 * Organizer: NSUDC — North South University Debate Club
 */

class FormValidator {
  constructor(formElement) {
    this.form = formElement;
    this.fields = {
      fullName: this.form.querySelector('#fullName'),
      studentId: this.form.querySelector('#studentId'),
      department: this.form.querySelector('#department'),
      batch: this.form.querySelector('#batch'),
      email: this.form.querySelector('#email'),
      phone: this.form.querySelector('#phone'),
      eventPreference: this.form.querySelector('#eventPreference'),
      terms: this.form.querySelector('#terms')
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

      if (input.type === 'checkbox' || input.tagName === 'SELECT') {
        input.addEventListener('change', () => {
          this.validateField(key);
        });
      }
    });

    // Sanitizer for phone number
    if (this.fields.phone) {
      this.fields.phone.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^\d+ \-()]/g, '');
      });
    }
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
      case 'fullName':
        if (!value || value.length < 2) {
          errorMsg = 'Please enter your full name.';
        }
        break;

      case 'studentId':
        if (!value || value.length < 4) {
          errorMsg = 'Please enter a valid Student ID number.';
        }
        break;

      case 'department':
        if (!value) {
          errorMsg = 'Please select or enter your academic department.';
        }
        break;

      case 'batch':
        if (!value) {
          errorMsg = 'Please enter your academic batch (e.g. 212 or Spring 2022).';
        }
        break;

      case 'email':
        if (!value || !this.isValidEmail(value)) {
          errorMsg = 'Please enter a valid institutional or personal email address.';
        }
        break;

      case 'phone':
        if (!value || !this.isValidPhone(value)) {
          errorMsg = 'Please enter a valid contact phone number.';
        }
        break;

      case 'eventPreference':
        if (!value) {
          errorMsg = 'Please select your participation category.';
        }
        break;

      case 'terms':
        if (!el.checked) {
          errorMsg = 'You must agree to the event guidelines and code of conduct.';
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
    const group = el.closest('.form-group') || el.closest('.form-group-full');
    if (!group) return;

    group.classList.add('has-error');
    el.setAttribute('aria-invalid', 'true');

    const errSpan = group.querySelector('.error-message-text');
    if (errSpan) errSpan.textContent = msg;
  }

  clearFieldError(key) {
    const el = this.fields[key];
    if (!el) return;
    const group = el.closest('.form-group') || el.closest('.form-group-full');
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
