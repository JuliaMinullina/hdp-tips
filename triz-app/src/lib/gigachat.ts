const OAUTH_URL = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth";
const CHAT_URL =
  "https://gigachat.devices.sberbank.ru/api/v1/chat/completions";

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getAccessToken(
  authKey: string,
  scope: string
): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  const res = await fetch(OAUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${authKey}`,
      RqUID: crypto.randomUUID(),
    },
    body: `scope=${scope}`,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GigaChat OAuth error ${res.status}: ${text}`);
  }

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: data.expires_at,
  };

  return cachedToken.token;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function streamChatCompletion(
  token: string,
  messages: ChatMessage[]
): Promise<Response> {
  return fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      model: "GigaChat",
      messages,
      stream: true,
    }),
  });
}
