document.addEventListener('DOMContentLoaded', () => {
  inicializarModalRecordatorio();
});

/*MODAL: NUEVO RECORDATORIO
  Abre/cierra el modal y valida el formulario (paciente,
  título, hora, categoría y descripción). No hay backend ni
  base de datos: al guardar, se genera una tarjeta con el
  icono y las etiquetas según la categoría elegida, y se
  agrega directamente a la grilla de recordatorios. Esto no
  persiste al recargar la página.*/
function inicializarModalRecordatorio() {
  const modal = document.getElementById('modal-recordatorio');
  const botonAbrir = document.getElementById('boton-nuevo-recordatorio');
  const formulario = document.getElementById('formulario-recordatorio');
  const lista = document.getElementById('lista-recordatorios');

  if (!modal || !botonAbrir || !formulario || !lista) return;

  const feedback = document.getElementById('recordatorio-feedback');
  const campos = {
    paciente: formulario.querySelector('#recordatorio-paciente'),
    titulo: formulario.querySelector('#recordatorio-titulo'),
    hora: formulario.querySelector('#recordatorio-hora'),
    frecuencia: formulario.querySelector('#recordatorio-frecuencia'),
    categoria: formulario.querySelector('#recordatorio-categoria'),
    descripcion: formulario.querySelector('#recordatorio-descripcion'),
  };

  const NOMBRES_PACIENTES = {
    'dona-carmen': 'Doña Carmen',
    'don-roberto': 'Don Roberto',
    'maria-luisa': 'María Luisa',
  };

  const NOMBRES_CATEGORIAS = {
    critico: 'Crítico',
    diario: 'Diario',
    bienestar: 'Bienestar',
    vital: 'Vital',
    cognitivo: 'Cognitivo',
    rutina: 'Rutina',
  };

  const NOMBRES_FRECUENCIAS = {
    diario: 'Diario',
    interdiario: 'Interdiario',
    semanal: 'Semanal',
  };

  // Color del icono según la categoría elegida
  const COLOR_ICONO_CATEGORIAS = {
    critico: 'rojo',
    diario: 'turquesa',
    bienestar: 'verde',
    vital: 'azul',
    cognitivo: 'morado',
    rutina: 'amarillo',
  };

  // Ilustración (SVG) del icono según la categoría elegida
  const SVG_ICONO_CATEGORIAS = {
    critico: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="9" width="16" height="8" rx="4" transform="rotate(-45 12 13)" stroke="currentColor" stroke-width="2"/><path d="M9.5 16.5l7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    diario: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="9" width="16" height="8" rx="4" transform="rotate(-45 12 13)" stroke="currentColor" stroke-width="2"/><path d="M9.5 16.5l7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    bienestar: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3c3 3 3 7 0 10-3-3-3-7 0-10z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 13v8M8 21h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    vital: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3s6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    cognitivo: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2"/><path d="M9 10.5c0-1.4 1.3-2.5 3-2.5s3 1.1 3 2.5c0 1-.6 1.6-1.4 2.1-.8.5-1.1.9-1.1 1.6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="16.5" r="1" fill="currentColor"/></svg>',
    rutina: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  };

  const ICONO_RELOJ = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3.5 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

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

  // Convierte "14:00" (formato del <input type="time">) a "02:00 PM"
  function formatearHora(hora24) {
    const [horasTexto, minutos] = hora24.split(':');
    const horas = parseInt(horasTexto, 10);
    const sufijo = horas >= 12 ? 'PM' : 'AM';
    let horas12 = horas % 12;
    if (horas12 === 0) horas12 = 12;
    const horas12Texto = horas12 < 10 ? `0${horas12}` : `${horas12}`;
    return `${horas12Texto}:${minutos} ${sufijo}`;
  }

  function crearTarjetaRecordatorio({ paciente, titulo, hora, frecuencia, categoria, descripcion }) {
    const colorIcono = COLOR_ICONO_CATEGORIAS[categoria];
    const svgIcono = SVG_ICONO_CATEGORIAS[categoria];

    const articulo = document.createElement('article');
    articulo.className = 'tarjeta-rutina';

    articulo.innerHTML = `
      <div class="tarjeta-rutina__encabezado">
        <div class="tarjeta-rutina__icono tarjeta-rutina__icono--${colorIcono}">${svgIcono}</div>
        <label class="interruptor">
          <input type="checkbox" checked>
          <span class="interruptor__riel"></span>
        </label>
      </div>
      <h3 class="tarjeta-rutina__titulo"></h3>
      <p class="tarjeta-rutina__hora">${ICONO_RELOJ}<span></span></p>
      <p class="tarjeta-rutina__texto"></p>
      <div class="tarjeta-rutina__etiquetas">
        <span class="etiqueta-rutina etiqueta-rutina--${categoria}"></span>
        <span class="etiqueta-rutina etiqueta-rutina--frecuencia"></span>
        <span class="etiqueta-rutina etiqueta-rutina--paciente"></span>
      </div>
    `;

    // Se insertan como texto (no HTML) para evitar cualquier inyección de código
    articulo.querySelector('.tarjeta-rutina__titulo').textContent = titulo;
    articulo.querySelector('.tarjeta-rutina__hora span').textContent = formatearHora(hora);
    articulo.querySelector('.tarjeta-rutina__texto').textContent = descripcion;
    articulo.querySelector(`.etiqueta-rutina--${categoria}`).textContent = NOMBRES_CATEGORIAS[categoria];
    articulo.querySelector('.etiqueta-rutina--frecuencia').textContent = NOMBRES_FRECUENCIAS[frecuencia];
    articulo.querySelector('.etiqueta-rutina--paciente').textContent = NOMBRES_PACIENTES[paciente];

    return articulo;
  }

  botonAbrir.addEventListener('click', abrirModal);

  modal.querySelectorAll('[data-cerrar-modal-recordatorio]').forEach((elemento) => {
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

    const nuevoRecordatorio = {
      paciente: campos.paciente.value,
      titulo: campos.titulo.value.trim(),
      hora: campos.hora.value,
      frecuencia: campos.frecuencia.value,
      categoria: campos.categoria.value,
      descripcion: campos.descripcion.value.trim(),
    };

    lista.prepend(crearTarjetaRecordatorio(nuevoRecordatorio));

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