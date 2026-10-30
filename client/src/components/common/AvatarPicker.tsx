import React, { useRef, useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Check } from 'lucide-react';
import { UserAvatar } from './UserAvatar';

export interface AvatarPickerProps {
  value?: string;
  onChange: (url: string) => void;
  name?: string;
  email?: string;
  label?: string;
  helperText?: string;
  className?: string;
}

const PRESET_AVATARS = [
  { label: 'Rishabh', src: '/avatars/rishabh.webp' },
  { label: 'Arpit', src: '/avatars/arpit.webp' },
  { label: 'Harsh', src: '/avatars/harsh.webp' },
];

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  value = '',
  onChange,
  name,
  email,
  label = 'Profile Picture',
  helperText = 'Upload a photo, choose a preset, or paste an image URL.',
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState(value);

  useEffect(() => {
    setUrlInput(value || '');
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // 2MB size limit
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 2MB limit. Please select a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      onChange(dataUrl);
      setUrlInput('');
    };
    reader.onerror = () => {
      setErrorMsg('Failed to process image file. Please try another.');
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrlInput(val);
    onChange(val);
  };

  const handleClear = () => {
    setErrorMsg(null);
    setUrlInput('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
          {label}
        </label>
      )}

      {/* Main Avatar Preview + Upload / Remove Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 shrink-0">
          <UserAvatar
            src={value}
            name={name}
            email={email}
            size={56}
            roundedClassName="rounded-2xl"
            className="w-full h-full"
          />
        </div>

        <div className="flex-1 space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-750 transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Photo</span>
            </button>

            {Boolean(value) && (
              <button
                type="button"
                onClick={handleClear}
                className="px-2.5 py-1.5 text-xs text-red-500 hover:text-red-600 hover:underline transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>Remove</span>
              </button>
            )}
          </div>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
            Supports JPG, PNG, WEBP (Max 2MB)
          </p>
        </div>
      </div>

      {errorMsg && (
        <p className="text-xs text-red-500 font-medium">{errorMsg}</p>
      )}

      {/* Preset Avatars Selection */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
          Or select team preset:
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          {PRESET_AVATARS.map((preset) => {
            const isSelected = value === preset.src;
            return (
              <button
                key={preset.src}
                type="button"
                onClick={() => {
                  onChange(preset.src);
                  setUrlInput(preset.src);
                  setErrorMsg(null);
                }}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-colors ${isSelected
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
              >
                <img
                  src={preset.src}
                  alt={preset.label}
                  className="w-5 h-5 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                />
                <span>{preset.label}</span>
                {isSelected && <Check className="w-3 h-3 text-emerald-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Direct Image URL input */}
      <div className="space-y-1">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-neutral-400">
            <ImageIcon className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={urlInput}
            onChange={handleUrlChange}
            placeholder="Or enter direct image URL (https://...)"
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-hidden"
          />
        </div>
        {helperText && (
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
            {helperText}
          </p>
        )}
      </div>
    </div>
  );
};

