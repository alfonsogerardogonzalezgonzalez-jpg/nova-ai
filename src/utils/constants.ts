import { PlanConfig, PlanId } from '../types';

export const PLANS: Record<PlanId, PlanConfig> = {
  gratis: {
    id: 'gratis',
    name: 'NOVA Gratis',
    price: '$0',
    period: 'siempre gratis',
    dailyLimit: 30,
    description: 'Perfecto para explorar, hacer preguntas diarias y aprender con información confiable.',
    features: [
      '30 preguntas reales por día',
      'Modo Niño y Modo Adulto incluidos',
      'Consultas reales a Wikipedia en tiempo real',
      'Modo Eco de bajo consumo computacional',
      'Interfaz moderna e interactiva',
    ],
    groundingAllowed: false,
    deepResearchAllowed: false,
    historySaved: true,
  },
  pro: {
    id: 'pro',
    name: 'NOVA Pro',
    price: '$3.990 CLP',
    period: 'al mes',
    badge: 'MÁS POPULAR',
    dailyLimit: 150,
    description: 'Para estudiantes y familias que necesitan más capacidad, investigación y verificación de fuentes.',
    features: [
      '150 preguntas diarias con IA real',
      'Búsqueda actualizada en Google Search Grounding',
      'Botón "Comprueba tu respuesta" con auditoría de datos',
      'Historial completo exportable (JSON y texto)',
      'Modo Eco con modelo ultra liviano gemini-3.1-flash-lite',
      'Prioridad de procesamiento',
    ],
    groundingAllowed: true,
    deepResearchAllowed: false,
    historySaved: true,
  },
  ultra: {
    id: 'ultra',
    name: 'NOVA Ultra',
    price: '$7.990 CLP',
    period: 'al mes',
    badge: 'MÁXIMA POTENCIA',
    dailyLimit: 400,
    description: 'Para profesionales, investigadores y curiosos intensivos con máxima profundidad analítica.',
    features: [
      '400 preguntas diarias con Gemini 3.8 Flash',
      'Investigaciones profundas y comparación multi-fuente',
      'Auditoría y contraste riguroso con enlaces directos',
      'Acceso continuo a herramientas avanzadas',
      'Soporte para consultas complejas paso a paso',
    ],
    groundingAllowed: true,
    deepResearchAllowed: true,
    historySaved: true,
  },
};

export const INITIAL_SUGGESTIONS_NINO = [
  '¿Por qué el cielo es azul y no verde?',
  '¿Cómo respiran los peces bajo el agua?',
  '¿Por qué los dinosaurios desaparecieron?',
  '¿Cómo viajan los astronautas al espacio?',
  '¿Por qué los gatos ronronean cuando están felices?',
];

export const INITIAL_SUGGESTIONS_ADULTO = [
  'Explica los principios fundamentales de la computación cuántica.',
  '¿Cuál es la diferencia científica entre fusión y fisión nuclear?',
  'Resume los descubrimientos más recientes del telescopio James Webb.',
  'Explica el Teorema de Bayes con un ejemplo práctico de medicina.',
  '¿Cómo funciona la fotosíntesis a nivel molecular y qué enzimas intervienen?',
];
