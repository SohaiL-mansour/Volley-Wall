import { createContext, useEffect, useState } from 'react';

export const AppContext = createContext(); // eslint-disable-line react-refresh/only-export-components

function load(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

const seedUsers = {
  sohail: {
    fullName: 'سهيل العراقي',
    nickname: 'sohail',
    age: 25,
    password: '123456',
    mobile: '01012345678',
    avatar: null,
    wins: 12,
    losses: 3,
    points: 285,
    friends: ['ahmed', 'mohamed', 'ali'],
  },
  ahmed: {
    fullName: 'أحمد الزمالك',
    nickname: 'ahmed',
    age: 27,
    password: '123456',
    mobile: '01011111111',
    avatar: null,
    wins: 10,
    losses: 5,
    points: 240,
    friends: ['sohail'],
  },
  mohamed: {
    fullName: 'محمد بورسعيد',
    nickname: 'mohamed',
    age: 24,
    password: '123456',
    mobile: '01022222222',
    avatar: null,
    wins: 8,
    losses: 4,
    points: 210,
    friends: ['sohail'],
  },
  ali: {
    fullName: 'علي الأهرام',
    nickname: 'ali',
    age: 26,
    password: '123456',
    mobile: '01033333333',
    avatar: null,
    wins: 7,
    losses: 6,
    points: 180,
    friends: ['sohail'],
  },
  khaled: {
    fullName: 'خالد الإسكندرية',
    nickname: 'khaled',
    age: 23,
    password: '123456',
    mobile: '01044444444',
    avatar: null,
    wins: 6,
    losses: 7,
    points: 150,
    friends: [],
  },
};

const seedFriendRequests = [
  { id: 1, from: 'khaled', to: 'sohail', status: 'pending' },
];

const seedTournamentInvites = [
  { id: 1, tournamentId: 1, from: 'ahmed', to: 'sohail', status: 'pending', teamName: 'فريق الزمالك' },
  { id: 2, tournamentId: 2, from: 'sohail', to: 'mohamed', status: 'accepted', teamName: 'فريق العراقي' },
];

export function AppProvider({ children }) {
  const [users, setUsers] = useState(() => load('el3iraky_users', seedUsers));
  const [currentUser, setCurrentUser] = useState(() => load('el3iraky_current', null));
  const [friendRequests, setFriendRequests] = useState(() => load('el3iraky_friendRequests', seedFriendRequests));
  const [tournamentInvites, setTournamentInvites] = useState(() =>
    load('el3iraky_tournamentInvites', seedTournamentInvites)
  );
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => save('el3iraky_users', users), [users]);
  useEffect(() => save('el3iraky_current', currentUser), [currentUser]);
  useEffect(() => save('el3iraky_friendRequests', friendRequests), [friendRequests]);
  useEffect(() => save('el3iraky_tournamentInvites', tournamentInvites), [tournamentInvites]);

  const currentUserData = currentUser ? users[currentUser] : null;

  const login = (nickname, password) => {
    const target = users[nickname.trim().toLowerCase()];
    if (target && target.password === password) {
      setCurrentUser(target.nickname);
      setActiveTab('home');
      return null;
    }
    return 'خطأ في اسم المستخدم أو كلمة المرور، يرجى المحاولة مرة أخرى';
  };

  const signUp = (payload) => {
    const nickname = payload.nickname.trim().toLowerCase();
    if (users[nickname]) {
      return 'اسم الشهرة ده مستخدم من قبل، اختار اسم تاني';
    }
    const newUser = {
      ...payload,
      nickname,
      wins: 0,
      losses: 0,
      points: 0,
      friends: [],
    };
    setUsers((prev) => ({ ...prev, [nickname]: newUser }));
    setCurrentUser(nickname);
    setActiveTab('home');
    return null;
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveTab('home');
  };

  const updateUser = (updates) => {
    if (!currentUser) return;
    setUsers((prev) => {
      const existing = prev[currentUser];
      const wins = updates.wins ?? existing.wins;
      const losses = updates.losses ?? existing.losses;
      const points = updates.points ?? (wins * 10 + Math.max(0, wins - losses) * 2);
      return { ...prev, [currentUser]: { ...existing, ...updates, points } };
    });
  };

  const sendFriendRequest = (toNickname) => {
    const to = toNickname.toLowerCase();
    if (!currentUser || to === currentUser) return 'مش ممكن ترسل طلب لنفسك';
    const exists = friendRequests.find(
      (r) =>
        ((r.from === currentUser && r.to === to) || (r.from === to && r.to === currentUser)) &&
        r.status === 'pending'
    );
    if (exists) return 'في طلب صداقة معلّق بالفعل';
    const alreadyFriend = users[currentUser].friends.includes(to);
    if (alreadyFriend) return 'ده صاحبك بالفعل';
    setFriendRequests((prev) => [...prev, { id: Date.now(), from: currentUser, to, status: 'pending' }]);
    return null;
  };

  const respondFriendRequest = (id, accept) => {
    const req = friendRequests.find((r) => r.id === id);
    if (!req) return;
    setFriendRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: accept ? 'accepted' : 'rejected' } : r))
    );
    if (accept) {
      setUsers((prev) => {
        const a = prev[req.from];
        const b = prev[req.to];
        return {
          ...prev,
          [req.from]: { ...a, friends: Array.from(new Set([...a.friends, req.to])) },
          [req.to]: { ...b, friends: Array.from(new Set([...b.friends, req.from])) },
        };
      });
    }
  };

  const sendTournamentInvite = (tournamentId, toNickname, teamName) => {
    const to = toNickname.toLowerCase();
    if (!currentUser || to === currentUser) return 'مش ممكن تدعي نفسك';
    const already = tournamentInvites.find(
      (i) => i.tournamentId === tournamentId && ((i.from === currentUser && i.to === to) || (i.from === to && i.to === currentUser)) && i.status !== 'rejected'
    );
    if (already) return 'فيه دعوة معلّقة أو مقبولة للبطولة دي';
    const displayName = teamName?.trim() || `فريق ${currentUserData?.fullName || currentUser}`;
    setTournamentInvites((prev) => [
      ...prev,
      { id: Date.now(), tournamentId, from: currentUser, to, status: 'pending', teamName: displayName },
    ]);
    return null;
  };

  const respondTournamentInvite = (id, accept) => {
    setTournamentInvites((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: accept ? 'accepted' : 'rejected' } : i))
    );
  };

  const getTournamentStatus = (tournamentId) => {
    const current = currentUser;
    const accepted = tournamentInvites.find(
      (i) =>
        i.tournamentId === tournamentId &&
        i.status === 'accepted' &&
        (i.from === current || i.to === current)
    );
    if (accepted) {
      const partner = accepted.from === current ? accepted.to : accepted.from;
      return { state: 'registered', partner, teamName: accepted.teamName };
    }
    const pendingSent = tournamentInvites.find(
      (i) => i.tournamentId === tournamentId && i.status === 'pending' && i.from === current
    );
    if (pendingSent) {
      return { state: 'pending', partner: pendingSent.to, teamName: pendingSent.teamName };
    }
    return { state: 'open' };
  };

  const currentTournamentTeams = (tournament) => {
    const accepted = tournamentInvites.filter(
      (i) => i.tournamentId === tournament.id && i.status === 'accepted'
    );
    const count = Math.min(tournament.baseTeams + accepted.length, tournament.maxTeams);
    return count;
  };

  const value = {
    users,
    currentUser,
    currentUserData,
    activeTab,
    setActiveTab,
    friendRequests,
    tournamentInvites,
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
