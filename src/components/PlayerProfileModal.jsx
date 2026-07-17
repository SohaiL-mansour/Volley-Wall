import { motion } from 'framer-motion';
import { X, Trophy, Swords } from 'lucide-react';
import Avatar from './Avatar';

function PlayerProfileModal({ user, onClose }) {
  if (!user) return null;

  const total = user.wins + user.losses;
  const winRate = total > 0 ? Math.round((user.wins / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, rotateY: 90, scale: 0.8 }}
        animate={{ opacity: 1, rotateY: 0, scale: 1 }}
        exit={{ opacity: 0, rotateY: -90, scale: 0.8 }}
        transition={{ duration: 0.35 }}
        style={{ perspective: 800 }}
        className="relative z-10 w-full max-w-sm rounded-3xl bg-phone-light p-6 text-center shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 flex justify-center">
          <Avatar user={user} size="xl" />
        </div>

        <h3 className="mb-1 text-2xl font-bold text-white">{user.fullName}</h3>
        <p className="mb-6 text-crimson">@{user.nickname}</p>

        <div className="mb-6 grid grid-cols-2 gap-3">
          <Stat icon={Swords} label="إجمالي الماتشات" value={total} />
          <Stat icon={Trophy} label="نسبة الفوز" value={`${winRate}%`} />
          <Stat icon={Trophy} label="فوز" value={user.wins} color="text-emerald-400" />
          <Stat icon={Swords} label="خسارة" value={user.losses} color="text-rose-400" />
        </div>

        <button
          onClick={onClose}
          className="w-full rounded-xl bg-crimson py-3 font-bold text-white shadow transition hover:bg-crimson-light"
        >
          إغلاق
        </button>
      </motion.div>
    </motion.div>
  );
}

function Stat({ icon: Icon, label, value, color = 'text-white' }) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-phone p-4">
      <Icon className="mb-2 h-5 w-5 text-crimson" />
      <span className={`text-xl font-extrabold ${color}`}>{value}</span>
      <span className="mt-1 text-xs text-white/50">{label}</span>
    </div>
  );
}

export default PlayerProfileModal;
