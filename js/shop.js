/* SAVIG STYLE - Shop page logic
   Handles category filter buttons and the sort control on shop.html.
*/
(function () {
  'use strict';

  function init() {
    var grid = document.getElementById('shop-grid');
    if (!grid) return; // not on the shop page

    var filterBtns = Array.prototype.slice.call(document.querySelectorAll('.filter-categories .filter-btn'));
    var countEl = document.getElementById('shop-product-count');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.product-card'));

    function applyFilter(filter) {
      var visibleCount = 0;
      cards.forEach(function (card) {
        var matches = filter === 'all' || card.dataset.category === filter;
        card.style.display = matches ? '' : 'none';
        if (matches) visibleCount++;
      });
      if (countEl) {
        countEl.textContent = visibleCount + (visibleCount === 1 ? ' product' : ' products');
      }
    }

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        applyFilter(btn.dataset.filter);
      });
    });

    /* ── Sort control ── */
    var sortBtn = document.getElementById('sort-btn');
    var sortLabel = document.getElementById('sort-btn-label');
    var sortModes = [
      { key: 'featured', label: 'Sort: Featured' },
      { key: 'price-low', label: 'Sort: Price Low to High' },
      { key: 'price-high', label: 'Sort: Price High to Low' }
    ];
    var sortIndex = 0;
    var originalOrder = cards.slice();

    if (sortBtn) {
      sortBtn.addEventListener('click', function () {
        sortIndex = (sortIndex + 1) % sortModes.length;
        var mode = sortModes[sortIndex];
        if (sortLabel) sortLabel.textContent = mode.label;

        var sorted;
        if (mode.key === 'featured') {
          sorted = originalOrder.slice();
        } else {
          sorted = cards.slice().sort(function (a, b) {
            var priceA = parseFloat(a.dataset.priceLow) || 0;
            var priceB = parseFloat(b.dataset.priceLow) || 0;
            return mode.key === 'price-low' ? priceA - priceB : priceB - priceA;
          });
        }
        sorted.forEach(function (card) { grid.appendChild(card); });
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
