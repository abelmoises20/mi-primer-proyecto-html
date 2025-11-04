document.addEventListener("DOMContentLoaded", function() {
  // Back to top
  const miBoton = document.getElementById("back-to-top");
  if (miBoton) {
    function scrollFunction() {
      if (window.scrollY > 20) miBoton.classList.add('show');
      else miBoton.classList.remove('show');
    }
    window.addEventListener('scroll', scrollFunction);
    scrollFunction();
    miBoton.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      miBoton.blur();
    });
  }

  // Validación básica al enviar (NO en tiempo real)
  const form = document.querySelector('.formulario-contacto');
  if (!form) return;

  function clearErrors() {
    form.querySelectorAll('.field-error').forEach(el => el.remove());
    form.querySelectorAll('[aria-invalid="true"]').forEach(el => el.removeAttribute('aria-invalid'));
  }

  function showError(el, message) {
    if (!el) return;
    el.setAttribute('aria-invalid', 'true');
    const err = document.createElement('div');
    err.className = 'field-error';
    err.setAttribute('role', 'alert');
    err.textContent = message;
    el.parentNode.insertBefore(err, el.nextSibling);
  }

  // LOG para depuración: confirma que el handler está activo
  console.log('Validador de contacto activo');

  form.addEventListener('submit', function (e) {
    clearErrors();
    let firstInvalid = null;

    const nombre = form.querySelector('[name="nombre"]');
    const correo = form.querySelector('[name="correo"]');
    const mensaje = form.querySelector('[name="mensaje"]');

    if (!nombre || nombre.value.trim().length < 2) {
      showError(nombre || form, 'Ingresa tu nombre (mín. 2 caracteres).');
      firstInvalid = firstInvalid || nombre;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!correo || !emailRegex.test(correo.value.trim())) {
      showError(correo || form, 'Ingresa un correo válido.');
      firstInvalid = firstInvalid || correo;
    }

    const wordCount = mensaje ? mensaje.value.trim().split(/\s+/).filter(Boolean).length : 0;
    if (!mensaje || wordCount < 10) {
      showError(mensaje || form, 'El mensaje debe tener al menos 10 palabras.');
      firstInvalid = firstInvalid || mensaje;
    }

    // Si hay error, evita envío y enfoca el primer campo inválido
    if (firstInvalid) {
      e.preventDefault();
      firstInvalid.focus();
      console.log('Validación falló; wordCount=', wordCount);
    } else {
      console.log('Validación OK; enviando formulario');
      // formulario se envía normalmente
    }
  });

  /* Mejora para términos: genera TOC y añade botón colapsable a cada sección */
  const main = document.querySelector('main.contenido');
  if (!main) return;

  // 1) Crear TOC
  const sections = Array.from(main.querySelectorAll('section'));
  if (sections.length) {
    const toc = document.createElement('nav');
    toc.className = 'toc';
    const ul = document.createElement('ul');

    sections.forEach((sec, i) => {
      const h2 = sec.querySelector('h2');
      if (!h2) return;
      // crear id si no existe
      if (!h2.id) h2.id = 'term-' + (i + 1);
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#' + h2.id;
      a.textContent = h2.textContent.trim();
      li.appendChild(a);
      ul.appendChild(li);
    });

    toc.appendChild(ul);
    main.insertBefore(toc, main.firstChild);
  }

  // 2) Añadir botón para colapsar cada sección
  sections.forEach(sec => {
    const h2 = sec.querySelector('h2');
    if (!h2) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'toggle-btn';
    btn.setAttribute('aria-expanded', 'true');
    btn.textContent = 'Ocultar';
    // añadir al final del h2 (alineado a la derecha por CSS)
    h2.appendChild(btn);

    btn.addEventListener('click', () => {
      const collapsed = sec.classList.toggle('collapsed');
      btn.textContent = collapsed ? 'Ver' : 'Ocultar';
      btn.setAttribute('aria-expanded', String(!collapsed));
    });
  });
});

(function() {
  document.addEventListener('DOMContentLoaded', function () {
    const header = document.querySelector('header');
    const nav = header && header.querySelector('.navbar');

    // 1) Crear botón menú móvil si no existe
    if (nav && !header.querySelector('.menu-toggle')) {
      const btn = document.createElement('button');
      btn.className = 'menu-toggle';
      btn.type = 'button';
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Abrir menú');
      btn.textContent = '☰';
      header.insertBefore(btn, nav);
      btn.addEventListener('click', () => {
        const opened = nav.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(opened));
      });
    }

    // 2) Dropdowns: en móvil/touch permiten toggle al tocar el enlace principal
    document.querySelectorAll('.dropdown > a').forEach(a => {
      a.addEventListener('click', (e) => {
        const parent = a.parentElement;
        // si el menú está en modo abierto (móvil) o la pantalla es pequeña, interceptar
        if (nav && (nav.classList.contains('open') || window.innerWidth < 900)) {
          e.preventDefault();
          parent.classList.toggle('open');
        }
      });
    });

    // 3) Scroll suave para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (href.length > 1) {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });

    // 4) Fade-in al hacer scroll (IntersectionObserver)
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('main h1, main p, main section').forEach(el => {
      el.classList.add('fade-in');
      io.observe(el);
    });

    // 5) Resaltar link activo según sección visible
    const sections = Array.from(document.querySelectorAll('main section'));
    const navLinks = Array.from(document.querySelectorAll('.navbar a'));
    if (sections.length && navLinks.length) {
      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const sec = entry.target;
          // usar id de sección para buscar link correspondiente (si no existe se crea)
          if (!sec.id) {
            const h2 = sec.querySelector('h2');
            sec.id = h2 ? h2.textContent.trim().toLowerCase().replace(/\s+/g, '-') : 'sec-' + Math.random().toString(36).slice(2,7);
          }
          if