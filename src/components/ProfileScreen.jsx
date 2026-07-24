import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, AtSign, Calendar, Save, X, Edit3, Smartphone, Upload, LogOut, Swords, Trophy } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import Avatar from './Avatar';

const labelMap = {
  fullName: 'الاسم الكامل',
  nickname: 'اسم الشهرة',
  age: 'السن',
  mobile: 'رقم الموبايل',
};

function ProfileScreen() {
  const { currentUserData, updateUser, logout } = useApp();
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ ...currentUserData });
  const fileRef = useRef();

  useEffect(() => {
    setForm({ ...currentUserData });
  }, [currentUserData]);

  const handleSave = async (e) => {
    e.preventDefault();
    const msg = await updateUser({
      fullName: form.fullName,
      age: Number(form.age) || currentUserData.age,
      mobile: form.mobile,
      avatar: form.avatar,
    });
    if (!msg) setEdit(false);
  };

  const handleCancel = () => {
    setForm({ ...currentUserData });
    setEdit(false);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm((p) => ({ ...p, avatar: reader.result }));
    reader.readAsDataURL(file);
  };

  const total = currentUserData.wins + currentUserData.losses;
  const winRate = total > 0 ? Math.round((currentUserData.wins / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex w-full flex-col items-center px-5 pb-6 pt-6 text-center"
    >
      <div className="mb-4 flex justify-center">
        <Avatar user={currentUserData} size="xl" />
      </div>

      <h2 className="mb-6 text-2xl font-bold text-white">حسابي</h2>

      {!edit ? (
        <div className="w-full space-y-4">
          <div className="rounded-2xl bg-phone-light p-5 shadow-lg">
            <div className="grid grid-cols-1 gap-4">
              <InfoRow icon={User} label={labelMap.fullName} value={currentUserData.fullName} />
              <InfoRow icon={AtSign} label={labelMap.nickname} value={currentUserData.nickname} />
              <InfoRow icon={Calendar} label={labelMap.age} value={currentUserData.age} />
              <InfoRow icon={Smartphone} label={labelMap.mobile} value={currentUserData.mobile} />
            </div>
          </div>

          <div className="rounded-2xl bg-phone-light p-5 shadow-lg">
            <h3 className="mb-4 text-lg font-bold text-white">إحصائياتك</h3>
            <div className="grid grid-cols-2 gap-3">
              <StatBox label="ماتشات فازت" value={currentUserData.wins} color="text-emerald-400" icon={Trophy} />
              <StatBox label="ماتشات خسر" value={currentUserData.losses} color="text-rose-400" icon={Swords} />
              <StatBox label="إجمالي الماتشات" value={total} color="text-white" icon={Swords} />
              <StatBox label="نسبة الفوز" value={`${winRate}%`} color="text-amber-400" icon={Trophy} />
            </div>
          </div>

          <button
            onClick={() => setEdit(true)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-crimson py-4 text-base font-bold text-white shadow-lg transition hover:bg-crimson-light"
          >
            <Edit3 className="h-5 w-5" /> تعديل البيانات
          </button>

          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-4 text-base font-bold text-white transition hover:bg-white/10"
          >
            <LogOut className="h-5 w-5" /> تسجيل الخروج
          </button>
        </div>
      ) : (
        <form onSubmit={handleSave} className="w-full space-y-4">
          <div className="rounded-2xl bg-phone-light p-5 shadow-lg">
            <div className="mb-6 flex flex-col items-center gap-2">
              <Avatar user={form} size="lg" />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-bold text-white"
              >
                <Upload className="h-3.5 w-3.5 text-crimson" /> تغيير الصورة
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </div>

            <Field icon={User} label={labelMap.fullName} value={form.fullName} onChange={(v) => setForm((p) => ({ ...p, fullName: v }))} />
            <Field icon={AtSign} label={labelMap.nickname} value={form.nickname} readOnly />
            <Field icon={Calendar} label={labelMap.age} type="number" value={form.age} onChange={(v) => setForm((p) => ({ ...p, age: v }))} />
            <Field icon={Smartphone} label={labelMap.mobile} value={form.mobile} onChange={(v) => setForm((p) => ({ ...p, mobile: v }))} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-base font-bold text-white shadow transition hover:bg-emerald-500"
            >
              <Save className="h-5 w-5" /> حفظ
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center justify-center gap-2 rounded-2xl bg-rose-600 py-4 text-base font-bold text-white shadow transition hover:bg-rose-500"
            >
              <X className="h-5 w-5" /> إلغاء
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

function StatBox({ label, value, color, icon: Icon }) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-phone p-4">
      <Icon className="mb-1 h-5 w-5 text-crimson" />
      <span className={`text-xl font-extrabold ${color}`}>{value}</span>
      <span className="mt-1 text-xs text-white/60">{label}</span>
    </div>
  );
}

function Field({ icon: Icon, label, type = 'text', value, onChange, readOnly }) {
  return (
    <div className="mb-4 flex flex-col items-center gap-2">
      <div className="flex items-center gap-1.5 text-crimson">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-semibold text-white/50">{label}</span>
      </div>
      <input
        type={type}
        readOnly={readOnly}
        className={`w-full rounded-xl border border-white/10 bg-phone px-4 py-2.5 text-center text-white outline-none focus:border-crimson focus:ring-1 focus:ring-crimson ${
          readOnly ? 'opacity-60' : ''
        }`}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        required
      />
    </div>
  );
}

export default ProfileScreen;
