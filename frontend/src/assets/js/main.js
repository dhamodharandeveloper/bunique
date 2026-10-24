/* ============================================================
   B.unique - Main frontend JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  initScrollTop();
  initQtyBoxes();
  initProductGallery();
  initFaq();
  initZoom();
  initSearchSuggestion();
  initPaymentOptions();
  initMap();
  initConfirmModal();

  // Cart / wishlist actions use data attributes
  bindAjaxActions();
});

/* ---------- Map tap-to-enable (mobile) ---------- */
function initMap() {
  var wrap = document.querySelector('.map-wrap');
  var activate = document.getElementById('mapActivate');
  if (!wrap || !activate) return;
  activate.addEventListener('click', function () {
    wrap.classList.add('active');
  });
}

/* ---------- Confirm modal ---------- */
var confirmModal = null;
var confirmCallback = null;

function initConfirmModal() {
  var el = document.getElementById('confirmModal');
  if (!el) return;
  confirmModal = new bootstrap.Modal(el);
  var btn = document.getElementById('confirmModalBtn');
  if (btn) {
    btn.addEventListener('click', function () {
      var cb = confirmCallback;
      confirmCallback = null;
      confirmModal.hide();
      if (cb) cb();
    });
  }
}

function askConfirm(title, message, callback) {
  if (!confirmModal) { if (callback) callback(); return; }
  var t = document.getElementById('confirmModalTitle');
  var m = document.getElementById('confirmModalMsg');
  if (t) t.textContent = title;
  if (m) m.textContent = message;
  confirmCallback = callback;
  confirmModal.show();
}

/* ---------- Scroll to top ---------- */
function initScrollTop() {
  var btn = document.getElementById('scrollTop');
  if (!btn) return;
  window.addEventListener('scroll', function () {
    btn.classList.toggle('show', window.scrollY > 400);
  });
  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------- Quantity stepper ---------- */
function initQtyBoxes() {
  document.querySelectorAll('.qty-box').forEach(function (box) {
    var input = box.querySelector('.qty-input');
    if (!input) return;
    box.querySelector('.qty-minus').addEventListener('click', function () {
      var v = parseInt(input.value, 10) || 1;
      if (v > 1) input.value = v - 1;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    box.querySelector('.qty-plus').addEventListener('click', function () {
      var v = parseInt(input.value, 10) || 1;
      var max = parseInt(input.max || '999', 10);
      if (v < max) input.value = v + 1;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });
}

/* ---------- Product gallery thumbs ---------- */
function initProductGallery() {
  var main = document.getElementById('mainProductImg');
  if (!main) return;
  document.querySelectorAll('.thumb-img').forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      main.src = thumb.dataset.img;
      document.querySelectorAll('.thumb-img').forEach(function (t) { t.classList.remove('active'); });
      thumb.classList.add('active');
    });
  });
  if (main) main.addEventListener('click', function () { openZoom(main.src); });
}

/* ---------- Image zoom overlay ---------- */
function initZoom() {
  var overlay = document.getElementById('zoomOverlay');
  if (!overlay) return;
  overlay.addEventListener('click', function () { overlay.classList.remove('show'); });
}
function openZoom(src) {
  var overlay = document.getElementById('zoomOverlay');
  var img = overlay.querySelector('img');
  img.src = src;
  overlay.classList.add('show');
}

/* ---------- FAQ accordion (custom) ---------- */
function initFaq() {
  document.querySelectorAll('.faq-item .faq-q').forEach(function (q) {
    q.addEventListener('click', function () {
      var a = q.parentElement.querySelector('.faq-a');
      var icon = q.querySelector('i');
      var isOpen = a.style.display === 'block';
      document.querySelectorAll('.faq-item .faq-a').forEach(function (x) { x.style.display = 'none'; });
      document.querySelectorAll('.faq-item .faq-q i').forEach(function (i) { i.className = 'bi bi-plus'; });
      if (!isOpen) {
        a.style.display = 'block';
        if (icon) icon.className = 'bi bi-dash';
      }
    });
  });
}

/* ---------- Payment method selection ---------- */
function initPaymentOptions() {
  document.querySelectorAll('.payment-option').forEach(function (opt) {
    var radio = opt.querySelector('input[type=radio]');
    if (!radio) return;
    opt.addEventListener('click', function () {
      radio.checked = true;
      document.querySelectorAll('.payment-option').forEach(function (o) { o.classList.remove('selected'); });
      opt.classList.add('selected');
    });
  });
}

/* ---------- Search suggestions ---------- */
function initSearchSuggestion() {
  var input = document.getElementById('searchInput');
  var box = document.getElementById('searchSuggest');
  if (!input || !box) return;

  var timer = null;
  input.addEventListener('input', function () {
    clearTimeout(timer);
    var term = input.value.trim();
    if (term.length < 2) { box.classList.remove('show'); return; }
    timer = setTimeout(function () {
      fetch(BASE_URL + '/includes/ajax-search.php?term=' + encodeURIComponent(term))
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (!data.length) { box.classList.remove('show'); return; }
          box.innerHTML = data.map(function (p) {
            return '<a class="suggestion" href="' + BASE_URL + '/product-details.php?slug=' + p.slug + '">'
              + '<span class="thumb" style="background-image:url(' + (p.img || '') + ')"></span>'
              + '<span class="name">' + p.name + '</span>'
              + '<span class="price">' + p.price + '</span></a>';
          }).join('');
          box.classList.add('show');
        }).catch(function () { box.classList.remove('show'); });
    }, 250);
  });
  document.addEventListener('click', function (e) {
    if (!box.contains(e.target) && e.target !== input) box.classList.remove('show');
  });
}

function csrfParam() {
  return 'csrf_token=' + encodeURIComponent(window.CSRF_TOKEN || '');
}

// A stale/cached page will carry an outdated token; refresh so it self-heals.
function handleAjax(d) {
  if (d && d.session_expired) {
    window.location.reload();
    return true;
  }
  return false;
}

/* ---------- AJAX add/remove to cart & wishlist ---------- */
function bindAjaxActions() {
  document.querySelectorAll('[data-add-cart]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var id = btn.dataset.addCart;
      var qty = btn.dataset.qty ? parseInt(btn.dataset.qty, 10) || 1 : 1;
      var box = btn.closest('.product-detail');
      if (box) {
        var q = box.querySelector('.qty-box .qty-input');
        if (q) qty = parseInt(q.value, 10) || 1;
      }
      fetch(BASE_URL + '/includes/ajax-cart.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'action=add&product_id=' + id + '&qty=' + qty + '&' + csrfParam()
      }).then(function (r) { return r.json(); }).then(function (d) {
        if (handleAjax(d)) return;
        toastMsg(d.message, d.success);
        updateCartCount(d.cart_count);
      });
    });
  });

  document.querySelectorAll('[data-wishlist-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var id = btn.dataset.wishlistToggle;
      fetch(BASE_URL + '/includes/ajax-wishlist.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'action=toggle&product_id=' + id + '&' + csrfParam()
      }).then(function (r) { return r.json(); }).then(function (d) {
        if (handleAjax(d)) return;
        toastMsg(d.message, d.success);
        var ic = btn.querySelector('i');
        if (ic) ic.className = d.in_wishlist ? 'bi bi-heart-fill text-gold' : 'bi bi-heart';
        var badge = document.getElementById('wishlistCount');
        if (badge) badge.textContent = d.wishlist_count;
      });
    });
  });

  document.querySelectorAll('[data-remove-cart]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var id = btn.dataset.removeCart;
      askConfirm('Remove from cart?', 'This item will be removed from your cart.', function () {
        removeCartItem(id);
      });
    });
  });

  // Inline quantity update on cart page
  document.querySelectorAll('.qty-input[data-cart-update]').forEach(function (input) {
    input.addEventListener('change', function () {
      var id = input.dataset.cartUpdate;
      var qty = parseInt(input.value, 10) || 1;
      fetch(BASE_URL + '/includes/ajax-cart.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'action=update&product_id=' + id + '&qty=' + qty + '&' + csrfParam()
      }).then(function (r) { return r.json(); }).then(function (d) {
        if (handleAjax(d)) return;
        if (d.reload) window.location.reload();
      });
    });
  });
}

function updateCartCount(n) {
  var badge = document.getElementById('cartCount');
  if (badge) badge.textContent = n;
}

function removeCartItem(id) {
  fetch(BASE_URL + '/includes/ajax-cart.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'action=remove&product_id=' + id + '&' + csrfParam()
  }).then(function (r) { return r.json(); }).then(function (d) {
    if (handleAjax(d)) return;
    toastMsg(d.message, d.success);
    updateCartCount(d.cart_count);
    if (d.reload) window.location.reload();
  });
}

/* ---------- Toast ---------- */
function toastMsg(msg, success) {
  var el = document.getElementById('toastMsg');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toastMsg';
    el.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:3000;padding:12px 24px;border-radius:40px;color:#fff;font-size:14px;box-shadow:0 8px 24px rgba(0,0,0,.25);opacity:0;transition:opacity .3s;max-width:90%;';
    document.body.appendChild(el);
  }
  el.style.background = success ? '#2e8b57' : '#c0392b';
  el.textContent = msg;
  el.style.opacity = '1';
  setTimeout(function () { el.style.opacity = '0'; }, 2800);
}
