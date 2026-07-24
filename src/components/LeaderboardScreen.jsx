import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import Avatar from './Avatar';

const medalIcon = ['🥇', '🥈', '🥉'];

function LeaderboardScreen() {
  const { users } = useApp();

  const leaders = Object.values(users)
    .map((u) => ({
      ...u,
      effectivePoints: u.points ?? (u.wins * 10 + Math.max(0, u.wins - u.losses) * 2),
    }))
    .sort((a, b) => b.effectivePoints - a.effectivePoints);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex w-full flex-col items-center px-5 pb-6 pt-6 text-center"
    >
      <div className="mb-6 flex items-center gap-2">
        <Trophy className="h-6 w-6 text-crimson" />
        <h2 className="text-2xl font-bold text-white">اجمد لعيبة</h2>
      </div>

      <div className="w-full overflow-hidden rounded-2xl bg-phone-light shadow-lg">
        <table className="w-full text-sm">
          <thead className="bg-crimson/10 text-crimson">
            <tr>
              <th className="py-3 font-bold">#</th>
              <th className="py-3 font-bold">اللاعب</th>
              <th className="py-3 font-bold">النقاط</th>
              <th className="py-3 font-bold">الفوز</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {leaders.map((p, idx) => {
              const rank = idx + 1;
              return (
                <tr key={p.nickname} className="hover:bg-white/5">
                  <td className="py-3 text-center">
                    {rank <= 3 ? (
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-xl">{medalIcon[idx]}</span>
                        <span className="text-xs font-bold text-white/70">({rank})</span>
                      </div>
                    ) : (
                      rank
                    )}
                  </td>
                  <td className="py-3 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Avatar user={p} size="md" />
                      <span className="font-semibold text-white">{p.fullName}</span>
                    </div>
                  </td>
                  <td className="py-3 text-center text-white/70">{p.effectivePoints}</td>
                  <td className="py-3 text-center text-emerald-400">{p.wins}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default LeaderboardScreen;
