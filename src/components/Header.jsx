import { Home, Trophy, Users, User } from 'lucide-react';

function Header({ activeTab, setActiveTab, user }) {
  const nav = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'scoreboard', icon: Trophy, label: 'Scoreboard' },
    { id: 'friends', icon: Users, label: 'Friends' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-phone/95 px-4 py-3 backdrop-blur-md">
      <div className="grid grid-cols-3 items-center gap-2">
        <div className="flex items-center justify-center">
          <span className="text-lg font-extrabold tracking-tight text-white">
            el3iraky
          </span>
        </div>

        <nav className="flex items-center justify-center gap-4">
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
                    ? 'bg-crimson/20 text-crimson shadow-[0_0_14px_rgba(139,0,0,0.45)]'
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
          className="flex items-center justify-center gap-2 rounded-xl px-2 py-1 transition hover:bg-white/5"
        >
          <span className="max-w-[90px] truncate text-sm font-semibold text-white">
            {user.nickname || user.fullName}
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-crimson text-white shadow">
            <User className="h-4 w-4" />
          </div>
        </button>
      </div>
    </header>
  );
}

export default Header;
