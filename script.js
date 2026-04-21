// Calendario: navegación de meses, selector de tipo + resumen

// Modo oscuro
(function() {
    const btn = document.getElementById('btn-dark-mode');
    if (!btn) return;
    const DARK_KEY = 'fittrack_darkmode';
    const LUNA_HTML = '<img src="../img/luna.png" alt="Modo oscuro" style="width:1.2rem;height:1.2rem;display:block;">';
    const SOL_HTML = '<img src="../img/sol.png" alt="Modo claro" style="width:1.2rem;height:1.2rem;display:block;">';
    if (localStorage.getItem(DARK_KEY) === '1') {
        document.body.classList.add('dark-mode');
        btn.innerHTML = SOL_HTML;
    }
    btn.addEventListener('click', function() {
        const isDark = document.body.classList.toggle('dark-mode');
        btn.innerHTML = isDark ? SOL_HTML : LUNA_HTML;
        localStorage.setItem(DARK_KEY, isDark ? '1' : '0');
    });
})();

document.addEventListener('DOMContentLoaded', function() {
    const TIPOS_ACTIVOS = ['tipo-alta'];
    const TIPOS = [...TIPOS_ACTIVOS, 'tipo-descanso'];
    const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    let tipoSeleccionado = 'seleccion';

    // Estado del mes visible
    const hoy = new Date();
    let mesActual = hoy.getMonth();
    let anioActual = hoy.getFullYear();

    // Guarda marcas por mes: clave "YYYY-M" -> { dia: clase }
    const MARCAS_KEY = 'fittrack_marcas';
    let marcas = {};
    try {
        const guardado = localStorage.getItem(MARCAS_KEY);
        if (guardado) marcas = JSON.parse(guardado);
    } catch(e) {}

    function clavesMes() {
        return anioActual + '-' + mesActual;
    }

    function guardarMarcas() {
        const datos = {};
        document.querySelectorAll('.cal-dia-funcional').forEach(function(c) {
            const tipo = TIPOS.find(function(t) { return c.classList.contains(t); });
            if (tipo) datos[c.dataset.dia] = tipo;
        });
        marcas[clavesMes()] = datos;
        try { localStorage.setItem(MARCAS_KEY, JSON.stringify(marcas)); } catch(e) {}
    }

    function renderizarMes() {
        const grid = document.getElementById('cal-dias-grid');
        grid.innerHTML = '';

        // Etiqueta del mes
        document.getElementById('cal-mes-label').textContent = MESES[mesActual] + ' ' + anioActual;

        // Primer día de la semana del mes (0=Dom)
        const primerDia = new Date(anioActual, mesActual, 1).getDay();
        const diasEnMes = new Date(anioActual, mesActual + 1, 0).getDate();
        const marcasMes = marcas[clavesMes()] || {};

        // Celdas vacías iniciales
        for (let i = 0; i < primerDia; i++) {
            const vacio = document.createElement('div');
            grid.appendChild(vacio);
        }

        // Días del mes
        for (let d = 1; d <= diasEnMes; d++) {
            const celda = document.createElement('div');
            celda.className = 'cal-dia-funcional';
            celda.dataset.dia = d;
            celda.textContent = d;
            if (marcasMes[d]) celda.classList.add(marcasMes[d]);
            // Marcar el día de hoy
            if (anioActual === hoy.getFullYear() && mesActual === hoy.getMonth() && d === hoy.getDate()) {
                celda.classList.add('hoy');
            }
            celda.addEventListener('click', function() {
                if (tipoSeleccionado === 'seleccion') {
                    document.querySelectorAll('.cal-dia-funcional').forEach(function(c) {
                        c.classList.remove('dia-seleccionado');
                    });
                    celda.classList.add('dia-seleccionado');
                    mostrarEjerciciosDia(d, mesActual, anioActual);
                    return;
                }
                const claseActual = TIPOS.find(function(t) { return celda.classList.contains(t); });
                const claseNueva = 'tipo-' + tipoSeleccionado;
                TIPOS.forEach(function(t) { celda.classList.remove(t); });
                if (claseActual !== claseNueva) celda.classList.add(claseNueva);
                guardarMarcas();
                actualizarResumen();
                mostrarEjerciciosDia(d, mesActual, anioActual);
            });
            grid.appendChild(celda);
        }

        actualizarResumen();
    }

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

    // Navegación
    document.getElementById('cal-prev').addEventListener('click', function() {
        guardarMarcas();
        mesActual--;
        if (mesActual < 0) { mesActual = 11; anioActual--; }
        renderizarMes();
    });
    document.getElementById('cal-next').addEventListener('click', function() {
        guardarMarcas();
        mesActual++;
        if (mesActual > 11) { mesActual = 0; anioActual++; }
        renderizarMes();
    });

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

    renderizarMes();

    // Fecha en "Ejercicios del día"
    const elFecha = document.getElementById('ejercicios-dia-fecha');
    if (elFecha) {
        const diasSemana = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
        const mesesNombre = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
        elFecha.textContent = diasSemana[hoy.getDay()] + ', ' + hoy.getDate() + ' de ' + mesesNombre[hoy.getMonth()] + ' ' + hoy.getFullYear();
    }

    // Mapeo: getDay() -> índice en diasData (Lunes=0 ... Domingo=6)
    const DIA_SEMANA_IDX = { 1:0, 2:1, 3:2, 4:3, 5:4, 6:5, 0:6 };
    const DIAS_NOMBRES_SEMANA = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
    const MESES_NOMBRES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

    function mostrarEjerciciosDia(dia, mes, anio) {
        const fecha = new Date(anio, mes, dia);
        const diaSemana = fecha.getDay();
        const idxRutina = DIA_SEMANA_IDX[diaSemana];

        const elFechaCard = document.getElementById('ejercicios-dia-fecha');
        if (elFechaCard) {
            elFechaCard.textContent = DIAS_NOMBRES_SEMANA[diaSemana] + ', ' + dia + ' de ' + MESES_NOMBRES[mes] + ' ' + anio;
        }

        const emptyEl = document.getElementById('ejercicios-dia-empty');
        if (!emptyEl) return;

        // Intentar leer rutina guardada
        let rutina = null;
        try {
            const guardado = localStorage.getItem('fittrack_rutina');
            if (guardado) rutina = JSON.parse(guardado);
        } catch(e) {}

        if (!rutina) {
            emptyEl.innerHTML =
                '<span class="ejercicios-dia-icono"><svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="#c8d0d8"><circle cx="13.5" cy="3.5" r="1.5"/><path d="M9.9 8.1L6 22h2.1l2.7-7 2.2 2V22H15v-8.5l-2.3-2.1.7-3.4C14.6 10 16.4 11 18 11V9c-1.4 0-2.9-.8-3.7-1.9L13 5.9c-.4-.5-.9-.9-1.6-.9-.3 0-.5.1-.8.1L5 7v4h2V8.3l2.9-.2z"/></svg></span>' +
                '<p class="ejercicios-dia-empty-titulo">Sin rutina guardada</p>' +
                '<p class="ejercicios-dia-empty-sub"><a href="rutina.html" style="color:#2ECC71;font-weight:600;">Ve a Rutina Semanal</a> para crear y guardar tu rutina</p>';
            emptyEl.style.display = 'flex';
            return;
        }

        const diaData = rutina[idxRutina];
        const svgIcono = '<span class="ejercicios-dia-icono"><svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="#c8d0d8"><circle cx="13.5" cy="3.5" r="1.5"/><path d="M9.9 8.1L6 22h2.1l2.7-7 2.2 2V22H15v-8.5l-2.3-2.1.7-3.4C14.6 10 16.4 11 18 11V9c-1.4 0-2.9-.8-3.7-1.9L13 5.9c-.4-.5-.9-.9-1.6-.9-.3 0-.5.1-.8.1L5 7v4h2V8.3l2.9-.2z"/></svg></span>';

        if (!diaData || diaData.tipo === 'Descanso') {
            emptyEl.innerHTML =
                svgIcono +
                '<p class="ejercicios-dia-empty-titulo">Sin ejercicios para este día</p>' +
                '<p class="ejercicios-dia-empty-sub">Es un día de descanso o no hay ejercicios asignados</p>';
            emptyEl.style.display = 'flex';
            const listaPrevia = document.getElementById('ejercicios-dia-lista');
            if (listaPrevia) listaPrevia.remove();
            return;
        }

        const ejercicios = diaData.ejercicios ? diaData.ejercicios.filter(function(e){ return e.nombre && e.nombre !== 'Día de descanso'; }) : [];

        if (ejercicios.length === 0) {
            emptyEl.innerHTML =
                svgIcono +
                '<p class="ejercicios-dia-empty-titulo">Sin ejercicios para este día</p>' +
                '<p class="ejercicios-dia-empty-sub">Es un día de descanso o no hay ejercicios asignados</p>';
            emptyEl.style.display = 'flex';
            return;
        }

        emptyEl.style.display = 'none';

        // Eliminar lista previa si existe
        const listaPrevia = document.getElementById('ejercicios-dia-lista');
        if (listaPrevia) listaPrevia.remove();

        const lista = document.createElement('div');
        lista.id = 'ejercicios-dia-lista';
        lista.className = 'ejercicios-dia-lista';

        ejercicios.forEach(function(ej) {
            const card = document.createElement('div');
            card.className = 'ej-cal-card';
            let meta = '';
            if (ej.series) meta += '<span class="ej-cal-meta">' + ej.series + '</span>';
            if (ej.tiempo) meta += '<span class="ej-cal-meta">' + ej.tiempo + '</span>';
            card.innerHTML =
                '<div class="ej-cal-top">' +
                    '<span class="ej-cal-nombre">' + ej.nombre + '</span>' +
                    '<span class="ej-cal-tipo ej-tipo-' + (ej.tipo || 'Otro').toLowerCase() + '">' + (ej.tipo || '') + '</span>' +
                '</div>' +
                (meta ? '<div class="ej-cal-metas">' + meta + '</div>' : '') +
                (ej.nota ? '<div class="ej-cal-nota">' + ej.nota + '</div>' : '');
            lista.appendChild(card);
        });

        emptyEl.parentElement.appendChild(lista);
    }

    // Mostrar ejercicios del día actual al cargar
    mostrarEjerciciosDia(hoy.getDate(), hoy.getMonth(), hoy.getFullYear());
});
