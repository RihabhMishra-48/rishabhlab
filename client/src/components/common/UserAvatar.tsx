import React, { useState } from 'react';
import { pycodeCache } from '../../services/pycodeCache';

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  roundedClassName?: string;
}

// Google-style palette for initial avatars
const AVATAR_COLORS = [
  'bg-blue-600 text-white',
  'bg-emerald-600 text-white',
  'bg-purple-600 text-white',
  'bg-amber-600 text-white',
  'bg-rose-600 text-white',
  'bg-indigo-600 text-white',
  'bg-teal-600 text-white',
  'bg-cyan-600 text-white',
  'bg-orange-600 text-white',
];

const getColorForName = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name,
  email,
  size = 'md',
  className = '',
  roundedClassName = 'rounded-full',
}) => {
  const [imageError, setImageError] = useState(false);

  // Check cache for avatar and name if not directly supplied
  const cachedAvatar = email ? pycodeCache.getAvatar(email) : null;
  const cachedName = email ? pycodeCache.getName(email) : null;

  const effectiveSrc = src || cachedAvatar;
  const displayName = name || cachedName || email?.split('@')[0] || 'User';
  const initial = displayName.trim().charAt(0).toUpperCase() || 'U';
  const colorClass = getColorForName(displayName);

  // Filter out unwanted legacy defaults
  const isValidSrc =
    effectiveSrc &&
    !imageError &&
    !effectiveSrc.includes('rishabh.webp') &&
    !effectiveSrc.includes('unsplash.com');

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const currentSizeClass = typeof size === 'string' ? sizeClasses[size] : '';
  const customStyle = typeof size === 'number' ? { width: `${size}px`, height: `${size}px`, fontSize: `${Math.round(size * 0.45)}px` } : undefined;

  if (isValidSrc && effectiveSrc) {
    return (
      <img
        src={effectiveSrc}
        alt={displayName}
        onError={() => setImageError(true)}
        style={customStyle}
        className={`${currentSizeClass} ${roundedClassName} object-cover border border-neutral-200 dark:border-neutral-700 shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      style={customStyle}
      className={`${currentSizeClass} ${roundedClassName} ${colorClass} font-bold flex items-center justify-center shrink-0 border border-white/20 shadow-2xs select-none ${className}`}
      title={displayName}
    >
      <span>{initial}</span>
    </div>
  );
};
