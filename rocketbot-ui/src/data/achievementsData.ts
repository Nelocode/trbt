// Catálogo Completo de 200 Logros Desbloqueables Estilo Xbox / Steam
export type AchievementCategory =
  | 'academia'
  | 'riesgo'
  | 'ejecucion'
  | 'rendimiento'
  | 'multiactivo'
  | 'ia_mentor'
  | 'disciplina'
  | 'legendario';

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  xp: number;
  iconName: string;
  unlockedAt?: string | null;
}

export const CATEGORY_METADATA: Record<AchievementCategory, { name: string; icon: string; desc: string }> = {
  academia: { name: 'Academia & Aprendizaje', icon: '🎓', desc: 'Tours, guías y conceptos financieros' },
  riesgo: { name: 'Escudos & Gestión de Riesgo', icon: '🛡️', desc: 'Stop Loss, protecciones y preservación' },
  ejecucion: { name: 'Primeros Pasos & Operativa', icon: '🚀', desc: 'Encendido de bot, órdenes y controles' },
  rendimiento: { name: 'Consistencia & Ganancias', icon: '📈', desc: 'Hitos de beneficio y metas diarias' },
  multiactivo: { name: 'Explorador de Mercados', icon: '🪙', desc: 'Cripto, Oro, Petróleo, Divisas e Índices' },
  ia_mentor: { name: 'Mentoría & Diagnóstico IA', icon: '🧠', desc: 'Consultas y confluencias matemáticas' },
  disciplina: { name: 'Psicología & Hábitos Zen', icon: '🧘', desc: 'Paciencia, control emocional y disciplina' },
  legendario: { name: 'Hitos Históricos & Maestría', icon: '👑', desc: 'Récords épicos y maestría cuantitativa' },
};

export const ACHIEVEMENTS_DATA: AchievementItem[] = [
  {
    "id": "acad_01",
    "title": "Cadete Novato",
    "description": "Inicia sesión por primera vez en RocketBot Pro.",
    "category": "academia",
    "rarity": "common",
    "xp": 10,
    "iconName": "Compass"
  },
  {
    "id": "acad_02",
    "title": "Vuelo Inaugural",
    "description": "Completa el Tour Guiado interactivo de principiantes.",
    "category": "academia",
    "rarity": "common",
    "xp": 25,
    "iconName": "Sparkles"
  },
  {
    "id": "acad_03",
    "title": "Lector Voraz",
    "description": "Abre el Glosario y consulta el significado de 3 términos.",
    "category": "academia",
    "rarity": "common",
    "xp": 15,
    "iconName": "BookOpen"
  },
  {
    "id": "acad_04",
    "title": "Maestro del Stop Loss",
    "description": "Lee la micro-cápsula sobre por qué el Stop Loss es tu airbag.",
    "category": "academia",
    "rarity": "common",
    "xp": 20,
    "iconName": "Shield"
  },
  {
    "id": "acad_05",
    "title": "Psicología Cuántica",
    "description": "Aprende por qué el 90% de los traders humanos pierde dinero.",
    "category": "academia",
    "rarity": "common",
    "xp": 20,
    "iconName": "BrainCircuit"
  },
  {
    "id": "acad_06",
    "title": "Fuerza Compuesta",
    "description": "Descubre el poder matemático del interés compuesto en la academia.",
    "category": "academia",
    "rarity": "common",
    "xp": 20,
    "iconName": "TrendingUp"
  },
  {
    "id": "acad_07",
    "title": "Explorador del Simulador",
    "description": "Prueba diferentes montos en el Simulador de Capital.",
    "category": "academia",
    "rarity": "common",
    "xp": 15,
    "iconName": "Calculator"
  },
  {
    "id": "acad_08",
    "title": "Visión Alternativa",
    "description": "Cambia el gráfico entre modo Velas Japonesas y Línea Suave.",
    "category": "academia",
    "rarity": "common",
    "xp": 15,
    "iconName": "LineChart"
  },
  {
    "id": "acad_09",
    "title": "Estudiante de Oro",
    "description": "Descarga o consulta el Manual Institucional de Estrategias en PDF.",
    "category": "academia",
    "rarity": "common",
    "xp": 30,
    "iconName": "FileText"
  },
  {
    "id": "acad_10",
    "title": "Curiosidad sin Límites",
    "description": "Consulta el glosario para entender qué es el Criterio de Kelly.",
    "category": "academia",
    "rarity": "rare",
    "xp": 35,
    "iconName": "HelpCircle"
  },
  {
    "id": "acad_11",
    "title": "Anatomía de una Vela",
    "description": "Examina los precios Open, High, Low y Close en el gráfico en vivo.",
    "category": "academia",
    "rarity": "common",
    "xp": 20,
    "iconName": "CandlestickChart"
  },
  {
    "id": "acad_12",
    "title": "Doctor del Drawdown",
    "description": "Aprende cómo el bot limita el retroceso máximo de tu cartera.",
    "category": "academia",
    "rarity": "rare",
    "xp": 40,
    "iconName": "Percent"
  },
  {
    "id": "acad_13",
    "title": "El Ojo que Todo lo Ve",
    "description": "Inspecciona las 3 medias móviles institucionales (EMA 21, 50 y 200).",
    "category": "academia",
    "rarity": "rare",
    "xp": 35,
    "iconName": "Eye"
  },
  {
    "id": "acad_14",
    "title": "Sinfonía Financiera",
    "description": "Activa o personaliza los efectos sonoros armónicos del sistema.",
    "category": "academia",
    "rarity": "common",
    "xp": 15,
    "iconName": "Volume2"
  },
  {
    "id": "acad_15",
    "title": "Compartir es Crecer",
    "description": "Genera y copia tu primer Resumen Flash de la sesión.",
    "category": "academia",
    "rarity": "common",
    "xp": 25,
    "iconName": "Share2"
  },
  {
    "id": "acad_16",
    "title": "Graduado del Simulador",
    "description": "Completa 3 días operando de forma continua en Modo Práctica.",
    "category": "academia",
    "rarity": "rare",
    "xp": 50,
    "iconName": "GraduationCap"
  },
  {
    "id": "acad_17",
    "title": "Filósofo del Riesgo",
    "description": "Entiende la diferencia entre pérdida flotante y pérdida realizada.",
    "category": "academia",
    "rarity": "rare",
    "xp": 30,
    "iconName": "Lightbulb"
  },
  {
    "id": "acad_18",
    "title": "Conocedor de Apalancamiento",
    "description": "Comprende el apalancamiento 3x aislado vs operaciones al contado.",
    "category": "academia",
    "rarity": "rare",
    "xp": 35,
    "iconName": "Zap"
  },
  {
    "id": "acad_19",
    "title": "Auditor de Estrategias",
    "description": "Conoce las 4 estrategias cuantitativas integradas en el motor.",
    "category": "academia",
    "rarity": "rare",
    "xp": 45,
    "iconName": "Cpu"
  },
  {
    "id": "acad_20",
    "title": "Detector de Confluencia",
    "description": "Aprende qué es una confluencia matemática de 3 factores.",
    "category": "academia",
    "rarity": "epic",
    "xp": 60,
    "iconName": "Target"
  },
  {
    "id": "acad_21",
    "title": "Mente de Fondo de Inversión",
    "description": "Comprende por qué el bot espera con paciencia antes de operar.",
    "category": "academia",
    "rarity": "rare",
    "xp": 40,
    "iconName": "Clock"
  },
  {
    "id": "acad_22",
    "title": "Inspector de Liquidez",
    "description": "Aprende cómo el bot evalúa la profundidad de mercado en los pares.",
    "category": "academia",
    "rarity": "epic",
    "xp": 55,
    "iconName": "Layers"
  },
  {
    "id": "acad_23",
    "title": "Erudito Cuantitativo",
    "description": "Lee las 3 micro-cápsulas de aprendizaje completas.",
    "category": "academia",
    "rarity": "epic",
    "xp": 70,
    "iconName": "Award"
  },
  {
    "id": "acad_24",
    "title": "Enciclopedia Andante",
    "description": "Consulta 10 términos diferentes dentro del Glosario.",
    "category": "academia",
    "rarity": "epic",
    "xp": 75,
    "iconName": "BookMarked"
  },
  {
    "id": "acad_25",
    "title": "Licencia de Piloto Aprobada",
    "description": "Completa todos los pasos de aprendizaje del módulo Principiante.",
    "category": "academia",
    "rarity": "legendary",
    "xp": 100,
    "iconName": "Medal"
  },
  {
    "id": "risk_01",
    "title": "Cinturón Ajustado",
    "description": "Verifica que el Stop Loss automático esté activo en una posición.",
    "category": "riesgo",
    "rarity": "common",
    "xp": 15,
    "iconName": "ShieldCheck"
  },
  {
    "id": "risk_02",
    "title": "Búnker Activado",
    "description": "Selecciona el perfil de riesgo Conservador.",
    "category": "riesgo",
    "rarity": "common",
    "xp": 20,
    "iconName": "Shield"
  },
  {
    "id": "risk_03",
    "title": "Vuelo Equilibrado",
    "description": "Activa el perfil de riesgo Equilibrado recomendado.",
    "category": "riesgo",
    "rarity": "common",
    "xp": 20,
    "iconName": "Scale"
  },
  {
    "id": "risk_04",
    "title": "Impulso Controlado",
    "description": "Prueba el perfil Crecimiento Moderado con salvaguarda.",
    "category": "riesgo",
    "rarity": "rare",
    "xp": 30,
    "iconName": "Flame"
  },
  {
    "id": "risk_05",
    "title": "Noche de Paz",
    "description": "Activa el Modo Dormir Tranquilo antes de las 22:00.",
    "category": "riesgo",
    "rarity": "common",
    "xp": 25,
    "iconName": "Moon"
  },
  {
    "id": "risk_06",
    "title": "Guardián del Freno",
    "description": "Conoce el CircuitBreaker Diario programado al 4% de protección.",
    "category": "riesgo",
    "rarity": "common",
    "xp": 20,
    "iconName": "Lock"
  },
  {
    "id": "risk_07",
    "title": "Cero Sobre-Operación",
    "description": "Verifica el tiempo de enfriamiento obligatorio entre órdenes.",
    "category": "riesgo",
    "rarity": "common",
    "xp": 20,
    "iconName": "Timer"
  },
  {
    "id": "risk_08",
    "title": "Escudo Anti-Rachas",
    "description": "Activa la protección preventiva tras pérdidas consecutivas.",
    "category": "riesgo",
    "rarity": "rare",
    "xp": 40,
    "iconName": "ShieldAlert"
  },
  {
    "id": "risk_09",
    "title": "Filtro Anti-Gravedad",
    "description": "Comprueba que el bot no compra en caídas libres bajo la EMA 200.",
    "category": "riesgo",
    "rarity": "rare",
    "xp": 35,
    "iconName": "Anchor"
  },
  {
    "id": "risk_10",
    "title": "Blindaje Impecable",
    "description": "Mantén tu cuenta con Drawdown diario inferior al 2% durante toda la semana.",
    "category": "riesgo",
    "rarity": "rare",
    "xp": 50,
    "iconName": "ShieldCheck"
  },
  {
    "id": "risk_11",
    "title": "Protección Nocturna 48h",
    "description": "Duerme tranquilo durante 2 noches consecutivas con el escudo nocturno.",
    "category": "riesgo",
    "rarity": "rare",
    "xp": 45,
    "iconName": "MoonStar"
  },
  {
    "id": "risk_12",
    "title": "Defensa de Acero",
    "description": "Cierra una posición manualmente antes de que toque el Stop extremo.",
    "category": "riesgo",
    "rarity": "rare",
    "xp": 35,
    "iconName": "CheckCircle"
  },
  {
    "id": "risk_13",
    "title": "Retiro al Refugio",
    "description": "Alcanza tu meta diaria y deja que el bot descanse en balance libre.",
    "category": "riesgo",
    "rarity": "rare",
    "xp": 50,
    "iconName": "Home"
  },
  {
    "id": "risk_14",
    "title": "Paracaídas Desplegado",
    "description": "Experimenta la protección de una orden cerrada con pérdida mínima calculada.",
    "category": "riesgo",
    "rarity": "common",
    "xp": 25,
    "iconName": "Umbrella"
  },
  {
    "id": "risk_15",
    "title": "Control de Margen",
    "description": "Mantén tu margen utilizado por debajo del 20% del balance total.",
    "category": "riesgo",
    "rarity": "rare",
    "xp": 40,
    "iconName": "PieChart"
  },
  {
    "id": "risk_16",
    "title": "Paz de Fin de Semana",
    "description": "Activa la pausa preventiva de fin de semana para evitar gaps.",
    "category": "riesgo",
    "rarity": "rare",
    "xp": 45,
    "iconName": "Coffee"
  },
  {
    "id": "risk_17",
    "title": "Disyuntor Probado",
    "description": "Verifica la telemetría del disyuntor automático en tiempo real.",
    "category": "riesgo",
    "rarity": "rare",
    "xp": 35,
    "iconName": "ZapOff"
  },
  {
    "id": "risk_18",
    "title": "Muralla Institucional",
    "description": "Supera 20 órdenes sin violar jamás el límite diario del 4%.",
    "category": "riesgo",
    "rarity": "epic",
    "xp": 75,
    "iconName": "Castle"
  },
  {
    "id": "risk_19",
    "title": "Riesgo Cero Emocional",
    "description": "Opera durante una semana completa sin alterar los límites por impulso.",
    "category": "riesgo",
    "rarity": "epic",
    "xp": 80,
    "iconName": "Heart"
  },
  {
    "id": "risk_20",
    "title": "Guardián del Capital",
    "description": "Preserva el 98% o más de tu balance tras un día de alta volatilidad.",
    "category": "riesgo",
    "rarity": "epic",
    "xp": 85,
    "iconName": "Shield"
  },
  {
    "id": "risk_21",
    "title": "MAM Segregada",
    "description": "Comprueba el aislamiento del 100% de capital entre subcuentas.",
    "category": "riesgo",
    "rarity": "rare",
    "xp": 40,
    "iconName": "FolderLock"
  },
  {
    "id": "risk_22",
    "title": "Kill-Switch bajo Control",
    "description": "Localiza el botón de parada de emergencia institucional.",
    "category": "riesgo",
    "rarity": "common",
    "xp": 20,
    "iconName": "AlertOctagon"
  },
  {
    "id": "risk_23",
    "title": "Filtro ADX de Fortaleza",
    "description": "Comprueba que el filtro de fuerza tendencial ADX rechace entradas débiles.",
    "category": "riesgo",
    "rarity": "epic",
    "xp": 70,
    "iconName": "Gauge"
  },
  {
    "id": "risk_24",
    "title": "Muralla de Titanio",
    "description": "Alcanza 50 operaciones protegidas con estricta gestión de riesgo.",
    "category": "riesgo",
    "rarity": "legendary",
    "xp": 100,
    "iconName": "ShieldCheck"
  },
  {
    "id": "risk_25",
    "title": "Inmune a la Quiebra",
    "description": "Demuestra matemáticamente cero riesgo de ruina tras 100 trades.",
    "category": "riesgo",
    "rarity": "legendary",
    "xp": 150,
    "iconName": "Trophy"
  },
  {
    "id": "exec_01",
    "title": "Ignición de Motores",
    "description": "Inicia las operaciones del bot por primera vez.",
    "category": "ejecucion",
    "rarity": "common",
    "xp": 20,
    "iconName": "Play"
  },
  {
    "id": "exec_02",
    "title": "Primera Huella Verde",
    "description": "Consigue tu primer trade cerrado en terreno positivo.",
    "category": "ejecucion",
    "rarity": "common",
    "xp": 25,
    "iconName": "TrendingUp"
  },
  {
    "id": "exec_03",
    "title": "Pausa Táctica",
    "description": "Pausa el bot de forma segura y comprueba el saldo protegido.",
    "category": "ejecucion",
    "rarity": "common",
    "xp": 15,
    "iconName": "Pause"
  },
  {
    "id": "exec_04",
    "title": "Maestro del Switcher",
    "description": "Alterna entre la Vista Principiante y la Vista PRO con un clic.",
    "category": "ejecucion",
    "rarity": "common",
    "xp": 15,
    "iconName": "Sliders"
  },
  {
    "id": "exec_05",
    "title": "Bautismo de Fuego",
    "description": "Presencia tu primera orden de compra automática en vivo.",
    "category": "ejecucion",
    "rarity": "common",
    "xp": 20,
    "iconName": "Zap"
  },
  {
    "id": "exec_06",
    "title": "Salida Perfecta",
    "description": "Observa cómo el bot asegura un Take Profit automático.",
    "category": "ejecucion",
    "rarity": "common",
    "xp": 30,
    "iconName": "Target"
  },
  {
    "id": "exec_07",
    "title": "Navegante de Velas",
    "description": "Cambia la temporalidad del gráfico entre 1m, 5m y 15m.",
    "category": "ejecucion",
    "rarity": "common",
    "xp": 15,
    "iconName": "Clock"
  },
  {
    "id": "exec_08",
    "title": "Cierre Relámpago",
    "description": "Usa el botón Cerrar Ahora para asegurar ganancias en un trade.",
    "category": "ejecucion",
    "rarity": "common",
    "xp": 20,
    "iconName": "XCircle"
  },
  {
    "id": "exec_09",
    "title": "Explorador Táctil",
    "description": "Toca una operación en curso para enfocar su gráfico superior.",
    "category": "ejecucion",
    "rarity": "common",
    "xp": 15,
    "iconName": "MousePointer"
  },
  {
    "id": "exec_10",
    "title": "Cinco en Marcha",
    "description": "Acumula tus primeras 5 operaciones automáticas ejecutadas.",
    "category": "ejecucion",
    "rarity": "common",
    "xp": 30,
    "iconName": "Activity"
  },
  {
    "id": "exec_11",
    "title": "Diez sin Miedo",
    "description": "Alcanza 10 operaciones completadas en el historial.",
    "category": "ejecucion",
    "rarity": "rare",
    "xp": 40,
    "iconName": "ListChecks"
  },
  {
    "id": "exec_12",
    "title": "Doble Victoria",
    "description": "Consigue dos operaciones ganadoras en la misma sesión.",
    "category": "ejecucion",
    "rarity": "rare",
    "xp": 35,
    "iconName": "CheckCheck"
  },
  {
    "id": "exec_13",
    "title": "Triple Acierto",
    "description": "Logra 3 operaciones positivas seguidas.",
    "category": "ejecucion",
    "rarity": "rare",
    "xp": 50,
    "iconName": "Flame"
  },
  {
    "id": "exec_14",
    "title": "Operador de Contado",
    "description": "Ejecuta operaciones exclusivamente en modo SPOT.",
    "category": "ejecucion",
    "rarity": "common",
    "xp": 25,
    "iconName": "Coins"
  },
  {
    "id": "exec_15",
    "title": "Piloto de Futuros",
    "description": "Observa una posición protegida en modo Futuros con apalancamiento.",
    "category": "ejecucion",
    "rarity": "rare",
    "xp": 35,
    "iconName": "Rocket"
  },
  {
    "id": "exec_16",
    "title": "Supervisión en Celular",
    "description": "Abre el panel desde tu teléfono móvil y navega sin amontonamiento.",
    "category": "ejecucion",
    "rarity": "common",
    "xp": 25,
    "iconName": "Smartphone"
  },
  {
    "id": "exec_17",
    "title": "Modo Sigilo",
    "description": "Activa el Modo Privacidad para ocultar balances en capturas.",
    "category": "ejecucion",
    "rarity": "common",
    "xp": 20,
    "iconName": "EyeOff"
  },
  {
    "id": "exec_18",
    "title": "Radar de Frecuencia",
    "description": "Observa cómo se actualiza el precio en vivo tick a tick.",
    "category": "ejecucion",
    "rarity": "common",
    "xp": 15,
    "iconName": "Radio"
  },
  {
    "id": "exec_19",
    "title": "Velocidad Cuántica",
    "description": "Verifica la latencia de WebSocket inferior a 10 milisegundos.",
    "category": "ejecucion",
    "rarity": "rare",
    "xp": 30,
    "iconName": "Wifi"
  },
  {
    "id": "exec_20",
    "title": "Racha de Cinco",
    "description": "Alcanza 5 operaciones ganadoras consecutivas.",
    "category": "ejecucion",
    "rarity": "epic",
    "xp": 75,
    "iconName": "Zap"
  },
  {
    "id": "exec_21",
    "title": "Maestro de la Ejecución",
    "description": "Completa 25 operaciones totales con el bot.",
    "category": "ejecucion",
    "rarity": "rare",
    "xp": 50,
    "iconName": "CheckCircle2"
  },
  {
    "id": "exec_22",
    "title": "Cincuenta Órdenes",
    "description": "Alcanza las 50 operaciones procesadas por el motor.",
    "category": "ejecucion",
    "rarity": "epic",
    "xp": 80,
    "iconName": "Award"
  },
  {
    "id": "exec_23",
    "title": "Cien Transacciones",
    "description": "Llega a 100 operaciones registradas en tu subcuenta.",
    "category": "ejecucion",
    "rarity": "epic",
    "xp": 100,
    "iconName": "Medal"
  },
  {
    "id": "exec_24",
    "title": "Velocista del Mercado",
    "description": "Presencia una entrada y salida exitosa en menos de 1 hora.",
    "category": "ejecucion",
    "rarity": "rare",
    "xp": 40,
    "iconName": "Hourglass"
  },
  {
    "id": "exec_25",
    "title": "Comandante de Operaciones",
    "description": "Acumula 200 órdenes gestionadas de forma 100% matemática.",
    "category": "ejecucion",
    "rarity": "legendary",
    "xp": 150,
    "iconName": "Crown"
  },
  {
    "id": "pnl_01",
    "title": "Primer Billete Verde",
    "description": "Genera tus primeros  USD de ganancia neta.",
    "category": "rendimiento",
    "rarity": "common",
    "xp": 20,
    "iconName": "DollarSign"
  },
  {
    "id": "pnl_02",
    "title": "Cincuenta en el Bolsillo",
    "description": "Supera los  USD acumulados en beneficios.",
    "category": "rendimiento",
    "rarity": "common",
    "xp": 30,
    "iconName": "Banknote"
  },
  {
    "id": "pnl_03",
    "title": "Club de los Cien",
    "description": "Alcanza los  USD de ganancia total.",
    "category": "rendimiento",
    "rarity": "rare",
    "xp": 50,
    "iconName": "PiggyBank"
  },
  {
    "id": "pnl_04",
    "title": "Doscientos Cincuenta",
    "description": "Acumula  USD en rendimiento neto.",
    "category": "rendimiento",
    "rarity": "rare",
    "xp": 65,
    "iconName": "TrendingUp"
  },
  {
    "id": "pnl_05",
    "title": "Medio Millar",
    "description": "Logra tus primeros  USD de beneficio en la cuenta.",
    "category": "rendimiento",
    "rarity": "epic",
    "xp": 90,
    "iconName": "Gem"
  },
  {
    "id": "pnl_06",
    "title": "Mil Dólares Verdes",
    "description": "Alcanza el hito histórico de ,000 USD de ganancia acumulada.",
    "category": "rendimiento",
    "rarity": "legendary",
    "xp": 150,
    "iconName": "Trophy"
  },
  {
    "id": "pnl_07",
    "title": "Tasa Sesenta",
    "description": "Mantén una tasa de acierto (Win Rate) superior al 60%.",
    "category": "rendimiento",
    "rarity": "common",
    "xp": 30,
    "iconName": "Percent"
  },
  {
    "id": "pnl_08",
    "title": "Tasa Setenta",
    "description": "Consigue un Win Rate igual o mayor al 70%.",
    "category": "rendimiento",
    "rarity": "rare",
    "xp": 50,
    "iconName": "Award"
  },
  {
    "id": "pnl_09",
    "title": "Tasa Ochenta",
    "description": "Alcanza un impresionante 80% de operaciones ganadoras.",
    "category": "rendimiento",
    "rarity": "epic",
    "xp": 80,
    "iconName": "Star"
  },
  {
    "id": "pnl_10",
    "title": "Meta del Día 1",
    "description": "Cumple tu primera meta diaria de ganancias.",
    "category": "rendimiento",
    "rarity": "common",
    "xp": 25,
    "iconName": "Target"
  },
  {
    "id": "pnl_11",
    "title": "Meta del Día x3",
    "description": "Cumple la meta diaria durante 3 días en la misma semana.",
    "category": "rendimiento",
    "rarity": "rare",
    "xp": 50,
    "iconName": "CheckCheck"
  },
  {
    "id": "pnl_12",
    "title": "Semana en Positivo",
    "description": "Cierra una semana completa con balance total en verde.",
    "category": "rendimiento",
    "rarity": "rare",
    "xp": 60,
    "iconName": "CalendarCheck"
  },
  {
    "id": "pnl_13",
    "title": "Dos Semanas Invictas",
    "description": "Acumula dos semanas consecutivas de rendimiento positivo.",
    "category": "rendimiento",
    "rarity": "epic",
    "xp": 85,
    "iconName": "Sparkles"
  },
  {
    "id": "pnl_14",
    "title": "Mes Consistente",
    "description": "Cierra un mes entero con retorno neto positivo.",
    "category": "rendimiento",
    "rarity": "legendary",
    "xp": 150,
    "iconName": "Crown"
  },
  {
    "id": "pnl_15",
    "title": "Retorno Cinco",
    "description": "Logra un retorno superior al +5% sobre tu balance total.",
    "category": "rendimiento",
    "rarity": "rare",
    "xp": 40,
    "iconName": "TrendingUp"
  },
  {
    "id": "pnl_16",
    "title": "Retorno Diez",
    "description": "Alcanza el +10% de crecimiento en tu capital de trading.",
    "category": "rendimiento",
    "rarity": "epic",
    "xp": 75,
    "iconName": "Rocket"
  },
  {
    "id": "pnl_17",
    "title": "Retorno Veinte",
    "description": "Consigue un +20% de incremento en la curva de capital.",
    "category": "rendimiento",
    "rarity": "legendary",
    "xp": 120,
    "iconName": "Flame"
  },
  {
    "id": "pnl_18",
    "title": "Profit Factor Dos",
    "description": "Consigue un ratio de Profit Factor superior a 2.0.",
    "category": "rendimiento",
    "rarity": "rare",
    "xp": 50,
    "iconName": "Divide"
  },
  {
    "id": "pnl_19",
    "title": "Cero Ruina",
    "description": "Mantén tu curva de capital en ascenso constante durante 30 días.",
    "category": "rendimiento",
    "rarity": "epic",
    "xp": 90,
    "iconName": "LineChart"
  },
  {
    "id": "pnl_20",
    "title": "Día Soñado",
    "description": "Genera más de  USD de ganancia en una sola jornada.",
    "category": "rendimiento",
    "rarity": "epic",
    "xp": 80,
    "iconName": "Sun"
  },
  {
    "id": "pnl_21",
    "title": "Trade Estrella",
    "description": "Consigue una operación individual con más de +8% de rendimiento.",
    "category": "rendimiento",
    "rarity": "rare",
    "xp": 45,
    "iconName": "Star"
  },
  {
    "id": "pnl_22",
    "title": "Racha de Oro",
    "description": "Logra 7 operaciones ganadoras consecutivas.",
    "category": "rendimiento",
    "rarity": "epic",
    "xp": 90,
    "iconName": "Medal"
  },
  {
    "id": "pnl_23",
    "title": "Racha Legendaria",
    "description": "Consigue 10 operaciones consecutivas en verde.",
    "category": "rendimiento",
    "rarity": "legendary",
    "xp": 150,
    "iconName": "Trophy"
  },
  {
    "id": "pnl_24",
    "title": "Curva de Crecimiento",
    "description": "Multiplica tu saldo inicial por 1.25x mediante interés compuesto.",
    "category": "rendimiento",
    "rarity": "legendary",
    "xp": 180,
    "iconName": "TrendingUp"
  },
  {
    "id": "pnl_25",
    "title": "Maestro del Capital",
    "description": "Supera los ,000 USD de PnL neto en el ecosistema RocketBot.",
    "category": "rendimiento",
    "rarity": "legendary",
    "xp": 250,
    "iconName": "Crown"
  },
  {
    "id": "asset_01",
    "title": "Pionero de Bitcoin",
    "description": "Revisa el gráfico en vivo o tradea en Bitcoin (BTC/USDT).",
    "category": "multiactivo",
    "rarity": "common",
    "xp": 15,
    "iconName": "Coins"
  },
  {
    "id": "asset_02",
    "title": "Creyente de Ethereum",
    "description": "Inspecciona la cotización y señales de Ethereum (ETH/USDT).",
    "category": "multiactivo",
    "rarity": "common",
    "xp": 15,
    "iconName": "Zap"
  },
  {
    "id": "asset_03",
    "title": "Rayo de Solana",
    "description": "Supervisa la velocidad de mercado en Solana (SOL/USDT).",
    "category": "multiactivo",
    "rarity": "common",
    "xp": 15,
    "iconName": "Flame"
  },
  {
    "id": "asset_04",
    "title": "Montaña de Avalanche",
    "description": "Explora las cotizaciones de Avalanche (AVAX/USDT).",
    "category": "multiactivo",
    "rarity": "common",
    "xp": 15,
    "iconName": "Mountain"
  },
  {
    "id": "asset_05",
    "title": "Fiebre del Oro",
    "description": "Analiza el activo refugio mundial Oro Real (XAU/USD).",
    "category": "multiactivo",
    "rarity": "common",
    "xp": 20,
    "iconName": "Gem"
  },
  {
    "id": "asset_06",
    "title": "Oro Negro",
    "description": "Explora la volatilidad energética en Petróleo WTI (WTI/USD).",
    "category": "multiactivo",
    "rarity": "common",
    "xp": 20,
    "iconName": "Fuel"
  },
  {
    "id": "asset_07",
    "title": "Brillo Plateado",
    "description": "Consulta el mercado de Plata Fina (XAG/USD).",
    "category": "multiactivo",
    "rarity": "common",
    "xp": 15,
    "iconName": "CircleDot"
  },
  {
    "id": "asset_08",
    "title": "Rey del Forex",
    "description": "Monitorea el par de divisas principal Euro/Dólar (EUR/USD).",
    "category": "multiactivo",
    "rarity": "common",
    "xp": 15,
    "iconName": "Globe"
  },
  {
    "id": "asset_09",
    "title": "La City de Londres",
    "description": "Revisa la Libra Esterlina vs Dólar (GBP/USD).",
    "category": "multiactivo",
    "rarity": "common",
    "xp": 15,
    "iconName": "Landmark"
  },
  {
    "id": "asset_10",
    "title": "Sol Naciente",
    "description": "Explora el par Dólar vs Yen Japonés (USD/JPY).",
    "category": "multiactivo",
    "rarity": "common",
    "xp": 15,
    "iconName": "Sun"
  },
  {
    "id": "asset_11",
    "title": "Las 500 Grandes",
    "description": "Inspecciona el índice S&P 500 (SPX500/USD).",
    "category": "multiactivo",
    "rarity": "common",
    "xp": 20,
    "iconName": "Building2"
  },
  {
    "id": "asset_12",
    "title": "Titán Tecnológico",
    "description": "Supervisa el índice Nasdaq 100 (NAS100/USD).",
    "category": "multiactivo",
    "rarity": "common",
    "xp": 20,
    "iconName": "Laptop"
  },
  {
    "id": "asset_13",
    "title": "Tríada Cripto",
    "description": "Revisa BTC, ETH y SOL en la misma sesión.",
    "category": "multiactivo",
    "rarity": "common",
    "xp": 25,
    "iconName": "Grid3X3"
  },
  {
    "id": "asset_14",
    "title": "Dúo de Materias Primas",
    "description": "Consulta Oro y Petróleo en la misma jornada.",
    "category": "multiactivo",
    "rarity": "rare",
    "xp": 35,
    "iconName": "Sparkles"
  },
  {
    "id": "asset_15",
    "title": "Trinidad de Divisas",
    "description": "Inspecciona EUR/USD, GBP/USD y USD/JPY.",
    "category": "multiactivo",
    "rarity": "rare",
    "xp": 35,
    "iconName": "Coins"
  },
  {
    "id": "asset_16",
    "title": "Bolsas Globales",
    "description": "Compara el S&P 500 y el Nasdaq 100 en simultáneo.",
    "category": "multiactivo",
    "rarity": "rare",
    "xp": 40,
    "iconName": "TrendingUp"
  },
  {
    "id": "asset_17",
    "title": "Carroza de Oro",
    "description": "Consigue un trade con ganancia positiva en Oro Real.",
    "category": "multiactivo",
    "rarity": "rare",
    "xp": 45,
    "iconName": "Gem"
  },
  {
    "id": "asset_18",
    "title": "Satoshis en Verde",
    "description": "Cierra un trade positivo en Bitcoin.",
    "category": "multiactivo",
    "rarity": "rare",
    "xp": 40,
    "iconName": "Coins"
  },
  {
    "id": "asset_19",
    "title": "Rally Tecnológico",
    "description": "Consigue una operación ganadora en Nasdaq 100.",
    "category": "multiactivo",
    "rarity": "rare",
    "xp": 45,
    "iconName": "Laptop"
  },
  {
    "id": "asset_20",
    "title": "Operador de Forex",
    "description": "Logra un trade ganador en divisas tradicionales.",
    "category": "multiactivo",
    "rarity": "rare",
    "xp": 40,
    "iconName": "Globe"
  },
  {
    "id": "asset_21",
    "title": "Cuatro Esquinas",
    "description": "Opera al menos 1 activo de cada categoría (Crypto, Materias, Forex, Índices).",
    "category": "multiactivo",
    "rarity": "epic",
    "xp": 75,
    "iconName": "Compass"
  },
  {
    "id": "asset_22",
    "title": "Inversionista Diversificado",
    "description": "Mantén posiciones abiertas en 3 activos diferentes simultáneamente.",
    "category": "multiactivo",
    "rarity": "epic",
    "xp": 70,
    "iconName": "PieChart"
  },
  {
    "id": "asset_23",
    "title": "Maestro de Materias",
    "description": "Consigue 5 trades ganadores en Oro y Metales.",
    "category": "multiactivo",
    "rarity": "epic",
    "xp": 80,
    "iconName": "Award"
  },
  {
    "id": "asset_24",
    "title": "Conquistador de Wall St.",
    "description": "Acumula 10 trades positivos en S&P 500 y Nasdaq.",
    "category": "multiactivo",
    "rarity": "epic",
    "xp": 90,
    "iconName": "Building"
  },
  {
    "id": "asset_25",
    "title": "Globo-Terráqueo Quant",
    "description": "Opera con éxito en los 12 activos integrados en el ecosistema.",
    "category": "multiactivo",
    "rarity": "legendary",
    "xp": 150,
    "iconName": "Globe2"
  },
  {
    "id": "ai_01",
    "title": "Hola Prof. Quant",
    "description": "Abre el cajón del Mentor IA por primera vez.",
    "category": "ia_mentor",
    "rarity": "common",
    "xp": 15,
    "iconName": "Bot"
  },
  {
    "id": "ai_02",
    "title": "Curiosidad Algorítmica",
    "description": "Pregunta al Mentor IA sobre el estado del mercado.",
    "category": "ia_mentor",
    "rarity": "common",
    "xp": 20,
    "iconName": "MessageSquare"
  },
  {
    "id": "ai_03",
    "title": "El Porqué del Trade",
    "description": "Usa el botón \"¿Por qué compraste?\" en una operación abierta.",
    "category": "ia_mentor",
    "rarity": "common",
    "xp": 25,
    "iconName": "Lightbulb"
  },
  {
    "id": "ai_04",
    "title": "Auditoría Cuántica",
    "description": "Solicita al Mentor un diagnóstico de riesgo de tu cuenta.",
    "category": "ia_mentor",
    "rarity": "rare",
    "xp": 35,
    "iconName": "FileCheck"
  },
  {
    "id": "ai_05",
    "title": "Luz en la Niebla",
    "description": "Consulta al Mentor IA durante un momento de mercado bajista.",
    "category": "ia_mentor",
    "rarity": "rare",
    "xp": 30,
    "iconName": "SunMedium"
  },
  {
    "id": "ai_06",
    "title": "Doble Confirmación",
    "description": "Verifica que la probabilidad matemática del trade sea mayor al 70%.",
    "category": "ia_mentor",
    "rarity": "rare",
    "xp": 35,
    "iconName": "CheckCircle"
  },
  {
    "id": "ai_07",
    "title": "Consulta Nocturna",
    "description": "Pide al Mentor IA un balance antes de ir a dormir.",
    "category": "ia_mentor",
    "rarity": "common",
    "xp": 20,
    "iconName": "Moon"
  },
  {
    "id": "ai_08",
    "title": "Alumno Aplicado",
    "description": "Haz 5 preguntas distintas al Mentor IA.",
    "category": "ia_mentor",
    "rarity": "rare",
    "xp": 40,
    "iconName": "HelpCircle"
  },
  {
    "id": "ai_09",
    "title": "Cerebro Artificial",
    "description": "Lee la explicación de predicción FreqAI basada en Machine Learning.",
    "category": "ia_mentor",
    "rarity": "rare",
    "xp": 45,
    "iconName": "Cpu"
  },
  {
    "id": "ai_10",
    "title": "Guía en Vivo",
    "description": "Sigue un consejo de gestión de riesgo sugerido por el Mentor.",
    "category": "ia_mentor",
    "rarity": "rare",
    "xp": 40,
    "iconName": "ThumbsUp"
  },
  {
    "id": "ai_11",
    "title": "Consejero de Cartera",
    "description": "Pregunta al Mentor cuál es el activo con mayor fuerza relativa hoy.",
    "category": "ia_mentor",
    "rarity": "rare",
    "xp": 35,
    "iconName": "Sparkles"
  },
  {
    "id": "ai_12",
    "title": "Filtro Anti-Pánico",
    "description": "Consulta al Mentor ante una caída brusca de precio para mantener la calma.",
    "category": "ia_mentor",
    "rarity": "rare",
    "xp": 50,
    "iconName": "Heart"
  },
  {
    "id": "ai_13",
    "title": "Especialista en Confluencia",
    "description": "Revisa un trade con 3 condiciones de entrada validadas por IA.",
    "category": "ia_mentor",
    "rarity": "epic",
    "xp": 60,
    "iconName": "Target"
  },
  {
    "id": "ai_14",
    "title": "Auditor de Kelly",
    "description": "Pregunta al Mentor por qué sugiere ese tamaño específico de orden.",
    "category": "ia_mentor",
    "rarity": "rare",
    "xp": 40,
    "iconName": "Calculator"
  },
  {
    "id": "ai_15",
    "title": "Tutor Personal 24/7",
    "description": "Interactúa con el Mentor durante 3 días distintos.",
    "category": "ia_mentor",
    "rarity": "rare",
    "xp": 45,
    "iconName": "Clock"
  },
  {
    "id": "ai_16",
    "title": "Analista de Sentimiento",
    "description": "Pregunta al Mentor sobre el régimen de mercado (alcista, bajista o rango).",
    "category": "ia_mentor",
    "rarity": "rare",
    "xp": 35,
    "iconName": "Compass"
  },
  {
    "id": "ai_17",
    "title": "Optimizador de Salidas",
    "description": "Revisa la proyección de Take Profit recomendada por el algoritmo.",
    "category": "ia_mentor",
    "rarity": "rare",
    "xp": 40,
    "iconName": "Maximize2"
  },
  {
    "id": "ai_18",
    "title": "Copiloto de Vuelo",
    "description": "Opera con el asistente de IA abierto durante una sesión completa.",
    "category": "ia_mentor",
    "rarity": "epic",
    "xp": 65,
    "iconName": "Headphones"
  },
  {
    "id": "ai_19",
    "title": "Entrenamiento de Red",
    "description": "Explora los pesos probabilísticos de los modelos en la pestaña FreqAI.",
    "category": "ia_mentor",
    "rarity": "epic",
    "xp": 75,
    "iconName": "Network"
  },
  {
    "id": "ai_20",
    "title": "Diez Respuestas Sabias",
    "description": "Realiza 10 consultas profundas al Mentor Cuántico.",
    "category": "ia_mentor",
    "rarity": "epic",
    "xp": 70,
    "iconName": "Award"
  },
  {
    "id": "ai_21",
    "title": "Cero Dudas",
    "description": "Consulta la justificación de 5 operaciones consecutivas.",
    "category": "ia_mentor",
    "rarity": "epic",
    "xp": 80,
    "iconName": "ListChecks"
  },
  {
    "id": "ai_22",
    "title": "Estrategia Personalizada",
    "description": "Pide al Mentor recomendaciones sobre qué pares se adaptan mejor a tu capital.",
    "category": "ia_mentor",
    "rarity": "epic",
    "xp": 75,
    "iconName": "Sliders"
  },
  {
    "id": "ai_23",
    "title": "Simbiosis Humano-Máquina",
    "description": "Logra 20 operaciones exitosas siguiendo las advertencias del Mentor.",
    "category": "ia_mentor",
    "rarity": "legendary",
    "xp": 120,
    "iconName": "Bot"
  },
  {
    "id": "ai_24",
    "title": "Graduado del Copiloto",
    "description": "Completa 50 interacciones educativas con la inteligencia artificial.",
    "category": "ia_mentor",
    "rarity": "legendary",
    "xp": 150,
    "iconName": "GraduationCap"
  },
  {
    "id": "ai_25",
    "title": "Oráculo Financiero",
    "description": "Alcanza una tasa de acierto del 80% en trades recomendados por IA.",
    "category": "ia_mentor",
    "rarity": "legendary",
    "xp": 200,
    "iconName": "Crown"
  },
  {
    "id": "zen_01",
    "title": "Paciencia de Monje",
    "description": "Deja correr una operación sin intervenir manualmente hasta su Take Profit.",
    "category": "disciplina",
    "rarity": "common",
    "xp": 25,
    "iconName": "Smile"
  },
  {
    "id": "zen_02",
    "title": "Cero Fomo",
    "description": "Observa una subida de precio sin entrar tarde por impulso.",
    "category": "disciplina",
    "rarity": "common",
    "xp": 20,
    "iconName": "Shield"
  },
  {
    "id": "zen_03",
    "title": "Aceptación del Stop",
    "description": "Acepta una pequeña pérdida de Stop Loss como costo del negocio.",
    "category": "disciplina",
    "rarity": "common",
    "xp": 25,
    "iconName": "Check"
  },
  {
    "id": "zen_04",
    "title": "Mente Fría",
    "description": "Evita modificar el tamaño de orden después de una racha ganadora.",
    "category": "disciplina",
    "rarity": "rare",
    "xp": 35,
    "iconName": "Snowflake"
  },
  {
    "id": "zen_05",
    "title": "Disciplina de Acero",
    "description": "Opera toda una semana respetando estrictamente tu perfil de riesgo.",
    "category": "disciplina",
    "rarity": "rare",
    "xp": 45,
    "iconName": "Award"
  },
  {
    "id": "zen_06",
    "title": "Fin del Sobre-Trading",
    "description": "Pausa el bot tras alcanzar tu objetivo sin buscar \"una operación más\".",
    "category": "disciplina",
    "rarity": "rare",
    "xp": 40,
    "iconName": "Anchor"
  },
  {
    "id": "zen_07",
    "title": "Desconexión Saludable",
    "description": "Cierra la pantalla y deja al bot operar solo durante 4 horas.",
    "category": "disciplina",
    "rarity": "common",
    "xp": 25,
    "iconName": "Coffee"
  },
  {
    "id": "zen_08",
    "title": "Sueño Reparador",
    "description": "Duerme 8 horas con el bot en Modo Dormir Tranquilo activado.",
    "category": "disciplina",
    "rarity": "common",
    "xp": 30,
    "iconName": "Moon"
  },
  {
    "id": "zen_09",
    "title": "Cero Ansiedad",
    "description": "Revisa tu cuenta únicamente 2 veces al día durante 3 días.",
    "category": "disciplina",
    "rarity": "rare",
    "xp": 40,
    "iconName": "EyeOff"
  },
  {
    "id": "zen_10",
    "title": "Trader Desapegado",
    "description": "No te apegues a ninguna moneda; deja que el algoritmo elija por números.",
    "category": "disciplina",
    "rarity": "rare",
    "xp": 35,
    "iconName": "Cpu"
  },
  {
    "id": "zen_11",
    "title": "Calma en la Tempestad",
    "description": "No apagues el bot presa del pánico durante una vela roja normal.",
    "category": "disciplina",
    "rarity": "rare",
    "xp": 45,
    "iconName": "CloudRain"
  },
  {
    "id": "zen_12",
    "title": "El Plan es la Ley",
    "description": "Opera 15 días consecutivos sin romper ninguna regla de gestión.",
    "category": "disciplina",
    "rarity": "epic",
    "xp": 75,
    "iconName": "BookCheck"
  },
  {
    "id": "zen_13",
    "title": "Ego Cero",
    "description": "Acepta que el mercado siempre tiene la razón y el algoritmo protege.",
    "category": "disciplina",
    "rarity": "rare",
    "xp": 40,
    "iconName": "Heart"
  },
  {
    "id": "zen_14",
    "title": "Mirada a Largo Plazo",
    "description": "Evalúa tus resultados por semanas o meses, nunca por el minuto a minuto.",
    "category": "disciplina",
    "rarity": "rare",
    "xp": 45,
    "iconName": "Telescope"
  },
  {
    "id": "zen_15",
    "title": "Gratitud Financiera",
    "description": "Celebra cada ganancia pequeña sin obsesionarte con duplicar la cuenta.",
    "category": "disciplina",
    "rarity": "common",
    "xp": 20,
    "iconName": "Sparkle"
  },
  {
    "id": "zen_16",
    "title": "Respiración Profunda",
    "description": "Tómate un respiro de 1 día tras cumplir tu meta semanal.",
    "category": "disciplina",
    "rarity": "rare",
    "xp": 35,
    "iconName": "Wind"
  },
  {
    "id": "zen_17",
    "title": "Consistencia Silenciosa",
    "description": "Acumula 30 días de operaciones automáticas disciplinadas.",
    "category": "disciplina",
    "rarity": "epic",
    "xp": 80,
    "iconName": "Calendar"
  },
  {
    "id": "zen_18",
    "title": "Sin Venganzas",
    "description": "Nunca aumentes el tamaño tras una pérdida para \"recuperar rápido\".",
    "category": "disciplina",
    "rarity": "epic",
    "xp": 70,
    "iconName": "ShieldAlert"
  },
  {
    "id": "zen_19",
    "title": "Tranquilidad Inquebrantable",
    "description": "Alcanza un mes completo con cero intervenciones emocionales.",
    "category": "disciplina",
    "rarity": "epic",
    "xp": 90,
    "iconName": "Feather"
  },
  {
    "id": "zen_20",
    "title": "Hábito de Éxito",
    "description": "Revisa el Resumen Flash del día todas las tardes durante 1 semana.",
    "category": "disciplina",
    "rarity": "rare",
    "xp": 40,
    "iconName": "CheckCheck"
  },
  {
    "id": "zen_21",
    "title": "Maestría Zen",
    "description": "Supera 50 trades con disciplina militar y cero estrés.",
    "category": "disciplina",
    "rarity": "epic",
    "xp": 100,
    "iconName": "Medal"
  },
  {
    "id": "zen_22",
    "title": "Monje Cuantitativo",
    "description": "100 trades ejecutados con apego total al algoritmo institucional.",
    "category": "disciplina",
    "rarity": "legendary",
    "xp": 150,
    "iconName": "Crown"
  },
  {
    "id": "zen_23",
    "title": "Paz Absoluta",
    "description": "Opera con dinero real manteniendo la misma calma que en el simulador.",
    "category": "disciplina",
    "rarity": "legendary",
    "xp": 180,
    "iconName": "HeartHandshake"
  },
  {
    "id": "zen_24",
    "title": "Trader Estoico",
    "description": "Afronta un drawdown temporal del 3% con serenidad hasta la recuperación.",
    "category": "disciplina",
    "rarity": "legendary",
    "xp": 160,
    "iconName": "MountainSnow"
  },
  {
    "id": "zen_25",
    "title": "Iluminación Cuántica",
    "description": "Alcanza el equilibrio perfecto: alta rentabilidad con cero estrés emocional.",
    "category": "disciplina",
    "rarity": "legendary",
    "xp": 250,
    "iconName": "Sparkles"
  },
  {
    "id": "leg_01",
    "title": "Primera Semana Completa",
    "description": "Cumple tus primeros 7 días registrado y activo en RocketBot.",
    "category": "legendario",
    "rarity": "common",
    "xp": 25,
    "iconName": "Calendar"
  },
  {
    "id": "leg_02",
    "title": "Treinta Días de Trayectoria",
    "description": "Alcanza el primer mes de operaciones en la plataforma.",
    "category": "legendario",
    "rarity": "rare",
    "xp": 50,
    "iconName": "CalendarDays"
  },
  {
    "id": "leg_03",
    "title": "Sesenta Días en Vuelo",
    "description": "Dos meses continuos de trading algorítmico activo.",
    "category": "legendario",
    "rarity": "rare",
    "xp": 75,
    "iconName": "Hourglass"
  },
  {
    "id": "leg_04",
    "title": "Cien Días de Gloria",
    "description": "Llega a 100 días como trader activo en el sistema.",
    "category": "legendario",
    "rarity": "epic",
    "xp": 100,
    "iconName": "Award"
  },
  {
    "id": "leg_05",
    "title": "Veterano Cuántico",
    "description": "Cumple 6 meses de trayectoria en RocketBot Pro.",
    "category": "legendario",
    "rarity": "legendary",
    "xp": 200,
    "iconName": "Trophy"
  },
  {
    "id": "leg_06",
    "title": "Centurión de Trades",
    "description": "Alcanza 100 operaciones completadas en tu cuenta.",
    "category": "legendario",
    "rarity": "epic",
    "xp": 90,
    "iconName": "Layers"
  },
  {
    "id": "leg_07",
    "title": "Doscientos Cincuenta Vuelos",
    "description": "Llega a 250 operaciones procesadas con éxito.",
    "category": "legendario",
    "rarity": "epic",
    "xp": 120,
    "iconName": "ListChecks"
  },
  {
    "id": "leg_08",
    "title": "Quinientas Órdenes",
    "description": "Alcanza el monumental hito de 500 operaciones registradas.",
    "category": "legendario",
    "rarity": "legendary",
    "xp": 200,
    "iconName": "CheckCheck"
  },
  {
    "id": "leg_09",
    "title": "Mil Batallas",
    "description": "Llega a 1,000 operaciones históricas en el motor.",
    "category": "legendario",
    "rarity": "legendary",
    "xp": 300,
    "iconName": "Crown"
  },
  {
    "id": "leg_10",
    "title": "Club del Diez Por Ciento",
    "description": "Genera un +10% de ganancia neta sobre tu balance histórico.",
    "category": "legendario",
    "rarity": "rare",
    "xp": 50,
    "iconName": "Percent"
  },
  {
    "id": "leg_11",
    "title": "Club del Veinticinco",
    "description": "Logra un +25% de crecimiento en tu capital total.",
    "category": "legendario",
    "rarity": "epic",
    "xp": 90,
    "iconName": "TrendingUp"
  },
  {
    "id": "leg_12",
    "title": "Cincuenta Por Ciento Arriba",
    "description": "Aumenta tu patrimonio en un +50% gracias al interés compuesto.",
    "category": "legendario",
    "rarity": "legendary",
    "xp": 180,
    "iconName": "Rocket"
  },
  {
    "id": "leg_13",
    "title": "Cuenta Duplicada (2x)",
    "description": "Duplica tu capital inicial (100% de retorno acumulado).",
    "category": "legendario",
    "rarity": "legendary",
    "xp": 300,
    "iconName": "Gem"
  },
  {
    "id": "leg_14",
    "title": "Récord de Win Rate",
    "description": "Mantén un Win Rate superior al 85% tras al menos 30 trades.",
    "category": "legendario",
    "rarity": "epic",
    "xp": 100,
    "iconName": "Star"
  },
  {
    "id": "leg_15",
    "title": "Sharpe Ratio Superior",
    "description": "Alcanza un ratio Sharpe estimado superior a 2.5 en tu histórico.",
    "category": "legendario",
    "rarity": "epic",
    "xp": 110,
    "iconName": "Scale"
  },
  {
    "id": "leg_16",
    "title": "Listo para Fondeo",
    "description": "Cumple todos los requisitos teóricos para pasar una prueba de Prop Firm.",
    "category": "legendario",
    "rarity": "epic",
    "xp": 120,
    "iconName": "Trophy"
  },
  {
    "id": "leg_17",
    "title": "Titán de la Consistencia",
    "description": "3 meses consecutivos con rentabilidad neta positiva.",
    "category": "legendario",
    "rarity": "legendary",
    "xp": 220,
    "iconName": "CalendarCheck"
  },
  {
    "id": "leg_18",
    "title": "Explorador Completo",
    "description": "Desbloquea al menos 50 logros de cualquier categoría.",
    "category": "legendario",
    "rarity": "rare",
    "xp": 60,
    "iconName": "Sparkles"
  },
  {
    "id": "leg_19",
    "title": "Coleccionista de Trofeos",
    "description": "Desbloquea 100 logros en tu perfil de RocketBot.",
    "category": "legendario",
    "rarity": "epic",
    "xp": 120,
    "iconName": "Medal"
  },
  {
    "id": "leg_20",
    "title": "Casi Leyenda",
    "description": "Alcanza 150 logros desbloqueados en la plataforma.",
    "category": "legendario",
    "rarity": "legendary",
    "xp": 200,
    "iconName": "Crown"
  },
  {
    "id": "leg_21",
    "title": "Paso al Modo PRO",
    "description": "Cambia a Modo PRO sintiéndote 100% preparado y seguro.",
    "category": "legendario",
    "rarity": "rare",
    "xp": 40,
    "iconName": "Zap"
  },
  {
    "id": "leg_22",
    "title": "Maestro Multi-Cartera",
    "description": "Gestiona al menos 2 subcuentas segregadas con ganancias.",
    "category": "legendario",
    "rarity": "epic",
    "xp": 90,
    "iconName": "FolderPlus"
  },
  {
    "id": "leg_23",
    "title": "Embajador Cuántico",
    "description": "Comparte 10 resúmenes flash con la comunidad de traders.",
    "category": "legendario",
    "rarity": "rare",
    "xp": 50,
    "iconName": "Share2"
  },
  {
    "id": "leg_24",
    "title": "Piloto de Primera Clase",
    "description": "Alcanza el nivel Comandante Quant en el sistema de rangos.",
    "category": "legendario",
    "rarity": "legendary",
    "xp": 250,
    "iconName": "Medal"
  },
  {
    "id": "leg_25",
    "title": "Leyenda Suprema RocketBot",
    "description": "Desbloquea los 200 logros del ecosistema institucional.",
    "category": "legendario",
    "rarity": "legendary",
    "xp": 500,
    "iconName": "Crown"
  }
];
