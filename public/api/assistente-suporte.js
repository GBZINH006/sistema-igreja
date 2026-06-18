const GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const MAX_MESSAGES = 10;
const MAX_MESSAGE_CHARS = 1200;
const MAX_TOTAL_CHARS = 6000;
const MAX_BODY_BYTES = 24 * 1024;
const REQUEST_TIMEOUT_MS = 12000;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 20;

const rateLimitStore = new Map();

const SYSTEM_PROMPT = [
  "Voce e o Assistente Oficial da AD Bela-Vista.",
  "Ajude usuarios com cadastro de membros, login, relatorios, exportacao PDF, exportacao Excel, fotos, documentos, permissoes e utilizacao geral do sistema.",
  "Responda sempre em portugues do Brasil.",
  "Se nao souber a resposta ou identificar possivel erro do sistema, oriente o usuario a abrir um chamado para o suporte.",
  "Nunca invente informacoes.",
  "Nunca solicite senhas.",
  "Nunca afirme que realizou alteracoes no sistema.",
].join(" ");

function sendJson(response, status, body) {
  return response.status(status).json(body);
}

function getHeader(request, name) {
  const value = request.headers?.[name.toLowerCase()] || request.headers?.[name];
  return Array.isArray(value) ? value[0] : value;
}

function getRequestOrigin(request) {
  const origin = getHeader(request, "origin");
  return typeof origin === "string" ? origin : "";
}

function getExpectedOrigin(request) {
  const host = getHeader(request, "x-forwarded-host") || getHeader(request, "host");
  const proto = getHeader(request, "x-forwarded-proto") || "https";
  return host ? `${proto}://${host}` : "";
}

function getAllowedOrigins(request) {
  const configured = String(process.env.SUPPORT_AI_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const expected = getExpectedOrigin(request);
  const localOrigins = [
    "http://localhost:3000",
    "http://localhost:5500",
    "http://localhost:5501",
    "http://localhost:5502",
    "http://127.0.0.1:5500",
    "http://127.0.0.1:5501",
    "http://127.0.0.1:5502",
  ];

  return new Set([expected, ...configured, ...localOrigins].filter(Boolean));
}

function applyCors(request, response) {
  const origin = getRequestOrigin(request);
  const allowedOrigins = getAllowedOrigins(request);

  response.setHeader("vary", "Origin");
  response.setHeader("allow", "GET,POST,OPTIONS");
  response.setHeader("access-control-allow-methods", "GET,POST,OPTIONS");
  response.setHeader("access-control-allow-headers", "Content-Type");

  if (!origin || allowedOrigins.has(origin)) {
    if (origin) {
      response.setHeader("access-control-allow-origin", origin);
    }
    return true;
  }

  return false;
}

function getClientId(request) {
  const forwardedFor = getHeader(request, "x-forwarded-for");
  const ip = typeof forwardedFor === "string" ? forwardedFor.split(",")[0].trim() : "";
  return ip || request.socket?.remoteAddress || "unknown";
}

function isRateLimited(request) {
  const clientId = getClientId(request);
  const now = Date.now();
  const current = rateLimitStore.get(clientId);

  if (!current || now - current.startedAt > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(clientId, { count: 1, startedAt: now });
    return false;
  }

  current.count += 1;
  return current.count > RATE_LIMIT_MAX_REQUESTS;
}

function pruneRateLimitStore() {
  const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS;
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.startedAt < cutoff) {
      rateLimitStore.delete(key);
    }
  }
}

async function readBody(request) {
  const contentLength = Number(getHeader(request, "content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    const error = new Error("Payload muito grande.");
    error.status = 413;
    throw error;
  }

  if (request.body && typeof request.body === "object" && !Buffer.isBuffer(request.body)) {
    return request.body;
  }

  if (typeof request.body === "string") {
    if (Buffer.byteLength(request.body, "utf8") > MAX_BODY_BYTES) {
      const error = new Error("Payload muito grande.");
      error.status = 413;
      throw error;
    }
    return JSON.parse(request.body);
  }

  if (Buffer.isBuffer(request.body)) {
    if (request.body.length > MAX_BODY_BYTES) {
      const error = new Error("Payload muito grande.");
      error.status = 413;
      throw error;
    }
    return JSON.parse(request.body.toString("utf8"));
  }

  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;

    if (size > MAX_BODY_BYTES) {
      const error = new Error("Payload muito grande.");
      error.status = 413;
      throw error;
    }

    chunks.push(buffer);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function sanitizeMessages(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  const cleanMessages = [];
  let totalChars = 0;

  for (const message of messages.slice(-MAX_MESSAGES)) {
    const role = message?.role === "assistant" ? "assistant" : "user";
    const content = String(message?.content || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, MAX_MESSAGE_CHARS);

    if (!content) {
      continue;
    }

    totalChars += content.length;

    if (totalChars > MAX_TOTAL_CHARS) {
      break;
    }

    cleanMessages.push({ role, content });
  }

  return cleanMessages;
}

function getGroqAnswer(data) {
  const answer = data?.choices?.[0]?.message?.content;
  return typeof answer === "string" ? answer.trim() : "";
}

module.exports = async function handler(request, response) {
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader("cache-control", "no-store");
  response.setHeader("x-content-type-options", "nosniff");
  response.setHeader("referrer-policy", "no-referrer");

  if (!applyCors(request, response)) {
    return sendJson(response, 403, { ok: false, error: "Origem nao autorizada." });
  }

  if (request.method === "OPTIONS") {
    return response.status(204).end();
  }

  if (request.method === "GET") {
    return sendJson(response, 200, {
      ok: true,
      service: "assistente-suporte",
      provider: "groq",
      model: GROQ_MODEL,
      message: "Envie uma requisicao POST com { messages: [...] }.",
    });
  }

  if (request.method !== "POST") {
    return sendJson(response, 405, { ok: false, error: "Metodo nao permitido. Use POST." });
  }

  pruneRateLimitStore();

  if (isRateLimited(request)) {
    return sendJson(response, 429, {
      ok: false,
      error: "Muitas solicitacoes em pouco tempo. Aguarde um minuto e tente novamente.",
    });
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return sendJson(response, 503, {
      ok: false,
      error: "Assistente indisponivel. Configure GROQ_API_KEY no ambiente da Vercel.",
    });
  }

  let body;

  try {
    body = await readBody(request);
  } catch (error) {
    return sendJson(response, error.status || 400, {
      ok: false,
      error: error.status === 413 ? error.message : "JSON invalido.",
    });
  }

  const cleanMessages = sanitizeMessages(body?.messages);

  if (!cleanMessages.length) {
    return sendJson(response, 400, {
      ok: false,
      error: "Envie pelo menos uma mensagem valida.",
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const groqResponse = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...cleanMessages],
        max_completion_tokens: 650,
        temperature: 0.2,
      }),
    });

    const data = await groqResponse.json().catch(() => ({}));

    if (!groqResponse.ok) {
      return sendJson(response, groqResponse.status, {
        ok: false,
        error: data?.error?.message || "Nao foi possivel consultar a IA agora.",
      });
    }

    const answer = getGroqAnswer(data);

    if (!answer) {
      return sendJson(response, 502, {
        ok: false,
        error: "A IA nao retornou uma resposta valida.",
      });
    }

    return sendJson(response, 200, {
      ok: true,
      answer,
      model: data.model || GROQ_MODEL,
    });
  } catch (error) {
    const timedOut = error?.name === "AbortError";
    return sendJson(response, timedOut ? 504 : 502, {
      ok: false,
      error: timedOut
        ? "Tempo limite excedido ao consultar a IA."
        : "Falha ao conectar com o assistente de IA.",
    });
  } finally {
    clearTimeout(timeout);
  }
};
