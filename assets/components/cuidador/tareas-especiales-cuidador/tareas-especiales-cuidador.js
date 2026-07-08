document.addEventListener('DOMContentLoaded', () => {
  inicializarCasillas();
  inicializarFiltros();
  inicializarModalTarea();
  actualizarEstadisticas();
});

const ETIQUETAS_PRIORIDAD = { alta: 'Alta', media: 'Media', baja: 'Baja' };
const ETIQUETAS_ESTADO = { pendiente: 'Pendiente', proceso: 'En proceso', completada: 'Completada' };
const ETIQUETAS_PACIENTE = {
  'dona-carmen': 'Doña Carmen',
  'don-roberto': 'Don Roberto',
  'maria-luisa': 'María Luisa',
};

let filtroActivo = 'todas';

/*ESTADÍSTICAS
  Cuenta cuántas tareas hay en cada estado y actualiza los
  3 números del resumen de arriba.*/
function actualizarEstadisticas() {
  const conteo = { pendiente: 0, proceso: 0, completada: 0 };

  document.querySelectorAll('.tarea').forEach((tarea) => {
    const estado = tarea.dataset.estado;
    if (conteo[estado] !== undefined) conteo[estado] += 1;
  });

  const contadorPendientes = document.getElementById('contador-pendientes');
  const contadorProceso = document.getElementById('contador-proceso');
  const contadorCompletadas = document.getElementById('contador-completadas');

  if (contadorPendientes) contadorPendientes.textContent = conteo.pendiente;
  if (contadorProceso) contadorProceso.textContent = conteo.proceso;
  if (contadorCompletadas) contadorCompletadas.textContent = conteo.completada;
}

/*FILTROS
  Muestra u oculta tareas según el estado seleccionado en
  las pestañas "Todas / Pendientes / En proceso / Completadas".*/
function inicializarFiltros() {
  const filtros = document.querySelectorAll('.tareas__filtro');
  if (!filtros.length) return;

  filtros.forEach((boton) => {
    boton.addEventListener('click', () => {
      filtros.forEach((b) => b.classList.remove('tareas__filtro--activo'));
      boton.classList.add('tareas__filtro--activo');
      filtroActivo = boton.dataset.filtro;
      aplicarFiltro();
    });
  });
}

function aplicarFiltro() {
  document.querySelectorAll('.tarea').forEach((tarea) => {
    const coincide = filtroActivo === 'todas' || tarea.dataset.estado === filtroActivo;
    tarea.hidden = !coincide;
  });
}

/*ACTUALIZAR EL BADGE DE ESTADO DE UNA TAREA*/
function actualizarBadgeEstado(tarea) {
  const badge = tarea.querySelector('.tarea__estado');
  if (!badge) return;
  const estado = tarea.dataset.estado;
  badge.className = `tarea__estado tarea__estado--${estado}`;
  badge.textContent = ETIQUETAS_ESTADO[estado];
}

/*CASILLAS DE COMPLETADO
  Marcar la casilla pasa la tarea a "completada" (guardando
  su estado anterior). Desmarcarla la regresa a ese estado
  anterior (o "pendiente" si no había uno guardado).*/
function inicializarCasillas() {
  const lista = document.getElementById('lista-tareas');
  if (!lista) return;

  lista.addEventListener('change', (evento) => {
    const casilla = evento.target;
    if (!casilla.matches('.tarea__casilla input')) return;

    const tarea = casilla.closest('.tarea');
    if (!tarea) return;

    if (casilla.checked) {
      tarea.dataset.estadoAnterior = tarea.dataset.estado !== 'completada'
        ? tarea.dataset.estado
        : (tarea.dataset.estadoAnterior || 'pendiente');
      tarea.dataset.estado = 'completada';
      tarea.classList.add('tarea--completada');
    } else {
      tarea.dataset.estado = tarea.dataset.estadoAnterior || 'pendiente';
      tarea.classList.remove('tarea--completada');
    }

    actualizarBadgeEstado(tarea);
    actualizarEstadisticas();
    aplicarFiltro();
  });
}

/*MODAL: NUEVA TAREA ESPECIAL
  Valida título, paciente, fecha límite y prioridad. No hay
  backend: al guardar se agrega la tarea directamente a la
  lista con estado "pendiente" y se recalculan estadísticas
  y filtros, igual que en los demás formularios del sitio.*/
function inicializarModalTarea() {
  const modal = document.getElementById('modal-tarea');
  const botonAbrir = document.getElementById('boton-nueva-tarea-especial');
  const formulario = document.getElementById('formulario-tarea');
  const lista = document.getElementById('lista-tareas');

  if (!modal || !botonAbrir || !formulario || !lista) return;

  const feedback = document.getElementById('tarea-feedback');
  const campos = {
    titulo: formulario.querySelector('#tarea-titulo'),
    paciente: formulario.querySelector('#tarea-paciente'),
    fecha: formulario.querySelector('#tarea-fecha'),
    prioridad: formulario.querySelector('#tarea-prioridad'),
  };

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

  function formatearFecha(valorISO) {
    const fecha = new Date(`${valorISO}T00:00:00`);
    return fecha.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function crearTareaSVG() {
    return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2.5" stroke="currentColor" stroke-width="2"/><path d="M4 9.5h16" stroke="currentColor" stroke-width="2"/><path d="M8 3v3M16 3v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
  }

  function crearTarea({ titulo, paciente, fecha, prioridad }) {
    const item = document.createElement('li');
    item.className = 'tarea';
    item.dataset.estado = 'pendiente';
    item.dataset.prioridad = prioridad;

    item.innerHTML = `
      <label class="tarea__casilla">
        <input type="checkbox">
        <span class="tarea__casilla-visual"></span>
      </label>
      <div class="tarea__info">
        <p class="tarea__titulo">${titulo}</p>
        <div class="tarea__meta">
          <span class="tarea__fecha">${crearTareaSVG()} ${formatearFecha(fecha)}</span>
          <span class="etiqueta-rutina etiqueta-rutina--paciente">${ETIQUETAS_PACIENTE[paciente]}</span>
        </div>
      </div>
      <span class="tarea__prioridad tarea__prioridad--${prioridad}">${ETIQUETAS_PRIORIDAD[prioridad]}</span>
      <span class="tarea__estado tarea__estado--pendiente">Pendiente</span>
    `;

    return item;
  }

  botonAbrir.addEventListener('click', abrirModal);

  modal.querySelectorAll('[data-cerrar-modal-tarea]').forEach((elemento) => {
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

    lista.prepend(crearTarea({
      titulo: campos.titulo.value.trim(),
      paciente: campos.paciente.value,
      fecha: campos.fecha.value,
      prioridad: campos.prioridad.value,
    }));

    actualizarEstadisticas();
    aplicarFiltro();

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
}