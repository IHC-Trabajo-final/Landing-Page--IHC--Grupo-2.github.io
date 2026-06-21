document.addEventListener('DOMContentLoaded', () => {
  inicializarScrollReveal();
  inicializarMenuMovil();
  inicializarFormularioContacto();
});

/*1. SCROLL REVEAL
   Agrega la clase "es-visible" cuando el elemento entra
   en el viewport. Los estilos (opacidad/transform) y la
   transición ya están definidos en syle.css; aquí solo
   decidimos CUÁNDO se activan.*/
function inicializarScrollReveal() {
  const elementos = document.querySelectorAll(
    '.tarjeta-funcion, .tarjeta-testimonio, .beneficio-item'
  );

  if (!elementos.length) return;

  // Si el navegador no soporta IntersectionObserver, mostrar todo de una vez
  if (!('IntersectionObserver' in window)) {
    elementos.forEach((el) => el.classList.add('es-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entradas, obs) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('es-visible');
          obs.unobserve(entrada.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elementos.forEach((el, indice) => {
    // pequeño retraso escalonado dentro de cada grupo de tarjetas
    el.style.transitionDelay = `${(indice % 3) * 90}ms`;
    observer.observe(el);
  });
}

/* 2. MENÚ MÓVIL
   Controla el botón hamburguesa (≤1024px) y el panel de
   enlaces que el CSS oculta con .navbar__enlaces-movil.*/
function inicializarMenuMovil() {
  const boton = document.getElementById('boton-menu-movil');
  const menu = document.getElementById('menu-movil');

  if (!boton || !menu) return;

  function cerrarMenu() {
    menu.classList.remove('es-abierto');
    boton.setAttribute('aria-expanded', 'false');
  }

  function abrirMenu() {
    menu.classList.add('es-abierto');
    boton.setAttribute('aria-expanded', 'true');
  }

  boton.addEventListener('click', () => {
    const estaAbierto = boton.getAttribute('aria-expanded') === 'true';
    estaAbierto ? cerrarMenu() : abrirMenu();
  });

  // Cerrar al elegir un enlace
  menu.querySelectorAll('.navbar__enlace').forEach((enlace) => {
    enlace.addEventListener('click', cerrarMenu);
  });

  // Cerrar con la tecla Escape
  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape') cerrarMenu();
  });

  // Cerrar si la ventana vuelve a tamaño de escritorio
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) cerrarMenu();
  });
}

/*3. FORMULARIO DE CONTACTO
   Validación simple en cliente + feedback visual.
   No hay backend conectado: aquí solo se simula el envío.
   Si ya tienes un endpoint, reemplaza el contenido de
   enviarFormulario() por tu propia llamada (fetch, etc).*/
function inicializarFormularioContacto() {
  const formulario = document.getElementById('formulario-contacto');
  if (!formulario) return;

  const feedback = document.getElementById('formulario-feedback');
  const campos = {
    nombre: formulario.querySelector('#nombre'),
    correo: formulario.querySelector('#correo'),
    mensaje: formulario.querySelector('#mensaje'),
  };

  function mostrarError(input, mostrar) {
    const error = formulario.querySelector(`[data-error-para="${input.id}"]`);
    input.classList.toggle('campo--error', mostrar);
    if (error) error.classList.toggle('es-visible', mostrar);
  }

  function validarCampo(input) {
    let esValido = input.checkValidity();
    mostrarError(input, !esValido);
    return esValido;
  }

  // Validar en tiempo real al salir de cada campo
  Object.values(campos).forEach((input) => {
    input.addEventListener('blur', () => validarCampo(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('campo--error')) validarCampo(input);
    });
  });

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const todosValidos = Object.values(campos)
      .map(validarCampo)
      .every(Boolean);

    if (!todosValidos) {
      if (feedback) feedback.classList.remove('es-visible');
      return;
    }

    enviarFormulario({
      nombre: campos.nombre.value.trim(),
      correo: campos.correo.value.trim(),
      mensaje: campos.mensaje.value.trim(),
    });
  });

  function enviarFormulario(datos) {
    console.log('Formulario de contacto enviado:', datos);

    formulario.reset();
    Object.values(campos).forEach((input) => mostrarError(input, false));

    if (feedback) {
      feedback.classList.add('es-visible');
      setTimeout(() => feedback.classList.remove('es-visible'), 5000);
    }
  }
}
