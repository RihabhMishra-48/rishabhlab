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
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close when clicking outside
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
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        className={`inline-flex items-center justify-between gap-2.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-[#212121] border border-neutral-200 dark:border-neutral-800 text-xs font-mono text-neutral-800 dark:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors cursor-pointer select-none focus:outline-none focus:ring-1 focus:ring-primary/40 ${buttonClassName}`}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-foreground' : ''
          }`}
        />
      </button>

      {/* Floating Popover Menu */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute z-50 mt-1.5 left-0 min-w-full w-max max-w-xs rounded-xl bg-white dark:bg-[#1e1e22] border border-neutral-200/90 dark:border-neutral-800 shadow-xl p-1 backdrop-blur-md transition-all ${menuClassName}`}
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
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-xs font-mono transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold shadow-2xs'
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
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground shrink-0">
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
