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

document.addEventListener('DOMContentLoaded', function () {
    const TIPOS_DIA = ['Fuerza', 'Cardio', 'HIIT', 'Descanso', 'Yoga', 'Ciclismo', 'Otro'];

    const TIPO_ESTILO = {
        'Fuerza':   { color: 'tipo-fuerza' },
        'Cardio':   { color: 'tipo-cardio' },
        'HIIT':     { color: 'tipo-hiit' },
        'Descanso': { color: 'tipo-descanso-dia' },
        'Yoga':     { color: 'tipo-yoga' },
        'Ciclismo': { color: 'tipo-ciclismo' },
        'Otro':     { color: 'tipo-otro' },
    };

    function estiloTipo(tipo) {
        return TIPO_ESTILO[tipo] || TIPO_ESTILO['Otro'];
    }

    const diasData = [
        {
            nombre: 'Lunes', emoji: '🏋️', color: 'lunes', tipo: 'Fuerza',
            ejercicios: [
                { nombre: 'Press de banca',  tipo: 'Fuerza', series: '4×10', tiempo: '20min', nota: '' },
                { nombre: 'Sentadillas',     tipo: 'Fuerza', series: '4×12', tiempo: '15min', nota: '' },
                { nombre: 'Peso muerto',     tipo: 'Fuerza', series: '3×8',  tiempo: '15min', nota: 'Cuidar la espalda' },
            ]
        },
        {
            nombre: 'Martes', emoji: '🔥', color: 'martes', tipo: 'Cardio',
            ejercicios: [
                { nombre: 'Carrera continua', tipo: 'Cardio', series: '40min', tiempo: '40min', nota: 'Ritmo moderado' },
                { nombre: 'Saltar cuerda',    tipo: 'Cardio', series: '5×—',   tiempo: '5min',  nota: '' },
            ]
        },
        {
            nombre: 'Miércoles', emoji: '💤', color: 'miercoles', tipo: 'Descanso',
            ejercicios: [
                { nombre: 'Día de descanso', tipo: 'Descanso', series: '', tiempo: '', nota: '' },
            ]
        },
        {
            nombre: 'Jueves', emoji: '⚡', color: 'jueves', tipo: 'HIIT',
            ejercicios: [
                { nombre: 'Burpees',          tipo: 'HIIT', series: '4×15', tiempo: '10min', nota: '' },
                { nombre: 'Mountain climbers',tipo: 'HIIT', series: '3×20', tiempo: '8min',  nota: '' },
                { nombre: 'Jumping jacks',    tipo: 'HIIT', series: '3×30', tiempo: '5min',  nota: '' },
            ]
        },
        {
            nombre: 'Viernes', emoji: '🏋️', color: 'viernes', tipo: 'Fuerza',
            ejercicios: [
                { nombre: 'Dominadas',     tipo: 'Fuerza', series: '4×8',  tiempo: '15min', nota: '' },
                { nombre: 'Remo con barra',tipo: 'Fuerza', series: '3×12', tiempo: '15min', nota: '' },
                { nombre: 'Press militar', tipo: 'Fuerza', series: '3×10', tiempo: '12min', nota: '' },
            ]
        },
        {
            nombre: 'Sábado', emoji: '🚴', color: 'sabado', tipo: 'Cardio',
            ejercicios: [
                { nombre: 'Ciclismo al aire libre', tipo: 'Ciclismo', series: '', tiempo: '60min', nota: 'Ruta del parque' },
            ]
        },
        {
            nombre: 'Domingo', emoji: '🧘', color: 'domingo', tipo: 'Yoga',
            ejercicios: [
                { nombre: 'Yoga restaurativo', tipo: 'Yoga', series: '', tiempo: '45min', nota: 'Enfocarse en respiración' },
            ]
        },
    ];

    const STORAGE_KEY = 'fittrack_rutina';

    function cargarRutina() {
        try {
            const guardado = localStorage.getItem(STORAGE_KEY);
            if (!guardado) return;
            const datos = JSON.parse(guardado);
            datos.forEach(function (d, i) {
                if (diasData[i]) {
                    diasData[i].tipo = d.tipo;
                    diasData[i].ejercicios = d.ejercicios;
                }
            });
        } catch (e) {}
    }

    function guardarRutina() {
        const datos = diasData.map(function (d) {
            return { nombre: d.nombre, tipo: d.tipo, ejercicios: d.ejercicios };
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
    }

    let modalDiaIdx = -1;
    let modalEjIdx = -1;

    function calcTiempoTotal(ejercicios) {
        let total = 0;
        ejercicios.forEach(function (e) {
            const m = (e.tiempo || '').match(/(\d+)/);
            if (m) total += parseInt(m[1]);
        });
        return total;
    }

    function actualizarStats() {
        let activos = 0, ejerciciosTotal = 0, minutosTotal = 0;
        diasData.forEach(function (dia) {
            if (dia.tipo !== 'Descanso') activos++;
            dia.ejercicios.forEach(function (e) {
                if (e.tipo !== 'Descanso' && e.nombre !== 'Día de descanso') ejerciciosTotal++;
                const m = (e.tiempo || '').match(/(\d+)/);
                if (m) minutosTotal += parseInt(m[1]);
            });
        });
        const sa = document.getElementById('stat-activos');
        const se = document.getElementById('stat-ejercicios');
        const sm = document.getElementById('stat-minutos');
        if (sa) sa.textContent = activos;
        if (se) se.textContent = ejerciciosTotal;
        if (sm) sm.textContent = minutosTotal;
    }

    function render() {
        const container = document.getElementById('rutina-container');
        container.innerHTML = '';

        diasData.forEach(function (dia, dIdx) {
            const tiempoTotal = calcTiempoTotal(dia.ejercicios);

            const estilo = estiloTipo(dia.tipo);
            const row = document.createElement('div');
            row.className = 'dia-row';

            // Panel izquierdo
            const panel = document.createElement('div');
            panel.className = 'dia-panel ' + estilo.color;
            panel.innerHTML =
                '<div class="dia-nombre">' + dia.nombre + '</div>' +
                '<select class="dia-tipo-select" data-dia="' + dIdx + '">' +
                TIPOS_DIA.map(function (t) {
                    return '<option' + (t === dia.tipo ? ' selected' : '') + '>' + t + '</option>';
                }).join('') +
                '</select>' +
                (tiempoTotal > 0 ? '<div class="dia-tiempo">' + tiempoTotal + ' min total</div>' : '');

            // Ejercicios
            const ejWrap = document.createElement('div');
            ejWrap.className = 'ejercicios-wrap';

            if (dia.tipo === 'Descanso') {
                // Día de descanso: mostrar mensaje, sin ejercicios ni botón agregar
                const descansoMsg = document.createElement('div');
                descansoMsg.className = 'descanso-msg';
                descansoMsg.textContent = 'Día de descanso';
                ejWrap.appendChild(descansoMsg);
            } else {
            dia.ejercicios.forEach(function (ej, eIdx) {
                const card = document.createElement('div');
                card.className = 'ejercicio-card';

                let infoHtml = '';
                if (ej.series && ej.tiempo) {
                    infoHtml = '<div class="ej-info"><span>' + ej.series + '</span><span>' + ej.tiempo + '</span></div>';
                } else if (ej.series) {
                    infoHtml = '<div class="ej-info"><span>' + ej.series + '</span></div>';
                } else if (ej.tiempo) {
                    infoHtml = '<div class="ej-info"><span>' + ej.tiempo + '</span></div>';
                }

                card.innerHTML =
                    '<div class="ej-header">' +
                        '<span class="ej-nombre">' + ej.nombre + '</span>' +
                        '<div class="ej-acciones">' +
                            '<button class="ej-btn-edit" data-dia="' + dIdx + '" data-ej="' + eIdx + '" title="Editar">Editar</button>' +
                            '<button class="ej-btn-del"  data-dia="' + dIdx + '" data-ej="' + eIdx + '" title="Eliminar">Eliminar</button>' +
                        '</div>' +
                    '</div>' +
                    '<div class="ej-tipo">' + ej.tipo + '</div>' +
                    infoHtml +
                    (ej.nota ? '<div class="ej-nota">' + ej.nota + '</div>' : '');

                ejWrap.appendChild(card);
            });

            // Botón agregar
            const addCard = document.createElement('div');
            addCard.className = 'agregar-card';
            addCard.dataset.dia = dIdx;
            addCard.innerHTML = '<span class="agregar-plus">+</span><span>Agregar</span>';
            ejWrap.appendChild(addCard);
            } // end if not Descanso

            row.appendChild(panel);
            row.appendChild(ejWrap);
            container.appendChild(row);
        });

        // Eventos
        container.querySelectorAll('.dia-tipo-select').forEach(function (sel) {
            sel.addEventListener('change', function () {
                const idx = +this.dataset.dia;
                if (this.value === 'Descanso') {
                    diasData[idx].ejercicios = [];
                }
                diasData[idx].tipo = this.value;
                render();
            });
        });
        container.querySelectorAll('.ej-btn-edit').forEach(function (btn) {
            btn.addEventListener('click', function () {
                abrirModal(+this.dataset.dia, +this.dataset.ej);
            });
        });
        container.querySelectorAll('.ej-btn-del').forEach(function (btn) {
            btn.addEventListener('click', function () {
                diasData[+this.dataset.dia].ejercicios.splice(+this.dataset.ej, 1);
                render();
            });
        });
        container.querySelectorAll('.agregar-card').forEach(function (card) {
            card.addEventListener('click', function () {
                abrirModal(+this.dataset.dia, -1);
            });
        });
        actualizarStats();
    }

    function abrirModal(diaIdx, ejIdx) {
        modalDiaIdx = diaIdx;
        modalEjIdx = ejIdx;
        document.getElementById('modal-titulo').textContent = ejIdx >= 0 ? 'Editar ejercicio' : 'Agregar ejercicio';
        if (ejIdx >= 0) {
            const ej = diasData[diaIdx].ejercicios[ejIdx];
            document.getElementById('modal-nombre').value  = ej.nombre;
            document.getElementById('modal-tipo').value    = ej.tipo;
            document.getElementById('modal-series').value  = ej.series;
            document.getElementById('modal-tiempo').value  = ej.tiempo;
            document.getElementById('modal-nota').value    = ej.nota;
        } else {
            document.getElementById('modal-nombre').value  = '';
            document.getElementById('modal-tipo').value    = diasData[diaIdx].tipo;
            document.getElementById('modal-series').value  = '';
            document.getElementById('modal-tiempo').value  = '';
            document.getElementById('modal-nota').value    = '';
        }
        document.getElementById('rutina-modal').style.display = 'flex';
        document.getElementById('modal-nombre').focus();
    }

    document.getElementById('modal-cancelar').addEventListener('click', function () {
        document.getElementById('rutina-modal').style.display = 'none';
    });
    document.getElementById('rutina-modal').addEventListener('click', function (e) {
        if (e.target === this) this.style.display = 'none';
    });
    document.getElementById('modal-guardar').addEventListener('click', function () {
        const nombre = document.getElementById('modal-nombre').value.trim();
        if (!nombre) {
            document.getElementById('modal-nombre').focus();
            return;
        }
        const ej = {
            nombre: nombre,
            tipo:   document.getElementById('modal-tipo').value,
            series: document.getElementById('modal-series').value.trim(),
            tiempo: document.getElementById('modal-tiempo').value.trim(),
            nota:   document.getElementById('modal-nota').value.trim(),
        };
        if (modalEjIdx >= 0) {
            diasData[modalDiaIdx].ejercicios[modalEjIdx] = ej;
        } else {
            diasData[modalDiaIdx].ejercicios.push(ej);
        }
        document.getElementById('rutina-modal').style.display = 'none';
        render();
    });

    // Guardar / Resetear
    document.getElementById('rutina-btn-guardar').addEventListener('click', function () {
        guardarRutina();
        const btn = this;
        btn.textContent = '✓ Guardado';
        btn.style.background = '#27ae60';
        setTimeout(function () {
            btn.innerHTML = '&#128190; Guardar rutina';
            btn.style.background = '';
        }, 1800);
    });
    document.getElementById('rutina-btn-reset').addEventListener('click', function () {
        if (confirm('\u00bfResetear toda la rutina?')) {
            diasData.forEach(function (dia) { dia.ejercicios = []; });
            render();
        }
    });

    cargarRutina();
    render();
});
