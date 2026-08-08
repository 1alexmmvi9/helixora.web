/* Helixora — JS mínimo. Sin dependencias, sin cookies, sin trackers. */
(function () {
  'use strict';

  /* Menú móvil */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* Aparición sutil al hacer scroll */
  var revealed = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealed.length) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); ro.unobserve(entry.target); }
      });
    }, { threshold: 0.08 });
    revealed.forEach(function (el) { ro.observe(el); });
  } else {
    revealed.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* Abrir el desplegable al que apunte el enlace (#privacidad, etc.) */
  function openTarget() {
    var hash = window.location.hash;
    if (!hash || hash.length < 2) return;
    var el = document.getElementById(hash.slice(1));
    if (!el) return;
    var node = el;
    while (node) {
      if (node.tagName === 'DETAILS') node.open = true;
      node = node.parentElement;
    }
    var next = el.nextElementSibling;
    if (next && next.tagName === 'DETAILS') next.open = true;
  }
  window.addEventListener('hashchange', openTarget);
  openTarget();

  /* Sección activa en el menú (solo home) */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
  var sections = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  if ('IntersectionObserver' in window && sections.some(Boolean)) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a, i) { a.classList.toggle('is-active', sections[i] === entry.target); });
      });
    }, { rootMargin: '-68px 0px -70% 0px' });
    sections.forEach(function (s) { if (s) so.observe(s); });
  }

  /* Formulario de contacto — Web3Forms (funcionamiento intacto) */
  var form = document.getElementById('contact-form');
  if (!form) return;
  var button = form.querySelector('button[type="submit"]');
  var status = document.getElementById('form-status');

  function show(message, ok) {
    status.textContent = message;
    status.className = 'form__status ' + (ok ? 'is-ok' : 'is-error');
    status.hidden = false;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    status.hidden = true;
    if (!form.checkValidity()) { form.reportValidity(); return; }

    var original = button.textContent;
    button.textContent = 'Enviando…';
    button.disabled = true;

    fetch('https://api.web3forms.com/submit', { method: 'POST', body: new FormData(form) })
      .then(function (response) {
        return response.json().then(function (data) { return { ok: response.ok, data: data }; });
      })
      .then(function (result) {
        if (result.ok) {
          show('Mensaje enviado. Recibirás respuesta por correo en menos de 48 horas laborables.', true);
          form.reset();
        } else {
          show('No se ha podido enviar. Escribe directamente a alex@helixora.es.', false);
        }
      })
      .catch(function () {
        show('No se ha podido enviar. Revisa la conexión o escribe a alex@helixora.es.', false);
      })
      .finally(function () {
        button.textContent = original;
        button.disabled = false;
      });
  });
})();
