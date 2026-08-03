import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter } from '@/lib/openrouter';

export async function POST(req: NextRequest) {
  try {
    const { resumeData } = await req.json();

    const targetRole = resumeData?.targetRole || "Software Engineer";
    const skills = resumeData?.skills?.join(', ') || 'General Tech';

    const prompt = `You are an AI Interview Coach.
Generate a "Daily Challenge" question for a candidate targeting the role of ${targetRole} with skills in ${skills}.
The question should be highly technical, scenario-based, and something they might encounter in a final-round interview.

Return your response STRICTLY as a JSON object matching this schema:
{
  "challenge_title": "System Design: Scalable Rate Limiter",
  "difficulty": "Hard",
  "question": "How would you design a distributed rate limiter to handle 10 million requests per second?",
  "hints": ["Consider Redis", "Think about the Token Bucket algorithm"]
}
Return ONLY the raw JSON object. No other text.`;

    const model = process.env.AI_MODEL || "nvidia/nemotron-3-ultra-550b-a55b:free";
    const parsed = await callOpenRouter(prompt, model);

    return NextResponse.json({ data: parsed });

  } catch (error: any) {
    console.error('Daily Challenge Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate challenge' }, { status: 500 });
  }
}
