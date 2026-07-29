/* SAVIG STYLE - Form handling
   This is a static site with no backend, so forms previously used
   action="#" method="post" - submitting them would POST to the static
   host and typically return a 405 error instead of doing anything.
   This intercepts submission, validates, and gives real feedback
   (routing the contact form to WhatsApp, matching how orders are
   already handled sitewide).
*/
(function () {
  'use strict';

  var WHATSAPP_NUMBER = '923222920135';

  function showInlineMessage(form, text) {
    var existing = form.querySelector('.form-success-msg');
    if (existing) existing.remove();
    var msg = document.createElement('p');
    msg.className = 'form-success-msg';
    msg.setAttribute('role', 'status');
    msg.style.marginTop = '12px';
    msg.style.fontSize = '0.85rem';
    msg.style.color = 'var(--color-accent)';
    msg.textContent = text;
    form.appendChild(msg);
  }

  function initContactForm() {
    var form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var name = form.querySelector('#name').value.trim();
      var email = form.querySelector('#email').value.trim();
      var subject = form.querySelector('#subject').value.trim();
      var message = form.querySelector('#message').value.trim();

      var text = "Hi! I'm reaching out from the SAVIG STYLE contact form.\n" +
        'Name: ' + name + '\n' +
        'Email: ' + email + '\n' +
        (subject ? 'Subject: ' + subject + '\n' : '') +
        'Message: ' + message;

      window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
      showInlineMessage(form, "Thanks, " + name + "! We've opened WhatsApp so you can send your message directly.");
      form.reset();
    });
  }

  function initNewsletterForm() {
    var form = document.querySelector('.newsletter-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var emailInput = form.querySelector('input[type="email"]');
      var email = emailInput ? emailInput.value.trim() : '';
      var text = "Hi! I'd like to join the SAVIG STYLE community list.\nEmail: " + email;

      window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
      showInlineMessage(form, "Thanks! We've opened WhatsApp so you can confirm your signup.");
      form.reset();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initContactForm();
    initNewsletterForm();
  });
})();
