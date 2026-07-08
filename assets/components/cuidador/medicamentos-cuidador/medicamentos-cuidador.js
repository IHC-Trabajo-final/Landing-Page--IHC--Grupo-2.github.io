document.addEventListener('DOMContentLoaded', () => {
  inicializarDiasActivos();
  inicializarFormularioMedicamento();
});

/*DÍAS ACTIVOS
  Cada botón de día funciona como un toggle independiente.
  Se refleja con la clase .dias-activos__dia--activo y con
  aria-pressed para lectores de pantalla.*/
function inicializarDiasActivos() {
  const contenedor = document.getElementById('dias-activos');
  if (!contenedor) return;

  contenedor.querySelectorAll('.dias-activos__dia').forEach((boton) => {
    boton.addEventListener('click', () => {
      const activo = boton.classList.toggle('dias-activos__dia--activo');
      boton.setAttribute('aria-pressed', String(activo));

      // Si había un error visible por no tener días seleccionados,
      // se oculta apenas se marca al menos uno.
      const formulario = boton.closest('form');
      const error = formulario?.querySelector('[data-error-para="dias-activos"]');
      if (activo && error) error.classList.remove('es-visible');
    });
  });
}

/*FORMULARIO: CONFIGURAR RECORDATORIO DE MEDICACIÓN
  Valida paciente, nombre del medicamento, dosis, hora,
  frecuencia y que haya al menos un día activo. No hay
  backend: al guardar solo se simula con console.log y un
  mensaje de éxito, igual que los demás formularios del sitio.*/
function inicializarFormularioMedicamento() {
  const formulario = document.getElementById('formulario-medicamento');
  if (!formulario) return;

  const feedback = document.getElementById('medicamento-feedback');
  const botonCancelar = document.getElementById('boton-cancelar-medicamento');

  const campos = {
    paciente: formulario.querySelector('#medicamento-paciente'),
    nombre: formulario.querySelector('#medicamento-nombre'),
    dosis: formulario.querySelector('#medicamento-dosis'),
    hora: formulario.querySelector('#medicamento-hora'),
    frecuencia: formulario.querySelector('#medicamento-frecuencia'),
  };

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

  function obtenerDiasActivos() {
    return Array.from(formulario.querySelectorAll('.dias-activos__dia--activo')).map(
      (boton) => boton.dataset.dia
    );
  }

  function validarDiasActivos() {
    const dias = obtenerDiasActivos();
    const error = formulario.querySelector('[data-error-para="dias-activos"]');
    if (error) error.classList.toggle('es-visible', dias.length === 0);
    return dias.length > 0;
  }

  Object.values(campos).forEach((input) => {
    input.addEventListener('blur', () => validarCampo(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('campo--error')) validarCampo(input);
    });
    input.addEventListener('change', () => {
      if (input.classList.contains('campo--error')) validarCampo(input);
    });
  });

  if (botonCancelar) {
    botonCancelar.addEventListener('click', () => {
      formulario.reset();
      Object.values(campos).forEach((input) => mostrarError(input, false));
      formulario.querySelectorAll('.dias-activos__dia--activo').forEach((boton) => {
        boton.classList.remove('dias-activos__dia--activo');
        boton.setAttribute('aria-pressed', 'false');
      });
      if (feedback) feedback.classList.remove('es-visible');
    });
  }

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const camposValidos = Object.values(campos).map(validarCampo).every(Boolean);
    const diasValidos = validarDiasActivos();

    if (!camposValidos || !diasValidos) {
      if (feedback) feedback.classList.remove('es-visible');
      return;
    }

    console.log('Recordatorio de medicación guardado:', {
      paciente: campos.paciente.value,
      medicamento: campos.nombre.value.trim(),
      dosis: campos.dosis.value.trim(),
      hora: campos.hora.value,
      frecuencia: campos.frecuencia.value,
      diasActivos: obtenerDiasActivos(),
    });

    if (feedback) {
      feedback.classList.add('es-visible');
      setTimeout(() => feedback.classList.remove('es-visible'), 4000);
    }
  });
}