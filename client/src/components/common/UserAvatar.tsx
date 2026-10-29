import React, { useState, useEffect } from 'react';
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

const FAILED_AVATARS_STORAGE_KEY = 'rishabhlabs_failed_avatars';
const failedAvatarUrls = new Set<string>();

// Pre-hydrate failed avatar URLs from sessionStorage to avoid repeating 429s/404s
if (typeof window !== 'undefined') {
  try {
    const raw = sessionStorage.getItem(FAILED_AVATARS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((u) => typeof u === 'string' && failedAvatarUrls.add(u));
      }
    }
  } catch (_) {}
}

const recordFailedAvatar = (url: string) => {
  if (!url || failedAvatarUrls.has(url)) return;
  failedAvatarUrls.add(url);
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(
        FAILED_AVATARS_STORAGE_KEY,
        JSON.stringify(Array.from(failedAvatarUrls).slice(-50))
      );
    } catch (_) {}
  }
};

/**
 * Resolves verified core team avatars directly to authentic local assets.
 */
export const resolveTeamAvatar = (
  src?: string | null,
  name?: string | null,
  email?: string | null
): string | null => {
  const n = (name || '').toLowerCase();
  const e = (email || '').toLowerCase();
  const s = src || '';

  // Keep existing verified local avatar path
  if (s.startsWith('/avatars/')) return s;

  if (n.includes('arpit') || e.includes('arpit') || e.includes('officialcrikit') || s.includes('ACg8ocJ0KvIuzezERY')) {
    return '/avatars/arpit.webp';
  }
  if (n.includes('rishabh') || e.includes('rishabh') || e.includes('mishrarishabh2006')) {
    return '/avatars/rishabh.webp';
  }
  if (n.includes('harsh') || e.includes('harsh')) {
    return '/avatars/harsh.webp';
  }
  return src || null;
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name,
  email,
  size = 'md',
  className = '',
  roundedClassName = 'rounded-full',
}) => {
  // Check cache for avatar and name if not directly supplied
  const localAvatar = email ? localStorage.getItem(`rishabhlabs_avatar_${email.toLowerCase().trim()}`) : null;
  const cachedAvatar = email ? pycodeCache.getAvatar(email) : null;
  const cachedName = email ? pycodeCache.getName(email) : null;

  const rawSrc = src || cachedAvatar || localAvatar;
  const displayName = name || cachedName || email?.split('@')[0] || 'User';
  const effectiveSrc = resolveTeamAvatar(rawSrc, displayName, email);

  const [imageError, setImageError] = useState(() =>
    effectiveSrc ? failedAvatarUrls.has(effectiveSrc) : false
  );

  useEffect(() => {
    if (effectiveSrc && failedAvatarUrls.has(effectiveSrc)) {
      setImageError(true);
    } else {
      setImageError(false);
    }
  }, [effectiveSrc]);

  const initial = displayName.trim().charAt(0).toUpperCase() || 'U';
  const colorClass = getColorForName(displayName);

  // Filter out broken or invalid image sources
  const isValidSrc =
    effectiveSrc &&
    !imageError &&
    !failedAvatarUrls.has(effectiveSrc) &&
    !effectiveSrc.includes('placeholder') &&
    !effectiveSrc.includes('your-avatar');

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const currentSizeClass = typeof size === 'string' ? sizeClasses[size] : '';
  const customStyle =
    typeof size === 'number'
      ? { width: `${size}px`, height: `${size}px`, fontSize: `${Math.round(size * 0.45)}px` }
      : undefined;

  const handleImageError = () => {
    if (effectiveSrc) {
      recordFailedAvatar(effectiveSrc);
    }
    setImageError(true);
  };

  if (isValidSrc && effectiveSrc) {
    return (
      <img
        src={effectiveSrc}
        alt={displayName}
        referrerPolicy="no-referrer"
        onError={handleImageError}
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
