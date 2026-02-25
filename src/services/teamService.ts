import { supabase } from '@/lib/supabase';

export type Team = {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  ownerId?: string;
  isPublic?: boolean;
  totalXp?: number;
  createdAt?: string;
};

export type TeamMember = {
  id: string;
  teamId: string;
  userId: string;
  role?: string;
  joinedAt?: string;
};

export const TeamService = {
  async createTeam(name: string, description: string | null, ownerId?: string) {
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const { data, error } = await supabase
        .from('teams')
        .insert([{ name, slug, description, owner_id: ownerId || null }])
        .select('*')
        .single();

      if (error) throw error;

      // add owner as member
      if (ownerId) {
        await supabase.from('team_members').insert([{ team_id: data.id, user_id: ownerId, role: 'teacher' }]);
      }

      return { team: data, error: null };
    } catch (err) {
      console.error('createTeam error', err);
      return { team: null, error: err };
    }
  },

  async joinTeam(teamId: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .insert([{ team_id: teamId, user_id: userId }])
        .select('*')
        .single();

      return { member: data, error };
    } catch (err) {
      console.error('joinTeam error', err);
      return { member: null, error: err };
    }
  },

  async leaveTeam(teamId: string, userId: string) {
    try {
      const { error } = await supabase.from('team_members').delete().eq('team_id', teamId).eq('user_id', userId);
      return { error };
    } catch (err) {
      console.error('leaveTeam error', err);
      return { error: err };
    }
  },

  async getTeams(): Promise<Team[]> {
    try {
      const { data, error } = await supabase.from('teams').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('getTeams error', err);
      return [];
    }
  },

  async getTeamsForUser(userId: string): Promise<Team[]> {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('team:teams(*)')
        .eq('user_id', userId);

      if (error) throw error;
      return (data || []).map((r: any) => ({ ...r.team }));
    } catch (err) {
      console.error('getTeamsForUser error', err);
      return [];
    }
  },

  async getTeamById(teamId: string) {
    try {
      const { data, error } = await supabase.from('teams').select('*').eq('id', teamId).single();
      if (error) throw error;
      return { team: data, error: null };
    } catch (err) {
      console.error('getTeamById error', err);
      return { team: null, error: err };
    }
  },

  async getTeamMembers(teamId: string) {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('user:users(id, username, email, total_points, level), role, joined_at')
        .eq('team_id', teamId);

      if (error) throw error;
      return (data || []).map((r: any) => ({ ...r.user, role: r.role, joinedAt: r.joined_at }));
    } catch (err) {
      console.error('getTeamMembers error', err);
      return [];
    }
  },

  async getTeamLeaderboard(teamId: string) {
    try {
      const members = await this.getTeamMembers(teamId);
      // sort by total_points (fallback to 0)
      return members.sort((a: any, b: any) => (b.total_points || 0) - (a.total_points || 0));
    } catch (err) {
      console.error('getTeamLeaderboard error', err);
      return [];
    }
  }
};
