document.addEventListener('DOMContentLoaded', () => {
  inicializarCasillas();
  inicializarFiltros();
  actualizarEstadisticas();
});

const ETIQUETAS_ESTADO = {
  pendiente: 'Pendiente',
  proceso: 'En proceso',
  completada: 'Completada',
};

let filtroActivo = 'todas';

// Cuenta las tareas por estado y actualiza los 3 contadores del resumen.
function actualizarEstadisticas() {
  const conteo = { pendiente: 0, proceso: 0, completada: 0 };

  document.querySelectorAll('.tarea').forEach((tarea) => {
    const estado = tarea.dataset.estado;
    if (conteo[estado] !== undefined) conteo[estado]++;
  });

  document.getElementById('contador-pendientes').textContent = conteo.pendiente;
  document.getElementById('contador-proceso').textContent   = conteo.proceso;
  document.getElementById('contador-completadas').textContent = conteo.completada;
}

// Muestra u oculta las tareas según el filtro activo.
function aplicarFiltro() {
  document.querySelectorAll('.tarea').forEach((tarea) => {
    tarea.hidden = filtroActivo !== 'todas' && tarea.dataset.estado !== filtroActivo;
  });
}

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

// Actualiza el badge de estado en base a tarea.dataset.estado.
function actualizarBadgeEstado(tarea) {
  const badge = tarea.querySelector('.tarea__estado');
  if (!badge) return;
  const estado = tarea.dataset.estado;
  badge.className = `tarea__estado tarea__estado--${estado}`;
  badge.textContent = ETIQUETAS_ESTADO[estado];
}

// Marcar checkbox → completada; desmarcar → estado anterior.
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