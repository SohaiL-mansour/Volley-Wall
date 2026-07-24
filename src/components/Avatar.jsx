function Avatar({ user, size = 'md', className = '' }) {
  const sizeClass = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-base',
    lg: 'h-16 w-16 text-xl',
    xl: 'h-24 w-24 text-3xl',
  }[size];

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.fullName || user.nickname}
        className={`rounded-full object-cover ring-2 ring-crimson/40 shadow ${sizeClass} ${className}`}
      />
    );
  }

  const initial = user?.fullName?.[0] || user?.nickname?.[0] || '؟';
  const hue = user?.nickname
    ? (user.nickname.charCodeAt(0) * 37) % 360
    : 0;

  return (
    <div
      className={`flex items-center justify-center rounded-full font-bold text-white shadow ${sizeClass} ${className}`}
      style={{ backgroundColor: `hsl(${hue} 65% 35%)` }}
    >
      {initial}
    </div>
  );
}

export default Avatar;
