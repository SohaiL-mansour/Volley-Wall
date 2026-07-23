import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, UserPlus, Check, Clock, Bell, Swords, X, CheckCircle } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import Modal from './Modal';
import Avatar from './Avatar';

function FriendsScreen() {
  const { users, currentUserData, friendRequests, tournamentInvites, sendFriendRequest, respondFriendRequest, respondTournamentInvite } = useApp();
  const [query, setQuery] = useState('');
  const [showRequests, setShowRequests] = useState(false);
  const [requestTab, setRequestTab] = useState('friends');
  const [msg, setMsg] = useState('');

  const current = currentUserData?.nickname;
  const allPlayers = Object.values(users).filter((u) => u.nickname !== current);
  const filtered = allPlayers.filter((u) => u.fullName.includes(query) || u.nickname.includes(query));

  const incomingFriends = friendRequests.filter((r) => r.to === current && r.status === 'pending');
  const incomingTournaments = tournamentInvites.filter((i) => i.to === current && i.status === 'pending');

  const getFriendStatus = (nickname) => {
    if (currentUserData?.friends.includes(nickname)) return 'friend';
    const sent = friendRequests.find((r) => r.from === current && r.to === nickname && r.status === 'pending');
    if (sent) return 'pending';
    const received = friendRequests.find((r) => r.to === current && r.from === nickname && r.status === 'pending');
    if (received) return 'incoming';
    return 'none';
  };

  const handleAdd = (nickname) => {
    setMsg('');
    const res = sendFriendRequest(nickname);
    if (res) setMsg(res);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex w-full flex-col items-center px-5 pb-6 pt-6 text-center"
    >
      <div className="mb-4 flex items-center gap-2">
        <Users className="h-6 w-6 text-crimson" />
        <h2 className="text-2xl font-bold text-white">الصحاب</h2>
      </div>

      <button
        onClick={() => setShowRequests(true)}
        className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl bg-crimson py-3 font-bold text-white shadow transition hover:bg-crimson-light"
      >
        <Bell className="h-4 w-4" />
        طلبات الصداقة
        {(incomingFriends.length + incomingTournaments.length > 0) && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-crimson">
            {incomingFriends.length + incomingTournaments.length}
          </span>
        )}
      </button>

      <div className="relative mb-5 w-full">
        <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="دور على لاعب..."
          className="w-full rounded-xl border border-white/10 bg-phone-light py-3 pr-10 pl-4 text-center text-white placeholder-white/40 outline-none focus:border-crimson focus:ring-1 focus:ring-crimson"
        />
      </div>

      {msg && <p className="mb-3 text-xs font-bold text-crimson">{msg}</p>}

      <div className="w-full space-y-3">
        {filtered.map((u) => {
          const status = getFriendStatus(u.nickname);
          return (
            <div
              key={u.nickname}
              className="flex items-center justify-between rounded-2xl bg-phone-light p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <Avatar user={u} size="sm" />
                <div className="text-right">
                  <span className="block font-semibold text-white">{u.fullName}</span>
                  <span className="text-xs text-white/50">@{u.nickname}</span>
                </div>
              </div>

              {status === 'friend' ? (
                <span className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400">
                  <Check className="h-3.5 w-3.5" /> صاحب
                </span>
              ) : status === 'pending' ? (
                <span className="flex items-center gap-1 rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-400">
                  <Clock className="h-3.5 w-3.5" /> معلّق
                </span>
              ) : (
                <button
                  onClick={() => handleAdd(u.nickname)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-crimson text-white shadow transition hover:bg-crimson-light"
                >
                  <UserPlus className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-sm text-white/40">مفيش لاعبين مطابقين</p>}
      </div>

      <AnimatePresence>
        {showRequests && (
          <Modal title="طلبات الصداقة" titleIcon={Bell} onClose={() => setShowRequests(false)}>
            <div className="mb-4 flex w-full overflow-hidden rounded-xl bg-phone p-1">
              <button
                onClick={() => setRequestTab('friends')}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                  requestTab === 'friends' ? 'bg-crimson text-white' : 'text-white/60'
                }`}
              >
                طلبات الصداقة
              </button>
              <button
                onClick={() => setRequestTab('tournaments')}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                  requestTab === 'tournaments' ? 'bg-crimson text-white' : 'text-white/60'
                }`}
              >
                دعوات البطولات
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {requestTab === 'friends' && (
                <div className="space-y-2">
                  {incomingFriends.length === 0 ? (
                    <p className="py-6 text-center text-sm text-white/50">مفيش طلبات صداقة جديدة</p>
                  ) : (
                    incomingFriends.map((r) => {
                      const fromUser = users[r.from];
                      return (
                        <div key={r.id} className="flex items-center justify-between rounded-xl bg-phone p-3">
                          <div className="flex items-center gap-3">
                            <Avatar user={fromUser} size="sm" />
                            <span className="text-sm font-semibold text-white">{fromUser?.fullName || r.from}</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => respondFriendRequest(r.id, true)}
                              className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-xs font-bold text-white"
                            >
                              <CheckCircle className="h-3 w-3" /> قبول
                            </button>
                            <button
                              onClick={() => respondFriendRequest(r.id, false)}
                              className="flex items-center gap-1 rounded-lg bg-rose-600 px-2 py-1 text-xs font-bold text-white"
                            >
                              <X className="h-3 w-3" /> رفض
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {requestTab === 'tournaments' && (
                <div className="space-y-2">
                  {incomingTournaments.length === 0 ? (
                    <p className="py-6 text-center text-sm text-white/50">مفيش دعوات بطولات</p>
                  ) : (
                    incomingTournaments.map((i) => {
                      const fromUser = users[i.from];
                      const tournament = { 1: 'DaCentro Mall', 2: 'padbol arena' }[i.tournamentId];
                      return (
                        <div key={i.id} className="rounded-xl bg-phone p-3 text-center">
                          <div className="mb-2 flex items-center justify-center gap-2">
                            <Swords className="h-4 w-4 text-crimson" />
                            <p className="text-sm font-bold text-white">
                              {fromUser?.fullName || i.from} يدعوك للانضمام في {i.teamName || 'فريق'} لبطولة {tournament}
                            </p>
                          </div>
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => respondTournamentInvite(i.id, true)}
                              className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white"
                            >
                              <CheckCircle className="h-3 w-3" /> قبول
                            </button>
                            <button
                              onClick={() => respondTournamentInvite(i.id, false)}
                              className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white"
                            >
                              <X className="h-3 w-3" /> رفض
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default FriendsScreen;
