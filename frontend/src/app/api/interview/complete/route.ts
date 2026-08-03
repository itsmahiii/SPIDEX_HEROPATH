import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { callOpenRouter } from '@/lib/openrouter';

export async function POST(req: NextRequest) {
  try {
    const { messages, userId } = await req.json();
    
    // In a real app we'd have a real sessionId and userId. For MVP, we'll assume dummy user ID if not provided.
    const uid = userId || '00000000-0000-0000-0000-000000000000';
    const model = process.env.AI_MODEL || "nvidia/nemotron-3-ultra-550b-a55b:free";

    // Format current session transcript
    const currentTranscript = messages.map((m: any) => `${m.role.toUpperCase()}: ${m.content} ${m.feedback ? '(Feedback: '+m.feedback+')' : ''}`).join("\n");
    let confidenceDelta = null;
    let newWeakSpots = null;

    if (supabase) {
      // 1. Fetch previous sessions
      const { data: pastSessions } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('user_id', uid)
        .order('completed_at', { ascending: false });

      // Save current session
      const { data: newSession } = await supabase
        .from('interview_sessions')
        .insert({
          user_id: uid,
          questions: messages,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (pastSessions && pastSessions.length > 0 && newSession) {
        const lastSession = pastSessions[0];
        const lastTranscript = lastSession.questions.map((m: any) => `${m.role.toUpperCase()}: ${m.content} ${m.feedback ? '(Feedback: '+m.feedback+')' : ''}`).join("\n");

        // 2. Feature 2: Confidence Delta Tracking
        const deltaPrompt = `Compare these two interview sessions for the same candidate.
Session 1 (Old):
${lastTranscript}

Session 2 (New):
${currentTranscript}

Return JSON strictly matching:
{
  "improved_areas": ["string", "string"],
  "still_weak_areas": ["string", "string"],
  "one_line_summary": "A short summary of their progress."
}
Return ONLY JSON. No other text.`;

        try {
          confidenceDelta = await callOpenRouter(deltaPrompt, model);
          await supabase.from('interview_comparisons').insert({
            user_id: uid,
            session_id_old: lastSession.id,
            session_id_new: newSession.id,
            improved_areas: confidenceDelta.improved_areas,
            still_weak_areas: confidenceDelta.still_weak_areas,
            summary: confidenceDelta.one_line_summary
          });
        } catch (e) {
          console.error("Delta Parse Error", e);
        }

        // 3. Feature 3: Weak Spot Tagging (if 2+ sessions including this one)
        // Note: pastSessions doesn't include the one we just inserted, so pastSessions.length >= 1 means 2+ total.
        const allTranscripts = [currentTranscript, ...pastSessions.map((s: any) => s.questions.map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join("\n"))].join("\n\n---NEXT SESSION---\n\n");
        
        const weakSpotPrompt = `Given these interview feedback notes from multiple sessions:
${allTranscripts}

Identify up to 3 recurring weak spots the candidate should focus on. Return JSON strictly matching:
[
  {"tag": "short tag name", "description": "1 sentence description"}
]
Return ONLY JSON. No other text.`;

        try {
          newWeakSpots = await callOpenRouter(weakSpotPrompt, model);
          await supabase.from('users').update({ weak_spots: newWeakSpots }).eq('id', uid);
        } catch (e) {
          console.error("Weak Spot Parse Error", e);
        }
      }
    } else {
      // Mock logic for local MVP without Supabase
      // We will pretend there's a delta and weak spots if messages length > 5
      if (messages.length > 5) {
        confidenceDelta = {
          improved_areas: ["Technical Depth", "Confidence"],
          still_weak_areas: ["Metrics specifics"],
          one_line_summary: "You showed great improvement in explaining your thought process!"
        };
        newWeakSpots = [
          { tag: "vague on metrics", description: "Tends to give round numbers without explaining how they were measured" }
        ];
      }
    }

    return NextResponse.json({ 
      success: true, 
      delta: confidenceDelta,
      weakSpots: newWeakSpots
    });

  } catch (error: any) {
    console.error('Interview Complete Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
