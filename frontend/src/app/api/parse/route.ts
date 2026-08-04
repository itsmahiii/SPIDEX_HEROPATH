export const maxDuration = 60;
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { callOpenRouter } from '@/lib/openrouter';
const pdfParse = require('pdf-parse');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileBase64, fileName, targetRole, userId } = body;

    if (!fileBase64 || !targetRole) {
      return NextResponse.json({ error: 'Missing file or target role' }, { status: 400 });
    }

    // 1. Parse PDF Text
    const buffer = Buffer.from(fileBase64, 'base64');
    const pdfData = await pdfParse(buffer);
    const textContent = pdfData.text;

    // 2. Extract structured data via OpenRouter
    const prompt = `
You are an expert technical recruiter and AI career mentor. 
Parse the following resume text for someone targeting the role of "${targetRole}".
Extract the key information and return it strictly as a JSON object matching this exact schema:
{
  "skills": ["skill1", "skill2"],
  "experience_claims": [
    {"claim": "improved performance by 20%", "metric": "20%"}
  ],
  "education": ["Degree Name from University"],
  "summary": "A 2-sentence summary of the candidate's profile.",
  "match_score": 65,
  "verifiable_claims": [
    "I managed a team of 10 people",
    "I increased sales by 50%"
  ]
}

Resume Text:
${textContent}

Return ONLY the raw JSON object, no markdown blocks, no other text.`;

    // Try Claude 3.5 Sonnet first via OpenRouter. 
    // Fallback or budget option: "meta-llama/llama-3.3-70b-instruct:free" or "google/gemini-2.0-flash-exp:free"
    const model = process.env.AI_MODEL || "nvidia/nemotron-3-ultra-550b-a55b:free";
    
    // Using the helper with auto-retry on parse failure
    const parsedJson = await callOpenRouter(prompt, model);

    // 3. (Optional for MVP local dev) Upload file to Supabase Storage
    let fileUrl = 'local-demo-url.pdf';
    
    // Only upload to Supabase if the bucket exists and we have a valid client
    if (supabase && fileName) {
      const fileExt = fileName.split('.').pop();
      const newFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(newFileName, buffer, { contentType: 'application/pdf' });
        
      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabase.storage.from('resumes').getPublicUrl(newFileName);
        fileUrl = publicUrlData.publicUrl;
      }
    }

    // 4. Store in database (if userId is provided)
    let resumeId = null;
    if (userId && supabase) {
      const { data: insertData, error: insertError } = await supabase
        .from('resumes')
        .insert({
          user_id: userId,
          file_url: fileUrl,
          parsed_text: textContent,
          parsed_json: parsedJson,
          target_role: targetRole
        })
        .select()
        .single();
        
      if (!insertError && insertData) {
        resumeId = insertData.id;
      }
    }

    return NextResponse.json({
      success: true,
      data: parsedJson,
      resumeId: resumeId
    });

  } catch (error: any) {
    console.error('API Parse Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
