import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import type { RootState, AppDispatch } from '../redux/store';
import { logoutUserAPI } from '../redux/slices/authSlice';
import { useAccount, type UserAddress } from '../Context/AccountContext';
import AddressModal from '../Components/AddressModal';
import {
    useMyOrdersQuery,
    useCancelMyOrderMutation,
    usePayOrderMutation,
    type OrderRecord,
} from '../hooks/useOrdersQuery';

// Verified Badge Icon matching user's reference (scalloped green circle with white checkmark)
const VerifiedBadge = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg
        className={`${className} shrink-0`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M10.58 2.37a2.03 2.03 0 0 1 2.84 0l.9.89a2.03 2.03 0 0 0 1.95.53l1.24-.26a2.03 2.03 0 0 1 2.37 1.56l.28 1.23a2.03 2.03 0 0 0 1.42 1.42l1.23.28a2.03 2.03 0 0 1 1.56 2.37l-.26 1.24a2.03 2.03 0 0 0 .53 1.95l.89.9a2.03 2.03 0 0 1 0 2.84l-.89.9a2.03 2.03 0 0 0-.53 1.95l.26 1.24a2.03 2.03 0 0 1-1.56 2.37l-1.23.28a2.03 2.03 0 0 0-1.42 1.42l-.28 1.23a2.03 2.03 0 0 1-2.37 1.56l-1.24-.26a2.03 2.03 0 0 0-1.95.53l-.9.89a2.03 2.03 0 0 1-2.84 0l-.9-.89a2.03 2.03 0 0 0-1.95-.53l-1.24.26a2.03 2.03 0 0 1-2.37-1.56l-.28-1.23a2.03 2.03 0 0 0-1.42-1.42l-1.23-.28a2.03 2.03 0 0 1-1.56-2.37l.26-1.24a2.03 2.03 0 0 0-.53-1.95l-.89-.9a2.03 2.03 0 0 1 0-2.84l.89-.9a2.03 2.03 0 0 0 .53-1.95l-.26-1.24a2.03 2.03 0 0 1 1.56-2.37l1.23-.28a2.03 2.03 0 0 0 1.42-1.42l.28-1.23a2.03 2.03 0 0 1 2.37-1.56l1.24.26a2.03 2.03 0 0 0 1.95-.53l.9-.89z"
            fill="#00A572"
        />
        <path
            d="M8.5 12.5L10.8 15L15.5 9.5"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '- not added -';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    }
    return dateStr;
};

type TabKey =
    | 'overview'
    | 'orders'
    | 'profile'
    | 'edit-profile'
    | 'addresses'
    | 'delete-account';

// Package Box with Status Badge (Matches Myntra Reference Screenshot 1 & 2)
const PackageBoxStatusIcon = ({ status }: { status: string }) => {
    const isCancelled = status.toLowerCase() === 'cancelled';
    const isDelivered = status.toLowerCase() === 'delivered';
    const isConfirmedOrPlaced = ['placed', 'confirmed'].includes(status.toLowerCase());

    return (
        <div
            className={`relative w-11 h-11 shrink-0 flex items-center justify-center rounded-xl border ${
                isCancelled
                    ? 'bg-rose-50/90 border-rose-100'
                    : isDelivered || isConfirmedOrPlaced
                    ? 'bg-[#ECFDF5] border-[#A7F3D0]'
                    : 'bg-orange-50/80 border-orange-200'
            }`}
        >
            {/* 3D Isometric Cardboard Box */}
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                    d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z"
                    fill={isCancelled ? '#FFF1F2' : isDelivered || isConfirmedOrPlaced ? '#FFFFFF' : '#FEF3C7'}
                    stroke={isCancelled ? '#1F2937' : '#111827'}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                />
                <path
                    d="M12 12L20 7.5M12 12V21M12 12L4 7.5"
                    stroke={isCancelled ? '#1F2937' : '#111827'}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>

            {/* Bottom-right emblem circle badge */}
            {isCancelled ? (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-white shadow-2xs">
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </span>
            ) : isDelivered ? (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center text-white shadow-2xs">
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </span>
            ) : null}
        </div>
    );
};

// Custom Radio Option for Filters Modal (Matches Myntra Reference Screenshots 2 & 3)
const FilterRadioOption = ({
    selected,
    onSelect,
    label,
}: {
    selected: boolean;
    onSelect: () => void;
    label: string;
}) => (
    <div
        onClick={onSelect}
        className="flex items-center gap-3 py-2.5 cursor-pointer group select-none"
    >
        <div
            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                selected
                    ? 'border-[#D26900]'
                    : 'border-gray-300 group-hover:border-[#D26900]'
            }`}
        >
            {selected && (
                <div className="w-2 h-2 rounded-full bg-[#D26900]" />
            )}
        </div>
        <span
            className={`text-xs sm:text-sm transition-colors ${
                selected ? 'text-gray-900 font-bold' : 'text-gray-700 group-hover:text-gray-900'
            }`}
        >
            {label}
        </span>
    </div>
);

// Format human-readable order subtext matching Myntra Screenshot 1
const getOrderSubtext = (order: OrderRecord) => {
    const isCancelled = order.orderStatus === 'Cancelled';
    const isDelivered = order.orderStatus === 'Delivered';
    const dt = new Date(order.cancelledAt || order.updatedAt || order.createdAt);
    const dateFormatted = dt.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    });
    const timeFormatted = dt.toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });

    if (isCancelled) {
        return `on ${dateFormatted}, ${timeFormatted} As per your request`;
    }
    if (isDelivered) {
        return `on ${dateFormatted}`;
    }
    if (order.estimatedDeliveryDate) {
        return `Arriving by ${order.estimatedDeliveryDate}`;
    }
    // Dynamic 4-6 days delivery estimate range (e.g. 20 Oct - 22 Oct)
    const baseDate = new Date(order.createdAt || Date.now());
    const minD = new Date(baseDate);
    minD.setDate(minD.getDate() + 4);
    const maxD = new Date(baseDate);
    maxD.setDate(maxD.getDate() + 6);
    const minDay = minD.getDate();
    const maxDay = maxD.getDate();
    const month = maxD.toLocaleString('en-IN', { month: 'short' });
    return `Arriving by ${minDay} ${month} - ${maxDay} ${month}`;
};

// Format subtext for an individual item that was cancelled
const getItemCancelSubtext = (item: any, order: OrderRecord) => {
    const dt = new Date(item.cancelledAt || order.cancelledAt || order.updatedAt || order.createdAt);
    const dateFormatted = dt.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    });
    const timeFormatted = dt.toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
    return `on ${dateFormatted}, ${timeFormatted} As per your request`;
};

// Format ordinal date (e.g. 22nd Oct 2026 - Matches Image 2)
const formatOrdinalDate = (d: Date) => {
    const day = d.getDate();
    const suffix = (n: number) => {
        if (n > 3 && n < 21) return 'th';
        switch (n % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };
    const month = d.toLocaleString('en-IN', { month: 'short' });
    const year = d.getFullYear();
    return `${day}${suffix(day)} ${month} ${year}`;
};

const getDeliveryDateStr = (order: OrderRecord) => {
    if (order.estimatedDeliveryDate) {
        const parsed = new Date(order.estimatedDeliveryDate);
        if (!isNaN(parsed.getTime())) {
            return formatOrdinalDate(parsed);
        }
        return order.estimatedDeliveryDate;
    }
    const baseDate = new Date(order.createdAt || Date.now());
    const d = new Date(baseDate);
    d.setDate(d.getDate() + 5);
    return formatOrdinalDate(d);
};

const getCancelledDateStr = (item: any, order: OrderRecord) => {
    const raw = item?.cancelledAt || order?.cancelledAt || order?.updatedAt || order?.createdAt;
    if (!raw) return 'Recently';
    const parsed = new Date(raw);
    if (isNaN(parsed.getTime())) return 'Recently';
    return formatOrdinalDate(parsed);
};

const getOrderedDateStr = (order: OrderRecord) => {
    const raw = order.createdAt || Date.now();
    const d = new Date(raw);
    if (isNaN(d.getTime())) return 'Recently';
    const day = d.getDate();
    const month = d.toLocaleString('en-IN', { month: 'short' });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
};

// Custom Checkbox with Brand Orange CTA styling (no browser blue)
const CustomCheckbox = ({
    checked,
    onChange,
    label,
    id,
}: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: React.ReactNode;
    id?: string;
}) => (
    <label className="flex items-center gap-2.5 cursor-pointer select-none group">
        <div
            className={`w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${checked
                ? 'bg-[#D26900] border-[#D26900] text-white shadow-2xs'
                : 'border-gray-400 bg-white group-hover:border-[#D26900]'
                }`}
        >
            {checked && (
                <svg
                    className="w-2.5 h-2.5 text-white"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M2.5 7.5L5.5 10.5L11.5 3.5"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            )}
        </div>
        <input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="sr-only"
        />
        <span className="text-xs sm:text-sm text-gray-700 font-medium">
            {label}
        </span>
    </label>
);

// Custom Brand Orange Calendar Picker (Pure UI, zero browser blue)
const BrandDatePicker = ({
    value,
    onChange,
    label = 'Birthday (Date of Birth)',
    placeholder = '- not added -',
}: {
    value: string;
    onChange: (val: string) => void;
    label?: string;
    placeholder?: string;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
    const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const monthDropdownRef = useRef<HTMLDivElement>(null);
    const yearDropdownRef = useRef<HTMLDivElement>(null);
    const selectedYearRef = useRef<HTMLButtonElement>(null);

    // Parse incoming value ('YYYY-MM-DD' or 'DD/MM/YYYY')
    const parseDate = (str: string): { year: number; month: number; day: number } | null => {
        if (!str) return null;
        if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
            const [y, m, d] = str.split('-').map(Number);
            return { year: y, month: m - 1, day: d };
        }
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
            const [d, m, y] = str.split('/').map(Number);
            return { year: y, month: m - 1, day: d };
        }
        return null;
    };

    const parsed = parseDate(value);
    const today = new Date();

    // Viewing state (which month and year the calendar is currently looking at)
    const [viewYear, setViewYear] = useState<number>(() => parsed?.year || 2000);
    const [viewMonth, setViewMonth] = useState<number>(() => (parsed ? parsed.month : 0));

    // Sync viewing month/year when value changes or when opening
    useEffect(() => {
        if (parsed) {
            setViewYear(parsed.year);
            setViewMonth(parsed.month);
        }
    }, [value]);

    // Auto-scroll selected year into view when year dropdown opens
    useEffect(() => {
        if (isYearDropdownOpen && selectedYearRef.current) {
            selectedYearRef.current.scrollIntoView({ block: 'center', behavior: 'instant' });
        }
    }, [isYearDropdownOpen]);

    // Click outside listener
    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
            const target = e.target as Node;
            if (monthDropdownRef.current && !monthDropdownRef.current.contains(target)) {
                setIsMonthDropdownOpen(false);
            }
            if (yearDropdownRef.current && !yearDropdownRef.current.contains(target)) {
                setIsYearDropdownOpen(false);
            }
            if (containerRef.current && !containerRef.current.contains(target)) {
                setIsOpen(false);
                setIsMonthDropdownOpen(false);
                setIsYearDropdownOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleOutsideClick);
            document.addEventListener('touchstart', handleOutsideClick);
        }
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('touchstart', handleOutsideClick);
        };
    }, [isOpen]);

    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];

    const currentYear = today.getFullYear();
    // Years from currentYear down to 1930
    const years = Array.from({ length: currentYear - 1930 + 1 }, (_, i) => currentYear - i);

    // Calendar math
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const handlePrevMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear((prev) => prev - 1);
        } else {
            setViewMonth((prev) => prev - 1);
        }
    };

    const handleNextMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear((prev) => prev + 1);
        } else {
            setViewMonth((prev) => prev + 1);
        }
    };

    const handleSelectDay = (day: number) => {
        const mm = String(viewMonth + 1).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        const isoString = `${viewYear}-${mm}-${dd}`;
        onChange(isoString);
        setIsOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        setIsOpen(false);
    };

    const handleToday = (e: React.MouseEvent) => {
        e.stopPropagation();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        onChange(`${y}-${m}-${d}`);
        setViewYear(y);
        setViewMonth(today.getMonth());
        setIsOpen(false);
    };

    // Format value for display: DD/MM/YYYY
    const displayFormatted = parsed
        ? `${String(parsed.day).padStart(2, '0')}/${String(parsed.month + 1).padStart(2, '0')}/${parsed.year}`
        : '';

    return (
        <div ref={containerRef} className="relative">
            <div
                onClick={() => setIsOpen((prev) => !prev)}
                className={`border rounded-md p-3 relative cursor-pointer transition-colors ${isOpen
                    ? 'border-[#D26900] ring-1 ring-[#D26900]/20 bg-white'
                    : 'border-gray-300 hover:border-gray-400 bg-white'
                    }`}
            >
                <label className="text-[11px] font-bold text-gray-500 block uppercase tracking-wider cursor-pointer">
                    {label}
                </label>
                <div className="flex items-center justify-between gap-2 mt-1">
                    <span
                        className={`text-sm font-semibold font-mono ${displayFormatted ? 'text-gray-900' : 'text-gray-400 font-normal font-sans'
                            }`}
                    >
                        {displayFormatted || placeholder}
                    </span>
                    <button
                        type="button"
                        className="text-[#D26900] hover:text-[#B45309] p-0.5 cursor-pointer transition-colors shrink-0"
                        title="Open Calendar"
                        aria-label="Open Calendar"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.8}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Brand Orange Calendar Dropdown Popover */}
            {isOpen && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-full left-0 mt-1.5 z-[150] w-full max-w-[320px] bg-white rounded-xl shadow-2xl border border-orange-200/80 p-4 animate-in fade-in zoom-in-95 duration-150 select-none text-left"
                >
                    {/* Header: Month / Year / Prev / Next */}
                    <div className="flex items-center justify-between gap-1 pb-3 mb-3 border-b border-gray-100">
                        <div className="flex items-center gap-1.5">
                            {/* Custom Month Dropdown Trigger */}
                            <div ref={monthDropdownRef} className="relative">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsMonthDropdownOpen((prev) => !prev);
                                        setIsYearDropdownOpen(false);
                                    }}
                                    className={`px-2.5 py-1 rounded-md text-xs sm:text-sm font-bold flex items-center gap-1 border transition-all cursor-pointer ${isMonthDropdownOpen
                                        ? 'bg-orange-100/70 border-[#D26900] text-[#D26900]'
                                        : 'bg-orange-50/70 hover:bg-orange-100/70 border-orange-200 text-gray-900 hover:text-[#D26900]'
                                        }`}
                                >
                                    <span>{months[viewMonth]}</span>
                                    <svg
                                        className={`w-3.5 h-3.5 transition-transform text-[#D26900] ${isMonthDropdownOpen ? 'rotate-180' : ''
                                            }`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2.5}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Custom Month Dropdown Menu */}
                                {isMonthDropdownOpen && (
                                    <div className="absolute top-full left-0 mt-1 z-30 w-32 max-h-44 overflow-y-auto custom-cta-scrollbar bg-white rounded-lg shadow-xl border border-orange-200 py-1">
                                        {months.map((m, idx) => (
                                            <button
                                                key={m}
                                                type="button"
                                                onClick={() => {
                                                    setViewMonth(idx);
                                                    setIsMonthDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${viewMonth === idx
                                                    ? 'bg-orange-50 text-[#D26900] font-bold'
                                                    : 'text-gray-700 hover:bg-[#FFF7ED] hover:text-[#D26900]'
                                                    }`}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Custom Year Dropdown Trigger */}
                            <div ref={yearDropdownRef} className="relative">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsYearDropdownOpen((prev) => !prev);
                                        setIsMonthDropdownOpen(false);
                                    }}
                                    className={`px-2.5 py-1 rounded-md text-xs sm:text-sm font-bold flex items-center gap-1 border transition-all cursor-pointer ${isYearDropdownOpen
                                        ? 'bg-orange-100/70 border-[#D26900] text-[#D26900]'
                                        : 'bg-orange-50/70 hover:bg-orange-100/70 border-orange-200 text-gray-900 hover:text-[#D26900]'
                                        }`}
                                >
                                    <span className="font-mono">{viewYear}</span>
                                    <svg
                                        className={`w-3.5 h-3.5 transition-transform text-[#D26900] ${isYearDropdownOpen ? 'rotate-180' : ''
                                            }`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2.5}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Custom Year Dropdown Menu */}
                                {isYearDropdownOpen && (
                                    <div className="absolute top-full left-0 mt-1 z-30 w-24 max-h-44 overflow-y-auto custom-cta-scrollbar bg-white rounded-lg shadow-xl border border-orange-200 py-1">
                                        {years.map((y) => (
                                            <button
                                                key={y}
                                                ref={viewYear === y ? selectedYearRef : null}
                                                type="button"
                                                onClick={() => {
                                                    setViewYear(y);
                                                    setIsYearDropdownOpen(false);
                                                }}
                                                className={`w-full text-center px-3 py-1.5 text-xs font-mono font-medium transition-colors cursor-pointer ${viewYear === y
                                                    ? 'bg-orange-50 text-[#D26900] font-bold'
                                                    : 'text-gray-700 hover:bg-[#FFF7ED] hover:text-[#D26900]'
                                                    }`}
                                            >
                                                {y}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Navigation Arrows */}
                        <div className="flex items-center gap-0.5">
                            <button
                                type="button"
                                onClick={handlePrevMonth}
                                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-orange-50 text-gray-500 hover:text-[#D26900] transition-colors cursor-pointer text-base font-bold"
                                title="Previous Month"
                            >
                                ‹
                            </button>
                            <button
                                type="button"
                                onClick={handleNextMonth}
                                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-orange-50 text-gray-500 hover:text-[#D26900] transition-colors cursor-pointer text-base font-bold"
                                title="Next Month"
                            >
                                ›
                            </button>
                        </div>
                    </div>

                    {/* Weekday Names Header */}
                    <div className="grid grid-cols-7 gap-1 text-center mb-1">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                            <span key={d} className="text-[11px] font-bold text-gray-400">
                                {d}
                            </span>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center">
                        {/* Previous month tail days */}
                        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                            <span
                                key={`prev-${i}`}
                                className="text-xs py-1.5 text-gray-300 font-normal pointer-events-none"
                            >
                                {daysInPrevMonth - firstDayOfWeek + i + 1}
                            </span>
                        ))}

                        {/* Current month days */}
                        {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
                            const day = i + 1;
                            const isSelected =
                                parsed !== null &&
                                parsed.year === viewYear &&
                                parsed.month === viewMonth &&
                                parsed.day === day;

                            const isToday =
                                today.getFullYear() === viewYear &&
                                today.getMonth() === viewMonth &&
                                today.getDate() === day;

                            return (
                                <button
                                    key={`cur-${day}`}
                                    type="button"
                                    onClick={() => handleSelectDay(day)}
                                    className={`text-xs sm:text-sm py-1.5 rounded-lg transition-all cursor-pointer font-medium ${isSelected
                                        ? 'bg-[#D26900] text-white font-bold shadow-xs hover:bg-[#B45309]'
                                        : isToday
                                            ? 'border border-[#D26900] text-[#D26900] font-bold hover:bg-orange-50'
                                            : 'text-gray-700 hover:bg-[#FFF7ED] hover:text-[#D26900]'
                                        }`}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer Actions: Clear & Today */}
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-xs font-bold text-gray-500 hover:text-[#D26900] px-2 py-1 rounded transition-colors cursor-pointer"
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={handleToday}
                            className="text-xs font-bold text-white bg-[#D26900] hover:bg-[#B45309] px-3 py-1 rounded-md transition-colors cursor-pointer shadow-2xs"
                        >
                            Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function Myaccount() {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const [searchParams, setSearchParams] = useSearchParams();
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

    const {
        profile,
        addresses,
        saving,
        fetchProfile,
        fetchAddresses,
        updateProfile,
        deleteAddress,
        setDefaultAddress,
        deleteAccount,
    } = useAccount();

    const location = useLocation();

    // Tab State with safe normalization (supports query param ?tab= and direct pathnames)
    const getNormalizedTab = (param: string | null): TabKey => {
        if (param) {
            const lower = param.toLowerCase().trim();
            if (
                ['overview', 'orders', 'profile', 'edit-profile', 'addresses', 'delete-account'].includes(
                    lower
                )
            ) {
                return lower as TabKey;
            }
        }
        const path = location.pathname.toLowerCase();
        if (path.includes('/orders')) return 'orders';
        if (path.includes('/profile')) return 'profile';
        if (path.includes('/address')) return 'addresses';
        return 'overview';
    };

    const initialTab = getNormalizedTab(searchParams.get('tab'));
    const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

    // Sync tab with URL search parameter or route pathname
    useEffect(() => {
        const currentParam = searchParams.get('tab');
        const normalized = getNormalizedTab(currentParam);
        if (normalized !== activeTab) {
            setActiveTab(normalized);
        }
    }, [searchParams, location.pathname]);

    const handleTabChange = (tab: TabKey) => {
        setActiveTab(tab);
        setViewingDetailOrder(null);
        setSearchParams({ tab });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.getElementById('app-scroll-container')?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Redirect to login if unauthenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // Fetch data on-demand strictly when relevant tab is active
    useEffect(() => {
        if (!isAuthenticated) return;
        if (activeTab === 'overview' || activeTab === 'profile' || activeTab === 'edit-profile') {
            fetchProfile();
        } else if (activeTab === 'addresses') {
            fetchAddresses();
        }
    }, [activeTab, isAuthenticated, fetchProfile, fetchAddresses]);

    // -------------------------------------------------------------
    // ORDERS & RETURNS STATE (Myntra-style Search & Filters)
    // -------------------------------------------------------------
    const [orderSearch, setOrderSearch] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('All');
    const [selectedTime, setSelectedTime] = useState<string>('Anytime');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [filterModalTab, setFilterModalTab] = useState<'status' | 'time'>('status');
    const [tempStatus, setTempStatus] = useState<string>('All');
    const [tempTime, setTempTime] = useState<string>('Anytime');

    const CANCELLATION_REASONS = [
        'Incorrect size ordered',
        'Product not required anymore',
        'Cash Issue',
        'Ordered By Mistake',
        'Wants to change style/color',
        'Delayed Delivery Cancellation',
        'Duplicate Order',
    ];

    const [selectedTrackOrder, setSelectedTrackOrder] = useState<OrderRecord | null>(null);
    const [selectedTrackItem, setSelectedTrackItem] = useState<any | null>(null);
    const [cancellingOrder, setCancellingOrder] = useState<OrderRecord | null>(null);
    const [cancellingItemIndex, setCancellingItemIndex] = useState<number | null>(null);
    const [selectedCancelReason, setSelectedCancelReason] = useState<string>('Incorrect size ordered');
    const [cancellationComments, setCancellationComments] = useState<string>('');
    const [cancelledSuccessOrder, setCancelledSuccessOrder] = useState<OrderRecord | null>(null);
    const [cancelledSuccessItem, setCancelledSuccessItem] = useState<any | null>(null);
    const [isCancellingLoading, setIsCancellingLoading] = useState(false);
    const [viewingDetailOrder, setViewingDetailOrder] = useState<{ order: OrderRecord; itemIndex: number } | null>(null);

    // Fetch all user orders
    const {
        data: customerOrders = [],
        isLoading: isOrdersLoading,
        refetch: refetchCustomerOrders,
    } = useMyOrdersQuery();
    const cancelOrderMutation = useCancelMyOrderMutation();
    const payOrderMutation = usePayOrderMutation();

    const [selectedPayOrder, setSelectedPayOrder] = useState<OrderRecord | null>(null);
    const [isPayingNow, setIsPayingNow] = useState(false);

    const handleConfirmPrePay = async () => {
        if (!selectedPayOrder) return;
        setIsPayingNow(true);
        try {
            await payOrderMutation.mutateAsync({
                orderId: selectedPayOrder.id,
                paymentDetails: {
                    method: 'UPI',
                    paidAt: new Date().toISOString(),
                    amount: selectedPayOrder.totalAmount,
                },
            });
            toast.success(`Payment of ₹${selectedPayOrder.totalAmount.toLocaleString('en-IN')} confirmed! Order is now prepaid. 🎉`);
            setSelectedPayOrder(null);
            refetchCustomerOrders();
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || 'Payment processing failed');
        } finally {
            setIsPayingNow(false);
        }
    };

    const handleOpenCancelFlow = (order: OrderRecord, itemIndex?: number) => {
        setCancellingOrder(order);
        setCancellingItemIndex(typeof itemIndex === 'number' ? itemIndex : null);
        setSelectedCancelReason('Incorrect size ordered');
        setCancellationComments('');
    };

    const handleConfirmCancelOrder = async () => {
        if (!cancellingOrder) return;
        setIsCancellingLoading(true);
        try {
            const targetItem =
                cancellingItemIndex !== null ? cancellingOrder.items[cancellingItemIndex] : undefined;

            const updated = await cancelOrderMutation.mutateAsync({
                orderId: cancellingOrder.id,
                itemIndex: cancellingItemIndex !== null ? cancellingItemIndex : undefined,
                productId: targetItem?.productId,
                reason: selectedCancelReason,
                comment: cancellationComments.trim() || undefined,
            });

            const itemTitle = targetItem?.title || `Order #${cancellingOrder.orderNumber}`;
            toast.success(`"${itemTitle}" has been cancelled.`);

            const now = new Date().toISOString();
            const cancelledRecord = updated || {
                ...cancellingOrder,
                orderStatus: (cancellingOrder.items.length <= 1 || cancellingItemIndex === null) ? 'Cancelled' : cancellingOrder.orderStatus,
                cancellationReason: selectedCancelReason,
                cancelledAt: now,
                items: cancellingOrder.items.map((it, idx) =>
                    cancellingItemIndex === null || idx === cancellingItemIndex
                        ? {
                              ...it,
                              status: 'Cancelled',
                              cancellationReason: selectedCancelReason,
                              cancelledAt: now,
                          }
                        : it
                ),
            };

            setCancelledSuccessOrder(cancelledRecord);
            setCancelledSuccessItem(targetItem || cancellingOrder.items[0]);
            setCancellingOrder(null);
            setCancellingItemIndex(null);

            // Immediately reflect in Order Details view if open
            if (viewingDetailOrder && (viewingDetailOrder.order.id === cancellingOrder.id || viewingDetailOrder.order.orderNumber === cancellingOrder.orderNumber)) {
                setViewingDetailOrder({
                    order: cancelledRecord,
                    itemIndex: viewingDetailOrder.itemIndex,
                });
            }

            refetchCustomerOrders();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to cancel item');
        } finally {
            setIsCancellingLoading(false);
        }
    };

    const handleCloseCancelSuccess = () => {
        setCancelledSuccessOrder(null);
        setCancelledSuccessItem(null);
    };

    // Filter modal actions
    const openFilterModal = () => {
        setTempStatus(selectedStatus);
        setTempTime(selectedTime);
        setIsFilterModalOpen(true);
    };

    const handleClearFilters = () => {
        setTempStatus('All');
        setTempTime('Anytime');
    };

    const handleApplyFilters = () => {
        setSelectedStatus(tempStatus);
        setSelectedTime(tempTime);
        setIsFilterModalOpen(false);
    };

    // Filter orders by status, time, and search
    const filteredCustomerOrders = customerOrders.filter((order) => {
        // Status filter
        if (selectedStatus !== 'All') {
            if (selectedStatus === 'On the way') {
                const inTransit = ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery'];
                if (!inTransit.includes(order.orderStatus)) return false;
            } else if (selectedStatus === 'Delivered') {
                if (order.orderStatus !== 'Delivered') return false;
            } else if (selectedStatus === 'Cancelled') {
                if (order.orderStatus !== 'Cancelled') return false;
            } else if (selectedStatus === 'Returned') {
                if ((order.orderStatus as string) !== 'Returned') return false;
            } else {
                if (order.orderStatus.toLowerCase() !== selectedStatus.toLowerCase()) return false;
            }
        }

        // Time filter
        if (selectedTime !== 'Anytime') {
            const orderTime = new Date(order.createdAt).getTime();
            const now = Date.now();
            if (selectedTime === 'Last 30 days') {
                if (now - orderTime > 30 * 24 * 60 * 60 * 1000) return false;
            } else if (selectedTime === 'Last 6 months') {
                if (now - orderTime > 182 * 24 * 60 * 60 * 1000) return false;
            } else if (selectedTime === 'Last year') {
                if (now - orderTime > 365 * 24 * 60 * 60 * 1000) return false;
            }
        }

        // Search filter
        if (orderSearch.trim()) {
            const q = orderSearch.toLowerCase().trim();
            const matchesNumber = order.orderNumber.toLowerCase().includes(q);
            const matchesWaybill = !!order.delhiveryWaybill && order.delhiveryWaybill.toLowerCase().includes(q);
            const matchesItem = order.items.some((item) =>
                item.title.toLowerCase().includes(q)
            );
            if (!matchesNumber && !matchesWaybill && !matchesItem) return false;
        }

        return true;
    });

    const hasActiveFilters = selectedStatus !== 'All' || selectedTime !== 'Anytime';

    // Logout handler
    const handleLogout = async () => {
        try {
            await dispatch(logoutUserAPI());
            localStorage.removeItem('yteddy_account_profile');
            localStorage.removeItem('yteddy_account_addresses');
            toast.success('Logged out successfully');
            navigate('/login');
        } catch {
            toast.error('Logout failed');
        }
    };

    // -------------------------------------------------------------
    // PROFILE EDIT FORM STATE
    // -------------------------------------------------------------
    const [editForm, setEditForm] = useState({
        name: '',
        mobile: '',
        email: '',
        gender: '',
        dateOfBirth: '',
        location: '',
        alternateMobile: '',
        hintName: '',
    });

    useEffect(() => {
        if (profile) {
            setEditForm({
                name: profile.name || user?.name || '',
                mobile: profile.mobile || user?.phone || '',
                email: profile.email || user?.email || '',
                gender: profile.gender || '',
                dateOfBirth: profile.dateOfBirth || '',
                location: profile.location || '',
                alternateMobile: profile.alternateMobile || '',
                hintName: profile.hintName || '',
            });
        } else if (user) {
            setEditForm((prev) => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                mobile: user.phone || '',
                gender: '',
            }));
        }
    }, [profile, user]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editForm.name.trim()) {
            toast.error('Please enter your full name');
            return;
        }
        const success = await updateProfile({
            name: editForm.name,
            mobile: editForm.mobile,
            gender: editForm.gender,
            dateOfBirth: editForm.dateOfBirth,
            location: editForm.location,
            alternateMobile: editForm.alternateMobile,
            hintName: editForm.hintName,
        });
        if (success) {
            handleTabChange('profile');
        }
    };

    // -------------------------------------------------------------
    // ADDRESS MODAL STATE (Shared AddressModal component)
    // -------------------------------------------------------------
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

    const openAddAddressModal = () => {
        setEditingAddressId(null);
        setIsAddressModalOpen(true);
    };

    const openEditAddressModal = (addr: UserAddress) => {
        setEditingAddressId(addr.id);
        setIsAddressModalOpen(true);
    };

    // -------------------------------------------------------------
    // DELETE ACCOUNT STATE
    // -------------------------------------------------------------
    const [deleteAgreed, setDeleteAgreed] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteAccountConfirm = async () => {
        if (!deleteAgreed) {
            toast.error('Please accept the terms to proceed with account deletion');
            return;
        }
        const confirmed = window.confirm(
            'Are you absolutely sure you want to delete your account? This action cannot be undone.'
        );
        if (!confirmed) return;

        setIsDeleting(true);
        const ok = await deleteAccount();
        setIsDeleting(false);
        if (ok) {
            navigate('/login');
        }
    };

    const displayName = profile?.name || user?.name || 'Customer';
    const displayEmail = profile?.email || user?.email || '';

    return (
        <div className="min-h-screen bg-[#FDFBF9] pt-3.5 sm:pt-8 pb-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Mobile & Tablet Header with Back Arrow Button to Home (Hidden on Desktop >= 1024px) */}
                <div className="lg:hidden mb-4 pb-3 border-b border-gray-200 flex items-center">
                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={() => {
                                if (activeTab === 'edit-profile') {
                                    handleTabChange('profile');
                                } else if (activeTab !== 'overview') {
                                    handleTabChange('overview');
                                } else {
                                    navigate('/');
                                }
                            }}
                            className="p-1.5 -ml-1 text-gray-800 hover:text-[#D26900] active:scale-95 transition-all cursor-pointer rounded-lg hover:bg-gray-100"
                            aria-label="Back"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight leading-tight">
                                {activeTab === 'overview'
                                    ? 'Account'
                                    : activeTab === 'orders'
                                        ? 'Orders'
                                        : activeTab === 'profile'
                                            ? 'Profile Details'
                                            : activeTab === 'edit-profile'
                                                ? 'Edit Profile'
                                                : activeTab === 'addresses'
                                                    ? 'Saved Addresses'
                                                    : activeTab === 'delete-account'
                                                        ? 'Delete Account'
                                                        : 'Account'}
                            </h1>
                            <p className="text-[11px] text-gray-500 font-medium capitalize leading-none mt-0.5">
                                {displayName.toLowerCase()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Desktop Top Header Breadcrumb Title (Desktop only >= 1024px) */}
                <div className="hidden lg:block mb-8 pb-4 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Account</h1>
                    <p className="text-sm text-gray-500 font-medium mt-0.5 capitalize">
                        {displayName.toLowerCase()}
                    </p>
                </div>

                {/* Responsive Layout: 1-Column on Mobile/Tablet, 2-Column on Desktop */}
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* ======================================================== */}
                    {/* LEFT SIDEBAR NAVIGATION (Desktop only >= 1024px) */}
                    {/* ======================================================== */}
                    <aside className="hidden lg:block w-60 shrink-0 border-r border-gray-200 pr-4 space-y-6 text-left">
                        {/* Overview Link */}
                        <div>
                            <button
                                type="button"
                                onClick={() => handleTabChange('overview')}
                                className={`w-full text-left text-sm font-bold tracking-tight transition-colors cursor-pointer py-1.5 block ${activeTab === 'overview'
                                    ? 'text-[#D26900] font-black'
                                    : 'text-gray-700 hover:text-[#D26900]'
                                    }`}
                            >
                                Overview
                            </button>
                        </div>

                        <div className="border-t border-gray-100" />

                        {/* ORDERS SECTION */}
                        <div className="space-y-2">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                                ORDERS
                            </span>
                            <button
                                type="button"
                                onClick={() => handleTabChange('orders')}
                                className={`w-full text-left text-sm transition-colors cursor-pointer py-1 block ${activeTab === 'orders'
                                    ? 'text-[#D26900] font-bold'
                                    : 'text-gray-700 hover:text-[#D26900]'
                                    }`}
                            >
                                Orders & Returns
                            </button>
                        </div>

                        <div className="border-t border-gray-100" />

                        {/* ACCOUNT SECTION */}
                        <div className="space-y-2">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                                ACCOUNT
                            </span>
                            <button
                                type="button"
                                onClick={() => handleTabChange('profile')}
                                className={`w-full text-left text-sm transition-colors cursor-pointer py-1 block ${activeTab === 'profile' || activeTab === 'edit-profile'
                                    ? 'text-[#D26900] font-bold'
                                    : 'text-gray-700 hover:text-[#D26900]'
                                    }`}
                            >
                                Profile
                            </button>
                            <button
                                type="button"
                                onClick={() => handleTabChange('addresses')}
                                className={`w-full text-left text-sm transition-colors cursor-pointer py-1 block ${activeTab === 'addresses'
                                    ? 'text-[#D26900] font-bold'
                                    : 'text-gray-700 hover:text-[#D26900]'
                                    }`}
                            >
                                Addresses
                            </button>
                            <button
                                type="button"
                                onClick={() => handleTabChange('delete-account')}
                                className={`w-full text-left text-sm transition-colors cursor-pointer py-1 block ${activeTab === 'delete-account'
                                    ? 'text-red-600 font-bold'
                                    : 'text-gray-700 hover:text-red-600'
                                    }`}
                            >
                                Delete Account
                            </button>
                        </div>

                        <div className="border-t border-gray-100" />

                        {/* LEGAL SECTION */}
                        <div className="space-y-2">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block select-text">
                                LEGAL
                            </span>
                            <Link
                                to="/terms"
                                className="w-full text-left text-sm text-gray-700 hover:text-[#D26900] transition-colors cursor-pointer py-1 block select-text"
                            >
                                Terms of Use
                            </Link>
                            <Link
                                to="/privacy"
                                className="w-full text-left text-sm text-gray-700 hover:text-[#D26900] transition-colors cursor-pointer py-1 block select-text"
                            >
                                Privacy Center
                            </Link>
                        </div>

                        <div className="border-t border-gray-100 pt-4" />

                        {/* LOGOUT BUTTON */}
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full py-2.5 px-4 bg-orange-50 hover:bg-orange-100 text-[#D26900] font-bold text-xs uppercase tracking-wider rounded-lg border border-orange-200 transition-colors shadow-2xs text-center cursor-pointer"
                        >
                            LOGOUT
                        </button>
                    </aside>

                    {/* ======================================================== */}
                    {/* MAIN CONTENT AREA */}
                    {/* ======================================================== */}
                    <main className="flex-1 w-full max-w-3xl">
                        {/* ---------------------------------------------------- */}
                        {/* VIEW 1: OVERVIEW */}
                        {/* ---------------------------------------------------- */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* Top Profile Card Banner (Border removed) */}
                                <div className="bg-[#F5F5F6] rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 shadow-2xs">
                                    <div className="flex items-center gap-4 sm:gap-5 w-full sm:w-auto">
                                        {/* Silhouette Profile Avatar */}
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-[#828695] text-white flex items-center justify-center text-2xl sm:text-3xl font-bold shrink-0 shadow-xs">
                                            {displayName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <h2 className="text-base sm:text-xl font-bold text-gray-900 truncate">
                                                {displayName}
                                            </h2>
                                            <p className="text-xs sm:text-sm text-gray-600 truncate mt-0.5">
                                                {displayEmail}
                                            </p>
                                            {profile?.mobile && (
                                                <p className="text-xs text-gray-500 mt-1 font-mono">
                                                    +91 {profile.mobile}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* EDIT PROFILE BUTTON (Border removed) */}
                                    <button
                                        type="button"
                                        onClick={() => handleTabChange('edit-profile')}
                                        className="w-full sm:w-auto px-5 sm:px-6 py-2 sm:py-2.5 bg-white hover:bg-orange-50 text-[#D26900] text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer shrink-0"
                                    >
                                        EDIT PROFILE
                                    </button>
                                </div>

                                {/* Grid Cards (Orders, Wishlist, Addresses, Profile - 2 per row, compact, borderless) */}
                                <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                                    {/* Card 1: Orders */}
                                    <div
                                        onClick={() => handleTabChange('orders')}
                                        className="bg-white p-3.5 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl shadow-2xs hover:shadow-sm active:scale-98 transition-all cursor-pointer flex flex-col items-center text-center group"
                                    >
                                        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-orange-50 text-[#D26900] flex items-center justify-center mb-1.5 sm:mb-2.5 group-hover:scale-105 transition-transform">
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">Orders</h3>
                                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 line-clamp-1">Check order status</p>
                                    </div>

                                    {/* Card 2: Wishlist */}
                                    <Link
                                        to="/wishlist"
                                        className="bg-white p-3.5 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl shadow-2xs hover:shadow-sm active:scale-98 transition-all cursor-pointer flex flex-col items-center text-center group"
                                    >
                                        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-orange-50 text-[#D26900] flex items-center justify-center mb-1.5 sm:mb-2.5 group-hover:scale-105 transition-transform">
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">Wishlist</h3>
                                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 line-clamp-1">Curated collections</p>
                                    </Link>

                                    {/* Card 3: Addresses */}
                                    <div
                                        onClick={() => handleTabChange('addresses')}
                                        className="bg-white p-3.5 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl shadow-2xs hover:shadow-sm active:scale-98 transition-all cursor-pointer flex flex-col items-center text-center group"
                                    >
                                        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-orange-50 text-[#D26900] flex items-center justify-center mb-1.5 sm:mb-2.5 group-hover:scale-105 transition-transform">
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">Addresses</h3>
                                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 line-clamp-1">
                                            {addresses.length} saved address{addresses.length === 1 ? '' : 'es'}
                                        </p>
                                    </div>

                                    {/* Card 4: Profile Details */}
                                    <div
                                        onClick={() => handleTabChange('profile')}
                                        className="bg-white p-3.5 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl shadow-2xs hover:shadow-sm active:scale-98 transition-all cursor-pointer flex flex-col items-center text-center group"
                                    >
                                        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-orange-50 text-[#D26900] flex items-center justify-center mb-1.5 sm:mb-2.5 group-hover:scale-105 transition-transform">
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">Profile Details</h3>
                                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 line-clamp-1">View & update details</p>
                                    </div>
                                </div>

                                {/* Mobile & Tablet Additional Quick Links & Actions Card (Hidden on Desktop >= 1024px) */}
                                <div className="lg:hidden bg-white rounded-2xl border border-gray-200/80 divide-y divide-gray-100 overflow-hidden shadow-2xs">
                                    <Link
                                        to="/help"
                                        className="px-4 py-3.5 flex items-center justify-between hover:bg-gray-50/70 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#D26900] flex items-center justify-center">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                            </div>
                                            <span className="text-xs sm:text-sm font-semibold text-gray-800">Help Center & Customer Support</span>
                                        </div>
                                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>

                                    <Link
                                        to="/terms"
                                        className="px-4 py-3.5 flex items-center justify-between hover:bg-gray-50/70 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <span className="text-xs sm:text-sm font-semibold text-gray-800">Terms of Use</span>
                                        </div>
                                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>

                                    <Link
                                        to="/privacy"
                                        className="px-4 py-3.5 flex items-center justify-between hover:bg-gray-50/70 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            </div>
                                            <span className="text-xs sm:text-sm font-semibold text-gray-800">Privacy Center</span>
                                        </div>
                                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={() => handleTabChange('delete-account')}
                                        className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-red-50/40 transition-colors text-left cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </div>
                                            <span className="text-xs sm:text-sm font-semibold text-red-600">Delete Account</span>
                                        </div>
                                        <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Mobile & Tablet Logout Action Button (Hidden on Desktop >= 1024px) */}
                                <div className="lg:hidden pt-2">
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="w-full py-3 px-4 bg-orange-50/80 hover:bg-orange-100 text-[#D26900] font-bold text-xs uppercase tracking-wider rounded-xl border border-orange-200/80 transition-all shadow-2xs text-center cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        <span>LOGOUT FROM ACCOUNT</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ---------------------------------------------------- */}
                        {/* VIEW 2: PROFILE DETAILS */}
                        {/* ---------------------------------------------------- */}
                        {activeTab === 'profile' && (
                            <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-10 shadow-2xs text-left">
                                <h2 className="text-lg font-bold text-gray-900 pb-4 border-b border-gray-200">
                                    Profile Details
                                </h2>

                                <div className="divide-y divide-gray-100 mt-4 text-sm">
                                    <div className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <span className="text-gray-500 font-medium">Full Name</span>
                                        <span className="sm:col-span-2 font-semibold text-gray-900">
                                            {displayName || '- not added -'}
                                        </span>
                                    </div>

                                    <div className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <span className="text-gray-500 font-medium">Mobile Number</span>
                                        <span className="sm:col-span-2 font-semibold text-gray-900 font-mono flex items-center gap-2">
                                            {profile?.mobile || user?.phone || '- not added -'}
                                            {(profile?.mobile || user?.phone) && (
                                                <VerifiedBadge className="w-4 h-4" />
                                            )}
                                        </span>
                                    </div>

                                    <div className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <span className="text-gray-500 font-medium">Email ID</span>
                                        <span className="sm:col-span-2 font-semibold text-gray-900 flex items-center gap-2">
                                            {displayEmail || '- not added -'}
                                            {displayEmail && (
                                                <VerifiedBadge className="w-4 h-4" />
                                            )}
                                        </span>
                                    </div>

                                    <div className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <span className="text-gray-500 font-medium">Gender</span>
                                        <span className={`sm:col-span-2 font-semibold text-gray-900 ${profile?.gender ? 'uppercase' : ''}`}>
                                            {profile?.gender ? profile.gender.toUpperCase() : '- not added -'}
                                        </span>
                                    </div>

                                    <div className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <span className="text-gray-500 font-medium">Date of Birth</span>
                                        <span className="sm:col-span-2 font-semibold text-gray-900 font-mono">
                                            {profile?.dateOfBirth ? formatDisplayDate(profile.dateOfBirth) : '- not added -'}
                                        </span>
                                    </div>

                                    <div className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <span className="text-gray-500 font-medium">Location</span>
                                        <span className="sm:col-span-2 font-semibold text-gray-900">
                                            {profile?.location || '- not added -'}
                                        </span>
                                    </div>

                                    <div className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <span className="text-gray-500 font-medium">Alternate Mobile</span>
                                        <span className="sm:col-span-2 font-semibold text-gray-900 font-mono">
                                            {profile?.alternateMobile || '- not added -'}
                                        </span>
                                    </div>

                                    <div className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <span className="text-gray-500 font-medium">Hint Name</span>
                                        <span className="sm:col-span-2 font-semibold text-gray-900">
                                            {profile?.hintName || '- not added -'}
                                        </span>
                                    </div>
                                </div>

                                {/* EDIT CTA BUTTON */}
                                <div className="mt-8 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => handleTabChange('edit-profile')}
                                        className="w-full sm:w-80 py-3.5 px-8 bg-gradient-to-r from-[#D26900] to-[#E65100] hover:from-[#B45309] hover:to-[#D26900] text-white font-bold text-sm tracking-wider uppercase rounded-md shadow-xs transition-all cursor-pointer"
                                    >
                                        EDIT
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ---------------------------------------------------- */}
                        {/* VIEW 3: EDIT PROFILE */}
                        {/* ---------------------------------------------------- */}
                        {activeTab === 'edit-profile' && (
                            <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-10 shadow-2xs text-left">
                                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                                    <h2 className="text-lg font-bold text-gray-900">Edit Details</h2>
                                    <button
                                        type="button"
                                        onClick={() => handleTabChange('profile')}
                                        className="text-xs text-gray-500 hover:text-gray-800 font-semibold cursor-pointer"
                                    >
                                        ← Back to Profile
                                    </button>
                                </div>

                                <form onSubmit={handleSaveProfile} className="space-y-6 mt-6">
                                    {/* Mobile Number Box */}
                                    <div className="border border-gray-300 rounded-md p-3 relative flex items-center justify-between bg-white focus-within:border-[#D26900] transition-colors">
                                        <div className="flex-1">
                                            <label className="text-[11px] font-bold text-gray-500 block uppercase tracking-wider">
                                                Mobile Number*
                                            </label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <input
                                                    type="tel"
                                                    value={editForm.mobile}
                                                    onChange={(e) =>
                                                        setEditForm((prev) => ({ ...prev, mobile: e.target.value }))
                                                    }
                                                    placeholder="Mobile Number"
                                                    className="w-full bg-transparent text-sm font-semibold text-gray-900 outline-none font-mono placeholder:text-gray-400 placeholder:font-normal"
                                                />
                                                {editForm.mobile && editForm.mobile.trim() !== '' && (
                                                    <div title="Verified" className="shrink-0 flex items-center">
                                                        <VerifiedBadge className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Email Box */}
                                    <div className="border border-gray-300 rounded-md p-3 relative flex items-center justify-between bg-gray-50/60">
                                        <div className="flex-1">
                                            <label className="text-[11px] font-bold text-gray-500 block uppercase tracking-wider">
                                                Email
                                            </label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <input
                                                    type="email"
                                                    value={editForm.email}
                                                    disabled
                                                    placeholder="Email"
                                                    className="w-full bg-transparent text-sm font-semibold text-gray-700 outline-none cursor-not-allowed placeholder:text-gray-400 placeholder:font-normal"
                                                />
                                                {editForm.email && editForm.email.trim() !== '' && (
                                                    <div title="Verified" className="shrink-0 flex items-center">
                                                        <VerifiedBadge className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Full Name */}
                                    <div className="border border-gray-300 rounded-md p-3 relative focus-within:border-[#D26900] transition-colors">
                                        <label className="text-[11px] font-bold text-gray-500 block uppercase tracking-wider">
                                            Full Name*
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={editForm.name}
                                            onChange={(e) =>
                                                setEditForm((prev) => ({ ...prev, name: e.target.value }))
                                            }
                                            placeholder="Full Name"
                                            className="w-full bg-transparent text-sm font-semibold text-gray-900 outline-none mt-1 placeholder:text-gray-400 placeholder:font-normal"
                                        />
                                    </div>

                                    {/* Gender Selector */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setEditForm((prev) => ({ ...prev, gender: 'MALE' }))}
                                            className={`py-3 px-4 rounded-md border text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${editForm.gender === 'MALE'
                                                ? 'border-[#D26900] bg-orange-50/60 text-[#D26900]'
                                                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            {editForm.gender === 'MALE' && (
                                                <svg className="w-4 h-4 text-[#D26900]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                            <span>Male</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setEditForm((prev) => ({ ...prev, gender: 'FEMALE' }))}
                                            className={`py-3 px-4 rounded-md border text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${editForm.gender === 'FEMALE'
                                                ? 'border-[#D26900] bg-orange-50/60 text-[#D26900]'
                                                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            {editForm.gender === 'FEMALE' && (
                                                <svg className="w-4 h-4 text-[#D26900]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                            <span>Female</span>
                                        </button>
                                    </div>

                                    {/* Birthday (Custom Brand Orange Calendar Picker) */}
                                    <BrandDatePicker
                                        value={editForm.dateOfBirth}
                                        onChange={(newVal) =>
                                            setEditForm((prev) => ({ ...prev, dateOfBirth: newVal }))
                                        }
                                    />

                                    {/* Location */}
                                    <div className="border border-gray-300 rounded-md p-3 relative focus-within:border-[#D26900] transition-colors">
                                        <label className="text-[11px] font-bold text-gray-500 block uppercase tracking-wider">
                                            Location / City
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.location}
                                            onChange={(e) =>
                                                setEditForm((prev) => ({ ...prev, location: e.target.value }))
                                            }
                                            placeholder="Location / City"
                                            className="w-full bg-transparent text-sm font-semibold text-gray-900 outline-none mt-1 placeholder:text-gray-400 placeholder:font-normal"
                                        />
                                    </div>

                                    {/* Alternate Mobile Details */}
                                    <div className="pt-2">
                                        <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                                            Alternate mobile details
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="border border-gray-300 rounded-md p-3 relative focus-within:border-[#D26900]">
                                                <label className="text-[11px] font-bold text-gray-500 block uppercase tracking-wider">
                                                    Alternate Mobile
                                                </label>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <span className="text-xs font-bold text-gray-400">+91</span>
                                                    <input
                                                        type="tel"
                                                        value={editForm.alternateMobile}
                                                        onChange={(e) =>
                                                            setEditForm((prev) => ({
                                                                ...prev,
                                                                alternateMobile: e.target.value,
                                                            }))
                                                        }
                                                        placeholder="Alternate Mobile"
                                                        className="w-full bg-transparent text-sm font-semibold text-gray-900 outline-none font-mono placeholder:text-gray-400 placeholder:font-normal"
                                                    />
                                                </div>
                                            </div>

                                            <div className="border border-gray-300 rounded-md p-3 relative focus-within:border-[#D26900]">
                                                <label className="text-[11px] font-bold text-gray-500 block uppercase tracking-wider">
                                                    Hint Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editForm.hintName}
                                                    onChange={(e) =>
                                                        setEditForm((prev) => ({ ...prev, hintName: e.target.value }))
                                                    }
                                                    placeholder="Hint Name"
                                                    className="w-full bg-transparent text-sm font-semibold text-gray-900 outline-none mt-1 placeholder:text-gray-400 placeholder:font-normal"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="w-full sm:w-auto px-10 py-3.5 bg-gradient-to-r from-[#D26900] to-[#E65100] hover:from-[#B45309] hover:to-[#D26900] text-white font-bold text-sm uppercase tracking-wider rounded-md shadow-xs transition-all cursor-pointer disabled:opacity-50"
                                        >
                                            {saving ? 'SAVING...' : 'SAVE DETAILS'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleTabChange('profile')}
                                            className="w-full sm:w-auto px-6 py-3.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold text-sm uppercase tracking-wider rounded-md transition-colors cursor-pointer"
                                        >
                                            CANCEL
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* ---------------------------------------------------- */}
                        {/* VIEW 4: SAVED ADDRESSES */}
                        {/* ---------------------------------------------------- */}
                        {activeTab === 'addresses' && (
                            <div className="space-y-6 text-left">
                                {/* Header with "+ ADD NEW ADDRESS" */}
                                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                                    <h2 className="text-lg font-bold text-gray-900">Saved Addresses</h2>
                                    <button
                                        type="button"
                                        onClick={openAddAddressModal}
                                        className="px-4 py-2 border border-[#D26900] text-[#D26900] hover:bg-orange-50 text-xs font-bold uppercase tracking-wider rounded transition-colors shadow-2xs cursor-pointer"
                                    >
                                        + ADD NEW ADDRESS
                                    </button>
                                </div>

                                {/* Addresses List */}
                                {addresses.length === 0 ? (
                                    <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
                                        <div className="w-16 h-16 rounded-full bg-orange-50 text-[#D26900] flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-base font-bold text-gray-900">No saved addresses yet</h3>
                                        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                                            Add a delivery address for a smooth checkout experience.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={openAddAddressModal}
                                            className="mt-5 px-6 py-2.5 bg-[#D26900] hover:bg-[#B45309] text-white font-bold text-xs uppercase tracking-wider rounded shadow-xs cursor-pointer"
                                        >
                                            + Add New Address
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Default Address Section */}
                                        {addresses.filter((a) => a.isDefault).length > 0 && (
                                            <div className="space-y-3">
                                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                                    DEFAULT ADDRESS
                                                </span>
                                                {addresses
                                                    .filter((a) => a.isDefault)
                                                    .map((addr) => (
                                                        <div
                                                            key={addr.id}
                                                            className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs"
                                                        >
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="font-bold text-gray-900 text-sm">{addr.name}</span>
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider bg-gray-100 text-gray-600 uppercase">
                                                                        {addr.type}
                                                                    </span>
                                                                    {addr.type === 'OFFICE' && (addr.openOnSaturday || addr.openOnSunday) && (
                                                                        <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                                                                            Open: {[addr.openOnSaturday && 'Sat', addr.openOnSunday && 'Sun'].filter(Boolean).join(', ')}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <p className="text-xs text-gray-600 leading-relaxed">
                                                                {addr.address}, {addr.locality}
                                                            </p>
                                                            <p className="text-xs text-gray-600">
                                                                {addr.city} - {addr.pincode}
                                                            </p>
                                                            <p className="text-xs text-gray-600 font-medium">{addr.state}</p>
                                                            <p className="text-xs text-gray-800 font-mono mt-2 font-semibold">
                                                                Mobile: {addr.mobile}
                                                            </p>

                                                            <div className="border-t border-gray-100 mt-4 pt-3 flex items-center gap-6 text-xs font-bold">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openEditAddressModal(addr)}
                                                                    className="text-[#D26900] hover:underline cursor-pointer"
                                                                >
                                                                    EDIT
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => deleteAddress(addr.id)}
                                                                    className="text-gray-500 hover:text-red-600 cursor-pointer"
                                                                >
                                                                    REMOVE
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        )}

                                        {/* Other Addresses Section */}
                                        {addresses.filter((a) => !a.isDefault).length > 0 && (
                                            <div className="space-y-3">
                                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                                    OTHER ADDRESSES
                                                </span>
                                                <div className="space-y-4">
                                                    {addresses
                                                        .filter((a) => !a.isDefault)
                                                        .map((addr) => (
                                                            <div
                                                                key={addr.id}
                                                                className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs"
                                                            >
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <span className="font-bold text-gray-900 text-sm">
                                                                        {addr.name}
                                                                    </span>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider bg-gray-100 text-gray-600 uppercase">
                                                                            {addr.type}
                                                                        </span>
                                                                        {addr.type === 'OFFICE' && (addr.openOnSaturday || addr.openOnSunday) && (
                                                                            <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                                                                                Open: {[addr.openOnSaturday && 'Sat', addr.openOnSunday && 'Sun'].filter(Boolean).join(', ')}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <p className="text-xs text-gray-600 leading-relaxed">
                                                                    {addr.address}, {addr.locality}
                                                                </p>
                                                                <p className="text-xs text-gray-600">
                                                                    {addr.city} - {addr.pincode}
                                                                </p>
                                                                <p className="text-xs text-gray-600 font-medium">{addr.state}</p>
                                                                <p className="text-xs text-gray-800 font-mono mt-2 font-semibold">
                                                                    Mobile: {addr.mobile}
                                                                </p>

                                                                <div className="border-t border-gray-100 mt-4 pt-3 flex items-center gap-6 text-xs font-bold">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openEditAddressModal(addr)}
                                                                        className="text-[#D26900] hover:underline cursor-pointer"
                                                                    >
                                                                        EDIT
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => deleteAddress(addr.id)}
                                                                        className="text-gray-500 hover:text-red-600 cursor-pointer"
                                                                    >
                                                                        REMOVE
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setDefaultAddress(addr.id)}
                                                                        className="text-emerald-600 hover:underline cursor-pointer ml-auto"
                                                                    >
                                                                        MAKE DEFAULT
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ---------------------------------------------------- */}
                        {/* VIEW 5: DELETE ACCOUNT */}
                        {/* ---------------------------------------------------- */}
                        {activeTab === 'delete-account' && (
                            <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-10 shadow-2xs text-left max-w-2xl mx-auto">
                                <h2 className="text-lg font-bold text-gray-900 pb-3 border-b border-gray-200">
                                    Delete Account
                                </h2>

                                <div className="py-6 flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                                            {displayName},<br />
                                            Is this goodbye?
                                        </h3>
                                        <p className="text-xs sm:text-sm text-gray-500 mt-1.5">
                                            Are you sure you don't want to reconsider?
                                        </p>
                                    </div>

                                    {/* Premium Vector Goodbye Character Illustration */}
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center">
                                        <svg className="w-full h-full drop-shadow-sm" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <defs>
                                                <linearGradient id="delBgGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                                                    <stop stopColor="#FFF1F2" />
                                                    <stop offset="1" stopColor="#FFE4E6" />
                                                </linearGradient>
                                                <linearGradient id="delHeartGrad" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                                                    <stop stopColor="#F43F5E" />
                                                    <stop offset="1" stopColor="#BE123C" />
                                                </linearGradient>
                                                <linearGradient id="delTeddyGrad" x1="20" y1="20" x2="60" y2="80" gradientUnits="userSpaceOnUse">
                                                    <stop stopColor="#F59E0B" />
                                                    <stop offset="1" stopColor="#D97706" />
                                                </linearGradient>
                                            </defs>
                                            <circle cx="50" cy="50" r="46" fill="url(#delBgGrad)" stroke="#FECDD3" strokeWidth="1.5" />
                                            {/* Big Heart */}
                                            <path d="M50 78 C25 60 12 44 22 28 C29 17 43 20 50 31 C57 20 71 17 78 28 C88 44 75 60 50 78 Z" fill="url(#delHeartGrad)" />
                                            {/* Crack in heart */}
                                            <path d="M50 32 L46 44 L54 52 L48 64 L50 74" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                            {/* Teddy hugging heart from left */}
                                            <circle cx="32" cy="42" r="14" fill="url(#delTeddyGrad)" />
                                            <circle cx="23" cy="32" r="5" fill="#D97706" />
                                            <circle cx="23" cy="32" r="3" fill="#FED7AA" />
                                            <circle cx="41" cy="32" r="5" fill="#D97706" />
                                            <circle cx="41" cy="32" r="3" fill="#FED7AA" />
                                            <ellipse cx="32" cy="46" rx="7" ry="5" fill="#FEF3C7" />
                                            {/* Sad eyes */}
                                            <circle cx="28" cy="40" r="1.8" fill="#1F2937" />
                                            <circle cx="36" cy="40" r="1.8" fill="#1F2937" />
                                            <ellipse cx="32" cy="44" rx="2" ry="1.4" fill="#92400E" />
                                            <path d="M30 48 Q32 46.5 34 48" stroke="#92400E" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                                            {/* Tear drop */}
                                            <path d="M25 43 C23 45 23 48 25 49 C27 48 27 45 25 43 Z" fill="#38BDF8" />
                                            {/* Arm hugging heart */}
                                            <path d="M38 48 C44 48 52 50 56 56" stroke="url(#delTeddyGrad)" strokeWidth="6" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Warning Benefits Loss Box (Matches Reference Card Layout) */}
                                <div className="border border-rose-200/90 bg-white rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
                                    <h4 className="text-sm sm:text-base font-bold text-gray-900 text-center">
                                        We will be sad to see you go!
                                    </h4>

                                    {/* Benefit Row 1: You'll lose your benefits (Full width) */}
                                    <div className="flex items-center gap-4 sm:gap-5 pb-6 border-b border-gray-100">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 flex items-center justify-center">
                                            <svg className="w-full h-full" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <defs>
                                                    <linearGradient id="benBag1" x1="10" y1="20" x2="50" y2="70" gradientUnits="userSpaceOnUse">
                                                        <stop stopColor="#F97316" />
                                                        <stop offset="1" stopColor="#C2410C" />
                                                    </linearGradient>
                                                    <linearGradient id="benBag2" x1="30" y1="10" x2="70" y2="70" gradientUnits="userSpaceOnUse">
                                                        <stop stopColor="#FB7185" />
                                                        <stop offset="1" stopColor="#E11D48" />
                                                    </linearGradient>
                                                    <linearGradient id="benCoin" x1="0" y1="0" x2="1" y2="1">
                                                        <stop stopColor="#FDE047" />
                                                        <stop offset="1" stopColor="#CA8A04" />
                                                    </linearGradient>
                                                </defs>
                                                {/* Back shopping bag */}
                                                <path d="M34 26 L38 16 C38 13 42 11 46 11 C50 11 54 13 54 16 L58 26" stroke="#FDA4AF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                                                <rect x="30" y="24" width="34" height="42" rx="4" fill="url(#benBag2)" />
                                                <path d="M47 38 L47 52 M40 45 L54 45" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.6" />

                                                {/* Front shopping bag */}
                                                <path d="M22 34 L26 24 C26 21 30 19 34 19 C38 19 42 21 42 24 L46 34" stroke="#FDBA74" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                                                <rect x="14" y="32" width="36" height="40" rx="4" fill="url(#benBag1)" />
                                                <circle cx="32" cy="50" r="7" fill="#FFEDD5" />
                                                <circle cx="28" cy="45" r="2" fill="#EA580C" />
                                                <circle cx="36" cy="45" r="2" fill="#EA580C" />
                                                <ellipse cx="32" cy="52" rx="3" ry="2" fill="#EA580C" />

                                                {/* Discount Tag */}
                                                <g transform="translate(48, 44)">
                                                    <rect width="24" height="15" rx="3" fill="#059669" transform="rotate(-15)" />
                                                    <text x="4" y="10" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="sans-serif" transform="rotate(-15)">% OFF</text>
                                                </g>

                                                {/* Shiny Golden Coin */}
                                                <circle cx="16" cy="62" r="7" fill="url(#benCoin)" stroke="#B45309" strokeWidth="1" />
                                                <text x="13.5" y="65" fill="#78350F" fontSize="9" fontWeight="bold" fontFamily="sans-serif">★</text>
                                            </svg>
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-gray-900 text-sm sm:text-base">
                                                You'll lose your benefits
                                            </h5>
                                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                                Your order history, saved details, Teddy Credit, TeddyCash and all other coupons and benefits.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Benefit Row 2: Two columns side-by-side */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
                                        {/* Item 2: Order history */}
                                        <div className="flex items-start gap-3.5">
                                            <div className="w-12 h-12 shrink-0 flex items-center justify-center">
                                                <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <defs>
                                                        <linearGradient id="benBoxFront" x1="10" y1="20" x2="54" y2="58" gradientUnits="userSpaceOnUse">
                                                            <stop stopColor="#F59E0B" />
                                                            <stop offset="1" stopColor="#D97706" />
                                                        </linearGradient>
                                                        <linearGradient id="benBoxTop" x1="10" y1="12" x2="54" y2="28" gradientUnits="userSpaceOnUse">
                                                            <stop stopColor="#FCD34D" />
                                                            <stop offset="1" stopColor="#F59E0B" />
                                                        </linearGradient>
                                                    </defs>
                                                    <polygon points="32,8 56,20 32,32 8,20" fill="url(#benBoxTop)" stroke="#B45309" strokeWidth="1.2" />
                                                    <polygon points="8,20 32,32 32,56 8,44" fill="url(#benBoxFront)" stroke="#B45309" strokeWidth="1.2" />
                                                    <polygon points="32,32 56,20 56,44 32,56" fill="#B45309" stroke="#92400E" strokeWidth="1.2" />
                                                    <line x1="20" y1="14" x2="44" y2="26" stroke="#92400E" strokeWidth="2" strokeDasharray="3 2" />
                                                    <rect x="13" y="32" width="12" height="6" rx="1" fill="#FEF3C7" />
                                                    <line x1="15" y1="35" x2="23" y2="35" stroke="#78350F" strokeWidth="1" />
                                                    <circle cx="48" cy="46" r="10" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.8" />
                                                    <path d="M44.5 42.5 L51.5 49.5 M51.5 42.5 L44.5 49.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-gray-900 text-xs sm:text-sm">
                                                    Your order history will get deleted
                                                </h5>
                                                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                                                    Any pending orders, exchanges, returns or refunds will no longer be accessible via your account.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Item 3: Welcome offers */}
                                        <div className="flex items-start gap-3.5">
                                            <div className="w-12 h-12 shrink-0 flex items-center justify-center">
                                                <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <defs>
                                                        <linearGradient id="benGiftBody" x1="12" y1="24" x2="52" y2="58" gradientUnits="userSpaceOnUse">
                                                            <stop stopColor="#EC4899" />
                                                            <stop offset="1" stopColor="#BE185D" />
                                                        </linearGradient>
                                                        <linearGradient id="benGiftRibbon" x1="28" y1="12" x2="36" y2="58" gradientUnits="userSpaceOnUse">
                                                            <stop stopColor="#FBBF24" />
                                                            <stop offset="1" stopColor="#F59E0B" />
                                                        </linearGradient>
                                                    </defs>
                                                    {/* Sparkles */}
                                                    <circle cx="14" cy="16" r="2.5" fill="#3B82F6" />
                                                    <circle cx="50" cy="14" r="2" fill="#10B981" />
                                                    <path d="M48 24 L52 28 M52 24 L48 28" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
                                                    <path d="M12 28 L16 32 M16 28 L12 32" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" />
                                                    {/* Gift Box */}
                                                    <rect x="14" y="28" width="36" height="28" rx="3" fill="url(#benGiftBody)" />
                                                    <rect x="11" y="22" width="42" height="8" rx="2" fill="#DB2777" />
                                                    <rect x="28" y="28" width="8" height="28" fill="url(#benGiftRibbon)" />
                                                    <rect x="28" y="22" width="8" height="8" fill="url(#benGiftRibbon)" />
                                                    <ellipse cx="26" cy="18" rx="5" ry="4" fill="#FBBF24" />
                                                    <ellipse cx="38" cy="18" rx="5" ry="4" fill="#FBBF24" />
                                                    <circle cx="32" cy="19" r="3" fill="#D97706" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-gray-900 text-xs sm:text-sm">
                                                    Welcome offers won't repeat
                                                </h5>
                                                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                                                    New user perks are reserved for your first sign-up and cannot be claimed again by recreating an account.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Checkbox agreement */}
                                <div className="mt-6">
                                    <CustomCheckbox
                                        id="agreeDelete"
                                        checked={deleteAgreed}
                                        onChange={setDeleteAgreed}
                                        label="I agree to all the terms and conditions*"
                                    />
                                </div>

                                {/* Bottom Action Buttons */}
                                <div className="mt-8 pt-4 flex flex-col-reverse sm:flex-row items-center gap-3">
                                    <button
                                        type="button"
                                        disabled={!deleteAgreed || isDeleting}
                                        onClick={handleDeleteAccountConfirm}
                                        className="w-full sm:w-1/2 py-3.5 px-6 border border-gray-300 hover:border-red-600 text-gray-700 hover:text-red-600 font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {isDeleting ? 'DELETING...' : 'DELETE ANYWAY'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleTabChange('overview')}
                                        className="w-full sm:w-1/2 py-3.5 px-6 bg-gradient-to-r from-[#D26900] to-[#E65100] hover:from-[#B45309] hover:to-[#D26900] text-white font-bold text-xs uppercase tracking-wider rounded shadow-xs transition-all cursor-pointer"
                                    >
                                        KEEP ACCOUNT
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ---------------------------------------------------- */}
                        {/* VIEW 6: ORDERS & RETURNS (Myntra-style dynamic cards) */}
                        {/* ---------------------------------------------------- */}
                        {activeTab === 'orders' && (
                            <div className="space-y-4 text-left font-sans">
                                {cancelledSuccessOrder ? (
                                    /* ======================================================== */
                                    /* ORDER CANCELLED CONFIRMATION SCREEN (Matches Image 4)    */
                                    /* ======================================================== */
                                    <div className="bg-white border border-[#EAEAEC] rounded-2xl p-6 sm:p-10 text-center space-y-6 max-w-xl mx-auto shadow-2xs font-sans">
                                        {/* Scalloped Green Seal Badge */}
                                        <div className="flex justify-center">
                                            <svg
                                                className="w-14 h-14 sm:w-16 sm:h-16"
                                                viewBox="0 0 48 48"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M21.16 4.74a4.06 4.06 0 0 1 5.68 0l1.8 1.78a4.06 4.06 0 0 0 3.9 1.06l2.48-.52a4.06 4.06 0 0 1 4.74 3.12l.56 2.46a4.06 4.06 0 0 0 2.84 2.84l2.46.56a4.06 4.06 0 0 1 3.12 4.74l-.52 2.48a4.06 4.06 0 0 0 1.06 3.9l1.78 1.8a4.06 4.06 0 0 1 0 5.68l-1.78 1.8a4.06 4.06 0 0 0-1.06 3.9l.52 2.48a4.06 4.06 0 0 1-3.12 4.74l-2.46.56a4.06 4.06 0 0 0-2.84 2.84l-.56 2.46a4.06 4.06 0 0 1-4.74 3.12l-2.48-.52a4.06 4.06 0 0 0-3.9 1.06l-1.8 1.78a4.06 4.06 0 0 1-5.68 0l-1.8-1.78a4.06 4.06 0 0 0-3.9-1.06l-2.48.52a4.06 4.06 0 0 1-4.74-3.12l-.56-2.46a4.06 4.06 0 0 0-2.84-2.84l-2.46-.56a4.06 4.06 0 0 1-3.12-4.74l.52-2.48a4.06 4.06 0 0 0-1.06-3.9l-1.78-1.8a4.06 4.06 0 0 1 0-5.68l1.78-1.8a4.06 4.06 0 0 0 1.06-3.9l-.52-2.48a4.06 4.06 0 0 1 3.12-4.74l2.46-.56a4.06 4.06 0 0 0 2.84-2.84l.56-2.46a4.06 4.06 0 0 1 4.74-3.12l2.48.52a4.06 4.06 0 0 0 3.9-1.06l1.8-1.78z"
                                                    fill="#00A572"
                                                />
                                                <path
                                                    d="M17 24.5L21.5 29L31 19.5"
                                                    stroke="#FFFFFF"
                                                    strokeWidth="3.2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </div>

                                        {/* Heading */}
                                        <div className="space-y-1">
                                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                                                Order Cancelled
                                            </h2>
                                            <p className="text-xs text-gray-500 font-medium">
                                                {cancelledSuccessItem ? '1 Item cancelled' : `${cancelledSuccessOrder.items.length} ${cancelledSuccessOrder.items.length === 1 ? 'Item' : 'Items'} cancelled`} • Order #{cancelledSuccessOrder.orderNumber}
                                            </p>
                                        </div>

                                        {/* Item Preview Box */}
                                        <div className="space-y-2">
                                            {(() => {
                                                const displayItem = cancelledSuccessItem || cancelledSuccessOrder.items[0];
                                                if (!displayItem) return null;
                                                return (
                                                    <div className="bg-[#FAFAFB] border border-[#EAEAEC] rounded-xl p-3 sm:p-3.5 flex items-center gap-3.5 text-left">
                                                        {displayItem.primaryImage ? (
                                                            <img
                                                                src={displayItem.primaryImage}
                                                                alt={displayItem.title}
                                                                className="w-14 h-14 rounded-lg object-cover bg-white border border-gray-200 shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="w-14 h-14 rounded-lg bg-orange-50 border border-orange-200 text-[#D26900] flex items-center justify-center font-bold text-xs shrink-0">
                                                                🧸
                                                            </div>
                                                        )}
                                                        <div className="min-w-0 flex-1">
                                                            <h4 className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                                                                {displayItem.title}
                                                            </h4>
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                {displayItem.selectedSize ? `Size: ${displayItem.selectedSize}` : 'Standard'}
                                                                {displayItem.selectedColor ? ` • Color: ${displayItem.selectedColor}` : ''}
                                                                {` • Qty: ${displayItem.quantity}`}
                                                            </p>
                                                            <p className="text-xs font-bold text-gray-900 mt-1">
                                                                ₹{(displayItem.price * displayItem.quantity).toLocaleString('en-IN')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>

                                        {/* Bullet Notes (Matches Image 4) */}
                                        <div className="space-y-3.5 text-left bg-gray-50/60 rounded-xl p-4 border border-gray-100">
                                            <div className="flex items-start gap-2.5">
                                                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                                    ✓
                                                </span>
                                                <div>
                                                    <span className="font-bold text-[11px] uppercase tracking-wider text-gray-700 block">
                                                        REFUND DETAILS
                                                    </span>
                                                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                                                        {cancelledSuccessOrder.paymentMethod.toLowerCase().includes('cod') ||
                                                        cancelledSuccessOrder.paymentMethod.toLowerCase().includes('cash')
                                                            ? 'A refund is not applicable on this order as it is a Pay on delivery order.'
                                                            : `A refund of ₹${(
                                                                  (cancelledSuccessItem?.price || cancelledSuccessOrder.totalAmount) *
                                                                  (cancelledSuccessItem?.quantity || 1)
                                                              ).toLocaleString('en-IN')} will be credited to your original payment source within 3-5 business days.`}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-2.5">
                                                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                                    ✓
                                                </span>
                                                <div>
                                                    <span className="font-bold text-[11px] uppercase tracking-wider text-gray-700 block">
                                                        PLEASE NOTE
                                                    </span>
                                                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                                                        You will receive an email/sms confirming the cancellation shortly.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Full Width DONE Button in Brand CTA Color (#D26900) */}
                                        <button
                                            type="button"
                                            onClick={handleCloseCancelSuccess}
                                            className="w-full py-3.5 bg-[#D26900] hover:bg-[#B85800] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors shadow-xs cursor-pointer"
                                        >
                                            DONE
                                        </button>
                                    </div>
                                ) : cancellingOrder ? (
                                    /* ======================================================== */
                                    /* REASON FOR CANCELLATION SCREEN (Matches Image 3)         */
                                    /* ======================================================== */
                                    <div className="bg-white border border-[#EAEAEC] rounded-2xl p-5 sm:p-8 space-y-6 text-left shadow-2xs font-sans max-w-2xl mx-auto">
                                        {/* Back Link */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCancellingOrder(null);
                                                setCancellingItemIndex(null);
                                            }}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#D26900] transition-colors cursor-pointer"
                                        >
                                            <span>←</span>
                                            <span>Back to Orders</span>
                                        </button>

                                        {/* Item Preview Card (Targeted Item) */}
                                        <div className="space-y-2">
                                            {(() => {
                                                const item =
                                                    cancellingItemIndex !== null
                                                        ? cancellingOrder.items[cancellingItemIndex]
                                                        : cancellingOrder.items[0];
                                                if (!item) return null;
                                                return (
                                                    <div className="bg-[#FAFAFB] border border-[#EAEAEC] rounded-xl p-3.5 sm:p-4 flex items-center gap-3.5">
                                                        {item.primaryImage ? (
                                                            <img
                                                                src={item.primaryImage}
                                                                alt={item.title}
                                                                className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover bg-white border border-gray-200 shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-orange-50 border border-orange-200 text-[#D26900] flex items-center justify-center font-bold text-xs shrink-0">
                                                                🧸
                                                            </div>
                                                        )}
                                                        <div className="min-w-0 flex-1">
                                                            <h4 className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                                                                {item.title}
                                                            </h4>
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                {item.selectedSize ? `Size: ${item.selectedSize}` : 'Standard Size'}
                                                                {item.selectedColor ? ` • Color: ${item.selectedColor}` : ''}
                                                                {` • Qty: ${item.quantity}`}
                                                            </p>
                                                            <p className="text-xs font-bold text-gray-900 mt-1">
                                                                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>

                                        {/* Section: Reason for cancellation */}
                                        <div className="space-y-3 pt-2">
                                            <div>
                                                <h3 className="text-sm sm:text-base font-bold text-gray-900">
                                                    Reason for cancellation
                                                </h3>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    Please tell us correct reason for cancellation. This information is only used to improve our service
                                                </p>
                                            </div>

                                            <div className="pt-2">
                                                <label className="text-xs font-bold text-gray-900 block mb-2">
                                                    Select Reason*
                                                </label>
                                                <div className="space-y-2.5">
                                                    {CANCELLATION_REASONS.map((reason) => {
                                                        const isSelected = selectedCancelReason === reason;
                                                        return (
                                                            <label
                                                                key={reason}
                                                                onClick={() => setSelectedCancelReason(reason)}
                                                                className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                                                                    isSelected
                                                                        ? 'border-[#D26900] bg-orange-50/40 text-gray-900 font-semibold'
                                                                        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                                                                }`}
                                                            >
                                                                <div
                                                                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                                                        isSelected
                                                                            ? 'border-[#D26900] bg-white'
                                                                            : 'border-gray-400 bg-white'
                                                                    }`}
                                                                >
                                                                    {isSelected && (
                                                                        <div className="w-2 h-2 rounded-full bg-[#D26900]" />
                                                                    )}
                                                                </div>
                                                                <span className="text-xs sm:text-[13px]">
                                                                    {reason}
                                                                </span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Additional Comments Textarea */}
                                            <div className="pt-3">
                                                <label className="text-xs font-bold text-gray-700 block mb-1.5">
                                                    Additional Comments (Optional)
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    value={cancellationComments}
                                                    onChange={(e) => setCancellationComments(e.target.value)}
                                                    placeholder="Additional Comments"
                                                    className="w-full p-3 border border-gray-200 rounded-xl text-xs placeholder:text-gray-400 focus:outline-none focus:border-[#D26900] focus:ring-1 focus:ring-[#D26900]/30 transition-all resize-none"
                                                />
                                            </div>
                                        </div>

                                        {/* Bottom Bar: Refund Details + CANCEL Button in Brand CTA Color (#D26900) */}
                                        <div className="border-t border-gray-100 pt-4 flex items-center justify-between gap-4">
                                            <div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                                                    REFUND DETAILS
                                                </span>
                                                <span className="text-sm sm:text-base font-black text-gray-900">
                                                    ₹{(() => {
                                                        const isCod =
                                                            cancellingOrder.paymentMethod.toLowerCase().includes('cod') ||
                                                            cancellingOrder.paymentMethod.toLowerCase().includes('cash');
                                                        if (isCod) return 0;
                                                        const item =
                                                            cancellingItemIndex !== null
                                                                ? cancellingOrder.items[cancellingItemIndex]
                                                                : null;
                                                        if (item) return (item.price * item.quantity).toLocaleString('en-IN');
                                                        return cancellingOrder.totalAmount.toLocaleString('en-IN');
                                                    })()}
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={handleConfirmCancelOrder}
                                                disabled={isCancellingLoading}
                                                className="py-3 px-8 bg-[#D26900] hover:bg-[#B85800] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                            >
                                                <span>{isCancellingLoading ? 'Cancelling...' : 'CANCEL'}</span>
                                                <span className="text-sm font-bold">→</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : viewingDetailOrder ? (
                                    /* ======================================================== */
                                    /* ORDER DETAILS VIEW (Matches Images 2, 3, 4 Exactly)       */
                                    /* ======================================================== */
                                    (() => {
                                        const detailOrder =
                                            customerOrders.find((o) => o.id === viewingDetailOrder.order.id) ||
                                            viewingDetailOrder.order;
                                        const targetItem =
                                            detailOrder.items[viewingDetailOrder.itemIndex] || detailOrder.items[0];
                                        const isDelivered = detailOrder.orderStatus === 'Delivered';
                                        const isCancelled =
                                            detailOrder.orderStatus === 'Cancelled' || targetItem?.status === 'Cancelled';
                                        const isShipped = ['Shipped', 'Out for Delivery', 'Delivered'].includes(
                                            detailOrder.orderStatus
                                        );
                                        const canCancel =
                                            ['Placed', 'Confirmed', 'Packed'].includes(detailOrder.orderStatus) &&
                                            !isCancelled;
                                        const isCodOrPending =
                                            detailOrder.paymentMethod?.toLowerCase().includes('cod') ||
                                            detailOrder.paymentMethod?.toLowerCase().includes('cash') ||
                                            detailOrder.paymentStatus === 'Pending';

                                        const itemPrice = targetItem?.price || detailOrder.totalAmount;
                                        const itemQty = targetItem?.quantity || 1;
                                        const itemMrp =
                                            targetItem?.mrp && targetItem.mrp > itemPrice
                                                ? targetItem.mrp
                                                : Math.round(itemPrice * 1.45);
                                        const savings = Math.max(0, (itemMrp - itemPrice) * itemQty);
                                        const discountPercent =
                                            itemMrp > itemPrice
                                                ? Math.round(((itemMrp - itemPrice) / itemMrp) * 100)
                                                : 0;

                                        return (
                                            <div className="space-y-4 max-w-2xl mx-auto text-left font-sans animate-in fade-in duration-200">
                                                {/* Top Navigation Bar: Back & Help (Matches Image 2) */}
                                                <div className="flex items-center justify-between gap-3 pb-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => setViewingDetailOrder(null)}
                                                        className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-700 hover:text-[#D26900] transition-colors cursor-pointer group"
                                                    >
                                                        <span className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-2xs flex items-center justify-center text-sm font-bold text-gray-700 group-hover:bg-orange-50 group-hover:text-[#D26900] transition-colors">
                                                            ←
                                                        </span>
                                                        <span>Back to Orders</span>
                                                    </button>

                                                    <Link
                                                        to={`/help?order=${detailOrder.orderNumber}`}
                                                        className="px-3.5 py-1.5 rounded-full border border-gray-200 hover:border-[#D26900] bg-white hover:bg-orange-50/50 text-gray-700 hover:text-[#D26900] font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
                                                    >
                                                        <svg
                                                            className="w-3.5 h-3.5 text-gray-500"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth={1.8}
                                                        >
                                                            <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                                                            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                                                        </svg>
                                                        <span>Help</span>
                                                    </Link>
                                                </div>

                                                {/* Section 1: Hero Product Showcase (Matches Image 2) */}
                                                <div className="bg-white border border-[#EAEAEC] rounded-2xl p-5 sm:p-6 text-center space-y-3.5 shadow-2xs">
                                                    <div className="mx-auto w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden bg-white border border-gray-100 flex items-center justify-center p-2 shadow-2xs relative">
                                                        {targetItem?.primaryImage ? (
                                                            <img
                                                                src={targetItem.primaryImage}
                                                                alt={targetItem.title}
                                                                className={`w-full h-full object-contain ${isCancelled ? 'grayscale-15 contrast-95' : ''}`}
                                                            />
                                                        ) : (
                                                            <span className="text-4xl">🧸</span>
                                                        )}

                                                        {/* Vintage Circular CANCELLED Rubber Stamp Overlay (Matches Image 2 Exactly) */}
                                                        {isCancelled && (
                                                            <div className="absolute -bottom-1 -right-1 sm:bottom-0 sm:right-0 pointer-events-none select-none z-10 drop-shadow-xs transform -rotate-12">
                                                                <svg
                                                                    viewBox="0 0 120 120"
                                                                    className="w-20 h-20 sm:w-24 sm:h-24 text-gray-500/90"
                                                                >
                                                                    <defs>
                                                                        <path id="stampCircleTop" d="M 22,60 A 38,38 0 1,1 98,60" fill="none" />
                                                                        <path id="stampCircleBottom" d="M 98,60 A 38,38 0 1,1 22,60" fill="none" />
                                                                    </defs>
                                                                    {/* Outer dashed/stitched ring */}
                                                                    <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="4 3" />
                                                                    {/* Inner solid ring */}
                                                                    <circle cx="60" cy="60" r="47" fill="none" stroke="currentColor" strokeWidth="1.5" />
                                                                    {/* Inner dashed ring */}
                                                                    <circle cx="60" cy="60" r="30" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />
                                                                    {/* Top curved text: CANCELLED */}
                                                                    <text fill="currentColor" fontSize="13" fontWeight="900" letterSpacing="3">
                                                                        <textPath href="#stampCircleTop" startOffset="50%" textAnchor="middle">
                                                                            CANCELLED
                                                                        </textPath>
                                                                    </text>
                                                                    {/* Bottom curved text: ★ CANCELLED ★ */}
                                                                    <text fill="currentColor" fontSize="11" fontWeight="800" letterSpacing="2.5">
                                                                        <textPath href="#stampCircleBottom" startOffset="50%" textAnchor="middle">
                                                                            ★ CANCELLED ★
                                                                        </textPath>
                                                                    </text>
                                                                    {/* Center Cross */}
                                                                    <text
                                                                        x="60"
                                                                        y="61"
                                                                        textAnchor="middle"
                                                                        dominantBaseline="middle"
                                                                        fill="currentColor"
                                                                        fontSize="14"
                                                                        fontWeight="bold"
                                                                    >
                                                                        ✕
                                                                    </text>
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="space-y-1">
                                                        <h3 className="font-black text-sm sm:text-base text-gray-900 tracking-wider uppercase">
                                                            {targetItem?.brand || 'Y TEDDY'}
                                                        </h3>
                                                        <p className="text-xs sm:text-[13px] text-gray-600 font-medium max-w-md mx-auto line-clamp-2">
                                                            {targetItem?.title}
                                                        </p>
                                                        <p className="text-xs text-gray-500 pt-0.5">
                                                            Size: {targetItem?.selectedSize || 'Standard'} • Quantity:{' '}
                                                            {targetItem?.quantity || 1}
                                                        </p>
                                                        <p className="text-xs font-mono text-gray-400">
                                                            Order ID: # {detailOrder.orderNumber}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Section 2: Delivery / Cancellation Status Card */}
                                                {isCancelled ? (
                                                    /* CANCELLED STATUS CARD (Matches Image 2 Exactly - Clean #F5F5F6 Card with 📦 ✕ icon & NO Track button) */
                                                    <div className="bg-[#F5F5F6] border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
                                                        <div className="flex items-center justify-between gap-4">
                                                            <div className="space-y-0.5 text-left">
                                                                <span className="text-xs text-gray-500 font-medium block">
                                                                    Cancelled On
                                                                </span>
                                                                <span className="text-base sm:text-lg font-black text-gray-900 block">
                                                                    {getCancelledDateStr(targetItem, detailOrder)}
                                                                </span>
                                                                <span className="text-xs text-gray-500 block pt-0.5">
                                                                    {targetItem?.cancellationReason || detailOrder.cancellationReason || 'As per your request'}
                                                                </span>
                                                            </div>

                                                            {/* Cardboard delivery box with circular ✕ cross badge (Matches Image 2) */}
                                                            <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 flex items-center justify-center">
                                                                <svg viewBox="0 0 64 64" className="w-12 h-12 text-amber-700/85 drop-shadow-2xs">
                                                                    <path d="M32 10 L52 20 L32 30 L12 20 Z" fill="#D4A373" stroke="#A77242" strokeWidth="1.5" />
                                                                    <path d="M12 20 L32 30 L32 54 L12 44 Z" fill="#C58F5B" stroke="#A77242" strokeWidth="1.5" />
                                                                    <path d="M52 20 L32 30 L32 54 L52 44 Z" fill="#B9834F" stroke="#A77242" strokeWidth="1.5" />
                                                                    <path d="M26 13 L38 19 L38 27 L26 21 Z" fill="#EBD5BF" opacity="0.65" />
                                                                    <path d="M32 30 L32 46" stroke="#8E5E32" strokeWidth="1.2" strokeDasharray="2 1" />
                                                                </svg>
                                                                <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#4B5563] border-2 border-white flex items-center justify-center text-white text-[10px] font-black shadow-xs">
                                                                    ✕
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {/* Absolutely NO Track Item button on cancelled order */}
                                                    </div>
                                                ) : (
                                                    /* ACTIVE STATUS CARD (Mint Green with Live Truck Progress & Track / Cancel Item) */
                                                    <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                            <div className="space-y-0.5 text-left">
                                                                <span className="text-xs text-gray-500 font-medium block">
                                                                    {isDelivered ? 'Delivered On' : 'Delivery On'}
                                                                </span>
                                                                <span className="text-base sm:text-lg font-black text-emerald-700 block">
                                                                    {getDeliveryDateStr(detailOrder)}
                                                                </span>
                                                                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mt-0.5">
                                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                                    {isDelivered ? 'Delivered' : 'Order Confirmed'}
                                                                </span>
                                                            </div>

                                                            {/* Horizontal Progress Track with Moving Truck 🚚 Icon */}
                                                            <div className="w-full sm:w-56 py-3">
                                                                <div className="relative w-full h-1.5 bg-emerald-200/70 rounded-full flex items-center">
                                                                    <div
                                                                        className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                                                                        style={{
                                                                            width: isDelivered
                                                                                ? '100%'
                                                                                : isShipped
                                                                                ? '70%'
                                                                                : '30%',
                                                                        }}
                                                                    />
                                                                    <div
                                                                        className="absolute -top-3 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shadow-md border-2 border-white transition-all duration-500"
                                                                        style={{
                                                                            left: isDelivered
                                                                                ? 'calc(100% - 14px)'
                                                                                : isShipped
                                                                                ? 'calc(70% - 14px)'
                                                                                : 'calc(30% - 14px)',
                                                                        }}
                                                                        title={detailOrder.orderStatus}
                                                                    >
                                                                        🚚
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Action Buttons: [ 📍 Track Item ] & [ ⊗ Cancel Item ] */}
                                                        <div className="pt-3 border-t border-emerald-200/70 flex flex-wrap items-center gap-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedTrackOrder(detailOrder);
                                                                    setSelectedTrackItem(targetItem);
                                                                }}
                                                                className="flex-1 min-w-[120px] py-2.5 px-4 bg-white hover:bg-emerald-50/70 border border-emerald-300 text-gray-800 font-bold text-xs rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                                                            >
                                                                <svg
                                                                    className="w-4 h-4 text-emerald-700"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth={2}
                                                                >
                                                                    <circle cx="12" cy="12" r="7" />
                                                                    <line x1="12" y1="2" x2="12" y2="5" />
                                                                    <line x1="12" y1="19" x2="12" y2="22" />
                                                                    <line x1="2" y1="12" x2="5" y2="12" />
                                                                    <line x1="19" y1="12" x2="22" y2="12" />
                                                                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                                                                </svg>
                                                                <span>Track Item</span>
                                                            </button>

                                                            {canCancel && targetItem?.status !== 'Cancelled' && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleOpenCancelFlow(
                                                                            detailOrder,
                                                                            viewingDetailOrder.itemIndex
                                                                        )
                                                                    }
                                                                    className="flex-1 min-w-[120px] py-2.5 px-4 bg-white hover:bg-red-50/70 border border-red-200 text-gray-800 hover:text-red-700 font-bold text-xs rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                                                                >
                                                                    <svg
                                                                        className="w-4 h-4 text-red-500"
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        strokeWidth={2}
                                                                    >
                                                                        <circle cx="12" cy="12" r="9" />
                                                                        <line x1="15" y1="9" x2="9" y2="15" />
                                                                        <line x1="9" y1="9" x2="15" y2="15" />
                                                                    </svg>
                                                                    <span>Cancel Item</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Section: Delivery To (Only shown for active orders - Matches Image 3 vs Image 1) */}
                                                {!isCancelled && (
                                                    <div className="bg-white border border-[#EAEAEC] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex items-start gap-3 min-w-0">
                                                                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-base shrink-0 font-bold">
                                                                    👤
                                                                </div>
                                                                <div className="min-w-0 space-y-2.5">
                                                                    <div>
                                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                                                                            Delivery To
                                                                        </span>
                                                                        <h4 className="text-sm font-bold text-gray-900 capitalize truncate">
                                                                            {detailOrder.shippingAddress.name}
                                                                        </h4>
                                                                    </div>

                                                                    <div>
                                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                                                                            Contact Details
                                                                        </span>
                                                                        <p className="text-xs font-medium text-gray-800">
                                                                            {detailOrder.shippingAddress.mobile ||
                                                                                detailOrder.customerPhone ||
                                                                                user?.phone ||
                                                                                '-'}
                                                                        </p>
                                                                    </div>

                                                                    <div>
                                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                                                                            Delivery Address
                                                                        </span>
                                                                        <p className="text-xs text-gray-600 leading-relaxed">
                                                                            {detailOrder.shippingAddress.address},{' '}
                                                                            {detailOrder.shippingAddress.city},{' '}
                                                                            {detailOrder.shippingAddress.state} -{' '}
                                                                            {detailOrder.shippingAddress.pincode}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                                                                <svg
                                                                    className="w-5 h-5"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                strokeWidth={2}
                                                            >
                                                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                                                                <circle cx="12" cy="9" r="2.5" fill="currentColor" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                                )}

                                                {/* Section 5: Pre pay for your order (Matches Image 3) */}
                                                {isCodOrPending && !isDelivered && !isCancelled && (
                                                    <div className="bg-white border border-[#EAEAEC] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="space-y-0.5 min-w-0">
                                                                <h4 className="text-sm sm:text-base font-extrabold text-gray-900">
                                                                    Pre pay for your order
                                                                </h4>
                                                                <p className="text-xs text-gray-500">
                                                                    Pay now to enjoy a cashless & hassle free delivery
                                                                    experience
                                                                </p>
                                                            </div>
                                                            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                                                <svg
                                                                    className="w-5 h-5"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth={1.8}
                                                                >
                                                                    <rect x="2" y="5" width="20" height="14" rx="2" />
                                                                    <line x1="2" y1="10" x2="22" y2="10" />
                                                                </svg>
                                                            </div>
                                                        </div>

                                                        {/* Mini Item Preview Row */}
                                                        <div className="pt-0.5">
                                                            <span className="text-[11px] font-bold text-gray-400 block mb-1.5">
                                                                Paying For 1 of {detailOrder.items.length} Item(s)
                                                            </span>
                                                            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-gray-50 border border-gray-100">
                                                                {targetItem?.primaryImage ? (
                                                                    <img
                                                                        src={targetItem.primaryImage}
                                                                        alt={targetItem.title}
                                                                        className="w-10 h-10 rounded-lg object-cover bg-white border border-gray-200 shrink-0"
                                                                    />
                                                                ) : (
                                                                    <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-200 text-[#D26900] flex items-center justify-center text-base shrink-0">
                                                                        🧸
                                                                    </div>
                                                                )}
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-xs font-bold text-gray-900 truncate">
                                                                        {targetItem?.title}
                                                                    </p>
                                                                    <p className="text-[11px] text-gray-500">
                                                                        {targetItem?.selectedSize
                                                                            ? `Size: ${targetItem.selectedSize}`
                                                                            : 'Standard Size'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Full-width Brand CTA button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedPayOrder(detailOrder)}
                                                            className="w-full py-3.5 bg-[#D26900] hover:bg-[#B85800] text-white font-bold text-xs sm:text-sm uppercase tracking-wide rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                                        >
                                                            <span>
                                                                Pay Now: ₹{detailOrder.totalAmount.toLocaleString('en-IN')}
                                                            </span>
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Section 6: Item Price Breakdown & Savings (Matches Image 3) */}
                                                <div className="bg-white border border-[#EAEAEC] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-2.5">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                            Item Price
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                toast.info(
                                                                    `Breakup: Item ₹${(
                                                                        itemPrice * itemQty
                                                                    ).toLocaleString('en-IN')} + Free Delivery = ₹${(
                                                                        itemPrice * itemQty
                                                                    ).toLocaleString('en-IN')}`
                                                                );
                                                            }}
                                                            className="text-xs font-medium text-gray-700 underline underline-offset-4 decoration-dashed hover:text-gray-900 cursor-pointer"
                                                        >
                                                            View Breakup
                                                        </button>
                                                    </div>

                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-base sm:text-lg font-black text-gray-900">
                                                            ₹{(itemPrice * itemQty).toLocaleString('en-IN')}
                                                        </span>
                                                        {itemMrp > itemPrice && (
                                                            <>
                                                                <span className="text-xs text-gray-400 line-through">
                                                                    ₹{(itemMrp * itemQty).toLocaleString('en-IN')}
                                                                </span>
                                                                <span className="text-xs font-bold text-orange-600">
                                                                    {discountPercent}% Off
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>

                                                    <p className="text-xs text-gray-500">
                                                        Sold by:{' '}
                                                        <span className="font-semibold text-gray-700">
                                                            {targetItem?.brand ? `${targetItem.brand} India` : 'YTeddybags India'}
                                                        </span>
                                                    </p>

                                                    {/* Green Savings Alert */}
                                                    {savings > 0 && (
                                                        <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-3 flex items-center gap-2.5 text-xs text-emerald-800 font-medium">
                                                            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                                                                %
                                                            </span>
                                                            <span>
                                                                You're saving{' '}
                                                                <strong className="font-extrabold text-emerald-900">
                                                                    ₹{savings.toLocaleString('en-IN')}
                                                                </strong>{' '}
                                                                on this item.
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Section 7: Payment Status (Matches Image 3) */}
                                                <div className="bg-white border border-[#EAEAEC] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-2">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                                                        Payment Status
                                                    </span>
                                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                                                        <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                                                            ✓
                                                        </span>
                                                        <span>
                                                            {detailOrder.paymentStatus === 'Paid' ||
                                                            detailOrder.paymentMethod.toUpperCase() === 'UPI'
                                                                ? 'Paid Online (UPI)'
                                                                : 'Cash on delivery'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Section 8: Updates sent to (Matches Image 4) */}
                                                <div className="bg-white border border-[#EAEAEC] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                                            <svg
                                                                className="w-4 h-4"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth={2}
                                                            >
                                                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                                            </svg>
                                                        </div>
                                                        <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                                                            Updates sent to
                                                        </h4>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
                                                        <div>
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                                                                Call
                                                            </span>
                                                            <p className="text-xs font-bold text-gray-800 mt-0.5">
                                                                {detailOrder.shippingAddress.phone ||
                                                                    detailOrder.shippingAddress.mobile ||
                                                                    detailOrder.customerPhone ||
                                                                    user?.phone ||
                                                                    '-'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                                                                Email
                                                            </span>
                                                            <p className="text-xs font-bold text-gray-800 mt-0.5 truncate">
                                                                {detailOrder.customerEmail || (detailOrder.shippingAddress as any)?.email || user?.email || '-'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Section 9: Order details (Matches Image 4) */}
                                                <div className="bg-white border border-[#EAEAEC] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                                            <svg
                                                                className="w-4 h-4"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth={2}
                                                            >
                                                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                                                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                                                <line x1="12" y1="22.08" x2="12" y2="12" />
                                                            </svg>
                                                        </div>
                                                        <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                                                            Order details
                                                        </h4>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
                                                        <div>
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                                                                Ordered On
                                                            </span>
                                                            <p className="text-xs font-bold text-gray-800 mt-0.5">
                                                                {getOrderedDateStr(detailOrder)}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                                                                Order ID
                                                            </span>
                                                            <p className="text-xs font-mono font-bold text-gray-800 mt-0.5 truncate">
                                                                # {detailOrder.orderNumber}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()
                                ) : (
                                    <>
                                        {/* Orders Header with Myntra-style Search & Filter Bar (Screenshot 1) */}
                                        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <h2 className="text-base sm:text-lg font-bold text-gray-900">All orders</h2>
                                            <p className="text-xs text-gray-500 font-normal">
                                                from {selectedTime.toLowerCase()} {filteredCustomerOrders.length > 0 && `(${filteredCustomerOrders.length})`}
                                            </p>
                                        </div>

                                        {/* Right: Search Pill & Filters Pill (Matches Screenshot 1) */}
                                        <div className="flex items-center gap-2">
                                            {/* Search Pill Input */}
                                            <div className="relative flex items-center">
                                                <svg
                                                    className="w-3.5 h-3.5 text-gray-400 absolute left-3 pointer-events-none"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                                    />
                                                </svg>
                                                <input
                                                    type="text"
                                                    value={orderSearch}
                                                    onChange={(e) => setOrderSearch(e.target.value)}
                                                    placeholder="Search"
                                                    className="rounded-full border border-gray-300 bg-white py-1.5 pl-8 pr-7 text-xs text-gray-800 placeholder:text-gray-400 focus:border-[#D26900] focus:outline-none focus:ring-1 focus:ring-[#D26900]/30 w-36 sm:w-48 transition-all"
                                                />
                                                {orderSearch && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setOrderSearch('')}
                                                        className="absolute right-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                                                        title="Clear search"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>

                                            {/* Filters Pill Button */}
                                            <button
                                                type="button"
                                                onClick={openFilterModal}
                                                className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer ${
                                                    hasActiveFilters
                                                        ? 'border-[#D26900] bg-orange-50/70 text-[#D26900]'
                                                        : 'border-gray-300 bg-white hover:border-[#D26900] hover:text-[#D26900] text-gray-700'
                                                }`}
                                            >
                                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                                </svg>
                                                <span>Filters</span>
                                                {hasActiveFilters && (
                                                    <span className="w-2 h-2 rounded-full bg-[#D26900]" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Orders List Content */}
                                {isOrdersLoading ? (
                                    <div className="space-y-4">
                                        {[1, 2].map((n) => (
                                            <div
                                                key={n}
                                                className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs animate-pulse space-y-4"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                                                    <div className="space-y-1.5 flex-1">
                                                        <div className="h-3.5 bg-gray-200 rounded w-28" />
                                                        <div className="h-2.5 bg-gray-100 rounded w-48" />
                                                    </div>
                                                </div>
                                                <div className="h-20 bg-gray-50 rounded-lg" />
                                            </div>
                                        ))}
                                    </div>
                                ) : filteredCustomerOrders.length === 0 ? (
                                    <div className="bg-white border border-gray-200 rounded-xl p-8 sm:p-12 text-center shadow-2xs">
                                        <div className="w-20 h-20 rounded-full bg-orange-50 text-[#D26900] flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.5}
                                                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                                />
                                            </svg>
                                        </div>
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900">
                                            {orderSearch || hasActiveFilters
                                                ? 'No orders found matching your filter'
                                                : 'No orders placed yet'}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-md mx-auto">
                                            {orderSearch || hasActiveFilters
                                                ? 'Try clearing your search query or selecting different filters.'
                                                : 'Explore our exclusive collection of cute plush teddy backpacks, school bags, and soft toys.'}
                                        </p>
                                        <div className="mt-6 flex items-center justify-center gap-3">
                                            {(orderSearch || hasActiveFilters) && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setOrderSearch('');
                                                        setSelectedStatus('All');
                                                        setSelectedTime('Anytime');
                                                    }}
                                                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                                                >
                                                    Clear Filters
                                                </button>
                                            )}
                                            <Link
                                                to="/"
                                                className="px-6 py-2.5 bg-[#D26900] hover:bg-[#B45309] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-xs transition-colors"
                                            >
                                                START SHOPPING
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredCustomerOrders.map((order) => {
                                            // Separate active items from cancelled items
                                            const activeItems = order.items
                                                .map((item, originalIndex) => ({ item, originalIndex }))
                                                .filter(({ item }) => item.status !== 'Cancelled');
                                            const cancelledItems = order.items
                                                .map((item, originalIndex) => ({ item, originalIndex }))
                                                .filter(({ item }) => item.status === 'Cancelled');

                                            const isOrderFullyCancelled = order.orderStatus === 'Cancelled' || activeItems.length === 0;
                                            const isDelivered = order.orderStatus === 'Delivered';
                                            const canCancel = ['Placed', 'Confirmed', 'Packed'].includes(order.orderStatus);
                                            const isCodOrPending =
                                                order.paymentMethod?.toLowerCase().includes('cod') ||
                                                order.paymentMethod?.toLowerCase().includes('cash') ||
                                                order.paymentStatus === 'Pending';

                                            const activeSubtotal = activeItems.reduce(
                                                (sum, { item }) => sum + item.price * item.quantity,
                                                0
                                            );

                                            return (
                                                <div
                                                    key={order.id}
                                                    className="bg-white border border-[#EAEAEC] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5 transition-all text-left"
                                                >
                                                    {/* If fully cancelled */}
                                                    {isOrderFullyCancelled ? (
                                                        <div className="space-y-3.5">
                                                            {/* Cancelled Header (Matches Image 1) */}
                                                            <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100">
                                                                <div className="flex items-start gap-3 min-w-0">
                                                                    <PackageBoxStatusIcon status="Cancelled" />
                                                                    <div className="min-w-0">
                                                                        <div className="flex items-center gap-2">
                                                                            <h3 className="text-sm sm:text-base font-bold leading-tight text-gray-900">
                                                                                Cancelled
                                                                            </h3>
                                                                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-bold shrink-0">
                                                                                #{order.orderNumber}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                                                                            {getOrderSubtext(order)}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="text-right shrink-0">
                                                                    <span className="text-sm font-black text-gray-900 block">
                                                                        ₹{order.totalAmount.toLocaleString('en-IN')}
                                                                    </span>
                                                                    <span className="text-[10px] text-gray-500 font-medium">
                                                                        {order.paymentMethod}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Cancelled Items List (Matches Image 1 - clean item card, no track/cancel buttons) */}
                                                            <div className="space-y-3">
                                                                {order.items.map((item, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className="bg-white border border-[#EAEAEC] hover:border-gray-300 rounded-xl overflow-hidden transition-all shadow-2xs"
                                                                    >
                                                                        <div
                                                                            onClick={() => setViewingDetailOrder({ order, itemIndex: idx })}
                                                                            className="bg-[#FAFAFB] hover:bg-[#F3F4F6] p-3 sm:p-3.5 flex items-center justify-between gap-3 group transition-colors cursor-pointer block"
                                                                        >
                                                                            <div className="flex items-center gap-3.5 min-w-0">
                                                                                {item.primaryImage ? (
                                                                                    <img
                                                                                        src={item.primaryImage}
                                                                                        alt={item.title}
                                                                                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover bg-white border border-gray-200 shrink-0 shadow-2xs grayscale-20"
                                                                                    />
                                                                                ) : (
                                                                                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-orange-50 border border-orange-200 text-[#D26900] flex items-center justify-center font-bold text-xs shrink-0">
                                                                                        🧸
                                                                                    </div>
                                                                                )}

                                                                                <div className="min-w-0">
                                                                                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block">
                                                                                        {item.brand || 'Y TEDDY'}
                                                                                    </span>
                                                                                    <h4 className="font-bold text-xs sm:text-sm text-gray-800 group-hover:text-gray-950 transition-colors truncate">
                                                                                        {item.title}
                                                                                    </h4>
                                                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                                                        {item.selectedSize
                                                                                            ? `Size: ${item.selectedSize}`
                                                                                            : 'Standard Size'}
                                                                                        {item.selectedColor
                                                                                            ? ` • Color: ${item.selectedColor}`
                                                                                            : ''}
                                                                                        {` • Qty: ${item.quantity}`}
                                                                                    </p>
                                                                                    <p className="text-xs font-bold text-gray-700 mt-1">
                                                                                        ₹{item.price.toLocaleString('en-IN')}
                                                                                    </p>
                                                                                </div>
                                                                            </div>

                                                                            <div className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all shrink-0 pr-1">
                                                                                <svg
                                                                                    className="w-4 h-4"
                                                                                    fill="none"
                                                                                    viewBox="0 0 24 24"
                                                                                    stroke="currentColor"
                                                                                    strokeWidth={2.5}
                                                                                >
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                                                </svg>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        /* Active order or partially cancelled order */
                                                        <div className="space-y-3.5">
                                                            {/* Confirmed / Active Header (Matches Image 1 with green text) */}
                                                            <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100">
                                                                <div className="flex items-start gap-3 min-w-0">
                                                                    <PackageBoxStatusIcon status={isDelivered ? 'Delivered' : 'Confirmed'} />
                                                                    <div className="min-w-0">
                                                                        <div className="flex items-center gap-2">
                                                                            <h3 className="text-sm sm:text-base font-bold leading-tight text-emerald-700">
                                                                                {isDelivered ? 'Delivered' : 'Confirmed'}
                                                                            </h3>
                                                                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-bold shrink-0">
                                                                                #{order.orderNumber}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                                                                            {getOrderSubtext(order)}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="text-right shrink-0">
                                                                    <span className="text-sm font-black text-gray-900 block">
                                                                        ₹{(activeItems.length < order.items.length ? activeSubtotal : order.totalAmount).toLocaleString('en-IN')}
                                                                    </span>
                                                                    <span className="text-[10px] text-gray-500 font-medium">
                                                                        {order.paymentMethod}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Pre-paying Banner (Matches Image 1 reference with lavender bg & brand CTA "Pay Now") */}
                                                            {!isDelivered && isCodOrPending && (
                                                                <div className="bg-[#EDE9FE] border border-[#DDD6FE] rounded-2xl p-3 sm:px-4 sm:py-3.5 flex items-center justify-between gap-3 text-xs">
                                                                    <div className="flex items-center gap-2 min-w-0">
                                                                        <span className="text-gray-900 font-medium text-xs sm:text-[13px] truncate">
                                                                            Enjoy hassle-free delivery by pre-paying now.
                                                                        </span>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setSelectedPayOrder(order)}
                                                                        className="px-5 sm:px-6 py-2.5 bg-[#D26900] hover:bg-[#B85800] active:scale-95 text-white font-bold text-xs sm:text-[13px] rounded-xl transition-all shrink-0 shadow-xs cursor-pointer"
                                                                    >
                                                                        Pay Now
                                                                    </button>
                                                                </div>
                                                            )}

                                                            {/* Active Items List */}
                                                            <div className="space-y-3">
                                                                {activeItems.map(({ item, originalIndex }) => (
                                                                    <div
                                                                        key={originalIndex}
                                                                        className="bg-white border border-[#EAEAEC] hover:border-orange-200 rounded-xl overflow-hidden transition-all shadow-2xs"
                                                                    >
                                                                        {/* Clickable Item Preview (Opens Order Details View - Matches Image 1) */}
                                                                        <div
                                                                            onClick={() => setViewingDetailOrder({ order, itemIndex: originalIndex })}
                                                                            className="bg-[#FAFAFB] hover:bg-[#F3F4F6] p-3 sm:p-3.5 flex items-center justify-between gap-3 group transition-colors cursor-pointer border-b border-[#EAEAEC]"
                                                                        >
                                                                            <div className="flex items-center gap-3.5 min-w-0">
                                                                                {item.primaryImage ? (
                                                                                    <img
                                                                                        src={item.primaryImage}
                                                                                        alt={item.title}
                                                                                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover bg-white border border-gray-200 shrink-0 shadow-2xs"
                                                                                    />
                                                                                ) : (
                                                                                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-orange-50 border border-orange-200 text-[#D26900] flex items-center justify-center font-bold text-xs shrink-0">
                                                                                        🧸
                                                                                    </div>
                                                                                )}

                                                                                <div className="min-w-0">
                                                                                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block">
                                                                                        {item.brand || 'Y TEDDY'}
                                                                                    </span>
                                                                                    <h4 className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-[#D26900] transition-colors truncate">
                                                                                        {item.title}
                                                                                    </h4>
                                                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                                                        Size: {item.selectedSize || 'L'}
                                                                                        {item.selectedColor ? ` • Color: ${item.selectedColor}` : ''}
                                                                                    </p>
                                                                                    <p className="text-xs font-bold text-gray-900 mt-1">
                                                                                        ₹{item.price.toLocaleString('en-IN')}
                                                                                        {item.mrp && item.mrp > item.price && (
                                                                                            <span className="text-[10px] text-gray-400 line-through font-normal ml-1.5">
                                                                                                ₹{item.mrp.toLocaleString('en-IN')}
                                                                                            </span>
                                                                                        )}
                                                                                    </p>
                                                                                </div>
                                                                            </div>

                                                                            <div className="text-gray-400 group-hover:text-[#D26900] group-hover:translate-x-0.5 transition-all shrink-0 pr-1">
                                                                                <svg
                                                                                    className="w-4 h-4"
                                                                                    fill="none"
                                                                                    viewBox="0 0 24 24"
                                                                                    stroke="currentColor"
                                                                                    strokeWidth={2.5}
                                                                                >
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                                                </svg>
                                                                            </div>
                                                                        </div>

                                                                        {/* Action Pills Row (Matches Image 1) */}
                                                                        <div className="p-2.5 sm:p-3 bg-white flex flex-wrap items-center gap-2">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setSelectedTrackOrder(order);
                                                                                    setSelectedTrackItem(item);
                                                                                }}
                                                                                className="flex-1 min-w-[100px] py-2 px-3 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                                                                            >
                                                                                <svg
                                                                                    className="w-4 h-4 text-gray-600"
                                                                                    viewBox="0 0 24 24"
                                                                                    fill="none"
                                                                                    stroke="currentColor"
                                                                                    strokeWidth={1.8}
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                >
                                                                                    <circle cx="12" cy="12" r="7" />
                                                                                    <line x1="12" y1="2" x2="12" y2="5" />
                                                                                    <line x1="12" y1="19" x2="12" y2="22" />
                                                                                    <line x1="2" y1="12" x2="5" y2="12" />
                                                                                    <line x1="19" y1="12" x2="22" y2="12" />
                                                                                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                                                                                </svg>
                                                                                <span>Track Item</span>
                                                                            </button>

                                                                            {canCancel && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleOpenCancelFlow(order, originalIndex)}
                                                                                    className="flex-1 min-w-[100px] py-2 px-3 border border-gray-200 hover:border-red-300 bg-white hover:bg-red-50/50 text-gray-700 hover:text-red-600 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                                                                                >
                                                                                    <svg
                                                                                        className="w-4 h-4 text-gray-500"
                                                                                        viewBox="0 0 24 24"
                                                                                        fill="none"
                                                                                        stroke="currentColor"
                                                                                        strokeWidth={2}
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                    >
                                                                                        <circle cx="12" cy="12" r="9" />
                                                                                        <line x1="15" y1="9" x2="9" y2="15" />
                                                                                        <line x1="9" y1="9" x2="15" y2="15" />
                                                                                    </svg>
                                                                                    <span>Cancel Item</span>
                                                                                </button>
                                                                            )}

                                                                            <Link
                                                                                to={`/help?order=${order.orderNumber}`}
                                                                                className="flex-1 min-w-[100px] py-2 px-3 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                                                                            >
                                                                                <svg
                                                                                    className="w-4 h-4 text-gray-600"
                                                                                    viewBox="0 0 24 24"
                                                                                    fill="none"
                                                                                    stroke="currentColor"
                                                                                    strokeWidth={1.8}
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                >
                                                                                    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                                                                                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                                                                                </svg>
                                                                                <span>Need Help?</span>
                                                                            </Link>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {/* If this order has partially cancelled items (Matches Image 1 Cancelled Block) */}
                                                            {cancelledItems.length > 0 && (
                                                                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                                                                    <div className="flex items-start gap-3">
                                                                        <PackageBoxStatusIcon status="Cancelled" />
                                                                        <div className="min-w-0">
                                                                            <h3 className="text-sm sm:text-base font-bold leading-tight text-gray-900">
                                                                                Cancelled
                                                                            </h3>
                                                                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                                                                                {getItemCancelSubtext(cancelledItems[0].item, order)}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-3">
                                                                        {cancelledItems.map(({ item, originalIndex }) => (
                                                                            <div
                                                                                key={originalIndex}
                                                                                className="bg-white border border-[#EAEAEC] hover:border-gray-300 rounded-xl overflow-hidden transition-all shadow-2xs"
                                                                            >
                                                                                <div
                                                                                    onClick={() => setViewingDetailOrder({ order, itemIndex: originalIndex })}
                                                                                    className="bg-[#FAFAFB] hover:bg-[#F3F4F6] p-3 sm:p-3.5 flex items-center justify-between gap-3 group transition-colors cursor-pointer block"
                                                                                >
                                                                                    <div className="flex items-center gap-3.5 min-w-0">
                                                                                        {item.primaryImage ? (
                                                                                            <img
                                                                                                src={item.primaryImage}
                                                                                                alt={item.title}
                                                                                                className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover bg-white border border-gray-200 shrink-0 shadow-2xs grayscale-20"
                                                                                            />
                                                                                        ) : (
                                                                                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-orange-50 border border-orange-200 text-[#D26900] flex items-center justify-center font-bold text-xs shrink-0">
                                                                                                🧸
                                                                                            </div>
                                                                                        )}

                                                                                        <div className="min-w-0">
                                                                                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block">
                                                                                                {item.brand || 'Y TEDDY'}
                                                                                            </span>
                                                                                            <h4 className="font-bold text-xs sm:text-sm text-gray-800 group-hover:text-gray-950 transition-colors truncate">
                                                                                                {item.title}
                                                                                            </h4>
                                                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                                                {item.selectedSize
                                                                                            ? `Size: ${item.selectedSize}`
                                                                                            : 'Standard Size'}
                                                                                                {item.selectedColor
                                                                                            ? ` • Color: ${item.selectedColor}`
                                                                                            : ''}
                                                                                                {` • Qty: ${item.quantity}`}
                                                                                            </p>
                                                                                            <p className="text-xs font-bold text-gray-700 mt-1">
                                                                                                ₹{item.price.toLocaleString('en-IN')}
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="text-gray-400 group-hover:text-gray-600 transition-all shrink-0 pr-1">
                                                                                        <svg
                                                                                            className="w-4 h-4"
                                                                                            fill="none"
                                                                                            viewBox="0 0 24 24"
                                                                                            stroke="currentColor"
                                                                                            strokeWidth={2.5}
                                                                                        >
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                                                        </svg>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Delivery Address & Courier Status Summary */}
                                                    <div className="text-xs text-gray-600 bg-gray-50/70 border border-gray-100 rounded-lg p-2.5 sm:p-3 space-y-1">
                                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                                            <p className="font-medium text-[11px] sm:text-xs">
                                                                <span className="font-bold text-gray-800">
                                                                    Delivering to:
                                                                </span>{' '}
                                                                {order.shippingAddress.name},{' '}
                                                                {order.shippingAddress.address},{' '}
                                                                {order.shippingAddress.city} -{' '}
                                                                {order.shippingAddress.pincode}
                                                            </p>
                                                            {order.delhiveryWaybill ? (
                                                                <span className="text-[11px] font-bold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200 flex items-center gap-1.5">
                                                                    <span>🚚</span>
                                                                    <span>
                                                                        Delhivery AWB #{order.delhiveryWaybill}
                                                                    </span>
                                                                    {order.estimatedDeliveryDate && (
                                                                        <span className="text-[10px] text-amber-700 font-semibold">
                                                                            • Est. {order.estimatedDeliveryDate}
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
                    </main>
                </div>
            </div>

            {/* ======================================================== */}
            {/* MYNTRA-STYLE 2-COLUMN FILTERS MODAL (Screenshots 2 & 3) */}
            {/* Uses Website Brand CTA Color #D26900 */}
            {/* ======================================================== */}
            {isFilterModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs select-none"
                    onClick={() => setIsFilterModalOpen(false)}
                >
                    <div
                        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900">Filters</h3>
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                    className="text-xs font-bold text-[#D26900] hover:text-[#B85800] transition-colors cursor-pointer"
                                >
                                    Clear All
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsFilterModalOpen(false)}
                                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                                    aria-label="Close"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Modal Body: 2 Columns */}
                        <div className="flex min-h-[260px] sm:min-h-[290px]">
                            {/* Left Tabs Column */}
                            <div className="w-32 sm:w-40 border-r border-gray-100 bg-[#F9FAFB]/80 p-2 space-y-1">
                                <button
                                    type="button"
                                    onClick={() => setFilterModalTab('status')}
                                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold text-left transition-colors cursor-pointer ${
                                        filterModalTab === 'status'
                                            ? 'bg-white text-[#D26900] shadow-2xs border-l-3 border-[#D26900]'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <svg className="w-4 h-4 text-[#D26900] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                    <span>Status</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setFilterModalTab('time')}
                                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold text-left transition-colors cursor-pointer ${
                                        filterModalTab === 'time'
                                            ? 'bg-white text-[#D26900] shadow-2xs border-l-3 border-[#D26900]'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <svg className="w-4 h-4 text-[#D26900] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                    <span>Time</span>
                                </button>
                            </div>

                            {/* Right Options Column */}
                            <div className="flex-1 p-5 overflow-y-auto">
                                {filterModalTab === 'status' ? (
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-3">
                                            ORDER STATUS
                                        </span>
                                        <div className="space-y-1">
                                            {['All', 'On the way', 'Delivered', 'Cancelled', 'Returned'].map((st) => (
                                                <FilterRadioOption
                                                    key={st}
                                                    label={st}
                                                    selected={tempStatus === st}
                                                    onSelect={() => setTempStatus(st)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-3">
                                            ORDER TIME
                                        </span>
                                        <div className="space-y-1">
                                            {['Anytime', 'Last 30 days', 'Last 6 months', 'Last year'].map((tm) => (
                                                <FilterRadioOption
                                                    key={tm}
                                                    label={tm}
                                                    selected={tempTime === tm}
                                                    onSelect={() => setTempTime(tm)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer CTA */}
                        <div className="p-4 border-t border-gray-100 bg-white">
                            <button
                                type="button"
                                onClick={handleApplyFilters}
                                className="w-full py-3 bg-[#D26900] hover:bg-[#B85800] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-colors cursor-pointer"
                            >
                                Show Results
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* ADDRESS MODAL (Add / Edit Address) */}
            {/* Shared component matching reference styling */}
            {/* ======================================================== */}
            <AddressModal
                isOpen={isAddressModalOpen}
                editingAddress={editingAddressId ? addresses.find((a) => a.id === editingAddressId) : null}
                onClose={() => setIsAddressModalOpen(false)}
            />

            {/* ======================================================== */}
            {/* CENTERED TRACKING MODAL POPUP                            */}
            {/* Matches user requirement: "traked ka pop dikahw clik krega to center me" */}
            {/* ======================================================== */}
            {/* ======================================================== */}
            {/* CENTERED TRACK ITEM MODAL POPUP (Matches Image 2 Exactly) */}
            {/* ======================================================== */}
            {selectedTrackOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4 text-left font-sans">
                        {/* Header: Track item and close button (Matches Image 2) */}
                        <div className="flex items-center justify-between pb-1">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                                Track item
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedTrackOrder(null);
                                    setSelectedTrackItem(null);
                                }}
                                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Top Card: In This Delivery Item Preview (Matches Image 2) */}
                        {(() => {
                            const targetItem = selectedTrackItem || selectedTrackOrder.items[0];
                            const totalItemCount = selectedTrackItem
                                ? selectedTrackItem.quantity
                                : selectedTrackOrder.items.reduce((s, it) => s + it.quantity, 0);

                            return (
                                <div className="border border-gray-200 rounded-2xl p-3.5 sm:p-4 bg-white flex items-center gap-3.5 shadow-2xs">
                                    {targetItem?.primaryImage ? (
                                        <img
                                            src={targetItem.primaryImage}
                                            alt={targetItem.title}
                                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover bg-gray-50 border border-gray-200 shrink-0"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-orange-50 border border-orange-200 text-[#D26900] flex items-center justify-center text-xl shrink-0">
                                            🧸
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <span className="text-xs text-gray-500 font-medium block">
                                            In This Delivery
                                        </span>
                                        <span className="text-base sm:text-lg font-extrabold text-gray-900 block leading-tight mt-0.5">
                                            {totalItemCount} Item{totalItemCount > 1 ? 's' : ''}
                                        </span>
                                        {targetItem && (
                                            <p className="text-xs text-gray-600 truncate mt-0.5">
                                                {targetItem.title}
                                                {targetItem.selectedSize ? ` • Size: ${targetItem.selectedSize}` : ''}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Bottom Card: Vertical Stepper (Matches Image 2 Exactly) */}
                        {(() => {
                            const status = selectedTrackOrder.orderStatus;
                            const isShipped = ['Shipped', 'Out for Delivery', 'Delivered'].includes(status);
                            const isDelivered = status === 'Delivered';

                            // Order placed time (e.g. 07:25 PM)
                            const orderDate = new Date(selectedTrackOrder.createdAt || Date.now());
                            const orderTimeStr = orderDate.toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                            });

                            // Shipped expected date (e.g. Expected by Sun, 18 Oct)
                            const shipDate = new Date(orderDate);
                            shipDate.setDate(shipDate.getDate() + 2);
                            const shippedDateStr = shipDate.toLocaleDateString('en-IN', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                            });

                            // Arriving date range (e.g. 20 Oct - 22 Oct)
                            const minD = new Date(orderDate);
                            minD.setDate(minD.getDate() + 4);
                            const maxD = new Date(orderDate);
                            maxD.setDate(maxD.getDate() + 6);
                            const arrivingRangeStr = `${minD.getDate()} ${minD.toLocaleString('en-IN', { month: 'short' })} - ${maxD.getDate()} ${maxD.toLocaleString('en-IN', { month: 'short' })}`;

                            return (
                                <div className="border border-gray-200 rounded-2xl p-4 sm:p-5 bg-white shadow-2xs space-y-0">
                                    {/* Step 1: Order Placed */}
                                    <div className="flex items-start gap-3 relative">
                                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>

                                        <div className="flex-1 flex items-center justify-between min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-xs sm:text-sm text-gray-900">
                                                    Order Placed
                                                </span>
                                                <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                            <span className="text-xs text-gray-500 font-medium">
                                                {orderTimeStr}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Connector Line 1 */}
                                    <div className="ml-[9px] w-0.5 h-7 border-l-2 border-dashed border-emerald-400 my-0.5" />

                                    {/* Step 2: Shipped */}
                                    <div className="flex items-start gap-3 relative">
                                        {isShipped ? (
                                            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        ) : (
                                            <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-white shrink-0 mt-0.5" />
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <span className="font-bold text-xs sm:text-sm text-gray-900 block leading-tight">
                                                Shipped
                                            </span>
                                            <span className="text-xs text-gray-500 block mt-0.5">
                                                {isShipped
                                                    ? `Shipped via ${selectedTrackOrder.courierPartner || 'Delhivery Express'}`
                                                    : `Expected by ${shippedDateStr}`}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Connector Line 2 */}
                                    <div
                                        className={`ml-[9px] w-0.5 h-7 border-l-2 border-dashed my-0.5 ${
                                            isDelivered ? 'border-emerald-400' : 'border-gray-200'
                                        }`}
                                    />

                                    {/* Step 3: Arriving / Delivered */}
                                    <div className="flex items-start gap-3 relative">
                                        {isDelivered ? (
                                            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        ) : (
                                            <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-white shrink-0 mt-0.5" />
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <span className="font-bold text-xs sm:text-sm text-gray-900 block leading-tight">
                                                {isDelivered ? 'Delivered' : 'Arriving'}
                                            </span>
                                            <span className="text-xs font-bold text-emerald-600 block mt-0.5">
                                                {isDelivered
                                                    ? 'Delivered to your address'
                                                    : `Expected by ${selectedTrackOrder.estimatedDeliveryDate || arrivingRangeStr}`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Delivering to footer */}
                        <div className="text-xs text-gray-600 bg-gray-50/80 border border-gray-100 rounded-xl p-3">
                            <span className="font-bold text-gray-800">Delivering to:</span>{' '}
                            {selectedTrackOrder.shippingAddress.name},{' '}
                            {selectedTrackOrder.shippingAddress.address},{' '}
                            {selectedTrackOrder.shippingAddress.city} -{' '}
                            {selectedTrackOrder.shippingAddress.pincode}
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* CENTERED PRE-PAY MODAL POPUP                             */}
            {/* Matches user requirement: "pay now bhi"                  */}
            {/* ======================================================== */}
            {selectedPayOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative text-center space-y-4 font-sans animate-in fade-in zoom-in-95 duration-150">
                        <button
                            type="button"
                            onClick={() => setSelectedPayOrder(null)}
                            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                        >
                            ✕
                        </button>

                        <div className="space-y-1 text-center">
                            <span className="text-[10px] font-bold text-[#D26900] tracking-wider uppercase bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                                Pre-Pay For Hassle-Free Delivery
                            </span>
                            <h3 className="text-xl font-black text-gray-900 pt-1">
                                ₹{selectedPayOrder.totalAmount.toLocaleString('en-IN')}
                            </h3>
                            <p className="text-xs text-gray-500 font-mono">
                                Order #{selectedPayOrder.orderNumber}
                            </p>
                        </div>

                        {/* Simulated UPI QR Canvas */}
                        <div className="p-3 bg-white border border-gray-200 rounded-xl inline-block shadow-inner mx-auto">
                            <svg className="w-40 h-40 mx-auto" viewBox="0 0 100 100">
                                <rect width="100" height="100" fill="#FFFFFF" />
                                <rect x="10" y="10" width="24" height="24" fill="#1F2937" rx="2" />
                                <rect x="14" y="14" width="16" height="16" fill="#FFFFFF" rx="1" />
                                <rect x="18" y="18" width="8" height="8" fill="#D26900" rx="1" />
                                <rect x="66" y="10" width="24" height="24" fill="#1F2937" rx="2" />
                                <rect x="70" y="14" width="16" height="16" fill="#FFFFFF" rx="1" />
                                <rect x="74" y="18" width="8" height="8" fill="#D26900" rx="1" />
                                <rect x="10" y="66" width="24" height="24" fill="#1F2937" rx="2" />
                                <rect x="14" y="70" width="16" height="16" fill="#FFFFFF" rx="1" />
                                <rect x="18" y="74" width="8" height="8" fill="#D26900" rx="1" />
                                <rect x="42" y="12" width="6" height="6" fill="#D26900" />
                                <rect x="52" y="12" width="6" height="6" fill="#1F2937" />
                                <rect x="42" y="24" width="6" height="6" fill="#1F2937" />
                                <rect x="52" y="24" width="6" height="6" fill="#D26900" />
                                <rect x="12" y="42" width="6" height="6" fill="#1F2937" />
                                <rect x="24" y="42" width="6" height="6" fill="#D26900" />
                                <rect x="36" y="42" width="10" height="10" fill="#1F2937" />
                                <rect x="52" y="42" width="8" height="8" fill="#D26900" />
                                <rect x="66" y="42" width="8" height="8" fill="#1F2937" />
                                <rect x="80" y="42" width="6" height="6" fill="#1F2937" />
                                <rect x="42" y="56" width="6" height="6" fill="#1F2937" />
                                <rect x="56" y="56" width="8" height="8" fill="#D26900" />
                                <rect x="70" y="56" width="6" height="6" fill="#1F2937" />
                                <rect x="42" y="68" width="8" height="8" fill="#D26900" />
                                <rect x="56" y="68" width="6" height="6" fill="#1F2937" />
                                <rect x="70" y="68" width="8" height="8" fill="#D26900" />
                                <rect x="42" y="80" width="8" height="8" fill="#1F2937" />
                                <rect x="56" y="80" width="8" height="8" fill="#D26900" />
                                <rect x="70" y="80" width="12" height="12" fill="#1F2937" />
                            </svg>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 font-medium">
                            <span>Google Pay</span>
                            <span>•</span>
                            <span>PhonePe</span>
                            <span>•</span>
                            <span>Paytm</span>
                            <span>•</span>
                            <span>BHIM UPI</span>
                        </div>

                        <button
                            type="button"
                            disabled={isPayingNow}
                            onClick={handleConfirmPrePay}
                            className="w-full py-3 bg-[#D26900] hover:bg-[#B85800] disabled:bg-gray-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                        >
                            {isPayingNow ? (
                                <span>Processing Payment...</span>
                            ) : (
                                <>
                                    <span>Confirm Payment (₹{selectedPayOrder.totalAmount.toLocaleString('en-IN')})</span>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
