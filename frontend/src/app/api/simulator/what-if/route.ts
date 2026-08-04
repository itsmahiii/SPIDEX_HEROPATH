export const maxDuration = 60;
import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter } from '@/lib/openrouter';

export async function POST(req: NextRequest) {
  try {
    const { resumeData, addedSkill } = await req.json();

    if (!resumeData || !addedSkill) {
      return NextResponse.json({ error: 'resumeData and addedSkill are required' }, { status: 400 });
    }

    const model = process.env.AI_MODEL || "nvidia/nemotron-3-ultra-550b-a55b:free";

    const prompt = `You are an AI Career Simulator. 
The user has the following profile:
Skills: ${resumeData.skills?.join(', ') || 'None'}
Summary: ${resumeData.summary || 'None'}

They are considering learning/adding this new skill or certification: "${addedSkill}".

Simulate how this new skill impacts their career prospects.
Return your prediction STRICTLY as a JSON object matching this exact schema:
{
  "new_ats_score_increase": 15,
  "salary_bump_estimate": "$10,000",
  "new_roles_unlocked": ["Role 1", "Role 2"],
  "simulation_summary": "A 2-sentence summary of how this skill transforms their profile."
}
Return ONLY the raw JSON object. No other text.`;

    const parsed = await callOpenRouter(prompt, model);

    return NextResponse.json({ data: parsed });

  } catch (error: any) {
    console.error('What-If Simulator Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate simulation' }, { status: 500 });
  }
}

