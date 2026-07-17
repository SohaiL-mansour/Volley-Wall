import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AuthGate from './components/AuthGate';
import Header from './components/Header';
import Home from './components/Home';
import Profile from './components/Profile';
import Scoreboard from './components/Scoreboard';
import Friends from './components/Friends';

const defaultUser = {
  fullName: 'سهيل العراقي',
  username: 'sohail',
  nickname: 'el3iraky',
  age: 25,
  password: '123456',
  wins: 12,
  losses: 3,
};

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(defaultUser);
  const [activeTab, setActiveTab] = useState('home');

  const handleSignUp = (newUser) => {
    setUser((prev) => ({ ...prev, ...newUser, wins: 0, losses: 0 }));
  };

  const handleLogin = (creds) => {
    if (creds.username === user.username && creds.password === user.password) {
      setAuthenticated(true);
    }
  };

  const handleUpdateUser = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const Screen = useMemo(() => {
    switch (activeTab) {
      case 'home':
        return Home;
      case 'profile':
        return () => <Profile user={user} onUpdateUser={handleUpdateUser} />;
      case 'scoreboard':
        return Scoreboard;
      case 'friends':
        return Friends;
      default:
        return Home;
    }
  }, [activeTab, user]);

  return (
    <div className="h-screen w-full bg-void">
      {!authenticated ? (
        <div className="flex h-full w-full items-center justify-center">
          <AuthGate onLogin={handleLogin} onSignUp={handleSignUp} defaultUser={user} />
        </div>
      ) : (
        <div className="relative mx-auto flex h-full w-full max-w-md flex-col justify-between overflow-hidden bg-phone shadow-2xl">
          <Header activeTab={activeTab} setActiveTab={setActiveTab} user={user} />

          <main className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-1 flex-col"
              >
                <Screen />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
