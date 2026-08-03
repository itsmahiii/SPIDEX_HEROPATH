import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter } from '@/lib/openrouter';

export async function POST(req: NextRequest) {
  try {
    const { messages, profile, resumeSummary, interviewerMode = "Technical" } = await req.json();

    const personas: Record<string, string> = {
      "HR": "an HR Recruiter focusing on cultural fit, teamwork, and background",
      "Technical": "a strict but helpful technical interviewer focusing on hard skills and system design",
      "Manager": "an Engineering Manager focusing on leadership, conflict resolution, and project delivery",
      "CEO": "a CEO focusing on vision, business impact, and high-level strategy"
    };
    
    const persona = personas[interviewerMode] || personas["Technical"];

    const model = process.env.AI_MODEL || "nvidia/nemotron-3-ultra-550b-a55b:free";
    
    let prompt = "";
    
    if (!messages || messages.length === 0) {
      // First question
      prompt = `You are ${persona} for a ${profile?.target_role || "tech"} role.
The candidate's resume summary is: "${resumeSummary || "Experienced candidate"}".
The candidate's biggest fear about interviewing is: "${profile?.biggest_fear || "None"}".

Start the interview by asking exactly one targeted question based on their resume. 
Subtly address their biggest fear in a reassuring way before asking the question.
Return your response STRICTLY as a JSON object matching this schema:
{
  "content": "Your interview question text here"
}
Return ONLY the raw JSON object. No other text.`;
      
      const response = await callOpenRouter(prompt, model);
      return NextResponse.json({ 
        role: "bot", 
        content: response.content,
        feedback: null
      });
      
    } else {
      // Subsequent interaction: Evaluate latest user answer and ask next question
      const chatHistory = messages.map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
      
      prompt = `You are ${persona} for a ${profile?.target_role || "tech"} role.
The candidate's biggest fear about interviewing is: "${profile?.biggest_fear || "None"}".

Here is the chat history so far:
${chatHistory}

The user just provided an answer. You must evaluate their answer and ask the next question.
Keep in mind their biggest fear, and evaluate if they handled the fear well.
Return your response STRICTLY as a JSON object matching this schema:
{
  "feedback": "A short, actionable verdict/feedback on their answer. Start with '⚠️ VERDICT:' or '✅ VERDICT:'",
  "next_question": "Your next interview question. Do not ask more than one question at a time."
}
Return ONLY the raw JSON object. No other text.`;

      let parsed;
      try {
        parsed = await callOpenRouter(prompt, model);
      } catch (e) {
        console.error("Failed to call AI:", e);
        // Fallback
        parsed = {
          feedback: "⚠️ VERDICT: The AI failed to parse your answer properly.",
          next_question: "Let's move on. Tell me about a time you solved a difficult problem."
        };
      }
      
      return NextResponse.json({ 
        role: "bot", 
        content: parsed.next_question,
        feedback: parsed.feedback
      });
    }

  } catch (error: any) {
    console.error('Interview API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
