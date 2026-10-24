/* ============================================================
   B.unique - Client-side form validation
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  // Validate a single field
  function validateField(field) {
    var value = field.value.trim();
    var valid = true;
    var msg = '';

    if (field.required && value === '') {
      valid = false; msg = 'This field is required.';
    } else if (field.type === 'email' && value !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      valid = false; msg = 'Please enter a valid email address.';
    } else if (field.name === 'password' && value !== '' && value.length < 6) {
      valid = false; msg = 'Password must be at least 6 characters.';
    } else if (field.name === 'phone' && value !== '' && !/^[+0-9\s-]{8,15}$/.test(value)) {
      valid = false; msg = 'Please enter a valid phone number.';
    } else if (field.name === 'zip' && value !== '' && !/^[0-9]{4,10}$/.test(value)) {
      valid = false; msg = 'Please enter a valid PIN code.';
    } else if (field.name === 'confirm_password') {
      var pw = field.form.querySelector('[name="password"]');
      if (pw && pw.value !== value) { valid = false; msg = 'Passwords do not match.'; }
    }

    field.classList.toggle('is-invalid', !valid);
    var fb = field.parentElement.querySelector('.invalid-feedback');
    if (valid) {
      if (fb) fb.remove();
    } else {
      if (!fb) {
        fb = document.createElement('div');
        fb.className = 'invalid-feedback';
        field.parentElement.appendChild(fb);
      }
      fb.textContent = msg;
    }
    return valid;
  }

  document.querySelectorAll('form[data-validate]').forEach(function (form) {
    form.setAttribute('novalidate', 'novalidate');
    form.querySelectorAll('input, textarea, select').forEach(function (f) {
      f.addEventListener('blur', function () { validateField(f); });
      f.addEventListener('input', function () {
        if (f.classList.contains('is-invalid')) validateField(f);
      });
    });
    form.addEventListener('submit', function (e) {
      var ok = true;
      form.querySelectorAll('input, textarea, select').forEach(function (f) {
        if (!validateField(f)) ok = false;
      });
      if (!ok) { e.preventDefault(); e.stopPropagation(); }
      form.classList.add('was-validated');
    });
  });
});
