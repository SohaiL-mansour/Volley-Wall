import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, AtSign, Smile, Calendar, Save, X, Edit3 } from 'lucide-react';

const labelMap = {
  fullName: 'الاسم الكامل',
  username: 'اسم المستخدم',
  nickname: 'النيك نيم',
  age: 'السن',
};

function Profile({ user, onUpdateUser }) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ ...user });

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateUser({ ...form, age: Number(form.age) || user.age });
    setEdit(false);
  };

  const handleCancel = () => {
    setForm({ ...user });
    setEdit(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex w-full flex-col items-center px-5 pb-6 pt-6 text-center"
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-crimson/20 shadow-[0_0_30px_rgba(139,0,0,0.35)]">
        <User className="h-9 w-9 text-crimson" />
      </div>

      <h2 className="mb-6 text-2xl font-bold text-white">حسابي</h2>

      {!edit ? (
        <div className="w-full space-y-4">
          <div className="rounded-2xl bg-phone-light p-5 shadow-lg">
            <div className="grid grid-cols-1 gap-4">
              <InfoRow icon={User} label={labelMap.fullName} value={user.fullName} />
              <InfoRow icon={AtSign} label={labelMap.username} value={user.username} />
              <InfoRow icon={Smile} label={labelMap.nickname} value={user.nickname} />
              <InfoRow icon={Calendar} label={labelMap.age} value={user.age} />
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-phone-light p-5 shadow-lg">
            <h3 className="mb-4 text-lg font-bold text-white">إحصائياتك</h3>
            <div className="grid grid-cols-2 gap-4">
              <StatBox label="ماتشات فازت" value={user.wins} color="text-emerald-400" />
              <StatBox label="ماتشات خسر" value={user.losses} color="text-rose-400" />
            </div>
          </div>

          <button
            onClick={() => setEdit(true)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-crimson py-3.5 font-bold text-white shadow-lg transition hover:bg-crimson-light"
          >
            <Edit3 className="h-4 w-4" /> تعديل البيانات
          </button>
        </div>
      ) : (
        <form onSubmit={handleSave} className="w-full space-y-4">
          <div className="rounded-2xl bg-phone-light p-5 shadow-lg">
            <Field
              icon={User}
              label={labelMap.fullName}
              value={form.fullName}
              onChange={(v) => setForm((p) => ({ ...p, fullName: v }))}
            />
            <Field
              icon={AtSign}
              label={labelMap.username}
              value={form.username}
              onChange={(v) => setForm((p) => ({ ...p, username: v }))}
            />
            <Field
              icon={Smile}
              label={labelMap.nickname}
              value={form.nickname}
              onChange={(v) => setForm((p) => ({ ...p, nickname: v }))}
            />
            <Field
              icon={Calendar}
              label={labelMap.age}
              type="number"
              value={form.age}
              onChange={(v) => setForm((p) => ({ ...p, age: v }))}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-bold text-white shadow transition hover:bg-emerald-500"
            >
              <Save className="h-4 w-4" /> حفظ
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 py-3 font-bold text-white shadow transition hover:bg-rose-500"
            >
              <X className="h-4 w-4" /> إلغاء
            </button>
          </div>
        </form>
      )}
    </motion.div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex flex-col items-center gap-1 border-b border-white/5 pb-3 last:border-0 last:pb-0">
      <div className="flex items-center gap-1.5 text-crimson">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-semibold text-white/50">{label}</span>
      </div>
      <span className="text-base font-bold text-white">{value}</span>
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-phone p-4">
      <span className={`text-2xl font-extrabold ${color}`}>{value}</span>
      <span className="mt-1 text-xs text-white/60">{label}</span>
    </div>
  );
}

function Field({ icon: Icon, label, type = 'text', value, onChange }) {
  return (
    <div className="mb-4 flex flex-col items-center gap-2">
      <div className="flex items-center gap-1.5 text-crimson">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-semibold text-white/50">{label}</span>
      </div>
      <input
        type={type}
        className="w-full rounded-xl border border-white/10 bg-phone px-4 py-2.5 text-center text-white outline-none focus:border-crimson focus:ring-1 focus:ring-crimson"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </div>
  );
}

export default Profile;
