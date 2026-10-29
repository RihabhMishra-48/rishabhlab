import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  placeholder?: string;
  ariaLabel?: string;
  disabled?: boolean;
  align?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  placeholder = 'Select option',
  ariaLabel = 'Select option',
  disabled = false,
  align = 'left',
  size = 'md',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    if (disabled) return;
    onChange(optionValue);
    setIsOpen(false);
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-3.5 py-2.5 text-sm',
  };

  const isFullWidth = className.includes('w-full');

  return (
    <div
      ref={dropdownRef}
      className={`relative ${isFullWidth ? 'w-full block' : 'inline-block'} text-left ${className}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        className={`w-full inline-flex items-center justify-between gap-2 rounded-xl bg-white dark:bg-[#1e1e22] border border-neutral-200 dark:border-neutral-700/80 text-neutral-900 dark:text-neutral-100 font-semibold transition-colors select-none focus:outline-hidden ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-neutral-100 dark:bg-neutral-800'
            : 'hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-[#252529] cursor-pointer'
        } ${sizeClasses[size]} ${buttonClassName}`}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-neutral-700 dark:text-neutral-200' : ''
          }`}
        />
      </button>

      {/* Floating Popover Menu */}
      {isOpen && !disabled && (
        <div
          role="listbox"
          className={`absolute z-50 mt-1.5 ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${
            isFullWidth ? 'min-w-full w-full' : 'min-w-[190px] w-max max-w-xs'
          } max-h-64 overflow-y-auto rounded-2xl bg-white dark:bg-[#1a1a1e] border border-neutral-200 dark:border-neutral-800 shadow-xl p-1.5 backdrop-blur-md transition-all ${menuClassName}`}
        >
          <div className="space-y-0.5">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-2xs font-bold'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 hover:text-neutral-950 dark:hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    {option.icon && <span className="shrink-0">{option.icon}</span>}
                    <span className="truncate">{option.label}</span>
                  </span>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 shrink-0 opacity-90 stroke-[2.5]" />
                  )}
                  {option.badge && !isSelected && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-500 shrink-0">
                      {option.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
