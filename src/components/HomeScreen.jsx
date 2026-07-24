import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Calendar, Users, Send, Swords, Shirt } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import Modal from './Modal';
import Avatar from './Avatar';
import PlayerProfileModal from './PlayerProfileModal';

function HomeScreen() {
  const {
    users,
    currentUserData,
    tournaments,
    currentTournamentTeams,
    getTournamentStatus,
    sendTournamentInvite,
    respondTournamentInvite,
    friendRequests,
    getMatchSchedule,
  } = useApp();
  const [inviteModal, setInviteModal] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [inviteMsg, setInviteMsg] = useState('');

  const friends = useMemo(() => {
    if (!currentUserData) return [];
    const nicknames = new Set();
    for (const r of friendRequests) {
      if (r.status !== 'accepted') continue;
      const other = r.from === currentUserData.nickname ? r.to : r.from;
      if (other && other !== currentUserData.nickname) nicknames.add(other);
    }
    return Array.from(nicknames)
      .map((n) => users[n?.toLowerCase?.()])
      .filter(Boolean);
  }, [friendRequests, currentUserData, users]);

  const matches = getMatchSchedule();

  const handleInvite = async (tournament, friend) => {
    setInviteMsg('');
    if (!teamName.trim()) {
      setInviteMsg('اكتب اسم التيم الأول');
      return;
    }
    const msg = await sendTournamentInvite(tournament.id, friend.nickname, teamName.trim());
    if (msg) {
      setInviteMsg(msg);
      return;
    }
    setTeamName('');
    setInviteModal(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex w-full flex-col items-center px-5 pb-6 pt-6 text-center"
    >
      <div className="mb-6 w-full">
        <h2 className="text-2xl font-bold text-white">البطولات المتاحة</h2>
        <p className="mt-1 text-sm text-white/60">اختر تحدي وابدأ رحلتك مع الفريق</p>
      </div>

      <div className="w-full space-y-4">
        {tournaments.map((t) => {
          const status = getTournamentStatus(t.id);
          const teams = currentTournamentTeams(t);
          const full = teams >= t.maxTeams;

          return (
            <div
              key={t.id}
              className="w-full overflow-hidden rounded-2xl bg-phone-light p-5 text-center shadow-lg"
            >
              <div className="mb-3 flex items-center justify-center gap-2 text-crimson">
                <MapPin className="h-5 w-5" />
                <span className="text-lg font-bold">{t.location}</span>
              </div>

              <div className="mb-4 flex items-center justify-center gap-6 text-sm text-white/80">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-white/50">سعر الاشتراك</span>
                  <span className="font-bold text-white">{t.price} جنيه</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-white/50">الفرق</span>
                  <span className="font-bold text-white">{teams}/{t.maxTeams}</span>
                </div>
              </div>

              {status.state === 'registered' && (
                <span className="mb-4 inline-block rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400">
                  {status.teamName} مسجل مع {users[status.partner]?.fullName || status.partner}
                </span>
              )}
              {status.state === 'pending' && status.isIncoming && (
                <div className="mb-4 flex flex-col items-center gap-2">
                  <span className="inline-block rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-400">
                    {status.teamName} - دعوة من {users[status.partner]?.fullName || status.partner}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => respondTournamentInvite(status.teamId, true)}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white"
                    >
                      قبول
                    </button>
                    <button
                      onClick={() => respondTournamentInvite(status.teamId, false)}
                      className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white"
                    >
                      رفض
                    </button>
                  </div>
                </div>
              )}
              {status.state === 'pending' && !status.isIncoming && (
                <span className="mb-4 inline-block rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-400">
                  {status.teamName} بانتظار موافقة {users[status.partner]?.fullName || status.partner}
                </span>
              )}
              {status.state === 'open' && full && (
                <span className="mb-4 inline-block rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400">
                  مكتملة
                </span>
              )}

              {status.state !== 'registered' && status.state !== 'pending' && (
                <button
                  disabled={full}
                  onClick={() => setInviteModal(t)}
                  className="w-full rounded-2xl bg-crimson py-4 text-base font-bold text-white shadow-lg transition hover:bg-crimson-light disabled:bg-white/10 disabled:text-white/40"
                >
                  {full ? 'اكتملت الفرق' : 'سجل في البطولة'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 w-full rounded-2xl bg-phone-light p-5 text-center shadow-lg">
        <div className="mb-4 flex items-center justify-center gap-2 text-white">
          <Calendar className="h-5 w-5 text-crimson" />
          <h3 className="text-lg font-bold">جدول الماتشات</h3>
        </div>

        <div className="space-y-3">
          {matches.length === 0 ? (
            <p className="py-6 text-center text-sm text-white/50">مفيش ماتشات لسه</p>
          ) : (
            matches.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-xl bg-phone p-3"
              >
                <button
                  onClick={() => setSelectedTeam(m.teamA)}
                  className="flex flex-1 flex-col items-center rounded-lg py-2 transition hover:bg-white/5"
                >
                  <span className="text-sm font-bold text-white">{m.teamA.name}</span>
                  <div className="mt-1 flex -space-x-2 space-x-reverse">
                    {m.teamA.players.map((n) => (
                      <Avatar key={n} user={users[n?.toLowerCase?.()]} size="sm" className="ring-2 ring-phone" />
                    ))}
                  </div>
                </button>
                <div className="flex flex-col items-center px-2">
                  <span className="text-xs font-extrabold text-crimson">VS</span>
                  <div className="mt-1 flex items-center gap-1 text-xs text-white/60">
                    <Clock className="h-3 w-3" />
                    {m.time}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTeam(m.teamB)}
                  className="flex flex-1 flex-col items-center rounded-lg py-2 transition hover:bg-white/5"
                >
                  <span className="text-sm font-bold text-white">{m.teamB.name}</span>
                  <div className="mt-1 flex -space-x-2 space-x-reverse">
                    {m.teamB.players.map((n) => (
                      <Avatar key={n} user={users[n?.toLowerCase?.()]} size="sm" className="ring-2 ring-phone" />
                    ))}
                  </div>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {inviteModal && (
          <Modal title="تسجيل الفريق" titleIcon={Users} onClose={() => { setInviteModal(null); setInviteMsg(''); setTeamName(''); }}>
            <div className="mb-4 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-crimson">
                <Shirt className="h-4 w-4" />
                <span className="text-xs font-semibold text-white/50">اسم التيم</span>
              </div>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="مثلاً: فريق العراقي"
                className="w-full rounded-xl border border-white/10 bg-phone px-4 py-2.5 text-center text-white placeholder-white/40 outline-none focus:border-crimson focus:ring-1 focus:ring-crimson"
              />
            </div>
            <div className="max-h-64 overflow-y-auto">
              {friends.length === 0 ? (
                <p className="py-6 text-center text-sm text-white/50">مش عندك صحاب لسه. ضيف صحاب من شاشة الصحاب.</p>
              ) : (
                <div className="space-y-2">
                  {friends.map((f) => (
                    <button
                      key={f.nickname}
                      onClick={() => handleInvite(inviteModal, f)}
                      className="flex w-full items-center justify-between rounded-xl bg-phone p-3 transition hover:bg-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar user={f} size="sm" />
                        <span className="font-semibold text-white">{f.fullName}</span>
                      </div>
                      <span className="flex items-center gap-1 rounded-lg bg-crimson/15 px-3 py-1.5 text-xs font-bold text-crimson">
                        <Send className="h-3 w-3" /> إرسال
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {inviteMsg && (
                <p className="mt-3 text-center text-xs font-bold text-crimson">{inviteMsg}</p>
              )}
            </div>
          </Modal>
        )}

        {selectedTeam && (
          <Modal title={selectedTeam.name} titleIcon={Swords} onClose={() => setSelectedTeam(null)}>
            <div className="flex justify-center gap-4">
              {selectedTeam.players.map((n) => {
                const p = users[n?.toLowerCase?.()];
                return (
                  <button
                    key={n}
                    onClick={() => setSelectedPlayer(p)}
                    className="flex flex-col items-center gap-2 rounded-2xl bg-phone p-4 transition hover:bg-white/5"
                  >
                    <Avatar user={p} size="lg" />
                    <span className="text-sm font-bold text-white">{p?.fullName || n}</span>
                  </button>
                );
              })}
            </div>
          </Modal>
        )}

        {selectedPlayer && (
          <PlayerProfileModal user={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default HomeScreen;
