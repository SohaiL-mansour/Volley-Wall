import { motion } from 'framer-motion';
import { Trophy, Medal } from 'lucide-react';

const leaders = [
  { rank: 1, name: 'سهيل العراقي', points: 285, wins: 12 },
  { rank: 2, name: 'أحمد الزمالك', points: 240, wins: 10 },
  { rank: 3, name: 'محمد بورسعيد', points: 210, wins: 8 },
  { rank: 4, name: 'علي الأهرام', points: 180, wins: 7 },
  { rank: 5, name: 'خالد الإسكندرية', points: 150, wins: 6 },
];

function Scoreboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex w-full flex-col items-center px-5 pb-6 pt-6 text-center"
    >
      <div className="mb-6 flex items-center gap-2">
        <Trophy className="h-6 w-6 text-crimson" />
        <h2 className="text-2xl font-bold text-white">لوحة الشرف</h2>
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
            {leaders.map((p) => (
              <tr key={p.rank} className="hover:bg-white/5">
                <td className="py-3 text-center">
                  {p.rank <= 3 ? (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-crimson/20 text-crimson">
                      <Medal className="h-3.5 w-3.5" />
                    </span>
                  ) : (
                    p.rank
                  )}
                </td>
                <td className="py-3 text-center font-semibold text-white">{p.name}</td>
                <td className="py-3 text-center text-white/70">{p.points}</td>
                <td className="py-3 text-center text-emerald-400">{p.wins}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default Scoreboard;
