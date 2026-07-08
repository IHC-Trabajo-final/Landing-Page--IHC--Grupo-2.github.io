document.addEventListener('DOMContentLoaded', () => {
  inicializarInterruptores();
});

// Los switches solo cambian visualmente su estado on/off.
// El adulto mayor no puede agregar ni eliminar rutinas;
// eso lo gestiona el cuidador desde su propio panel.
function inicializarInterruptores() {
  const lista = document.getElementById('lista-recordatorios');
  if (!lista) return;

  lista.addEventListener('change', (evento) => {
    const input = evento.target;
    if (!input.matches('.interruptor input')) return;

    const tarjeta = input.closest('.tarjeta-rutina');
    if (!tarjeta) return;

    // Reduce la opacidad de la tarjeta cuando el switch está apagado
    // para que visualmente quede claro que esa rutina está inactiva.
    tarjeta.style.opacity = input.checked ? '1' : '0.5';
  });
}