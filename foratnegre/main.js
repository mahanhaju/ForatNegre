// --- 1. VARIABLES GLOBALES ---
let type = "planet";
let animationId;


const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');


canvas.width = 1300;
canvas.height = 700;


// Agujero Negro masivo
let hole = { x: 650, y: 350, m: 20000, r: 30 };


let circs = [];


// --- 2. INICIALIZACIÓN ---
function init() {
  // Un planeta inicial en órbita estable
  crearAstro(400, 350, "planet");
}


// Función auxiliar para crear astros
function crearAstro(x, y, tipoAstro) {
  let radius = 8;
  let color = "#00a2ff";
  let mass = 800; // Aumentamos la masa para que la gravedad mutua se note


  if (tipoAstro === "moon") {
    radius = 4;
    color = "#555555";
    mass = 50;
  } else if (tipoAstro === "star") {
    radius = 14;
    color = "#ffaa00";
    mass = 5000; // Una estrella pesada perturbará muchísimo a los planetas
  }


  let dx = hole.x - x;
  let dy = hole.y - y;
  let dist = Math.sqrt(dx * dx + dy * dy);


  if (dist < hole.r + 10) return;


  // Velocidad inicial tangencial
  let speed = Math.sqrt(hole.m / dist) * 0.75;


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


// --- 3. MOTOR DE FÍSICAS (Gravedad Mutua Relevante) ---
function actualizarFisicas() {
  let subSteps = 8; // Más sub-pasos para mayor precisión física
  let dt = 1 / subSteps;


  for (let step = 0; step < subSteps; step++) {
    for (let i = 0; i < circs.length; i++) {
      let p1 = circs[i];


      // 1. Gravedad del Agujero Negro sobre el astro
      let dxHole = hole.x - p1.x;
      let dyHole = hole.y - p1.y;
      let distHoleSq = dxHole * dxHole + dyHole * dyHole;
      let distHole = Math.sqrt(distHoleSq);


      if (distHole < 5) distHole = 5;


      let forceHole = (hole.m / distHoleSq) * dt;
      p1.vx += forceHole * (dxHole / distHole);
      p1.vy += forceHole * (dyHole / distHole);


      // 2. GRAVEDAD MUTUA: Astro contra Astro (Aumentada para el experimento)
      for (let j = 0; j < circs.length; j++) {
        if (i === j) continue;


        let p2 = circs[j];
        let dx = p2.x - p1.x;
        let dy = p2.y - p1.y;
        let distSq = dx * dx + dy * dy;
        let dist = Math.sqrt(distSq);


        // Distancia mínima para evitar saltos infinitos por división de cero
        if (dist < 10) dist = 10;


        // Multiplicador subido a 0.5 para que la masa de p2 afecte fuertemente a p1
        let forceMutua = (0.5 * p2.m / distSq) * dt;
        p1.vx += forceMutua * (dx / dist);
        p1.vy += forceMutua * (dy / dist);
      }


      // Actualizar posición
      p1.x += p1.vx * dt;
      p1.y += p1.vy * dt;


      // Absorbido por el Agujero Negro
      if (distHole < hole.r) {
        circs.splice(i, 1);
        i--;
        break;
      }
    }
  }
}


// --- 4. RENDERIZADO Y ANIMACIÓN ---
function animate() {
  actualizarFisicas();


  // Fondo blanco con rastro suave
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);


  // Agujero Negro
  ctx.beginPath();
  ctx.arc(hole.x, hole.y, hole.r, 0, Math.PI * 2);
  ctx.fillStyle = "#000000";
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.closePath();


  // Astros
  for (let i = 0; i < circs.length; i++) {
    let p = circs[i];
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.closePath();
  }


  animationId = requestAnimationFrame(animate);
}


// --- 5. CONTROLES Y EVENTOS ---
canvas.addEventListener('click', function(event) {
  let rect = canvas.getBoundingClientRect();
  let mouseX = (event.clientX - rect.left) * (canvas.width / rect.width);
  let mouseY = (event.clientY - rect.top) * (canvas.height / rect.height);


  crearAstro(mouseX, mouseY, type);
});


// --- 5. CONTROL Y RESALTADO DE BOTONES ---
const botons = document.querySelectorAll('#planet, #moon, #star');

botons.forEach(boto => {
  boto.addEventListener('click', function() {
    type = this.id; // Guarda qué botón pulsaste

    // 1. Limpiamos el color de TODOS los botones primero
    botons.forEach(b => {
      b.style.color = ''; // Vuelve al color original
    });

    // 2. Pintamos de rojo SOLO el botón pulsado
    this.style.color = 'red';
  });
});

// --- 6. INICIAR ---
init();
animate();