let type = "planet";
let animationId;
let animationStarted = false;
let paused = false;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 1300;
canvas.height = 700;


// Agujero negro
let hole = {
    x: 650,
    y: 350,
    m: 20000,
    r: 30
};


// Lista de astros
let circs = [];


// =====================================================
// 2. CREAR ASTROS
// =====================================================

function crearAstro(x, y, tipoAstro, velocidadPersonalizada = null) {

    let radius = 8;
    let color = "#00a2ff";
    let mass = 800;

    if (tipoAstro === "moon") {
        radius = 4;
        color = "#555555";
        mass = 50;

    } else if (tipoAstro === "star") {
        radius = 14;
        color = "#ffaa00";
        mass = 5000;
    }


    let dx = hole.x - x;
    let dy = hole.y - y;

    let dist = Math.sqrt(dx * dx + dy * dy);


    if (dist < hole.r + 10) return;


    // Velocidad automática
    let speed;

    if (velocidadPersonalizada !== null) {
        speed = velocidadPersonalizada;
    } else {
        speed = Math.sqrt(hole.m / dist) * 0.75;
    }


    // Dirección tangencial
    let vx = (-dy / dist) * speed;
    let vy = (dx / dist) * speed;


    circs.push({
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        r: radius,
        color: color,
        m: mass
    });
}


// =====================================================
// 3. FÍSICAS
// =====================================================

function actualizarFisicas() {

    let subSteps = 8;
    let dt = 1 / subSteps;


    for (let step = 0; step < subSteps; step++) {

        for (let i = 0; i < circs.length; i++) {

            let p1 = circs[i];


            // Gravedad del agujero negro
            let dxHole = hole.x - p1.x;
            let dyHole = hole.y - p1.y;

            let distHoleSq =
                dxHole * dxHole +
                dyHole * dyHole;

            let distHole = Math.sqrt(distHoleSq);


            if (distHole < 5) {
                distHole = 5;
            }


            let forceHole =
                (hole.m / distHoleSq) * dt;


            p1.vx +=
                forceHole *
                (dxHole / distHole);

            p1.vy +=
                forceHole *
                (dyHole / distHole);


            // Gravedad entre astros
            for (let j = 0; j < circs.length; j++) {

                if (i === j) continue;

                let p2 = circs[j];

                let dx = p2.x - p1.x;
                let dy = p2.y - p1.y;

                let distSq =
                    dx * dx +
                    dy * dy;

                let dist = Math.sqrt(distSq);


                if (dist < 10) {
                    dist = 10;
                }


                let forceMutua =
                    (0.5 * p2.m / distSq) * dt;


                p1.vx +=
                    forceMutua *
                    (dx / dist);

                p1.vy +=
                    forceMutua *
                    (dy / dist);
            }


            // Actualizar posición
            p1.x += p1.vx * dt;
            p1.y += p1.vy * dt;


            // Absorción por el agujero negro
            if (distHole < hole.r) {

                circs.splice(i, 1);

                i--;

                break;
            }
        }
    }
}


// =====================================================
// 4. DIBUJAR Y ANIMAR
// =====================================================

function animate() {

    if (!paused) {
        actualizarFisicas();
    }


    // Fondo
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Agujero negro
    ctx.beginPath();

    ctx.arc(
        hole.x,
        hole.y,
        hole.r,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#000000";
    ctx.fill();

    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.closePath();


    // Astros
    for (let i = 0; i < circs.length; i++) {

        let p = circs[i];

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            p.r,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = p.color;
        ctx.fill();

        ctx.closePath();
    }


    animationId = requestAnimationFrame(animate);
}


// =====================================================
// 5. MENÚ DE EXPERIMENTOS
// =====================================================

function mostrarExperimento(numero) {

    document.getElementById(
        "menuExperiments"
    ).style.display = "none";


    document.getElementById(
        "seleccionExperimento"
    ).style.display = "flex";


    let titulo =
        document.getElementById(
            "tituloExperimento"
        );

    let botones =
        document.getElementById(
            "botonesExperimento"
        );


    botones.innerHTML = "";


    // ================================================
    // EXPERIMENTO 1
    // ================================================

    if (numero === 1) {

        titulo.textContent =
            "Experiment 1 — Massa del forat negre";


        crearBoton(
            botones,
            "Massa = 9.000",
            function() {
                ejecutarExperimento1(9000);
            }
        );


        crearBoton(
            botones,
            "Massa = 20.000",
            function() {
                ejecutarExperimento1(20000);
            }
        );


        crearBoton(
            botones,
            "Massa = 50.000",
            function() {
                ejecutarExperimento1(50000);
            }
        );
    }


    // ================================================
    // EXPERIMENTO 2
    // ================================================

    if (numero === 2) {

        titulo.textContent =
            "Experiment 2 — Distància al forat negre";


        let subtituloX =
            document.createElement("h3");

        subtituloX.textContent =
            "Part X — Y constant = 350";

        botones.appendChild(subtituloX);


        crearBoton(
            botones,
            "(100, 350)",
            function() {
                ejecutarExperimento2(100, 350);
            }
        );


        crearBoton(
            botones,
            "(500, 350)",
            function() {
                ejecutarExperimento2(500, 350);
            }
        );


        crearBoton(
            botones,
            "(700, 350)",
            function() {
                ejecutarExperimento2(700, 350);
            }
        );


        let subtituloY =
            document.createElement("h3");

        subtituloY.textContent =
            "Part Y — X constant = 650";

        botones.appendChild(subtituloY);


        crearBoton(
            botones,
            "(650, 100)",
            function() {
                ejecutarExperimento2(650, 100);
            }
        );


        crearBoton(
            botones,
            "(650, 50)",
            function() {
                ejecutarExperimento2(650, 50);
            }
        );


        crearBoton(
            botones,
            "(650, 0)",
            function() {
                ejecutarExperimento2(650, 0);
            }
        );
    }


    // ================================================
    // EXPERIMENTO 3
    // ================================================

    if (numero === 3) {

        titulo.textContent =
            "Experiment 3 — Velocitat d'escapament";


        crearBoton(
            botones,
            "Variable 1 — 8,52",
            function() {
                ejecutarExperimento3(
                    100,
                    350,
                    8.52
                );
            }
        );

        crearBoton(
            botones,
            "Variable 3 — 10,69",
            function() {
                ejecutarExperimento3(
                    300,
                    350,
                    10.69
                );
            }
        );
        
        crearBoton(
            botones,
            "Variable 2 — 11,54",
            function() {
                ejecutarExperimento3(
                    650,
                    50,
                    11.54
                );
            }
        );
    }

}


// =====================================================
// 6. BOTÓN AUXILIAR
// =====================================================

function crearBoton(contenedor, texto, funcion) {

    let boton =
        document.createElement("button");

    boton.textContent = texto;

    boton.addEventListener(
        "click",
        funcion
    );

    contenedor.appendChild(boton);
}


// =====================================================
// 7. EXPERIMENTO 1
// =====================================================

function ejecutarExperimento1(masa) {

    hole.m = masa;

    circs = [];

    crearAstro(
        400,
        350,
        "planet"
    );

    iniciarSimulador();
}


// =====================================================
// 8. EXPERIMENTO 2
// =====================================================

function ejecutarExperimento2(x, y) {

    hole.m = 20000;

    circs = [];

    crearAstro(
        x,
        y,
        "planet"
    );

    iniciarSimulador();
}


// =====================================================
// 9. EXPERIMENTO 3
// =====================================================

function ejecutarExperimento3(
    x,
    y,
    velocidad
) {

    hole.m = 20000;

    circs = [];


    crearAstro(
        x,
        y,
        "planet",
        velocidad
    );


    iniciarSimulador();
}


// =====================================================
// 10. INICIAR SIMULADOR
// =====================================================

function iniciarSimulador() {

    document.getElementById(
        "seleccionExperimento"
    ).style.display = "none";


    document.getElementById(
        "simulador"
    ).style.display = "block";


    paused = false;


    if (!animationStarted) {

        animationStarted = true;

        animate();
    }
}


// =====================================================
// 11. VOLVER AL MENÚ PRINCIPAL
// =====================================================

document.getElementById(
    "menu"
).addEventListener(
    "click",
    function() {

        circs = [];

        document.getElementById(
            "simulador"
        ).style.display = "none";


        document.getElementById(
            "menuExperiments"
        ).style.display = "flex";
    }
);


// =====================================================
// 12. VOLVER AL MENÚ DE EXPERIMENTOS
// =====================================================

document.getElementById(
    "volverMenuExperimentos"
).addEventListener(
    "click",
    function() {

        document.getElementById(
            "seleccionExperimento"
        ).style.display = "none";


        document.getElementById(
            "menuExperiments"
        ).style.display = "flex";
    }
);


// =====================================================
// 13. PAUSA
// =====================================================

document.getElementById(
    "pause"
).addEventListener(
    "click",
    function() {

        paused = !paused;

        this.textContent =
            paused ? "Continuar" : "Pausa";
    }
);


// =====================================================
// 14. BOTONES DE ASTROS
// =====================================================

const botons =
    document.querySelectorAll(
        '#planet, #moon, #star'
    );


botons.forEach(
    boto => {

        boto.addEventListener(
            'click',
            function() {

                type = this.id;


                botons.forEach(
                    b => {
                        b.style.color = '';
                    }
                );


                this.style.color = 'red';
            }
        );
    }
);


// =====================================================
// 15. CREAR ASTROS HACIENDO CLICK
// =====================================================

canvas.addEventListener(
    'click',
    function(event) {

        let rect =
            canvas.getBoundingClientRect();


        let mouseX =
            (event.clientX - rect.left) *
            (canvas.width / rect.width);


        let mouseY =
            (event.clientY - rect.top) *
            (canvas.height / rect.height);


        crearAstro(
            mouseX,
            mouseY,
            type
        );
    }
);


// =====================================================
// 16. INICIO
// =====================================================

document.getElementById(
    "seleccionExperimento"
).style.display = "none";


document.getElementById(
    "simulador"
).style.display = "none";
