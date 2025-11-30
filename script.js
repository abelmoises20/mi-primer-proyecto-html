/* Archivo principal de comportamiento: validación, menú, TOC, animaciones y carrito */
class Carrito {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('carrito')) || [];
    this.actualizarContador();
  }

  añadirProducto(producto) {
    const id = String(producto.id);
    const existente = this.items.find(i => i.id === id);
    if (existente) {
      existente.cantidad = (existente.cantidad || 1) + (producto.cantidad || 1);
    } else {
      this.items.push({
        id,
        nombre: producto.nombre || 'Producto',
        precio: Number(producto.precio) || 0,
        imagen: producto.imagen || '',
        cantidad: producto.cantidad || 1
      });
    }
    this.guardar();
    this.actualizarContador();
    this.mostrarNotificacion('Producto añadido al carrito');
    this.renderizarCarrito();
  }

  eliminarProducto(id) {
    this.items = this.items.filter(i => i.id !== String(id));
    this.guardar();
    this.actualizarContador();
    this.renderizarCarrito();
  }

  actualizarCantidad(id, delta) {
    const idx = this.items.findIndex(i => i.id === String(id));
    if (idx === -1) return;
    this.items[idx].cantidad = Math.max(1, (this.items[idx].cantidad || 1) + delta);
    this.guardar();
    this.actualizarContador();
    this.renderizarCarrito();
  }

  guardar() {
    localStorage.setItem('carrito', JSON.stringify(this.items));
  }

  actualizarContador() {
    const contador = document.querySelector('.cart-count');
    if (contador) contador.textContent = this.items.reduce((s, i) => s + (i.cantidad || 1), 0);
  }

  mostrarNotificacion(mensaje) {
    const notif = document.createElement('div');
    notif.className = 'notificacion';
    notif.textContent = mensaje;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 2500);
  }

  renderizarCarrito() {
    const container = document.getElementById('carrito-items');
    const subtotalEl = document.getElementById('subtotal');
    const igvEl = document.getElementById('igv');
    const totalEl = document.getElementById('total');
    const checkoutBtn = document.getElementById('checkout');

    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = '<p>El carrito está vacío.</p>';
      if (subtotalEl) subtotalEl.textContent = 'S/. 0.00';
      if (igvEl) igvEl.textContent = 'S/. 0.00';
      if (totalEl) totalEl.textContent = 'S/. 0.00';
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    container.innerHTML = this.items.map(item => {
      const precioUnit = Number(item.precio) || 0;
      const cantidad = item.cantidad || 1;
      const subtotal = precioUnit * cantidad;
      return `
        <div class="carrito-item" data-id="${item.id}">
          <img src="${item.imagen}" alt="${escapeHtml(item.nombre)}">
          <div class="item-detalles">
            <h3>${escapeHtml(item.nombre)}</h3>
            <p class="precio-item">S/. ${precioUnit.toFixed(2)}</p>
            <div class="item-cantidad">
              <button class="cantidad-btn disminuir" aria-label="Disminuir">-</button>
              <span class="cantidad">${cantidad}</span>
              <button class="cantidad-btn aumentar" aria-label="Aumentar">+</button>
            </div>
            <p class="subtotal-item">Subtotal: S/. ${subtotal.toFixed(2)}</p>
            <button class="remove-btn" aria-label="Eliminar">Eliminar</button>
          </div>
        </div>
      `;
    }).join('');

    const subtotal = this.items.reduce((t, it) => t + (Number(it.precio) || 0) * (it.cantidad || 1), 0);
    const igv = subtotal * 0.18;
    const total = subtotal + igv;

    if (subtotalEl) subtotalEl.textContent = `S/. ${subtotal.toFixed(2)}`;
    if (igvEl) igvEl.textContent = `S/. ${igv.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `S/. ${total.toFixed(2)}`;
    if (checkoutBtn) checkoutBtn.disabled = false;

    // listeners for item buttons
    container.querySelectorAll('.carrito-item').forEach(node => {
      const id = node.dataset.id;
      node.querySelector('.remove-btn')?.addEventListener('click', () => this.eliminarProducto(id));
      node.querySelector('.disminuir')?.addEventListener('click', () => this.actualizarCantidad(id, -1));
      node.querySelector('.aumentar')?.addEventListener('click', () => this.actualizarCantidad(id, +1));
    });
  }
}

/* Helpers */
function escapeHtml(str){ return String(str).replace(/[&<>"']/g, s=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); }

function parsePrice(str){
  if (typeof str === 'number') return Number(str);
  if (!str) return 0;
  let s = String(str).trim();
  s = s.replace(/[^\d.,-]/g,'');
  if (s.indexOf(',') > -1 && s.indexOf('.') > -1) {
    s = s.replace(/\./g,'').replace(',','.');
  } else {
    s = s.replace(/,/g,'.');
  }
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

/* DOM ready */
document.addEventListener('DOMContentLoaded', function() {
  const carrito = new Carrito();
  window.carrito = carrito; // accesible desde consola si hace falta
  carrito.renderizarCarrito();

  /* Back to top */
  const miBoton = document.getElementById('back-to-top');
  function updateBackBtn(){ if (!miBoton) return; miBoton.style.display = window.scrollY > 300 ? 'block' : 'none'; }
  if (miBoton) {
    window.addEventListener('scroll', updateBackBtn);
    updateBackBtn();
    miBoton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* Formulario de contacto (si existe) */
  const form = document.querySelector('.formulario-contacto');
  if (form) {
    function clearErrors() {
      form.querySelectorAll('.field-error').forEach(el => el.remove());
      form.querySelectorAll('[aria-invalid="true"]').forEach(el => el.removeAttribute('aria-invalid'));
    }
    function showError(el, message) {
      if (!el) return;
      el.setAttribute('aria-invalid','true');
      const err = document.createElement('div');
      err.className = 'field-error';
      err.setAttribute('role','alert');
      err.textContent = message;
      el.parentNode.insertBefore(err, el.nextSibling);
    }
    form.addEventListener('submit', function(e){
      clearErrors();
      let firstInvalid = null;
      const nombre = form.querySelector('[name="nombre"]');
      const correo = form.querySelector('[name="correo"]');
      const mensaje = form.querySelector('[name="mensaje"]');

      if (!nombre || nombre.value.trim().length < 2) { showError(nombre || form, 'Ingresa tu nombre (mín. 2 caracteres).'); firstInvalid = firstInvalid || nombre; }
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!correo || !emailRegex.test(correo.value.trim())) { showError(correo || form, 'Ingresa un correo válido.'); firstInvalid = firstInvalid || correo; }
      const wordCount = mensaje ? mensaje.value.trim().split(/\s+/).filter(Boolean).length : 0;
      if (!mensaje || wordCount < 3) { showError(mensaje || form, 'Escribe un mensaje (mín. 3 palabras).'); firstInvalid = firstInvalid || mensaje; }

      if (firstInvalid) { e.preventDefault(); firstInvalid.focus(); console.log('Validación contacto: falló'); } else { console.log('Validación contacto: OK'); }
    });
    console.log('Validador de contacto activo');
  }

  /* TOC y colapsables para main.contenido */
  const mainContenido = document.querySelector('main.contenido');
  if (mainContenido) {
    const sections = Array.from(mainContenido.querySelectorAll('section'));
    if (sections.length) {
      const toc = document.createElement('nav');
      toc.className = 'toc';
      const ul = document.createElement('ul');
      sections.forEach((sec, i) => {
        const h2 = sec.querySelector('h2');
        const id = sec.id || `sec-${i+1}`;
        sec.id = id;
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${id}`;
        a.textContent = h2 ? h2.textContent : `Sección ${i+1}`;
        li.appendChild(a);
        ul.appendChild(li);
      });
      toc.appendChild(ul);
      mainContenido.insertBefore(toc, mainContenido.firstChild);
    }

    sections.forEach(sec => {
      const h2 = sec.querySelector('h2');
      if (!h2) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'toggle-btn';
      btn.setAttribute('aria-expanded','true');
      btn.textContent = 'Ocultar';
      h2.appendChild(btn);
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        btn.textContent = expanded ? 'Mostrar' : 'Ocultar';
        sec.classList.toggle('collapsed', expanded);
      });
    });
  }

  /* Menú móvil / hamburguesa */
  const header = document.querySelector('header');
  const nav = header && header.querySelector('.navbar');
  if (nav && !header.querySelector('.menu-toggle')) {
    const toggle = document.createElement('button');
    toggle.className = 'menu-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded','false');
    toggle.innerHTML = '<span class="sr-only">Abrir menú</span>☰';
    header.querySelector('.top-header')?.insertBefore(toggle, header.querySelector('.top-header').firstChild);
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('open', !open);
    });
  }

  /* Dropdowns: evitar navegación y solo abrir/cerrar el submenú */
  document.querySelectorAll('.dropdown > a').forEach(a => {
    a.addEventListener('click', function(e){
      e.preventDefault(); // evita que el enlace navegue a otra página
      this.parentElement.classList.toggle('open');
    });
  });

  /* Smooth scroll para anclas internas */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e){
      const href = this.getAttribute('href');
      if (href && href.length > 1) {
        const target = document.querySelector(href);
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
      }
    });
  });

  /* Fade-in al hacer scroll */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('in-view'); io.unobserve(entry.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('main h1, main p, main section').forEach(el => io.observe(el));

  /* Resaltar link activo según sección visible */
  const secList = Array.from(document.querySelectorAll('main section'));
  const navLinks = Array.from(document.querySelectorAll('.navbar a'));
  if (secList.length && navLinks.length) {
    const obs2 = new IntersectionObserver((entries) => {
      entries.forEach(ent => {
        if (ent.isIntersecting) {
          const id = ent.target.id;
          navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
        }
      });
    }, { threshold: 0.6 });
    secList.forEach(s => obs2.observe(s));
  }

  /* Add-to-cart buttons (delegado) */
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', function(){
      const id = this.dataset.id || (Math.random().toString(36).slice(2));
      const nombre = this.dataset.nombre || this.dataset.name || this.closest('.producto-card')?.querySelector('h3')?.textContent || 'Producto';
      const precioRaw = this.dataset.precio || this.dataset.price || this.closest('.producto-card')?.querySelector('.precio')?.textContent || '0';
      const precio = parsePrice(precioRaw);
      const imagen = this.dataset.imagen || this.closest('.producto-card')?.querySelector('img')?.src || '';
      carrito.añadirProducto({ id, nombre, precio, imagen, cantidad: 1 });
    });
  });

}); // DOMContentLoaded end









