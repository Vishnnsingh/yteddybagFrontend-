import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import type { RootState } from '../../redux/store';
import type { ProductItem } from '../../redux/slices/productSlice';
import { usePublicProductsQuery, productKeys } from '../../hooks/useProductsQuery';
import { useQueryClient } from '@tanstack/react-query';
import { useHeaderNavigation } from '../../Context/HeaderNavigationContext';
import ProductCard from '../../Components/ProductCard';
import PageLoader from '../../Components/PageLoader';
import apiClient from '../../Utils/apiClient';

export function toTitleCase(str?: string | null): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Popularity' },
  { value: 'price_low', label: 'Price -- Low to High' },
  { value: 'price_high', label: 'Price -- High to Low' },
  { value: 'rating', label: 'Customer Rating' },
  { value: 'discount', label: 'Better Discount' },
  { value: 'newest', label: 'Newest First' },
];

export default function ProductsPage() {
  const { headerSlug, dropdownSlug } = useParams<{
    headerSlug?: string;
    dropdownSlug?: string;
  }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const { products: reduxProducts, loading: isReduxLoading } = useSelector(
    (state: RootState) => state.products
  );
  const { headerItems } = useHeaderNavigation();

  // TanStack Query Integration for reactive products fetching & caching
  const queryClient = useQueryClient();
  const { data: queryProducts, isLoading: isQueryLoading } = usePublicProductsQuery();

  // Reactive listener: Socket.io triggers selective background query reconciliation for active filters
  const [, setCatalogVersion] = useState(0);
  useEffect(() => {
    const handleCatalogUpdate = () => {
      setCatalogVersion((v) => v + 1);
      // Selectively reconcile active query in background so filters/sorting stay 100% accurate
      queryClient.invalidateQueries({ queryKey: productKeys.all, refetchType: 'active' });
    };

    window.addEventListener('product_catalog_updated', handleCatalogUpdate);

    return () => {
      window.removeEventListener('product_catalog_updated', handleCatalogUpdate);
    };
  }, [queryClient]);

  // Merge TanStack Query data with Redux products (prioritizing TanStack fresh cache)
  const products: ProductItem[] = useMemo(() => {
    if (Array.isArray(queryProducts) && queryProducts.length > 0) {
      return queryProducts;
    }
    if (Array.isArray(reduxProducts) && reduxProducts.length > 0) {
      return reduxProducts;
    }
    return [];
  }, [queryProducts, reduxProducts]);

  const loading = (isQueryLoading || isReduxLoading) && products.length === 0;

  // Filter & Custom Sort States
  const [sortOption, setSortOption] = useState<string>(searchParams.get('sort') || 'recommended');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('search') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [selectedDiscount, setSelectedDiscount] = useState<number | null>(null);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState<'categories' | 'price' | 'discount' | 'color'>('categories');

  // Prevent background scroll when mobile filter drawer or sort bottom sheet is open
  useEffect(() => {
    if (mobileFilterOpen || mobileSortOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileFilterOpen, mobileSortOpen]);

  // Handler to set sort option, sync URL params, and reset to page 1
  const handleSelectSort = (value: string) => {
    setSortOption(value);
    setSortDropdownOpen(false);
    setMobileSortOpen(false);
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);
      if (value === 'recommended') {
        nextParams.delete('sort');
      } else {
        nextParams.set('sort', value);
      }
      nextParams.set('page', '1');
      return nextParams;
    });
  };

  // Close custom sort dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setSortDropdownOpen(false);
      }
    }
    if (sortDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sortDropdownOpen]);


  // Identify matching Header and Dropdown metadata from URL slugs
  const categoryMeta = useMemo(() => {
    const s1 = (headerSlug || '').toLowerCase().trim();
    const s2 = (dropdownSlug || '').toLowerCase().trim();

    if (!s1 && !s2) {
      return {
        title: 'All Products & Collections',
        breadcrumbs: ['All Collections'],
        targetHeaderId: null,
        targetDropdownId: null,
        isSpecial: true,
      };
    }

    // 1. Check if s1 or s2 matches a Dropdown Sub-Category
    for (const h of headerItems) {
      if (Array.isArray(h.dropdown_items)) {
        for (const d of h.dropdown_items) {
          const dSlug = d.path.toLowerCase().replace(/^\/category\//, '').replace(/^\//, '');
          const dTitleSlug = d.title.toLowerCase().replace(/[\s/]+/g, '-');
          const dRawTitle = d.title.toLowerCase();

          // If s2 matches or if only s1 is provided and s1 matches the dropdown item
          if (
            (s2 && (d.id === s2 || dSlug === s2 || dTitleSlug === s2 || dRawTitle === s2)) ||
            (!s2 && (d.id === s1 || dSlug === s1 || dTitleSlug === s1 || dRawTitle === s1))
          ) {
            return {
              title: d.title,
              breadcrumbs: [h.title, d.title],
              targetHeaderId: h.id,
              targetDropdownId: d.id,
              headerTitle: h.title,
              dropdownTitle: d.title,
              isSpecial: false,
            };
          }
        }
      }
    }

    // 2. Check if s1 matches a Main Header Category
    for (const h of headerItems) {
      const hSlug = h.path.toLowerCase().replace(/^\/category\//, '').replace(/^\//, '');
      const hTitleSlug = h.title.toLowerCase().replace(/[\s/]+/g, '-');
      const hRawTitle = h.title.toLowerCase();

      if (h.id === s1 || hSlug === s1 || hTitleSlug === s1 || hRawTitle === s1) {
        return {
          title: h.title,
          breadcrumbs: [h.title],
          targetHeaderId: h.id,
          targetDropdownId: null,
          headerTitle: h.title,
          dropdownTitle: null,
          dropdownIds: (h.dropdown_items || []).map((d) => d.id),
          isSpecial: false,
        };
      }
    }

    // 3. Special Slugs (bestsellers, trending, new-arrivals, etc.)
    if (s1 === 'bestsellers' || s1 === 'bestseller') {
      return {
        title: 'Bestsellers Collection',
        breadcrumbs: ['Bestsellers'],
        targetHeaderId: null,
        targetDropdownId: null,
        badgeFilter: 'bestseller',
        isSpecial: true,
      };
    }
    if (s1 === 'trending' || s1 === 'hot-deals') {
      return {
        title: 'Trending Companions',
        breadcrumbs: ['Trending'],
        targetHeaderId: null,
        targetDropdownId: null,
        badgeFilter: 'trending',
        isSpecial: true,
      };
    }

    // Generic fallback for any other slug
    const displayTitle = (s2 || s1).replace(/-/g, ' ');
    return {
      title: displayTitle,
      breadcrumbs: [displayTitle],
      targetHeaderId: null,
      targetDropdownId: null,
      rawSlug: s2 || s1,
      isSpecial: false,
    };
  }, [headerSlug, dropdownSlug, headerItems]);

  // Available Categories extracted dynamically
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.dropdown_title) set.add(p.dropdown_title);
      if (p.header_title) set.add(p.header_title);
    });
    return Array.from(set);
  }, [products]);

  // Available Colors extracted dynamically
  const availableColors = useMemo(() => {
    const map = new Map<string, { name: string; hex: string; count: number }>();
    products.forEach((p) => {
      p.colors?.forEach((c) => {
        if (!c.name) return;
        const key = c.name.toLowerCase().trim();
        const existing = map.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          map.set(key, { name: c.name, hex: c.hex || '#D26900', count: 1 });
        }
      });
    });
    return Array.from(map.values());
  }, [products]);

  // Multi-Level Filter Pipeline
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // 1. URL Category / Slug Matching
    const s1 = (headerSlug || '').toLowerCase().trim();
    const s2 = (dropdownSlug || '').toLowerCase().trim();

    if (categoryMeta.badgeFilter) {
      list = list.filter((p) =>
        p.badge_text?.toLowerCase().includes(categoryMeta.badgeFilter!)
      );
    } else if (categoryMeta.targetDropdownId) {
      list = list.filter(
        (p) =>
          p.target_dropdown_id === categoryMeta.targetDropdownId ||
          p.dropdown_title?.toLowerCase() === categoryMeta.title?.toLowerCase() ||
          p.dropdown_path?.toLowerCase().includes(s2 || s1)
      );
    } else if (categoryMeta.targetHeaderId) {
      list = list.filter(
        (p) =>
          p.target_header_id === categoryMeta.targetHeaderId ||
          p.header_title?.toLowerCase() === categoryMeta.title?.toLowerCase() ||
          p.header_path?.toLowerCase().includes(s1) ||
          (p.target_dropdown_id && categoryMeta.dropdownIds?.includes(p.target_dropdown_id))
      );
    } else if (!categoryMeta.isSpecial && categoryMeta.rawSlug) {
      const q = categoryMeta.rawSlug.replace(/-/g, ' ');
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.subtitle?.toLowerCase().includes(q) ||
          p.header_title?.toLowerCase().includes(q) ||
          p.dropdown_title?.toLowerCase().includes(q) ||
          p.header_path?.toLowerCase().includes(categoryMeta.rawSlug!) ||
          p.dropdown_path?.toLowerCase().includes(categoryMeta.rawSlug!)
      );
    }

    // 2. Search query filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.subtitle?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.badge_text?.toLowerCase().includes(q)
      );
    }

    // 3. User Selected Category filter (multi-select: user can select any combination)
    if (selectedCategories.length > 0) {
      const normCats = selectedCategories.map((c) => c.toLowerCase().trim());
      list = list.filter((p) => {
        const dTitle = p.dropdown_title?.toLowerCase().trim();
        const hTitle = p.header_title?.toLowerCase().trim();
        return (
          (dTitle && normCats.includes(dTitle)) ||
          (hTitle && normCats.includes(hTitle))
        );
      });
    }

    // 4. Price Range filter
    if (selectedPriceRange !== 'all') {
      if (selectedPriceRange === 'under_999') {
        list = list.filter((p) => p.price < 1000);
      } else if (selectedPriceRange === '1000_1999') {
        list = list.filter((p) => p.price >= 1000 && p.price <= 1999);
      } else if (selectedPriceRange === '2000_2999') {
        list = list.filter((p) => p.price >= 2000 && p.price <= 2999);
      } else if (selectedPriceRange === '3000_above') {
        list = list.filter((p) => p.price >= 3000);
      }
    }

    // 5. Discount filter
    if (selectedDiscount !== null) {
      list = list.filter((p) => (p.discount_percent || 0) >= selectedDiscount);
    }

    // 6. Colors filter
    if (selectedColors.length > 0) {
      list = list.filter((p) =>
        p.colors?.some((c) =>
          selectedColors.some(
            (sc) => sc.toLowerCase() === c.name.toLowerCase().trim()
          )
        )
      );
    }

    // 7. Sorting
    if (sortOption === 'price_low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price_high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortOption === 'discount') {
      list.sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0));
    } else if (sortOption === 'newest') {
      list.sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
    } else {
      // Default recommended
      list.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
    }

    return list;
  }, [
    products,
    headerSlug,
    dropdownSlug,
    categoryMeta,
    searchTerm,
    selectedCategories,
    selectedPriceRange,
    selectedDiscount,
    selectedColors,
    sortOption,
  ]);

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedPriceRange !== 'all' ||
    selectedDiscount !== null ||
    selectedColors.length > 0 ||
    searchTerm.trim().length > 0;

  // Integrated Filter API: Sync criteria with backend /products/filter on-demand
  useEffect(() => {
    if (!hasActiveFilters && !searchTerm.trim()) {
      return; // Do NOT fire API call on initial page load when no filters are selected
    }

    const controller = new AbortController();
    const syncBackendFilter = async () => {
      try {
        const params: Record<string, string> = {};
        if (selectedCategories.length > 0) params.categories = selectedCategories.join(',');
        if (selectedPriceRange !== 'all') params.price_range = selectedPriceRange;
        if (selectedDiscount !== null) params.discount = String(selectedDiscount);
        if (selectedColors.length > 0) params.colors = selectedColors.join(',');
        if (searchTerm.trim()) params.search = searchTerm.trim();
        if (sortOption) params.sort = sortOption;
        if (headerSlug) params.header_slug = headerSlug;
        if (dropdownSlug) params.dropdown_slug = dropdownSlug;

        await apiClient.get('/products/filter', {
          params,
          signal: controller.signal,
        });
      } catch (_) {
        // Fallback to reactive local state
      }
    };

    const timer = setTimeout(syncBackendFilter, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [
    selectedCategories,
    selectedPriceRange,
    selectedDiscount,
    selectedColors,
    searchTerm,
    sortOption,
    headerSlug,
    dropdownSlug,
    hasActiveFilters,
  ]);

  // Pagination State (50 cards per page = 10 rows of 5 cards)
  const ITEMS_PER_PAGE = 50;
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const p = Number(searchParams.get('page'));
    return !isNaN(p) && p > 0 ? p : 1;
  });

  const handleClearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedPriceRange('all');
    setSelectedDiscount(null);
    setSelectedColors([]);
    setSearchTerm('');
    setSortOption('recommended');
    setCurrentPage(1);
  };

  // Reset to page 1 whenever any filter or sort criteria changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedCategories,
    selectedPriceRange,
    selectedDiscount,
    selectedColors,
    sortOption,
    headerSlug,
    dropdownSlug,
  ]);

  const toggleCategoryFilter = (catName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catName)
        ? prev.filter((c) => c !== catName)
        : [...prev, catName]
    );
  };

  const toggleColorFilter = (colorName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorName)
        ? prev.filter((c) => c !== colorName)
        : [...prev, colorName]
    );
  };

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);
      nextParams.set('page', String(newPage));
      return nextParams;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && products.length === 0) {
    return (
      <div className="w-full min-h-[75vh] bg-white flex flex-col justify-center">
        <PageLoader message="Loading handcrafted collections..." minHeight="min-h-[60vh]" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white text-[#282C3F]">
      {/* Top Breadcrumb & Page Title (Separated into 2 distinct lines as requested) */}
      <div className="w-full">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 pt-3 pb-1">
          {/* Line 1: Breadcrumb Path */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto whitespace-nowrap mb-1">
            <Link to="/" className="hover:text-[#D26900] transition-colors">
              Home
            </Link>
            {categoryMeta.breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <span className="text-gray-300">/</span>
                <span className="text-gray-500 font-normal">
                  {toTitleCase(crumb)}
                </span>
              </React.Fragment>
            ))}
          </nav>

          {/* Line 2: Category Title & Item Count */}
          <div className="flex items-baseline gap-2">
            <h1 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
              {toTitleCase(categoryMeta.title)}
            </h1>
            <span className="text-xs sm:text-sm text-gray-500 font-normal">
              - {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Container: Compact top spacing connecting directly to Filter & Sort row */}
      <div className="max-w-[1720px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 pt-1 pb-16 lg:pb-10 flex items-stretch gap-6 lg:gap-8 min-h-0 lg:min-h-[calc(100vh-200px)]">
        {/* ================================================================= */}
        {/* LEFT COLUMN: FILTER SIDEBAR (Desktop Only - Clean sticky sidebar without scroll trap) */}
        {/* ================================================================= */}
        <aside className="hidden lg:block lg:sticky lg:top-4 lg:self-start w-64 shrink-0 border-r border-[#EAEAEC] pr-6 space-y-5 select-none">
          {/* Desktop Filter Header (Aligned with Sort By toolbar at exact same h-11 height) */}
          <div className="hidden lg:flex items-center justify-between h-11 border-b border-[#EAEAEC]">
            <span className="text-sm sm:text-base font-bold uppercase tracking-wider text-gray-900">
              FILTERS
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="text-xs font-bold text-[#D26900] hover:underline cursor-pointer uppercase"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Filter 1: CATEGORIES */}
          {availableCategories.length > 0 && (
            <div className="space-y-2.5 pb-4 border-b border-gray-100">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2.5">
                Categories
              </h4>
              <div className="space-y-2">
                {availableCategories.map((cat) => {
                  const isChecked = selectedCategories.includes(cat);
                  return (
                    <label
                      key={cat}
                      className="flex items-center gap-3 text-sm text-gray-800 hover:text-black cursor-pointer group py-0.5"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCategoryFilter(cat)}
                        className="w-4 h-4 rounded text-[#D26900] focus:ring-[#D26900] cursor-pointer"
                      />
                      <span className="group-hover:font-medium">
                        {toTitleCase(cat)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filter 2: PRICE RANGE */}
          <div className="space-y-2.5 pb-4 border-b border-gray-100">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2.5">
              Price
            </h4>
            <div className="space-y-2">
              {[
                { label: 'All Prices', val: 'all' },
                { label: 'Under ₹999', val: 'under_999' },
                { label: '₹1,000 to ₹1,999', val: '1000_1999' },
                { label: '₹2,000 to ₹2,999', val: '2000_2999' },
                { label: '₹3,000 & Above', val: '3000_above' },
              ].map((p) => (
                <label
                  key={p.val}
                  className="flex items-center gap-3 text-sm text-gray-800 hover:text-black cursor-pointer group py-0.5"
                >
                  <input
                    type="radio"
                    name="price_range"
                    checked={selectedPriceRange === p.val}
                    onChange={() => setSelectedPriceRange(p.val)}
                    className="w-4 h-4 text-[#D26900] focus:ring-[#D26900] cursor-pointer"
                  />
                  <span className="group-hover:font-medium">{p.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filter 3: DISCOUNT RANGE */}
          <div className="space-y-2.5 pb-4 border-b border-gray-100">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2.5">
              Discount Range
            </h4>
            <div className="space-y-2">
              {[10, 20, 30, 40, 50].map((d) => (
                <label
                  key={d}
                  className="flex items-center gap-3 text-sm text-gray-800 hover:text-black cursor-pointer group py-0.5"
                >
                  <input
                    type="radio"
                    name="discount_range"
                    checked={selectedDiscount === d}
                    onChange={() =>
                      setSelectedDiscount(selectedDiscount === d ? null : d)
                    }
                    className="w-4 h-4 text-[#D26900] focus:ring-[#D26900] cursor-pointer"
                  />
                  <span className="group-hover:font-medium">{d}% and above</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filter 4: COLOR */}
          {availableColors.length > 0 && (
            <div className="space-y-2.5 pb-2">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2.5">
                Color
              </h4>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1.5 custom-cta-scrollbar">
                {availableColors.map((c) => {
                  const isChecked = selectedColors.includes(c.name);
                  return (
                    <label
                      key={c.name}
                      className="flex items-center gap-2.5 text-sm text-gray-800 hover:text-black cursor-pointer group py-0.5"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleColorFilter(c.name)}
                        className="w-4 h-4 rounded text-[#D26900] focus:ring-[#D26900] cursor-pointer"
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-gray-300 shadow-2xs shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="capitalize group-hover:font-medium">
                        {c.name} ({c.count})
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

        </aside>

        {/* ================================================================= */}
        {/* RIGHT AREA: SORT TOOLBAR & PRODUCT CARDS GRID (Pinned Pagination Min-Height Layout) */}
        {/* ================================================================= */}
        <main className="flex-1 min-w-0 min-h-0 lg:min-h-[900px] flex flex-col justify-between">
          <div>
            {/* Main Content Header Toolbar: Active Filter Chips & Custom Sort Dropdown (Hidden on mobile/tab unless active chips exist) */}
            <div
              className={`${
                hasActiveFilters ? 'flex' : 'hidden lg:flex'
              } items-center justify-between gap-4 min-h-0 lg:h-11 ${
                hasActiveFilters ? 'border-b border-[#EAEAEC] pb-2 mb-2.5 sm:mb-3' : ''
              } lg:border-b lg:border-[#EAEAEC] lg:mb-5`}
            >
              {/* Active Filter Chips */}
              <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto py-0.5">
                {selectedCategories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full border border-gray-200"
                  >
                    {toTitleCase(cat)}
                    <button
                      onClick={() => toggleCategoryFilter(cat)}
                      className="hover:text-red-500 ml-1 text-xs"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              {selectedPriceRange !== 'all' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full border border-gray-200">
                  Price: {selectedPriceRange.replace('_', ' ')}
                  <button
                    onClick={() => setSelectedPriceRange('all')}
                    className="hover:text-red-500 ml-1 text-xs"
                  >
                    ✕
                  </button>
                </span>
              )}
              {selectedDiscount !== null && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full border border-gray-200">
                  {selectedDiscount}% & Above
                  <button
                    onClick={() => setSelectedDiscount(null)}
                    className="hover:text-red-500 ml-1 text-xs"
                  >
                    ✕
                  </button>
                </span>
              )}
              {selectedColors.map((col) => (
                <span
                  key={col}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full border border-gray-200 capitalize"
                >
                  {col}
                  <button
                    onClick={() => toggleColorFilter(col)}
                    className="hover:text-red-500 ml-1 text-xs"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>

            {/* Custom Theme-Matched Sort By Dropdown (Desktop Only) */}
            <div className="hidden lg:flex items-center gap-2 ml-auto shrink-0 relative" ref={sortDropdownRef}>
              <span className="text-xs text-gray-500 font-medium hidden sm:inline">Sort by:</span>
              <button
                type="button"
                onClick={() => setSortDropdownOpen((prev) => !prev)}
                className={`inline-flex items-center justify-between gap-3 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer shadow-2xs min-w-[160px] ${
                  sortDropdownOpen
                    ? 'border-[#D26900] ring-2 ring-[#D26900]/20 bg-white text-[#D26900]'
                    : 'border-gray-300 text-gray-800 bg-white hover:border-[#D26900] hover:text-[#D26900]'
                }`}
              >
                <span className="truncate">
                  {SORT_OPTIONS.find((o) => o.value === sortOption)?.label || 'Popularity'}
                </span>
                <span
                  className={`text-[9px] text-gray-500 transition-transform duration-200 ${
                    sortDropdownOpen ? 'rotate-180 text-[#D26900]' : ''
                  }`}
                >
                  ▼
                </span>
              </button>

              {/* Custom Floating Menu Styled with Website Theme */}
              {sortDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-[#D26900]/30 rounded-xl shadow-xl py-1 z-50 animate-fadeIn backdrop-blur-md">
                  {SORT_OPTIONS.map((opt) => {
                    const isSelected = sortOption === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelectSort(opt.value)}
                        className={`w-full text-left px-3.5 py-2 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#D26900]/10 text-[#D26900] font-bold'
                            : 'text-gray-700 hover:bg-orange-50 hover:text-[#D26900] font-medium'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D26900] shadow-xs" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <PageLoader message="Updating collections..." minHeight="min-h-[40vh]" />
          )}

          {/* Empty State */}
          {!loading && filteredProducts.length === 0 && (
            <div className="min-h-[45vh] flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-gray-50/50 rounded-2xl border border-gray-200">
              <span className="text-5xl mb-3">🧸</span>
              <h3 className="text-lg font-bold text-gray-900">
                No products found
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-md mb-5 leading-relaxed">
                {hasActiveFilters
                  ? 'We could not find any products matching your active filters. Try clearing filters to see more results.'
                  : `Currently there are no products listed under "${categoryMeta.title}". Explore our other plush bag collections!`}
              </p>
              <div className="flex items-center gap-3">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearAllFilters}
                    className="px-5 py-2.5 text-xs font-bold bg-white text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors shadow-2xs cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                )}
                <Link
                  to="/products"
                  className="px-5 py-2.5 text-xs font-bold bg-[#D26900] hover:bg-[#B45309] text-white rounded-xl shadow-sm transition-colors"
                >
                  Explore All Products
                </Link>
              </div>
            </div>
          )}

            {/* Product Cards Grid: Exactly 5 Cards per Row on Desktop (10 rows = 50 cards per page) */}
            {paginatedProducts.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-3 sm:gap-3.5 lg:gap-4">
                {paginatedProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            )}
          </div>

          {/* Pagination Controls (Always Pinned to Bottom, including 1 product/page in Image 3) */}
          {filteredProducts.length > 0 && (
            <div className="mt-5 lg:mt-auto mb-2 lg:mb-6 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 pt-3.5 lg:pt-6 border-t border-[#EAEAEC]">
              <div className="text-xs text-gray-500 font-medium">
                Showing{' '}
                <span className="font-bold text-gray-900">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                </span>{' '}
                to{' '}
                <span className="font-bold text-gray-900">
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}
                </span>{' '}
                of <span className="font-bold text-gray-900">{filteredProducts.length}</span>{' '}
                {filteredProducts.length === 1 ? 'product' : 'products'}
              </div>

              <div className="flex items-center gap-1.5">
                {/* Previous Page Button */}
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors flex items-center gap-1 ${
                    currentPage <= 1
                      ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                      : 'border-gray-300 text-gray-700 hover:border-[#D26900] hover:text-[#D26900] cursor-pointer bg-white shadow-2xs'
                  }`}
                >
                  <span>‹</span> Previous
                </button>

                {/* Page Number Buttons (At least 1 button, e.g. [1]) */}
                {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-[#D26900] text-white shadow-sm'
                        : 'border border-gray-300 text-gray-700 hover:border-[#D26900] hover:text-[#D26900] bg-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                {/* Next Page Button */}
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors flex items-center gap-1 ${
                    currentPage >= totalPages
                      ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                      : 'border-gray-300 text-gray-700 hover:border-[#D26900] hover:text-[#D26900] cursor-pointer bg-white shadow-2xs'
                  }`}
                >
                  Next <span>›</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ================================================================= */}
      {/* MOBILE & TABLET STICKY BOTTOM BAR (Floating slightly above bottom) */}
      {/* ================================================================= */}
      <div className="lg:hidden fixed bottom-2.5 inset-x-3 sm:inset-x-6 md:inset-x-12 z-40 max-w-md mx-auto pointer-events-auto select-none">
        <div className="bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl border border-gray-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.12)] flex items-stretch divide-x divide-gray-200 overflow-hidden h-11 sm:h-12">
          {/* 1. Sort Button (Image 2 trigger) */}
          <button
            type="button"
            onClick={() => setMobileSortOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-gray-800 hover:bg-orange-50/60 hover:text-[#D26900] active:scale-[0.98] transition-all cursor-pointer"
          >
            <svg
              className="w-4 h-4 text-gray-700 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 4v16M7 4l-4 4M7 4l4 4M17 20V4M17 20l-4-4M17 20l4-4" />
            </svg>
            <span>Sort</span>
            {sortOption !== 'recommended' && (
              <span className="w-2 h-2 rounded-full bg-[#D26900]" />
            )}
          </button>

          {/* 2. Filter Button (Image 3 trigger) */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-gray-800 hover:bg-orange-50/60 hover:text-[#D26900] active:scale-[0.98] transition-all cursor-pointer"
          >
            <svg
              className="w-4 h-4 text-gray-700 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span>Filter</span>
            {(selectedCategories.length + (selectedPriceRange !== 'all' ? 1 : 0) + (selectedDiscount !== null ? 1 : 0) + selectedColors.length) > 0 && (
              <span className="min-w-4.5 h-4.5 px-1 bg-[#D26900] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {selectedCategories.length + (selectedPriceRange !== 'all' ? 1 : 0) + (selectedDiscount !== null ? 1 : 0) + selectedColors.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* MOBILE SORT BOTTOM SHEET (Image 2 Reference - Flipkart Style) */}
      {/* ================================================================= */}
      <AnimatePresence>
        {mobileSortOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileSortOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Bottom Sheet Card */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full max-w-lg mx-auto bg-white rounded-t-2xl shadow-2xl z-10 overflow-hidden"
            >
              {/* Header: SORT BY */}
              <div className="px-5 pt-4 pb-3 border-b border-gray-150 flex items-center justify-between bg-white">
                <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                  SORT BY
                </span>
                <button
                  type="button"
                  onClick={() => setMobileSortOpen(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Sort Options List */}
              <div className="py-1">
                {SORT_OPTIONS.map((opt) => {
                  const isSelected = sortOption === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelectSort(opt.value)}
                      className={`w-full text-left px-5 py-3.5 text-sm transition-colors flex items-center justify-between cursor-pointer border-b border-gray-50 last:border-b-0 ${
                        isSelected
                          ? 'bg-orange-50/50 text-[#D26900] font-bold'
                          : 'text-gray-800 hover:bg-gray-50 font-medium'
                      }`}
                    >
                      <span>{opt.label}</span>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected ? 'border-[#D26900]' : 'border-gray-300'
                        }`}
                      >
                        {isSelected && (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#D26900]" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* MOBILE SPLIT FILTER DRAWER (Image 3 Reference - Flipkart Style) */}
      {/* ================================================================= */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/50"
            />

            {/* Split Drawer Modal Container */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              className="relative w-full h-[92vh] sm:h-[88vh] max-w-lg mx-auto bg-white rounded-t-2xl shadow-2xl z-10 flex flex-col overflow-hidden"
            >
              {/* Drawer Top Header (← Filters | Clear All) */}
              <div className="h-14 px-4 sm:px-5 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1.5 -ml-1.5 rounded-full text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="19" y1="12" x2="5" y2="12" />
                      <polyline points="12 19 5 12 12 5" />
                    </svg>
                  </button>
                  <h3 className="text-base font-bold text-gray-900">Filters</h3>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearAllFilters}
                    className="text-xs font-bold text-[#D26900] hover:text-[#B45309] uppercase tracking-wider py-1 px-2 rounded hover:bg-orange-50 transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Split 2-Column Body */}
              <div className="flex-1 min-h-0 flex flex-row overflow-hidden bg-white">
                {/* Left Column: Filter Categories Navigation */}
                <div className="w-[38%] max-w-[150px] bg-[#F1F3F6] border-r border-gray-200 overflow-y-auto select-none py-1">
                  {/* Category Tab */}
                  <button
                    type="button"
                    onClick={() => setActiveFilterTab('categories')}
                    className={`w-full text-left px-3.5 py-4 text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer border-l-4 ${
                      activeFilterTab === 'categories'
                        ? 'bg-white text-[#D26900] font-bold border-[#D26900]'
                        : 'bg-transparent text-gray-700 font-medium hover:bg-gray-200/60 border-transparent'
                    }`}
                  >
                    <span className="truncate">Categories</span>
                    {selectedCategories.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-[#D26900] shrink-0" />
                    )}
                  </button>

                  {/* Price Tab */}
                  <button
                    type="button"
                    onClick={() => setActiveFilterTab('price')}
                    className={`w-full text-left px-3.5 py-4 text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer border-l-4 ${
                      activeFilterTab === 'price'
                        ? 'bg-white text-[#D26900] font-bold border-[#D26900]'
                        : 'bg-transparent text-gray-700 font-medium hover:bg-gray-200/60 border-transparent'
                    }`}
                  >
                    <span className="truncate">Price</span>
                    {selectedPriceRange !== 'all' && (
                      <span className="w-2 h-2 rounded-full bg-[#D26900] shrink-0" />
                    )}
                  </button>

                  {/* Discount Tab */}
                  <button
                    type="button"
                    onClick={() => setActiveFilterTab('discount')}
                    className={`w-full text-left px-3.5 py-4 text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer border-l-4 ${
                      activeFilterTab === 'discount'
                        ? 'bg-white text-[#D26900] font-bold border-[#D26900]'
                        : 'bg-transparent text-gray-700 font-medium hover:bg-gray-200/60 border-transparent'
                    }`}
                  >
                    <span className="truncate">Discount</span>
                    {selectedDiscount !== null && (
                      <span className="w-2 h-2 rounded-full bg-[#D26900] shrink-0" />
                    )}
                  </button>

                  {/* Color Tab */}
                  {availableColors.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveFilterTab('color')}
                      className={`w-full text-left px-3.5 py-4 text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer border-l-4 ${
                        activeFilterTab === 'color'
                          ? 'bg-white text-[#D26900] font-bold border-[#D26900]'
                          : 'bg-transparent text-gray-700 font-medium hover:bg-gray-200/60 border-transparent'
                      }`}
                    >
                      <span className="truncate">Color</span>
                      {selectedColors.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-[#D26900] shrink-0" />
                      )}
                    </button>
                  )}
                </div>

                {/* Right Column: Selected Tab Options */}
                <div className="flex-1 bg-white overflow-y-auto px-4 py-3 select-none">
                  {/* TAB 1: Categories Content */}
                  {activeFilterTab === 'categories' && (
                    <div>
                      {availableCategories.length === 0 ? (
                        <p className="text-xs text-gray-400 py-6 text-center">No categories found</p>
                      ) : (
                        availableCategories.map((cat) => {
                          const isChecked = selectedCategories.includes(cat);
                          return (
                            <label
                              key={cat}
                              className="flex items-center gap-3.5 py-3 border-b border-gray-100 last:border-b-0 cursor-pointer group"
                            >
                              <div
                                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                  isChecked
                                    ? 'bg-[#D26900] border-[#D26900] text-white'
                                    : 'border-gray-300 bg-white group-hover:border-[#D26900]'
                                }`}
                              >
                                {isChecked && (
                                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleCategoryFilter(cat)}
                                className="sr-only"
                              />
                              <span className={`text-xs sm:text-sm ${isChecked ? 'font-bold text-gray-900' : 'text-gray-700 font-medium'}`}>
                                {toTitleCase(cat)}
                              </span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* TAB 2: Price Content */}
                  {activeFilterTab === 'price' && (
                    <div>
                      {[
                        { label: 'All Prices', val: 'all' },
                        { label: 'Under ₹999', val: 'under_999' },
                        { label: '₹1,000 to ₹1,999', val: '1000_1999' },
                        { label: '₹2,000 to ₹2,999', val: '2000_2999' },
                        { label: '₹3,000 & Above', val: '3000_above' },
                      ].map((p) => {
                        const isSelected = selectedPriceRange === p.val;
                        return (
                          <label
                            key={p.val}
                            className="flex items-center gap-3.5 py-3 border-b border-gray-100 last:border-b-0 cursor-pointer group"
                          >
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                isSelected ? 'border-[#D26900]' : 'border-gray-300 group-hover:border-[#D26900]'
                              }`}
                            >
                              {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-[#D26900]" />}
                            </div>
                            <input
                              type="radio"
                              name="mobile_price_choice"
                              checked={isSelected}
                              onChange={() => setSelectedPriceRange(p.val)}
                              className="sr-only"
                            />
                            <span className={`text-xs sm:text-sm ${isSelected ? 'font-bold text-gray-900' : 'text-gray-700 font-medium'}`}>
                              {p.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* TAB 3: Discount Content */}
                  {activeFilterTab === 'discount' && (
                    <div>
                      {[
                        { label: 'All Discounts', val: null },
                        { label: '10% and above', val: 10 },
                        { label: '20% and above', val: 20 },
                        { label: '30% and above', val: 30 },
                        { label: '40% and above', val: 40 },
                        { label: '50% and above', val: 50 },
                      ].map((d) => {
                        const isSelected = selectedDiscount === d.val;
                        return (
                          <label
                            key={String(d.val)}
                            className="flex items-center gap-3.5 py-3 border-b border-gray-100 last:border-b-0 cursor-pointer group"
                          >
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                isSelected ? 'border-[#D26900]' : 'border-gray-300 group-hover:border-[#D26900]'
                              }`}
                            >
                              {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-[#D26900]" />}
                            </div>
                            <input
                              type="radio"
                              name="mobile_discount_choice"
                              checked={isSelected}
                              onChange={() => setSelectedDiscount(d.val)}
                              className="sr-only"
                            />
                            <span className={`text-xs sm:text-sm ${isSelected ? 'font-bold text-gray-900' : 'text-gray-700 font-medium'}`}>
                              {d.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* TAB 4: Color Content */}
                  {activeFilterTab === 'color' && (
                    <div>
                      {availableColors.length === 0 ? (
                        <p className="text-xs text-gray-400 py-6 text-center">No colors available</p>
                      ) : (
                        availableColors.map((c) => {
                          const isChecked = selectedColors.includes(c.name);
                          return (
                            <label
                              key={c.name}
                              className="flex items-center gap-3.5 py-3 border-b border-gray-100 last:border-b-0 cursor-pointer group"
                            >
                              <div
                                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                  isChecked
                                    ? 'bg-[#D26900] border-[#D26900] text-white'
                                    : 'border-gray-300 bg-white group-hover:border-[#D26900]'
                                }`}
                              >
                                {isChecked && (
                                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleColorFilter(c.name)}
                                className="sr-only"
                              />
                              <span
                                className="w-4.5 h-4.5 rounded-full border border-gray-300 shadow-2xs shrink-0"
                                style={{ backgroundColor: c.hex }}
                              />
                              <span className={`text-xs sm:text-sm capitalize ${isChecked ? 'font-bold text-gray-900' : 'text-gray-700 font-medium'}`}>
                                {c.name} ({c.count})
                              </span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Footer (Image 3 Style: products found count + Apply CTA button) */}
              <div className="shrink-0 border-t border-gray-200 bg-white px-5 py-3 sm:py-3.5 flex items-center justify-between shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
                <div>
                  <div className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                    {filteredProducts.length.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-gray-500 font-normal leading-tight">
                    products found
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="px-8 py-2.5 sm:py-3 bg-[#D26900] hover:bg-[#B45309] active:scale-[0.98] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg shadow-md transition-all cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
