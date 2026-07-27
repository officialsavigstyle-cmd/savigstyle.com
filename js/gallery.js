/* SAVIG STYLE — Product gallery logic
   Handles swapping the main product image when a thumbnail is clicked,
   and keeps the "active" state in sync with the selected thumbnail.
*/
(function () {
  'use strict';

  function init() {
    var mainImg = document.querySelector('.product-gallery-main img');
    var thumbs = Array.prototype.slice.call(document.querySelectorAll('.product-gallery-thumb'));
    if (!mainImg || !thumbs.length) return; // not on a product page

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var full = thumb.getAttribute('data-full');
        var thumbImg = thumb.querySelector('img');
        if (!full) return;

        mainImg.src = full;
        if (thumbImg) {
          mainImg.alt = thumbImg.alt;
        }

        thumbs.forEach(function (t) { t.classList.remove('active'); });
        thumb.classList.add('active');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
