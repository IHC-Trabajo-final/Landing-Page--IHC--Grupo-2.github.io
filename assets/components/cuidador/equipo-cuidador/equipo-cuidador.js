document.addEventListener('DOMContentLoaded', () => {
  inicializarCubrirSolicitudes();
  inicializarModalSolicitud();
});

// Nombre del cuidador que está usando la sesión (estático,
// sin backend). Se usa para marcar quién cubrió una solicitud.
const CUIDADOR_ACTUAL = 'Dra. Silva';

const ETIQUETAS_PACIENTE = {
  'dona-carmen': 'Doña Carmen',
  'don-roberto': 'Don Roberto',
  'maria-luisa': 'María Luisa',
};

/*CUBRIR SOLICITUDES DE AYUDA
  Al hacer clic en "Puedo ayudar", la solicitud pasa de
  "pendiente" a "cubierta": se reemplaza el botón por un
  aviso de quién la cubrió.*/
function inicializarCubrirSolicitudes() {
  const lista = document.getElementById('lista-solicitudes');
  if (!lista) return;

  lista.addEventListener('click', (evento) => {
    const boton = evento.target.closest('[data-cubrir-solicitud]');
    if (!boton) return;

    const solicitud = boton.closest('.solicitud-ayuda');
    if (!solicitud) return;

    solicitud.dataset.estado = 'cubierta';

    const aviso = document.createElement('span');
    aviso.className = 'solicitud-ayuda__cubierta-por';
    aviso.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      Cubierta por ${CUIDADOR_ACTUAL}
    `;

    boton.replaceWith(aviso);
  });
}

/*MODAL: SOLICITAR AYUDA
  Valida paciente, tipo de ayuda, fecha y hora (la nota es
  opcional). No hay backend: al publicar, la solicitud se
  agrega arriba de la lista como "pendiente", lista para que
  cualquiera del equipo la cubra con "Puedo ayudar".*/
function inicializarModalSolicitud() {
  const modal = document.getElementById('modal-solicitud');
  const botonAbrir = document.getElementById('boton-solicitar-ayuda');
  const formulario = document.getElementById('formulario-solicitud');
  const lista = document.getElementById('lista-solicitudes');

  if (!modal || !botonAbrir || !formulario || !lista) return;

  const feedback = document.getElementById('solicitud-feedback');
  const campos = {
    paciente: formulario.querySelector('#solicitud-paciente'),
    tipo: formulario.querySelector('#solicitud-tipo'),
    fecha: formulario.querySelector('#solicitud-fecha'),
    hora: formulario.querySelector('#solicitud-hora'),
  };
  const nota = formulario.querySelector('#solicitud-nota');

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

  function formatearFechaHora(valorFechaISO, valorHora) {
    const fecha = new Date(`${valorFechaISO}T00:00:00`);
    const fechaTexto = fecha.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
    const [horas, minutos] = valorHora.split(':');
    const horaObjeto = new Date();
    horaObjeto.setHours(Number(horas), Number(minutos));
    const horaTexto = horaObjeto.toLocaleTimeString('es-PE', { hour: 'numeric', minute: '2-digit' });
    return `${fechaTexto}, ${horaTexto}`;
  }

  function crearIconoGenerico() {
    return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
  }

  function crearSolicitud({ paciente, tipo, fecha, hora, notaTexto }) {
    const articulo = document.createElement('article');
    articulo.className = 'solicitud-ayuda';
    articulo.dataset.estado = 'pendiente';

    articulo.innerHTML = `
      <div class="solicitud-ayuda__icono">${crearIconoGenerico()}</div>
      <div class="solicitud-ayuda__info">
        <p class="solicitud-ayuda__titulo">${tipo}</p>
        <p class="solicitud-ayuda__detalle">${ETIQUETAS_PACIENTE[paciente]} · ${formatearFechaHora(fecha, hora)}</p>
        ${notaTexto ? `<p class="solicitud-ayuda__nota">${notaTexto}</p>` : ''}
      </div>
      <button class="boton boton--contorno solicitud-ayuda__boton" type="button" data-cubrir-solicitud>Puedo ayudar</button>
    `;

    return articulo;
  }

  botonAbrir.addEventListener('click', abrirModal);

  modal.querySelectorAll('[data-cerrar-modal-solicitud]').forEach((elemento) => {
    elemento.addEventListener('click', cerrarModal);
  });

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && modal.classList.contains('es-abierto')) cerrarModal();
  });

  Object.values(campos).forEach((input) => {
    input.addEventListener('blur', () => validarCampo(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('campo--error')) validarCampo(input);
    });
    input.addEventListener('change', () => {
      if (input.classList.contains('campo--error')) validarCampo(input);
    });
  });

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const todosValidos = Object.values(campos).map(validarCampo).every(Boolean);
    if (!todosValidos) {
      if (feedback) feedback.classList.remove('es-visible');
      return;
    }

    lista.prepend(crearSolicitud({
      paciente: campos.paciente.value,
      tipo: campos.tipo.value,
      fecha: campos.fecha.value,
      hora: campos.hora.value,
      notaTexto: nota.value.trim(),
    }));

    formulario.reset();
    Object.values(campos).forEach((input) => mostrarError(input, false));

    if (feedback) {
      feedback.classList.add('es-visible');
      setTimeout(() => {
        feedback.classList.remove('es-visible');
        cerrarModal();
      }, 1600);
    }
  });
}