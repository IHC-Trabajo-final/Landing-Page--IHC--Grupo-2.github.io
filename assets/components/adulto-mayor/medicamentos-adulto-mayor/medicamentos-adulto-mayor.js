document.addEventListener('DOMContentLoaded', () => {
  inicializarNotificacion();
  inicializarConfirmarToma();
  inicializarSoyFamiliar();
});

/*NOTIFICACIÓN FLOTANTE
  Componente simple reutilizado por ambos botones: recibe un
  ícono (emoji o texto corto) y un mensaje, lo muestra unos
  segundos y luego se oculta solo.*/
function inicializarNotificacion() {
  const notificacion = document.getElementById('notificacion');
  const icono = document.getElementById('notificacion-icono');
  const texto = document.getElementById('notificacion-texto');
  let temporizador = null;

  window.mostrarNotificacion = function (mensaje, emoji = '✅', duracionMs = 3200) {
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

/*BOTÓN: CONFIRMAR TOMA
  Marca la dosis como tomada, deshabilita el botón para evitar
  doble confirmación y muestra una notificación de éxito.
  No hay backend: es solo un estado visual en pantalla.*/
function inicializarConfirmarToma() {
  const boton = document.getElementById('boton-confirmar-toma');
  if (!boton) return;

  boton.addEventListener('click', () => {
    if (boton.classList.contains('es-confirmado')) return;

    boton.classList.add('es-confirmado');
    boton.disabled = true;
    boton.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="boton__icono"><path d="M5 13l4 4L19 7" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      Toma confirmada
    `;

    window.mostrarNotificacion('¡Se ha registrado que tomaste tu pastilla!', '✅');
  });
}

/*BOTÓN: SOY FAMILIAR / NECESITO AYUDA
  Informa que se comunicarán por correo. No abre ningún
  formulario adicional, solo confirma la acción.*/
function inicializarSoyFamiliar() {
  const boton = document.getElementById('boton-soy-familiar');
  if (!boton) return;

  boton.addEventListener('click', () => {
    window.mostrarNotificacion('Nos comunicaremos contigo por correo a la brevedad.', '✉️');
  });
}