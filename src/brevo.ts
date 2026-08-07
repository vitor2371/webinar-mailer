import { BREVO_BASE, getApiKey } from './config.js';

// Cliente minimo da API do Brevo. Nunca loga a API key.
export class BrevoClient {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey ?? getApiKey();
  }

  private async req<T = any>(
    method: string,
    path: string,
    body?: unknown,
    attempt = 0,
  ): Promise<T> {
    const res = await fetch(`${BREVO_BASE}${path}`, {
      method,
      headers: {
        'api-key': this.apiKey,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    let json: any = undefined;
    if (text) {
      try {
        json = JSON.parse(text);
      } catch {
        json = text;
      }
    }

    if (!res.ok) {
      // Transitorios: rate limit (429), erros 5xx, e o 401 de "IP nao reconhecido"
      // (que o Brevo dispara de forma intermitente enquanto a config de IPs propaga).
      const msg = typeof json?.message === 'string' ? json.message : '';
      const retryable =
        res.status === 429 ||
        res.status >= 500 ||
        (res.status === 401 && msg.includes('unrecognised IP'));
      const MAX_ATTEMPTS = 5;
      if (retryable && attempt < MAX_ATTEMPTS - 1) {
        const waitMs = 2000 * 2 ** attempt; // 2s, 4s, 8s, 16s
        console.warn(
          `  ... Brevo ${res.status} transitorio em ${method} ${path}; retry em ${waitMs / 1000}s (tentativa ${attempt + 1}/${MAX_ATTEMPTS - 1})`,
        );
        await sleep(waitMs);
        return this.req(method, path, body, attempt + 1);
      }
      const detail = typeof json === 'string' ? json : JSON.stringify(json);
      // path pode conter o email do contato, mas nunca a api key.
      const err: any = new Error(`Brevo ${method} ${path} -> ${res.status}: ${detail}`);
      err.status = res.status;
      err.body = json;
      throw err;
    }
    return json as T;
  }

  // Atributos de contato
  createAttribute(name: string, type: 'date' | 'text' | 'float' | 'boolean') {
    return this.req('POST', `/contacts/attributes/global/${name}`, { type });
  }

  // Templates transacionais
  listTemplates(limit = 50, offset = 0) {
    return this.req<{ templates?: Array<{ id: number; name: string }>; count?: number }>(
      'GET',
      `/smtp/templates?limit=${limit}&offset=${offset}&sort=desc`,
    );
  }
  createTemplate(payload: unknown) {
    return this.req<{ id: number }>('POST', `/smtp/templates`, payload);
  }
  updateTemplate(id: number, payload: unknown) {
    return this.req('PUT', `/smtp/templates/${id}`, payload);
  }

  // Contatos
  getListContacts(listId: number, limit: number, offset: number) {
    return this.req<{ contacts?: any[]; count?: number }>(
      'GET',
      `/contacts/lists/${listId}/contacts?limit=${limit}&offset=${offset}`,
    );
  }
  updateContact(email: string, attributes: Record<string, unknown>) {
    return this.req('PUT', `/contacts/${encodeURIComponent(email)}`, { attributes });
  }

  // Envio transacional
  sendTransactional(payload: unknown) {
    return this.req<{ messageId?: string }>('POST', `/smtp/email`, payload);
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
