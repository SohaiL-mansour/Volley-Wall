import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, User } from 'lucide-react';

const initialFriends = [
  { id: 1, name: 'أحمد الزمالك', active: true },
  { id: 2, name: 'محمد بورسعيد', active: false },
  { id: 3, name: 'علي الأهرام', active: true },
  { id: 4, name: 'خالد الإسكندرية', active: true },
  { id: 5, name: 'عمر المقطم', active: false },
  { id: 6, name: 'يوسف التجمع', active: false },
];

function Friends() {
  const [query, setQuery] = useState('');
  const [friends, setFriends] = useState(initialFriends);

  const filtered = friends.filter((f) => f.name.includes(query));

  const toggle = (id) => {
    setFriends((prev) =>
      prev.map((f) => (f.id === id ? { ...f, active: !f.active } : f))
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex w-full flex-col items-center px-5 pb-6 pt-6 text-center"
    >
      <div className="mb-6 flex items-center gap-2">
        <Users className="h-6 w-6 text-crimson" />
        <h2 className="text-2xl font-bold text-white">الصحاب</h2>
      </div>

      <div className="relative mb-5 w-full">
        <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="دور على صاحبك..."
          className="w-full rounded-xl border border-white/10 bg-phone-light py-3 pr-10 pl-4 text-center text-white placeholder-white/40 outline-none focus:border-crimson focus:ring-1 focus:ring-crimson"
        />
      </div>

      <div className="w-full space-y-3">
        {filtered.map((f) => (
          <div
            key={f.id}
            className="flex items-center justify-between rounded-2xl bg-phone-light p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-crimson/10 text-crimson">
                <User className="h-5 w-5" />
              </div>
              <span className="font-semibold text-white">{f.name}</span>
            </div>

            <button
              onClick={() => toggle(f.id)}
              className={`relative h-7 w-12 rounded-full transition ${
                f.active ? 'bg-crimson' : 'bg-white/10'
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                  f.active ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-sm text-white/40">مفيش صحاب مطابقين للبحث</p>
        )}
      </div>
    </motion.div>
  );
}

export default Friends;
