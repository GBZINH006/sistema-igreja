const DEFAULT_MODEL = "gpt-5.4";

function json(status, body) {
  return { status, body };
}

function getTextFromResponse(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const output = Array.isArray(data?.output) ? data.output : [];
  return output
    .flatMap(item => Array.isArray(item.content) ? item.content : [])
    .map(part => part.text || part.content || "")
    .join("\n")
    .trim();
}

module.exports = async function handler(request, response) {
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader("cache-control", "no-store");
  response.setHeader("allow", "GET,POST,OPTIONS");
  response.setHeader("access-control-allow-origin", "*");
  response.setHeader("access-control-allow-methods", "GET,POST,OPTIONS");
  response.setHeader("access-control-allow-headers", "Content-Type, Authorization");

  function send(result) {
    response.status(result.status).json(result.body);
  }

  if (request.method === "OPTIONS") {
    return response.status(204).end();
  }

  if (request.method === "GET") {
    return send(json(200, {
      ok: true,
      message: "Assistente de suporte online. Envie uma requisicao POST com { messages: [...] }."
    }));
  }

  if (request.method !== "POST") {
    return send(json(405, { error: "Metodo nao permitido. Use POST." }));
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return send(json(503, {
      error: "Assistente indisponivel. Configure OPENAI_API_KEY no ambiente da Vercel."
    }));
  }

  let body;
  try {
    body = await readBody(request);
  } catch (error) {
    return send(json(400, { error: "JSON invalido." }));
  }

  const messages = Array.isArray(body?.messages) ? body.messages : [];
  const cleanMessages = messages
    .map(message => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: String(message.content || "").slice(0, 1600)
    }))
    .filter(message => message.content.trim())
    .slice(-10);

  if (!cleanMessages.length) {
    return send(json(400, { error: "Envie pelo menos uma mensagem." }));
  }

  const systemPrompt = [
    "Voce e o assistente de suporte da AD Bela-Vista.",
    "Responda em portugues do Brasil, com tom cordial, simples e objetivo.",
    "Ajude membros e administradores com login, cadastro de membros, documentos, relatorios, exportacao PDF/Excel, permissoes e uso geral do sistema da igreja.",
    "Se faltar informacao, faca no maximo uma pergunta clara por vez.",
    "Quando parecer bug, acesso bloqueado, dados sensiveis ou algo que exija acao humana, oriente a abrir um chamado e liste quais detalhes anexar.",
    "Nao invente dados internos, nao prometa que ja alterou algo no sistema e nao solicite senhas ou codigos completos."
  ].join(" ");

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "authorization": `Bearer ${apiKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
        instructions: systemPrompt,
        input: cleanMessages
          .map(message => `${message.role === "assistant" ? "Assistente" : "Usuario"}: ${message.content}`)
          .join("\n\n"),
        max_output_tokens: 650
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return send(json(response.status, {
        error: data?.error?.message || "Nao foi possivel consultar a IA agora."
      }));
    }

    const answer = getTextFromResponse(data);
    if (!answer) {
      return send(json(502, { error: "A IA nao retornou uma resposta valida." }));
    }

    return send(json(200, { answer }));
  } catch (error) {
    return send(json(500, { error: "Falha ao conectar com o assistente de IA." }));
  }
};

async function readBody(request) {
  if (request.body && typeof request.body === "object" && !Buffer.isBuffer(request.body)) {
    return request.body;
  }

  if (typeof request.body === "string") {
    return JSON.parse(request.body);
  }

  if (Buffer.isBuffer(request.body)) {
    return JSON.parse(request.body.toString("utf8"));
  }

  const chunks = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}
