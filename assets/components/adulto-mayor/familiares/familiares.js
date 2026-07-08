document.addEventListener('DOMContentLoaded', () => {
  inicializarNotificacion();
  inicializarSolicitarAyuda();
  inicializarModalLlamada();
  inicializarModalImagen();
});

/*NOTIFICACIÓN FLOTANTE
  Componente simple: recibe un ícono (emoji o texto corto) y un
  mensaje, lo muestra unos segundos y luego se oculta solo.*/
function inicializarNotificacion() {
  const notificacion = document.getElementById('notificacion');
  const icono = document.getElementById('notificacion-icono');
  const texto = document.getElementById('notificacion-texto');
  let temporizador = null;

  window.mostrarNotificacion = function (mensaje, emoji = '✅', duracionMs = 3800) {
    if (!notificacion || !icono || !texto) return;

    icono.textContent = emoji;
    texto.textContent = mensaje;
    notificacion.classList.add('es-visible');

    clearTimeout(temporizador);
    temporizador = setTimeout(() => {
      notificacion.classList.remove('es-visible');
    }, duracionMs);
  };
}

/*BOTÓN: SOLICITAR AYUDA
  No hay backend: solo confirma visualmente que un cuidador
  fue notificado y está en camino.*/
function inicializarSolicitarAyuda() {
  const boton = document.getElementById('boton-solicitar-ayuda');
  if (!boton) return;

  boton.addEventListener('click', () => {
    window.mostrarNotificacion('¡Listo! Un cuidador ya fue avisado y está yendo hacia vos.', '🚑');
  });
}

/*MODAL: LLAMADA EN CURSO
  Se abre desde cualquier botón .boton-llamar, usando sus
  data-attributes (nombre, relación, iniciales) para armar el
  contenido. Simula el estado de la llamada: Llamando… → Llamada
  conectada, y se puede cerrar en cualquier momento.*/
function inicializarModalLlamada() {
  const modal = document.getElementById('modal-llamada');
  const overlay = document.getElementById('modal-llamada-overlay');
  const botonColgar = document.getElementById('boton-colgar');
  const avatar = document.getElementById('modal-llamada-avatar');
  const nombre = document.getElementById('modal-llamada-nombre');
  const relacion = document.getElementById('modal-llamada-relacion');
  const estado = document.getElementById('modal-llamada-estado');
  const botonesLlamar = document.querySelectorAll('.boton-llamar');

  if (!modal || !botonesLlamar.length) return;

  let temporizadorConexion = null;
  let temporizadorCierre = null;

  function abrirModal(datos) {
    if (avatar) avatar.textContent = datos.iniciales || '?';
    if (nombre) nombre.textContent = datos.nombre || 'Familiar';
    if (relacion) relacion.textContent = datos.relacion || '';
    if (estado) {
      estado.textContent = 'Llamando…';
      estado.classList.remove('es-conectada');
    }

    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('es-abierto'));
    document.body.style.overflow = 'hidden';

    clearTimeout(temporizadorConexion);
    clearTimeout(temporizadorCierre);

    temporizadorConexion = setTimeout(() => {
      if (!estado) return;
      estado.textContent = 'Llamada conectada';
      estado.classList.add('es-conectada');
    }, 2600);
  }

  function cerrarModal() {
    modal.classList.remove('es-abierto');
    document.body.style.overflow = '';
    clearTimeout(temporizadorConexion);

    temporizadorCierre = setTimeout(() => {
      modal.hidden = true;
    }, 250);
  }

  botonesLlamar.forEach((boton) => {
    boton.addEventListener('click', () => {
      abrirModal({
        nombre: boton.dataset.nombre,
        relacion: boton.dataset.relacion,
        iniciales: boton.dataset.iniciales,
      });
    });
  });

  if (overlay) overlay.addEventListener('click', cerrarModal);
  if (botonColgar) botonColgar.addEventListener('click', cerrarModal);

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && modal.classList.contains('es-abierto')) {
      cerrarModal();
    }
  });
}

/*MODAL: VER IMAGEN
  Se abre desde los botones .mensaje-familiar__imagen-boton que
  tengan un data-imagen (y opcionalmente data-alt) válido.*/
function inicializarModalImagen() {
  const modal = document.getElementById('modal-imagen');
  const overlay = document.getElementById('modal-imagen-overlay');
  const botonCerrar = document.getElementById('modal-imagen-cerrar');
  const foto = document.getElementById('modal-imagen-foto');
  const pie = document.getElementById('modal-imagen-pie');
  const botonesImagen = document.querySelectorAll('.mensaje-familiar__imagen-boton');

  if (!modal || !botonesImagen.length) return;

  function abrirModal(src, alt) {
    if (!src || !foto) return;

    foto.src = src;
    foto.alt = alt || 'Imagen enviada por un familiar';
    if (pie) pie.textContent = alt || '';

    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('es-abierto'));
    document.body.style.overflow = 'hidden';
  }

  function cerrarModal() {
    modal.classList.remove('es-abierto');
    document.body.style.overflow = '';
    setTimeout(() => {
      modal.hidden = true;
      if (foto) foto.src = '';
    }, 250);
  }

  botonesImagen.forEach((boton) => {
    boton.addEventListener('click', () => {
      abrirModal(boton.dataset.imagen, boton.dataset.alt);
    });
  });

  if (overlay) overlay.addEventListener('click', cerrarModal);
  if (botonCerrar) botonCerrar.addEventListener('click', cerrarModal);

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && modal.classList.contains('es-abierto')) {
      cerrarModal();
    }
  });
}
