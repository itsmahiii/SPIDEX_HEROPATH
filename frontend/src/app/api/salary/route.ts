export const maxDuration = 60;
import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter } from '@/lib/openrouter';

export async function POST(req: NextRequest) {
  try {
    const { resumeData } = await req.json();

    if (!resumeData) {
      return NextResponse.json({ error: 'resumeData is required' }, { status: 400 });
    }

    const model = process.env.AI_MODEL || "nvidia/nemotron-3-ultra-550b-a55b:free";

    const prompt = `You are an AI Salary Predictor and Compensation Expert.
Based on the following candidate profile, estimate their market value.

Candidate Profile:
Skills: ${resumeData.skills?.join(', ') || 'None'}
Summary: ${resumeData.summary || 'None'}

Return your salary estimation STRICTLY as a JSON object matching this schema:
{
  "min_salary": "$80,000",
  "avg_salary": "$100,000",
  "max_salary": "$130,000",
  "high_paying_skills_to_learn": ["Skill A (+$10k)", "Skill B (+$15k)"]
}
Return ONLY the raw JSON object. No other text.`;

    const parsed = await callOpenRouter(prompt, model);

    return NextResponse.json({ data: parsed });

  } catch (error: any) {
    console.error('Salary Predictor Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to estimate salary' }, { status: 500 });
  }
}

