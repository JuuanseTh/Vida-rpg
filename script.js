// --- INICIALIZACIÓN DE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyB-WpVyjAgZEHyfqZ9caHaS9vEQbpjSX8I",
  authDomain: "vida-rpg-f2dbf.firebaseapp.com",
  projectId: "vida-rpg-f2dbf",
  storageBucket: "vida-rpg-f2dbf.firebasestorage.app",
  messagingSenderId: "273885218531",
  appId: "1:273885218531:web:41367ac017df3c15e667d6",
  measurementId: "G-NL9EXH9GS3",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
// --- FIN DE INICIALIZACIÓN DE FIREBASE ---

// --- CONFIGURACIÓN ---
const DIFFICULTY_REWARDS = {
  Facil: { xp: 50, credits: 10, cooldownHours: 8 },
  Media: { xp: 100, credits: 20, cooldownHours: 12 },
  Dificil: { xp: 420, credits: 30, cooldownHours: 24 },
  Epica: { xp: 1000, credits: 75, cooldownHours: 168 },
};

const RANDOM_EVENTS = [
  // --- Evento 1 ---
  {
    type: "interactive",
    text: "Caminando, ves un gatito asustado en un árbol. ¡No puede bajar!",
    options: [
      { stat: "fue", text: "Intentar trepar al árbol por la fuerza." },
      { stat: "des", text: "Usar una escalera cercana con agilidad." },
      { stat: "int", text: "Trazar un plan para atraerlo con comida." },
      { stat: "car", text: "Calmar al gato con tu voz para que baje." },
    ],
    success_text: "¡Lo lograste! El dueño te ve y te da una recompensa.",
    fail_text: "¡Fallaste! El gato te araña y huye.",
    success_reward: { xp: 30, credits: 15 },
    fail_penalty: { hp: -5 },
  },
  // --- Evento 2 ---
  {
    type: "interactive",
    text: "Un mercader ambulante te ofrece un 'ítem misterioso' a un precio 'justo'.",
    options: [
      { stat: "car", text: "Regatear el precio usando tu encanto." },
      { stat: "int", text: "Evaluar el ítem en busca de señales de estafa." },
      { stat: "des", text: "Intentar tomarlo y correr (¡arriesgado!)." },
      { stat: "fue", text: "Intimidar al mercader para que baje el precio." },
    ],
    success_text: "¡Funciona! El mercader cede y te lo da más barato.",
    fail_text: "No funciona. El mercader se ofende y sube el precio.",
    success_reward: { xp: 10, credits: -10 }, // Ganas XP pero pagas
    fail_penalty: { credits: -25 }, // Pagas más
  },
  // --- Evento 3 ---
  {
    type: "interactive",
    text: "Ves un cofre viejo y cerrado en un callejón.",
    options: [
      { stat: "fue", text: "Romper el candado a la fuerza." },
      { stat: "des", text: "Intentar forzar la cerradura con agilidad." },
      {
        stat: "int",
        text: "Examinar el cofre en busca de un mecanismo oculto.",
      },
      {
        stat: "car",
        text: "Preguntar al dueño de la tienda cercana si sabe la combinación.",
      },
    ],
    success_text: "¡Se abre! Dentro encuentras un pequeño tesoro.",
    fail_text: "¡Haces mucho ruido! El candado no cede y tienes que irte.",
    success_reward: { xp: 10, credits: 40 },
    fail_penalty: { hp: 0 },
  },
  // --- Evento 4 ---
  {
    type: "interactive",
    text: "Estás en una cafetería y dos personas discuten en la mesa de al lado. La situación es tensa.",
    options: [
      {
        stat: "fue",
        text: "Ponerte en medio con autoridad para intimidarlos.",
      },
      {
        stat: "des",
        text: "Derramar 'accidentalmente' un vaso de agua para distraerlos.",
      },
      {
        stat: "int",
        text: "Analizar la discusión y proponer una solución lógica.",
      },
      {
        stat: "car",
        text: "Intervenir amablemente y mediar en la conversación.",
      },
    ],
    success_text: "Logras calmar la situación. El dueño te invita a un café.",
    fail_text: "Empeoras las cosas. Te gritan y tienes que irte.",
    success_reward: { xp: 25, hp: 5 },
    fail_penalty: { hp: -5 },
  },
  // --- Evento 5 ---
  {
    type: "interactive",
    text: "Un perro grande te bloquea el camino en un callejón, gruñendo.",
    options: [
      { stat: "fue", text: "Plantarle cara y gritarle para asustarlo." },
      {
        stat: "des",
        text: "Esquivarlo rápidamente y saltar una valla cercana.",
      },
      {
        stat: "int",
        text: "Quedarte quieto, evitando el contacto visual (comportamiento canino).",
      },
      {
        stat: "car",
        text: "Hablarle en tono calmado y suave para tranquilizarlo.",
      },
    ],
    success_text: "El perro se relaja y te deja pasar, moviendo la cola.",
    fail_text: "El perro se altera más y te muerde el tobillo.",
    success_reward: { xp: 30 },
    fail_penalty: { hp: -10 },
  },

  // --- Eventos Especiales ---
  {
    type: "obstacle",
    text: "Sientes un bloqueo mental... ¡Un Obstáculo ha aparecido!",
    obstacle: "Procrastinación",
  },
  {
    type: "mission",
    text: "¡Un NPC te pide ayuda urgente!",
    mission: {
      title: "(EVENTO) Ayuda rápida",
      difficulty: "Facil",
      projectLink: null,
    },
  },
];

const OBSTACLES = {
  Procrastinación: {
    name: "Procrastinación",
    hp: 300,
    debuff: { type: "xp_reduction", value: 0.25 },
    description: "Efecto: -25% XP de todas las misiones.",
  },
};

const SKILL_TREE = {
  fue: [
    { id: "f1", req: 15, title: "Fortaleza", desc: "Pasivo: +20 HP Máximo." },
  ],
  int: [
    {
      id: "i1",
      req: 15,
      title: "Erudito",
      desc: "Pasivo: +10% XP de todas las misiones.",
    },
  ],
  des: [
    {
      id: "d1",
      req: 15,
      title: "Comerciante",
      desc: "Pasivo: +10% Créditos de todas las misiones.",
    },
  ],
  car: [
    {
      id: "c1",
      req: 15,
      title: "Carisma",
      desc: "Pasivo: -10% de precios en la Tienda.",
    },
  ],
};

const COMPANION_RARITIES = {
  Común: { color: "Gris", id: 1 },
  "Poco Común": { color: "Naranja", id: 2 },
  Raro: { color: "Blanco y Negro", id: 3 },
  Épico: { color: "Marrón", id: 4 },
};

// --- DATOS INICIALES ---
const INITIAL = {
  player: {
    name: "Player",
    level: 1,
    hp: 100,
    maxHp: 100,
    xp: 0,
    xptnl: 100,
    credits: 0,
    diary: ["¡Tu aventura comienza!"],
    totalMissionsDone: 0,
    totalHabitsFailed: 0,
    lastRandomEvent: null,
    lastCasinoVisit: null,
    attributePoints: 0,
    attributes: { fue: 10, int: 10, des: 10, car: 10 },
    skills: { f1: false, i1: false, d1: false, c1: false },
    equipment: { amulet: null, tool: null, book: null },
    inventory: [],
    activeObstacle: null,
    gemas: 0,

    // --- COMPAÑERO ---
    companion: {
      name: "Michi",
      rarity: "Común",
      color: "Gris",
      energy: 100,
      maxEnergy: 100,
      onExpedition: false,
      expeditionEnds: null,
      mimosToday: 0,
      lastMimoReset: new Date().toDateString(),
    },

    // --- DATOS DE LOGIN ---
    lastLoginDate: null,
    loginStreak: 0,
  }, // <-- Esta es la llave de cierre de 'player'
  // --- LISTA COMPLETA DE 40 MISIONES ---
  missions: [
    // ... (Tu lista de misiones va aquí, no la modifico) ...
    // Guerrero (10) - Proyecto 1
    {
      id: 1,
      title: "(Guerrero) 10 Flexiones",
      difficulty: "Facil",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Facil"],
      cooldownHours: 8,
      completedAt: null,
      projectLink: 1,
      projectPoints: 10,
    },
    {
      id: 2,
      title: "(Guerrero) 20 Sentadillas",
      difficulty: "Facil",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Facil"],
      cooldownHours: 8,
      completedAt: null,
      projectLink: 1,
      projectPoints: 10,
    },
    {
      id: 3,
      title: "(Guerrero) 30 min Caminata Rápida",
      difficulty: "Media",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Media"],
      cooldownHours: 12,
      completedAt: null,
      projectLink: 1,
      projectPoints: 20,
    },
    {
      id: 4,
      title: "(Guerrero) 30 Abdominales",
      difficulty: "Facil",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Facil"],
      cooldownHours: 8,
      completedAt: null,
      projectLink: 1,
      projectPoints: 10,
    },
    {
      id: 5,
      title: "(Guerrero) 30 min Estiramiento/Yoga",
      difficulty: "Media",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Media"],
      cooldownHours: 12,
      completedAt: null,
      projectLink: 1,
      projectPoints: 15,
    },
    {
      id: 6,
      title: "(Guerrero) Subir 10 pisos por escalera",
      difficulty: "Dificil",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Dificil"],
      cooldownHours: 24,
      completedAt: null,
      projectLink: 1,
      projectPoints: 30,
    },
    {
      id: 7,
      title: "(Guerrero) 1 hora de Ciclismo/Trote",
      difficulty: "Dificil",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Dificil"],
      cooldownHours: 24,
      completedAt: null,
      projectLink: 1,
      projectPoints: 40,
    },
    {
      id: 8,
      title: "(Guerrero) Rutina de Fuerza (Gym/Casa) 45 min",
      difficulty: "Dificil",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Dificil"],
      cooldownHours: 24,
      completedAt: null,
      projectLink: 1,
      projectPoints: 40,
    },
    {
      id: 9,
      title: "(Guerrero) 10 min Salto de Cuerda (Comba)",
      difficulty: "Media",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Media"],
      cooldownHours: 12,
      completedAt: null,
      projectLink: 1,
      projectPoints: 20,
    },
    {
      id: 10,
      title: "(Guerrero) 5km Carrera (Running)",
      difficulty: "Epica",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Epica"],
      cooldownHours: 168,
      completedAt: null,
      projectLink: 1,
      projectPoints: 100,
    },

    // Sabio (10) - Proyecto 2 (11-15)
    {
      id: 11,
      title: "(Sabio) 15 min App de Idioma (Duolingo, etc.)",
      difficulty: "Facil",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Facil"],
      cooldownHours: 8,
      completedAt: null,
      projectLink: 2,
      projectPoints: 10,
    },
    {
      id: 12,
      title: "(Sabio) 30 min lección de idioma (Curso/Video)",
      difficulty: "Media",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Media"],
      cooldownHours: 12,
      completedAt: null,
      projectLink: 2,
      projectPoints: 20,
    },
    {
      id: 13,
      title: "(Sabio) Ver 1 episodio de serie en idioma original",
      difficulty: "Media",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Media"],
      cooldownHours: 12,
      completedAt: null,
      projectLink: 2,
      projectPoints: 15,
    },
    {
      id: 14,
      title: "(Sabio) Escribir un párrafo en nuevo idioma",
      difficulty: "Facil",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Facil"],
      cooldownHours: 8,
      completedAt: null,
      projectLink: 2,
      projectPoints: 15,
    },
    {
      id: 15,
      title: "(Sabio) Conversar 10 min con un nativo/compañero",
      difficulty: "Dificil",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Dificil"],
      cooldownHours: 24,
      completedAt: null,
      projectLink: 2,
      projectPoints: 40,
    },
    {
      id: 16,
      title: "(Sabio) Leer 1 capítulo de un libro",
      difficulty: "Facil",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Facil"],
      cooldownHours: 8,
      completedAt: null,
      projectLink: null,
    },
    {
      id: 17,
      title: "(Sabio) Meditar 10 minutos",
      difficulty: "Facil",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Facil"],
      cooldownHours: 8,
      completedAt: null,
      projectLink: null,
    },
    {
      id: 18,
      title: "(Sabio) Estudiar un tema nuevo 30 min (no-idioma)",
      difficulty: "Media",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Media"],
      cooldownHours: 12,
      completedAt: null,
      projectLink: null,
    },
    {
      id: 19,
      title: "(Sabio) Completar un módulo de curso online",
      difficulty: "Dificil",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Dificil"],
      cooldownHours: 24,
      completedAt: null,
      projectLink: null,
    },
    {
      id: 20,
      title: "(Sabio) Escribir en un diario personal (reflexión)",
      difficulty: "Facil",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Facil"],
      cooldownHours: 8,
      completedAt: null,
      projectLink: null,
    },

    // Artesano (10)
    {
      id: 21,
      title: "(Artesano) Limpiar el escritorio",
      difficulty: "Facil",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Facil"],
      cooldownHours: 8,
      completedAt: null,
      projectLink: null,
    },
    {
      id: 22,
      title: "(Artesano) Lavar los platos",
      difficulty: "Facil",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Facil"],
      cooldownHours: 8,
      completedAt: null,
      projectLink: null,
    },
    {
      id: 23,
      title: "(Artesano) Tender la cama al despertar",
      difficulty: "Facil",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Facil"],
      cooldownHours: 8,
      completedAt: null,
      projectLink: null,
    },
    {
      id: 24,
      title: "(Artesano) Organizar una habitación",
      difficulty: "Media",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Media"],
      cooldownHours: 12,
      completedAt: null,
      projectLink: null,
    },
    {
      id: 25,
      title: "(Artesano) Limpieza profunda (Baño/Cocina)",
      difficulty: "Dificil",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Dificil"],
      cooldownHours: 24,
      completedAt: null,
      projectLink: null,
    },
    {
      id: 26,
      title: "(Artesano) Cocinar una comida completa (no snacks)",
      difficulty: "Media",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Media"],
      cooldownHours: 12,
      completedAt: null,
      projectLink: null,
    },
    {
      id: 27,
      title: "(Artesano) Practicar un hobby (dibujo, música) 30 min",
      difficulty: "Media",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Media"],
      cooldownHours: 12,
      completedAt: null,
      projectLink: null,
    },
    {
      id: 28,
      title: "(Artesano) Arreglar algo roto en casa",
      difficulty: "Dificil",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Dificil"],
      cooldownHours: 24,
      completedAt: null,
      projectLink: null,
    },
    {
      id: 29,
      title: "(Artesano) Planificar las comidas de la semana",
      difficulty: "Media",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Media"],
      cooldownHours: 168,
      completedAt: null,
      projectLink: null,
    },
    {
      id: 30,
      title: "(Artesano) Proyecto de fin de semana (Pintar, armar mueble)",
      difficulty: "Epica",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Epica"],
      cooldownHours: 168,
      completedAt: null,
      projectLink: null,
    },

    // Social (10)
    {
      id: 31,
      title: "(Social) Enviar mensaje de 'cómo estás' a un amigo",
      difficulty: "Facil",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Facil"],
      cooldownHours: 8,
      completedAt: null,
      projectLink: null,
    },
    {
      id: 32,
      title: "(Social) Llamar a un familiar/amigo (solo por charlar)",
      difficulty: "Media",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Media"],
      cooldownHours: 12,
      completedAt: null,
      projectLink: null,
    },
    {
      id: 33,
      title: "(Social) Hacer un cumplido genuino a alguien",
      difficulty: "Facil",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Facil"],
      cooldownHours: 8,
      completedAt: null,
      projectLink: null,
    },
    {
      id: 34,
      title: "(Social) Salir a un café / Cita / Picnic",
      difficulty: "Media",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Media"],
      cooldownHours: 12,
      completedAt: null,
      projectLink: null,
    },
    {
      id: 35,
      title: "(Social) Asistir a un evento social (Fiesta, reunión)",
      difficulty: "Dificil",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Dificil"],
      cooldownHours: 24,
      completedAt: null,
      projectLink: null,
    },
    {
      id: 36,
      title: "(Social) Conocer a alguien nuevo",
      difficulty: "Dificil",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Dificil"],
      cooldownHours: 24,
      completedAt: null,
      projectLink: null,
    },
    {
      id: 37,
      title: "(Social) Escuchar activamente a alguien (sin interrumpir)",
      difficulty: "Facil",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Facil"],
      cooldownHours: 8,
      completedAt: null,
      projectLink: null,
    },
    {
      id: 38,
      title: "(Social) Organizar una reunión o salida",
      difficulty: "Dificil",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Dificil"],
      cooldownHours: 24,
      completedAt: null,
      projectLink: null,
    },
    {
      id: 39,
      title: "(Social) Hacer voluntariado",
      difficulty: "Epica",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Epica"],
      cooldownHours: 168,
      completedAt: null,
      projectLink: null,
    },
    {
      id: 40,
      title: "(Social) Tener una conversación profunda (vulnerable)",
      difficulty: "Media",
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS["Media"],
      cooldownHours: 12,
      completedAt: null,
      projectLink: null,
    },
  ],
  // --- TIENDA ---
  store: [
    {
      id: 1,
      item: "Poción de Salud (+50 HP)",
      price: 25,
      type: "consumable",
      effect: { hp: 50 },
      slot: null,
    },
    {
      id: 2,
      item: "Pergamino de XP (+100 XP)",
      price: 50,
      type: "consumable",
      effect: { xp: 100 },
      slot: null,
    },
    {
      id: 3,
      item: "Amuleto de Salud (+10 Max HP)",
      price: 200,
      type: "permanent",
      effect: { maxHp: 10 },
      slot: "amulet",
    },
    {
      id: 4,
      item: "Pluma del Sabio (+5% XP)",
      price: 300,
      type: "permanent",
      effect: { xp_bonus: 0.05 },
      slot: "tool",
    },
    {
      id: 5,
      item: "Catnip Premium (Mejorar Gato)",
      price: 700,
      type: "consumable",
      effect: { upgrade_companion: 1 },
      slot: null,
    },
    {
      id: 6,
      item: "Comida de Gato (+50 Energía)",
      price: 15,
      type: "consumable",
      effect: { companion_energy: 50 },
      slot: null,
    },
  ],
  projects: [
    {
      id: 1,
      title: "Proyecto: Ponerse en Forma (Largo Plazo)",
      description: "Se completa haciendo misiones de (Guerrero).",
      currentPoints: 0,
      totalPoints: 1000,
      reward: { xp: 5000, credits: 300, attributePoints: 1 },
    },
    {
      id: 2,
      title: "Proyecto: Aprender un Idioma (Nivel Básico)",
      description: "Se completa haciendo misiones de (Sabio) de estudio.",
      currentPoints: 0,
      totalPoints: 500,
      reward: { xp: 2500, credits: 150, attributePoints: 1 },
    },
  ],
  habits: [
    {
      id: 1,
      title: "Beber Vaso de Agua",
      desc: "+1 HP por vaso",
      countToday: 0,
      reward: { hp: 1, xp: 0 },
      penalty: { hp: 0 },
    },
    {
      id: 2,
      title: "Pausa Activa",
      desc: "Estirarse 1 min (+1 HP, +1 XP)",
      countToday: 0,
      reward: { hp: 1, xp: 1 },
      penalty: { hp: 0 },
    },
    {
      id: 3,
      title: "Comida",
      desc: "+5 HP (Saludable) / -5 HP (Chatarra)",
      countToday: 0,
      reward: { hp: 5 },
      penalty: { hp: -5 },
    },
  ],
  system: {
    lastHabitReset: new Date().toDateString(),
    adminMode: true,
    unlockedThemes: {
      "theme-light": false,
      "theme-forest": false,
    },
    activeTheme: "", // Guardar el tema activo
  },
  // --- LOGROS ---
  achievements: [
    // ... (Tu lista de logros va aquí, no la modifico) ...
    {
      id: 1,
      title: "Primeros Pasos",
      description: "Completa tu primera misión.",
      unlocked: false,
      hidden: false,
    },
    {
      id: 2,
      title: "Aprendiz",
      description: "Llega al Nivel 2.",
      unlocked: false,
      hidden: false,
    },
    {
      id: 3,
      title: "Aspirante a Guerrero",
      description: "Completa tu primera misión de (Guerrero).",
      unlocked: false,
      hidden: false,
    },
    {
      id: 4,
      title: "Aspirante a Sabio",
      description: "Completa tu primera misión de (Sabio).",
      unlocked: false,
      hidden: false,
    },
    {
      id: 5,
      title: "Manos a la Obra",
      description: "Completa tu primera misión de (Artesano).",
      unlocked: false,
      hidden: false,
    },
    {
      id: 6,
      title: "Mariposa Social",
      description: "Completa tu primera misión de (Social).",
      unlocked: false,
      hidden: false,
    },
    {
      id: 7,
      title: "Comprador",
      description: "Compra tu primer ítem en la Tienda.",
      unlocked: false,
      hidden: false,
    },
    {
      id: 8,
      title: "Equipado",
      description: "Equipa tu primer ítem en un slot.",
      unlocked: false,
      hidden: false,
    },
    {
      id: 9,
      title: "Habilidoso",
      description: "Gasta tu primer Punto de Atributo (PA).",
      unlocked: false,
      hidden: false,
    },
    {
      id: 10,
      title: "Especialista",
      description: "Desbloquea tu primera Habilidad pasiva.",
      unlocked: false,
      hidden: false,
    },
    {
      id: 11,
      title: "Mata-Monstruos",
      description: "Derrota a tu primer Obstáculo.",
      unlocked: false,
      hidden: true,
    },
    {
      id: 12,
      title: "Arquitecto",
      description: "Completa tu primer Proyecto.",
      unlocked: false,
      hidden: true,
    },
    {
      id: 13,
      title: "Aventurero",
      description: "Usa el botón de Evento Aleatorio por primera vez.",
      unlocked: false,
      hidden: true,
    },
    {
      id: 14,
      title: "Eso duele",
      description: "Falla un hábito (botón '-') por primera vez.",
      unlocked: false,
      hidden: true,
    },
    {
      id: 15,
      title: "Nivel 5",
      description: "Alcanza el Nivel 5 del jugador.",
      unlocked: false,
      hidden: true,
    },
  ],
  // --- ESTADO DEL CASINO ---
  casinoGame: {
    active: false,
    pot: 0,
    round: 0,
  },
};

// --- PESTAÑAS (TABS) ---
const TABS = [
  "Player",
  "Habilidades",
  "Compañero",
  "Minijuego",
  "Missions",
  "Foso",
  "Proyectos",
  "Inventario",
  "Store",
  "Casino",
  "Habits",
  "Achievements",
  "Leaderboard",
  "Configuración",
];
const tabsEl = document.getElementById("tabs");
const contentEl = document.getElementById("tab-content");

// --- CARGA DE ESTADO (STATE) ---
const savedState = JSON.parse(localStorage.getItem("vida_rpg_state") || "null");

function mergeDeep(target, source) {
  const isObject = (obj) =>
    obj && typeof obj === "object" && !Array.isArray(obj);
  if (!isObject(target) || !isObject(source)) return source;
  Object.keys(source).forEach((key) => {
    const targetValue = target[key];
    const sourceValue = source[key];
    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      target[key] =
        savedState && savedState[key] ? savedState[key] : sourceValue;
    } else if (isObject(targetValue) && isObject(sourceValue)) {
      target[key] = mergeDeep(Object.assign({}, targetValue), sourceValue);
    } else {
      target[key] = sourceValue;
    }
  });
  return target;
}

let state = mergeDeep(JSON.parse(JSON.stringify(INITIAL)), savedState || {});

// Forzar siempre la actualización de datos que no deben guardarse entre sesiones o que cambian
state.store = INITIAL.store;
state.achievements = INITIAL.achievements;
if (!state.system.unlockedThemes)
  state.system.unlockedThemes = INITIAL.system.unlockedThemes;

// Asegurar que campos nuevos existan
if (!state.casinoGame) state.casinoGame = INITIAL.casinoGame;
if (!state.player.companion) state.player.companion = INITIAL.player.companion;
if (!state.player.lastCasinoVisit)
  state.player.lastCasinoVisit = INITIAL.player.lastCasinoVisit;
if (state.player.companion.mimosToday === undefined)
  state.player.companion.mimosToday = 0;
if (!state.player.companion.lastMimoReset)
  state.player.companion.lastMimoReset = new Date().toDateString();
if (state.player.loginStreak === undefined) state.player.loginStreak = 0;
if (!state.player.lastLoginDate) state.player.lastLoginDate = null;
if (state.system.activeTheme === undefined) state.system.activeTheme = "";

// Recalcular Max HP al cargar
state.player.maxHp =
  100 + state.player.attributes.fue * 5 + (state.player.skills.f1 ? 20 : 0);
Object.values(state.player.equipment).forEach((item) => {
  if (item && item.effect.maxHp) state.player.maxHp += item.effect.maxHp;
});

// Aplicar el tema guardado al cargar
if (state.system.activeTheme) {
  document.body.className = state.system.activeTheme;
}

function saveState() {
  localStorage.setItem("vida_rpg_state", JSON.stringify(state));
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatTime(ms) {
  if (ms <= 0) return "Listo";
  const h = Math.floor(ms / (1000 * 60 * 60));
  const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((ms % (1000 * 60)) / 1000);
  return `${h}h ${m}m ${s}s`;
}

// --- NÚCLEO: APLICAR EFECTOS ---
function applyEffect(effect) {
  // 1. BUFFS / DEBUFFS
  let xp_bonus = 0;
  let credits_bonus = 0;

  xp_bonus += (state.player.attributes.int - 10) * 0.005;
  credits_bonus += (state.player.attributes.des - 10) * 0.005;

  if (state.player.skills.i1) xp_bonus += 0.1;
  if (state.player.skills.d1) credits_bonus += 0.1;

  Object.values(state.player.equipment).forEach((item) => {
    if (item && item.effect.xp_bonus) xp_bonus += item.effect.xp_bonus;
  });

  if (state.player.activeObstacle?.debuff.type === "xp_reduction") {
    xp_bonus -= state.player.activeObstacle.debuff.value;
  }

  // 2. APLICAR VALORES
  if (effect.xp) {
    state.player.xp += Math.round(effect.xp * (1 + xp_bonus));
  }
  if (effect.hp) {
    state.player.hp += effect.hp;
    if (state.player.hp > state.player.maxHp)
      state.player.hp = state.player.maxHp;
    if (state.player.hp < 0) state.player.hp = 0;
  }
  if (effect.credits) {
    state.player.credits += Math.round(effect.credits * (1 + credits_bonus));
  }
  if (effect.maxHp) {
    // Para equipo
    state.player.maxHp += effect.maxHp;
    state.player.hp += effect.maxHp;
  }
  if (effect.attributePoints) {
    state.player.attributePoints += effect.attributePoints;
  }
  if (effect.gemas) {
    state.player.gemas = (state.player.gemas || 0) + effect.gemas;
  }

  // Efectos de Compañero
  if (effect.companion_energy) {
    state.player.companion.energy += effect.companion_energy;
    if (state.player.companion.energy > state.player.companion.maxEnergy) {
      state.player.companion.energy = state.player.companion.maxEnergy;
    }
  }
}

// --- MEJORA UX: Sistema de Notificaciones (Toast) ---
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`; // 'info', 'success', 'error'
  toast.textContent = message;

  container.appendChild(toast);

  // Auto-destruir la notificación
  setTimeout(() => {
    toast.style.opacity = 0;
    toast.style.transform = "translateX(100%)";
    setTimeout(() => toast.remove(), 500); // Esperar que la animación de salida termine
  }, 3000); // 3 segundos
}

// --- MEJORA UX: Sistema de Ventana Modal ---
const modalOverlay = document.getElementById("modal-overlay");
const modalTitle = document.getElementById("modal-title");
const modalText = document.getElementById("modal-text");
const modalOptions = document.getElementById("modal-options");

function showModal(title, text, options = []) {
  modalTitle.textContent = title;
  modalText.textContent = text;
  modalOptions.innerHTML = ""; // Limpiar opciones anteriores

  if (options.length === 0) {
    // Si no hay opciones, mostrar un botón de "Cerrar" por defecto
    const closeButton = document.createElement("button");
    closeButton.className = "button";
    closeButton.textContent = "Cerrar";
    closeButton.onclick = hideModal;
    modalOptions.appendChild(closeButton);
  } else {
    // Crear botones para cada opción
    options.forEach((opt) => {
      const button = document.createElement("button");
      button.className = "button";
      button.textContent = opt.text;
      button.onclick = () => {
        if (opt.callback) {
          opt.callback(); // Ejecutar la lógica del botón
        }
        hideModal(); // Cerrar el modal
      };
      modalOptions.appendChild(button);
    });
  }

  modalOverlay.style.display = "flex";
  // Las animaciones de entrada se manejan por CSS
}

function hideModal() {
  modalOverlay.style.display = "none";
}

function renderTabs() {
  tabsEl.innerHTML = "";
  TABS.forEach((tab) => {
    const btn = document.createElement("button");
    btn.className = "tab" + (tab === "Player" ? " active" : "");
    btn.textContent = tab;
    btn.onclick = () => {
      document
        .querySelectorAll(".tab")
        .forEach((t) => t.classList.remove("active"));
      btn.classList.add("active");
      renderTab(tab);
    };
    tabsEl.appendChild(btn);
  });
}

// --- RENDER: Pestaña Player (con Mimar) ---
function renderPlayerTab() {
  // Evento Aleatorio
  const EVENT_COOLDOWN_MS = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const lastEvent = state.player.lastRandomEvent || 0;
  const eventTimeSinceLast = now - lastEvent;
  const eventCooldownLeft = EVENT_COOLDOWN_MS - eventTimeSinceLast;
  const isEventReady = eventTimeSinceLast >= EVENT_COOLDOWN_MS;

  let eventButtonHtml = "";
  if (isEventReady) {
    eventButtonHtml = `<button class="button" id="btn-random-event">Evento Aleatorio (Listo)</button>`;
  } else {
    eventButtonHtml = `<button class="button" id="btn-random-event" disabled>Evento Aleatorio (Faltan ${formatTime(
      eventCooldownLeft
    )})</button>`;
  }

  // Mimos
  checkMimoReset(); // Resetear si es nuevo día
  const mimosLeft = 5 - state.player.companion.mimosToday;
  const canMimar = mimosLeft > 0;

  contentEl.innerHTML = `
       <h2>Ficha del jugador</h2>
       <div style="display:grid;grid-template-columns: 1fr 1fr;gap:12px;margin-top:14px">
         <div>
           <label>Nombre</label>
           <input type="text" id="f-name" style="width:100%" value="${escapeHtml(
             state.player.name
           )}">
         </div>
         <div>
           <label>Nivel</label>
           <div class="value">${state.player.level}</div>
         </div>
         <div>
           <label>Créditos</label>
           <div class="value">${state.player.credits}</div>
         </div>
         <div>
           <label>Puntos de Atributo</label>
           <div class="value" style="color:var(--accent2)">${
             state.player.attributePoints
           }</div>
         </div>
       </div>
       
       <div class="equipment-slots">
         <h4>Equipamiento</h4>
         <div class="equipment-slot">
           <span class="name">Amuleto:</span>
           <span class="item" id="slot-amulet">${
             state.player.equipment.amulet?.item || "Vacío"
           }</span>
         </div>
         <div class="equipment-slot">
           <span class="name">Herramienta:</span>
           <span class="item" id="slot-tool">${
             state.player.equipment.tool?.item || "Vacío"
           }</span>
         </div>
         <div class="equipment-slot">
           <span class="name">Libro:</span>
           <span class="item" id="slot-book">${
             state.player.equipment.book?.item || "Vacío"
           }</span>
         </div>
       </div>
       
       <div class="mimar-section">
         <span class="companion-icon">🐱</span>
         <div>
           <label>Tu Compañero: ${state.player.companion.name} (${
    state.player.companion.color
  })</label>
           <button class="button" id="btn-mimar" ${
             canMimar ? "" : "disabled"
           }>Mimar (+1 XP)</button>
           <span style="color:var(--muted); font-size: 13px;">(${mimosLeft} restantes hoy)</span>
         </div>
       </div>
       
       <hr style="border:1px solid var(--card-light); margin: 20px 0;">
       <button class="button" id="btn-save-player">Guardar Nombre</button>
       <div>
         <label>Evento Aleatorio (Cada 24h)</label>
         ${eventButtonHtml}
       </div>
     `;

  document.getElementById("btn-save-player").onclick = () => {
    state.player.name = document.getElementById("f-name").value;
    saveState();
    renderAll();
    showToast("Nombre guardado.", "success");
  };

  if (document.getElementById("btn-random-event") && isEventReady) {
    document.getElementById("btn-random-event").onclick = () => {
      triggerRandomEvent();
    };
  }

  if (document.getElementById("btn-mimar") && canMimar) {
    document.getElementById("btn-mimar").onclick = () => {
      mimarGato();
    };
  }
}

// --- LÓGICA MIMAR GATO ---
function checkMimoReset() {
  const today = new Date().toDateString();
  if (state.player.companion.lastMimoReset !== today) {
    state.player.companion.mimosToday = 0;
    state.player.companion.lastMimoReset = today;
  }
}

function mimarGato() {
  checkMimoReset();
  if (state.player.companion.mimosToday >= 5) return;

  state.player.companion.mimosToday++;
  applyEffect({ xp: 1 });
  state.player.diary.push(
    `¡Le das mimos a ${state.player.companion.name}! (+1 XP)`
  );

  saveState();
  renderAll();
  renderTab("Player");
}

// --- RENDER: Pestaña Habilidades ---
function renderHabilidadesTab() {
  let pa = state.player.attributePoints;
  let attr = state.player.attributes;

  let html = `<h2>🧠 Habilidades y Atributos</h2>
       <p style="color:var(--muted); margin-top: 4px;">Puntos de Atributo (PA) disponibles: <b style="color:var(--accent2); font-size: 20px;">${pa}</b></p>
       
       <div class="skills-container">
         <div class="attribute-tree">
           <div class="attribute-header">
             <h3 class="fue">Fuerza (FUE)</h3>
             <div class="attribute-points-spend">
               <span>${attr.fue}</span>
               <button class="habit-btn" onclick="spendAttributePoint('fue')" ${
                 pa > 0 ? "" : "disabled"
               }>+</button>
             </div>
           </div>
           <p style="font-size: 13px; color: var(--muted); margin-top: 5px;">+5 HP Máx por punto.</p>
           <div class="skill-list">
             ${renderSkill(SKILL_TREE.fue[0], attr.fue, "f1")}
           </div>
         </div>
         
         <div class="attribute-tree">
           <div class="attribute-header">
             <h3 class="int">Inteligencia (INT)</h3>
             <div class="attribute-points-spend">
               <span>${attr.int}</span>
               <button class="habit-btn" onclick="spendAttributePoint('int')" ${
                 pa > 0 ? "" : "disabled"
               }>+</button>
             </div>
           </div>
           <p style="font-size: 13px; color: var(--muted); margin-top: 5px;">+0.5% XP por punto.</p>
           <div class="skill-list">
             ${renderSkill(SKILL_TREE.int[0], attr.int, "i1")}
           </div>
         </div>
         
         <div class="attribute-tree">
           <div class="attribute-header">
             <h3 class="des">Destreza (DES)</h3>
             <div class="attribute-points-spend">
               <span>${attr.des}</span>
               <button class="habit-btn" onclick="spendAttributePoint('des')" ${
                 pa > 0 ? "" : "disabled"
               }>+</button>
             </div>
           </div>
           <p style="font-size: 13px; color: var(--muted); margin-top: 5px;">+0.5% Créditos por punto.</p>
           <div class="skill-list">
             ${renderSkill(SKILL_TREE.des[0], attr.des, "d1")}
           </div>
         </div>
         
         <div class="attribute-tree">
           <div class="attribute-header">
             <h3 class="car">Carisma (CAR)</h3>
             <div class="attribute-points-spend">
               <span>${attr.car}</span>
               <button class="habit-btn" onclick="spendAttributePoint('car')" ${
                 pa > 0 ? "" : "disabled"
               }>+</button>
             </div>
           </div>
           <p style="font-size: 13px; color: var(--muted); margin-top: 5px;">-0.5% Precios en Tienda por punto.</p>
           <div class="skill-list">
             ${renderSkill(SKILL_TREE.car[0], attr.car, "c1")}
           </div>
         </div>
       </div>
     `;
  contentEl.innerHTML = html;
}

function renderSkill(skill, attrLevel, skillKey) {
  let className = "skill";
  let action = "";
  if (state.player.skills[skillKey]) {
    className += " unlocked";
  } else if (attrLevel >= skill.req) {
    className += " can-buy";
    action = `onclick="buySkill('${skillKey}', ${skill.req})"`;
  }

  return `
       <div class="${className}" ${action}>
         <h4>${skill.title}</h4>
         <p>${skill.desc}</p>
         <p style="color:var(--muted); font-size: 12px;">Requiere: ${
           skill.req
         } ${
    skillKey === "i1"
      ? "INT"
      : skillKey === "f1"
      ? "FUE"
      : skillKey === "d1"
      ? "DES"
      : "CAR"
  }</p>
       </div>
     `;
}

function spendAttributePoint(attr) {
  if (state.player.attributePoints <= 0) return;
  state.player.attributePoints--;
  state.player.attributes[attr]++;

  if (attr === "fue") {
    recalculateMaxHp();
  }

  checkAchievements(null, "spend_pa");

  saveState();
  renderAll();
  renderTab("Habilidades");
}

function buySkill(skillKey, req) {
  const attrKey =
    skillKey.substring(0, 1) === "i"
      ? "int"
      : skillKey.substring(0, 1) === "f"
      ? "fue"
      : skillKey.substring(0, 1) === "d"
      ? "des"
      : "car";
  if (state.player.skills[skillKey] || state.player.attributes[attrKey] < req)
    return;

  state.player.skills[skillKey] = true;

  if (skillKey === "f1") {
    recalculateMaxHp();
  }

  const msg = `¡Habilidad desbloqueada: ${SKILL_TREE[attrKey][0].title}!`;
  state.player.diary.push(msg);
  showToast(msg, "success");

  checkAchievements(null, "buy_skill");

  saveState();
  renderAll();
  renderTab("Habilidades");
}

function recalculateMaxHp() {
  let newMax = 100; // Base
  newMax += state.player.attributes.fue * 5; // Por Fuerza
  if (state.player.skills.f1) newMax += 20; // Habilidad

  Object.values(state.player.equipment).forEach((item) => {
    if (item && item.effect.maxHp) newMax += item.effect.maxHp;
  });

  let diff = newMax - state.player.maxHp;
  state.player.maxHp = newMax;
  if (diff > 0) state.player.hp += diff;
  if (state.player.hp > state.player.maxHp)
    state.player.hp = state.player.maxHp;
}

// --- RENDER: Pestaña Compañero ---
function renderCompañeroTab() {
  const comp = state.player.companion;
  const energyPct = (comp.energy / comp.maxEnergy) * 100;

  let html = `<h2>🐱 Compañero</h2>
       <div class="companion-header">
         <div class="companion-icon">🐱</div>
         <div>
           <div class="companion-name">${escapeHtml(comp.name)}</div>
           <div class="rarity-${comp.rarity.replace(" ", "-")}">${
    comp.color
  } (${comp.rarity})</div>
         </div>
       </div>
       
       <div class="stat">
         <label>Energía</label>
         <div class="value">${comp.energy} / ${comp.maxEnergy}</div>
         <div class="energy-bar"><div class="energy-bar-inner" style="width: ${energyPct}%"></div></div>
       </div>
     `;

  if (comp.onExpedition) {
    const timeLeft = comp.expeditionEnds - Date.now();
    html += `
         <div style="margin-top: 20px;">
           <p>¡${comp.name} está en una expedición!</p>
           <p style="color:var(--muted); font-size: 14px;">Volverá en: ${formatTime(
             timeLeft
           )}</p>
         </div>
       `;
  } else {
    html += `
         <div style="margin-top: 20px;">
           <p>¡${comp.name} está listo para una aventura!</p>
           <button class="button" onclick="sendCompanion()" ${
             comp.energy >= 50 ? "" : "disabled"
           }>
             Enviar a Expedición (4h)
           </button>
           ${
             comp.energy < 50
               ? '<p style="color:var(--stat-fue); font-size: 12px;">Requiere 50 de Energía.</p>'
               : ""
           }
         </div>
       `;
  }

  html += `<hr style="border:1px solid var(--card-light); margin: 20px 0;">
              <p style="color:var(--muted); font-size: 14px;">Puedes comprar "Comida de Gato" y "Catnip Premium" en la Tienda.</p>`;

  contentEl.innerHTML = html;
}

// --- LÓGICA COMPAÑERO ---
function sendCompanion() {
  const comp = state.player.companion;
  if (comp.onExpedition || comp.energy < 50) return;

  comp.energy -= 50;
  comp.onExpedition = true;
  comp.expeditionEnds = Date.now() + 4 * 60 * 60 * 1000; // 4 horas

  const msg = `¡${comp.name} ha salido de expedición!`;
  state.player.diary.push(msg);
  showToast(msg);

  saveState();
  renderAll();
  renderTab("Compañero");
}

function checkCompanion() {
  const comp = state.player.companion;
  if (!comp.onExpedition || comp.expeditionEnds > Date.now()) return;

  comp.onExpedition = false;
  comp.expeditionEnds = null;

  let loot = { credits: 0, items: [] };
  const rarityId = COMPANION_RARITIES[comp.rarity].id;

  loot.credits = 15 + Math.floor(Math.random() * 25 * rarityId);

  if (Math.random() < 0.1 * rarityId) {
    loot.items.push("Poción de Salud");
    state.player.inventory.push(
      JSON.parse(JSON.stringify(state.store.find((i) => i.id === 1)))
    );
  }
  if (rarityId >= 4 && Math.random() < 0.1) {
    loot.items.push("Pergamino de XP");
    state.player.inventory.push(
      JSON.parse(JSON.stringify(state.store.find((i) => i.id === 2)))
    );
  }

  let lootMsg = `¡${comp.name} ha vuelto! Encontró ${loot.credits} Créditos`;
  if (loot.items.length > 0) {
    lootMsg += ` y ${loot.items.join(", ")}!`;
  }

  state.player.diary.push(lootMsg);
  showToast(lootMsg, "success");
  applyEffect({ credits: loot.credits });
  saveState();
  renderAll();

  const tabActual = document.querySelector(".tab.active")?.textContent;
  if (tabActual === "Compañero") renderTab("Compañero");
}

function upgradeCompanion() {
  const comp = state.player.companion;
  let msg = `Usaste Catnip Premium en ${comp.name}. `;
  let upgraded = false;

  if (comp.rarity === "Común" && Math.random() < 0.6) {
    comp.rarity = "Poco Común";
    comp.color = COMPANION_RARITIES["Poco Común"].color;
    upgraded = true;
  } else if (comp.rarity === "Poco Común" && Math.random() < 0.4) {
    comp.rarity = "Raro";
    comp.color = COMPANION_RARITIES["Raro"].color;
    upgraded = true;
  } else if (comp.rarity === "Raro" && Math.random() < 0.15) {
    comp.rarity = "Épico";
    comp.color = COMPANION_RARITIES["Épico"].color;
    upgraded = true;
  }

  if (upgraded) {
    msg += `¡Evolucionó! Ahora es un Gato ${comp.color} (${comp.rarity}).`;
  } else if (comp.rarity === "Épico") {
    msg += "¡Ya es perfecto! (No puede mejorar más).";
  } else {
    msg += "Le ha gustado mucho, pero no ha pasado nada...";
  }

  state.player.diary.push(msg);
  showToast(msg, upgraded ? "success" : "info");
  saveState();
  renderAll();
}

// --- RENDER: Pestaña Proyectos ---
function renderProyectosTab() {
  let html = `<h2>🏗️ Proyectos a Largo Plazo</h2>
       <p style="color:var(--muted); margin-top: 4px;">Se completan automáticamente al hacer misiones vinculadas.</p>`;

  state.projects.forEach((p) => {
    let pct = (p.currentPoints / p.totalPoints) * 100;
    if (pct > 100) pct = 100;

    html += `
         <div class="project-card">
           <h3>${p.title} ${p.currentPoints >= p.totalPoints ? "✅" : ""}</h3>
           <p>${p.description}</p>
           <div class="progress-bar">
             <div class="progress-bar-inner" style="width: ${pct}%;">${
      p.currentPoints
    } / ${p.totalPoints}</div>
           </div>
         </div>
       `;
  });

  contentEl.innerHTML = html;
}

// --- RENDER: Pestaña Inventario ---
function renderInventarioTab() {
  let html = `<h2>🎒 Inventario</h2><table>
       <thead><tr><th>Ítem</th><th>Tipo</th><th>Efecto</th><th>Acción</th></tr></thead><tbody>`;

  if (state.player.inventory.length === 0) {
    html += `<tr><td colspan="4" style="text-align:center; color: var(--muted);">Inventario vacío. Compra ítems en la Tienda.</td></tr>`;
  }

  state.player.inventory.forEach((item, index) => {
    let actionButton = "";
    if (item.type === "consumable") {
      actionButton = `<button class="button" onclick="useItem(${index})">Usar</button>`;
    }
    if (item.type === "permanent") {
      const isEquipped =
        state.player.equipment[item.slot] &&
        state.player.equipment[item.slot].id === item.id;
      if (isEquipped) {
        actionButton = "Equipado ✅";
      } else {
        actionButton = `<button class="button" onclick="equipItem(${index})">Equipar</button>`;
      }
    }

    let effectDesc = "";
    if (item.effect.hp) effectDesc = `+${item.effect.hp} HP`;
    else if (item.effect.xp) effectDesc = `+${item.effect.xp} XP`;
    else if (item.effect.maxHp) effectDesc = `+${item.effect.maxHp} Max HP`;
    else if (item.effect.xp_bonus)
      effectDesc = `+${item.effect.xp_bonus * 100}% XP`;
    else if (item.effect.companion_energy)
      effectDesc = `+${item.effect.companion_energy} Energía Gato`;
    else if (item.effect.upgrade_companion) effectDesc = `Mejorar Gato`;

    html += `<tr>
         <td>${escapeHtml(item.item)}</td>
         <td>${item.type === "consumable" ? "Consumible" : "Permanente"}</td>
         <td>${effectDesc}</td>
         <td>${actionButton}</td>
       </tr>`;
  });

  html += `</tbody></table>`;
  contentEl.innerHTML = html;
}

// Lógica de Inventario
function useItem(inventoryIndex) {
  const item = state.player.inventory[inventoryIndex];
  if (!item || item.type !== "consumable") return;

  if (item.effect.upgrade_companion) {
    upgradeCompanion();
  } else {
    applyEffect(item.effect);
    const msg = `¡Usaste "${item.item}"!`;
    state.player.diary.push(msg);
    showToast(msg, "success");
  }

  state.player.inventory.splice(inventoryIndex, 1);

  checkLevelUp();
  saveState();
  renderAll();
  renderTab("Inventario");
  if (item.effect.companion_energy) renderTab("Compañero");
}

function equipItem(inventoryIndex) {
  const item = state.player.inventory[inventoryIndex];
  if (!item || item.type !== "permanent" || !item.slot) return;

  if (state.player.equipment[item.slot]) {
    unequipItem(item.slot, false);
  }

  state.player.equipment[item.slot] = item;
  state.player.inventory.splice(inventoryIndex, 1);

  if (item.effect.maxHp) {
    recalculateMaxHp();
  }

  const msg = `¡Equipaste "${item.item}"!`;
  state.player.diary.push(msg);
  showToast(msg, "success");
  checkAchievements(null, "equip");

  saveState();
  renderAll();
  renderTab("Inventario");
  renderTab("Player");
}

function unequipItem(slot, refresh = true) {
  const item = state.player.equipment[slot];
  if (!item) return;

  state.player.inventory.push(item);

  if (item.effect.maxHp) {
    state.player.maxHp -= item.effect.maxHp;
    if (state.player.hp > state.player.maxHp)
      state.player.hp = state.player.maxHp;
  }

  state.player.equipment[slot] = null;
  const msg = `¡Desequipaste "${item.item}"!`;
  state.player.diary.push(msg);
  showToast(msg);

  if (refresh) {
    saveState();
    renderAll();
    renderTab("Inventario");
    renderTab("Player");
  }
}

// --- LÓGICA DE EVENTOS ALEATORIOS (¡REESCRITA CON MODAL!) ---
function triggerRandomEvent() {
  const COOLDOWN_MS = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const lastEvent = state.player.lastRandomEvent || 0;
  if (now - lastEvent < COOLDOWN_MS) return;

  state.player.lastRandomEvent = now;
  const event = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];

  // --- CASO 1: Evento Interactivo (NUEVO con MODAL) ---
  if (event.type === "interactive") {
    if (!event.options || event.options.length < 4) {
      console.error("Evento interactivo mal configurado:", event);
      return;
    }

    // 1. Crear las opciones para el modal
    const modalOptions = event.options.map((option, index) => {
      return {
        text: `(${option.stat.toUpperCase()}) ${option.text}`,
        callback: () => {
          // 2. Lógica de éxito/fallo (se ejecuta AL HACER CLIC)
          const chosenOption = event.options[index];
          const statKey = chosenOption.stat;
          const playerStatValue = state.player.attributes[statKey];

          let successChance = (playerStatValue * 3) / 100; // 3% por punto
          if (successChance < 0.05) successChance = 0.05;
          if (successChance > 0.95) successChance = 0.95;

          const roll = Math.random();

          if (roll < successChance) {
            // ¡ÉXITO!
            const msg = `(Evento) ¡Éxito! ${event.success_text}`;
            state.player.diary.push(msg);
            showToast(msg, "success");
            applyEffect(event.success_reward);
          } else {
            // ¡FALLO!
            const msg = `(Evento) ¡Fallo! ${event.fail_text}`;
            state.player.diary.push(msg);
            showToast(msg, "error");
            applyEffect(event.fail_penalty);
          }

          // 3. Finalizar
          checkLevelUp();
          checkAchievements(null, "random_event");
          saveState();
          renderAll();
          renderTab("Player"); // Para actualizar el botón de evento
        },
      };
    });

    // 4. Mostrar el modal
    showModal("¡Evento Aleatorio!", event.text, modalOptions);

    // --- CASO 2: Evento de Obstáculo (Antiguo) ---
  } else if (event.type === "obstacle") {
    state.player.diary.push(`(Evento) ${event.text}`);
    showToast(`(Evento) ${event.text}`, "error");
    const obstacleData = OBSTACLES[event.obstacle];
    if (obstacleData && !state.player.activeObstacle) {
      state.player.activeObstacle = JSON.parse(JSON.stringify(obstacleData)); // Clonar
    }
    // --- CASO 3: Evento de Misión (Antiguo) ---
  } else if (event.type === "mission") {
    state.player.diary.push(`(Evento) ${event.text}`);
    showToast(`(Evento) ${event.text}`);
    const nid = state.missions.length
      ? Math.max(...state.missions.map((x) => x.id)) + 1
      : 1;
    const defaultDiff = "Facil";
    state.missions.push({
      id: nid,
      title: event.mission.title,
      difficulty: event.mission.difficulty,
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS[defaultDiff],
      cooldownHours: 0,
      completedAt: null,
      projectLink: null,
    });
    // --- CASO 4: Evento simple ---
  } else if (event.effect) {
    state.player.diary.push(`(Evento) ${event.text}`);
    showToast(`(Evento) ${event.text}`);
    applyEffect(event.effect);
  }

  // 5. Guardar (para los casos 2, 3 y 4)
  if (event.type !== "interactive") {
    checkLevelUp();
    checkAchievements(null, "random_event");
    saveState();
    renderAll();
    renderTab("Player");
  }
}

// --- LÓGICA DE MISIONES Y NIVEL ---
function checkMissionCooldowns() {
  const now = Date.now();
  let oneMissionReset = false;
  state.missions.forEach((m) => {
    if (m.status === "Completada" && m.completedAt && m.cooldownHours > 0) {
      const cooldownMillis = m.cooldownHours * 60 * 60 * 1000;
      if (now >= m.completedAt + cooldownMillis) {
        m.status = "Pendiente";
        m.completedAt = null;
        oneMissionReset = true;
      }
    }
  });
  if (oneMissionReset) {
    saveState();
  }
}

function checkHabitReset() {
  const today = new Date().toDateString();
  if (state.system.lastHabitReset !== today) {
    state.habits.forEach((h) => (h.countToday = 0));
    state.system.lastHabitReset = today;
  }
}

function renderMissionsTab() {
  checkMissionCooldowns();
  const isAdmin = state.system.adminMode;

  let html = `<h2>🗺️ Misiones</h2>
       <div class="table-wrapper">
       <table>
       <thead><tr><th>ID</th><th>Descripción</th><th>Dificultad</th><th>Estado</th><th>Recompensa</th><th>Acción</th></tr></thead><tbody>`;

  state.missions.forEach((m) => {
    let difficultyCell = "";
    if (isAdmin) {
      const difficultyOptions = Object.keys(DIFFICULTY_REWARDS)
        .map(
          (d) =>
            `<option value="${d}" ${
              m.difficulty === d ? "selected" : ""
            }>${d}</option>`
        )
        .join("");
      difficultyCell = `<td>
             <select id="mission-diff-${m.id}" onchange="updateMission(${m.id})"> ${difficultyOptions}
             </select>
           </td>`;
    } else {
      difficultyCell = `<td><span class="difficulty difficulty-${
        m.difficulty
      }">${escapeHtml(m.difficulty)}</span></td>`;
    }

    const actionButton =
      m.status === "Pendiente"
        ? `<button class="button" onclick="completeMission(${m.id})">Completar</button>`
        : m.cooldownHours > 0
        ? "✅ Enfriando"
        : "✅ Completada";

    html += `<tr>
         <td>${m.id}</td>
         <td><input type="text" id="mission-title-${m.id}" value="${escapeHtml(
      m.title
    )}" onchange="updateMission(${m.id})"></td> ${difficultyCell}
         <td>${
           m.status === "Completada" && m.cooldownHours > 0
             ? "Enfriando..."
             : escapeHtml(m.status)
         }</td>
         <td>${m.reward.xp || 0} XP, ${m.reward.credits || 0} C</td>
         <td>
           ${actionButton}
         </td>
       </tr>`;
  });
  html += `</tbody></table></div>`;
  html += `<button class="button" id="add-mission">Agregar nueva misión</button>`;
  html += `<button class="button" id="reset-cooldowns" style="background: var(--accent2);">Restablecer Cooldowns</button>`;

  contentEl.innerHTML = html;

  document.getElementById("add-mission").onclick = () => {
    const nid = state.missions.length
      ? Math.max(...state.missions.map((x) => x.id)) + 1
      : 1;
    const defaultDiff = "Facil";
    state.missions.push({
      id: nid,
      title: "Nueva misión - Editar",
      difficulty: defaultDiff,
      status: "Pendiente",
      reward: DIFFICULTY_REWARDS[defaultDiff],
      cooldownHours: DIFFICULTY_REWARDS[defaultDiff].cooldownHours,
      completedAt: null,
      projectLink: null,
    });
    saveState();
    renderTab("Missions");
  };

  document.getElementById("reset-cooldowns").onclick = () => {
    state.missions.forEach((m) => {
      if (m.status === "Completada") {
        m.status = "Pendiente";
        m.completedAt = null;
      }
    });
    saveState();
    renderTab("Missions");
    showToast("Cooldowns reseteados.");
  };
}

function updateMission(missionId) {
  const mission = state.missions.find((m) => m.id === missionId);
  if (!mission) return;
  const isAdmin = state.system.adminMode;

  const newTitle = document.getElementById(`mission-title-${missionId}`).value;
  mission.title = newTitle;

  if (isAdmin) {
    const newDifficulty = document.getElementById(
      `mission-diff-${missionId}`
    ).value;
    if (mission.difficulty !== newDifficulty) {
      mission.difficulty = newDifficulty;
      const newRewards = DIFFICULTY_REWARDS[newDifficulty];
      if (newRewards) {
        mission.reward.xp = newRewards.xp;
        mission.reward.credits = newRewards.credits;
        mission.cooldownHours = newRewards.cooldownHours;
      }
    }
  }
  saveState();
}

function completeMission(missionId) {
  const mission = state.missions.find((m) => m.id === missionId);
  if (!mission || mission.status !== "Pendiente") return;

  updateMission(missionId);

  applyEffect(mission.reward);

  const lootChance = 0.1;
  if (Math.random() < lootChance) {
    const lootItem = state.store.find((i) => i.id === 1);
    if (lootItem) {
      state.player.inventory.push(JSON.parse(JSON.stringify(lootItem)));
      const lootMsg = `¡Suerte! Encontraste un/a "${lootItem.item}" al completar la misión.`;
      state.player.diary.push(lootMsg);
      showToast(lootMsg, "success");
    }
  }

  state.player.totalMissionsDone++;

  mission.status = "Completada";
  mission.completedAt = Date.now();
  state.player.diary.push(`¡Misión completada: "${mission.title}"!`);

  if (state.player.activeObstacle) {
    let damage = mission.reward.xp * 0.5;
    state.player.activeObstacle.hp -= damage;
    state.player.diary.push(
      `¡Atacas a "${state.player.activeObstacle.name}" por ${damage} de daño!`
    );

    if (state.player.activeObstacle.hp <= 0) {
      const obsMsg = `¡Has derrotado al Obstáculo: "${state.player.activeObstacle.name}"!`;
      state.player.diary.push(obsMsg);
      showToast(obsMsg, "success");
      state.player.activeObstacle = null;
      applyEffect({ xp: 100, credits: 50, gemas: 1 });
      checkAchievements(null, "obstacle_defeated");
    }
  }

  if (mission.projectLink && mission.projectPoints) {
    const project = state.projects.find((p) => p.id === mission.projectLink);
    if (project && project.currentPoints < project.totalPoints) {
      project.currentPoints += mission.projectPoints;
      state.player.diary.push(`¡Tu proyecto "${project.title}" ha avanzado!`);

      if (project.currentPoints >= project.totalPoints) {
        const projMsg = `¡PROYECTO COMPLETADO: "${project.title}"!`;
        state.player.diary.push(projMsg);
        showToast(projMsg, "success");
        let projectReward = JSON.parse(JSON.stringify(project.reward));
        projectReward.gemas = 1;
        applyEffect(projectReward);
        checkAchievements(null, "project_completed");
      }
    }
  }

  checkLevelUp();
  checkAchievements(mission);

  saveState();
  renderAll();
  renderTab("Missions");
}

function checkLevelUp() {
  while (state.player.xp >= state.player.xptnl) {
    state.player.xp = state.player.xp - state.player.xptnl;
    state.player.level++;
    state.player.attributePoints += 5;
    state.player.hp = state.player.maxHp;
    state.player.xptnl = Math.floor(state.player.xptnl * 1.5);

    const levelMsg = `¡SUBISTE AL NIVEL ${state.player.level}! Ganas 5 Puntos de Atributo (PA).`;
    state.player.diary.push(levelMsg);
    showToast(levelMsg, "success");
    updateLeaderboard(state.player.name, state.player.level);

    checkAchievements();
  }
}

// --- RENDER: Pestaña Tienda ---
function renderStoreTab() {
  let html = `<h2>🛒 Tienda</h2><table>
       <thead><tr><th>Ítem</th><th>Efecto</th><th>Precio</th><th>Acción</th></tr></thead><tbody>`;

  const priceModifier =
    1 -
    state.player.attributes.car * 0.005 -
    (state.player.skills.c1 ? 0.1 : 0);

  state.store.forEach((s) => {
    const finalPrice = Math.round(s.price * priceModifier);
    const canAfford = state.player.credits >= finalPrice;
    let actionButton = "";

    if (s.type === "permanent") {
      const isOwned =
        state.player.inventory.find((i) => i.id === s.id) ||
        Object.values(state.player.equipment).find((i) => i && i.id === s.id);
      if (isOwned) {
        actionButton = "Comprado ✅";
      } else {
        actionButton = `<button class="button" onclick="buyItem(${s.id})" ${
          canAfford ? "" : "disabled"
        }>Comprar</button>`;
      }
    } else {
      // Consumable
      actionButton = `<button class="button" onclick="buyItem(${s.id})" ${
        canAfford ? "" : "disabled"
      }>Comprar</button>`;
    }

    let effectDesc = "";
    if (s.effect.hp) effectDesc = `+${s.effect.hp} HP`;
    else if (s.effect.xp) effectDesc = `+${s.effect.xp} XP`;
    else if (s.effect.maxHp) effectDesc = `+${s.effect.maxHp} Max HP`;
    else if (s.effect.xp_bonus) effectDesc = `+${s.effect.xp_bonus * 100}% XP`;
    else if (s.effect.companion_energy)
      effectDesc = `+${s.effect.companion_energy} Energía Gato`;
    else if (s.effect.upgrade_companion) effectDesc = `Mejorar Gato`;

    html += `<tr>
         <td>${escapeHtml(s.item)}</td>
         <td>${effectDesc}</td>
         <td>${finalPrice} C ${
      priceModifier < 1
        ? '<span style="color:var(--stat-des);font-size:12px;">(-' +
          Math.round((1 - priceModifier) * 100) +
          "%)</span>"
        : ""
    }</td>
         <td>${actionButton}</td>
       </tr>`;
  });
  html += `</tbody></table>`;
  contentEl.innerHTML = html;
}

function buyItem(itemId) {
  const item = state.store.find((s) => s.id === itemId);
  const priceModifier =
    1 -
    state.player.attributes.car * 0.005 -
    (state.player.skills.c1 ? 0.1 : 0);
  const finalPrice = Math.round(item.price * priceModifier);

  if (!item || state.player.credits < finalPrice) {
    showToast("No tienes suficientes créditos.", "error");
    return;
  }

  state.player.credits -= finalPrice;
  state.player.inventory.push(JSON.parse(JSON.stringify(item)));
  const msg = `¡Compraste "${item.item}"!`;
  state.player.diary.push(msg);
  showToast(msg);

  checkAchievements(null, "buy_item");
  saveState();
  renderAll();
  renderTab("Store");
}

// --- RENDER: Pestaña Casino (Con mensajes y cooldown 1h) ---
function renderCasinoTab() {
  const COOLDOWN_MS = 1 * 60 * 60 * 1000; // <-- 1 HORA
  const now = Date.now();
  const lastVisit = state.player.lastCasinoVisit || 0;
  const cooldownLeft = COOLDOWN_MS - (now - lastVisit);
  const isCasinoReady = cooldownLeft <= 0;

  let html = `<h2>🎰 Casino "Doble o Nada"</h2>`;

  if (state.casinoGame.active) {
    // --- VISTA: JUEGO ACTIVO ---
    html += `
         <div class="casino-game">
           <p class="round">Ronda ${state.casinoGame.round}</p>
           <label>Pozo Actual</label>
           <div class="pot">${state.casinoGame.pot} C</div>
           <p style="color:var(--muted); margin-top: 4px;">¿Qué harás?</p>
           <div class="casino-actions">
             <button class="button" onclick="playCasinoRound()" style="background: var(--stat-des);">¡Doble o Nada!</button>
             <button class="button" onclick="casinoRetirarse()">Retirarse</button>
           </div>
         </div>
       `;
  } else if (isCasinoReady) {
    // --- VISTA: LISTO PARA JUGAR ---
    const canAfford = state.player.credits >= 25;
    html += `
         <div class="casino-game">
           <p>¡Tienta a tu suerte! La entrada cuesta 25 Créditos.</p>
           <p style="color:var(--muted); margin-top: 4px;">Gana y podrás duplicar tu apuesta. Pierde y lo perderás todo.</p>
           <button class="button" onclick="startCasinoGame()" ${
             canAfford ? "" : "disabled"
           }>
             Apostar 25 Créditos
           </button>
           ${
             !canAfford
               ? '<p style="color:var(--stat-fue); font-size: 12px;">No tienes suficientes créditos.</p>'
               : ""
           }
         </div>
       `;
  } else {
    // --- VISTA: EN COOLDOWN ---
    html += `
         <div class="casino-game">
           <p>El casino está cerrado por ahora.</p>
           <p style="color:var(--muted); margin-top: 4px;">Vuelve en: <b>${formatTime(
             cooldownLeft
           )}</b></p>
         </div>
       `;
  }

  contentEl.innerHTML = html;
}

// --- LÓGICA CASINO (Con mensajes y cooldown 1h) ---
function startCasinoGame() {
  const cost = 25;
  if (state.player.credits < cost) return;

  state.player.credits -= cost;
  state.casinoGame = {
    active: true,
    pot: cost * 2, // Ganas la primera ronda automáticamente
    round: 1,
  };

  state.player.diary.push(
    `¡Apostaste 25C en el casino! Pozo inicial: ${state.casinoGame.pot}C`
  );
  saveState();
  renderAll();
  renderTab("Casino");
}

function playCasinoRound() {
  if (!state.casinoGame.active) return;

  if (Math.random() < 0.5) {
    // --- ¡GANA! ---
    state.casinoGame.round++;
    state.casinoGame.pot *= 2;
    const msg = `¡GANASTE! 🎉 Tu pozo ahora es de ${state.casinoGame.pot} Créditos.`;
    showToast(msg, "success");
    state.player.diary.push(
      `¡DOBLE en el Casino! El pozo sube a ${state.casinoGame.pot}C.`
    );
  } else {
    // --- ¡PIERDE! ---
    const lostPot = state.casinoGame.pot;
    const msg = `¡PERDISTE! 😭 Has perdido el pozo de ${lostPot} Créditos.`;
    showToast(msg, "error");
    state.player.diary.push(
      `¡PERDISTE en el Casino! El pozo de ${lostPot}C se ha perdido.`
    );
    state.player.lastCasinoVisit = Date.now(); // Poner cooldown
    state.casinoGame = { active: false, pot: 0, round: 0 };
  }

  saveState();
  renderAll();
  renderTab("Casino");
}

function casinoRetirarse() {
  if (!state.casinoGame.active) return;

  const winnings = state.casinoGame.pot;
  state.player.credits += winnings;
  const msg = `¡Te retiras con ${winnings} Créditos! 💰`;
  showToast(msg, "success");
  state.player.diary.push(`¡Te retiras del casino con ${winnings}C!`);

  state.player.lastCasinoVisit = Date.now(); // Poner cooldown
  state.casinoGame = { active: false, pot: 0, round: 0 };

  saveState();
  renderAll();
  renderTab("Casino");
}

// --- RENDER: Pestaña Hábitos ---
function renderHabitsTab() {
  checkHabitReset();
  let html = `<h2>🧘 Hábitos Diarios</h2>
       <p style="color:var(--muted); margin-top: 4px;">Pequeñas acciones que se reinician cada día.</p>
       <div class="habits-list">`;

  state.habits.forEach((h) => {
    html += `
         <div class="habit-card">
           <div class="habit-details">
             <h3>${escapeHtml(h.title)}</h3>
             <p>${escapeHtml(h.desc)}</p>
           </div>
           <div class="habit-controls">
             <button class="habit-btn minus" onclick="doHabit(${
               h.id
             }, false)">-</button>
             <span class="habit-count">${h.countToday}</span>
             <button class="habit-btn" onclick="doHabit(${
               h.id
             }, true)">+</button>
           </div>
         </div>
       `;
  });
  html += `</div>`;
  contentEl.innerHTML = html;
}

function doHabit(habitId, isPositive) {
  const habit = state.habits.find((h) => h.id === habitId);
  if (!habit) return;

  if (isPositive) {
    habit.countToday++;
    applyEffect(habit.reward);
    state.player.diary.push(`(Hábito+) ${habit.title}`);
  } else {
    habit.countToday--;
    applyEffect(habit.penalty);
    state.player.diary.push(`(Hábito-) ${habit.title}`);
    state.player.totalHabitsFailed++;
    checkAchievements(null, "fail_habit");
  }

  checkLevelUp();
  saveState();
  renderAll();
  renderTab("Habits");
}

// --- RENDER: Pestaña Logros ---
function renderAchievementsTab() {
  let html = `<h2>🏆 Logros</h2><div class="achievements-list">`;
  state.achievements.forEach((a) => {
    let classes = `achievement-card ${a.unlocked ? "unlocked" : ""}`;
    let title = escapeHtml(a.title);
    let desc = escapeHtml(a.description);
    let icon = a.unlocked ? "🏆" : "🔒";

    if (a.hidden) {
      classes += " hidden-ach";
      if (!a.unlocked) {
        title = "Logro Oculto";
        desc = "Sigue jugando para descubrirlo...";
        icon = "❓";
      }
    }

    html += `
         <div class="${classes}">
           <div class="achievement-icon">${icon}</div>
           <div class="achievement-details">
             <h3>${title}</h3>
             <p>${desc}</p>
           </div>
         </div>
       `;
  });
  html += `</div>`;
  contentEl.innerHTML = html;
}

function unlockAchievement(id) {
  const achievement = state.achievements.find((a) => a.id === id);
  if (achievement && !achievement.unlocked) {
    achievement.unlocked = true;
    const msg = `¡LOGRO DESBLOQUEADO: ${achievement.title}!`;
    state.player.diary.push(msg);
    showToast(msg, "success");
    saveState();
  }
}

function checkAchievements(completedMission = null, eventType = null) {
  if (state.player.totalMissionsDone >= 1) unlockAchievement(1);
  if (state.player.level >= 2) unlockAchievement(2);
  if (state.player.level >= 5) unlockAchievement(15);

  if (completedMission) {
    if (completedMission.title.includes("(Guerrero)")) unlockAchievement(3);
    if (completedMission.title.includes("(Sabio)")) unlockAchievement(4);
    if (completedMission.title.includes("(Artesano)")) unlockAchievement(5);
    if (completedMission.title.includes("(Social)")) unlockAchievement(6);
  }

  if (eventType === "buy_item") unlockAchievement(7);
  if (eventType === "equip") unlockAchievement(8);
  if (eventType === "spend_pa") unlockAchievement(9);
  if (eventType === "buy_skill") unlockAchievement(10);
  if (eventType === "obstacle_defeated") unlockAchievement(11);
  if (eventType === "project_completed") unlockAchievement(12);
  if (eventType === "random_event") unlockAchievement(13);
  if (eventType === "fail_habit" && state.player.totalHabitsFailed >= 1)
    unlockAchievement(14);
}

// --- Tienda de Skins y Lógica de Temas ---
const THEME_NAMES = {
  "theme-light": "Tema Claro",
  "theme-forest": "Tema Bosque",
};

// --- COPIA Y REEMPLAZA ESTA FUNCIÓN COMPLETA EN TU SCRIPT.JS ---

function renderConfiguracionTab() {
  // Lista de Temas y sus precios en Gemas
  const THEME_PRICES = {
    "theme-light": 3,
    "theme-forest": 3,
  };

  // ¡CAMBIO! Añadida la clase "theme-store-wrapper"
  let html = `<h2>⚙️ Configuración</h2>
      <div class="theme-store-wrapper">
        <label>🎨 Tienda de Temas (Skins)</label>
        <p style="color:var(--muted); font-size: 14px;">Ganas Gemas 💎 al derrotar Obstáculos y completar Proyectos.</p>
        <div class="habits-list"> `;

  // Botón para el Tema Oscuro (por defecto)
  html += `
      <div class="habit-card">
        <div class="habit-details">
          <h3>Tema Oscuro (Gratis)</h3>
        </div>
        <div class="habit-controls">
          ${
            state.system.activeTheme === "" || !state.system.activeTheme
              ? "<span>✅ Activado</span>"
              : '<button class="button" onclick="applyTheme(\'\')">Activar</button>'
          }
        </div>
      </div>
    `;

  // Botones para los Temas de pago
  for (const themeKey in THEME_PRICES) {
    const price = THEME_PRICES[themeKey];
    const themeName = THEME_NAMES[themeKey]; // Usamos la lista global
    const isUnlocked = state.system.unlockedThemes[themeKey];
    const isActive = state.system.activeTheme === themeKey;

    let buttonHtml = "";
    if (isActive) {
      buttonHtml = "<span>✅ Activado</span>";
    } else if (isUnlocked) {
      buttonHtml = `<button class="button" onclick="applyTheme('${themeKey}')">Activar</button>`;
    } else {
      // No está desbloqueado -> Botón de compra
      const canBuy = (state.player.gemas || 0) >= price;
      buttonHtml = `<button class="button" onclick="buyTheme('${themeKey}', ${price})" ${
        canBuy ? "" : "disabled"
      }>
                        Comprar ( ${price} 💎 )
                      </button>`;
    }

    html += `
        <div class="habit-card">
          <div class="habit-details">
            <h3>${themeName}</h3>
          </div>
          <div class="habit-controls">
            ${buttonHtml}
          </div>
        </div>
      `;
  }

  html += `</div></div><hr style="border:1px solid var(--card-light); margin: 20px 0;">`;

  // --- ¡CAMBIO! Añadida la clase "config-row" a los divs ---
  html += `
      <div class="config-row">
        <label>Modo Administrador (Editar dificultad de misión)</label>
        <button class="button" id="btn-admin-mode" style="background: ${
          state.system.adminMode ? "var(--stat-des)" : "var(--stat-fue)"
        };">
          ${state.system.adminMode ? "Activado" : "Desactivado"}
        </button>
      </div>
  
      <div class="config-row">
        <label>Forzar reseteo de contadores de hábitos y mimos</label>
        <button class="button" id="btn-reset-habits" style="background: var(--accent2);">Resetear Contadores</button>
      </div>
  
      <hr style="border:1px solid var(--card-light); margin: 20px 0;">
  
      <div class="config-row">
        <label style="color: var(--stat-fue); font-weight: bold;">Zona de Peligro</label>
        <button class="button danger" id="btn-wipe-save">BORRAR PARTIDA</button>
      </div>
    `;
  contentEl.innerHTML = html;

  // --- RE-ASIGNAR LISTENERS ---
  document.getElementById("btn-admin-mode").onclick = () => {
    state.system.adminMode = !state.system.adminMode;
    saveState();
    renderTab("Configuración");
  };

  document.getElementById("btn-reset-habits").onclick = () => {
    state.habits.forEach((h) => (h.countToday = 0));
    state.system.lastHabitReset = new Date().toDateString();
    state.player.companion.mimosToday = 0;
    state.player.companion.lastMimoReset = new Date().toDateString();
    saveState();
    renderTab("Configuración");
    renderTab("Player"); // Refrescar mimos en Player
    showToast("Contadores diarios reseteados.");
  };

  document.getElementById("btn-wipe-save").onclick = () => {
    if (
      confirm(
        "¿ESTÁS SEGURO?\n\nEsta acción es irreversible y borrará todo tu progreso."
      )
    ) {
      localStorage.clear();
      location.reload();
    }
  };
}

// --- NO OLVIDES REEMPLAZAR TAMBIÉN TU FUNCIÓN "buyTheme" ---
// (Para arreglar el bug de 'alert' que quedaba pendiente)
function buyTheme(themeKey, price) {
  if ((state.player.gemas || 0) >= price) {
    state.player.gemas -= price;
    state.system.unlockedThemes[themeKey] = true;

    const msg = `¡Compraste el "${THEME_NAMES[themeKey] || themeKey}"!`;
    state.player.diary.push(msg);
    showToast(msg, "success"); // Usar showToast

    applyTheme(themeKey); // Activar el tema recién comprado
    renderAll(); // Actualizar el contador de Gemas
  } else {
    showToast(
      "¡No tienes suficientes Gemas 💎 para comprar este tema!",
      "error"
    ); // Usar showToast
  }
}

// --- LÓGICA DE COMBATE (¡Aún usa alert! Queda pendiente) ---
let combatState = {
  active: false,
  playerHP: 0,
  playerMaxHP: 0,
  enemyHP: 0,
  enemyMaxHP: 500,
  enemyName: "Golem de Piedra",
  enemyBaseDamage: 25,
  canRetry: true,
};
// (El resto de tu lógica de combate... Foso, startCombat, playerAttack, etc.)
// ... (Tu lógica de Foso va aquí) ...

// --- RENDER: Tab General ---
function renderTab(tab) {
  if (tab === "Player") renderPlayerTab();
  else if (tab === "Habilidades") renderHabilidadesTab();
  else if (tab === "Compañero") renderCompañeroTab();
  else if (tab === "Minijuego") renderMinijuegoTab();
  else if (tab === "Missions") renderMissionsTab();
  // else if (tab === "Foso") renderFosoTab(); // Descomentar si tienes Foso
  else if (tab === "Proyectos") renderProyectosTab();
  else if (tab === "Inventario") renderInventarioTab();
  else if (tab === "Store") renderStoreTab();
  else if (tab === "Casino") renderCasinoTab();
  else if (tab === "Habits") renderHabitsTab();
  else if (tab === "Configuración") renderConfiguracionTab();
  else if (tab === "Achievements") renderAchievementsTab();
  else if (tab === "Leaderboard") renderLeaderboardTab();
}

// --- RENDER: Obstáculo ---
function renderObstacleWidget() {
  const widget = document.getElementById("obstacle-widget");
  const obs = state.player.activeObstacle;
  if (obs) {
    widget.style.display = "block";
    widget.innerHTML = `
         <h3>¡Obstáculo Activo!</h3>
         <h4 style="color: var(--stat-fue);">${obs.name}</h4>
         <p style="font-size: 14px; color: var(--muted);">${obs.description}</p>
         <p><b>Salud: ${obs.hp} / ${OBSTACLES[obs.name].hp}</b></p>
       `;
  } else {
    widget.style.display = "none";
    widget.innerHTML = "";
  }
}

// --- RENDER: Función de Renderizado General (ACTUALIZADA) ---
function renderAll() {
  recalculateMaxHp();

  // Panel Lateral
  document.getElementById("player-name").textContent = state.player.name;
  document.getElementById("player-level").textContent = state.player.level;
  document.getElementById("player-credits").textContent = state.player.credits;
  document.getElementById("player-pa").textContent =
    state.player.attributePoints;

  if (!document.getElementById("player-gemas")) {
    const paStat = document.getElementById("player-pa").closest(".stat");
    paStat.insertAdjacentHTML(
      "afterend",
      `
         <div class="stat">
           <label>💎 Gemas</label>
           <div class="value" id="player-gemas" style="color: #00bcd4;">0</div>
         </div>
       `
    );
  }
  document.getElementById("player-gemas").textContent = state.player.gemas || 0;

  const currentHp = state.player.hp || 0;
  const maxHp = state.player.maxHp || 100;
  const currentXp = state.player.xp || 0;
  const nextXp = state.player.xptnl || 100;

  // Actualizar texto
  document.getElementById(
    "player-hp-text"
  ).textContent = `${currentHp} / ${maxHp}`;
  document.getElementById(
    "player-xp-text"
  ).textContent = `${currentXp} / ${nextXp}`;

  // MEJORA UI: Actualizar barras de progreso
  const hpPercent = (currentHp / maxHp) * 100;
  const xpPercent = (currentXp / nextXp) * 100;
  document.getElementById("player-hp-bar-inner").style.width = `${hpPercent}%`;
  document.getElementById("player-xp-bar-inner").style.width = `${xpPercent}%`;

  // Diario
  let diaryEl = document.getElementById("diary");
  diaryEl.innerHTML = (
    Array.isArray(state.player.diary) ? state.player.diary : []
  )
    .map((e) => `<div>${escapeHtml(String(e))}</div>`)
    .join("");
  diaryEl.scrollTop = diaryEl.scrollHeight;

  renderObstacleWidget();
}

// --- LÓGICA MINI-JUEGO ---
let minigame = {
  active: false,
  clicksLeft: 0,
  toyTimeout: null,
  nextToyTimeout: null,
};

function renderMinijuegoTab() {
  const comp = state.player.companion;
  const canPlay = comp.energy >= 10;

  contentEl.innerHTML = `
     <h2>🐭 Jugar con Michi</h2>
     <div id="minigame-container">
       <p style="color:var(--muted); margin-top: 4px;">¡Gasta 10 de Energía ⚡ para jugar con ${
         comp.name
       } y ganar recompensas!</p>
 
       <button class="button" id="btn-start-minigame" ${
         canPlay ? "" : "disabled"
       }>
         ${canPlay ? "Jugar (Cuesta 10 ⚡)" : "Michi está cansado"}
       </button>
 
       <div id="minigame-status">¡Haz clic en el juguete 10 veces!</div>
 
       <div id="minigame-area">
         <div id="minigame-toy">🐭</div>
       </div>
     </div>
   `;

  document.getElementById("btn-start-minigame").onclick = startMinigame;

  if (minigame.active) {
    document.getElementById("btn-start-minigame").style.display = "none";
    document.getElementById(
      "minigame-status"
    ).textContent = `¡Atrapa el juguete! Quedan ${minigame.clicksLeft} clics.`;
  } else {
    document.getElementById("minigame-status").style.display = "none";
  }
}

function startMinigame() {
  if (state.player.companion.energy < 10 || minigame.active) return;

  state.player.companion.energy -= 10;
  minigame.active = true;
  minigame.clicksLeft = 10;

  document.getElementById("btn-start-minigame").style.display = "none";
  const statusEl = document.getElementById("minigame-status");
  statusEl.style.display = "block";
  statusEl.textContent = `¡Atrapa el juguete! Quedan ${minigame.clicksLeft} clics.`;

  state.player.diary.push(
    `¡Empezaste a jugar con ${state.player.companion.name}!`
  );
  saveState();
  renderAll();

  showMinigameToy();
}

function showMinigameToy() {
  if (!minigame.active) return;

  const area = document.getElementById("minigame-area");
  const toy = document.getElementById("minigame-toy");

  const areaRect = area.getBoundingClientRect();
  const top = Math.random() * (areaRect.height - 50);
  const left = Math.random() * (areaRect.width - 50);

  toy.style.top = `${top}px`;
  toy.style.left = `${left}px`;
  toy.style.display = "block";

  toy.onclick = () => onToyClick();

  minigame.toyTimeout = setTimeout(() => {
    hideMinigameToy();
    minigame.nextToyTimeout = setTimeout(showMinigameToy, 300);
  }, 1200);
}

function hideMinigameToy() {
  document.getElementById("minigame-toy").style.display = "none";
  clearTimeout(minigame.toyTimeout);
  clearTimeout(minigame.nextToyTimeout);
}

function onToyClick() {
  if (!minigame.active) return;

  minigame.clicksLeft--;
  document.getElementById(
    "minigame-status"
  ).textContent = `¡Atrapa el juguete! Quedan ${minigame.clicksLeft} clics.`;

  hideMinigameToy();

  if (minigame.clicksLeft <= 0) {
    endMinigame();
  } else {
    minigame.nextToyTimeout = setTimeout(showMinigameToy, 250);
  }
}

function endMinigame() {
  minigame.active = false;

  applyEffect({ credits: 15, xp: 5 });
  const msg = `¡Juego terminado! Ganaste 15 Créditos y 5 XP.`;
  state.player.diary.push(msg);
  showToast(msg, "success");

  document.getElementById("minigame-status").textContent =
    "¡Ganaste! (+15 C, +5 XP)";
  const startBtn = document.getElementById("btn-start-minigame");
  startBtn.style.display = "block";

  if (state.player.companion.energy < 10) {
    startBtn.disabled = true;
    startBtn.textContent = "Michi está cansado";
  } else {
    startBtn.disabled = false;
    startBtn.textContent = "Jugar de nuevo (Cuesta 10 ⚡)";
  }

  checkLevelUp();
  saveState();
  renderAll();
}

// --- LÓGICA DE RECOMPENSA DIARIA (LOGIN STREAK) ---
function checkDailyLogin() {
  const today = new Date().toDateString();

  if (state.player.lastLoginDate === today) {
    return;
  }

  const yesterday = new Date(Date.now() - 86400000).toDateString();
  let baseReward = 20;

  if (state.player.lastLoginDate === yesterday) {
    state.player.loginStreak++;
  } else {
    state.player.loginStreak = 1;
  }

  state.player.lastLoginDate = today;

  let finalReward = baseReward * state.player.loginStreak;
  applyEffect({ credits: finalReward });

  let rewardMsg = `¡Racha de conexión: Día ${state.player.loginStreak}! Ganas ${finalReward} Créditos.`;
  if (state.player.loginStreak === 1) {
    rewardMsg = `¡Bienvenido! Ganas ${finalReward} Créditos por tu conexión diaria.`;
  }

  state.player.diary.push(rewardMsg);
  showToast(rewardMsg, "success");
  saveState();
}

// --- LÓGICA DE LEADERBOARD ---
function updateLeaderboard(playerName, playerLevel) {
  if (!db) return;

  db.collection("leaderboard")
    .doc(playerName)
    .set({
      name: playerName,
      level: playerLevel,
    })
    .then(() => {
      console.log("¡Puntuación actualizada en el Leaderboard!");
    })
    .catch((error) => {
      console.error("Error al escribir en el Leaderboard: ", error);
    });
}

function renderLeaderboardTab() {
  if (!db) {
    contentEl.innerHTML = `<h2>🏆 Leaderboard</h2><p style="color:var(--stat-fue);">Error: No se pudo conectar a la base de datos de Firebase.</p>`;
    return;
  }

  let html = `<h2>🏆 Leaderboard (Top 10)</h2>
     <p style="color:var(--muted); margin-top: 4px;">¡Compite con tus amigos!</p>
     <button class="button" id="btn-refresh-leaderboard">Actualizar</button>
     <div class="table-wrapper" style="margin-top: 15px;">
       <table>
         <thead><tr><th>Pos.</th><th>Nombre</th><th>Nivel</th></tr></thead>
         <tbody id="leaderboard-list">
           <tr><td colspan="3" style="text-align:center; color:var(--muted);">Cargando...</td></tr>
         </tbody>
       </table>
     </div>
   `;
  contentEl.innerHTML = html;

  document.getElementById("btn-refresh-leaderboard").onclick = () =>
    renderLeaderboardTab();

  db.collection("leaderboard")
    .orderBy("level", "desc")
    .limit(10)
    .get()
    .then((querySnapshot) => {
      const listEl = document.getElementById("leaderboard-list");
      listEl.innerHTML = "";

      if (querySnapshot.empty) {
        listEl.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--muted);">El leaderboard está vacío. ¡Sé el primero en subir de nivel!</td></tr>`;
        return;
      }

      let position = 1;
      querySnapshot.forEach((doc) => {
        const player = doc.data();
        listEl.innerHTML += `
           <tr>
             <td><b>#${position}</b></td>
             <td>${escapeHtml(player.name)}</td>
             <td><b>${player.level}</b></td>
           </tr>
         `;
        position++;
      });
    })
    .catch((error) => {
      console.error("Error al leer el Leaderboard: ", error);
      const listEl = document.getElementById("leaderboard-list");
      listEl.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--stat-fue);">Error al cargar los datos. Intenta de nuevo.</td></tr>`;
    });
}
// --- FIN DE LÓGICA DE LEADERBOARD ---
// --- INICIO: LÓGICA DE COMBATE POKÉMON ---

let combatState = {
  active: false,
  playerHP: 0,
  playerMaxHP: 0,
  enemyHP: 0,
  enemyMaxHP: 500,
  enemyName: "Golem de Piedra",
  enemyBaseDamage: 25,
  canRetry: true
};

// Función de la Pestaña "Foso" (el lobby)
function renderFosoTab() {
  const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 días
  const now = Date.now();
  const lastWin = state.player.lastBossWin || 0;
  const cooldownLeft = COOLDOWN_MS - (now - lastWin);
  const isReady = cooldownLeft <= 0;
  const canAfford = state.player.credits >= 50;

  let html = `<h2>🗿 El Foso de los Retos</h2>
    <p style="color:var(--muted); margin-top: 4px;">¡Desafía al Jefe Semanal! Si ganas, obtendrás recompensas únicas. Si pierdes, pierdes tu apuesta.</p>`;

  if (isReady) {
    html += `<button class="button" id="btn-start-boss" ${canAfford ? '' : 'disabled'}>
                Desafiar al Jefe (Cuesta 50 Créditos)
              </button>`;
    if (!canAfford) html += `<p style="color:var(--stat-fue); font-size: 12px;">No tienes suficientes créditos.</p>`;
  } else {
    html += `<p style="color:var(--accent2); font-size: 16px;">¡Ya has derrotado al Jefe esta semana!</p>
              <p>Siguiente desafío en: <b>${formatTime(cooldownLeft)}</b></p>`;
  }
  contentEl.innerHTML = html;

  if (isReady && canAfford) {
    document.getElementById("btn-start-boss").onclick = startCombat;
  }
}

// Iniciar el combate
function startCombat() {
  if (state.player.credits < 50) return;

  // Pagar el costo
  state.player.credits -= 50;
  state.player.diary.push(`¡Pagaste 50 Créditos para entrar al Foso!`);

  // Inicializar estado del combate
  combatState.active = true;
  combatState.playerMaxHP = state.player.maxHp;
  combatState.playerHP = state.player.hp;
  combatState.enemyHP = combatState.enemyMaxHP;

  // Actualizar la UI de batalla
  document.getElementById('player-battle-name').textContent = state.player.name;
  document.getElementById('enemy-name').textContent = combatState.enemyName;

  // Limpiar el log de batalla
  document.getElementById('battle-log').innerHTML = `<p>¡Un ${combatState.enemyName} te desafía!</p>`;

  // Asignar acciones a los botones
  document.getElementById('btn-att-fue').onclick = () => playerAttack('fue');
  document.getElementById('btn-att-des').onclick = () => playerAttack('des');
  document.getElementById('btn-att-int').onclick = () => playerAttack('int');
  document.getElementById('btn-att-car').onclick = () => playerAttack('car');

  // Mostrar la pantalla de batalla
  updateBattleUI();
  document.getElementById('battle-overlay').style.display = 'block';
}

// Función para actualizar toda la UI de batalla
function updateBattleUI() {
  // --- JUGADOR ---
  document.getElementById('player-hp-text').textContent = `${combatState.playerHP} / ${combatState.playerMaxHP}`;
  const playerHPPct = (combatState.playerHP / combatState.playerMaxHP) * 100;
  const playerBar = document.getElementById('player-hp-bar');
  playerBar.style.width = `${playerHPPct}%`;
  // Clase de color HP
  playerBar.className = "hp-bar-inner";
  if (playerHPPct < 20) playerBar.classList.add('low');
  else if (playerHPPct < 50) playerBar.classList.add('medium');

  // --- ENEMIGO ---
  document.getElementById('enemy-hp-text').textContent = `${combatState.enemyHP} / ${combatState.enemyMaxHP}`;
  const enemyHPPct = (combatState.enemyHP / combatState.enemyMaxHP) * 100;
  const enemyBar = document.getElementById('enemy-hp-bar');
  enemyBar.style.width = `${enemyHPPct}%`;
  // Clase de color HP
  enemyBar.className = "hp-bar-inner";
  if (enemyHPPct < 20) enemyBar.classList.add('low');
  else if (enemyHPPct < 50) enemyBar.classList.add('medium');
}

// Función para escribir en el diario de batalla
function logToBattle(message) {
  const log = document.getElementById('battle-log');
  log.innerHTML = `<p>${message}</p>` + log.innerHTML; // Añade el mensaje al principio
}

// Toggle de botones
function setBattleButtons(disabled) {
  document.getElementById('btn-att-fue').disabled = disabled;
  document.getElementById('btn-att-des').disabled = disabled;
  document.getElementById('btn-att-int').disabled = disabled;
  document.getElementById('btn-att-car').disabled = disabled;
}

// 💥 ¡Tu Turno! 💥
function playerAttack(stat) {
  if (!combatState.active) return;
  setBattleButtons(true); // Desactivar botones mientras se procesa el turno

  let damage = 0;
  let dodgeChance = 0;
  let stunChance = 0;
  let heal = 0;

  // 1. Calcular acción
  switch (stat) {
    case 'fue':
      damage = Math.round(state.player.attributes.fue * 2);
      logToBattle(`💥 ¡Usas Golpe Brutal! Haces ${damage} de daño.`);
      break;
    case 'des':
      damage = Math.round(state.player.attributes.des * 1.5);
      dodgeChance = 0.4; // 40%
      logToBattle(`💨 ¡Usas Golpe Ágil! Haces ${damage} de daño.`);
      break;
    case 'int':
      damage = Math.round(state.player.attributes.int * 1.5);
      stunChance = 0.2; // 20%
      logToBattle(`🧠 ¡Buscas un Punto Débil! Haces ${damage} de daño.`);
      break;
    case 'car':
      heal = Math.round(state.player.attributes.car * 2);
      combatState.playerHP += heal;
      if (combatState.playerHP > combatState.playerMaxHP) combatState.playerHP = combatState.playerMaxHP;
      logToBattle(`💖 ¡Usas Grito de Ánimo! Te curas ${heal} HP.`);
      break;
  }

  // 2. Aplicar daño al enemigo (si lo hay)
  if (damage > 0) {
    combatState.enemyHP -= damage;
  }

  // 3. Revisar si el enemigo murió
  if (combatState.enemyHP <= 0) {
    combatState.enemyHP = 0;
    updateBattleUI();
    logToBattle("¡Has derrotado al " + combatState.enemyName + "!");
    setTimeout(() => endCombat(true), 2000); // Ganaste
    return;
  }

  // 4. Actualizar UI y pasar al turno del enemigo
  updateBattleUI();
  setTimeout(() => enemyAttack(dodgeChance, stunChance), 1500); // Esperar 1.5s
}

// 👹 ¡Turno del Enemigo! 👹
function enemyAttack(playerDodgeChance, enemyStunChance) {
  if (!combatState.active) return;

  // 1. Revisar Stun
  if (Math.random() < enemyStunChance) {
    logToBattle("¡El Golem está aturdido y pierde su turno!");
    setBattleButtons(false); // Reactivar botones
    return;
  }

  // 2. Revisar Esquivar
  if (Math.random() < playerDodgeChance) {
    logToBattle("¡El Golem ataca, pero lo esquivas ágilmente!");
    setBattleButtons(false); // Reactivar botones
    return;
  }

  // 3. Recibir Daño
  // El daño del jefe se reduce un poco por tu FUE (defensa)
  let defense = Math.round(state.player.attributes.fue * 0.5);
  let damageTaken = combatState.enemyBaseDamage - defense;
  if (damageTaken < 5) damageTaken = 5; // Mínimo 5 de daño

  combatState.playerHP -= damageTaken;
  logToBattle(`💢 ¡El Golem te golpea! Recibes ${damageTaken} de daño.`);

  // 4. Revisar si moriste
  if (combatState.playerHP <= 0) {
    combatState.playerHP = 0;
    updateBattleUI();
    logToBattle("¡Has sido derrotado!");
    setTimeout(() => endCombat(false), 2000); // Perdiste
    return;
  }

  // 5. Sobreviviste, fin del turno
  updateBattleUI();
  setBattleButtons(false); // Reactivar botones
}

// Fin del combate
function endCombat(didPlayerWin) {
  combatState.active = false;
  document.getElementById('battle-overlay').style.display = 'none'; // Ocultar pantalla

  if (didPlayerWin) {
    logToBattle("¡VICTORIA!"); // Log para el diario de batalla
    const msg = `🏆 ¡Has derrotado al ${combatState.enemyName} en el Foso!`;
    state.player.diary.push(msg);
    showToast(msg, "success");
    state.player.lastBossWin = Date.now(); // Poner cooldown
    applyEffect({ xp: 300, gemas: 2 }); // ¡La gran recompensa!
  } else {
    logToBattle("DERROTA..."); // Log para el diario de batalla
    const msg = `☠️ ¡Has sido derrotado en el Foso! Perdiste 50 Créditos.`;
    state.player.diary.push(msg);
    showToast(msg, "error");
    state.player.hp = 1; // Dejarte con 1 HP en el juego principal
  }

  checkLevelUp();
  saveState();
  renderAll(); // Actualizar la UI principal
  renderTab("Foso"); // Refrescar la pestaña del Foso
} 
// --- FIN: LÓGICA DE COMBATE POKÉMON ---
// --- INICIALIZACIÓN ---
checkMimoReset();
checkHabitReset();
checkMissionCooldowns();
checkCompanion();
checkAchievements();
checkDailyLogin(); // Comprobar la racha de conexión (¡debe ir ANTES de renderAll!)
renderTabs();
renderTab("Player");
renderAll();

// --- Bucle de Fondo ---
setInterval(() => {
  const tabActual = document.querySelector(".tab.active")?.textContent;
  checkMissionCooldowns();
  checkCompanion();
  checkMimoReset();

  if (tabActual === "Missions") renderTab("Missions");
  if (tabActual === "Player") renderTab("Player");
  if (tabActual === "Compañero") renderTab("Compañero");
  if (tabActual === "Casino") renderTab("Casino");
}, 30000);
