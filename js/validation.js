/**
 * Form Validation and Input Formatting Logic
 * Provides real-time field validation, accessible error announcements,
 * and Bangladeshi phone number parsing with flexible formatting.
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

    this.initEventListeners();
  }

  initEventListeners() {
    // Real-time validation on blur
    Object.keys(this.fields).forEach(key => {
      const field = this.fields[key];
      if (!field) return;

      field.addEventListener('blur', () => {
        this.validateField(key);
      });

      // Clear error state on input change
      field.addEventListener('input', () => {
        this.clearFieldError(key);
      });
    });

    // Special keyboard handling for Number of Slots stepper input
    if (this.fields.slots) {
      this.fields.slots.addEventListener('keydown', (e) => {
        // Prevent typing scientific notation 'e', '+', '-', '.'
        if (['e', 'E', '+', '-', '.'].includes(e.key)) {
          e.preventDefault();
        }
      });

      this.fields.slots.addEventListener('paste', (e) => {
        const pasteData = (e.clipboardData || window.clipboardData).getData('text');
        if (!/^\d+$/.test(pasteData)) {
          e.preventDefault();
        }
      });
    }

    // Phone number input formatter/sanitizer
    if (this.fields.representativePhone) {
      this.fields.representativePhone.addEventListener('input', (e) => {
        // Disallow letters
        e.target.value = e.target.value.replace(/[^\d+ \-]/g, '');
      });
    }
  }

  /**
   * Validates Bangladeshi phone numbers flexibly
   * Supports:
   *  - Standard: 01712345678, 01812345678, 019..., 015..., 016..., 013..., 014...
   *  - International prefix: +8801712345678, 8801712345678
   *  - Formatted with hyphens/spaces: 01712-345678, +880 1712 345678
   */
  isValidPhone(phone) {
    if (!phone) return false;
    const cleanNumber = phone.replace(/[\s\-\(\)]/g, '');

    // Bangladeshi pattern check
    // BD operators: 013, 014, 015, 016, 017, 018, 019
    const bdRegex = /^(?:\+?880|880|0)?(1[3-9]\d{8})$/;
    
    // Also accept general international formats (10 to 15 digits) if foreign institution
    const genericInternationalRegex = /^\+?[0-9]{8,15}$/;

    return bdRegex.test(cleanNumber) || genericInternationalRegex.test(cleanNumber);
  }

  /**
   * Validate individual field by key
   */
  validateField(key) {
    const field = this.fields[key];
    if (!field) return true;

    const value = field.value.trim();
    let errorMessage = '';

    switch (key) {
      case 'institutionName':
        if (!value) {
          errorMessage = 'Institution name is required.';
        }
        break;

      case 'clubName':
        if (!value) {
          errorMessage = 'Club name is required.';
        }
        break;

      case 'slots':
        const numSlots = Number(value);
        if (!value || isNaN(numSlots) || !Number.isInteger(numSlots) || numSlots <= 0) {
          errorMessage = 'Please enter a valid number of slots.';
        }
        break;

      case 'representativeName':
        if (!value) {
          errorMessage = 'Representative name is required.';
        }
        break;

      case 'representativePhone':
        if (!value || !this.isValidPhone(value)) {
          errorMessage = 'Please enter a valid contact number.';
        }
        break;
    }

    if (errorMessage) {
      this.setFieldError(key, errorMessage);
      return false;
    } else {
      this.clearFieldError(key);
      return true;
    }
  }

  /**
   * Set field error and accessibility states
   */
  setFieldError(key, message) {
    const field = this.fields[key];
    const group = field.closest('.form-group');
    if (!group) return;

    group.classList.add('has-error');
    field.setAttribute('aria-invalid', 'true');

    const errorEl = group.querySelector('.error-message-text');
    if (errorEl) {
      errorEl.textContent = message;
    }
  }

  /**
   * Clear error state
   */
  clearFieldError(key) {
    const field = this.fields[key];
    const group = field.closest('.form-group');
    if (!group) return;

    group.classList.remove('has-error');
    field.setAttribute('aria-invalid', 'false');

    const errorEl = group.querySelector('.error-message-text');
    if (errorEl) {
      errorEl.textContent = '';
    }
  }

  /**
   * Validate all form fields
   */
  validateAll() {
    let isValid = true;
    let firstErrorField = null;

    Object.keys(this.fields).forEach(key => {
      const fieldValid = this.validateField(key);
      if (!fieldValid) {
        isValid = false;
        if (!firstErrorField) {
          firstErrorField = this.fields[key];
        }
      }
    });

    if (firstErrorField) {
      firstErrorField.focus();
    }

    return isValid;
  }

  /**
   * Reset all fields and errors
   */
  reset() {
    this.form.reset();
    Object.keys(this.fields).forEach(key => {
      this.clearFieldError(key);
    });
  }
}

// Export for app usage
window.FormValidator = FormValidator;
