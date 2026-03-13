import { supabase } from '../lib/supabase';

export type Mission = {
  id: string;
  title: string;
  description?: string;
  xpReward?: number;
  createdAt?: string;
  isActive?: boolean;
};

export type MissionSubmission = {
  id: string;
  missionId: string;
  userId: string;
  imagePath?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  aiVerification?: any;
  score?: number;
  status?: 'pending' | 'verified' | 'rejected';
  createdAt?: string;
};

async function awardPointsToUserByEmail(email: string, points: number, description: string) {
  try {
    const { data: userRow } = await supabase.from('users').select('id, total_points').eq('email', email).maybeSingle();
    if (!userRow) return false;
    const userId = userRow.id;

    try { await supabase.from('transactions').insert([{ user_id: userId, type: 'earned_braillequest', amount: points, description }]); } catch (err) { /* ignore */ }

    try {
      const newTotal = (userRow.total_points || 0) + points;
      await supabase.from('users').update({ total_points: newTotal }).eq('id', userId);
    } catch (err) {
      console.warn('Failed to update points in Supabase users table', err);
    }

    return true;
  } catch (err) {
    console.warn('awardPointsToUserByEmail failed', err);
    return false;
  }
}

export const MissionService = {
  async getMissions(): Promise<Mission[]> {
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch missions', error);
        return [];
      }

      const out = (data || []).map((m: any) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        xpReward: m.xp_reward,
        createdAt: m.created_at,
        isActive: m.is_active
      }));

      console.log('[MissionService] getMissions ->', out.length)
      return out;
    } catch (err) {
      console.error('getMissions unexpected error', err)
      return [];
    }
  },

  async uploadSubmission(
    userId: string,
    missionId: string,
    file: File,
    opts?: { latitude?: number; longitude?: number }
  ): Promise<{ submission?: MissionSubmission; error?: any }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `mission-submissions/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('mission-submissions')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload failed', uploadError);
        return { error: uploadError };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('mission-submissions')
        .getPublicUrl(filePath);

      const submissionRow = {
        mission_id: missionId,
        user_id: userId,
        image_path: filePath,
        image_url: publicUrl,
        latitude: opts?.latitude || null,
        longitude: opts?.longitude || null,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('mission_submissions')
        .insert([submissionRow])
        .select('*')
        .single();

      if (error) {
        console.error('Failed to insert submission row', error);
        return { error };
      }

      return {
        submission: {
          id: data.id,
          missionId: data.mission_id,
          userId: data.user_id,
          imagePath: data.image_path,
          imageUrl: data.image_url,
          latitude: data.latitude,
          longitude: data.longitude,
          status: data.status,
          createdAt: data.created_at
        }
      };
    } catch (err) {
      console.error('uploadSubmission error', err);
      return { error: err };
    }
  },

  async verifySubmission(submission: MissionSubmission, expectedText?: string, userEmail?: string) {
    try {
      const resp = await fetch(submission.imageUrl || '');
      const blob = await resp.blob();
      const reader = new FileReader();

      const base64: string = await new Promise((res, rej) => {
        reader.onloadend = () => res(reader.result as string);
        reader.onerror = rej;
        reader.readAsDataURL(blob);
      });

      const verifyRes = await fetch('/api/verify-braille', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType: blob.type, expectedText })
      })
      if (!verifyRes.ok) throw new Error('AI verification failed')
      const verifyJson = await verifyRes.json()
      const aiResult = verifyJson.result || verifyJson

      const status = aiResult.isBraille && aiResult.readable && (aiResult.confidence ?? 0) > 0.6 ? 'verified' : 'rejected';
      const score = Math.max(0, Math.min(100, Math.round((aiResult.score ?? ((aiResult.confidence || 0) * 100)))));

      const { error: updateError } = await supabase
        .from('mission_submissions')
        .update({
          ai_verification: aiResult,
          status,
          score,
          updated_at: new Date().toISOString()
        })
        .eq('id', submission.id as any);

      if (updateError) {
        console.error('Failed to update submission with AI result', updateError);
        return { success: false, error: updateError };
      }

      if (status === 'verified' && userEmail) {
        try {
          const points = Math.max(10, Math.floor((submission as any).xpReward || 50));
          await awardPointsToUserByEmail(userEmail, points, `Verified mission ${submission.missionId}`);
        } catch (awardErr) {
          console.warn('Failed to award points via Supabase', awardErr);
        }
      }

      return { success: true, aiResult, status, score };
    } catch (err) {
      console.error('verifySubmission error', err);
      return { success: false, error: err };
    }
  },

  async getPendingSubmissions() {
    const { data, error } = await supabase
      .from('mission_submissions')
      .select('id, mission_id, user_id, image_url, latitude, longitude, ai_verification, score, status, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch pending submissions', error);
      return [];
    }

    return (data || []).map((s: any) => ({
      id: s.id,
      missionId: s.mission_id,
      userId: s.user_id,
      imageUrl: s.image_url,
      latitude: s.latitude,
      longitude: s.longitude,
      aiVerification: s.ai_verification,
      score: s.score,
      status: s.status,
      createdAt: s.created_at
    }));
  },

  async approveSubmission(submissionId: string, _moderatorId?: string, awardPoints = true) {
    try {
      const { data, error } = await supabase
        .from('mission_submissions')
        .update({ status: 'verified', updated_at: new Date().toISOString() })
        .eq('id', submissionId)
        .select('*')
        .single();

      if (error) {
        console.error('Failed to approve submission', error);
        return { success: false, error };
      }

      if (awardPoints) {
        try {
          const missionRes = await supabase.from('missions').select('xp_reward').eq('id', data.mission_id).single();
          const points = (missionRes.data?.xp_reward) || 50;
          const userRow = await supabase.from('users').select('email').eq('id', data.user_id).single();
          if (userRow.data?.email) {
            try {
              await awardPointsToUserByEmail(userRow.data.email, points, `Teacher-approved submission ${submissionId}`);
            } catch (err) {
              console.warn('Failed to award points on manual approval', err);
            }
          }
        } catch (awardErr) {
          console.warn('Failed to award points on manual approval', awardErr);
        }
      }

      return { success: true, submission: data };
    } catch (err) {
      console.error('approveSubmission error', err);
      return { success: false, error: err };
    }
  },

  async rejectSubmission(submissionId: string, reason?: string) {
    try {
      const updateObj: any = { status: 'rejected', updated_at: new Date().toISOString() };
      if (reason) updateObj.ai_verification = { moderatorReason: reason };

      const { data, error } = await supabase
        .from('mission_submissions')
        .update(updateObj)
        .eq('id', submissionId)
        .select('*')
        .single();

      if (error) {
        console.error('Failed to reject submission', error);
        return { success: false, error };
      }

      return { success: true, submission: data };
    } catch (err) {
      console.error('rejectSubmission error', err);
      return { success: false, error: err };
    }
  },

  async getSubmissionsForUser(userId: string) {
    const { data, error } = await supabase
      .from('mission_submissions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch submissions', error);
      return [];
    }

    return data;
  }
};