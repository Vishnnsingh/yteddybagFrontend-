import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  useHomeBanner,
  toRemNumber,
  type HomeSectionLayoutItem,
  type HomeSectionType,
} from '../../Context/HomeBannerContext';

const SECTION_TYPE_META: Record<
  HomeSectionType,
  { label: string; defaultName: string; icon: string; tabId: string; color: string; bg: string }
> = {
  hero_banner: {
    label: 'Hero Banners & Themes',
    defaultName: 'Hero Banner Carousel',
    icon: '🖼️',
    tabId: 'banners',
    color: '#D26900',
    bg: '#FFF7ED',
  },
  sub_banner: {
    label: 'Quick Categories (Sub-Banner)',
    defaultName: 'Quick Category Strip',
    icon: '🏷️',
    tabId: 'sub-banners',
    color: '#0284C7',
    bg: '#F0F9FF',
  },
  occasions: {
    label: 'Occasion Gifts (Section)',
    defaultName: 'Gifts For Every Occasion',
    icon: '🎁',
    tabId: 'occasions',
    color: '#E11D48',
    bg: '#FFF1F2',
  },
  bestsellers: {
    label: 'Shop By Bestsellers',
    defaultName: 'Bestseller Collection',
    icon: '⭐',
    tabId: 'bestsellers',
    color: '#D97706',
    bg: '#FEF3C7',
  },
  custom_cards: {
    label: 'Showcase Cards (Classic & Modern)',
    defaultName: 'Curated Showcase Cards',
    icon: '🪟',
    tabId: 'custom-cards',
    color: '#7C3AED',
    bg: '#F5F3FF',
  },
  promo_banner: {
    label: 'Special Promo Strip Banner',
    defaultName: 'Joyful Promo Strip',
    icon: '📢',
    tabId: 'promo-banner',
    color: '#059669',
    bg: '#ECFDF5',
  },
};

interface AdminSectionsLayoutTabProps {
  onSwitchTab?: (
    tab: 'banners' | 'sub-banners' | 'occasions' | 'bestsellers' | 'promo-banner' | 'custom-cards',
    targetSectionId?: string
  ) => void;
}

export default function AdminSectionsLayoutTab({ onSwitchTab }: AdminSectionsLayoutTabProps) {
  const {
    adminSectionsLayout,
    fetchAdminSectionsLayout,
    updateSectionsLayout,
    saveSingleSectionLayout,
    resetSectionsLayout,
    adminBanners,
    adminSubBanners,
    adminOccasions,
    adminBestsellers,
    adminPromoBanners,
    adminCustomCards,
  } = useHomeBanner();

  const [layoutItems, setLayoutItems] = useState<HomeSectionLayoutItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [savingSectionId, setSavingSectionId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const _handleUpdateProperty = (id: string, field: keyof HomeSectionLayoutItem, value: any) => {
    setLayoutItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
    setHasUnsavedChanges(true);
  };
  void _handleUpdateProperty;

  // Save single section independently (guarantees no other section is overwritten)
  const handleSaveSingleSection = async (id: string) => {
    const item = layoutItems.find((i) => i.id === id);
    if (!item) return;
    setSavingSectionId(id);
    try {
      const success = await saveSingleSectionLayout(id, item);
      if (success) {
        toast.success(`"${item.custom_label || item.id}" saved separately!`);
      }
    } finally {
      setSavingSectionId(null);
    }
  };

  // Sync state with context
  useEffect(() => {
    fetchAdminSectionsLayout();
  }, [fetchAdminSectionsLayout]);

  useEffect(() => {
    if (adminSectionsLayout && adminSectionsLayout.length > 0) {
      setLayoutItems(
        [...adminSectionsLayout]
          .sort((a, b) => a.order_index - b.order_index)
          .map((item) => ({
            ...item,
            padding_top: toRemNumber(item.padding_top, 1.0),
            padding_bottom: toRemNumber(item.padding_bottom, 1.5),
            margin_top: toRemNumber(item.margin_top, 0),
            margin_bottom: toRemNumber(item.margin_bottom, 0),
          }))
      );
      setHasUnsavedChanges(false);
    }
  }, [adminSectionsLayout]);

  // Move item up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...layoutItems];
    const temp = newItems[index - 1];
    newItems[index - 1] = newItems[index];
    newItems[index] = temp;
    setLayoutItems(newItems.map((item, idx) => ({ ...item, order_index: idx + 1 })));
    setHasUnsavedChanges(true);
  };

  // Move item down
  const handleMoveDown = (index: number) => {
    if (index === layoutItems.length - 1) return;
    const newItems = [...layoutItems];
    const temp = newItems[index + 1];
    newItems[index + 1] = newItems[index];
    newItems[index] = temp;
    setLayoutItems(newItems.map((item, idx) => ({ ...item, order_index: idx + 1 })));
    setHasUnsavedChanges(true);
  };

  // Toggle item visibility
  const handleToggleEnable = (id: string) => {
    setLayoutItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_enabled: !item.is_enabled } : item))
    );
    setHasUnsavedChanges(true);
  };

  // Duplicate section (allows repeating any section anywhere on the page with separate items)
  const handleDuplicate = (id: string) => {
    const targetIndex = layoutItems.findIndex((item) => item.id === id);
    if (targetIndex === -1) return;

    const original = layoutItems[targetIndex];
    const newId = `${original.section_type}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const duplicateCount = layoutItems.filter((i) => i.section_type === original.section_type).length + 1;

    // Deep-clone items with unique IDs so editing cloned items NEVER affects original
    let sourceItems: any[] = Array.isArray(original.items) && original.items.length > 0 ? original.items : [];
    if (sourceItems.length === 0) {
      if (original.section_type === 'hero_banner') sourceItems = adminBanners;
      else if (original.section_type === 'sub_banner') sourceItems = adminSubBanners;
      else if (original.section_type === 'occasions') sourceItems = adminOccasions;
      else if (original.section_type === 'bestsellers') sourceItems = adminBestsellers;
      else if (original.section_type === 'promo_banner') sourceItems = adminPromoBanners;
      else if (original.section_type === 'custom_cards') sourceItems = adminCustomCards;
    }

    const clonedItems = sourceItems.map((item: any, idx: number) => ({
      ...item,
      id: `${original.section_type}_item_${Date.now().toString(36)}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
    }));

    // CRITICAL: Ensure original section also has its own isolated items array so both are separate
    const originalWithItems: HomeSectionLayoutItem =
      !Array.isArray(original.items) || original.items.length === 0
        ? {
            ...original,
            items: sourceItems.map((item: any, idx: number) => ({
              ...item,
              id: `${original.section_type}_orig_${Date.now().toString(36)}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
            })),
          }
        : original;

    const newItem: HomeSectionLayoutItem = {
      ...original,
      id: newId,
      custom_label: `${original.custom_label || SECTION_TYPE_META[original.section_type].defaultName} (Copy ${duplicateCount})`,
      order_index: targetIndex + 2,
      items: clonedItems,
    };

    const newItems = [...layoutItems];
    newItems[targetIndex] = originalWithItems;
    newItems.splice(targetIndex + 1, 0, newItem);
    setLayoutItems(newItems.map((item, idx) => ({ ...item, order_index: idx + 1 })));
    setHasUnsavedChanges(true);
    toast.success(`Duplicate section created with separate ID and cloned items! Settings will save independently.`);
  };

  // Remove section
  const handleRemove = (id: string) => {
    if (layoutItems.length <= 1) {
      toast.error('At least one section must remain on the page.');
      return;
    }
    const filtered = layoutItems.filter((item) => item.id !== id);
    setLayoutItems(filtered.map((item, idx) => ({ ...item, order_index: idx + 1 })));
    setHasUnsavedChanges(true);
    toast.success('Section removed from page layout.');
  };

  // Add new section of a specific type
  const handleAddSection = (type: HomeSectionType) => {
    const meta = SECTION_TYPE_META[type];
    const count = layoutItems.filter((i) => i.section_type === type).length + 1;
    const newId = `${type}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    const newItem: HomeSectionLayoutItem = {
      id: newId,
      section_type: type,
      custom_label: count > 1 ? `${meta.defaultName} #${count}` : meta.defaultName,
      is_enabled: true,
      order_index: layoutItems.length + 1,
      padding_top:
        type === 'hero_banner' ? 0 : type === 'sub_banner' ? 0.5 : type === 'occasions' || type === 'promo_banner' ? 1.5 : 2.0,
      padding_bottom:
        type === 'hero_banner' ? 0 : type === 'sub_banner' ? 0.75 : type === 'occasions' || type === 'promo_banner' ? 2.0 : 2.5,
      margin_top: 0,
      margin_bottom: 0,
      bg_color: 'transparent',
      items: [], // Completely blank, admin will configure from scratch
    };

    setLayoutItems([...layoutItems, newItem]);
    setShowAddMenu(false);
    setHasUnsavedChanges(true);
    toast.success(`Added ${meta.label} to bottom of page.`);
  };

  // Update spacing property (REM)
  const handleUpdateSpacing = (
    id: string,
    field: 'padding_top' | 'padding_bottom' | 'margin_top' | 'margin_bottom',
    value: number
  ) => {
    const cleanVal = Number(Math.max(0, value).toFixed(3));
    setLayoutItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: cleanVal } : item))
    );
    setHasUnsavedChanges(true);
  };

  // Update label
  const handleUpdateLabel = (id: string, label: string) => {
    setLayoutItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, custom_label: label } : item))
    );
    setHasUnsavedChanges(true);
  };

  // Save all changes
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await updateSectionsLayout(layoutItems);
      if (success) {
        setHasUnsavedChanges(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default
  const handleReset = async () => {
    if (!window.confirm('Reset the homepage section order and spacing back to default 6 sections?')) {
      return;
    }
    setIsResetting(true);
    try {
      const success = await resetSectionsLayout();
      if (success) {
        setHasUnsavedChanges(false);
      }
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Description */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Home Page Layout & Section Builder
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFF7ED] text-[#D26900] border border-[#FED7AA]">
              {layoutItems.filter((i) => i.is_enabled).length} Active Sections
            </span>
            {hasUnsavedChanges && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 animate-pulse border border-amber-300">
                Unsaved Changes
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-3xl">
            Sections ko upar/niche kahin bhi arrange karein, koi bhi section dobara repeat/duplicate karein, aur har
            section me In-Section Space (Padding Top/Bottom) & Outer Section Space (Margin Top/Bottom) set karein.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={handleReset}
            disabled={isResetting || isSaving}
            className="px-3.5 py-2 text-xs font-bold rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isResetting ? 'Resetting...' : 'Reset Default'}
          </button>

          {/* Add Section Button with Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-[#D26900] border border-amber-200 text-xs sm:text-sm font-bold rounded-xl shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>+ Add Section</span>
            </button>

            {showAddMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-64 z-50 bg-white border border-amber-200 rounded-2xl shadow-xl shadow-amber-900/10 p-2 space-y-1">
                <div className="px-2.5 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Select Section to Insert
                </div>
                {(Object.keys(SECTION_TYPE_META) as HomeSectionType[]).map((type) => {
                  const meta = SECTION_TYPE_META[type];
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleAddSection(type)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-semibold rounded-xl text-gray-800 hover:bg-amber-50 hover:text-[#D26900] transition-colors cursor-pointer"
                    >
                      <span className="text-base">{meta.icon}</span>
                      <span className="truncate">{meta.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 bg-gradient-to-r from-[#D26900] to-[#E65100] hover:from-[#B45309] hover:to-[#D26900] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-[#D26900]/25 transition-all cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span>{isSaving ? 'Saving...' : 'Save Page Layout & Spacing'}</span>
          </button>
        </div>
      </div>

      {/* Main Layout Stack */}
      <div className="space-y-4">
        {layoutItems.map((item, index) => {
          const meta = SECTION_TYPE_META[item.section_type] || {
            label: item.section_type,
            defaultName: item.section_type,
            icon: '📄',
            tabId: 'banners',
            color: '#D26900',
            bg: '#FFF7ED',
          };

          return (
            <div
              key={item.id}
              className={`rounded-2xl border transition-all ${
                item.is_enabled
                  ? 'bg-white border-amber-200/80 shadow-xs hover:border-[#D26900]'
                  : 'bg-gray-50/80 border-gray-200 opacity-75'
              }`}
            >
              {/* Card Header Bar */}
              <div className="p-4 sm:p-5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 border-b border-gray-100">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Position Badge & Reorder Controls */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="w-7 h-7 rounded-xl bg-gray-100 text-gray-700 font-extrabold text-xs flex items-center justify-center">
                      #{index + 1}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        title="Move Section Up"
                        className="p-1 rounded text-gray-400 hover:text-gray-900 disabled:opacity-20 hover:bg-gray-100 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === layoutItems.length - 1}
                        title="Move Section Down"
                        className="p-1 rounded text-gray-400 hover:text-gray-900 disabled:opacity-20 hover:bg-gray-100 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Section Type Icon & Label */}
                  <div className="min-w-0 flex items-center gap-2.5">
                    <span
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{ backgroundColor: meta.bg }}
                    >
                      {meta.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wide uppercase shrink-0"
                          style={{ backgroundColor: meta.bg, color: meta.color }}
                        >
                          {meta.label}
                        </span>
                        {!item.is_enabled && (
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-gray-200 text-gray-600">
                            Hidden
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={item.custom_label}
                        placeholder={meta.defaultName}
                        onChange={(e) => handleUpdateLabel(item.id, e.target.value)}
                        className="mt-0.5 text-xs sm:text-sm font-bold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[#D26900] outline-hidden px-0.5 py-0.5 max-w-xs sm:max-w-md"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Action Icons: Edit Content, Duplicate, Save Section, Visibility Toggle Switch, Remove */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Edit Content Button - Jumps directly to Full Tab Editor for this section */}
                  {onSwitchTab && (
                    <button
                      type="button"
                      onClick={() => onSwitchTab(meta.tabId as any, item.id)}
                      className="px-3 py-1.5 text-xs font-bold text-[#D26900] bg-amber-50 hover:bg-amber-100 border border-amber-200 active:scale-95 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      title={`Open full editor to customize content for Section #${index + 1}`}
                    >
                      <span>Edit Content</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  )}

                  {/* Duplicate Button */}
                  <button
                    type="button"
                    onClick={() => handleDuplicate(item.id)}
                    className="p-2 text-gray-500 hover:text-[#D26900] hover:bg-amber-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-amber-200"
                    title="Duplicate this section (repeat anywhere)"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>

                  {/* Save This Section Button */}
                  <button
                    type="button"
                    disabled={savingSectionId === item.id}
                    onClick={() => handleSaveSingleSection(item.id)}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-2xs disabled:opacity-50"
                    title={`Save spacing & settings specifically for Section #${index + 1}`}
                  >
                    {savingSectionId === item.id ? (
                      <>
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="hidden sm:inline">Saving...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Save Section</span>
                      </>
                    )}
                  </button>

                  {/* Visibility Sliding Toggle Switch */}
                  <div className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100/80 border border-gray-200 px-2.5 py-1 rounded-xl transition-colors">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={item.is_enabled}
                      onClick={() => handleToggleEnable(item.id)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        item.is_enabled ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}
                      title={item.is_enabled ? 'Section is Visible on Home Page (Click to Hide)' : 'Section is Hidden from Home Page (Click to Show)'}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          item.is_enabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span
                      onClick={() => handleToggleEnable(item.id)}
                      className={`text-[11px] font-bold select-none cursor-pointer ${
                        item.is_enabled ? 'text-emerald-700' : 'text-gray-400'
                      }`}
                    >
                      {item.is_enabled ? 'Visible' : 'Hidden'}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-red-200"
                    title="Remove section from page"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Spacing Controls Bar: In-Section Space & Outer Section Space */}
              <div className="p-4 sm:p-5 bg-gradient-to-b from-gray-50/50 to-white rounded-b-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. In-Section Space (Inner Padding REM) */}
                <div className="p-3.5 bg-white rounded-xl border border-gray-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-[#D26900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      <label className="text-xs font-bold text-gray-900">
                        In-Section Space (Inner Padding)
                      </label>
                    </div>
                    <span className="text-[11px] font-extrabold text-[#D26900]">
                      Top: {item.padding_top}rem | Bottom: {item.padding_bottom}rem
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Padding Top */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-gray-600 font-semibold">
                        <span>Padding Top</span>
                        <span className="font-bold text-gray-900">{item.padding_top}rem</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="6"
                        step="0.125"
                        value={item.padding_top}
                        onChange={(e) => handleUpdateSpacing(item.id, 'padding_top', Number(e.target.value))}
                        className="w-full accent-[#D26900] cursor-pointer"
                      />
                    </div>

                    {/* Padding Bottom */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-gray-600 font-semibold">
                        <span>Padding Bottom</span>
                        <span className="font-bold text-gray-900">{item.padding_bottom}rem</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="6"
                        step="0.125"
                        value={item.padding_bottom}
                        onChange={(e) => handleUpdateSpacing(item.id, 'padding_bottom', Number(e.target.value))}
                        className="w-full accent-[#D26900] cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* 1-Click Quick Presets for Inner Space (REM) */}
                  <div className="flex items-center justify-between gap-1 pt-1 border-t border-gray-100 flex-wrap">
                    <span className="text-[10px] text-gray-400 font-bold">Presets:</span>
                    {[
                      { label: '0.5rem', val: 0.5 },
                      { label: '1rem', val: 1 },
                      { label: '1.5rem', val: 1.5 },
                      { label: '2rem (Normal)', val: 2 },
                      { label: '2.5rem (Comfortable)', val: 2.5 },
                      { label: '3rem (Wide)', val: 3 },
                      { label: '4rem', val: 4 },
                    ].map((p) => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => {
                          handleUpdateSpacing(item.id, 'padding_top', p.val);
                          handleUpdateSpacing(item.id, 'padding_bottom', p.val);
                        }}
                        className={`px-1.5 py-0.5 text-[10px] rounded transition-all cursor-pointer ${
                          item.padding_top === p.val && item.padding_bottom === p.val
                            ? 'bg-amber-100 text-[#D26900] font-bold border border-[#D26900]'
                            : 'text-gray-500 hover:text-gray-800 bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Outer Section Space (Outer Margin REM) */}
                <div className="p-3.5 bg-white rounded-xl border border-gray-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      <label className="text-xs font-bold text-gray-900">
                        Outer Section Space (Margin Gap)
                      </label>
                    </div>
                    <span className="text-[11px] font-extrabold text-emerald-700">
                      Top: {item.margin_top}rem | Bottom: {item.margin_bottom}rem
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Margin Top */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-gray-600 font-semibold">
                        <span>Margin Top</span>
                        <span className="font-bold text-gray-900">{item.margin_top}rem</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="6"
                        step="0.125"
                        value={item.margin_top}
                        onChange={(e) => handleUpdateSpacing(item.id, 'margin_top', Number(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                    </div>

                    {/* Margin Bottom */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-gray-600 font-semibold">
                        <span>Margin Bottom</span>
                        <span className="font-bold text-gray-900">{item.margin_bottom}rem</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="6"
                        step="0.125"
                        value={item.margin_bottom}
                        onChange={(e) => handleUpdateSpacing(item.id, 'margin_bottom', Number(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* 1-Click Quick Presets for Outer Margin (REM) */}
                  <div className="flex items-center justify-between gap-1 pt-1 border-t border-gray-100 flex-wrap">
                    <span className="text-[10px] text-gray-400 font-bold">Presets:</span>
                    {[
                      { label: '0rem (None)', val: 0 },
                      { label: '0.5rem', val: 0.5 },
                      { label: '1rem', val: 1 },
                      { label: '1.5rem (Normal)', val: 1.5 },
                      { label: '2rem', val: 2 },
                      { label: '3rem', val: 3 },
                      { label: '4rem (Extra)', val: 4 },
                    ].map((p) => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => {
                          handleUpdateSpacing(item.id, 'margin_top', p.val);
                          handleUpdateSpacing(item.id, 'margin_bottom', p.val);
                        }}
                        className={`px-1.5 py-0.5 text-[10px] rounded transition-all cursor-pointer ${
                          item.margin_top === p.val && item.margin_bottom === p.val
                            ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-400'
                            : 'text-gray-500 hover:text-gray-800 bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer: Quick Info */}
              <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3 text-xs text-gray-500 rounded-b-2xl">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-gray-400">ID: {item.id}</span>
                  <span className="text-gray-300">•</span>
                  <span>Position #{index + 1}</span>
                </div>
                <div className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                  <span>Saved via</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Save Section
                  </span>
                  <span>button in card header</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Sticky Bar if Unsaved Changes */}
      {hasUnsavedChanges && (
        <div className="sticky bottom-6 z-40 bg-gray-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border border-white/10 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
            <span className="text-xs sm:text-sm font-bold">
              Layout order ya spacing me changes hue hain. Save karein taaki website pe turant dikhe!
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 bg-gradient-to-r from-[#D26900] to-[#E65100] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:from-[#B45309] hover:to-[#D26900] transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes Now'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
