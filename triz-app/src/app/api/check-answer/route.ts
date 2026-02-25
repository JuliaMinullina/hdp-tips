import { NextRequest, NextResponse } from "next/server";

/**
 * Placeholder for GigaChat integration.
 * When ready, add GIGACHAT_API_KEY to .env and implement
 * the actual API call in lib/gigachat.ts
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userAnswer, referenceAnswer } = body as {
    userAnswer: string;
    referenceAnswer: string;
    questionText?: string;
  };

  if (!userAnswer || !referenceAnswer) {
    return NextResponse.json(
      { error: "Missing userAnswer or referenceAnswer" },
      { status: 400 }
    );
  }

  const apiKey = process.env.GIGACHAT_API_KEY;

  if (apiKey) {
    // TODO: Implement actual GigaChat API call
    // const result = await checkWithGigaChat(questionText, userAnswer, referenceAnswer, apiKey);
    // return NextResponse.json(result);
  }

  const normalizedUser = userAnswer.trim().toLowerCase();
  const normalizedRef = referenceAnswer.trim().toLowerCase();
  const isCorrect =
    normalizedUser.includes(normalizedRef) ||
    normalizedRef.includes(normalizedUser);

  return NextResponse.json({
    correct: isCorrect && normalizedUser.length > 0,
    feedback: isCorrect
      ? "Ответ совпадает с эталонным."
      : `Эталонный ответ: ${referenceAnswer}. Сравните с вашим ответом.`,
    isStub: true,
  });
}
