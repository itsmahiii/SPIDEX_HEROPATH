export const maxDuration = 60;
import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter } from '@/lib/openrouter';

async function scrapeUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    if (!response.ok) return `Failed to fetch: ${response.statusText}`;
    const html = await response.text();
    // Naive HTML stripping to avoid cheerio dependency issues
    const text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
                     .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
                     .replace(/<[^>]+>/g, ' ')
                     .replace(/\s+/g, ' ')
                     .trim();
    return text.substring(0, 5000); // limit to 5000 chars
  } catch (e: any) {
    return `Error scraping ${url}: ${e.message}`;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { githubUrl, portfolioUrl, linkedInText, resumeData } = await req.json();

    let githubContext = "";
    if (githubUrl) {
      const ghData = await scrapeUrl(githubUrl);
      githubContext = `GitHub Data:\n${ghData}\n`;
    }

    let portfolioContext = "";
    if (portfolioUrl) {
      const portData = await scrapeUrl(portfolioUrl);
      portfolioContext = `Portfolio Data:\n${portData}\n`;
    }

    let linkedInContext = "";
    if (linkedInText) {
      linkedInContext = `LinkedIn Data:\n${linkedInText}\n`;
    }

    const prompt = `You are an expert Personal Branding Consultant and Tech Recruiter.
Analyze the following candidate's online presence and resume. 

Resume Summary: ${resumeData?.summary || 'N/A'}
Resume Skills: ${resumeData?.skills?.join(', ') || 'N/A'}

${githubContext}
${portfolioContext}
${linkedInContext}

Evaluate their brand visibility, project quality, and overall profile cohesiveness.
Return your evaluation STRICTLY as a JSON object matching this schema:
{
  "brand_score": 82,
  "strengths": ["Strong GitHub activity", "Clear portfolio branding"],
  "weaknesses": ["LinkedIn summary is missing", "No links to live projects"],
  "actionable_improvements": ["Add a professional photo to LinkedIn", "Pin your top 3 repos on GitHub"],
  "overall_verdict": "A solid developer profile, but lacks thought leadership visibility."
}
Return ONLY the raw JSON object. No other text.`;

    const model = process.env.AI_MODEL || "nvidia/nemotron-3-ultra-550b-a55b:free";
    const parsed = await callOpenRouter(prompt, model);

    return NextResponse.json({ data: parsed });

  } catch (error: any) {
    console.error('Brand Analyzer Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to analyze brand' }, { status: 500 });
  }
}

