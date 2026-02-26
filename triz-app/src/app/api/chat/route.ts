import { NextRequest } from "next/server";
import {
  getAccessToken,
  streamChatCompletion,
  ChatMessage,
} from "@/lib/gigachat";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const messages: ChatMessage[] = body.messages;

  if (!messages || messages.length === 0) {
    return new Response(JSON.stringify({ error: "No messages provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const authKey = process.env.GIGACHAT_AUTH_KEY;
  const scope = process.env.GIGACHAT_SCOPE || "GIGACHAT_API_PERS";

  if (!authKey) {
    return new Response(
      JSON.stringify({ error: "GigaChat credentials not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const token = await getAccessToken(authKey, scope);
    const gigaRes = await streamChatCompletion(token, messages);

    if (!gigaRes.ok) {
      const errText = await gigaRes.text();
      return new Response(
        JSON.stringify({
          error: `GigaChat API error ${gigaRes.status}`,
          details: errText,
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(gigaRes.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
