import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, UserPlus, LogIn } from 'lucide-react';

function AuthGate({ onLogin, onSignUp, defaultUser }) {
  const [mode, setMode] = useState('login');
  const [login, setLogin] = useState({ username: defaultUser.username, password: defaultUser.password });
  const [signup, setSignup] = useState({ fullName: '', username: '', nickname: '', age: '', password: '' });

  const handleLogin = (e) => {
    e.preventDefault();
    if (login.username.trim() && login.password.trim()) {
      onLogin(login);
    }
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    if (signup.fullName.trim() && signup.username.trim() && signup.password.trim()) {
      onSignUp({ ...signup, age: Number(signup.age) || 0 });
      setMode('login');
    }
  };

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-phone-light px-4 py-3 text-center text-white placeholder-white/40 outline-none transition focus:border-crimson focus:ring-1 focus:ring-crimson';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex min-h-screen w-full max-w-md flex-col items-center justify-center bg-phone px-6 text-center"
    >
      <div className="mb-10 flex flex-col items-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-crimson/20 shadow-[0_0_30px_rgba(139,0,0,0.4)]">
          <Trophy className="h-8 w-8 text-crimson" />
        </div>
        <h1 className="text-3xl font-bold text-white">el3iraky padball</h1>
        <p className="mt-2 text-sm text-white/60">مجتمع البادبول في مصر</p>
      </div>

      <div className="mb-6 flex w-full overflow-hidden rounded-2xl bg-phone-light p-1">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition ${
            mode === 'login' ? 'bg-crimson text-white shadow' : 'text-white/60 hover:text-white'
          }`}
        >
          <LogIn className="h-4 w-4" /> تسجيل الدخول
        </button>
        <button
          type="button"
          onClick={() => setMode('signup')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition ${
            mode === 'signup' ? 'bg-crimson text-white shadow' : 'text-white/60 hover:text-white'
          }`}
        >
          <UserPlus className="h-4 w-4" /> إنشاء حساب
        </button>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'login' ? (
          <motion.form
            key="login"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleLogin}
            className="w-full space-y-4"
          >
            <input
              className={inputClass}
              placeholder="اسم المستخدم"
              value={login.username}
              onChange={(e) => setLogin((p) => ({ ...p, username: e.target.value }))}
              required
            />
            <input
              type="password"
              className={inputClass}
              placeholder="كلمة المرور"
              value={login.password}
              onChange={(e) => setLogin((p) => ({ ...p, password: e.target.value }))}
              required
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-crimson to-crimson-light py-3.5 font-bold text-white shadow-lg transition hover:brightness-110"
            >
              دخول
            </button>
          </motion.form>
        ) : (
          <motion.form
            key="signup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSignUp}
            className="w-full space-y-4"
          >
            <input
              className={inputClass}
              placeholder="الاسم الكامل"
              value={signup.fullName}
              onChange={(e) => setSignup((p) => ({ ...p, fullName: e.target.value }))}
              required
            />
            <input
              className={inputClass}
              placeholder="اسم المستخدم"
              value={signup.username}
              onChange={(e) => setSignup((p) => ({ ...p, username: e.target.value }))}
              required
            />
            <input
              className={inputClass}
              placeholder="النيك نيم / اسم الشهرة"
              value={signup.nickname}
              onChange={(e) => setSignup((p) => ({ ...p, nickname: e.target.value }))}
              required
            />
            <input
              type="number"
              className={inputClass}
              placeholder="السن"
              value={signup.age}
              onChange={(e) => setSignup((p) => ({ ...p, age: e.target.value }))}
              required
            />
            <input
              type="password"
              className={inputClass}
              placeholder="كلمة المرور"
              value={signup.password}
              onChange={(e) => setSignup((p) => ({ ...p, password: e.target.value }))}
              required
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-crimson to-crimson-light py-3.5 font-bold text-white shadow-lg transition hover:brightness-110"
            >
              إنشاء حساب
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <p className="mt-6 text-xs text-white/40">
        {mode === 'login'
          ? 'ليس عندك حساب؟ اضغط إنشاء حساب فوق'
          : 'عندك حساب؟ رجّع لـ تسجيل الدخول'}
      </p>
    </motion.div>
  );
}

export default AuthGate;
