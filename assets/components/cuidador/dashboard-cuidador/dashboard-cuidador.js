document.addEventListener('DOMContentLoaded', () => {
  inicializarModalPaciente();
  inicializarDetallePaciente();
});

/*MODAL: REGISTRAR PACIENTE
  Abre/cierra el modal y valida el formulario (nombre,
  edad y estado). No hay backend ni base de datos: al
  registrar, se genera una tarjeta con iniciales y se
  agrega directamente a la grilla de "Pacientes a Cargo".
  Esto no persiste al recargar la página.*/
function inicializarModalPaciente() {
  const modal = document.getElementById('modal-paciente');
  const botonAbrir = document.getElementById('boton-registrar-paciente');
  const formulario = document.getElementById('formulario-paciente');
  const lista = document.getElementById('lista-pacientes');

  if (!modal || !botonAbrir || !formulario || !lista) return;

  const feedback = document.getElementById('paciente-feedback');
  const campos = {
    nombre: formulario.querySelector('#paciente-nombre'),
    edad: formulario.querySelector('#paciente-edad'),
    estado: formulario.querySelector('#paciente-estado'),
  };

  const ETIQUETAS_ESTADO = {
    estable: 'Estable',
    atencion: 'Atención',
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

  function generarIniciales(nombre) {
    const palabras = nombre.trim().split(/\s+/);
    const primera = palabras[0]?.[0] || '';
    const ultima = palabras.length > 1 ? palabras[palabras.length - 1][0] : '';
    return (primera + ultima).toUpperCase();
  }

  function crearTarjetaPaciente({ nombre, edad, estado }) {
    const articulo = document.createElement('article');
    articulo.className = 'tarjeta-paciente';
    articulo.setAttribute('tabindex', '0');
    articulo.setAttribute('role', 'button');
    articulo.setAttribute('aria-haspopup', 'dialog');
    articulo.setAttribute('aria-controls', 'modal-detalle-paciente');

    articulo.innerHTML = `
      <div class="tarjeta-paciente__avatar tarjeta-paciente__avatar--iniciales">${generarIniciales(nombre)}</div>
      <div class="tarjeta-paciente__info">
        <p class="tarjeta-paciente__nombre">${nombre}</p>
        <p class="tarjeta-paciente__edad">${edad} años</p>
        <span class="tarjeta-paciente__estado tarjeta-paciente__estado--${estado}">${ETIQUETAS_ESTADO[estado]}</span>
      </div>
      <svg class="tarjeta-paciente__flecha" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    `;

    return articulo;
  }

  botonAbrir.addEventListener('click', abrirModal);

  modal.querySelectorAll('[data-cerrar-modal-paciente]').forEach((elemento) => {
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

    const nuevoPaciente = {
      nombre: campos.nombre.value.trim(),
      edad: campos.edad.value.trim(),
      estado: campos.estado.value,
    };

    lista.prepend(crearTarjetaPaciente(nuevoPaciente));

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

/*MODAL: DETALLE DEL PACIENTE
  Al hacer clic (o Enter/Espacio) en cualquier tarjeta de
  "Pacientes a Cargo", se abre un modal con su información
  y dos datos adicionales generados al azar la primera vez
  que se ve esa tarjeta: horas desde el último recordatorio
  (1 a 10) y una medicina de una lista. Esos valores quedan
  guardados en data-attributes de la tarjeta, así que no
  cambian cada vez que abres el mismo paciente.*/
function inicializarDetallePaciente() {
  const modal = document.getElementById('modal-detalle-paciente');
  const lista = document.getElementById('lista-pacientes');
  if (!modal || !lista) return;

  const MEDICINAS = [
    'Aspirina 81 mg',
    'Losartán 50 mg',
    'Metformina 850 mg',
    'Atorvastatina 20 mg',
    'Omeprazol 20 mg',
    'Enalapril 10 mg',
    'Levotiroxina 75 mcg',
    'Paracetamol 500 mg',
  ];

  const avatarDestino = modal.querySelector('#detalle-avatar');
  const estadoDestino = modal.querySelector('#detalle-estado');
  const nombreDestino = modal.querySelector('[data-campo="nombre"]');
  const edadDestino = modal.querySelector('[data-campo="edad"]');
  const recordatorioDestino = modal.querySelector('[data-campo="recordatorio"]');
  const medicinaDestino = modal.querySelector('[data-campo="medicina"]');

  function numeroAleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Asigna medicina y horas solo si la tarjeta todavía no las tiene,
  // para que se mantengan fijas mientras no se recargue la página.
  function asignarDatosAleatorios(tarjeta) {
    if (!tarjeta.dataset.medicina) {
      tarjeta.dataset.medicina = MEDICINAS[numeroAleatorio(0, MEDICINAS.length - 1)];
    }
    if (!tarjeta.dataset.horas) {
      tarjeta.dataset.horas = String(numeroAleatorio(1, 10));
    }
  }

  // Asignar de una vez a las tarjetas que ya vienen en el HTML
  lista.querySelectorAll('.tarjeta-paciente').forEach(asignarDatosAleatorios);

  function abrirModal(tarjeta) {
    asignarDatosAleatorios(tarjeta);

    const nombre = tarjeta.querySelector('.tarjeta-paciente__nombre')?.textContent || '';
    const edad = tarjeta.querySelector('.tarjeta-paciente__edad')?.textContent || '';
    const estadoOrigen = tarjeta.querySelector('.tarjeta-paciente__estado');
    const avatarOrigen = tarjeta.querySelector('.tarjeta-paciente__avatar');

    nombreDestino.textContent = nombre;
    edadDestino.textContent = edad;
    recordatorioDestino.textContent = `Hace ${tarjeta.dataset.horas} horas`;
    medicinaDestino.textContent = tarjeta.dataset.medicina;

    if (estadoOrigen) {
      estadoDestino.className = estadoOrigen.className;
      estadoDestino.textContent = estadoOrigen.textContent;
    }

    avatarDestino.innerHTML = '';
    if (avatarOrigen) {
      avatarDestino.appendChild(avatarOrigen.cloneNode(true));
    }

    modal.classList.add('es-abierto');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function cerrarModal() {
    modal.classList.remove('es-abierto');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Delegación de eventos: funciona también con tarjetas
  // agregadas después (pacientes recién registrados).
  lista.addEventListener('click', (evento) => {
    const tarjeta = evento.target.closest('.tarjeta-paciente');
    if (tarjeta) abrirModal(tarjeta);
  });

  lista.addEventListener('keydown', (evento) => {
    if (evento.key !== 'Enter' && evento.key !== ' ') return;
    const tarjeta = evento.target.closest('.tarjeta-paciente');
    if (tarjeta) {
      evento.preventDefault();
      abrirModal(tarjeta);
    }
  });

  modal.querySelectorAll('[data-cerrar-modal-detalle]').forEach((elemento) => {
    elemento.addEventListener('click', cerrarModal);
  });

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && modal.classList.contains('es-abierto')) cerrarModal();
  });
}