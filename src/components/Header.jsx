import { Home, Trophy, Users } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import Avatar from './Avatar';

function Header({ activeTab, setActiveTab }) {
  const { currentUserData } = useApp();
  const nav = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'scoreboard', icon: Trophy, label: 'Leaderboard' },
    { id: 'friends', icon: Users, label: 'Friends' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-phone/80 px-4 py-2 backdrop-blur-md">
      <div className="grid grid-cols-3 items-center gap-2">
        <div className="flex flex-col items-center justify-center leading-none">
          <h1
            className="font-brand text-[1.15rem] leading-[0.85] text-crimson"
            style={{ textShadow: '0 0 18px rgba(139,0,0,0.95), 0 0 8px rgba(220,38,38,0.85)' }}
          >
            <span className="block">VOLLEY</span>
            <span className="block">WALL</span>
          </h1>
        </div>

        <nav className="flex items-center justify-center gap-3">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                aria-label={item.label}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                  active
                    ? 'bg-crimson/20 text-crimson shadow-[0_0_16px_rgba(139,0,0,0.5)]'
                    : 'text-white/50 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
              </button>
            );
          })}
        </nav>

        <button
          onClick={() => setActiveTab('profile')}
          className="flex items-center justify-center rounded-full transition hover:ring-2 hover:ring-crimson/50"
        >
          <Avatar user={currentUserData} size="md" />
        </button>
      </div>
    </header>
  );
}

export default Header;
