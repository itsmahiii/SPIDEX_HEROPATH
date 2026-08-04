export const maxDuration = 60;
import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter } from '@/lib/openrouter';

export async function POST(req: NextRequest) {
  try {
    const { resumeData, jobDescription, company } = await req.json();

    if (!resumeData) {
      return NextResponse.json({ error: 'Resume data is required' }, { status: 400 });
    }

    const model = process.env.AI_MODEL || "nvidia/nemotron-3-ultra-550b-a55b:free";

    let targetContext = "";
    if (jobDescription) {
      targetContext = `Job Description:
${jobDescription}`;
    } else if (company) {
      targetContext = `Target Company: ${company}
Evaluate based on the typical high standards, culture, and technical requirements of ${company}.`;
    } else {
      return NextResponse.json({ error: 'Either jobDescription or company is required' }, { status: 400 });
    }

    const prompt = `You are an expert ATS (Applicant Tracking System) and senior technical recruiter.
Evaluate the following candidate profile against the target context.

Candidate Profile:
Skills: ${resumeData.skills?.join(', ') || 'None'}
Summary: ${resumeData.summary || 'None'}
Experience Claims: ${JSON.stringify(resumeData.experience_claims || [])}

${targetContext}

Return your evaluation STRICTLY as a JSON object matching this schema:
{
  "ats_match_score": 85,
  "interview_probability": 60,
  "missing_skills": ["Skill 1", "Skill 2"],
  "roadmap": ["Step 1 to improve", "Step 2 to improve"]
}
Return ONLY the raw JSON object. No other text.`;

    const parsed = await callOpenRouter(prompt, model);

    return NextResponse.json({ data: parsed });

  } catch (error: any) {
    console.error('Match Predictor Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate match prediction' }, { status: 500 });
  }
}

