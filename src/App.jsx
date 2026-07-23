import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider } from './AppContext';
import { useApp } from './hooks/useApp';
import AuthGate from './components/AuthGate';
import Header from './components/Header';
import HomeScreen from './components/HomeScreen';
import ProfileScreen from './components/ProfileScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import FriendsScreen from './components/FriendsScreen';
import AdminScreen from './components/AdminScreen';

function AppContent() {
  const { currentUser, currentUserData, activeTab, setActiveTab } = useApp();

  const Screen = useMemo(() => {
    switch (activeTab) {
      case 'home':
        return HomeScreen;
      case 'profile':
        return ProfileScreen;
      case 'scoreboard':
        return LeaderboardScreen;
      case 'friends':
        return FriendsScreen;
      case 'admin':
        return AdminScreen;
      default:
        return HomeScreen;
    }
  }, [activeTab]);

  return (
    <div className="relative min-h-screen w-full">
      <div
        className="fixed inset-0 -z-20 scale-110 bg-cover bg-center bg-no-repeat blur-3xl brightness-[0.4]"
        style={{ backgroundImage: "url('/webbg.png')" }}
      />
      <div className="fixed inset-0 -z-10 bg-black/50" />

      {!currentUser || !currentUserData ? (
        <div className="flex min-h-screen w-full items-center justify-center px-4">
          <AuthGate />
        </div>
      ) : (
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col justify-between overflow-hidden bg-[#130924]/90 shadow-2xl">
          <Header activeTab={activeTab} setActiveTab={setActiveTab} />

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

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
