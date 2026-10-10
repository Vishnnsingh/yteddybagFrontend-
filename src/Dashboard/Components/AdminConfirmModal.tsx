import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AdminConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  message?: string;
  itemName?: string;
  warningNote?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'brand' | 'warning';
  isLoading?: boolean;
}

export default function AdminConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  warningNote,
  confirmText = 'Yes, Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: AdminConfirmModalProps) {
  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none"
          onClick={() => {
            if (!isLoading) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm sm:max-w-md p-6 sm:p-7 overflow-hidden text-center relative"
          >
            {/* Top decorative gradient bar matching CTA theme */}
            <div
              className={`absolute top-0 inset-x-0 h-1.5 ${
                variant === 'danger'
                  ? 'bg-gradient-to-r from-red-500 via-rose-500 to-amber-500'
                  : 'bg-gradient-to-r from-[#D26900] via-[#E65100] to-[#B45309]'
              }`}
            />

            {/* Centered Icon with subtle badge */}
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3.5 shadow-xs border ${
                variant === 'danger'
                  ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200/80 text-red-600'
                  : 'bg-gradient-to-br from-orange-50 to-amber-100/60 border-orange-200 text-[#D26900]'
              }`}
            >
              {variant === 'danger' ? (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              ) : (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>

            {/* Pill Tag */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase border mb-2 ${
                variant === 'danger'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-[#FFF7ED] text-[#D26900] border-[#FED7AA]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  variant === 'danger' ? 'bg-red-500 animate-pulse' : 'bg-[#D26900]'
                }`}
              />
              Admin Confirmation
            </span>

            {/* Title */}
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight leading-snug">
              {title}
            </h3>

            {/* Message */}
            {message && (
              <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed px-1">
                {message}
              </p>
            )}

            {/* Target Item Name Pill */}
            {itemName && (
              <div className="mt-3 px-3.5 py-1.5 rounded-xl bg-gray-50 border border-gray-200/80 inline-flex items-center gap-2 max-w-full">
                <span className="text-xs text-gray-400 font-medium shrink-0">Item:</span>
                <span className="text-xs font-bold text-gray-900 font-mono truncate" title={itemName}>
                  &quot;{itemName}&quot;
                </span>
              </div>
            )}

            {/* Warning Note Box */}
            {warningNote && (
              <div className="mt-3.5 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-left flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-amber-600 shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span className="text-[11px] text-amber-800 leading-tight font-medium">
                  {warningNote}
                </span>
              </div>
            )}

            {/* CTA Action Buttons */}
            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-150 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {cancelText}
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className={`flex-1 py-2.5 px-4 text-white text-xs sm:text-sm font-bold rounded-xl transition-all duration-150 cursor-pointer active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 ${
                  variant === 'danger'
                    ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 shadow-md shadow-red-500/25'
                    : 'bg-gradient-to-r from-[#D26900] to-[#E65100] hover:from-[#B45309] hover:to-[#D26900] shadow-md shadow-[#D26900]/25'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    {variant === 'danger' ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <span>{confirmText}</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
