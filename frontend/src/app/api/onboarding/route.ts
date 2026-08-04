export const maxDuration = 60;
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function POST(req: NextRequest) {
  try {
    const { stage, target_role, biggest_fear, userId } = await req.json();

    if (!stage || !target_role || !biggest_fear) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const profile = {
      stage,
      target_role,
      biggest_fear
    };

    if (supabase) {
      // Assuming userId is passed, but for MVP without auth we might just use a dummy or create a user row
      // We will skip strict DB insert if userId isn't valid in this MVP, 
      // but ideally this is: await supabase.from('users').update({ onboarding_profile: profile }).eq('id', userId);
      
      if (userId) {
         const { error } = await supabase
            .from('users')
            .update({ onboarding_profile: profile })
            .eq('id', userId);
            
         if (error) {
             console.error("Supabase Error:", error);
         }
      }
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (error: any) {
    console.error('Onboarding API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

