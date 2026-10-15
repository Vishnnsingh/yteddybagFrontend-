import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  useHomeBanner,
  type HomeCustomCardItem,
} from '../../Context/HomeBannerContext';
import { useHeaderNavigation } from '../../Context/HeaderNavigationContext';
import { BANNER_FONT_OPTIONS } from '../Pages/ManageHomeBanner';
import { CLASSIC_BORDER_OPTIONS, ClassicBorderFrame } from '../../Components/ClassicBorderFrames';
import AdminConfirmModal from './AdminConfirmModal';
import AdminSectionInstanceSelector from './AdminSectionInstanceSelector';

interface CardModalForm {
  id?: string;
  title: string;
  subtitle: string;
  badge_text: string;
  button_text: string;
  image_url: string;
  text_position: 'above' | 'below' | 'inside_clean' | 'inside_bottom' | 'inside_center' | 'inside_top';
  content_align: 'left' | 'center' | 'right';
  vertical_align: 'top' | 'center' | 'bottom';
  bg_color: string;
  card_radius: number;
  card_padding?: number | null; // In-card space around frame (border se bahar space)
  image_padding?: number | null; // Space inside frame around image (border ke andar image space)
  border_mode: 'none' | 'modern' | 'classic' | 'custom_image';
  border_same_all: boolean;
  border_width: number;
  border_top_width: number;
  border_right_width: number;
  border_bottom_width: number;
  border_left_width: number;
  border_style: string;
  border_color: string;
  classic_border_style: string;
  border_image_url: string;
  title_color: string;
  subtitle_color: string;
  badge_color: string;
  button_color: string;
  font_family: string;
  font_weight: string;
  link_type: 'header' | 'dropdown';
  target_header_id?: string;
  target_dropdown_id?: string;
  link_url: string;
  is_active: boolean;
}

const emptyCardForm: CardModalForm = {
  title: '',
  subtitle: '',
  badge_text: '',
  button_text: '',
  image_url: '',
  text_position: 'below',
  content_align: 'center',
  vertical_align: 'center',
  bg_color: '#FFFFFF',
  card_radius: 16,
  card_padding: null,
  image_padding: null,
  border_mode: 'classic',
  border_same_all: true,
  border_width: 1,
  border_top_width: 1,
  border_right_width: 1,
  border_bottom_width: 1,
  border_left_width: 1,
  border_style: 'solid',
  border_color: '#D26900',
  classic_border_style: 'victorian-ornate',
  border_image_url: '',
  title_color: '#111827',
  subtitle_color: '#4B5563',
  badge_color: '#D26900',
  button_color: '#D26900',
  font_family: 'Inter',
  font_weight: 'semibold',
  link_type: 'header',
  target_header_id: '',
  target_dropdown_id: '',
  link_url: '/',
  is_active: true,
};

interface CtaDropdownOption<T extends string = string> {
  value: T;
  label: string;
  category?: string;
  sublabel?: string;
}

function CtaDropdownSelect<T extends string = string>({
  value,
  options,
  onChange,
  placeholder = 'Select option...',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  enableSearch = false,
}: {
  value: T;
  options: CtaDropdownOption<T>[];
  onChange: (val: T) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  enableSearch?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

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

  const selectedOpt = options.find((opt) => opt.value === value);

  const filteredOptions = useMemo(() => {
    if (!enableSearch || !searchTerm.trim()) return options;
    const q = searchTerm.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.category && opt.category.toLowerCase().includes(q)) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(q))
    );
  }, [options, enableSearch, searchTerm]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setSearchTerm('');
        }}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-gray-300 hover:border-[#D26900] rounded-xl text-left cursor-pointer transition-colors focus:ring-2 focus:ring-[#D26900]/20 focus:border-[#D26900] ${
          isOpen ? 'border-[#D26900] ring-2 ring-[#D26900]/20 shadow-2xs' : ''
        } ${buttonClassName}`}
      >
        <span className="font-semibold text-gray-900 truncate">
          {selectedOpt ? selectedOpt.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-[#D26900] shrink-0 ml-2 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-amber-200/90 rounded-xl shadow-xl shadow-amber-900/10 max-h-64 overflow-y-auto p-1.5 space-y-0.5 ${menuClassName}`}
        >
          {enableSearch && options.length > 5 && (
            <div className="p-1 mb-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full px-2.5 py-1.5 text-xs border border-amber-200 rounded-lg focus:ring-2 focus:ring-[#D26900] focus:border-[#D26900] outline-hidden bg-amber-50/30"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-xs text-gray-400 text-center">No options found</div>
          ) : (
            filteredOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-50 text-[#D26900] font-bold border-l-4 border-[#D26900]'
                      : 'text-gray-700 hover:bg-amber-50/60 hover:text-[#D26900]'
                  }`}
                >
                  <div className="truncate pr-2">
                    {opt.category && (
                      <span className="text-[10px] text-gray-400 block font-normal">{opt.category}</span>
                    )}
                    <span>{opt.label}</span>
                    {opt.sublabel && (
                      <span className="text-[10px] text-gray-400 block font-normal">{opt.sublabel}</span>
                    )}
                  </div>
                  {isSelected && (
                    <svg className="w-4 h-4 text-[#D26900] shrink-0 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

interface AdminCustomCardsTabProps {
  targetSectionId?: string;
  onJumpToLayout?: () => void;
}

export default function AdminCustomCardsTab({ targetSectionId, onJumpToLayout }: AdminCustomCardsTabProps = {}) {
  const {
    adminCustomCards,
    customCardsSettings,
    customCardsLoading,
    fetchAdminCustomCards,
    createCustomCard,
    updateCustomCard,
    deleteCustomCard,
    reorderCustomCards,
    updateCustomCardsSettings,
    uploadBannerMedia,

    // Layout & section methods
    adminSectionsLayout,
    addSection,
    duplicateSection,
    deleteSection,
    saveSingleSectionLayout,
  } = useHomeBanner();

  const { adminItems } = useHeaderNavigation();

  // Multi-instance sections management
  const customCardsSections = useMemo(
    () => (adminSectionsLayout || []).filter((s) => s.section_type === 'custom_cards'),
    [adminSectionsLayout]
  );
  const [activeSectionId, setActiveSectionId] = useState<string>(targetSectionId || '');

  useEffect(() => {
    if (targetSectionId) {
      setActiveSectionId(targetSectionId);
    }
  }, [targetSectionId]);

  const activeSection = useMemo(() => {
    if (!customCardsSections.length) return null;
    return customCardsSections.find((s) => s.id === activeSectionId) || customCardsSections[0];
  }, [customCardsSections, activeSectionId]);

  const effectiveCustomCards: HomeCustomCardItem[] = useMemo(() => {
    if (activeSection) {
      if (Array.isArray(activeSection.items)) {
        return activeSection.items as HomeCustomCardItem[];
      }
      if (activeSection.id === 'custom_cards_1') {
        return adminCustomCards;
      }
      return [];
    }
    return adminCustomCards;
  }, [activeSection, adminCustomCards]);

  // Section master settings state
  const [isEnabled, setIsEnabled] = useState(customCardsSettings?.is_enabled !== false);
  const [sectionTitle, setSectionTitle] = useState(customCardsSettings?.section_title || 'Gifts for Every Feeling');
  const [sectionSubtitle, setSectionSubtitle] = useState(customCardsSettings?.section_subtitle || '');
  const [titleAlign, setTitleAlign] = useState<'left' | 'center' | 'right'>(customCardsSettings?.title_align || 'left');
  const [titleColor, setTitleColor] = useState(customCardsSettings?.title_color || '#111827');
  const [subtitleColor, setSubtitleColor] = useState(customCardsSettings?.subtitle_color || '#6B7280');
  const [sectionBgMode, setSectionBgMode] = useState<'transparent' | 'color' | 'gradient'>(
    customCardsSettings?.section_bg_mode || 'transparent'
  );
  const [sectionBgColor, setSectionBgColor] = useState(customCardsSettings?.section_bg_color || '#FFFFFF');
  const [sectionGradient, setSectionGradient] = useState(
    customCardsSettings?.section_gradient || 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)'
  );
  const [gradientStart, setGradientStart] = useState('#FFF7ED');
  const [gradientEnd, setGradientEnd] = useState('#FFFFFF');
  const [gradientAngle, setGradientAngle] = useState('135deg');

  const [cardsPerRow, setCardsPerRow] = useState<number>(customCardsSettings?.cards_per_row || 5);
  const [cardAspectRatio, setCardAspectRatio] = useState<'square' | 'tall' | 'standard' | 'auto'>(
    customCardsSettings?.card_aspect_ratio || 'tall'
  );
  const [globalCardRadius, setGlobalCardRadius] = useState<number>(customCardsSettings?.global_card_radius || 16);
  const [globalBorderMode, setGlobalBorderMode] = useState<'none' | 'modern' | 'classic' | 'custom_image'>(
    customCardsSettings?.global_border_mode || 'classic'
  );
  const [globalClassicBorder, setGlobalClassicBorder] = useState(
    customCardsSettings?.global_classic_border || 'victorian-ornate'
  );
  const [globalBorderColor, setGlobalBorderColor] = useState(
    customCardsSettings?.global_border_color || '#D26900'
  );
  const [globalBorderWidth, setGlobalBorderWidth] = useState<number>(
    customCardsSettings?.global_border_width || 1
  );
  const [globalTextPosition, setGlobalTextPosition] = useState<'above' | 'below' | 'inside_clean' | 'inside_bottom' | 'inside_center'>(
    customCardsSettings?.global_text_position || 'below'
  );
  const [cardHoverEffect, setCardHoverEffect] = useState<'none' | 'glow' | 'lift' | 'zoom'>(
    customCardsSettings?.card_hover_effect || 'none'
  );
  const [globalCardPadding, setGlobalCardPadding] = useState<number>(
    customCardsSettings?.card_padding ?? 8
  );
  const [globalImagePadding, setGlobalImagePadding] = useState<number>(
    customCardsSettings?.image_padding ?? 0
  );
  const [cardBgColor, setCardBgColor] = useState(customCardsSettings?.card_bg_color || '#FFFFFF');

  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Sync settings when active section or context changes
  useEffect(() => {
    if (activeSection) {
      const secSettings = activeSection.settings || {};
      setIsEnabled(activeSection.is_enabled !== false);
      const resolvedTitle =
        activeSection.section_title !== undefined && activeSection.section_title !== null && activeSection.section_title !== ''
          ? activeSection.section_title
          : secSettings.section_title !== undefined && secSettings.section_title !== null && secSettings.section_title !== ''
          ? secSettings.section_title
          : (activeSection.id === 'custom_cards_1' ? 'Gifts for Every Feeling' : (activeSection.custom_label || ''));
      setSectionTitle(resolvedTitle);

      const resolvedSubtitle =
        activeSection.section_subtitle !== undefined && activeSection.section_subtitle !== null
          ? activeSection.section_subtitle
          : (secSettings.section_subtitle || '');
      setSectionSubtitle(resolvedSubtitle);

      setTitleAlign(secSettings.title_align || 'left');
      setTitleColor(secSettings.title_color || '#111827');
      setSubtitleColor(secSettings.subtitle_color || '#6B7280');
      setSectionBgMode((activeSection.section_bg_mode as any) || secSettings.section_bg_mode || 'transparent');
      setSectionBgColor(activeSection.section_bg_color || secSettings.section_bg_color || '#FFFFFF');
      setSectionGradient(secSettings.section_gradient || 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)');
      setCardsPerRow(Number(activeSection.cards_per_row || secSettings.cards_per_row || 5));
      setCardAspectRatio((activeSection.card_aspect_ratio as any) || secSettings.card_aspect_ratio || 'tall');
      setGlobalCardRadius(secSettings.global_card_radius !== undefined ? Number(secSettings.global_card_radius) : 16);
      setGlobalBorderMode((activeSection.border_mode as any) || secSettings.global_border_mode || 'classic');
      setGlobalClassicBorder(activeSection.classic_border_style || secSettings.global_classic_border || 'victorian-ornate');
      setGlobalBorderColor(secSettings.global_border_color || '#D26900');
      setGlobalBorderWidth(secSettings.global_border_width !== undefined ? Number(secSettings.global_border_width) : 1);
      setGlobalTextPosition((activeSection.text_position as any) || secSettings.global_text_position || 'below');
      setCardHoverEffect(secSettings.card_hover_effect || 'none');
      setGlobalCardPadding(secSettings.card_padding !== undefined ? Number(secSettings.card_padding) : 8);
      setGlobalImagePadding(secSettings.image_padding !== undefined ? Number(secSettings.image_padding) : 0);
      setCardBgColor(secSettings.card_bg_color || '#FFFFFF');
    } else if (customCardsSettings) {
      setIsEnabled(customCardsSettings.is_enabled !== false);
      setSectionTitle(customCardsSettings.section_title || 'Gifts for Every Feeling');
      setSectionSubtitle(customCardsSettings.section_subtitle || '');
      setTitleAlign(customCardsSettings.title_align || 'left');
      setTitleColor(customCardsSettings.title_color || '#111827');
      setSubtitleColor(customCardsSettings.subtitle_color || '#6B7280');
      setSectionBgMode(customCardsSettings.section_bg_mode || 'transparent');
      setSectionBgColor(customCardsSettings.section_bg_color || '#FFFFFF');
      setSectionGradient(customCardsSettings.section_gradient || 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)');
      setCardsPerRow(customCardsSettings.cards_per_row || 5);
      setCardAspectRatio(customCardsSettings.card_aspect_ratio || 'tall');
      setGlobalCardRadius(customCardsSettings.global_card_radius ?? 16);
      setGlobalBorderMode(customCardsSettings.global_border_mode || 'classic');
      setGlobalClassicBorder(customCardsSettings.global_classic_border || 'victorian-ornate');
      setGlobalBorderColor(customCardsSettings.global_border_color || '#D26900');
      setGlobalBorderWidth(customCardsSettings.global_border_width || 1);
      setGlobalTextPosition(customCardsSettings.global_text_position || 'below');
      setCardHoverEffect(customCardsSettings.card_hover_effect || 'none');
      setGlobalCardPadding(customCardsSettings.card_padding ?? 8);
      setGlobalImagePadding(customCardsSettings.image_padding ?? 0);
      setCardBgColor(customCardsSettings.card_bg_color || '#FFFFFF');
    }
  }, [activeSection, customCardsSettings]);

  // Card modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CardModalForm>(emptyCardForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingBorder, setIsUploadingBorder] = useState(false);
  const imageFileInputRef = useRef<HTMLInputElement | null>(null);
  const borderFileInputRef = useRef<HTMLInputElement | null>(null);

  // Delete modal state
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; title: string }>({
    isOpen: false,
    id: '',
    title: '',
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Dropdown selectors open state
  const [openDropdown, setOpenDropdown] = useState<'header' | 'subitem' | 'font' | null>(null);
  const [headerSearch, setHeaderSearch] = useState('');
  const [subItemSearch, setSubItemSearch] = useState('');
  const [fontSearch, setFontSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch admin cards on mount
  useEffect(() => {
    fetchAdminCustomCards();
  }, [fetchAdminCustomCards]);

  // Flattened dropdown options
  const allDropdownOptions = useMemo(() => {
    const list: { id: string; headerTitle: string; title: string; path: string }[] = [];
    adminItems.forEach((h) => {
      (h.dropdown_items || []).forEach((d) => {
        list.push({
          id: d.id,
          headerTitle: h.title,
          title: d.title,
          path: d.path,
        });
      });
    });
    return list;
  }, [adminItems]);

  const filteredHeaders = useMemo(() => {
    if (!headerSearch.trim()) return adminItems;
    const q = headerSearch.toLowerCase();
    return adminItems.filter((h) => h.title.toLowerCase().includes(q) || h.path.toLowerCase().includes(q));
  }, [adminItems, headerSearch]);

  const filteredSubitems = useMemo(() => {
    if (!subItemSearch.trim()) return allDropdownOptions;
    const q = subItemSearch.toLowerCase();
    return allDropdownOptions.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.headerTitle.toLowerCase().includes(q) ||
        d.path.toLowerCase().includes(q)
    );
  }, [allDropdownOptions, subItemSearch]);

  const _filteredFonts = useMemo(() => {
    if (!fontSearch.trim()) return BANNER_FONT_OPTIONS;
    const q = fontSearch.toLowerCase();
    return BANNER_FONT_OPTIONS.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.label.toLowerCase().includes(q)
    );
  }, [fontSearch]);
  void _filteredFonts;

  // Handle Save Settings
  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      if (activeSection) {
        await saveSingleSectionLayout(activeSection.id, {
          section_title: sectionTitle,
          section_subtitle: sectionSubtitle,
          custom_label: sectionTitle || activeSection.custom_label,
          border_mode: globalBorderMode,
          classic_border_style: globalClassicBorder,
          card_aspect_ratio: cardAspectRatio === 'auto' ? undefined : cardAspectRatio,
          cards_per_row: Number(cardsPerRow),
          text_position: globalTextPosition,
          section_bg_mode: sectionBgMode,
          section_bg_color: sectionBgColor,
          settings: {
            ...(activeSection.settings || {}),
            is_enabled: isEnabled,
            section_title: sectionTitle,
            section_subtitle: sectionSubtitle,
            title_align: titleAlign,
            title_color: titleColor,
            subtitle_color: subtitleColor,
            section_bg_mode: sectionBgMode,
            section_bg_color: sectionBgColor,
            section_gradient: sectionGradient,
            cards_per_row: Number(cardsPerRow),
            card_aspect_ratio: cardAspectRatio,
            global_card_radius: Number(globalCardRadius),
            global_border_mode: globalBorderMode,
            global_classic_border: globalClassicBorder,
            global_border_color: globalBorderColor,
            global_border_width: Number(globalBorderWidth),
            global_text_position: globalTextPosition,
            card_padding: Number(globalCardPadding),
            image_padding: Number(globalImagePadding),
            card_hover_effect: cardHoverEffect,
            card_bg_color: cardBgColor,
          },
        });
        // ONLY sync to global customCardsSettings if there is strictly 1 section and it is the default section
        if (customCardsSections.length === 1 && activeSection.id === 'custom_cards_1') {
          await updateCustomCardsSettings({
            is_enabled: isEnabled,
            section_title: sectionTitle,
            section_subtitle: sectionSubtitle,
            title_align: titleAlign,
            title_color: titleColor,
            subtitle_color: subtitleColor,
            section_bg_mode: sectionBgMode,
            section_bg_color: sectionBgColor,
            section_gradient: sectionGradient,
            cards_per_row: Number(cardsPerRow),
            card_aspect_ratio: cardAspectRatio,
            global_card_radius: Number(globalCardRadius),
            global_border_mode: globalBorderMode,
            global_classic_border: globalClassicBorder,
            global_border_color: globalBorderColor,
            global_border_width: Number(globalBorderWidth),
            global_text_position: globalTextPosition,
            card_padding: Number(globalCardPadding),
            image_padding: Number(globalImagePadding),
            card_hover_effect: cardHoverEffect,
            card_bg_color: cardBgColor,
          });
        }
      } else {
        await updateCustomCardsSettings({
          is_enabled: isEnabled,
          section_title: sectionTitle,
          section_subtitle: sectionSubtitle,
          title_align: titleAlign,
          title_color: titleColor,
          subtitle_color: subtitleColor,
          section_bg_mode: sectionBgMode,
          section_bg_color: sectionBgColor,
          section_gradient: sectionGradient,
          cards_per_row: Number(cardsPerRow),
          card_aspect_ratio: cardAspectRatio,
          global_card_radius: Number(globalCardRadius),
          global_border_mode: globalBorderMode,
          global_classic_border: globalClassicBorder,
          global_border_color: globalBorderColor,
          global_border_width: Number(globalBorderWidth),
          global_text_position: globalTextPosition,
          card_padding: Number(globalCardPadding),
          image_padding: Number(globalImagePadding),
          card_hover_effect: cardHoverEffect,
          card_bg_color: cardBgColor,
        });
      }
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Open modal for add
  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setOpenDropdown(null);
    setHeaderSearch('');
    setSubItemSearch('');
    setFontSearch('');

    const firstHeader = adminItems[0];
    setFormData({
      ...emptyCardForm,
      link_type: 'header',
      target_header_id: firstHeader?.id || '',
      link_url: firstHeader?.path || '/',
      classic_border_style: globalClassicBorder,
      border_mode: globalBorderMode,
      border_color: globalBorderColor,
      card_radius: globalCardRadius,
      card_padding: globalCardPadding,
      image_padding: globalImagePadding,
      text_position: globalTextPosition as any,
      bg_color: cardBgColor || '#FFFFFF',
      button_color: '#D26900',
    });
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (card: HomeCustomCardItem) => {
    setIsEditing(true);
    setEditingId(card.id);
    setOpenDropdown(null);
    setHeaderSearch('');
    setSubItemSearch('');
    setFontSearch('');

    setFormData({
      id: card.id,
      title: card.title || '',
      subtitle: card.subtitle || '',
      badge_text: card.badge_text || '',
      button_text: card.button_text || '',
      image_url: card.image_url || '',
      text_position: (card.text_position || 'below') as any,
      content_align: card.content_align || 'center',
      vertical_align: card.vertical_align || 'center',
      bg_color: card.bg_color || '#FFFFFF',
      card_radius: card.card_radius ?? 16,
      card_padding: card.card_padding !== undefined && card.card_padding !== null ? Number(card.card_padding) : globalCardPadding,
      image_padding: card.image_padding !== undefined && card.image_padding !== null ? Number(card.image_padding) : globalImagePadding,
      border_mode: card.border_mode || 'classic',
      border_same_all: card.border_same_all !== false,
      border_width: card.border_width ?? 1,
      border_top_width: card.border_top_width ?? 1,
      border_right_width: card.border_right_width ?? 1,
      border_bottom_width: card.border_bottom_width ?? 1,
      border_left_width: card.border_left_width ?? 1,
      border_style: card.border_style || 'solid',
      border_color: card.border_color || '#D26900',
      classic_border_style: card.classic_border_style || 'victorian-ornate',
      border_image_url: card.border_image_url || '',
      title_color: card.title_color || '#111827',
      subtitle_color: card.subtitle_color || '#4B5563',
      badge_color: card.badge_color || '#D26900',
      button_color: card.button_color || '#D26900',
      font_family: card.font_family || 'Inter',
      font_weight: card.font_weight || 'semibold',
      link_type: card.link_type || 'header',
      target_header_id: card.target_header_id || '',
      target_dropdown_id: card.target_dropdown_id || '',
      link_url: card.link_url || '/',
      is_active: card.is_active !== false,
    });
    setIsModalOpen(true);
  };

  // Upload image handler (replaces old file & updates state)
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingImage(true);
      const res = await uploadBannerMedia(file);
      if (res?.url) {
        setFormData((prev) => ({ ...prev, image_url: res.url }));
        toast.success('Card image uploaded successfully!');
      }
    } catch (err) {
      toast.error('Image upload failed');
    } finally {
      setIsUploadingImage(false);
      if (imageFileInputRef.current) imageFileInputRef.current.value = '';
    }
  };

  // Upload custom border frame image handler
  const handleBorderFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingBorder(true);
      const res = await uploadBannerMedia(file);
      if (res?.url) {
        setFormData((prev) => ({ ...prev, border_image_url: res.url }));
        toast.success('Custom border frame uploaded!');
      }
    } catch (err) {
      toast.error('Border image upload failed');
    } finally {
      setIsUploadingBorder(false);
      if (borderFileInputRef.current) borderFileInputRef.current.value = '';
    }
  };

  // Save Card form
  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() && !formData.image_url.trim()) {
      toast.error('Please enter at least a title or upload an image');
      return;
    }

    setIsSubmitting(true);
    try {
      if (activeSection) {
        const currentList = Array.isArray(activeSection.items)
          ? (activeSection.items as any[])
          : (activeSection.id === 'custom_cards_1' ? [...adminCustomCards] : []);
        if (isEditing && editingId) {
          const updated = currentList.map((c) =>
            c.id === editingId ? { ...c, ...formData, updated_at: new Date().toISOString() } : c
          );
          await saveSingleSectionLayout(activeSection.id, { items: updated });
          if (customCardsSections.length === 1 && activeSection.id === 'custom_cards_1') {
            if (adminCustomCards.some((c) => c.id === editingId)) {
              await updateCustomCard(editingId, formData);
            }
          }
        } else {
          const newId = `custom_card_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          const newCard: any = {
            id: newId,
            ...formData,
            order_index: (effectiveCustomCards?.length || 0) + 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          const updated = [...currentList, newCard];
          await saveSingleSectionLayout(activeSection.id, { items: updated });
          if (customCardsSections.length === 1 && activeSection.id === 'custom_cards_1' && activeSection.items === undefined) {
            await createCustomCard(formData);
          }
        }
        setIsModalOpen(false);
        setFormData(emptyCardForm);
      } else {
        if (isEditing && editingId) {
          const success = await updateCustomCard(editingId, formData);
          if (success) {
            setIsModalOpen(false);
            setFormData(emptyCardForm);
          }
        } else {
          const success = await createCustomCard(formData);
          if (success) {
            setIsModalOpen(false);
            setFormData(emptyCardForm);
          }
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm delete card
  const handleConfirmDelete = async () => {
    if (!deleteConfirm.id) return;
    setIsDeleting(true);
    try {
      if (activeSection) {
        const currentList = Array.isArray(activeSection.items)
          ? (activeSection.items as any[])
          : (activeSection.id === 'custom_cards_1' ? [...adminCustomCards] : []);
        const updated = currentList.filter((c) => c.id !== deleteConfirm.id);
        await saveSingleSectionLayout(activeSection.id, { items: updated });
        if (customCardsSections.length === 1 && activeSection.id === 'custom_cards_1') {
          if (adminCustomCards.some((c) => c.id === deleteConfirm.id)) {
            await deleteCustomCard(deleteConfirm.id);
          }
        }
      } else {
        await deleteCustomCard(deleteConfirm.id);
      }
      setDeleteConfirm({ isOpen: false, id: '', title: '' });
    } finally {
      setIsDeleting(false);
    }
  };

  // Reorder move up / down
  const handleMoveUp = async (index: number) => {
    if (index <= 0) return;
    const reordered = [...effectiveCustomCards];
    const temp = reordered[index];
    reordered[index] = reordered[index - 1];
    reordered[index - 1] = temp;
    if (activeSection) {
      await saveSingleSectionLayout(activeSection.id, { items: reordered });
    }
    if (!activeSection || (customCardsSections.length === 1 && activeSection.id === 'custom_cards_1')) {
      await reorderCustomCards(reordered.map((c) => c.id));
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index >= effectiveCustomCards.length - 1) return;
    const reordered = [...effectiveCustomCards];
    const temp = reordered[index];
    reordered[index] = reordered[index + 1];
    reordered[index + 1] = temp;
    if (activeSection) {
      await saveSingleSectionLayout(activeSection.id, { items: reordered });
    }
    if (!activeSection || (customCardsSections.length === 1 && activeSection.id === 'custom_cards_1')) {
      await reorderCustomCards(reordered.map((c) => c.id));
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-sans">
      <AdminSectionInstanceSelector
        sectionType="custom_cards"
        typeTitle="Showcase Cards"
        defaultLabel="Showcase Cards"
        icon="🪟"
        sections={customCardsSections}
        activeSection={activeSection}
        onSelectSection={(id) => setActiveSectionId(id)}
        onAddSection={async () => {
          const newId = await addSection('custom_cards', `Showcase Cards #${customCardsSections.length + 1}`, []);
          if (newId) setActiveSectionId(newId);
        }}
        onDuplicateSection={async (id) => {
          const dupId = await duplicateSection(id);
          if (dupId) setActiveSectionId(dupId);
        }}
        onDeleteSection={async (id) => {
          if (customCardsSections.length <= 1) {
            toast.error('At least one Showcase Cards section must remain.');
            return;
          }
          const success = await deleteSection(id);
          if (success) {
            const remaining = customCardsSections.filter((s) => s.id !== id);
            if (remaining[0]) setActiveSectionId(remaining[0].id);
          }
        }}
        onJumpToLayout={onJumpToLayout}
      />
      {/* Master Section Configuration Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4 bg-linear-to-r from-amber-50/50 via-orange-50/30 to-white">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-orange-100 text-[#D26900]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Showcase Cards Settings</h2>
                <p className="text-xs text-gray-500">Configure global layout, vintage borders, columns, and background</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className="text-xs font-semibold text-gray-700">Section Enabled</span>
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="w-4 h-4 text-[#D26900] rounded-sm focus:ring-[#D26900]"
              />
            </label>

            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={isSavingSettings}
              className="px-4 py-2 bg-[#D26900] hover:bg-[#b85b00] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isSavingSettings ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Section Title & Alignment */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Section Title (Optional)</label>
            <input
              type="text"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              placeholder="e.g. Gifts for Every Feeling (or leave blank)"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D26900] focus:border-transparent outline-hidden"
            />
          </div>

          {/* Section Subtitle */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Section Subtitle (Optional)</label>
            <input
              type="text"
              value={sectionSubtitle}
              onChange={(e) => setSectionSubtitle(e.target.value)}
              placeholder="e.g. When emotions matter most, send a gift..."
              className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D26900] focus:border-transparent outline-hidden"
            />
          </div>

          {/* Title Alignment */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Header Alignment</label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 rounded-xl border border-gray-200">
              {(['left', 'center', 'right'] as const).map((align) => (
                <button
                  key={align}
                  type="button"
                  onClick={() => setTitleAlign(align)}
                  className={`py-1.5 text-xs font-bold capitalize rounded-lg transition-all cursor-pointer ${
                    titleAlign === align
                      ? 'bg-white text-gray-900 shadow-2xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {align}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Per Row (Dynamic Columns 3, 4, 5, 6) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Cards Per Row (Desktop)</label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-gray-100 rounded-xl border border-gray-200">
              {[3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setCardsPerRow(num)}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    cardsPerRow === num
                      ? 'bg-white text-[#D26900] shadow-2xs ring-1 ring-black/5'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {num} Cards
                </button>
              ))}
            </div>
          </div>

          {/* Card Aspect Ratio */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Card Proportion / Aspect Ratio</label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 rounded-xl border border-gray-200">
              {[
                { id: 'square', label: 'Square (1:1)' },
                { id: 'tall', label: 'Tall (3:4)' },
                { id: 'standard', label: 'Standard (4:3)' },
              ].map((ratio) => (
                <button
                  key={ratio.id}
                  type="button"
                  onClick={() => setCardAspectRatio(ratio.id as any)}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    cardAspectRatio === ratio.id
                      ? 'bg-white text-[#D26900] shadow-2xs ring-1 ring-black/5'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section Background Mode */}
          <div className="space-y-1.5 md:col-span-2 lg:col-span-3 p-4 bg-amber-50/30 rounded-2xl border border-amber-200/60">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-800">Section Background Style & Color</label>
              <span className="text-[11px] text-gray-500">Solid color, custom gradient, or original theme</span>
            </div>

            <div className="grid grid-cols-3 gap-2 p-1 bg-white rounded-xl border border-gray-200 mb-3 max-w-md">
              {[
                { id: 'transparent', label: 'Original Theme' },
                { id: 'color', label: 'Solid Color' },
                { id: 'gradient', label: 'Custom Gradient' },
              ].map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => setSectionBgMode(bg.id as any)}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    sectionBgMode === bg.id
                      ? 'bg-[#D26900] text-white shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {bg.label}
                </button>
              ))}
            </div>

            {/* When Solid Color is selected */}
            {sectionBgMode === 'color' && (
              <div className="space-y-3 pt-2 border-t border-amber-200/40">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={sectionBgColor}
                      onChange={(e) => setSectionBgColor(e.target.value)}
                      className="w-10 h-10 rounded-xl border border-gray-300 p-0.5 cursor-pointer shrink-0 shadow-2xs"
                    />
                    <input
                      type="text"
                      value={sectionBgColor}
                      onChange={(e) => setSectionBgColor(e.target.value)}
                      placeholder="#FFFFFF"
                      className="w-32 px-3 py-2 text-xs font-mono font-bold uppercase border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D26900] focus:border-transparent outline-hidden bg-white"
                    />
                  </div>

                  {/* Preset Solid Color Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-semibold text-gray-500 mr-1">Presets:</span>
                    {[
                      { name: 'White', color: '#FFFFFF' },
                      { name: 'Warm Cream', color: '#FFF7ED' },
                      { name: 'Soft Amber', color: '#FEF3C7' },
                      { name: 'Rose Blush', color: '#FFF1F2' },
                      { name: 'Mint Green', color: '#F0FDF4' },
                      { name: 'Soft Blue', color: '#EFF6FF' },
                      { name: 'Lavender', color: '#F5F3FF' },
                      { name: 'Dark Slate', color: '#1F2937' },
                      { name: 'Deep Black', color: '#111827' },
                    ].map((preset) => (
                      <button
                        key={preset.color}
                        type="button"
                        onClick={() => setSectionBgColor(preset.color)}
                        className={`w-6 h-6 rounded-lg border transition-transform hover:scale-110 cursor-pointer shadow-2xs ${
                          sectionBgColor.toLowerCase() === preset.color.toLowerCase()
                            ? 'ring-2 ring-[#D26900] ring-offset-1 border-[#D26900]'
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: preset.color }}
                        title={`${preset.name} (${preset.color})`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* When Gradient is selected */}
            {sectionBgMode === 'gradient' && (
              <div className="space-y-3 pt-2 border-t border-amber-200/40">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Start Color */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-700">Start Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={gradientStart}
                        onChange={(e) => {
                          setGradientStart(e.target.value);
                          setSectionGradient(`linear-gradient(${gradientAngle}, ${e.target.value} 0%, ${gradientEnd} 100%)`);
                        }}
                        className="w-8 h-8 rounded-lg border border-gray-300 p-0.5 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={gradientStart}
                        onChange={(e) => {
                          setGradientStart(e.target.value);
                          setSectionGradient(`linear-gradient(${gradientAngle}, ${e.target.value} 0%, ${gradientEnd} 100%)`);
                        }}
                        className="w-full px-2 py-1.5 text-xs font-mono border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#D26900] outline-hidden"
                      />
                    </div>
                  </div>

                  {/* End Color */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-700">End Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={gradientEnd}
                        onChange={(e) => {
                          setGradientEnd(e.target.value);
                          setSectionGradient(`linear-gradient(${gradientAngle}, ${gradientStart} 0%, ${e.target.value} 100%)`);
                        }}
                        className="w-8 h-8 rounded-lg border border-gray-300 p-0.5 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={gradientEnd}
                        onChange={(e) => {
                          setGradientEnd(e.target.value);
                          setSectionGradient(`linear-gradient(${gradientAngle}, ${gradientStart} 0%, ${e.target.value} 100%)`);
                        }}
                        className="w-full px-2 py-1.5 text-xs font-mono border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#D26900] outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Angle / Direction */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-700">Direction</label>
                    <CtaDropdownSelect
                      value={gradientAngle}
                      onChange={(val) => {
                        setGradientAngle(val);
                        setSectionGradient(`linear-gradient(${val}, ${gradientStart} 0%, ${gradientEnd} 100%)`);
                      }}
                      options={[
                        { value: '135deg', label: 'Diagonal (135deg)' },
                        { value: 'to bottom', label: 'Top to Bottom' },
                        { value: 'to right', label: 'Left to Right' },
                        { value: '45deg', label: 'Bottom-Left to Top-Right (45deg)' },
                      ]}
                      buttonClassName="py-1.5"
                    />
                  </div>
                </div>

                {/* 1-Click Gradient Presets */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-gray-700 block">Gradient Presets:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { name: 'Warm Sunrise', gradient: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)', start: '#FFF7ED', end: '#FFFFFF' },
                      { name: 'Amber Glow', gradient: 'linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)', start: '#FEF3C7', end: '#FFFBEB' },
                      { name: 'Soft Rose', gradient: 'linear-gradient(135deg, #FFF1F2 0%, #FFFFFF 100%)', start: '#FFF1F2', end: '#FFFFFF' },
                      { name: 'Pastel Peach', gradient: 'linear-gradient(135deg, #FFEDD5 0%, #FEF3C7 100%)', start: '#FFEDD5', end: '#FEF3C7' },
                      { name: 'Royal Violet', gradient: 'linear-gradient(135deg, #F3E8FF 0%, #FFFFFF 100%)', start: '#F3E8FF', end: '#FFFFFF' },
                      { name: 'Fresh Mint', gradient: 'linear-gradient(135deg, #ECFDF5 0%, #F0FDFA 100%)', start: '#ECFDF5', end: '#F0FDFA' },
                      { name: 'Sky Breeze', gradient: 'linear-gradient(135deg, #E0F2FE 0%, #F0F9FF 100%)', start: '#E0F2FE', end: '#F0F9FF' },
                      { name: 'Dark Luxury', gradient: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', start: '#1F2937', end: '#111827' },
                    ].map((gp) => (
                      <button
                        key={gp.name}
                        type="button"
                        onClick={() => {
                          setSectionGradient(gp.gradient);
                          setGradientStart(gp.start);
                          setGradientEnd(gp.end);
                        }}
                        className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                          sectionGradient === gp.gradient
                            ? 'border-[#D26900] ring-2 ring-[#D26900]/25 shadow-xs'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{ background: gp.gradient }}
                      >
                        <span className={`text-[10px] font-bold block ${gp.name === 'Dark Luxury' ? 'text-white' : 'text-gray-900'}`}>
                          {gp.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Raw Gradient CSS Input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-600">Custom Gradient CSS Code</label>
                  <input
                    type="text"
                    value={sectionGradient}
                    onChange={(e) => setSectionGradient(e.target.value)}
                    placeholder="linear-gradient(...)"
                    className="w-full px-3 py-1.5 text-xs font-mono border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#D26900] outline-hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Card Hover Effect (User: card hile nahi na ander ka image hile, normal bhi rakhe) */}
          <div className="space-y-1.5 md:col-span-2 lg:col-span-3 p-4 bg-orange-50/20 rounded-2xl border border-orange-200/50">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-gray-800">Card Hover Animation (No Shake / No Movement)</label>
              <span className="text-[11px] font-semibold text-[#D26900]">Normal is rock-solid</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'none', label: 'Normal (Rock-Solid)', desc: 'Card aur image bilkul nahi hilegi' },
                { id: 'glow', label: 'Subtle Glow', desc: 'Halki shadow, no position movement' },
                { id: 'lift', label: 'Gentle Lift', desc: 'Card slightly lifts up' },
                { id: 'zoom', label: 'Image Zoom', desc: 'Card stays still, image zooms' },
              ].map((eff) => (
                <button
                  key={eff.id}
                  type="button"
                  onClick={() => setCardHoverEffect(eff.id as any)}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    cardHoverEffect === eff.id
                      ? 'bg-white border-[#D26900] ring-2 ring-[#D26900]/20 shadow-xs'
                      : 'bg-white/60 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">{eff.label}</span>
                    {cardHoverEffect === eff.id && (
                      <span className="w-2 h-2 rounded-full bg-[#D26900]"></span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-500 block mt-0.5">{eff.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Global Corner Radius */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700">Card Curve / Corner Radius</label>
              <span className="text-xs font-bold text-[#D26900]">{globalCardRadius}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="36"
              value={globalCardRadius}
              onChange={(e) => setGlobalCardRadius(Number(e.target.value))}
              className="w-full accent-[#D26900] cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-gray-400">
              <span>0px (Sharp)</span>
              <span>8px</span>
              <span>16px (Default)</span>
              <span>24px</span>
              <span>36px (Pill)</span>
            </div>
          </div>

          {/* Global In-Card Spacing (Border Se Bahar Space / Card Margin) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700">In-Card Space (Border Se Bahar Space)</label>
              <span className="text-xs font-bold text-[#D26900]">{globalCardPadding}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="32"
              value={globalCardPadding}
              onChange={(e) => setGlobalCardPadding(Number(e.target.value))}
              className="w-full accent-[#D26900] cursor-pointer"
            />
            <div className="flex items-center justify-between gap-1 pt-0.5">
              {[
                { label: '0px (Edge)', val: 0 },
                { label: '6px', val: 6 },
                { label: '8px (Default)', val: 8 },
                { label: '12px', val: 12 },
                { label: '18px', val: 18 },
              ].map((p) => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => setGlobalCardPadding(p.val)}
                  className={`px-1.5 py-0.5 text-[10px] rounded-sm transition-all cursor-pointer ${
                    globalCardPadding === p.val
                      ? 'bg-amber-100 text-[#D26900] font-bold border border-[#D26900]'
                      : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-400">Card ke border ke bahar space deta hai jisse card background color dikhega</p>
          </div>

          {/* Global Image Padding Inside Border (Border Ke Andar Image Space) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700">Image Space Inside Border (Border Ke Andar Space)</label>
              <span className="text-xs font-bold text-[#D26900]">{globalImagePadding}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="24"
              value={globalImagePadding}
              onChange={(e) => setGlobalImagePadding(Number(e.target.value))}
              className="w-full accent-[#D26900] cursor-pointer"
            />
            <div className="flex items-center justify-between gap-1 pt-0.5">
              {[
                { label: '0px (Flush)', val: 0 },
                { label: '4px', val: 4 },
                { label: '6px', val: 6 },
                { label: '10px', val: 10 },
                { label: '16px', val: 16 },
              ].map((p) => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => setGlobalImagePadding(p.val)}
                  className={`px-1.5 py-0.5 text-[10px] rounded-sm transition-all cursor-pointer ${
                    globalImagePadding === p.val
                      ? 'bg-amber-100 text-[#D26900] font-bold border border-[#D26900]'
                      : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-400">Border ke andar image ke charo taraf gap/padding deta hai</p>
          </div>

          {/* Global Border Mode */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Global Card Frame / Border</label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 rounded-xl border border-gray-200">
              {[
                { id: 'none', label: 'None' },
                { id: 'classic', label: 'Classic 14+ SVG' },
                { id: 'modern', label: 'Modern Frame' },
              ].map((bm) => (
                <button
                  key={bm.id}
                  type="button"
                  onClick={() => setGlobalBorderMode(bm.id as any)}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    globalBorderMode === bm.id
                      ? 'bg-white text-[#D26900] shadow-2xs ring-1 ring-black/5'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {bm.label}
                </button>
              ))}
            </div>
          </div>

          {/* Global Classic Border Style Selector */}
          {globalBorderMode === 'classic' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Default Classic Frame Style</label>
              <CtaDropdownSelect
                value={globalClassicBorder}
                onChange={(val) => setGlobalClassicBorder(val)}
                options={CLASSIC_BORDER_OPTIONS.map((opt) => ({
                  value: opt.id,
                  label: opt.name,
                  category: opt.category,
                }))}
                enableSearch={true}
              />
            </div>
          )}

          {/* Global Border Color */}
          {globalBorderMode !== 'none' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Frame / Border Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={globalBorderColor}
                  onChange={(e) => setGlobalBorderColor(e.target.value)}
                  className="w-9 h-9 rounded-lg border border-gray-300 p-0.5 cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={globalBorderColor}
                  onChange={(e) => setGlobalBorderColor(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D26900] focus:border-transparent outline-hidden font-mono"
                />
              </div>
            </div>
          )}

          {/* Global Text Position */}
          <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
            <label className="text-xs font-bold text-gray-700">Default Text Position</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1 bg-gray-100 rounded-xl border border-gray-200">
              {[
                { id: 'below', label: 'Below Card' },
                { id: 'above', label: 'Above Card' },
                { id: 'inside_clean', label: 'Inside (No Overlay)' },
                { id: 'inside_bottom', label: 'Inside Bottom' },
                { id: 'inside_center', label: 'Inside Center' },
              ].map((tp) => (
                <button
                  key={tp.id}
                  type="button"
                  onClick={() => setGlobalTextPosition(tp.id as any)}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    globalTextPosition === tp.id
                      ? 'bg-white text-[#D26900] shadow-2xs ring-1 ring-black/5'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tp.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Showcase Cards List */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Showcase Cards</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-50 text-[#D26900]">
                {effectiveCustomCards.length} {effectiveCustomCards.length === 1 ? 'Card' : 'Cards'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage custom cards, upload product images, select vintage borders, and map links
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-[#D26900] hover:bg-[#b85b00] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2 active:scale-98"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New Card</span>
          </button>
        </div>

        {/* Cards Table / List */}
        {effectiveCustomCards.length === 0 && !customCardsLoading ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-amber-50 flex items-center justify-center text-[#D26900]">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-gray-900">No Showcase Cards Yet</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Create your first card with custom vintage frames, offer badges, and direct header navigation links.
            </p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2 bg-[#D26900] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#b85b00] cursor-pointer"
            >
              Add Card
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {effectiveCustomCards.map((card, index) => {
              return (
                <div
                  key={card.id}
                  className="p-4 sm:p-5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 hover:bg-gray-50/70 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Reorder Buttons */}
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        title="Move Up"
                        className="p-1 rounded-md text-gray-400 hover:text-gray-700 disabled:opacity-20 hover:bg-gray-200 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === effectiveCustomCards.length - 1}
                        title="Move Down"
                        className="p-1 rounded-md text-gray-400 hover:text-gray-700 disabled:opacity-20 hover:bg-gray-200 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    {/* Thumbnail with classic frame preview */}
                    {(() => {
                      const tCardPad = card.card_padding !== undefined && card.card_padding !== null ? Math.round(card.card_padding / 2.5) : Math.round(globalCardPadding / 2.5);
                      const tImgPad = card.image_padding !== undefined && card.image_padding !== null ? Math.round(card.image_padding / 2.5) : Math.round(globalImagePadding / 2.5);
                      const tRadius = Math.max(0, (card.card_radius ?? 16) - tCardPad);
                      return (
                        <div
                          className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden shrink-0 border border-gray-200 shadow-2xs"
                          style={{
                            backgroundColor: card.bg_color || '#F9FAFB',
                            padding: `${tCardPad}px`,
                          }}
                        >
                          <div
                            className="relative w-full h-full overflow-hidden flex items-center justify-center"
                            style={{ borderRadius: `${tRadius}px` }}
                          >
                            {card.image_url ? (
                              <img
                                src={card.image_url}
                                alt={card.title}
                                className="w-full h-full object-cover"
                                style={{
                                  padding: `${tImgPad}px`,
                                  borderRadius: `${Math.max(0, tRadius - tImgPad)}px`,
                                }}
                              />
                            ) : (
                              <div
                                className="w-full h-full flex flex-col items-center justify-center p-1 text-center"
                                style={{ backgroundColor: card.bg_color || '#FFFFFF' }}
                              >
                                <svg className="w-5 h-5 text-gray-400 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                </svg>
                                <span className="text-[9px] font-bold text-gray-500 truncate max-w-full">
                                  {card.bg_color && card.bg_color !== 'transparent' ? card.bg_color : 'Color'}
                                </span>
                              </div>
                            )}
                            {card.border_mode === 'classic' && (
                              <ClassicBorderFrame
                                styleId={card.classic_border_style}
                                color={card.border_color || '#D26900'}
                                radius={tRadius}
                                borderWidth={1}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-gray-900 truncate">
                          {card.title || 'Untitled Card'}
                        </h4>
                        {card.badge_text && (
                          <span className="px-2 py-0.5 rounded-sm text-[10px] font-extrabold bg-amber-100 text-[#D26900]">
                            {card.badge_text}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-gray-100 text-gray-600">
                          Frame: {card.border_mode}
                        </span>
                        {card.card_padding !== null && card.card_padding !== undefined && (
                          <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-orange-50 text-[#D26900] border border-orange-200">
                            Outer: {card.card_padding}px
                          </span>
                        )}
                        {card.image_padding !== null && card.image_padding !== undefined && (
                          <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            Inner: {card.image_padding}px
                          </span>
                        )}
                      </div>
                      {card.subtitle && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">{card.subtitle}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
                        <span className="font-semibold text-gray-600">Links to:</span>
                        <span className="px-2 py-0.5 rounded-sm bg-gray-50 border border-gray-200 text-gray-700 font-mono text-[11px] truncate max-w-[200px] sm:max-w-[320px]">
                          {card.link_url || '/'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(card)}
                      className="p-2 text-gray-600 hover:text-[#D26900] hover:bg-amber-50 rounded-xl transition-all cursor-pointer"
                      title="Edit Card"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm({ isOpen: true, id: card.id, title: card.title })}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                      title="Delete Card"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Card Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-linear-to-r from-amber-50/50 to-white">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    {isEditing ? 'Edit Showcase Card' : 'Add New Showcase Card'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Customize borders, text alignment, image upload, and destination header
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Form Scrollable Body */}
              <form onSubmit={handleCardSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* 1. Basic Content with Individual Color Pickers (User requested: har text ka color change kr paye) */}
                <div className="space-y-4 p-4 bg-gray-50/70 rounded-2xl border border-gray-200/80">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-800">Card Text & Typography Colors</h4>
                    <span className="text-[11px] text-gray-500">Customize text and colors for each element</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Card Title / Name + Color */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Card Title / Name *</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="e.g. Watches & Wearables"
                          className="flex-1 px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D26900] focus:border-[#D26900] outline-hidden bg-white"
                          required
                        />
                        <div className="flex items-center gap-1 shrink-0" title="Title Text Color">
                          <input
                            type="color"
                            value={formData.title_color}
                            onChange={(e) => setFormData({ ...formData, title_color: e.target.value })}
                            className="w-9 h-9 rounded-xl border border-gray-300 p-0.5 cursor-pointer shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Subtitle / Tagline + Color */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Subtitle / Tagline (Optional)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={formData.subtitle}
                          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                          placeholder="e.g. Timeless elegance for every occasion"
                          className="flex-1 px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D26900] focus:border-[#D26900] outline-hidden bg-white"
                        />
                        <div className="flex items-center gap-1 shrink-0" title="Subtitle Text Color">
                          <input
                            type="color"
                            value={formData.subtitle_color}
                            onChange={(e) => setFormData({ ...formData, subtitle_color: e.target.value })}
                            className="w-9 h-9 rounded-xl border border-gray-300 p-0.5 cursor-pointer shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Badge / Offer Text + Color */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Badge / Offer Text (Optional)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={formData.badge_text}
                          onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                          placeholder="e.g. UP TO 80% OFF, 30-70% OFF"
                          className="flex-1 px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D26900] focus:border-[#D26900] outline-hidden bg-white"
                        />
                        <div className="flex items-center gap-1 shrink-0" title="Badge Text Color">
                          <input
                            type="color"
                            value={formData.badge_color}
                            onChange={(e) => setFormData({ ...formData, badge_color: e.target.value })}
                            className="w-9 h-9 rounded-xl border border-gray-300 p-0.5 cursor-pointer shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action / Button Text + Color */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Action / Button Text (Optional)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={formData.button_text}
                          onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                          placeholder="e.g. Shop Now, Explore More"
                          className="flex-1 px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D26900] focus:border-[#D26900] outline-hidden bg-white"
                        />
                        <div className="flex items-center gap-1 shrink-0" title="Button Text Color">
                          <input
                            type="color"
                            value={formData.button_color}
                            onChange={(e) => setFormData({ ...formData, button_color: e.target.value })}
                            className="w-9 h-9 rounded-xl border border-gray-300 p-0.5 cursor-pointer shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Card Background Color & Image (User: card ka color bhi change kr paye, image na lage to ye bhi option do) */}
                <div className="space-y-4 p-4 bg-amber-50/25 rounded-2xl border border-amber-200/60">
                  {/* Card Background Color */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-800">Card Background Color</label>
                      <span className="text-[11px] text-gray-500">Visible directly or when no image is uploaded</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.bg_color === 'transparent' ? '#FFFFFF' : formData.bg_color}
                          onChange={(e) => setFormData({ ...formData, bg_color: e.target.value })}
                          className="w-9 h-9 rounded-xl border border-gray-300 p-0.5 cursor-pointer shrink-0 shadow-2xs"
                        />
                        <input
                          type="text"
                          value={formData.bg_color}
                          onChange={(e) => setFormData({ ...formData, bg_color: e.target.value })}
                          placeholder="#FFFFFF"
                          className="w-28 px-2.5 py-1.5 text-xs font-mono font-bold uppercase border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D26900] focus:border-[#D26900] outline-hidden bg-white"
                        />
                      </div>

                      {/* Card Bg Presets */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[
                          { name: 'Pure White', color: '#FFFFFF' },
                          { name: 'Warm Cream', color: '#FFF7ED' },
                          { name: 'Soft Amber', color: '#FEF3C7' },
                          { name: 'Light Gray', color: '#F9FAFB' },
                          { name: 'Soft Blush', color: '#FDF2F8' },
                          { name: 'Soft Mint', color: '#F0FDF4' },
                          { name: 'Dark Slate', color: '#1F2937' },
                          { name: 'Transparent', color: 'transparent' },
                        ].map((preset) => (
                          <button
                            key={preset.color}
                            type="button"
                            onClick={() => setFormData({ ...formData, bg_color: preset.color })}
                            className={`px-2 py-1 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer ${
                              formData.bg_color.toLowerCase() === preset.color.toLowerCase()
                                ? 'bg-amber-100 text-[#D26900] border-[#D26900] ring-1 ring-[#D26900]'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Image (Optional) */}
                  <div className="pt-3 border-t border-amber-200/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-800">
                        Card Image <span className="font-normal text-gray-500">(Optional - Color cards work without images)</span>
                      </label>
                      {formData.image_url ? (
                        <span className="text-[11px] font-bold text-emerald-600">Image Attached</span>
                      ) : (
                        <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                          Color-Only Mode Active
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap sm:flex-nowrap gap-4 items-center">
                      {/* Thumbnail preview */}
                      {(() => {
                        const mCardPad = formData.card_padding !== undefined && formData.card_padding !== null ? Math.round(formData.card_padding / 2.5) : Math.round(globalCardPadding / 2.5);
                        const mImgPad = formData.image_padding !== undefined && formData.image_padding !== null ? Math.round(formData.image_padding / 2.5) : Math.round(globalImagePadding / 2.5);
                        const mRadius = Math.max(0, formData.card_radius - mCardPad);
                        return (
                          <div
                            className="w-16 h-20 rounded-xl border border-gray-300 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs relative"
                            style={{
                              backgroundColor: formData.bg_color === 'transparent' ? '#FFFFFF' : formData.bg_color,
                              padding: `${mCardPad}px`,
                            }}
                          >
                            <div
                              className="relative w-full h-full overflow-hidden flex items-center justify-center"
                              style={{ borderRadius: `${mRadius}px` }}
                            >
                              {formData.image_url ? (
                                <img
                                  src={formData.image_url}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                  style={{
                                    padding: `${mImgPad}px`,
                                    borderRadius: `${Math.max(0, mRadius - mImgPad)}px`,
                                  }}
                                />
                              ) : (
                                <span className="text-[10px] text-gray-400 font-bold text-center px-1">
                                  Color Only
                                </span>
                              )}
                              {formData.border_mode === 'classic' && (
                                <ClassicBorderFrame
                                  styleId={formData.classic_border_style}
                                  color={formData.border_color}
                                  radius={mRadius}
                                  borderWidth={1}
                                />
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <input
                            ref={imageFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileChange}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => imageFileInputRef.current?.click()}
                            disabled={isUploadingImage}
                            className="px-3.5 py-1.5 bg-white border border-gray-300 hover:border-[#D26900] hover:bg-amber-50/40 rounded-xl text-xs font-bold text-gray-700 shadow-2xs cursor-pointer flex items-center gap-1.5 transition-colors"
                          >
                            <svg className="w-4 h-4 text-[#D26900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span>{isUploadingImage ? 'Uploading...' : 'Upload Image File'}</span>
                          </button>

                          {formData.image_url && (
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, image_url: '' })}
                              className="px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-xl font-semibold cursor-pointer transition-colors"
                            >
                              Remove Image (Keep Color Only)
                            </button>
                          )}
                        </div>

                        <input
                          type="text"
                          value={formData.image_url}
                          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                          placeholder="Or paste direct image URL (https://...)"
                          className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D26900] focus:border-[#D26900] outline-hidden bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Text Position & Alignment (User: card ke niche, card ke upar, card ke andar bina overlay bina shadow) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50/70 rounded-2xl border border-gray-200/80">
                  <div className="space-y-1.5 sm:col-span-3">
                    <label className="text-xs font-bold text-gray-800">
                      Text Position on Card <span className="text-[#D26900]">*</span>
                    </label>
                    <CtaDropdownSelect
                      value={formData.text_position}
                      onChange={(val) => setFormData({ ...formData, text_position: val as any })}
                      options={[
                        { value: 'below', label: 'Card Ke Niche (Below Card Frame)', sublabel: 'Title & offer text placed neatly beneath the card' },
                        { value: 'above', label: 'Card Ke Upar (Above Card Frame)', sublabel: 'Title & offer text placed above the card' },
                        { value: 'inside_clean', label: 'Card Ke Andar - Bina Overlay / Bina Shadow (Clean Text Inside)', sublabel: 'Directly inside card on background, no dark overlay, no text shadow' },
                        { value: 'inside_bottom', label: 'Card Ke Andar - Bottom Dark Overlay', sublabel: 'Bottom gradient dark overlay with crisp white text' },
                        { value: 'inside_center', label: 'Card Ke Andar - Center Dark Overlay', sublabel: 'Centered text over a soft dark translucent overlay' },
                        { value: 'inside_top', label: 'Card Ke Andar - Top Dark Overlay', sublabel: 'Top gradient dark overlay with crisp white text' },
                      ]}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Horizontal Alignment</label>
                    <div className="grid grid-cols-3 gap-1 p-1 bg-white rounded-xl border border-gray-200">
                      {(['left', 'center', 'right'] as const).map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => setFormData({ ...formData, content_align: a })}
                          className={`py-1.5 text-xs font-bold capitalize rounded-lg transition-all cursor-pointer ${
                            formData.content_align === a
                              ? 'bg-[#D26900] text-white shadow-2xs'
                              : 'text-gray-500 hover:text-gray-900'
                          }`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Vertical Alignment</label>
                    <div className="grid grid-cols-3 gap-1 p-1 bg-white rounded-xl border border-gray-200">
                      {(['top', 'center', 'bottom'] as const).map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setFormData({ ...formData, vertical_align: v })}
                          className={`py-1.5 text-xs font-bold capitalize rounded-lg transition-all cursor-pointer ${
                            formData.vertical_align === v
                              ? 'bg-[#D26900] text-white shadow-2xs'
                              : 'text-gray-500 hover:text-gray-900'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. Frame & Border Options (User: border ka color bhi change kr paye) */}
                <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-800">Card Frame & Borders</h4>
                    <span className="text-[11px] text-gray-500">Classic Vintage (14+ SVG) & Modern Borders</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-700">Border Mode</label>
                      <CtaDropdownSelect
                        value={formData.border_mode}
                        onChange={(val) => setFormData({ ...formData, border_mode: val as any })}
                        options={[
                          { value: 'classic', label: 'Classic Vintage (14+ SVG Frames)' },
                          { value: 'modern', label: 'Modern Border Frame' },
                          { value: 'custom_image', label: 'Custom Border Image Upload' },
                          { value: 'none', label: 'No Border' },
                        ]}
                        buttonClassName="py-2"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-700">Corner Radius (px)</label>
                      <input
                        type="number"
                        min="0"
                        max="40"
                        value={formData.card_radius}
                        onChange={(e) => setFormData({ ...formData, card_radius: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D26900] focus:border-[#D26900] bg-white outline-hidden"
                      />
                    </div>

                    {/* Border Color Picker & Quick Palettes */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-700">Border Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.border_color}
                          onChange={(e) => setFormData({ ...formData, border_color: e.target.value })}
                          className="w-9 h-9 rounded-xl border border-gray-300 p-0.5 cursor-pointer shadow-2xs shrink-0"
                        />
                        <input
                          type="text"
                          value={formData.border_color}
                          onChange={(e) => setFormData({ ...formData, border_color: e.target.value })}
                          className="w-full px-2 py-1.5 text-xs font-mono font-bold uppercase border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D26900] focus:border-[#D26900] bg-white outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Border Color Palette Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] font-semibold text-gray-500 mr-1">Border Colors:</span>
                    {[
                      { name: 'Brand Amber', color: '#D26900' },
                      { name: 'Antique Gold', color: '#B45309' },
                      { name: 'Metallic Gold', color: '#D4AF37' },
                      { name: 'Rich Black', color: '#111827' },
                      { name: 'Slate Gray', color: '#6B7280' },
                      { name: 'Silver Platinum', color: '#E5E7EB' },
                      { name: 'Deep Rose', color: '#831843' },
                    ].map((chip) => (
                      <button
                        key={chip.color}
                        type="button"
                        onClick={() => setFormData({ ...formData, border_color: chip.color })}
                        className={`w-5 h-5 rounded-md border transition-transform hover:scale-110 cursor-pointer shadow-2xs ${
                          formData.border_color.toLowerCase() === chip.color.toLowerCase()
                            ? 'ring-2 ring-[#D26900] ring-offset-1 border-[#D26900]'
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: chip.color }}
                        title={`${chip.name} (${chip.color})`}
                      />
                    ))}
                  </div>

                  {/* Card Spacing & Image Padding Controls (User: Border se bahar in-card space & border ke andar image space) */}
                  <div className="p-3.5 bg-white/95 rounded-2xl border border-amber-200/90 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-[#D26900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                        Card Framing Spacing & Image Padding
                      </span>
                      <span className="text-[10px] font-semibold text-gray-500">Charo taraf se spacing adjust karein</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* 1. In-Card Margin (Border Se Bahar Space) */}
                      <div className="space-y-1.5 p-3 bg-amber-50/40 rounded-xl border border-amber-200/60">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-gray-800">
                            Border Se Bahar Space (In-Card Space)
                          </label>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-extrabold text-[#D26900]">
                              {formData.card_padding !== null && formData.card_padding !== undefined
                                ? `${formData.card_padding}px`
                                : `Auto (${globalCardPadding}px)`}
                            </span>
                            {formData.card_padding !== null && formData.card_padding !== undefined && (
                              <button
                                type="button"
                                onClick={() => setFormData({ ...formData, card_padding: null })}
                                className="text-[10px] text-gray-500 hover:text-red-600 ml-1 underline cursor-pointer font-medium"
                                title="Reset to Section Default"
                              >
                                Reset
                              </button>
                            )}
                          </div>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="32"
                          value={formData.card_padding !== null && formData.card_padding !== undefined ? formData.card_padding : globalCardPadding}
                          onChange={(e) => setFormData({ ...formData, card_padding: Number(e.target.value) })}
                          className="w-full accent-[#D26900] cursor-pointer"
                        />
                        <div className="flex items-center justify-between gap-1 pt-0.5">
                          {[
                            { label: '0px', val: 0 },
                            { label: '4px', val: 4 },
                            { label: '8px', val: 8 },
                            { label: '12px', val: 12 },
                            { label: '16px', val: 16 },
                          ].map((p) => {
                            const currentVal = formData.card_padding !== null && formData.card_padding !== undefined ? formData.card_padding : globalCardPadding;
                            return (
                              <button
                                key={p.val}
                                type="button"
                                onClick={() => setFormData({ ...formData, card_padding: p.val })}
                                className={`px-2 py-0.5 text-[10px] rounded-md transition-all cursor-pointer ${
                                  currentVal === p.val
                                    ? 'bg-amber-100 text-[#D26900] font-bold border border-[#D26900]'
                                    : 'text-gray-600 hover:text-gray-900 bg-white border border-gray-200'
                                }`}
                              >
                                {p.label}
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-[10px] text-gray-500 leading-tight">
                          Border ke bahar card background ({formData.bg_color || 'white'}) ka frame dikhega
                        </p>
                      </div>

                      {/* 2. Image Padding (Border Ke Andar Image Space) */}
                      <div className="space-y-1.5 p-3 bg-amber-50/40 rounded-xl border border-amber-200/60">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-gray-800">
                            Border Ke Andar Image Space (Inner Gap)
                          </label>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-extrabold text-[#D26900]">
                              {formData.image_padding !== null && formData.image_padding !== undefined
                                ? `${formData.image_padding}px`
                                : `Auto (${globalImagePadding}px)`}
                            </span>
                            {formData.image_padding !== null && formData.image_padding !== undefined && (
                              <button
                                type="button"
                                onClick={() => setFormData({ ...formData, image_padding: null })}
                                className="text-[10px] text-gray-500 hover:text-red-600 ml-1 underline cursor-pointer font-medium"
                                title="Reset to Section Default"
                              >
                                Reset
                              </button>
                            )}
                          </div>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="24"
                          value={formData.image_padding !== null && formData.image_padding !== undefined ? formData.image_padding : globalImagePadding}
                          onChange={(e) => setFormData({ ...formData, image_padding: Number(e.target.value) })}
                          className="w-full accent-[#D26900] cursor-pointer"
                        />
                        <div className="flex items-center justify-between gap-1 pt-0.5">
                          {[
                            { label: '0px', val: 0 },
                            { label: '4px', val: 4 },
                            { label: '6px', val: 6 },
                            { label: '10px', val: 10 },
                            { label: '14px', val: 14 },
                          ].map((p) => {
                            const currentVal = formData.image_padding !== null && formData.image_padding !== undefined ? formData.image_padding : globalImagePadding;
                            return (
                              <button
                                key={p.val}
                                type="button"
                                onClick={() => setFormData({ ...formData, image_padding: p.val })}
                                className={`px-2 py-0.5 text-[10px] rounded-md transition-all cursor-pointer ${
                                  currentVal === p.val
                                    ? 'bg-amber-100 text-[#D26900] font-bold border border-[#D26900]'
                                    : 'text-gray-600 hover:text-gray-900 bg-white border border-gray-200'
                                }`}
                              >
                                {p.label}
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-[10px] text-gray-500 leading-tight">
                          Image border ke andar rahegi aur ornate corners se nahi takrayegi
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* If Classic: 14+ SVG Frames */}
                  {formData.border_mode === 'classic' && (
                    <div className="space-y-2 pt-2 border-t border-amber-200/40">
                      <label className="text-[11px] font-bold text-gray-700">Select Classic Vintage Style</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {CLASSIC_BORDER_OPTIONS.map((opt) => (
                          <div
                            key={opt.id}
                            onClick={() => setFormData({ ...formData, classic_border_style: opt.id })}
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                              formData.classic_border_style === opt.id
                                ? 'bg-white border-[#D26900] ring-2 ring-[#D26900]/25 shadow-xs'
                                : 'bg-white/80 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <span className="text-[10px] font-bold text-[#D26900] block">{opt.category}</span>
                            <span className="text-xs font-semibold text-gray-900 block truncate">{opt.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* If Modern Frame: Checkbox for all sides vs top/right/bottom/left separate */}
                  {formData.border_mode === 'modern' && (
                    <div className="space-y-3 p-3 bg-white rounded-xl border border-gray-200">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.border_same_all}
                          onChange={(e) => setFormData({ ...formData, border_same_all: e.target.checked })}
                          className="w-4 h-4 text-[#D26900] rounded-sm focus:ring-[#D26900]"
                        />
                        <span className="text-xs font-semibold text-gray-800">
                          Same border on all 4 sides (Top, Right, Bottom, Left)
                        </span>
                      </label>

                      {formData.border_same_all ? (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-600">Border Width (px)</label>
                            <input
                              type="number"
                              min="1"
                              max="12"
                              value={formData.border_width}
                              onChange={(e) => setFormData({ ...formData, border_width: Number(e.target.value) })}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D26900] outline-hidden"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-600">Border Style</label>
                            <CtaDropdownSelect
                              value={formData.border_style}
                              onChange={(val) => setFormData({ ...formData, border_style: val })}
                              options={[
                                { value: 'solid', label: 'Solid' },
                                { value: 'double', label: 'Double' },
                                { value: 'dashed', label: 'Dashed' },
                                { value: 'dotted', label: 'Dotted' },
                                { value: 'inset', label: 'Inset' },
                                { value: 'outset', label: 'Outset' },
                              ]}
                              buttonClassName="py-1 text-xs"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-600">Top Width (px)</label>
                            <input
                              type="number"
                              min="0"
                              max="12"
                              value={formData.border_top_width}
                              onChange={(e) => setFormData({ ...formData, border_top_width: Number(e.target.value) })}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D26900] outline-hidden"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-600">Right Width (px)</label>
                            <input
                              type="number"
                              min="0"
                              max="12"
                              value={formData.border_right_width}
                              onChange={(e) => setFormData({ ...formData, border_right_width: Number(e.target.value) })}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D26900] outline-hidden"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-600">Bottom Width (px)</label>
                            <input
                              type="number"
                              min="0"
                              max="12"
                              value={formData.border_bottom_width}
                              onChange={(e) => setFormData({ ...formData, border_bottom_width: Number(e.target.value) })}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D26900] outline-hidden"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-600">Left Width (px)</label>
                            <input
                              type="number"
                              min="0"
                              max="12"
                              value={formData.border_left_width}
                              onChange={(e) => setFormData({ ...formData, border_left_width: Number(e.target.value) })}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D26900] outline-hidden"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* If Custom Border Image */}
                  {formData.border_mode === 'custom_image' && (
                    <div className="space-y-2 p-3 bg-white rounded-xl border border-gray-200">
                      <label className="text-xs font-bold text-gray-700">Custom Border Frame Image</label>
                      <div className="flex items-center gap-3">
                        <input
                          ref={borderFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleBorderFileChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => borderFileInputRef.current?.click()}
                          disabled={isUploadingBorder}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 rounded-lg cursor-pointer transition-colors"
                        >
                          {isUploadingBorder ? 'Uploading...' : 'Upload Border PNG/SVG'}
                        </button>
                        <input
                          type="text"
                          value={formData.border_image_url}
                          onChange={(e) => setFormData({ ...formData, border_image_url: e.target.value })}
                          placeholder="Or paste border frame image URL"
                          className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D26900] outline-hidden"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Website Navigation Dropdown Picker (User: dropdowns match CTA design) */}
                <div className="space-y-3 p-4 bg-gray-50/70 rounded-2xl border border-gray-200/80">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-800">
                      Card Click Destination (Website Header / Sub-Item)
                    </label>
                    <span className="text-[10px] font-semibold text-gray-500">
                      Selected Route: <code className="text-[#D26900] font-bold">{formData.link_url || '/'}</code>
                    </span>
                  </div>

                  {/* Link Type Radio Toggle */}
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                      <input
                        type="radio"
                        name="cardLinkType"
                        value="header"
                        checked={formData.link_type === 'header'}
                        onChange={() => {
                          const first = adminItems[0];
                          setFormData({
                            ...formData,
                            link_type: 'header',
                            target_header_id: first?.id || '',
                            target_dropdown_id: '',
                            link_url: first?.path || '/',
                          });
                        }}
                        className="accent-[#D26900] text-[#D26900] focus:ring-[#D26900]"
                      />
                      <span>Link to Header Category</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                      <input
                        type="radio"
                        name="cardLinkType"
                        value="dropdown"
                        checked={formData.link_type === 'dropdown'}
                        onChange={() => {
                          const first = allDropdownOptions[0];
                          setFormData({
                            ...formData,
                            link_type: 'dropdown',
                            target_dropdown_id: first?.id || '',
                            target_header_id: '',
                            link_url: first?.path || '/',
                          });
                        }}
                        className="accent-[#D26900] text-[#D26900] focus:ring-[#D26900]"
                      />
                      <span>Link to Sub-Item / Dropdown Subcategory</span>
                    </label>
                  </div>

                  {/* Header Picker */}
                  {formData.link_type === 'header' && (
                    <div className="relative" ref={dropdownRef}>
                      <button
                        type="button"
                        onClick={() => setOpenDropdown(openDropdown === 'header' ? null : 'header')}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-gray-300 hover:border-[#D26900] rounded-xl text-left cursor-pointer transition-colors focus:ring-2 focus:ring-[#D26900]/20"
                      >
                        <span className="font-semibold text-gray-900">
                          {adminItems.find((h) => h.id === formData.target_header_id)?.title || 'Select Header Category'}
                        </span>
                        <svg className="w-4 h-4 text-[#D26900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {openDropdown === 'header' && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white border border-amber-200 rounded-xl shadow-xl max-h-56 overflow-y-auto p-1.5">
                          <input
                            type="text"
                            value={headerSearch}
                            onChange={(e) => setHeaderSearch(e.target.value)}
                            placeholder="Search header category..."
                            className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg mb-1 focus:ring-2 focus:ring-[#D26900] focus:border-[#D26900] outline-hidden"
                            autoFocus
                          />
                          {filteredHeaders.map((header) => (
                            <button
                              key={header.id}
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  target_header_id: header.id,
                                  link_url: header.path || '/',
                                });
                                setOpenDropdown(null);
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg text-left cursor-pointer ${
                                formData.target_header_id === header.id
                                  ? 'bg-amber-50 text-[#D26900] font-bold border-l-2 border-[#D26900]'
                                  : 'text-gray-700 hover:bg-amber-50/50'
                              }`}
                            >
                              <span>{header.title}</span>
                              <span className="text-[10px] text-gray-400 font-mono">{header.path}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Dropdown Sub-Item Picker */}
                  {formData.link_type === 'dropdown' && (
                    <div className="relative" ref={dropdownRef}>
                      <button
                        type="button"
                        onClick={() => setOpenDropdown(openDropdown === 'subitem' ? null : 'subitem')}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-gray-300 hover:border-[#D26900] rounded-xl text-left cursor-pointer transition-colors focus:ring-2 focus:ring-[#D26900]/20"
                      >
                        <span className="font-semibold text-gray-900 truncate">
                          {(() => {
                            const opt = allDropdownOptions.find((d) => d.id === formData.target_dropdown_id);
                            return opt ? `${opt.headerTitle} ➔ ${opt.title}` : 'Select Subcategory Item';
                          })()}
                        </span>
                        <svg className="w-4 h-4 text-[#D26900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {openDropdown === 'subitem' && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white border border-amber-200 rounded-xl shadow-xl max-h-56 overflow-y-auto p-1.5">
                          <input
                            type="text"
                            value={subItemSearch}
                            onChange={(e) => setSubItemSearch(e.target.value)}
                            placeholder="Search subcategory item..."
                            className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg mb-1 focus:ring-2 focus:ring-[#D26900] focus:border-[#D26900] outline-hidden"
                            autoFocus
                          />
                          {filteredSubitems.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  target_dropdown_id: item.id,
                                  link_url: item.path || '/',
                                });
                                setOpenDropdown(null);
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg text-left cursor-pointer ${
                                formData.target_dropdown_id === item.id
                                  ? 'bg-amber-50 text-[#D26900] font-bold border-l-2 border-[#D26900]'
                                  : 'text-gray-700 hover:bg-amber-50/50'
                              }`}
                            >
                              <div className="truncate pr-2">
                                <span className="text-[10px] text-gray-400 mr-1">[{item.headerTitle}]</span>
                                <span className="font-semibold">{item.title}</span>
                              </div>
                              <span className="text-[10px] text-gray-400 font-mono shrink-0">{item.path}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 6. Typography Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50/70 rounded-2xl border border-gray-200/80">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Font Family</label>
                    <CtaDropdownSelect
                      value={formData.font_family}
                      onChange={(val) => setFormData({ ...formData, font_family: val })}
                      options={BANNER_FONT_OPTIONS.map((f) => ({
                        value: f.name,
                        label: f.label,
                        category: f.category,
                      }))}
                      enableSearch={true}
                      buttonClassName="py-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Font Weight</label>
                    <CtaDropdownSelect
                      value={formData.font_weight}
                      onChange={(val) => setFormData({ ...formData, font_weight: val })}
                      options={[
                        { value: 'normal', label: 'Normal (400)' },
                        { value: 'medium', label: 'Medium (500)' },
                        { value: 'semibold', label: 'Semibold (600)' },
                        { value: 'bold', label: 'Bold (700)' },
                      ]}
                      buttonClassName="py-2"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-[#D26900] hover:bg-[#b85b00] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Card'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Showcase Card"
        message={`Are you sure you want to delete "${deleteConfirm.title || 'this card'}"? Associated image files will be removed from storage.`}
        confirmText="Delete Card"
        cancelText="Cancel"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '', title: '' })}
      />
    </div>
  );
}
