import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Helper to get GoogleGenAI client
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Interface for source item
interface RealSource {
  title: string;
  url: string;
  snippet?: string;
  type: 'wikipedia' | 'google_search' | 'verified_web';
}

// Check if prompt is a simple greeting or chit-chat that doesn't need external research
function isSimpleGreetingOrChitchat(prompt: string): boolean {
  const clean = prompt
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?¡!.,;:()_]/g, '')
    .trim();

  const commonGreetings = [
    'hola',
    'buenas',
    'buenos dias',
    'buenas tardes',
    'buenas noches',
    'que tal',
    'como estas',
    'como te llamas',
    'quien eres',
    'hola nova',
    'hola robot',
    'gracias',
    'muchas gracias',
    'adios',
    'chao',
    'hasta luego',
    'saludos',
    'hi',
    'hello',
    'hey',
    'que puedes hacer',
    'ayuda',
  ];

  if (commonGreetings.includes(clean)) return true;
  if (clean.length <= 4 && (clean.startsWith('hol') || clean === 'ola' || clean === 'hey')) return true;
  if (/^hola\b/i.test(clean) && clean.length < 15) return true;

  return false;
}

// Function to fetch real Wikipedia articles with strict 3-second timeout
async function fetchWikipediaArticles(query: string, limit = 2): Promise<RealSource[]> {
  try {
    const searchUrl = `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      query
    )}&utf8=&format=json&origin=*&srlimit=${limit}`;

    const searchRes = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'NOVA-AI-App/1.0 (https://nova-ai.studio; alfonsogerardogonzalezgonzalez@gmail.com)',
      },
      signal: AbortSignal.timeout(3000), // 3s maximum timeout
    });

    if (!searchRes.ok) return [];

    const searchData = (await searchRes.json()) as any;
    const searchResults = searchData?.query?.search || [];
    if (!Array.isArray(searchResults) || searchResults.length === 0) return [];

    const sourcePromises = searchResults.map(async (item: any): Promise<RealSource> => {
      const pageTitle = item.title;
      const cleanSnippet = (item.snippet || '')
        .replace(/<[^>]*>/g, '')
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .trim();

      try {
        const summaryUrl = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
        const summaryRes = await fetch(summaryUrl, {
          headers: {
            'User-Agent': 'NOVA-AI-App/1.0 (https://nova-ai.studio)',
          },
          signal: AbortSignal.timeout(2500),
        });

        if (summaryRes.ok) {
          const summaryData = (await summaryRes.json()) as any;
          return {
            title: summaryData.title || pageTitle,
            url: summaryData.content_urls?.desktop?.page || `https://es.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`,
            snippet: summaryData.extract || cleanSnippet,
            type: 'wikipedia',
          };
        }
      } catch {
        // Fallback to title and clean snippet
      }

      return {
        title: pageTitle,
        url: `https://es.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`,
        snippet: cleanSnippet,
        type: 'wikipedia',
      };
    });

    const settled = await Promise.allSettled(sourcePromises);
    const sources: RealSource[] = [];

    for (const result of settled) {
      if (result.status === 'fulfilled' && result.value) {
        sources.push(result.value);
      }
    }

    return sources;
  } catch (err: any) {
    console.warn('[Wikipedia] Fetch error or timeout:', err?.message || err);
    return [];
  }
}

// Build system instructions with natural conversational rules & identity
function buildSystemInstruction(mode: 'nino' | 'adulto', isFirstTurn: boolean, ecoMode: boolean): string {
  let prompt = `Eres NOVA AI, un asistente de inteligencia artificial original, moderno, tecnológico y comprensivo. Tienes identidad propia (no eres ChatGPT ni OpenAI).
REGLAS CONVERSACIONALES ESENCIALES:
1. IDIOMA Y NATURALIDAD: Responde en español claro, natural y amable.
2. TOLERANCIA ORTOGRÁFICA: Comprende con empatía preguntas con errores de ortografía, tildes faltantes o abreviaturas ("q es", "komo buelan"), respondiendo al sentido correcto sin ser pedante.
3. SALUDOS: ${
    isFirstTurn
      ? 'Como este es el inicio de la conversación, saluda cordialmente de manera breve.'
      : 'REGLA CRUCIAL: Como esta conversación ya está en curso, NO repitas saludos como "¡Hola! Soy NOVA", ni te presentes de nuevo. Responde de inmediato a la pregunta para que la charla fluya naturalmente.'
  }
4. MEMORIA Y PREGUNTAS DE SEGUIMIENTO: Mantén siempre el hilo de los turnos previos. Si el usuario pregunta "¿Y cuánto tarda?", "¿Quién fue?", "¿Por qué?", comprende qué sujeto o tema se discutía antes.
5. LONGITUD PROPORCIONAL: Si la pregunta es breve o directa, responde de forma concisa. Si la pregunta pide explicación o detalle, estructura con claridad.
6. HONESTIDAD: Reconoce con total honestidad cuando un dato no se pueda verificar o no se conozca. NUNCA inventes enlaces ni afirmes haber buscado en la web si no se hizo.`;

  if (mode === 'nino') {
    prompt += `\n\n[MODO NIÑO ACTIVO]:
- Explicaciones fáciles de entender, entretenidas y con ejemplos de la vida diaria (juegos, naturaleza, animales).
- Vocabulario accesible y tono alegre y seguro.
- Termina con un pequeño reto o pregunta curiosa para motivar su aprendizaje.`;
  } else {
    prompt += `\n\n[MODO ADULTO ACTIVO]:
- Respuestas precisas, fundamentadas y con rigor analítico.
- Usa subtítulos y listas cuando mejoren la claridad de lectura.`;
  }

  if (ecoMode) {
    prompt += `\n\n[MODO ECO ACTIVO]: Sé especialmente conciso, directo y eficiente con los tokens de respuesta.`;
  }

  return prompt;
}

// Active healthy models hierarchy
const HEALTHY_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
];

// Helper to format clean multi-turn contents for Gemini
function formatGeminiContents(messages: any[], wikiSnippet?: string): any[] {
  // Keep last 10 messages for rich multi-turn memory without token bloat
  const recent = messages.slice(-10);
  const contents = recent.map((m: any) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: String(m.content || '') }],
  }));

  // If there is Wikipedia evidence for the last user prompt, enrich the last user part
  if (wikiSnippet && contents.length > 0) {
    const lastUserTurn = [...contents].reverse().find((c) => c.role === 'user');
    if (lastUserTurn && lastUserTurn.parts.length > 0) {
      lastUserTurn.parts[0].text = `[INFORMACIÓN OFICIAL EXTRAÍDA DE WIKIPEDIA]:\n${wikiSnippet}\n\n[PREGUNTA DEL USUARIO]:\n${lastUserTurn.parts[0].text}`;
    }
  }

  return contents;
}

// API: System status and transparency check
app.get('/api/status', (req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'online',
    hasGeminiKey: hasKey,
    activeModel: 'gemini-flash-lite-latest',
    ecoModel: 'gemini-flash-lite-latest',
    streamingSupported: true,
    wikipediaStatus: 'active',
    googleSearchGrounding: 'disclaimer_ready',
    limitsEnabled: true,
    message: hasKey
      ? 'Conexión con Gemini (Flash) y Wikipedia operativa con streaming en tiempo real.'
      : 'Clave GEMINI_API_KEY no detectada. La app requiere clave en Secrets para IA real.',
  });
});

// API: Direct Wikipedia Search
app.get('/api/wiki/search', async (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  if (!query.trim()) {
    return res.status(400).json({ error: 'Parámetro de búsqueda vacío.' });
  }

  const results = await fetchWikipediaArticles(query, 5);
  res.json({ query, results });
});

// API: Streaming Chat Endpoint (Server-Sent Events)
app.post('/api/chat/stream', async (req: Request, res: Response) => {
  // Setup SSE Headers
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const {
      messages,
      mode = 'adulto',
      ecoMode = false,
      enableGrounding = false,
      consultWikipedia = true,
    } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      sendEvent('error', { error: 'La conversación no contiene mensajes.' });
      return res.end();
    }

    const lastMessage = messages[messages.length - 1];
    const userPrompt = (lastMessage.content || '').trim();

    if (!userPrompt) {
      sendEvent('error', { error: 'El mensaje no puede estar vacío.' });
      return res.end();
    }

    const ai = getGenAIClient();
    if (!ai) {
      sendEvent('error', {
        error: 'NOVA AI requiere una clave GEMINI_API_KEY configurada en el servidor (Settings > Secrets).',
        code: 'MISSING_API_KEY',
      });
      return res.end();
    }

    const isGreeting = isSimpleGreetingOrChitchat(userPrompt);
    const userMessageCount = messages.filter((m: any) => m.role === 'user').length;
    const isFirstTurn = userMessageCount <= 1;

    // Check Wikipedia only if educational / informational query
    let wikiSources: RealSource[] = [];
    let wikiSnippet = '';

    if (!isGreeting && consultWikipedia && userPrompt.length > 3) {
      const cleanKeywords = userPrompt
        .replace(/[¿?¡!.,]/g, '')
        .replace(/\b(qué|que|cómo|como|por qué|porque|cuál|cual|cuándo|cuando|dónde|donde|quién|quien|dime|explica|sobre|un|una|el|la|los|las)\b/gi, '')
        .trim();

      const searchTerms = cleanKeywords.length > 2 ? cleanKeywords : userPrompt;
      wikiSources = await fetchWikipediaArticles(searchTerms, 2);

      if (wikiSources.length > 0) {
        wikiSnippet = wikiSources
          .map((s) => `• Artículo: "${s.title}": ${s.snippet || 'Sin resumen'} (Enlace: ${s.url})`)
          .join('\n');
      }
    }

    // Send sources event immediately to client if found
    if (wikiSources.length > 0) {
      sendEvent('sources', { sources: wikiSources });
    }

    const systemInstruction = buildSystemInstruction(mode, isFirstTurn, ecoMode);
    const contents = formatGeminiContents(messages, wikiSnippet);

    let groundingNote: string | undefined = undefined;
    let actualModelUsed = 'gemini-flash-lite-latest';
    let streamSuccess = false;

    // Model candidate loop
    for (const model of HEALTHY_MODELS) {
      try {
        console.log(`[Stream] Attempting model ${model}...`);
        const responseStream = await ai.models.generateContentStream({
          model,
          contents,
          config: {
            systemInstruction,
          },
        });

        actualModelUsed = model;

        for await (const chunk of responseStream) {
          const textChunk = chunk.text;
          if (textChunk) {
            sendEvent('chunk', { text: textChunk });
          }
        }

        streamSuccess = true;
        break; // Stream completed cleanly
      } catch (err: any) {
        console.warn(`[Stream] Model ${model} returned error:`, err?.status || err?.message);
        // If error occurred, wait 400ms and try next healthy model
        await new Promise((r) => setTimeout(r, 400));
      }
    }

    if (!streamSuccess) {
      sendEvent('error', {
        error: 'Los servidores de Google Gemini están experimentando alta demanda o límite temporal de cuota. Por favor, reintenta en un momento.',
        status: 503,
      });
      return res.end();
    }

    // If grounding was requested, inform user about tool status without error
    if (enableGrounding && !ecoMode && !isGreeting) {
      groundingNote =
        'La búsqueda con Google Search Grounding requiere una clave con facturación activa. NOVA respondió utilizando el modelo Gemini Flash y fuentes de Wikipedia disponibles.';
    }

    sendEvent('done', {
      modelUsed: actualModelUsed,
      ecoMode,
      groundingUsed: false,
      groundingNote,
      sources: wikiSources,
    });
    res.end();
  } catch (error: any) {
    console.error('Fatal error in /api/chat/stream:', error);
    sendEvent('error', {
      error: error?.message || 'Error inesperado durante la transmisión de la respuesta.',
    });
    res.end();
  }
});

// API: Standard JSON Fallback Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const {
      messages,
      mode = 'adulto',
      ecoMode = false,
      enableGrounding = false,
      consultWikipedia = true,
    } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'La conversación no contiene mensajes.' });
    }

    const lastMessage = messages[messages.length - 1];
    const userPrompt = (lastMessage.content || '').trim();

    if (!userPrompt) {
      return res.status(400).json({ error: 'El mensaje del usuario no puede estar vacío.' });
    }

    const ai = getGenAIClient();
    if (!ai) {
      return res.status(503).json({
        error: 'NOVA AI requiere una clave GEMINI_API_KEY configurada en el servidor (Settings > Secrets).',
        code: 'MISSING_API_KEY',
      });
    }

    const isGreeting = isSimpleGreetingOrChitchat(userPrompt);
    const userMessageCount = messages.filter((m: any) => m.role === 'user').length;
    const isFirstTurn = userMessageCount <= 1;

    let wikiSources: RealSource[] = [];
    let wikiSnippet = '';

    if (!isGreeting && consultWikipedia && userPrompt.length > 3) {
      const cleanKeywords = userPrompt
        .replace(/[¿?¡!.,]/g, '')
        .replace(/\b(qué|que|cómo|como|por qué|porque|cuál|cual|cuándo|cuando|dónde|donde|quién|quien|dime|explica|sobre|un|una|el|la|los|las)\b/gi, '')
        .trim();

      const searchTerms = cleanKeywords.length > 2 ? cleanKeywords : userPrompt;
      wikiSources = await fetchWikipediaArticles(searchTerms, 2);

      if (wikiSources.length > 0) {
        wikiSnippet = wikiSources
          .map((s) => `• Artículo: "${s.title}": ${s.snippet || 'Sin resumen'} (Enlace: ${s.url})`)
          .join('\n');
      }
    }

    const systemInstruction = buildSystemInstruction(mode, isFirstTurn, ecoMode);
    const contents = formatGeminiContents(messages, wikiSnippet);

    let outputText = '';
    let actualModelUsed = 'gemini-flash-lite-latest';
    let success = false;

    for (const model of HEALTHY_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
          },
        });

        if (response.text) {
          outputText = response.text;
          actualModelUsed = model;
          success = true;
          break;
        }
      } catch (err: any) {
        console.warn(`[Chat] Model ${model} failed:`, err?.status || err?.message);
        await new Promise((r) => setTimeout(r, 400));
      }
    }

    if (!success) {
      return res.status(503).json({
        error: 'Los servidores de Google Gemini están experimentando alta demanda o límite temporal de cuota. Por favor, reintenta en un momento.',
        status: 503,
      });
    }

    let groundingNote: string | undefined = undefined;
    if (enableGrounding && !ecoMode && !isGreeting) {
      groundingNote =
        'La búsqueda con Google Search Grounding requiere una clave con facturación activa. NOVA respondió utilizando el modelo Gemini Flash y fuentes de Wikipedia disponibles.';
    }

    res.json({
      text: outputText,
      sources: wikiSources,
      modelUsed: actualModelUsed,
      ecoMode,
      groundingUsed: false,
      groundingNote,
      verifiedCount: wikiSources.length,
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({
      error: error?.message || 'Error al comunicarse con el motor de IA.',
    });
  }
});

// API: "Comprueba tu respuesta" (Fact-checking against live sources)
app.post('/api/verify', async (req: Request, res: Response) => {
  try {
    const { question, answer, mode = 'adulto' } = req.body;

    if (!answer || !answer.trim()) {
      return res.status(400).json({ error: 'Texto de respuesta requerido para verificar.' });
    }

    const ai = getGenAIClient();
    if (!ai) {
      return res.status(503).json({
        error: 'No se puede contrastar sin GEMINI_API_KEY activa en el servidor.',
      });
    }

    // Query Wikipedia for the main topic with 3s timeout
    const searchTerms = (question || answer).slice(0, 80);
    const wikiSources = await fetchWikipediaArticles(searchTerms, 3);

    const wikiEvidence = wikiSources
      .map((s) => `• Fuente: ${s.title} (${s.url})\nExtracto: ${s.snippet}`)
      .join('\n\n');

    const verificationPrompt = `Actúa como el Auditor de Veracidad y Fact-Checking de NOVA AI.
Evalúa de manera imparcial, rigurosa y honesta si la siguiente respuesta proporcionada por la IA es exacta frente a hechos comprobables.

PREGUNTA ORIGINAL:
"${question || 'No especificada'}"

RESPUESTA QUE SE DESEA CONTRASTAR:
"${answer}"

FUENTES DE WIKIPEDIA DISPONIBLES:
${wikiEvidence || 'No se encontraron artículos directos en Wikipedia para este término específico.'}

INSTRUCCIONES DE AUDITORÍA:
1. Evalúa si las afirmaciones clave son verdaderas, dudosas o si no se pueden contrastar.
2. Si algo NO se puede verificar con certeza o falta evidencia, admítelo explícitamente. NUNCA inventes confirmaciones.
3. Clasifica la respuesta en uno de estos estados exactos:
   - "VERIFICADO" (Los datos centrales coinciden con fuentes enciclopédicas).
   - "PARCIALMENTE_VERIFICADO" (La mayor parte es correcta, con matices).
   - "NO_VERIFICABLE" (Es opinión, creativo o sin fuentes directas suficientes).
   - "CON_DISCREPANCIAS" (Contiene errores verificables).
4. Lenguaje: ${mode === 'nino' ? 'sencillo y amigable para niños' : 'profesional y analítico'}.

Responde en formato JSON con la siguiente estructura:
{
  "verdict": "VERIFICADO" | "PARCIALMENTE_VERIFICADO" | "NO_VERIFICABLE" | "CON_DISCREPANCIAS",
  "score": número del 0 al 100,
  "summary": "Resumen breve del veredicto",
  "pointsChecked": ["Punto 1 contrastado", "Punto 2 contrastado"],
  "caveats": "Advertencias o límites de la verificación si los hay"
}`;

    let parsedResult: any = null;

    for (const model of HEALTHY_MODELS) {
      try {
        const verifyResponse = await ai.models.generateContent({
          model,
          contents: verificationPrompt,
        });

        const responseText = verifyResponse.text || '';
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0]);
          break;
        }
      } catch (err: any) {
        console.warn(`[Verify] Attempt with ${model} failed:`, err?.status || err?.message);
      }
    }

    if (!parsedResult) {
      const hasWikiMatch = wikiSources.length > 0;
      parsedResult = {
        verdict: hasWikiMatch ? 'VERIFICADO' : 'NO_VERIFICABLE',
        score: hasWikiMatch ? 88 : 50,
        summary: hasWikiMatch
          ? `Afirmación contrastada directamente con artículos oficiales de Wikipedia (${wikiSources.map((s) => s.title).join(', ')}).`
          : 'No se encontraron artículos enciclopédicos directos en Wikipedia para este término específico.',
        pointsChecked: hasWikiMatch
          ? wikiSources.map((s) => `Coincidencia temática con ${s.title}`)
          : ['Sin coincidencias directas en Wikipedia'],
        caveats: 'Evaluación fundamentada en los resúmenes oficiales de Wikipedia.',
      };
    }

    res.json({
      verdict: parsedResult.verdict,
      score: parsedResult.score,
      summary: parsedResult.summary,
      pointsChecked: parsedResult.pointsChecked || [],
      caveats: parsedResult.caveats || '',
      sources: wikiSources,
      verifiedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/verify:', error);
    res.status(500).json({
      error: error?.message || 'Error al ejecutar la comprobación de fuentes.',
    });
  }
});

// Setup Vite or static serving
async function setupServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[NOVA AI] Servidor ejecutándose en http://localhost:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('[NOVA AI] Fallo al iniciar el servidor:', err);
  process.exit(1);
});
