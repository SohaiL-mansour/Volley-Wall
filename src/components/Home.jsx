import { motion } from 'framer-motion';
import { MapPin, Clock, Calendar } from 'lucide-react';

const tournaments = [
  { id: 1, location: 'DaCentro Mall', price: 150, teams: 6, maxTeams: 8, available: true },
  { id: 2, location: 'padbol arena', price: 150, teams: 4, maxTeams: 8, available: true },
];

const matches = [
  { id: 1, teamA: 'العراقي', teamB: 'الأهرام', time: '08:00 م' },
  { id: 2, teamA: 'الزمالك', teamB: 'الأهلي', time: '09:30 م' },
  { id: 3, teamA: 'بورسعيد', teamB: 'الإسكندرية', time: '11:00 م' },
];

function Home() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex w-full flex-col items-center px-5 pb-6 pt-6 text-center"
    >
      <div className="mb-6 w-full">
        <h2 className="text-2xl font-bold text-white">قائمة التحديات</h2>
        <p className="mt-1 text-sm text-white/60">اختر تحدي وابدأ رحلتك مع الفريق</p>
      </div>

      <div className="w-full space-y-4">
        {tournaments.map((t) => (
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
                <span className="font-bold text-white">
                  {t.teams}/{t.maxTeams}
                </span>
              </div>
            </div>

            <span
              className={`mb-4 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                t.available
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-red-500/10 text-red-400'
              }`}
            >
              {t.available ? 'متاح للتسجيل' : 'مكتمل'}
            </span>

            <button className="w-full rounded-xl bg-crimson py-3 text-sm font-bold text-white shadow-md transition hover:bg-crimson-light">
              سجل في البطولة
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 w-full rounded-2xl bg-phone-light p-5 text-center shadow-lg">
        <div className="mb-4 flex items-center justify-center gap-2 text-white">
          <Calendar className="h-5 w-5 text-crimson" />
          <h3 className="text-lg font-bold">جدول الماتشات</h3>
        </div>

        <div className="space-y-3">
          {matches.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-xl bg-phone p-3"
            >
              <div className="flex-1 text-center text-sm font-bold text-white">{m.teamA}</div>
              <div className="px-2 text-xs font-extrabold text-crimson">VS</div>
              <div className="flex-1 text-center text-sm font-bold text-white">{m.teamB}</div>
              <div className="mr-2 flex items-center gap-1 text-xs text-white/60">
                <Clock className="h-3 w-3" />
                {m.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default Home;
