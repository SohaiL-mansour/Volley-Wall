import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, UserPlus, LogIn, Upload, Smartphone } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import Avatar from './Avatar';

function AuthGate() {
  const { login, signUp } = useApp();
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [loginForm, setLoginForm] = useState({ nickname: '', password: '' });
  const [signup, setSignup] = useState({
    fullName: '',
    nickname: '',
    age: '',
    mobile: '',
    password: '',
    avatar: null,
  });
  const fileRef = useRef();

  const validateMobile = (mobile) => /^01[0125]\d{8}$/.test(mobile);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    const msg = login(loginForm.nickname.trim(), loginForm.password);
    if (msg) setError(msg);
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    setError('');
    if (!validateMobile(signup.mobile)) {
      setError('رقم الموبايل لازم يكون 11 رقم ويبدأ بـ 010 / 011 / 012 / 015');
      return;
    }
    if (!signup.avatar) {
      setError('لازم ترفع صورة شخصية');
      return;
    }
    const msg = signUp({
      fullName: signup.fullName.trim(),
      nickname: signup.nickname.trim(),
      age: Number(signup.age) || 0,
      mobile: signup.mobile.trim(),
      password: signup.password,
      avatar: signup.avatar,
    });
    if (msg) setError(msg);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setSignup((p) => ({ ...p, avatar: reader.result }));
    reader.readAsDataURL(file);
  };

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-phone-light px-4 py-3 text-center text-white placeholder-white/40 outline-none transition focus:border-crimson focus:ring-1 focus:ring-crimson';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex min-h-screen w-full max-w-md flex-col items-center justify-center bg-phone/90 px-6 text-center"
    >
      <div className="mb-8 flex flex-col items-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-crimson/20 shadow-[0_0_40px_rgba(139,0,0,0.45)]">
          <Trophy className="h-10 w-10 text-crimson" />
        </div>
        <h1 className="text-3xl font-bold text-white">VOLLEY WALL</h1>
        <p className="mt-2 text-sm text-white/60">مجتمع البادبول في مصر</p>
      </div>

      <div className="mb-6 flex w-full overflow-hidden rounded-2xl bg-phone-light p-1">
        <button
          type="button"
          onClick={() => { setMode('login'); setError(''); }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition ${
            mode === 'login' ? 'bg-crimson text-white shadow' : 'text-white/60 hover:text-white'
          }`}
        >
          <LogIn className="h-4 w-4" /> تسجيل الدخول
        </button>
        <button
          type="button"
          onClick={() => { setMode('signup'); setError(''); }}
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
              placeholder="اسم الشهرة (اليوزر)"
              value={loginForm.nickname}
              onChange={(e) => setLoginForm((p) => ({ ...p, nickname: e.target.value }))}
              required
            />
            <input
              type="password"
              className={inputClass}
              placeholder="كلمة المرور"
              value={loginForm.password}
              onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
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
              placeholder="النيك نيم / اسم الشهرة (اليوزر)"
              value={signup.nickname}
              onChange={(e) => setSignup((p) => ({ ...p, nickname: e.target.value }))}
              required
            />
            <div className="flex gap-3">
              <input
                type="number"
                className={inputClass}
                placeholder="السن"
                value={signup.age}
                onChange={(e) => setSignup((p) => ({ ...p, age: e.target.value }))}
                required
              />
              <div className="relative flex-1">
                <Smartphone className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  type="tel"
                  className={`${inputClass} pr-10`}
                  placeholder="رقم الموبايل"
                  value={signup.mobile}
                  onChange={(e) => setSignup((p) => ({ ...p, mobile: e.target.value }))}
                  required
                />
              </div>
            </div>
            <input
              type="password"
              className={inputClass}
              placeholder="كلمة المرور"
              value={signup.password}
              onChange={(e) => setSignup((p) => ({ ...p, password: e.target.value }))}
              required
            />

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/20 bg-phone-light py-3 transition hover:border-crimson/60"
            >
              {signup.avatar ? (
                <Avatar user={signup} size="sm" />
              ) : (
                <Upload className="h-5 w-5 text-crimson" />
              )}
              <span className="text-sm font-semibold text-white">
                {signup.avatar ? 'تم رفع الصورة' : 'ارفع صورة شخصية'}
              </span>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
              />
            </button>

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-crimson to-crimson-light py-3.5 font-bold text-white shadow-lg transition hover:brightness-110"
            >
              إنشاء حساب
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center text-sm font-bold text-crimson"
        >
          {error}
        </motion.p>
      )}

      <button
        type="button"
        onClick={() => {}}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-bold text-white shadow-[0_0_18px_rgba(139,0,0,0.25)] transition hover:bg-white/10"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M12.545 10.239v3.821h5.445c-.712 2.315-2.646 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C6.477 2 1.545 6.932 1.545 13s4.932 11 11 11 11-4.932 11-11c0-.732-.074-1.446-.214-2.136H12.545z"
          />
        </svg>
        تسجيل الدخول باستخدام Google
      </button>
    </motion.div>
  );
}

export default AuthGate;
