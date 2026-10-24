/* ============================================================
   B.unique - Search page helpers
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  var searchForm = document.getElementById('searchForm');
  if (!searchForm) return;
  var input = searchForm.querySelector('input[name="q"]');
  var btn = searchForm.querySelector('button[type="submit"]');

  searchForm.addEventListener('submit', function (e) {
    var term = input.value.trim();
    if (term.length === 0) {
      e.preventDefault();
      input.classList.add('is-invalid');
      input.focus();
      return;
    }
    if (btn) {
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Searching...';
      btn.disabled = true;
    }
  });
});
