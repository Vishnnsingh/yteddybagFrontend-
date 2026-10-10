import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import type { RootState, AppDispatch } from '../redux/store';
import { logoutUserAPI } from '../redux/slices/authSlice';
import { useAccount, type UserAddress } from '../Context/AccountContext';

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

// Custom Radio button with Brand Orange CTA styling
const CustomRadio = ({
    checked,
    onChange,
    label,
    name,
}: {
    checked: boolean;
    onChange: () => void;
    label: string;
    name: string;
}) => (
    <label className="flex items-center gap-2.5 cursor-pointer select-none group">
        <div
            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0 ${checked
                ? 'border-[#D26900]'
                : 'border-gray-400 bg-white group-hover:border-[#D26900]'
                }`}
        >
            {checked && (
                <div className="w-2 h-2 rounded-full bg-[#D26900]" />
            )}
        </div>
        <input
            type="radio"
            name={name}
            checked={checked}
            onChange={onChange}
            className="sr-only"
        />
        <span className="text-xs sm:text-sm text-gray-800 font-medium">{label}</span>
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
        addAddress,
        updateAddress,
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
    // ADDRESS MODAL & FORM STATE
    // -------------------------------------------------------------
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
    const [addressForm, setAddressForm] = useState({
        name: '',
        mobile: '',
        pincode: '',
        state: '',
        houseNo: '',
        street: '',
        locality: '',
        city: '',
        type: 'HOME' as 'HOME' | 'OFFICE',
        openOnSaturday: false,
        openOnSunday: false,
        isDefault: false,
    });

    // Lock background body scrolling when address modal is open
    useEffect(() => {
        if (isAddressModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isAddressModalOpen]);

    const openAddAddressModal = () => {
        setEditingAddressId(null);
        setAddressForm({
            name: profile?.name || user?.name || '',
            mobile: profile?.mobile || user?.phone || '',
            pincode: '',
            state: '',
            houseNo: '',
            street: '',
            locality: '',
            city: '',
            type: 'HOME',
            openOnSaturday: false,
            openOnSunday: false,
            isDefault: addresses.length === 0,
        });
        setIsAddressModalOpen(true);
    };

    const openEditAddressModal = (addr: UserAddress) => {
        setEditingAddressId(addr.id);
        const parts = addr.address ? addr.address.split(', ') : ['', ''];
        const houseNo = parts.length > 1 ? parts[0] : addr.address || '';
        const street = parts.length > 1 ? parts.slice(1).join(', ') : '';

        setAddressForm({
            name: addr.name || '',
            mobile: addr.mobile || '',
            pincode: addr.pincode || '',
            state: addr.state || '',
            houseNo: houseNo,
            street: street,
            locality: addr.locality || '',
            city: addr.city || '',
            type: addr.type === 'OFFICE' || addr.type === 'WORK' ? 'OFFICE' : 'HOME',
            openOnSaturday: Boolean(addr.openOnSaturday),
            openOnSunday: Boolean(addr.openOnSunday),
            isDefault: addr.isDefault || false,
        });
        setIsAddressModalOpen(true);
    };

    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (
            !addressForm.name.trim() ||
            !addressForm.mobile.trim() ||
            !addressForm.pincode.trim() ||
            !addressForm.state.trim() ||
            (!addressForm.houseNo.trim() && !addressForm.street.trim()) ||
            !addressForm.locality.trim() ||
            !addressForm.city.trim()
        ) {
            toast.error('Please fill in all address details');
            return;
        }

        const combinedAddress = [addressForm.houseNo.trim(), addressForm.street.trim()]
            .filter(Boolean)
            .join(', ') || addressForm.houseNo || addressForm.street;

        const payload = {
            name: addressForm.name.trim(),
            mobile: addressForm.mobile.trim(),
            pincode: addressForm.pincode.trim(),
            state: addressForm.state.trim(),
            address: combinedAddress,
            locality: addressForm.locality.trim(),
            city: addressForm.city.trim(),
            type: addressForm.type,
            openOnSaturday: addressForm.type === 'OFFICE' ? addressForm.openOnSaturday : false,
            openOnSunday: addressForm.type === 'OFFICE' ? addressForm.openOnSunday : false,
            isDefault: addressForm.isDefault,
        };

        if (editingAddressId) {
            const ok = await updateAddress(editingAddressId, payload);
            if (ok) setIsAddressModalOpen(false);
        } else {
            const ok = await addAddress(payload);
            if (ok) setIsAddressModalOpen(false);
        }
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
                        {/* VIEW 6: ORDERS & RETURNS */}
                        {/* ---------------------------------------------------- */}
                        {activeTab === 'orders' && (
                            <div className="bg-white border border-gray-200 rounded-lg p-8 sm:p-12 text-center shadow-2xs">
                                <div className="w-20 h-20 rounded-full bg-orange-50 text-[#D26900] flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">No orders placed yet</h3>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-md mx-auto">
                                    Explore our exclusive collection of cute plush teddy backpacks, school bags, and soft toys.
                                </p>
                                <Link
                                    to="/"
                                    className="inline-block mt-6 px-8 py-3 bg-[#D26900] hover:bg-[#B45309] text-white font-bold text-xs uppercase tracking-wider rounded-md shadow-xs transition-colors"
                                >
                                    START SHOPPING
                                </Link>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* ======================================================== */}
            {/* ADDRESS MODAL (Add / Edit Address) */}
            {/* Matches Myntra reference styling with Brand Color CTA */}
            {/* ======================================================== */}
            {isAddressModalOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
                    <div className="bg-white rounded-lg shadow-2xl max-w-[460px] w-full overflow-hidden flex flex-col text-left animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 sm:px-7 py-4 border-b border-gray-200 bg-white">
                            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#282C3F]">
                                {editingAddressId ? 'EDIT ADDRESS' : 'ADD NEW ADDRESS'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsAddressModalOpen(false)}
                                className="text-gray-400 hover:text-gray-700 text-lg font-bold cursor-pointer transition-colors p-1 leading-none"
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSaveAddress} className="flex flex-col flex-1">
                            <div className="px-6 sm:px-7 py-5 space-y-4 overflow-y-auto max-h-[72vh]">
                                {/* Contact Details */}
                                <div className="space-y-4">
                                    <div className="relative border-b border-gray-300 focus-within:border-[#D26900] transition-colors pb-0.5">
                                        <label className="text-[11px] sm:text-xs text-gray-500 font-medium block">
                                            Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={addressForm.name}
                                            onChange={(e) =>
                                                setAddressForm((prev) => ({ ...prev, name: e.target.value }))
                                            }
                                            className="w-full bg-transparent text-sm font-medium text-gray-900 outline-none pt-1 pb-1.5"
                                        />
                                    </div>

                                    <div className="relative border-b border-gray-300 focus-within:border-[#D26900] transition-colors pb-0.5">
                                        <label className="text-[11px] sm:text-xs text-gray-500 font-medium block">
                                            Mobile *
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={addressForm.mobile}
                                            onChange={(e) =>
                                                setAddressForm((prev) => ({ ...prev, mobile: e.target.value }))
                                            }
                                            className="w-full bg-transparent text-sm font-medium text-gray-900 outline-none pt-1 pb-1.5 font-mono"
                                        />
                                    </div>
                                </div>

                                {/* Section Separator Band (Thick Grey Strip matching reference) */}
                                <div className="-mx-6 sm:-mx-7 h-2.5 bg-[#F5F5F6] border-y border-gray-200/70 my-3.5" />

                                {/* Address Details */}
                                <div className="space-y-4">
                                    {/* Pincode & State side-by-side */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative border-b border-gray-300 focus-within:border-[#D26900] transition-colors pb-0.5">
                                            <label className="text-[11px] sm:text-xs text-gray-500 font-medium block">
                                                Pincode *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={addressForm.pincode}
                                                onChange={(e) =>
                                                    setAddressForm((prev) => ({ ...prev, pincode: e.target.value }))
                                                }
                                                className="w-full bg-transparent text-sm font-medium text-gray-900 outline-none pt-1 pb-1.5 font-mono"
                                            />
                                        </div>

                                        <div className="relative border-b border-gray-300 focus-within:border-[#D26900] transition-colors pb-0.5">
                                            <label className="text-[11px] sm:text-xs text-gray-500 font-medium block">
                                                State *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={addressForm.state}
                                                onChange={(e) =>
                                                    setAddressForm((prev) => ({ ...prev, state: e.target.value }))
                                                }
                                                className="w-full bg-transparent text-sm font-medium text-gray-900 outline-none pt-1 pb-1.5"
                                            />
                                        </div>
                                    </div>

                                    {/* House Number/Tower/Block * */}
                                    <div className="relative border-b border-gray-300 focus-within:border-[#D26900] transition-colors pb-0.5">
                                        <label className="text-[11px] sm:text-xs text-gray-500 font-medium block">
                                            House Number/Tower/Block *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={addressForm.houseNo}
                                            onChange={(e) =>
                                                setAddressForm((prev) => ({ ...prev, houseNo: e.target.value }))
                                            }
                                            className="w-full bg-transparent text-sm font-medium text-gray-900 outline-none pt-1 pb-1.5"
                                        />
                                    </div>

                                    {/* Address (Building, Street, Area) * */}
                                    <div className="relative border-b border-gray-300 focus-within:border-[#D26900] transition-colors pb-0.5">
                                        <label className="text-[11px] sm:text-xs text-gray-500 font-medium block">
                                            Address (Building, Street, Area) *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={addressForm.street}
                                            onChange={(e) =>
                                                setAddressForm((prev) => ({ ...prev, street: e.target.value }))
                                            }
                                            className="w-full bg-transparent text-sm font-medium text-gray-900 outline-none pt-1 pb-1.5"
                                        />
                                    </div>

                                    {/* Locality/ Town * */}
                                    <div className="relative border-b border-gray-300 focus-within:border-[#D26900] transition-colors pb-0.5">
                                        <label className="text-[11px] sm:text-xs text-gray-500 font-medium block">
                                            Locality/ Town *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={addressForm.locality}
                                            onChange={(e) =>
                                                setAddressForm((prev) => ({ ...prev, locality: e.target.value }))
                                            }
                                            className="w-full bg-transparent text-sm font-medium text-gray-900 outline-none pt-1 pb-1.5"
                                        />
                                    </div>

                                    {/* City/ District * */}
                                    <div className="relative border-b border-gray-300 focus-within:border-[#D26900] transition-colors pb-0.5">
                                        <label className="text-[11px] sm:text-xs text-gray-500 font-medium block">
                                            City/ District *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={addressForm.city}
                                            onChange={(e) =>
                                                setAddressForm((prev) => ({ ...prev, city: e.target.value }))
                                            }
                                            className="w-full bg-transparent text-sm font-medium text-gray-900 outline-none pt-1 pb-1.5"
                                        />
                                    </div>
                                </div>

                                {/* Section Separator Band */}
                                <div className="-mx-6 sm:-mx-7 h-2.5 bg-[#F5F5F6] border-y border-gray-200/70 my-3.5" />

                                {/* Type of Address */}
                                <div className="space-y-4 pt-1">
                                    <div>
                                        <label className="text-[11px] sm:text-xs text-gray-500 font-medium block mb-2.5">
                                            Type of Address *
                                        </label>
                                        <div className="flex items-center gap-7">
                                            <CustomRadio
                                                name="addressType"
                                                label="Home"
                                                checked={addressForm.type === 'HOME'}
                                                onChange={() =>
                                                    setAddressForm((prev) => ({
                                                        ...prev,
                                                        type: 'HOME',
                                                        openOnSaturday: false,
                                                        openOnSunday: false,
                                                    }))
                                                }
                                            />
                                            <CustomRadio
                                                name="addressType"
                                                label="Office"
                                                checked={addressForm.type === 'OFFICE'}
                                                onChange={() =>
                                                    setAddressForm((prev) => ({ ...prev, type: 'OFFICE' }))
                                                }
                                            />
                                        </div>
                                    </div>

                                    {/* Weekend Delivery options (Shown when Office is selected, matching reference screenshot) */}
                                    {addressForm.type === 'OFFICE' && (
                                        <div className="space-y-2.5 pt-1 animate-in fade-in duration-150">
                                            <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
                                                Is your office open on weekends?
                                            </p>
                                            <div className="space-y-2 pl-0.5">
                                                <CustomCheckbox
                                                    id="openSaturday"
                                                    label="Open on Saturday"
                                                    checked={addressForm.openOnSaturday}
                                                    onChange={(val) =>
                                                        setAddressForm((prev) => ({
                                                            ...prev,
                                                            openOnSaturday: val,
                                                        }))
                                                    }
                                                />
                                                <CustomCheckbox
                                                    id="openSunday"
                                                    label="Open on Sunday"
                                                    checked={addressForm.openOnSunday}
                                                    onChange={(val) =>
                                                        setAddressForm((prev) => ({
                                                            ...prev,
                                                            openOnSunday: val,
                                                        }))
                                                    }
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Divider line before default address option matching screenshot */}
                                    <div className="border-t border-gray-200/80 pt-3">
                                        <CustomCheckbox
                                            id="makeDefault"
                                            label="Make this as my default address"
                                            checked={addressForm.isDefault}
                                            onChange={(val) =>
                                                setAddressForm((prev) => ({ ...prev, isDefault: val }))
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Modal Split Footer CTA (Matches Screenshot with Brand Orange CTA) */}
                            <div className="grid grid-cols-2 border-t border-gray-200 mt-auto shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setIsAddressModalOpen(false)}
                                    className="py-4 text-center font-bold text-xs uppercase tracking-wider text-gray-700 bg-white hover:bg-gray-50 transition-colors border-r border-gray-200 cursor-pointer"
                                >
                                    CANCEL
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="py-4 text-center font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-[#D26900] to-[#E65100] hover:from-[#B45309] hover:to-[#D26900] transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                                >
                                    {saving ? 'SAVING...' : 'SAVE'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
