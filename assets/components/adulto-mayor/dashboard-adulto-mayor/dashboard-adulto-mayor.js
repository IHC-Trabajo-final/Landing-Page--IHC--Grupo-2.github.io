document.addEventListener('DOMContentLoaded', () => {
  inicializarModalActualizacion();
  inicializarModalTendencias();
});

/* ---------------------------------------------------------------
   MODAL: REGISTRAR ACTUALIZACIÓN DE VITALES
   Abre/cierra el modal, valida los 5 campos y, al guardar,
   actualiza los valores visibles en la tarjeta de Vitales
   del dashboard y en el modal de Tendencias. No hay backend.
--------------------------------------------------------------- */
function inicializarModalActualizacion() {
  const modal      = document.getElementById('modal-actualizacion');
  const botonAbrir = document.getElementById('boton-registrar-actualizacion');
  const formulario = document.getElementById('formulario-actualizacion');
  const feedback   = document.getElementById('actualizacion-feedback');

  if (!modal || !botonAbrir || !formulario) return;

  const campos = {
    ritmo:   formulario.querySelector('#actualizacion-ritmo'),
    presion: formulario.querySelector('#actualizacion-presion'),
    temp:    formulario.querySelector('#actualizacion-temp'),
    oxigeno: formulario.querySelector('#actualizacion-oxigeno'),
    peso:    formulario.querySelector('#actualizacion-peso'),
  };

  // Elementos del dashboard que reciben los nuevos valores
  const destinos = {
    ritmo:   document.getElementById('valor-ritmo'),
    presion: document.getElementById('valor-presion'),
    temp:    document.getElementById('valor-temp'),
  };

  // Elementos en el modal de tendencias
  const tendencias = {
    ritmo:   document.getElementById('tendencia-ritmo'),
    presion: document.getElementById('tendencia-presion'),
    temp:    document.getElementById('tendencia-temp'),
    oxigeno: document.getElementById('tendencia-oxigeno'),
    peso:    document.getElementById('tendencia-peso'),
  };

  const textoActualizadoDashboard  = document.getElementById('vitales-actualizado');
  const textoActualizadoTendencias = document.getElementById('tendencias-actualizado');

  /* --- Abrir / cerrar --- */

  function abrirModal() {
    modal.classList.add('es-abierto');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    campos.ritmo.focus();
  }

  function cerrarModal() {
    modal.classList.remove('es-abierto');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /* --- Validación --- */

  function mostrarError(input, mostrar) {
    const error = formulario.querySelector(`[data-error-para="${input.id}"]`);
    input.classList.toggle('campo--error', mostrar);
    if (error) error.classList.toggle('es-visible', mostrar);
  }

  function validarCampo(input) {
    const esValido = input.checkValidity();
    mostrarError(input, !esValido);
    return esValido;
  }

  Object.values(campos).forEach((input) => {
    input.addEventListener('blur', () => validarCampo(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('campo--error')) validarCampo(input);
    });
  });

  /* --- Guardar y actualizar UI --- */

  function actualizarTextoTiempo(elementoA, elementoB) {
    const texto = 'Actualizado hace unos instantes';
    if (elementoA) elementoA.textContent = texto;
    if (elementoB) elementoB.textContent = texto;
  }

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const todosValidos = Object.values(campos).map(validarCampo).every(Boolean);
    if (!todosValidos) {
      if (feedback) feedback.classList.remove('es-visible');
      return;
    }

    // Actualizar los 3 valores visibles en la tarjeta del dashboard
    if (destinos.ritmo)   destinos.ritmo.textContent   = `${campos.ritmo.value} BPM`;
    if (destinos.presion) destinos.presion.textContent = campos.presion.value;
    if (destinos.temp)    destinos.temp.textContent    = `${parseFloat(campos.temp.value).toFixed(1)}°C`;

    // Actualizar todos los valores en el modal de tendencias
    if (tendencias.ritmo)   tendencias.ritmo.textContent   = `${campos.ritmo.value} BPM`;
    if (tendencias.presion) tendencias.presion.textContent = campos.presion.value;
    if (tendencias.temp)    tendencias.temp.textContent    = `${parseFloat(campos.temp.value).toFixed(1)}°C`;
    if (tendencias.oxigeno) tendencias.oxigeno.textContent = `${campos.oxigeno.value}%`;
    if (tendencias.peso)    tendencias.peso.textContent    = `${parseFloat(campos.peso.value).toFixed(1)} kg`;

    // Actualizar texto "Actualizado hace X min"
    actualizarTextoTiempo(textoActualizadoDashboard, textoActualizadoTendencias);

    formulario.reset();
    Object.values(campos).forEach((input) => mostrarError(input, false));

    if (feedback) {
      feedback.classList.add('es-visible');
      setTimeout(() => {
        feedback.classList.remove('es-visible');
        cerrarModal();
      }, 1400);
    }
  });

  /* --- Eventos de apertura/cierre --- */

  botonAbrir.addEventListener('click', abrirModal);

  modal.querySelectorAll('[data-cerrar-modal-actualizacion]').forEach((el) => {
    el.addEventListener('click', cerrarModal);
  });

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && modal.classList.contains('es-abierto')) cerrarModal();
  });
}

/* ---------------------------------------------------------------
   MODAL: VER TENDENCIAS DE VITALES
   Abre y cierra el modal de tendencias.
   Los valores ya están en el HTML; se actualizan desde
   inicializarModalActualizacion() cuando el usuario guarda.
--------------------------------------------------------------- */
function inicializarModalTendencias() {
  const modal      = document.getElementById('modal-tendencias');
  const botonAbrir = document.getElementById('boton-ver-tendencias');

  if (!modal || !botonAbrir) return;

  function abrirModal() {
    modal.classList.add('es-abierto');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function cerrarModal() {
    modal.classList.remove('es-abierto');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  botonAbrir.addEventListener('click', abrirModal);

  modal.querySelectorAll('[data-cerrar-modal-tendencias]').forEach((el) => {
    el.addEventListener('click', cerrarModal);
  });

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && modal.classList.contains('es-abierto')) cerrarModal();
  });
}