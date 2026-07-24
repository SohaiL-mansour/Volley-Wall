import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from './lib/supabaseClient';

export const AppContext = createContext(); // eslint-disable-line react-refresh/only-export-components

function toProfile(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name || '',
    nickname: (row.nickname || '').toLowerCase(),
    age: row.age ?? '',
    mobile: row.mobile || '',
    avatar: row.avatar_url || null,
    wins: row.wins ?? 0,
    losses: row.losses ?? 0,
    points: row.points ?? 0,
    isAdmin: row.is_admin ?? false,
    createdAt: row.created_at,
  };
}

function toUserMap(rows) {
  const map = {};
  for (const row of rows || []) {
    const p = toProfile(row);
    if (p.nickname) map[p.nickname] = p;
  }
  return map;
}

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState({});
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [matches, setMatches] = useState([]);
  const [matchResults, setMatchResults] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);

  const currentUserData = currentUser ? users[currentUser.toLowerCase()] : null;

  const getNicknameById = useCallback(
    (id) => {
      if (!id) return '';
      const found = Object.values(users).find((u) => u.id === id);
      return found ? found.nickname : '';
    },
    [users]
  );

  const fetchProfiles = useCallback(async () => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
      console.error('fetchProfiles error:', error.message);
      return;
    }
    setUsers(toUserMap(data));
  }, []);

  const fetchTournaments = useCallback(async () => {
    const { data, error } = await supabase.from('tournaments').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('fetchTournaments error:', error.message);
      return;
    }
    setTournaments(
      (data || []).map((t) => ({
        id: t.id,
        location: t.location,
        price: t.price,
        baseTeams: t.base_teams,
        maxTeams: t.max_teams,
        teamCount: t.team_count,
        isActive: t.is_active,
      }))
    );
  }, []);

  const fetchTeams = useCallback(async () => {
    const { data, error } = await supabase.from('tournament_teams').select('*');
    if (error) {
      console.error('fetchTeams error:', error.message);
      return;
    }
    setTeams(
      (data || []).map((team) => ({
        id: team.id,
        tournamentId: team.tournament_id,
        teamName: team.team_name,
        player1Id: team.player1_id,
        player2Id: team.player2_id,
        status: team.status,
      }))
    );
  }, []);

  const fetchFriendRequests = useCallback(async () => {
    const { data, error } = await supabase.from('friend_requests').select('*');
    if (error) {
      console.error('fetchFriendRequests error:', error.message);
      return;
    }
    setFriendRequests(
      (data || []).map((r) => ({
        id: r.id,
        fromId: r.from_id,
        toId: r.to_id,
        from: getNicknameById(r.from_id) || r.from_id,
        to: getNicknameById(r.to_id) || r.to_id,
        status: r.status,
      }))
    );
  }, [getNicknameById]);

  const fetchMatches = useCallback(async () => {
    const { data, error } = await supabase.from('matches').select('*');
    if (error) {
      console.error('fetchMatches error:', error.message);
      return;
    }
    setMatches(
      (data || []).map((m) => ({
        id: m.id,
        tournamentId: m.tournament_id,
        team1Id: m.team1_id,
        team2Id: m.team2_id,
        scheduledTime: m.scheduled_time,
        status: m.status,
      }))
    );
  }, []);

  const fetchMatchResults = useCallback(async () => {
    const { data, error } = await supabase.from('match_results').select('*');
    if (error) {
      console.error('fetchMatchResults error:', error.message);
      return;
    }
    setMatchResults(
      (data || []).map((r) => ({
        id: r.id,
        matchId: r.match_id,
        team1Goals: r.team1_goals,
        team2Goals: r.team2_goals,
        winnerTeamId: r.winner_team_id,
      }))
    );
  }, []);

  const refreshAll = useCallback(async () => {
    await fetchProfiles();
    await fetchTournaments();
    await fetchTeams();
    await fetchFriendRequests();
    await fetchMatches();
    await fetchMatchResults();
  }, [fetchProfiles, fetchTournaments, fetchTeams, fetchFriendRequests, fetchMatches, fetchMatchResults]);

  useEffect(() => {
    let mounted = true;
    async function init() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user && mounted) {
        const { data } = await supabase.from('profiles').select('*').eq('id', sessionData.session.user.id).single();
        if (data) {
          const p = toProfile(data);
          setCurrentUser(p.nickname);
          await refreshAll();
        }
      }
      setLoading(false);
    }
    init();
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (data) {
          const p = toProfile(data);
          setCurrentUser(p.nickname);
          await refreshAll();
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setUsers({});
        setTournaments([]);
        setTeams([]);
        setFriendRequests([]);
        setMatches([]);
        setMatchResults([]);
      }
    });
    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, [refreshAll]);

  useEffect(() => {
    if (!Object.keys(users).length) return;
    setFriendRequests((prev) =>
      prev.map((r) => ({
        ...r,
        from: getNicknameById(r.fromId) || r.from,
        to: getNicknameById(r.toId) || r.to,
      }))
    );
  }, [users, getNicknameById]);

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return 'خطأ في الإيميل أو كلمة المرور، يرجى المحاولة مرة أخرى';
    return null;
  };

  const signUp = async (payload) => {
    const { email, password, fullName, nickname, age, mobile, avatar } = payload;
    const lowerNick = nickname.trim().toLowerCase();

    const { data: existing } = await supabase.from('profiles').select('id').eq('nickname', lowerNick).maybeSingle();
    if (existing) return 'اسم الشهرة ده مستخدم من قبل، اختار اسم تاني';

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nickname: lowerNick,
          full_name: fullName,
          age: Number(age) || 0,
          mobile,
          avatar_url: avatar,
        },
      },
    });
    if (authError) return authError.message;
    return null;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const updateUser = async (updates) => {
    if (!currentUserData) return;
    const dbUpdates = {};
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.age !== undefined) dbUpdates.age = updates.age;
    if (updates.mobile !== undefined) dbUpdates.mobile = updates.mobile;
    if (updates.avatar !== undefined) dbUpdates.avatar_url = updates.avatar;

    const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', currentUserData.id);
    if (error) return error.message;
    await refreshAll();
    return null;
  };

  const sendFriendRequest = async (toNickname) => {
    const to = toNickname.toLowerCase();
    const toUser = users[to];
    if (!currentUserData || !toUser) return 'المستخدم مش موجود';
    if (to === currentUserData.nickname) return 'مش ممكن ترسل طلب لنفسك';

    const { data: existing } = await supabase
      .from('friend_requests')
      .select('id')
      .or(`and(from_id.eq.${currentUserData.id},to_id.eq.${toUser.id}),and(from_id.eq.${toUser.id},to_id.eq.${currentUserData.id})`)
      .eq('status', 'pending')
      .maybeSingle();
    if (existing) return 'في طلب صداقة معلّق بالفعل';

    const { error } = await supabase.from('friend_requests').insert({
      from_id: currentUserData.id,
      to_id: toUser.id,
      status: 'pending',
    });
    if (error) return error.message;
    await refreshAll();
    return null;
  };

  const respondFriendRequest = async (id, accept) => {
    const { error } = await supabase
      .from('friend_requests')
      .update({ status: accept ? 'accepted' : 'rejected' })
      .eq('id', id);
    if (error) return error.message;
    await refreshAll();
    return null;
  };

  const sendTournamentInvite = async (tournamentId, toNickname, teamName) => {
    const toUser = users[toNickname.toLowerCase()];
    if (!currentUserData || !toUser) return 'المستخدم مش موجود';
    if (toUser.id === currentUserData.id) return 'مش ممكن تدعي نفسك';

    const { data: existing } = await supabase
      .from('tournament_teams')
      .select('id')
      .or(`and(player1_id.eq.${currentUserData.id},player2_id.eq.${toUser.id}),and(player1_id.eq.${toUser.id},player2_id.eq.${currentUserData.id})`)
      .eq('tournament_id', tournamentId)
      .in('status', ['pending', 'accepted'])
      .maybeSingle();
    if (existing) return 'فيه دعوة معلّقة أو مقبولة للبطولة دي';

    const displayName = teamName?.trim() || `فريق ${currentUserData.fullName || currentUserData.nickname}`;
    const { error } = await supabase.from('tournament_teams').insert({
      tournament_id: tournamentId,
      team_name: displayName,
      player1_id: currentUserData.id,
      player2_id: toUser.id,
      status: 'pending',
    });
    if (error) return error.message;
    await refreshAll();
    return null;
  };

  const respondTournamentInvite = async (id, accept) => {
    const { error } = await supabase
      .from('tournament_teams')
      .update({ status: accept ? 'accepted' : 'rejected' })
      .eq('id', id);
    if (error) return error.message;
    await refreshAll();
    return null;
  };

  const getTournamentStatus = (tournamentId) => {
    if (!currentUserData) return { state: 'open' };
    const team = teams.find(
      (t) =>
        t.tournamentId === tournamentId &&
        (t.player1Id === currentUserData.id || t.player2Id === currentUserData.id)
    );
    if (!team) return { state: 'open' };
    const partnerId = team.player1Id === currentUserData.id ? team.player2Id : team.player1Id;
    const partner = getNicknameById(partnerId);
    const isIncoming = team.player2Id === currentUserData.id;
    if (team.status === 'accepted') return { state: 'registered', partner, teamName: team.teamName, teamId: team.id };
    if (team.status === 'pending') return { state: 'pending', partner, teamName: team.teamName, isIncoming, teamId: team.id };
    return { state: 'open' };
  };

  const currentTournamentTeams = (tournament) => {
    return Math.min(tournament.baseTeams + tournament.teamCount, tournament.maxTeams);
  };

  const tournamentInvites = useMemo(() => {
    if (!currentUserData) return [];
    return teams
      .filter((t) => t.player2Id === currentUserData.id && t.status === 'pending')
      .map((t) => ({
        id: t.id,
        tournamentId: t.tournamentId,
        tournament: tournaments.find((tm) => tm.id === t.tournamentId)?.location || '',
        from: getNicknameById(t.player1Id),
        to: currentUserData.nickname,
        teamName: t.teamName,
        status: t.status,
      }));
  }, [teams, tournaments, currentUserData, getNicknameById]);

  const getMatchSchedule = useCallback(() => {
    return matches.map((m) => {
      const t1 = teams.find((t) => t.id === m.team1Id);
      const t2 = teams.find((t) => t.id === m.team2Id);
      return {
        id: m.id,
        time: m.scheduledTime,
        teamA: {
          id: t1?.id,
          name: t1?.teamName || 'فريق 1',
          players: [getNicknameById(t1?.player1Id), getNicknameById(t1?.player2Id)].filter(Boolean),
        },
        teamB: {
          id: t2?.id,
          name: t2?.teamName || 'فريق 2',
          players: [getNicknameById(t2?.player1Id), getNicknameById(t2?.player2Id)].filter(Boolean),
        },
      };
    });
  }, [matches, teams, getNicknameById]);

  // Admin actions
  const createTournament = async ({ location, price, baseTeams, maxTeams }) => {
    if (!currentUserData?.isAdmin) return 'مش مسموح';
    const { error } = await supabase.from('tournaments').insert({
      location,
      price,
      base_teams: baseTeams,
      max_teams: maxTeams,
      created_by: currentUserData.id,
    });
    if (error) return error.message;
    await refreshAll();
    return null;
  };

  const createMatch = async ({ tournamentId, team1Id, team2Id, scheduledTime }) => {
    if (!currentUserData?.isAdmin) return 'مش مسموح';
    const { error } = await supabase.from('matches').insert({
      tournament_id: tournamentId,
      team1_id: team1Id,
      team2_id: team2Id,
      scheduled_time: scheduledTime,
    });
    if (error) return error.message;
    await refreshAll();
    return null;
  };

  const recordMatchResult = async ({ matchId, team1Goals, team2Goals, winnerTeamId }) => {
    if (!currentUserData?.isAdmin) return 'مش مسموح';
    const { error } = await supabase.from('match_results').upsert(
      {
        match_id: matchId,
        team1_goals: team1Goals,
        team2_goals: team2Goals,
        winner_team_id: winnerTeamId,
      },
      { onConflict: 'match_id' }
    );
    if (error) return error.message;
    await refreshAll();
    return null;
  };

  const value = {
    users,
    currentUser,
    currentUserData,
    currentUserIsAdmin: currentUserData?.isAdmin ?? false,
    activeTab,
    setActiveTab,
    friendRequests,
    tournamentInvites,
    matches,
    matchResults,
    tournaments,
    teams,
    loading,
    login,
    signUp,
    logout,
    updateUser,
    sendFriendRequest,
    respondFriendRequest,
    sendTournamentInvite,
    respondTournamentInvite,
    getTournamentStatus,
    currentTournamentTeams,
    getMatchSchedule,
    createTournament,
    createMatch,
    recordMatchResult,
    refreshAll,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
