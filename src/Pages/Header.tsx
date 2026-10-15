import { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import type { RootState, AppDispatch } from '../redux/store';
import { logoutUserAPI } from '../redux/slices/authSlice';
import { useHeaderNavigation, type HeaderItem } from '../Context/HeaderNavigationContext';

// Dynamic Header Category with Hover & Click Dropdown (Myntra Style, Flush with Header Bottom)
function HeaderCategoryDropdown({ item }: { item: HeaderItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasDropdown = Boolean(item.dropdown_items && item.dropdown_items.length > 0);

  // Group items by sub_heading if any exists
  const { hasSubHeadings, groups } = useMemo(() => {
    type DropdownGroup = {
      heading: string | null;
      layout: 'column' | 'row';
      items: NonNullable<HeaderItem['dropdown_items']>;
    };

    if (!item.dropdown_items || item.dropdown_items.length === 0) {
      return { hasSubHeadings: false, groups: [] as DropdownGroup[] };
    }
    const anySub = item.dropdown_items.some((sub) => Boolean(sub.sub_heading && sub.sub_heading.trim()));
    if (!anySub) {
      return {
        hasSubHeadings: false,
        groups: [{ heading: null, layout: 'column' as const, items: item.dropdown_items }],
      };
    }

    const map = new Map<string | null, NonNullable<HeaderItem['dropdown_items']>>();
    item.dropdown_items.forEach((sub) => {
      const heading = sub.sub_heading && sub.sub_heading.trim() ? sub.sub_heading.trim() : null;
      if (!map.has(heading)) {
        map.set(heading, []);
      }
      map.get(heading)!.push(sub);
    });

    const result: DropdownGroup[] = [];
    map.forEach((items, heading) => {
      const layout = items.some((i) => i.layout === 'row') ? 'row' : 'column';
      result.push({ heading, layout, items });
    });

    // Sort so named subheadings come first, non-subheading items come last
    result.sort((a, b) => {
      if (!a.heading) return 1;
      if (!b.heading) return -1;
      return 0;
    });

    return { hasSubHeadings: true, groups: result };
  }, [item.dropdown_items]);

  const hasRowGroup = useMemo(() => groups.some((g) => g.layout === 'row'), [groups]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="relative h-full flex items-center group shrink-0"
      onMouseEnter={() => hasDropdown && setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(false);
          navigate(item.path);
        }}
        className="h-full flex items-center px-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#111827] hover:text-[#D26900] transition-colors cursor-pointer select-none"
      >
        <span>{item.title}</span>
      </button>

      {/* Active Indicator Underline flush at header bottom (Myntra Style) */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-[3.5px] bg-[#D26900] transition-all duration-150 z-30 pointer-events-none ${isOpen ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
          }`}
      />

      {/* Sub-items Dropdown Menu: Attached directly flush to header bottom (No gap) */}
      {hasDropdown && (
        <div
          className={`absolute left-0 top-full ${
            hasSubHeadings && (groups.length > 1 || hasRowGroup)
              ? 'w-max min-w-[340px] max-w-[95vw]'
              : 'w-max min-w-[240px]'
          } z-[9999] transition-all duration-150 origin-top ${isOpen
              ? 'opacity-100 visible translate-y-0 pointer-events-auto'
              : 'opacity-0 invisible -translate-y-1 pointer-events-none'
            }`}
        >
          <div className="bg-white rounded-b-md shadow-[0_8px_20px_rgba(0,0,0,0.12)] border border-[#EAEAEC] border-t-0 p-4 sm:p-5 text-left">
            {hasSubHeadings ? (
              <div
                className={`grid ${
                  groups.length > 1 && !hasRowGroup
                    ? 'grid-cols-2 gap-x-8 gap-y-5'
                    : 'grid-cols-1 gap-5'
                }`}
              >
                {groups.map((group, idx) => (
                  <div key={idx} className="space-y-2 min-w-[150px]">
                    {group.heading ? (
                      <div className="border-b border-orange-100 pb-1.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D26900] shrink-0" />
                        <h4 className="text-[11px] sm:text-xs font-bold text-[#D26900] uppercase tracking-wider whitespace-nowrap">
                          {group.heading}
                        </h4>
                      </div>
                    ) : (
                      <div className="border-b border-gray-100 pb-1.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                        <h4 className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          General
                        </h4>
                      </div>
                    )}

                    {group.layout === 'row' ? (
                      /* Row-wise layout: horizontal flow of pills */
                      <div className="flex flex-wrap gap-2 pt-1 pb-1">
                        {group.items.map((sub) => (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsOpen(false);
                              navigate(sub.path);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FFF7ED] text-[#D26900] hover:bg-[#D26900] hover:text-white border border-[#FED7AA] hover:border-[#D26900] transition-all cursor-pointer shadow-2xs whitespace-nowrap leading-tight"
                          >
                            {sub.title}
                          </button>
                        ))}
                      </div>
                    ) : (
                      /* Column-wise layout: vertical list of items (stays strictly single row with whitespace-nowrap) */
                      <div className="space-y-1.5 text-[14px] text-[#282C3F]">
                        {group.items.map((sub) => (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsOpen(false);
                              navigate(sub.path);
                            }}
                            className="w-full text-left font-normal hover:font-bold hover:text-[#D26900] hover:translate-x-0.5 transition-all cursor-pointer block py-0.5 leading-normal whitespace-nowrap"
                          >
                            {sub.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2 text-[14px] text-[#282C3F]">
                {item.dropdown_items!.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                      navigate(sub.path);
                    }}
                    className="w-full text-left font-normal hover:font-bold hover:text-[#D26900] transition-all cursor-pointer block py-1 leading-normal whitespace-nowrap"
                  >
                    {sub.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Elegant Fallback Vector SVG Icon following Brand CTA (#D26900)
interface DefaultCtaIconProps {
  title: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const DefaultCtaItemIcon: React.FC<DefaultCtaIconProps> = ({
  title,
  size = 'lg',
  className = '',
}) => {
  const lower = (title || '').toLowerCase();

  // SVG size classes
  const svgSize =
    size === 'sm'
      ? 'w-5 h-5 sm:w-6 sm:h-6'
      : size === 'md'
      ? 'w-7 h-7 sm:w-8 sm:h-8'
      : 'w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10';

  // Keyword Matching for Product Types
  const isToyOrTeddy =
    lower.includes('toy') ||
    lower.includes('plush') ||
    lower.includes('giant') ||
    lower.includes('musical') ||
    (lower.includes('teddy') && !lower.includes('bag'));

  const isSling =
    lower.includes('sling') ||
    lower.includes('pouch') ||
    lower.includes('purse') ||
    lower.includes('crossbody');

  const isTrolley =
    lower.includes('trolley') ||
    lower.includes('trolly') ||
    lower.includes('luggage') ||
    lower.includes('travel') ||
    lower.includes('suitcase');

  // 1. Teddy Bear / Soft Toy SVG Icon in Brand CTA Colors
  if (isToyOrTeddy) {
    return (
      <svg
        className={`${svgSize} text-[#D26900] transition-transform duration-200 ${className}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* Left Ear */}
        <circle cx="6.5" cy="6.5" r="3" fill="#D26900" fillOpacity={0.16} />
        {/* Right Ear */}
        <circle cx="17.5" cy="6.5" r="3" fill="#D26900" fillOpacity={0.16} />
        {/* Main Head */}
        <circle cx="12" cy="13" r="7.5" fill="#D26900" fillOpacity={0.1} />
        {/* Snout Area */}
        <ellipse cx="12" cy="14.8" rx="3.4" ry="2.5" fill="#D26900" fillOpacity={0.25} />
        {/* Cute Triangular Nose */}
        <path d="M10.8 13.8h2.4l-1.2 1.2z" fill="#D26900" />
        {/* Smiling Mouth */}
        <path d="M12 15v1.2m-1.2 0a1.2 1.2 0 0 0 2.4 0" />
        {/* Eyes */}
        <circle cx="9.2" cy="11.5" r="1" fill="#D26900" />
        <circle cx="14.8" cy="11.5" r="1" fill="#D26900" />
      </svg>
    );
  }

  // 2. Sling / Pouch / Crossbody Bag SVG Icon
  if (isSling) {
    return (
      <svg
        className={`${svgSize} text-[#D26900] transition-transform duration-200 ${className}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* Shoulder Strap */}
        <path d="M5 4c4 1.5 12 5.5 14 10" strokeDasharray="2.5 2" />
        {/* Sling Bag Body */}
        <rect x="4.5" y="10" width="15" height="10.5" rx="3.5" fill="#D26900" fillOpacity={0.12} />
        {/* Flap */}
        <path d="M4.5 12.5l6.3 3.5a2.5 2.5 0 0 0 2.4 0l6.3-3.5" fill="#D26900" fillOpacity={0.2} />
        {/* Center Metal Lock / Button */}
        <circle cx="12" cy="16" r="1.2" fill="#D26900" />
      </svg>
    );
  }

  // 3. Trolley / Luggage Bag SVG Icon
  if (isTrolley) {
    return (
      <svg
        className={`${svgSize} text-[#D26900] transition-transform duration-200 ${className}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* Telescopic Handle */}
        <path d="M9 5V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        {/* Luggage Body */}
        <rect x="6" y="5" width="12" height="15" rx="2.5" fill="#D26900" fillOpacity={0.12} />
        {/* Ribbed Grooves */}
        <path d="M6 10h12M6 15h12" />
        {/* Wheels */}
        <circle cx="8.5" cy="21.5" r="1.5" fill="#D26900" />
        <circle cx="15.5" cy="21.5" r="1.5" fill="#D26900" />
      </svg>
    );
  }

  // 4. Default School Bag / Backpack SVG Icon (Brand CTA styled)
  return (
    <svg
      className={`${svgSize} text-[#D26900] transition-transform duration-200 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Top Handle Loop */}
      <path d="M9.5 6V4a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v2" />
      {/* Backpack Main Body */}
      <path
        d="M5 10c0-2.2 1.8-4 4-4h6c2.2 0 4 1.8 4 4v9a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-9z"
        fill="#D26900"
        fillOpacity={0.12}
      />
      {/* Front Zipper Compartment */}
      <path
        d="M7.5 13.5h9a1 1 0 0 1 1 1v4.5a2 2 0 0 1-2 2H8.5a2 2 0 0 1-2-2v-4.5a1 1 0 0 1 1-1z"
        fill="#D26900"
        fillOpacity={0.2}
      />
      {/* Pocket Zipper & Teddy/Brand Emblem */}
      <circle cx="12" cy="16.5" r="1.2" fill="#D26900" />
      {/* Side Strap Lines */}
      <path d="M7 8.5v3M17 8.5v3" />
    </svg>
  );
};

// Popular Searches for Mobile & Tablet Search Overlay (Matching Meesho Image 2)
const POPULAR_SEARCHES = [
  'Teddy Backpack',
  'School Bag',
  'Soft Toys',
  'Giant Teddy Bear',
  'Kindergarten Bag',
  'Plush Sling',
  'Musical Toys',
  'Kids Trolley',
  'Mini Pouch',
  'Backpack for Girls',
  'Plush Dolls',
  'Travel Bag',
];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { items: wishlistItems } = useSelector((state: RootState) => state.wishlist);
  const { items: cartItems } = useSelector((state: RootState) => state.cart);
  const { headerItems } = useHeaderNavigation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileAccountOpen, setIsMobileAccountOpen] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState('');
  const [selectedMobileCategoryId, setSelectedMobileCategoryId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [failedImageUrls, setFailedImageUrls] = useState<Record<string, boolean>>({});
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const sidebarItemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const isManualScrollRef = useRef<boolean>(false);

  // User Profile Name & Initial Resolution (Checks Redux user, localStorage profile, and email fallback)
  const effectiveProfileName = useMemo(() => {
    if (!isAuthenticated) return '';

    // 1. Redux user name
    if (user?.name && typeof user.name === 'string' && user.name.trim() !== '') {
      return user.name.trim();
    }

    // 2. LocalStorage cached profile (from AccountContext)
    try {
      const cached = localStorage.getItem('yteddy_account_profile');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.name && typeof parsed.name === 'string' && parsed.name.trim() !== '') {
          return parsed.name.trim();
        }
      }
    } catch {}

    // 3. LocalStorage user
    try {
      const cachedUser = localStorage.getItem('user');
      if (cachedUser) {
        const parsed = JSON.parse(cachedUser);
        if (parsed?.name && typeof parsed.name === 'string' && parsed.name.trim() !== '') {
          return parsed.name.trim();
        }
        if (parsed?.email && typeof parsed.email === 'string') {
          const prefix = parsed.email.split('@')[0];
          if (prefix) return prefix;
        }
      }
    } catch {}

    // 4. Redux user email fallback
    if (user?.email && typeof user.email === 'string') {
      const prefix = user.email.split('@')[0];
      if (prefix) return prefix;
    }

    return '';
  }, [isAuthenticated, user]);

  const userInitial = effectiveProfileName ? effectiveProfileName.charAt(0).toUpperCase() : '';

  const handleImageError = (id: string) => {
    setFailedImageUrls((prev) => ({ ...prev, [id]: true }));
  };

  const isLoginPage = location.pathname.startsWith('/login');

  // Auto-select first category if none selected
  useEffect(() => {
    if (headerItems.length > 0 && !selectedMobileCategoryId) {
      setSelectedMobileCategoryId(headerItems[0].id);
    }
  }, [headerItems, selectedMobileCategoryId]);

  const selectedCategory = useMemo(() => {
    return headerItems.find((h) => h.id === selectedMobileCategoryId) || headerItems[0];
  }, [headerItems, selectedMobileCategoryId]);

  // Lock body scroll when mobile drawer, search, or account sheet is open
  useEffect(() => {
    if (isMobileDrawerOpen || isMobileSearchOpen || isMobileAccountOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileDrawerOpen, isMobileSearchOpen, isMobileAccountOpen]);

  // Focus search input when search overlay opens
  useEffect(() => {
    if (isMobileSearchOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [isMobileSearchOpen]);

  // Handle clicking category tab in left sidebar (smooth scroll right pane to that section)
  const handleCategoryTabClick = (catId: string) => {
    setSelectedMobileCategoryId(catId);
    isManualScrollRef.current = true;
    const targetSection = sectionRefs.current[catId];
    if (targetSection && rightPaneRef.current) {
      const paneTop = rightPaneRef.current.getBoundingClientRect().top;
      const secTop = targetSection.getBoundingClientRect().top;
      const currentScroll = rightPaneRef.current.scrollTop;
      const targetScroll = currentScroll + (secTop - paneTop);
      rightPaneRef.current.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: 'smooth',
      });
    }
    setTimeout(() => {
      isManualScrollRef.current = false;
    }, 700);
  };

  // Handle scrolling right pane (automatically update active category tab on left sidebar)
  const handleRightPaneScroll = () => {
    if (isManualScrollRef.current || !rightPaneRef.current || headerItems.length === 0) return;
    const pane = rightPaneRef.current;
    const paneRect = pane.getBoundingClientRect();

    // 1. If user scrolled to or near the bottom of the container, activate the last category
    const isAtBottom = pane.scrollTop + pane.clientHeight >= pane.scrollHeight - 35;
    if (isAtBottom) {
      const lastCat = headerItems[headerItems.length - 1];
      if (lastCat && lastCat.id !== selectedMobileCategoryId) {
        setSelectedMobileCategoryId(lastCat.id);
        sidebarItemRefs.current[lastCat.id]?.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
      return;
    }

    // 2. Otherwise determine active category based on section position relative to trigger line
    const triggerOffset = paneRect.top + Math.min(180, pane.clientHeight * 0.35);
    let activeCatId = headerItems[0]?.id || '';

    for (const cat of headerItems) {
      const section = sectionRefs.current[cat.id];
      if (section) {
        const secRect = section.getBoundingClientRect();
        // If top of this section reached or passed above the trigger line, activate it
        if (secRect.top <= triggerOffset) {
          activeCatId = cat.id;
        }
      }
    }

    if (activeCatId && activeCatId !== selectedMobileCategoryId) {
      setSelectedMobileCategoryId(activeCatId);
      sidebarItemRefs.current[activeCatId]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  };

  const handleMobileAccountAction = (path: string) => {
    setIsMobileAccountOpen(false);
    setIsMobileDrawerOpen(false);
    if (!isAuthenticated && path !== '/contact' && path !== '/login' && path !== '/gift-cards') {
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  const handleMobileAccountLogout = async () => {
    await dispatch(logoutUserAPI());
    setIsMobileAccountOpen(false);
    setIsMobileDrawerOpen(false);
    navigate('/login');
  };

  // Close dropdown on click outside (especially on mobile/touch screens)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutUserAPI());
    setIsDropdownOpen(false);
    navigate('/login');
  };

  const handleProtectedAction = (path: string) => {
    setIsDropdownOpen(false);
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  const handleProfileClick = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  return (
    <header className="w-full bg-white shadow-xs sticky top-0 left-0 right-0 z-[100] border-b border-[#F3F4F6] shrink-0">
      <div className="w-full px-3 sm:px-6 md:px-12 lg:px-16 h-14 sm:h-16 flex items-center justify-between">
        {/* Left Side: Brand Logo + Dynamic Header Navigation beside logo */}
        <div className="flex items-center space-x-2 sm:space-x-8 h-full">
          {!isLoginPage && (
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="lg:hidden p-1.5 -ml-1 text-gray-700 hover:text-[#D26900] rounded-md transition-colors cursor-pointer"
              aria-label="Open category menu"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          <Link
            to="/"
            className="text-lg sm:text-xl font-bold text-[#D26900] tracking-tight shrink-0 hover:opacity-95 transition-opacity"
          >
            YTeddybags
          </Link>

          {/* Dynamic Header Items from Database/Context API (Desktop only >= 1024px) */}
          <div className="hidden lg:flex items-center space-x-1 lg:space-x-3 h-full">
            {headerItems.map((item) => (
              <HeaderCategoryDropdown key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Search Box for Desktop (>= 1024px) */}
        {!isLoginPage && (
          <div className="hidden lg:flex flex-1 max-w-xs md:max-w-sm lg:max-w-md xl:max-w-[480px] mx-3 sm:mx-4 md:mx-6 lg:mx-8 items-center justify-end">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#696e79]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands and more"
                className="w-full h-10 pl-11 pr-4 text-sm text-[#282c3f] bg-[#f5f5f6] hover:bg-white focus:bg-white placeholder:text-[#696e79] placeholder:text-[13px] sm:placeholder:text-sm rounded-[4px] border border-[#eaeaec] focus:border-[#d4d5d9] outline-none transition-colors"
              />
            </div>
          </div>
        )}

        {/* Right Side: Action Icons (Profile, Wishlist, Cart) */}
        <nav className="flex items-center space-x-1 sm:space-x-4 md:space-x-6 h-full shrink-0">
          {/* Profile Dropdown Container with Active CTA Underline (Desktop only >= 1024px; on Mobile/Tab it is in Sidebar) */}
          {!isLoginPage && (
            <div
              ref={dropdownRef}
              className="hidden lg:flex relative h-full items-center"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
            {/* Profile Trigger */}
            <button
              onClick={handleProfileClick}
              className="h-full flex flex-col items-center justify-center px-1.5 sm:px-2.5 text-[#111827] hover:text-[#D26900] transition-colors cursor-pointer group"
              aria-label="Profile Menu"
              aria-expanded={isDropdownOpen}
            >
              {isAuthenticated && userInitial ? (
                <div className="w-5 h-5 rounded-full bg-[#D26900] text-white flex items-center justify-center text-[10px] font-bold">
                  {userInitial}
                </div>
              ) : (
                <svg
                  className="w-5 h-5 text-[#111827] group-hover:text-[#D26900] transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              )}
              <span className="text-[10px] sm:text-[11px] font-medium tracking-tight mt-0.5">
                {isAuthenticated && effectiveProfileName ? effectiveProfileName.split(' ')[0] : 'Profile'}
              </span>
            </button>

            {/* Active CTA Underline matching user image when dropdown is open */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-[3.5px] bg-[#D26900] transition-all duration-150 z-30 pointer-events-none ${isDropdownOpen ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                }`}
            />

            {/* Responsive Dropdown Menu: Centered directly below Profile (Myntra Style) */}
            <div
              className={`absolute left-1/2 -translate-x-1/2 top-full w-68 max-w-[calc(100vw-1.5rem)] z-50 transition-all duration-200 ease-out origin-top ${
                isDropdownOpen
                  ? 'opacity-100 visible translate-y-0 pointer-events-auto'
                  : 'opacity-0 invisible -translate-y-2 pointer-events-none'
              }`}
            >
              <div className="bg-white rounded-b-md shadow-[0_8px_20px_rgba(0,0,0,0.12)] border border-[#EAEAEC] border-t-0 p-5 text-left">
                {isAuthenticated ? (
                  <>
                    <div className="mb-3">
                      <p className="text-sm font-bold text-[#282C3F] leading-tight">
                        Hello, {effectiveProfileName || 'Customer'}
                      </p>
                      <p className="text-xs text-[#535766] truncate mt-0.5">{user?.email}</p>
                    </div>

                    <div className="border-t border-[#EAEAEC] my-3" />

                    <div className="space-y-2 text-[14px] text-[#282C3F]">
                      <button
                        onClick={() => handleProtectedAction('/account')}
                        className="w-full text-left hover:font-bold hover:text-[#D26900] transition-all cursor-pointer py-0.5 block"
                      >
                        My Account
                      </button>
                      <button
                        onClick={() => handleProtectedAction('/orders')}
                        className="w-full text-left hover:font-bold hover:text-[#D26900] transition-all cursor-pointer py-0.5 block"
                      >
                        Orders
                      </button>
                      <button
                        onClick={() => handleProtectedAction('/wishlist')}
                        className="w-full text-left hover:font-bold hover:text-[#D26900] transition-all cursor-pointer py-0.5 block"
                      >
                        Wishlist
                      </button>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate('/contact');
                        }}
                        className="w-full text-left hover:font-bold hover:text-[#D26900] transition-all cursor-pointer py-0.5 block"
                      >
                        Contact Us
                      </button>
                    </div>

                    <div className="border-t border-[#EAEAEC] my-3" />

                    <button
                      onClick={handleLogout}
                      className="w-full text-left text-sm font-semibold text-red-600 hover:text-red-700 transition-colors cursor-pointer py-1 block"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    {/* Unauthenticated View matching Myntra Screenshot */}
                    <p className="text-sm sm:text-base font-bold text-[#282C3F] leading-tight">Welcome</p>
                    <p className="text-xs text-[#535766] mt-1 mb-3.5 leading-relaxed">
                      To access account and manage orders
                    </p>

                    <button
                      onClick={() => handleProtectedAction('/login')}
                      className="inline-block py-2 px-4 border border-[#EAEAEC] hover:border-[#D26900] text-[#D26900] font-bold text-xs tracking-wider rounded-xs transition-colors text-center cursor-pointer uppercase shadow-2xs mb-3.5"
                    >
                      LOGIN / SIGNUP
                    </button>

                    <div className="border-t border-[#EAEAEC] my-3" />

                    <div className="space-y-2 text-[14px] text-[#282C3F]">
                      <button
                        onClick={() => handleProtectedAction('/orders')}
                        className="w-full text-left hover:font-bold hover:text-[#D26900] transition-all cursor-pointer py-0.5 block"
                      >
                        Orders
                      </button>
                      <button
                        onClick={() => handleProtectedAction('/wishlist')}
                        className="w-full text-left hover:font-bold hover:text-[#D26900] transition-all cursor-pointer py-0.5 block"
                      >
                        Wishlist
                      </button>
                      <button
                        onClick={() => handleProtectedAction('/gift-cards')}
                        className="w-full text-left hover:font-bold hover:text-[#D26900] transition-all cursor-pointer py-0.5 block"
                      >
                        Gift Cards
                      </button>
                      <button
                        onClick={() => handleProtectedAction('/contact')}
                        className="w-full text-left hover:font-bold hover:text-[#D26900] transition-all cursor-pointer py-0.5 block"
                      >
                        Contact Us
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

          {/* Mobile & Tablet Search Trigger Button (< 1024px) */}
          {!isLoginPage && (
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(true)}
              className="lg:hidden h-full flex flex-col items-center justify-center px-1.5 sm:px-2.5 text-[#111827] hover:text-[#D26900] transition-colors cursor-pointer group"
              aria-label="Open Search"
            >
              <svg
                className="w-5 h-5 text-[#111827] group-hover:text-[#D26900] transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span className="text-[10px] sm:text-[11px] font-medium tracking-tight mt-0.5">Search</span>
            </button>
          )}

          {/* Wishlist Button */}
          <Link
            to="/wishlist"
            className="h-full flex flex-col items-center justify-center px-1.5 sm:px-2.5 text-[#111827] hover:text-[#D26900] transition-colors cursor-pointer group relative"
          >
            <div className="relative">
              <svg
                className="w-5 h-5 text-[#111827] group-hover:text-[#D26900] transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {wishlistItems && wishlistItems.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#D26900] text-white text-[9px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center shadow-xs">
                  {wishlistItems.length}
                </span>
              )}
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium tracking-tight mt-0.5">Wishlist</span>
          </Link>

          {/* Cart Button */}
          <Link
            to="/cart"
            className="h-full flex flex-col items-center justify-center px-1.5 sm:px-2.5 text-[#111827] hover:text-[#D26900] transition-colors cursor-pointer group relative"
          >
            <div className="relative">
              <svg
                className="w-5 h-5 text-[#111827] group-hover:text-[#D26900] transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {cartItems && cartItems.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#D26900] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {cartItems.length}
                </span>
              )}
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium tracking-tight mt-0.5">Cart</span>
          </Link>
        </nav>
      </div>

      {/* Mobile & Tablet Drawer (Meesho Style - Category Sidebar & Continuous Synchronized Sub-items) */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-[99999] flex lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="fixed inset-0 bg-black/50"
            />

            {/* Full-Screen Drawer Container (No right gap!) */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
              className="relative w-full h-full bg-white flex flex-col z-10 overflow-hidden"
            >
              {/* Drawer Top Header matching Meesho Image 1 (No MENU text) */}
              <div className="h-14 px-4 border-b border-gray-200 flex items-center gap-3.5 bg-white shrink-0">
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1 -ml-1 text-gray-700 hover:text-black cursor-pointer"
                  aria-label="Close menu"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <span className="text-xl font-black text-[#D26900] tracking-tight">
                  YTeddybags
                </span>
              </div>

              {/* 2-Column Split: Left Category Sidebar (Flush, no top gap), Right Continuous Subcategory Grid */}
              <div className="flex-1 flex overflow-hidden">
                {/* Left Column: Category Tabs (Top) + Pinned Account Button (Bottom) */}
                <div className="w-[88px] sm:w-[104px] md:w-[120px] shrink-0 bg-[#F4F5F7] flex flex-col justify-between border-r border-gray-100 h-full overflow-hidden">
                  {/* Category Tabs Scroll Area */}
                  <div className="flex-1 overflow-y-auto pt-0 pb-2 no-scrollbar">
                    {headerItems.map((cat) => {
                      const isSelected = selectedCategory?.id === cat.id;
                      return (
                        <button
                          key={cat.id}
                          ref={(el) => {
                            sidebarItemRefs.current[cat.id] = el;
                          }}
                          type="button"
                          onClick={() => handleCategoryTabClick(cat.id)}
                          className={`w-full py-2.5 sm:py-3 px-1 transition-all relative flex flex-col items-center justify-center text-center cursor-pointer ${
                            isSelected
                              ? 'bg-white text-[#D26900] font-bold border-l-4 border-[#D26900]'
                              : 'text-gray-600 hover:text-gray-900 border-l-4 border-transparent font-medium hover:bg-gray-100/60'
                          }`}
                        >
                          {/* Category Circular Thumbnail / Icon */}
                          <div
                            className={`w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-full overflow-hidden flex items-center justify-center shrink-0 mx-auto transition-transform ${
                              isSelected
                                ? 'bg-gradient-to-br from-[#FFF5ED] to-[#FFE2CD] border-2 border-[#D26900] shadow-xs'
                                : cat.image_url && !failedImageUrls[cat.id]
                                ? 'bg-white border border-gray-200/70'
                                : 'bg-gradient-to-br from-[#FFFBF7] to-[#FFF1E6] border border-[#FED7AA]/80'
                            }`}
                          >
                            {cat.image_url && !failedImageUrls[cat.id] ? (
                              <img
                                src={cat.image_url}
                                alt={cat.title}
                                className="w-full h-full object-cover"
                                onError={() => handleImageError(cat.id)}
                              />
                            ) : (
                              <DefaultCtaItemIcon title={cat.title} size="sm" />
                            )}
                          </div>

                          {/* Category Title below icon */}
                          <span className="text-[10px] sm:text-[11px] md:text-xs leading-tight line-clamp-2 mt-1 px-1">
                            {cat.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Pinned Profile Button at Bottom of Sidebar */}
                  <div className="shrink-0 p-1 sm:p-1.5 border-t border-gray-200/90 bg-[#ECEEF2]/70">
                    <button
                      type="button"
                      onClick={() => setIsMobileAccountOpen(true)}
                      className="w-full py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white active:scale-95 group shadow-2xs"
                      title="Profile"
                      aria-label="Profile"
                    >
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-[#FFF5ED] to-[#FFE2CD] border border-[#FED7AA] group-hover:border-[#D26900] flex items-center justify-center shrink-0 transition-all shadow-2xs">
                        {isAuthenticated && userInitial ? (
                          <span className="text-base sm:text-lg font-black text-[#D26900] select-none leading-none">
                            {userInitial}
                          </span>
                        ) : (
                          <svg className="w-5 h-5 text-[#D26900]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-bold text-gray-700 group-hover:text-[#D26900] transition-colors mt-0.5 truncate max-w-full px-0.5">
                        Profile
                      </span>
                    </button>
                  </div>
                </div>

                {/* Right Column: Continuous Scroll of all categories & sub-items */}
                <div
                  ref={rightPaneRef}
                  onScroll={handleRightPaneScroll}
                  className="flex-1 bg-white overflow-y-auto p-3.5 sm:p-5 md:p-6 no-scrollbar scroll-smooth"
                >
                  {headerItems.map((cat) => {
                    // Group dropdown items of this category by sub_heading
                    const groupsMap = new Map<string | null, typeof cat.dropdown_items>();
                    (cat.dropdown_items || []).forEach((sub) => {
                      const heading = sub.sub_heading && sub.sub_heading.trim() ? sub.sub_heading.trim() : null;
                      if (!groupsMap.has(heading)) groupsMap.set(heading, []);
                      groupsMap.get(heading)!.push(sub);
                    });

                    const catGroups: { heading: string | null; items: typeof cat.dropdown_items }[] = [];
                    groupsMap.forEach((items, heading) => {
                      catGroups.push({ heading, items });
                    });
                    catGroups.sort((a, b) => {
                      if (!a.heading) return 1;
                      if (!b.heading) return -1;
                      return 0;
                    });

                    return (
                      <div
                        key={cat.id}
                        id={`category-section-${cat.id}`}
                        ref={(el) => {
                          sectionRefs.current[cat.id] = el;
                        }}
                        className="pb-7 last:pb-[50vh]"
                      >
                        {/* Category Header */}
                        <div className="flex items-center justify-between pb-2 mb-3.5 sm:mb-4 border-b border-gray-100">
                          <h3 className="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider">
                            {cat.title}
                          </h3>
                          <button
                            type="button"
                            onClick={() => {
                              setIsMobileDrawerOpen(false);
                              navigate(cat.path);
                            }}
                            className="text-[11px] sm:text-xs font-bold text-[#D26900] hover:underline cursor-pointer"
                          >
                            View All →
                          </button>
                        </div>

                        {/* Sub-item groups matching Meesho Image 1 */}
                        {catGroups.length > 0 ? (
                          catGroups.map((group, gIdx) => (
                            <div key={gIdx} className="mb-5 sm:mb-6">
                              {group.heading && (
                                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                  <span className="text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    {group.heading}
                                  </span>
                                  <div className="flex-1 h-[1px] bg-gray-100" />
                                </div>
                              )}

                              {/* 3-Column Grid on Mobile, 4-5 Column on Tablet */}
                              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-x-2 sm:gap-x-4 md:gap-x-6 gap-y-4 sm:gap-y-6 md:gap-y-7">
                                {(group.items || []).map((sub) => (
                                  <button
                                    key={sub.id}
                                    type="button"
                                    onClick={() => {
                                      setIsMobileDrawerOpen(false);
                                      navigate(sub.path);
                                    }}
                                    className="flex flex-col items-center text-center p-0.5 group cursor-pointer"
                                  >
                                    {/* Sub-item Clean Circle with Brand CTA Fallback */}
                                    <div
                                      className={`w-16 h-16 sm:w-20 sm:h-20 md:w-22 md:h-22 rounded-full overflow-hidden flex items-center justify-center shrink-0 mb-1.5 transition-all duration-200 mx-auto ${
                                        sub.image_url && !failedImageUrls[sub.id]
                                          ? 'bg-[#F9FAFB] border border-gray-200/70 shadow-2xs group-hover:scale-105'
                                          : 'bg-gradient-to-br from-[#FFF9F5] via-[#FFF3EB] to-[#FEE7D8] border border-[#FED7AA]/90 shadow-[0_2px_8px_rgba(210,105,0,0.08)] group-hover:shadow-[0_4px_14px_rgba(210,105,0,0.18)] group-hover:border-[#D26900]/40 group-hover:scale-105'
                                      }`}
                                    >
                                      {sub.image_url && !failedImageUrls[sub.id] ? (
                                        <img
                                          src={sub.image_url}
                                          alt={sub.title}
                                          className="w-full h-full object-cover"
                                          onError={() => handleImageError(sub.id)}
                                        />
                                      ) : (
                                        <DefaultCtaItemIcon title={sub.title} size="lg" />
                                      )}
                                    </div>

                                    {/* Sub-item Title styled cleanly */}
                                    <span className="text-[11px] sm:text-xs font-medium text-gray-700 group-hover:text-[#D26900] line-clamp-2 leading-tight transition-colors px-0.5">
                                      {sub.title}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-orange-50/70 text-[#D26900] flex items-center justify-center mx-auto mb-2 border border-orange-200/50">
                              <DefaultCtaItemIcon title={cat.title} size="sm" />
                            </div>
                            <p className="text-xs text-gray-500 font-medium">Coming soon in this category</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Account Bottom Sheet / Drawer */}
      <AnimatePresence>
        {isMobileAccountOpen && (
          <div className="fixed inset-0 z-[100000] flex items-end sm:items-center justify-center lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsMobileAccountOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-[2px]"
            />

            {/* Sheet Container */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl z-10 max-h-[85vh] flex flex-col overflow-hidden"
            >
              {/* Drag handle pill on mobile */}
              <div className="pt-3 pb-1 flex justify-center sm:hidden">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>

              {/* Sheet Header */}
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-orange-100/80 text-[#D26900] flex items-center justify-center font-bold text-sm shadow-2xs">
                    {isAuthenticated && userInitial ? (
                      userInitial
                    ) : (
                      <svg className="w-5 h-5 text-[#D26900]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 leading-tight">
                      {isAuthenticated ? (effectiveProfileName || 'My Profile') : 'Welcome to YTeddybags'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {isAuthenticated ? (user?.email || 'Logged In') : 'Sign in to access your orders & wishlist'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileAccountOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Sheet Body */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 no-scrollbar">
                {!isAuthenticated && (
                  <div className="bg-gradient-to-r from-orange-50/80 to-[#FFF7ED] p-3.5 rounded-xl border border-orange-100 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-800">New or returning user?</p>
                      <p className="text-[11px] text-gray-500">Manage orders, wishlist & profile</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleMobileAccountAction('/login')}
                      className="px-4 py-2 bg-[#D26900] hover:bg-[#b85b00] text-white text-xs font-bold rounded-lg shadow-sm hover:shadow transition-all cursor-pointer whitespace-nowrap active:scale-95"
                    >
                      LOGIN / SIGN UP
                    </button>
                  </div>
                )}

                {/* Action List items */}
                <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white overflow-hidden shadow-2xs">
                  {isAuthenticated && (
                    <button
                      type="button"
                      onClick={() => handleMobileAccountAction('/account')}
                      className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50/80 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#D26900] flex items-center justify-center group-hover:bg-[#D26900] group-hover:text-white transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-800 group-hover:text-[#D26900] transition-colors block">
                            My Profile
                          </span>
                          <span className="text-[11px] text-gray-400 block">Personal info, profile settings</span>
                        </div>
                      </div>
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-[#D26900] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleMobileAccountAction('/orders')}
                    className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50/80 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#D26900] flex items-center justify-center group-hover:bg-[#D26900] group-hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-800 group-hover:text-[#D26900] transition-colors block">
                          My Orders
                        </span>
                        <span className="text-[11px] text-gray-400 block">Track shipments, history & returns</span>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-[#D26900] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMobileAccountAction('/wishlist')}
                    className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50/80 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#D26900] flex items-center justify-center group-hover:bg-[#D26900] group-hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-800 group-hover:text-[#D26900] transition-colors block">
                          Wishlist
                        </span>
                        <span className="text-[11px] text-gray-400 block">Your favorite saved items</span>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-[#D26900] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMobileAccountAction('/gift-cards')}
                    className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50/80 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#D26900] flex items-center justify-center group-hover:bg-[#D26900] group-hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V4a2 2 0 112 2h-2zm0 0V4a2 2 0 10-2 2h2zm-7 4h14a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1v-7a1 1 0 011-1z" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-800 group-hover:text-[#D26900] transition-colors block">
                          Gift Cards
                        </span>
                        <span className="text-[11px] text-gray-400 block">Buy, redeem & balance check</span>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-[#D26900] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMobileAccountAction('/contact')}
                    className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50/80 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#D26900] flex items-center justify-center group-hover:bg-[#D26900] group-hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-800 group-hover:text-[#D26900] transition-colors block">
                          Contact Us & Help
                        </span>
                        <span className="text-[11px] text-gray-400 block">Customer support, FAQs</span>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-[#D26900] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Logout Button if authenticated */}
                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={handleMobileAccountLogout}
                    className="w-full py-3 px-4 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    LOGOUT FROM ACCOUNT
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile & Tablet Search Overlay (Meesho /sitesearch Style - Image 2) */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed inset-0 z-[999999] bg-white flex flex-col lg:hidden overflow-hidden"
          >
            {/* Top Search Bar (Back Arrow < + Rounded Search Input Box) */}
            <div className="h-14 px-3 sm:px-4 border-b border-gray-100 flex items-center gap-2.5 bg-white shrink-0 shadow-2xs">
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(false)}
                className="p-1.5 -ml-1 text-gray-700 hover:text-[#D26900] transition-colors cursor-pointer"
                aria-label="Back"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchInputValue.trim()) {
                    navigate(`/?search=${encodeURIComponent(searchInputValue.trim())}`);
                    setIsMobileSearchOpen(false);
                  }
                }}
                className="flex-1 relative"
              >
                <div className="relative w-full">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchInputValue}
                    onChange={(e) => setSearchInputValue(e.target.value)}
                    placeholder="Search by Keyword or Product ID"
                    className="w-full h-10 pl-9.5 pr-8 text-xs sm:text-sm text-gray-800 bg-[#F5F6F8] rounded-lg border border-gray-200/80 focus:bg-white focus:border-[#D26900] focus:ring-1 focus:ring-[#D26900]/25 outline-none transition-all placeholder:text-gray-400"
                  />
                  {searchInputValue && (
                    <button
                      type="button"
                      onClick={() => setSearchInputValue('')}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                      title="Clear search"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Body Content: Popular Searches (Pills matching Meesho Image 2) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white no-scrollbar">
              <div className="mb-4">
                <h3 className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider mb-3">
                  Popular Searches
                </h3>
                <div className="flex flex-wrap gap-2 sm:gap-2.5">
                  {POPULAR_SEARCHES.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        navigate(`/?search=${encodeURIComponent(tag)}`);
                        setIsMobileSearchOpen(false);
                      }}
                      className="px-3.5 py-1.5 rounded-full text-xs font-medium text-gray-700 bg-white hover:bg-[#FFF7ED] hover:text-[#D26900] border border-gray-200 hover:border-[#FED7AA] transition-all shadow-2xs cursor-pointer active:scale-95"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
