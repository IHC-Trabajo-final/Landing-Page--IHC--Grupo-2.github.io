document.addEventListener('DOMContentLoaded', () => {
  inicializarScrollReveal();
  inicializarMenuMovil();
  inicializarFormularioContacto();
  inicializarModalAuth();
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
   Controla el botón y el panel de
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

/*4. MODAL DE AUTENTICACIÓN (Iniciar sesión / Registrarme)
   Controla la apertura/cierre del modal, el cambio entre
   pestañas y delega la validación de cada formulario a
   sus propias funciones (inicializarValidacionLogin y
   inicializarValidacionRegistro).*/
function inicializarModalAuth() {
  const modal = document.getElementById('modal-auth');
  const botonAbrir = document.getElementById('boton-perfil');
  const botonFamiliar = document.getElementById('boton-familiar');

  if (!modal || !botonAbrir) return;

  const pestañas = modal.querySelectorAll('[data-pestaña]');
  const formularios = {
    login: modal.querySelector('[data-formulario="login"]'),
    registro: modal.querySelector('[data-formulario="registro"]'),
  };

  function cambiarPestaña(nombre) {
    pestañas.forEach((pestaña) => {
      const esActiva = pestaña.dataset.pestaña === nombre;
      pestaña.classList.toggle('modal-auth__pestaña--activa', esActiva);
      pestaña.setAttribute('aria-selected', String(esActiva));
    });

    Object.entries(formularios).forEach(([clave, formulario]) => {
      if (formulario) formulario.hidden = clave !== nombre;
    });
  }

  function abrirModal(pestañaInicial) {
    modal.classList.add('es-abierto');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    cambiarPestaña(pestañaInicial);
  }

  function cerrarModal() {
    modal.classList.remove('es-abierto');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  botonAbrir.addEventListener('click', () => abrirModal('login'));

  if (botonFamiliar) {
    botonFamiliar.addEventListener('click', () => abrirModal('registro'));
  }

  modal.querySelectorAll('[data-cerrar-modal]').forEach((elemento) => {
    elemento.addEventListener('click', cerrarModal);
  });

  pestañas.forEach((pestaña) => {
    pestaña.addEventListener('click', () => cambiarPestaña(pestaña.dataset.pestaña));
  });

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && modal.classList.contains('es-abierto')) cerrarModal();
  });

  inicializarValidacionLogin();
  inicializarValidacionRegistro();
}

/*4.1 VALIDACIÓN — INICIAR SESIÓN
   Además de correo/contraseña, exige elegir un rol
   (adulto mayor o cuidador) y, si todo es válido,
   redirige al dashboard correspondiente. No hay backend:
   la "sesión" se resuelve solo con el rol elegido aquí.*/
function inicializarValidacionLogin() {
  const formulario = document.getElementById('formulario-login');
  if (!formulario) return;

  const feedback = formulario.querySelector('[data-feedback-para="login"]');
  const campos = {
    correo: formulario.querySelector('#login-correo'),
    clave: formulario.querySelector('#login-clave'),
  };
  const opcionesRol = formulario.querySelectorAll('input[name="rol"]');

  // Dashboards de destino según el rol elegido.
  // Cambia estas rutas si tus archivos tienen otro nombre.
  const DESTINOS_POR_ROL = {
    'adulto-mayor': 'assets/components/adulto-mayor/dashboard-adulto-mayor/dashboard-adulto-mayor.html',
    'cuidador': 'assets/components/cuidador/dashboard-cuidador/dashboard-cuidador.html',
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

  function mostrarErrorRol(mostrar) {
    const error = formulario.querySelector('[data-error-para="login-rol"]');
    if (error) error.classList.toggle('es-visible', mostrar);
  }

  function obtenerRolSeleccionado() {
    const seleccionado = formulario.querySelector('input[name="rol"]:checked');
    return seleccionado ? seleccionado.value : null;
  }

  function validarRol() {
    const rol = obtenerRolSeleccionado();
    mostrarErrorRol(!rol);
    return Boolean(rol);
  }

  Object.values(campos).forEach((input) => {
    input.addEventListener('blur', () => validarCampo(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('campo--error')) validarCampo(input);
    });
  });

  opcionesRol.forEach((radio) => {
    radio.addEventListener('change', () => mostrarErrorRol(false));
  });

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const camposValidos = Object.values(campos).map(validarCampo).every(Boolean);
    const rolValido = validarRol();

    if (!camposValidos || !rolValido) {
      if (feedback) feedback.classList.remove('es-visible');
      return;
    }

    const rol = obtenerRolSeleccionado();

    console.log('Inicio de sesión:', { correo: campos.correo.value.trim(), rol });

    if (feedback) feedback.classList.add('es-visible');

    // Pequeña pausa para que el usuario vea el mensaje de éxito
    // antes de redirigir al dashboard correspondiente.
    setTimeout(() => {
      window.location.href = DESTINOS_POR_ROL[rol] || 'index.html';
    }, 600);
  });
}

/*4.2 VALIDACIÓN — REGISTRARME
   Incluye validación cruzada de "confirmar contraseña"
   mediante setCustomValidity, además de las validaciones
   nativas (required, minlength, type="email").*/
function inicializarValidacionRegistro() {
  const formulario = document.getElementById('formulario-registro');
  if (!formulario) return;

  const feedback = formulario.querySelector('[data-feedback-para="registro"]');
  const campos = {
    nombre: formulario.querySelector('#registro-nombre'),
    correo: formulario.querySelector('#registro-correo'),
    clave: formulario.querySelector('#registro-clave'),
    confirmar: formulario.querySelector('#registro-confirmar'),
    terminos: formulario.querySelector('#registro-terminos'),
  };

  function mostrarError(input, mostrar) {
    const error = formulario.querySelector(`[data-error-para="${input.id}"]`);
    input.classList.toggle('campo--error', mostrar);
    if (error) error.classList.toggle('es-visible', mostrar);
  }

  function actualizarCoincidenciaClaves() {
    if (campos.confirmar.value && campos.confirmar.value !== campos.clave.value) {
      campos.confirmar.setCustomValidity('Las contraseñas no coinciden.');
    } else {
      campos.confirmar.setCustomValidity('');
    }
  }

  function validarCampo(input) {
    if (input === campos.confirmar) actualizarCoincidenciaClaves();
    const esValido = input.checkValidity();
    mostrarError(input, !esValido);
    return esValido;
  }

  [campos.nombre, campos.correo, campos.clave, campos.confirmar].forEach((input) => {
    input.addEventListener('blur', () => validarCampo(input));
    input.addEventListener('input', () => {
      if (input === campos.clave) actualizarCoincidenciaClaves();
      if (input.classList.contains('campo--error')) validarCampo(input);
    });
  });

  campos.terminos.addEventListener('change', () => validarCampo(campos.terminos));

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();

    actualizarCoincidenciaClaves();
    const todosValidos = Object.values(campos).map(validarCampo).every(Boolean);

    if (!todosValidos) {
      if (feedback) feedback.classList.remove('es-visible');
      return;
    }

    console.log('Registro creado:', {
      nombre: campos.nombre.value.trim(),
      correo: campos.correo.value.trim(),
    });

    formulario.reset();
    Object.values(campos).forEach((input) => mostrarError(input, false));

    if (feedback) {
      feedback.classList.add('es-visible');
      setTimeout(() => feedback.classList.remove('es-visible'), 4000);
    }
  });
}