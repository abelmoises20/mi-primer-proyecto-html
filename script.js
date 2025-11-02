document.addEventListener("DOMContentLoaded", function() {
  const miBoton = document.getElementById("back-to-top");
  if (!miBoton) return; // evita errores si no existe el elemento

  function scrollFunction() {
    if (window.scrollY > 20) {
      miBoton.classList.add('show');   // usar clase para mostrar
    } else {
      miBoton.classList.remove('show');
    }
  }

  window.addEventListener('scroll', scrollFunction);
  scrollFunction(); // estado inicial

  miBoton.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    miBoton.blur();
  });
});

/* Validación básica al enviar (no en tiempo real) */
document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('.formulario-contacto');
  if (!form) return;

  function clearErrors() {
    form.querySelectorAll('.field-error').forEach(el => el.remove());
    form.querySelectorAll('[aria-invalid="true"]').forEach(el => el.removeAttribute('aria-invalid'));
  }

  function showError(el, message) {
    el.setAttribute('aria-invalid', 'true');
    const err = document.createElement('div');
    err.className = 'field-error';
    err.setAttribute('role', 'alert');
    err.textContent = message;
    el.parentNode.insertBefore(err, el.nextSibling);
  }

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

    if (!mensaje || mensaje.value.trim().length < 10) {
      showError(mensaje || form, 'El mensaje debe tener al menos 10 caracteres.');
      firstInvalid = firstInvalid || mensaje;
    }

    if (firstInvalid) {
      e.preventDefault();
      firstInvalid.focus();
    }
    // Si pasa validación, el formulario se envía normalmente.
  });
});