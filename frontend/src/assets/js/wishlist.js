/* ============================================================
   B.unique - Wishlist page enhancements
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  // On the wishlist page, when an item is removed and reload happens,
  // this just keeps things tidy. Removal itself is handled in main.js.
  document.querySelectorAll('[data-wishlist-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      // Delay the page refresh slightly so the toast is visible
      setTimeout(function () { window.location.reload(); }, 700);
    });
  });
});
