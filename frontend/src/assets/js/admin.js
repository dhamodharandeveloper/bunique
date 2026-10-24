/* ============================================================
   B.unique - Admin JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  initSidebar();
  initDeleteConfirms();
  initImagePreview();
  initAutoDismiss();
  initSearchFilters();
});

/* ---------- Mobile sidebar toggle ---------- */
function initSidebar() {
  var btn = document.getElementById('adminToggle');
  var side = document.querySelector('.admin-sidebar');
  if (!btn || !side) return;
  btn.addEventListener('click', function () { side.classList.toggle('open'); });
  document.addEventListener('click', function (e) {
    if (window.innerWidth < 992 && side.classList.contains('open') && !side.contains(e.target) && e.target !== btn) {
      side.classList.remove('open');
    }
  });
}

/* ---------- Confirm before delete ---------- */
function initDeleteConfirms() {
  var modalEl = document.getElementById('confirmDeleteModal');
  var modal = modalEl ? new bootstrap.Modal(modalEl) : null;
  var confirmBtn = document.getElementById('confirmDeleteBtn');
  var msgEl = document.querySelector('.ad-confirm-msg');
  var pending = null;

  function ask(target, message) {
    if (!modal) {
      return window.confirm(message || 'Are you sure?'); /* fallback */
    }
    if (msgEl) msgEl.textContent = message || 'This action cannot be undone.';
    pending = target;
    modal.show();
    return false;
  }

  document.querySelectorAll('form[data-confirm]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      if (!ask(form, form.dataset.confirm)) { e.preventDefault(); }
    });
  });
  document.querySelectorAll('a[data-confirm]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (!ask(a, a.dataset.confirm)) { e.preventDefault(); }
    });
  });

  if (confirmBtn) {
    confirmBtn.addEventListener('click', function () {
      var target = pending;
      pending = null;
      modal.hide();
      if (!target) { return; }
      if (target.tagName === 'FORM') { target.submit(); }
      else { window.location.href = target.href; }
    });
  }
  if (modalEl) {
    modalEl.addEventListener('hidden.bs.modal', function () { pending = null; });
  }
}

/* ---------- Image upload preview ---------- */
function initImagePreview() {
  document.querySelectorAll('input[type=file][data-preview]').forEach(function (input) {
    input.addEventListener('change', function () {
      var target = document.getElementById(input.dataset.preview);
      if (!target || !input.files.length) return;
      var reader = new FileReader();
      reader.onload = function (e) { target.src = e.target.result; target.style.display = 'block'; };
      reader.readAsDataURL(input.files[0]);
    });
  });
}

/* ---------- Auto-dismiss alerts ---------- */
function initAutoDismiss() {
  document.querySelectorAll('.alert').forEach(function (alert) {
    if (alert.classList.contains('no-auto')) return;
    setTimeout(function () {
      var bs = bootstrap.Alert.getOrCreateInstance(alert);
      if (bs) bs.close();
    }, 5000);
  });
}

/* ---------- Simple table search filters ---------- */
function initSearchFilters() {
  document.querySelectorAll('.ad-search-input').forEach(function (input) {
    var tableId = input.dataset.target;
    var table = document.getElementById(tableId);
    if (!table) return;
    input.addEventListener('input', function () {
      var term = input.value.toLowerCase();
      table.querySelectorAll('tbody tr').forEach(function (tr) {
        tr.style.display = tr.textContent.toLowerCase().indexOf(term) > -1 ? '' : 'none';
      });
    });
  });
}

/* ---------- Status quick update (select) ---------- */
function initStatusSelect() {
  document.querySelectorAll('select[data-auto-submit]').forEach(function (sel) {
    sel.addEventListener('change', function () { sel.form.submit(); });
  });
}
initStatusSelect();
