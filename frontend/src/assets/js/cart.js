/* ============================================================
   B.unique - Cart page enhancements
   (progressively enhances the buttons bound in main.js)
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  // Show/hide coupon feedback
  var couponMsg = document.querySelector('.coupon-message');
  if (couponMsg) {
    setTimeout(function () {
      couponMsg.style.opacity = '0';
      couponMsg.style.transition = 'opacity .6s';
      setTimeout(function () { couponMsg.remove(); }, 600);
    }, 5000);
  }

  // Guard against exceeding stock via qty inputs
  document.querySelectorAll('.qty-input').forEach(function (input) {
    input.addEventListener('change', function () {
      var max = parseInt(input.max, 10);
      var min = parseInt(input.min, 10);
      var v = parseInt(input.value, 10);
      if (isNaN(v)) v = min;
      if (max && v > max) v = max;
      if (v < min) v = min;
      input.value = v;
    });
  });
});
