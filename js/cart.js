/* SAVIG STYLE — Cart logic
   Handles: size selection, quantity stepper, add-to-cart, cart badge,
   and rendering the cart page. Cart is persisted in localStorage since
   this is a static site with no backend.
*/
(function () {
  'use strict';

  var CART_KEY = 'savigCart';
  var WHATSAPP_NUMBER = '923222920135';
  var MAX_QTY = 10;

  function getCart() {
    try {
      var raw = localStorage.getItem(CART_KEY);
      var cart = raw ? JSON.parse(raw) : [];
      return Array.isArray(cart) ? cart : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) { /* storage unavailable — fail silently */ }
    updateBadges(cart);
  }

  function cartCount(cart) {
    return cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
  }

  function cartTotal(cart) {
    return cart.reduce(function (sum, item) { return sum + item.qty * item.price; }, 0);
  }

  function formatPrice(n) {
    return 'Rs ' + n.toLocaleString('en-PK');
  }

  function updateBadges(cart) {
    cart = cart || getCart();
    var count = cartCount(cart);
    document.querySelectorAll('.cart-badge').forEach(function (el) {
      el.textContent = count;
      el.style.display = count > 0 ? '' : 'none';
    });
    var mobileEl = document.getElementById('cart-badge-mobile');
    if (mobileEl) mobileEl.textContent = count;
  }

  function addToCart(newItem) {
    var cart = getCart();
    var existing = null;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].productId === newItem.productId && cart[i].size === newItem.size) {
        existing = cart[i];
        break;
      }
    }
    if (existing) {
      existing.qty = Math.min(MAX_QTY, existing.qty + newItem.qty);
    } else {
      cart.push(newItem);
    }
    saveCart(cart);
  }

  function removeItem(index) {
    var cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
  }

  function setItemQty(index, qty) {
    var cart = getCart();
    if (!cart[index]) return;
    qty = Math.max(1, Math.min(MAX_QTY, qty));
    cart[index].qty = qty;
    saveCart(cart);
    renderCart();
  }

  /* ---------------- Product page ---------------- */

  function initProductPage() {
    var actionsEl = document.querySelector('.product-actions[data-product-id]');
    if (!actionsEl) return;

    var sizeOptionsEl = document.querySelector('.size-options');
    var sizeBtns = sizeOptionsEl ? Array.prototype.slice.call(sizeOptionsEl.querySelectorAll('.size-btn')) : [];
    var selectedSize = null;

    sizeBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        sizeBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        selectedSize = btn.textContent.trim();
        clearSizeError();
      });
    });

    function clearSizeError() {
      if (sizeOptionsEl) sizeOptionsEl.classList.remove('error');
      var msg = document.querySelector('.size-error-msg');
      if (msg) msg.remove();
    }

    function showSizeError() {
      if (!sizeOptionsEl) return;
      sizeOptionsEl.classList.add('error');
      if (!document.querySelector('.size-error-msg')) {
        var msg = document.createElement('div');
        msg.className = 'size-error-msg';
        msg.textContent = 'Please select a size first.';
        sizeOptionsEl.parentNode.insertBefore(msg, sizeOptionsEl.nextSibling);
      }
    }

    var qtyValueEl = document.querySelector('.quantity-value');
    var qtyBtns = document.querySelectorAll('.quantity-btn');
    var quantity = 1;
    if (qtyValueEl) quantity = parseInt(qtyValueEl.textContent, 10) || 1;

    if (qtyBtns.length >= 2) {
      var decreaseBtn = qtyBtns[0];
      var increaseBtn = qtyBtns[1];
      decreaseBtn.addEventListener('click', function () {
        quantity = Math.max(1, quantity - 1);
        if (qtyValueEl) qtyValueEl.textContent = quantity;
      });
      increaseBtn.addEventListener('click', function () {
        quantity = Math.min(MAX_QTY, quantity + 1);
        if (qtyValueEl) qtyValueEl.textContent = quantity;
      });
    }

    function buildItem() {
      var data = actionsEl.dataset;
      var priceSL = parseInt(data.priceSl, 10);
      var priceXlxxl = parseInt(data.priceXlxxl, 10);
      var price = (selectedSize === 'XL' || selectedSize === 'XXL') ? priceXlxxl : priceSL;
      return {
        productId: data.productId,
        name: data.productName,
        image: data.productImage,
        color: data.productColor,
        size: selectedSize,
        price: price,
        qty: quantity
      };
    }

    function requireSize() {
      if (!selectedSize) {
        showSizeError();
        return false;
      }
      return true;
    }

    var addBtn = document.getElementById('add-to-cart-btn');
    if (addBtn) {
      addBtn.addEventListener('click', function () {
        if (!requireSize()) return;
        addToCart(buildItem());
        var originalText = addBtn.textContent;
        addBtn.textContent = 'Added to Cart ✓';
        addBtn.classList.add('added');
        setTimeout(function () {
          addBtn.textContent = originalText;
          addBtn.classList.remove('added');
        }, 1500);
      });
    }

    var buyBtn = document.getElementById('buy-now-btn');
    if (buyBtn) {
      buyBtn.addEventListener('click', function () {
        if (!requireSize()) return;
        addToCart(buildItem());
        window.location.href = 'cart.html';
      });
    }
  }

  /* ---------------- Cart page ---------------- */

  function renderCart() {
    var listEl = document.getElementById('cart-items-list');
    if (!listEl) return;

    var cart = getCart();
    var emptyMsg = document.querySelector('.empty-cart-message');
    var layoutEl = document.querySelector('.cart-layout');

    var countText = document.getElementById('cart-items-count-text');
    var count = cartCount(cart);
    if (countText) {
      countText.textContent = count === 1 ? '1 item in your cart' : count + ' items in your cart';
    }

    if (cart.length === 0) {
      listEl.innerHTML = '';
      if (emptyMsg) emptyMsg.style.display = '';
      if (layoutEl) layoutEl.classList.add('cart-empty');
      updateSummary(cart);
      return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';
    if (layoutEl) layoutEl.classList.remove('cart-empty');

    listEl.innerHTML = cart.map(function (item, index) {
      return (
        '<div class="cart-item">' +
          '<div class="cart-item-image"><img loading="lazy" src="' + item.image + '" alt="' + item.name + '"></div>' +
          '<div class="cart-item-details">' +
            '<h3>' + item.name + '</h3>' +
            '<p>Color: ' + item.color + ' &nbsp;&middot;&nbsp; Size: ' + item.size + '</p>' +
            '<p class="cart-item-price">' + formatPrice(item.price) + '</p>' +
            '<div class="quantity-selector">' +
              '<div class="quantity-btn" data-action="decrease" data-index="' + index + '">−</div>' +
              '<div class="quantity-value">' + item.qty + '</div>' +
              '<div class="quantity-btn" data-action="increase" data-index="' + index + '">+</div>' +
            '</div>' +
          '</div>' +
          '<div class="cart-item-actions">' +
            '<button type="button" class="cart-item-remove-label" data-index="' + index + '">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
              'Remove' +
            '</button>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    listEl.querySelectorAll('.quantity-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.dataset.index, 10);
        var cart2 = getCart();
        var item = cart2[idx];
        if (!item) return;
        var qty = item.qty + (btn.dataset.action === 'increase' ? 1 : -1);
        if (qty < 1) {
          removeItem(idx);
        } else {
          setItemQty(idx, qty);
        }
      });
    });

    listEl.querySelectorAll('.cart-item-remove-label').forEach(function (btn) {
      btn.addEventListener('click', function () {
        removeItem(parseInt(btn.dataset.index, 10));
      });
    });

    updateSummary(cart);
  }

  function buildWhatsAppMessage(cart, total) {
    var msg = "Hi! I'd like to place an order:\n";
    cart.forEach(function (item, i) {
      msg += (i + 1) + '. ' + item.name + ' - ' + item.color + ' - Size ' + item.size +
        ' - Qty ' + item.qty + ' - ' + formatPrice(item.price * item.qty) + '\n';
    });
    msg += 'Total: ' + formatPrice(total) + '\nPlease share payment and delivery details.';
    return msg;
  }

  function updateSummary(cart) {
    var subtotal = cartTotal(cart);

    var subtotalEl = document.getElementById('summary-subtotal');
    var totalEl = document.getElementById('summary-total');
    var subtotalCountEl = document.getElementById('summary-subtotal-count');
    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    if (totalEl) totalEl.textContent = formatPrice(subtotal);
    if (subtotalCountEl) subtotalCountEl.textContent = cartCount(cart);

    var isEmpty = cart.length === 0;
    var waHref = isEmpty ? '#' : ('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(buildWhatsAppMessage(cart, subtotal)));

    ['whatsapp-order-link', 'checkout-modal-whatsapp-link'].forEach(function (id) {
      var link = document.getElementById(id);
      if (!link) return;
      link.href = waHref;
      link.style.opacity = isEmpty ? '0.5' : '';
      link.style.pointerEvents = isEmpty ? 'none' : '';
    });

    var modalItemsEl = document.getElementById('checkout-modal-items');
    if (modalItemsEl) {
      modalItemsEl.innerHTML = cart.map(function (item) {
        return '<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:0.85rem;color:var(--color-gray);">' +
          '<span>' + item.name + ' (' + item.size + ') x' + item.qty + '</span>' +
          '<span>' + formatPrice(item.price * item.qty) + '</span></div>';
      }).join('');
    }
    var modalTotalEl = document.getElementById('checkout-modal-total');
    if (modalTotalEl) modalTotalEl.textContent = formatPrice(subtotal);
  }

  document.addEventListener('DOMContentLoaded', function () {
    updateBadges();
    initProductPage();
    renderCart();
  });
})();
