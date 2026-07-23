import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, Plus, Trophy, Clock, Target } from 'lucide-react';
import { useApp } from '../hooks/useApp';

function AdminScreen() {
  const {
    currentUserIsAdmin,
    tournaments,
    teams,
    matches,
    getNicknameById,
    createTournament,
    createMatch,
    recordMatchResult,
  } = useApp();

  const [tab, setTab] = useState('tournament');
  const [tournamentForm, setTournamentForm] = useState({ location: '', price: 150, baseTeams: 0, maxTeams: 8 });
  const [matchForm, setMatchForm] = useState({ tournamentId: '', team1Id: '', team2Id: '', scheduledTime: '' });
  const [resultForm, setResultForm] = useState({ matchId: '', team1Goals: 0, team2Goals: 0, winnerTeamId: '' });
  const [msg, setMsg] = useState('');

  const acceptedTeams = useMemo(
    () => teams.filter((t) => t.status === 'accepted'),
    [teams]
  );

  const teamsForMatch = useMemo(() => {
    if (!matchForm.tournamentId) return [];
    return acceptedTeams.filter((t) => t.tournamentId === matchForm.tournamentId);
  }, [acceptedTeams, matchForm.tournamentId]);

  const selectedMatch = matches.find((m) => m.id === resultForm.matchId);

  if (!currentUserIsAdmin) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex w-full flex-col items-center justify-center px-5 py-20 text-center"
      >
        <Shield className="h-12 w-12 text-white/20" />
        <p className="mt-4 text-white/60">الصفحة دي للأدمن بس</p>
      </motion.div>
    );
  }

  const handleCreateTournament = async (e) => {
    e.preventDefault();
    setMsg('');
    const res = await createTournament(tournamentForm);
    if (res) setMsg(res);
    else setMsg('تم إضافة البطولة');
  };

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    setMsg('');
    const res = await createMatch(matchForm);
    if (res) setMsg(res);
    else setMsg('تم إضافة الماتش');
  };

  const handleRecordResult = async (e) => {
    e.preventDefault();
    setMsg('');
    if (!resultForm.matchId || !resultForm.winnerTeamId) {
      setMsg('اختار الماتش والفائز');
      return;
    }
    const res = await recordMatchResult({
      matchId: resultForm.matchId,
      team1Goals: Number(resultForm.team1Goals) || 0,
      team2Goals: Number(resultForm.team2Goals) || 0,
      winnerTeamId: resultForm.winnerTeamId,
    });
    if (res) setMsg(res);
    else setMsg('تم تسجيل النتيجة وتحديث الإحصائيات');
  };

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-phone-light px-4 py-2.5 text-center text-white placeholder-white/40 outline-none focus:border-crimson focus:ring-1 focus:ring-crimson';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex w-full flex-col items-center px-5 pb-6 pt-6 text-center"
    >
      <div className="mb-6 flex items-center gap-2">
        <Shield className="h-6 w-6 text-crimson" />
        <h2 className="text-2xl font-bold text-white">لوحة التحكم</h2>
      </div>

      <div className="mb-5 flex w-full overflow-hidden rounded-xl bg-phone-light p-1">
        {[
          { id: 'tournament', label: 'بطولة', icon: Trophy },
          { id: 'match', label: 'ماتش', icon: Clock },
          { id: 'result', label: 'نتيجة', icon: Target },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-2 text-xs font-bold transition ${
              tab === t.id ? 'bg-crimson text-white' : 'text-white/60'
            }`}
          >
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {msg && <p className="mb-4 text-sm font-bold text-crimson">{msg}</p>}

      {tab === 'tournament' && (
        <form onSubmit={handleCreateTournament} className="w-full space-y-4">
          <input
            className={inputClass}
            placeholder="مكان البطولة"
            value={tournamentForm.location}
            onChange={(e) => setTournamentForm((p) => ({ ...p, location: e.target.value }))}
            required
          />
          <div className="flex gap-3">
            <input
              type="number"
              className={inputClass}
              placeholder="السعر"
              value={tournamentForm.price}
              onChange={(e) => setTournamentForm((p) => ({ ...p, price: Number(e.target.value) }))}
              required
            />
            <input
              type="number"
              className={inputClass}
              placeholder="أقصى عدد فرق"
              value={tournamentForm.maxTeams}
              onChange={(e) => setTournamentForm((p) => ({ ...p, maxTeams: Number(e.target.value) }))}
              required
            />
          </div>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-crimson py-3 font-bold text-white shadow transition hover:bg-crimson-light"
          >
            <Plus className="h-4 w-4" /> إضافة بطولة
          </button>
        </form>
      )}

      {tab === 'match' && (
        <form onSubmit={handleCreateMatch} className="w-full space-y-4">
          <select
            className={inputClass}
            value={matchForm.tournamentId}
            onChange={(e) => setMatchForm((p) => ({ ...p, tournamentId: e.target.value, team1Id: '', team2Id: '' }))}
            required
          >
            <option value="">اختار البطولة</option>
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.location}
              </option>
            ))}
          </select>

          <div className="flex gap-3">
            <select
              className={inputClass}
              value={matchForm.team1Id}
              onChange={(e) => setMatchForm((p) => ({ ...p, team1Id: e.target.value }))}
              required
            >
              <option value="">الفريق الأول</option>
              {teamsForMatch.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.teamName} ({getNicknameById(t.player1Id)} & {getNicknameById(t.player2Id)})
                </option>
              ))}
            </select>
            <select
              className={inputClass}
              value={matchForm.team2Id}
              onChange={(e) => setMatchForm((p) => ({ ...p, team2Id: e.target.value }))}
              required
            >
              <option value="">الفريق الثاني</option>
              {teamsForMatch.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.teamName} ({getNicknameById(t.player1Id)} & {getNicknameById(t.player2Id)})
                </option>
              ))}
            </select>
          </div>

          <input
            type="text"
            className={inputClass}
            placeholder="ميعاد الماتش (مثلاً 08:00 م)"
            value={matchForm.scheduledTime}
            onChange={(e) => setMatchForm((p) => ({ ...p, scheduledTime: e.target.value }))}
            required
          />

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-crimson py-3 font-bold text-white shadow transition hover:bg-crimson-light"
          >
            <Plus className="h-4 w-4" /> إضافة ماتش
          </button>
        </form>
      )}

      {tab === 'result' && (
        <form onSubmit={handleRecordResult} className="w-full space-y-4">
          <select
            className={inputClass}
            value={resultForm.matchId}
            onChange={(e) =>
              setResultForm({
                matchId: e.target.value,
                team1Goals: 0,
                team2Goals: 0,
                winnerTeamId: '',
              })
            }
            required
          >
            <option value="">اختار الماتش</option>
            {matches.map((m) => {
              const t1 = teams.find((t) => t.id === m.team1Id);
              const t2 = teams.find((t) => t.id === m.team2Id);
              return (
                <option key={m.id} value={m.id}>
                  {t1?.teamName || ''} vs {t2?.teamName || ''} ({m.scheduledTime})
                </option>
              );
            })}
          </select>

          {selectedMatch && (
            <>
              <div className="flex gap-3">
                <input
                  type="number"
                  className={inputClass}
                  placeholder="أهداف الفريق الأول"
                  value={resultForm.team1Goals}
                  onChange={(e) => setResultForm((p) => ({ ...p, team1Goals: e.target.value }))}
                  required
                />
                <input
                  type="number"
                  className={inputClass}
                  placeholder="أهداف الفريق الثاني"
                  value={resultForm.team2Goals}
                  onChange={(e) => setResultForm((p) => ({ ...p, team2Goals: e.target.value }))}
                  required
                />
              </div>

              <select
                className={inputClass}
                value={resultForm.winnerTeamId}
                onChange={(e) => setResultForm((p) => ({ ...p, winnerTeamId: e.target.value }))}
                required
              >
                <option value="">اختار الفائز</option>
                <option value={selectedMatch.team1Id}>
                  {teams.find((t) => t.id === selectedMatch.team1Id)?.teamName || 'فريق 1'}
                </option>
                <option value={selectedMatch.team2Id}>
                  {teams.find((t) => t.id === selectedMatch.team2Id)?.teamName || 'فريق 2'}
                </option>
              </select>
            </>
          )}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-crimson py-3 font-bold text-white shadow transition hover:bg-crimson-light"
          >
            <Trophy className="h-4 w-4" /> تسجيل النتيجة
          </button>
        </form>
      )}
    </motion.div>
  );
}

export default AdminScreen;
