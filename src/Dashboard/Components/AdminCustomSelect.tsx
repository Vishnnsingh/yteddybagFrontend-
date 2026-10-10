import React, { useState, useRef, useEffect } from 'react';

export interface AdminSelectOption {
  value: string;
  label: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: string;
  disabled?: boolean;
}

interface AdminCustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: AdminSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  menuClassName?: string;
  icon?: React.ReactNode;
  align?: 'left' | 'right';
  size?: 'sm' | 'md';
}

export const AdminCustomSelect: React.FC<AdminCustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  disabled = false,
  className = '',
  menuClassName = '',
  icon,
  align = 'left',
  size = 'md',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (optValue: string, optDisabled?: boolean) => {
    if (optDisabled) return;
    onChange(optValue);
    setIsOpen(false);
  };

  const isSmall = size === 'sm';

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2.5 rounded-xl border bg-white transition-all cursor-pointer select-none text-left ${
          isSmall ? 'px-3 py-1.5 text-xs' : 'px-3.5 py-2 text-xs font-semibold'
        } ${
          disabled
            ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed shadow-none'
            : isOpen
            ? 'border-[#D26900] ring-2 ring-[#D26900]/20 shadow-xs text-gray-900 bg-amber-50/20'
            : 'border-amber-200/90 hover:border-[#D26900] text-gray-800 shadow-2xs hover:shadow-xs'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {icon && <span className="text-[#D26900] shrink-0">{icon}</span>}
          {selectedOption?.icon && !icon && (
            <span className="shrink-0 text-sm">{selectedOption.icon}</span>
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FFF7ED] text-[#D26900] border border-[#FED7AA]">
              {selectedOption.badge}
            </span>
          )}
        </div>

        {/* Theme Orange Chevron Icon */}
        <div
          className={`shrink-0 text-[#D26900] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown Menu Popup */}
      {isOpen && !disabled && (
        <div
          className={`absolute z-[100] mt-1.5 min-w-full max-h-64 overflow-y-auto bg-white rounded-xl shadow-xl border border-amber-200 py-1 animate-fadeIn focus:outline-none ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${menuClassName}`}
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#D26900 #FFF7ED',
          }}
        >
          {options.length === 0 ? (
            <div className="px-3.5 py-2.5 text-xs text-gray-400 text-center">
              No options available
            </div>
          ) : (
            options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt.value, opt.disabled)}
                  className={`px-3 py-2 text-xs rounded-lg mx-1 my-0.5 flex items-center justify-between cursor-pointer transition-all select-none ${
                    opt.disabled
                      ? 'opacity-40 cursor-not-allowed bg-transparent text-gray-400'
                      : isSelected
                      ? 'bg-[#FFF7ED] text-[#D26900] font-bold shadow-2xs'
                      : 'text-gray-700 hover:bg-amber-50 hover:text-[#D26900]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    {opt.icon && <span className="shrink-0 text-sm">{opt.icon}</span>}
                    <div className="min-w-0">
                      <div className="truncate font-medium">{opt.label}</div>
                      {opt.subtitle && (
                        <div className="text-[10px] text-gray-400 truncate font-mono">
                          {opt.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {opt.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                        {opt.badge}
                      </span>
                    )}
                    {isSelected && (
                      <svg
                        className="w-4 h-4 text-[#D26900]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default AdminCustomSelect;
