/**
 * GigaChat API client — placeholder.
 *
 * To integrate:
 * 1. Add GIGACHAT_API_KEY to .env.local
 * 2. Implement checkWithGigaChat() below
 * 3. Use in /api/check-answer/route.ts
 */

export interface GigaChatResult {
  correct: boolean;
  feedback: string;
}

export async function checkWithGigaChat(
  _questionText: string,
  _userAnswer: string,
  _referenceAnswer: string,
  _apiKey: string
): Promise<GigaChatResult> {
  // TODO: Implement actual GigaChat API call
  // 1. Obtain access token via POST https://ngw.devices.sberbank.ru:9443/api/v2/oauth
  // 2. Send prompt to POST https://gigachat.devices.sberbank.ru/api/v1/chat/completions
  // 3. Parse response and return { correct, feedback }

  return {
    correct: false,
    feedback: "GigaChat интеграция ещё не подключена. Сравните ответ с эталонным самостоятельно.",
  };
}
