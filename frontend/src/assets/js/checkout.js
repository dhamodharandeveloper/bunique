/* ============================================================
   B.unique - Checkout enhancements
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  var saveBtn = document.getElementById('placeOrderBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', function () {
      var btn = this;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Placing order...';
      btn.disabled = true;
      setTimeout(function () { btn.disabled = false; }, 30000);
    });
  }

  // Prevent double submit
  var checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', function () {
      var btn = checkoutForm.querySelector('[type="submit"]');
      if (btn) {
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Placing order...';
        btn.disabled = true;
      }
    });
  }
});
