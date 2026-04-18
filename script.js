// Calendario: selector de tipo + resumen del mes

document.addEventListener('DOMContentLoaded', function() {
    const TIPOS_ACTIVOS = ['tipo-alta', 'tipo-media', 'tipo-baja'];
    const TIPOS = [...TIPOS_ACTIVOS, 'tipo-descanso'];
    let tipoSeleccionado = 'alta';

    // Selector de leyenda
    document.querySelectorAll('.leyenda-opcion').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.leyenda-opcion').forEach(function(b) {
                b.classList.remove('activo-seleccionado');
            });
            this.classList.add('activo-seleccionado');
            tipoSeleccionado = this.dataset.tipo;
        });
    });

    function actualizarResumen() {
        const celdas = document.querySelectorAll('.cal-dia-funcional');
        let activos = 0;
        let descanso = 0;
        celdas.forEach(function(c) {
            if (TIPOS_ACTIVOS.some(function(t) { return c.classList.contains(t); })) activos++;
            else if (c.classList.contains('tipo-descanso')) descanso++;
        });
        const total = activos + descanso;
        const consistencia = total > 0 ? Math.round((activos / total) * 100) : 0;

        const elActivos = document.getElementById('resumen-activos');
        const elDescanso = document.getElementById('resumen-descanso');
        const elConsistencia = document.getElementById('resumen-consistencia');
        const elBarra = document.getElementById('resumen-barra');

        if (elActivos) elActivos.textContent = activos;
        if (elDescanso) elDescanso.textContent = descanso;
        if (elConsistencia) elConsistencia.textContent = consistencia + '%';
        if (elBarra) elBarra.style.width = consistencia + '%';
    }

    document.querySelectorAll('.cal-dia-funcional').forEach(function(celda) {
        celda.addEventListener('click', function() {
            const claseActual = TIPOS.find(function(t) { return celda.classList.contains(t); });
            const claseNueva = 'tipo-' + tipoSeleccionado;
            // Si ya tiene el mismo tipo, lo desmarca; si no, aplica el tipo seleccionado
            TIPOS.forEach(function(t) { celda.classList.remove(t); });
            if (claseActual !== claseNueva) {
                celda.classList.add(claseNueva);
            }
            actualizarResumen();
        });
    });

    actualizarResumen();
});
