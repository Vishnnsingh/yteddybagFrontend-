import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  useHeaderNavigation,
  type HeaderDropdownItem,
  type SavedBannerImageItem,
  type BgThemeConfig,
  type DeviceBgConfig,
} from '../../Context/HeaderNavigationContext';
import AdminConfirmModal from '../Components/AdminConfirmModal';

// Helper to auto-generate clean slug path from title
const generateSlugPath = (title: string) => {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-');
  return `/category/${slug || 'items'}`;
};

interface DeleteModalState {
  isOpen: boolean;
  type: 'header' | 'dropdown' | 'banner' | 'doodle';
  id?: string;
  title: string;
  url?: string;
  warningNote?: string;
}

interface EditModalState {
  isOpen: boolean;
  type: 'header' | 'dropdown';
  id: string;
  title: string;
  sub_heading?: string;
  layout?: 'column' | 'row';
  image_url?: string | null;
  headerId?: string;
  headerTitle?: string;
}

interface AddDropdownModalState {
  isOpen: boolean;
  headerId: string;
  headerTitle: string;
  items: string[];
  sub_heading: string;
  layout: 'column' | 'row';
  image_url?: string | null;
  loading: boolean;
}

export default function ManageHeader() {
  const {
    adminItems,
    adminLoading,
    refreshAdminItems,
    createHeaderItem,
    updateHeaderItem,
    deleteHeaderItem,
    createDropdownItem,
    updateDropdownItem,
    deleteDropdownItem,
    uploadDropdownImage,
    uploadHeaderImage,
    loginBanner,
    refreshLoginBanner,
    updateLoginBanner,
    uploadBannerImage,
    deleteBannerImage,
    sitePages,
    updateSitePage,
    bgTheme,
    refreshBgTheme,
    updateBgTheme,
    uploadDoodleImage,
    deleteDoodleImage,
  } = useHeaderNavigation();

  // Legal & Help Pages Modal State (Terms of Use, Privacy Policy, Get Help)
  const [isPagesModalOpen, setIsPagesModalOpen] = useState(false);
  const [selectedPageSlug, setSelectedPageSlug] = useState<'terms-of-use' | 'privacy-policy' | 'get-help'>('terms-of-use');
  const [pageForm, setPageForm] = useState<{ title: string; description: string }>({
    title: '',
    description: '',
  });
  const [pageSubmitting, setPageSubmitting] = useState(false);

  const handleOpenPagesModal = (slug: 'terms-of-use' | 'privacy-policy' | 'get-help' = 'terms-of-use') => {
    setSelectedPageSlug(slug);
    const existing = sitePages[slug];
    setPageForm({
      title: existing?.title || (slug === 'terms-of-use' ? 'Terms of Use' : slug === 'privacy-policy' ? 'Privacy Policy' : 'Customer Support & Help Center'),
      description: existing?.description || '',
    });
    setIsPagesModalOpen(true);
  };

  const handleSelectPageTab = (slug: 'terms-of-use' | 'privacy-policy' | 'get-help') => {
    setSelectedPageSlug(slug);
    const existing = sitePages[slug];
    setPageForm({
      title: existing?.title || (slug === 'terms-of-use' ? 'Terms of Use' : slug === 'privacy-policy' ? 'Privacy Policy' : 'Customer Support & Help Center'),
      description: existing?.description || '',
    });
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageForm.title.trim()) {
      toast.error('Page heading title is required');
      return;
    }
    setPageSubmitting(true);
    await updateSitePage(selectedPageSlug, {
      title: pageForm.title.trim(),
      description: pageForm.description.trim(),
    });
    setPageSubmitting(false);
  };

  // Create Header Modal State
  const [isHeaderModalOpen, setIsHeaderModalOpen] = useState(false);
  const [headerTitle, setHeaderTitle] = useState('');
  const [headerImageUrl, setHeaderImageUrl] = useState<string | null>(null);
  const [uploadingHeaderImage, setUploadingHeaderImage] = useState(false);
  const [headerSubmitting, setHeaderSubmitting] = useState(false);
  const addHeaderFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAddHeaderImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }
    setUploadingHeaderImage(true);
    try {
      const res = await uploadHeaderImage(file);
      if (res.success && res.imageUrl) {
        setHeaderImageUrl(res.imageUrl);
      }
    } finally {
      setUploadingHeaderImage(false);
      if (addHeaderFileInputRef.current) addHeaderFileInputRef.current.value = '';
    }
  };

  // Edit / Rename Modal State (Centered Modal)
  const [editModal, setEditModal] = useState<EditModalState>({
    isOpen: false,
    type: 'header',
    id: '',
    title: '',
    sub_heading: '',
    layout: 'column',
    headerId: '',
    headerTitle: '',
  });
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete Confirmation Modal State (Centered Modal)
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    type: 'header',
    id: '',
    title: '',
  });
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Add Dropdown Modal State (Centered Modal)
  const [addDropdownModal, setAddDropdownModal] = useState<AddDropdownModalState>({
    isOpen: false,
    headerId: '',
    headerTitle: '',
    items: [''],
    sub_heading: '',
    layout: 'column',
    image_url: null,
    loading: false,
  });

  const [uploadingDropdownImage, setUploadingDropdownImage] = useState(false);
  const editDropdownFileInputRef = useRef<HTMLInputElement | null>(null);
  const addDropdownFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleEditDropdownImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }
    setUploadingDropdownImage(true);
    try {
      const res = editModal.type === 'header'
        ? await uploadHeaderImage(file, editModal.id)
        : await uploadDropdownImage(file, editModal.id);
      if (res.success && res.imageUrl) {
        setEditModal((prev) => ({ ...prev, image_url: res.imageUrl }));
      }
    } finally {
      setUploadingDropdownImage(false);
      if (editDropdownFileInputRef.current) editDropdownFileInputRef.current.value = '';
    }
  };

  const handleAddDropdownImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }
    setUploadingDropdownImage(true);
    try {
      const res = await uploadDropdownImage(file);
      if (res.success && res.imageUrl) {
        setAddDropdownModal((prev) => ({ ...prev, image_url: res.imageUrl }));
      }
    } finally {
      setUploadingDropdownImage(false);
      if (addDropdownFileInputRef.current) addDropdownFileInputRef.current.value = '';
    }
  };

  // Dynamic Item Row Handlers for AddDropdownModal
  const handleAddItemRow = () => {
    setAddDropdownModal((prev) => ({
      ...prev,
      items: [...prev.items, ''],
    }));
  };

  const handleRemoveItemRow = (index: number) => {
    setAddDropdownModal((prev) => {
      const updated = [...prev.items];
      updated.splice(index, 1);
      return {
        ...prev,
        items: updated.length === 0 ? [''] : updated,
      };
    });
  };

  const handleItemChange = (index: number, value: string) => {
    setAddDropdownModal((prev) => {
      const updated = [...prev.items];
      updated[index] = value;
      return {
        ...prev,
        items: updated,
      };
    });
  };

  // Collect all unique sub_headings and their layout per header category for instant auto-suggestions
  const existingSubHeadings = useMemo(() => {
    const map: Record<string, { name: string; layout: 'column' | 'row' }[]> = {};
    adminItems.forEach((h) => {
      const subs = new Map<string, 'column' | 'row'>();
      h.dropdown_items?.forEach((item) => {
        if (item.sub_heading && item.sub_heading.trim()) {
          const name = item.sub_heading.trim();
          const layout = item.layout === 'row' ? 'row' : 'column';
          if (!subs.has(name) || layout === 'row') {
            subs.set(name, layout);
          }
        }
      });
      map[h.id] = Array.from(subs.entries()).map(([name, layout]) => ({ name, layout }));
    });
    return map;
  }, [adminItems]);

  // Login Offer Banner Modal State
  const DEFAULT_TEDDY_URL = 'https://pub-fa320b17ccf34606b113e58ad862cd19.r2.dev/banners/default-login-banner-teddy.jpg';
  const DEFAULT_GIRLS_URL = 'https://pub-fa320b17ccf34606b113e58ad862cd19.r2.dev/banners/default-login-banner-girls.jpg';

  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [isGalleryDropdownOpen, setIsGalleryDropdownOpen] = useState(false);
  const galleryDropdownRef = useRef<HTMLDivElement | null>(null);

  const [bannerForm, setBannerForm] = useState<{
    is_active: boolean;
    image_url: string;
    heading: string;
    subheading: string;
    coupon_code: string;
    badge_text: string;
    terms_text: string;
    bg_color: string;
    saved_images: (string | SavedBannerImageItem)[];
  }>({
    is_active: true,
    image_url: DEFAULT_TEDDY_URL,
    heading: 'FLAT ₹300 OFF',
    subheading: 'ON YOUR 1ST ORDER + EXCITING OFFERS*',
    coupon_code: 'YTEDDY300',
    badge_text: '₹300 OFF',
    terms_text: '*T&C Applied | Limited Time Offer',
    bg_color: '#FEEFEA',
    saved_images: [],
  });
  const [bannerSubmitting, setBannerSubmitting] = useState(false);
  const [uploadingBannerImage, setUploadingBannerImage] = useState(false);
  const [deletingImageUrl, setDeletingImageUrl] = useState<string | null>(null);
  const bannerFileInputRef = useRef<HTMLInputElement | null>(null);

  // Close gallery dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (galleryDropdownRef.current && !galleryDropdownRef.current.contains(e.target as Node)) {
        setIsGalleryDropdownOpen(false);
      }
    };
    if (isGalleryDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isGalleryDropdownOpen]);

  // Compute all available saved banner images (from DB + default)
  const availableBannerImages = useMemo<SavedBannerImageItem[]>(() => {
    const list: SavedBannerImageItem[] = [
      {
        url: DEFAULT_TEDDY_URL,
        name: '🧸 Default YTeddybags & Toys Banner',
        is_default: true,
      },
      {
        url: DEFAULT_GIRLS_URL,
        name: '🎒 Teddybags Lifestyle Banner',
        is_default: true,
      },
    ];
    const seenUrls = new Set<string>([
      DEFAULT_TEDDY_URL,
      DEFAULT_GIRLS_URL,
      '/images/login-banner-teddy.jpg',
      '/images/login-banner-girls.jpg',
    ]);

    const addItem = (item: any) => {
      if (!item) return;
      let url = '';
      let name = '';
      let is_default = false;

      if (typeof item === 'string') {
        url = item.trim();
        if (url === '/images/login-banner-teddy.jpg' || url === DEFAULT_TEDDY_URL) return;
        if (url === '/images/login-banner-girls.jpg' || url === DEFAULT_GIRLS_URL) return;
        name = url.split('/').pop() || 'Uploaded Banner';
      } else if (typeof item === 'object' && item.url) {
        url = String(item.url).trim();
        if (url === '/images/login-banner-teddy.jpg' || url === DEFAULT_TEDDY_URL) return;
        if (url === '/images/login-banner-girls.jpg' || url === DEFAULT_GIRLS_URL) return;
        name = item.name || url.split('/').pop() || 'Uploaded Banner';
        is_default = Boolean(item.is_default);
      }

      if (url && !seenUrls.has(url)) {
        seenUrls.add(url);
        list.push({ url, name, is_default });
      }
    };

    if (Array.isArray(bannerForm.saved_images)) {
      bannerForm.saved_images.forEach(addItem);
    }
    if (Array.isArray(loginBanner?.saved_images)) {
      loginBanner.saved_images.forEach(addItem);
    }
    if (bannerForm.image_url && !seenUrls.has(bannerForm.image_url)) {
      addItem(bannerForm.image_url);
    }
    return list;
  }, [bannerForm.saved_images, bannerForm.image_url, loginBanner?.saved_images]);

  const selectedBannerItem = useMemo(() => {
    const current = bannerForm.image_url || DEFAULT_TEDDY_URL;
    return (
      availableBannerImages.find((img) => img.url === current) || {
        url: current,
        name: current.split('/').pop() || 'Selected Banner',
        is_default: false,
      }
    );
  }, [availableBannerImages, bannerForm.image_url]);

  const handleOpenBannerModal = () => {
    refreshLoginBanner();
    if (loginBanner) {
      let initialImg = loginBanner.image_url || DEFAULT_TEDDY_URL;
      if (initialImg === '/images/login-banner-teddy.jpg') initialImg = DEFAULT_TEDDY_URL;
      if (initialImg === '/images/login-banner-girls.jpg') initialImg = DEFAULT_GIRLS_URL;

      setBannerForm({
        is_active: loginBanner.is_active !== false,
        image_url: initialImg,
        heading: loginBanner.heading || 'FLAT ₹300 OFF',
        subheading: loginBanner.subheading || 'ON YOUR 1ST ORDER + EXCITING OFFERS*',
        coupon_code: loginBanner.coupon_code || 'YTEDDY300',
        badge_text: loginBanner.badge_text || '₹300 OFF',
        terms_text: loginBanner.terms_text || '*T&C Applied | Limited Time Offer',
        bg_color: loginBanner.bg_color || '#FEEFEA',
        saved_images: Array.isArray(loginBanner.saved_images) ? loginBanner.saved_images : [],
      });
    }
    setIsBannerModalOpen(true);
  };

  const handleBannerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, WebP)');
      return;
    }

    setUploadingBannerImage(true);
    try {
      const res = await uploadBannerImage(file);
      if (res.success && res.imageUrl) {
        setBannerForm((prev) => {
          const updatedSaved =
            res.saved_images ||
            [
              { url: res.imageUrl!, name: file.name, is_default: false },
              ...prev.saved_images,
            ];
          return {
            ...prev,
            image_url: res.imageUrl!,
            saved_images: updatedSaved,
          };
        });
      }
    } finally {
      setUploadingBannerImage(false);
      if (bannerFileInputRef.current) {
        bannerFileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteBannerImage = (url: string, name: string) => {
    setDeleteModal({
      isOpen: true,
      type: 'banner',
      url,
      title: name,
      warningNote: 'This image will be permanently deleted from Cloud CDN storage and database.',
    });
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setBannerSubmitting(true);
    const ok = await updateLoginBanner(bannerForm);
    setBannerSubmitting(false);
    if (ok) {
      setIsBannerModalOpen(false);
    }
  };

  // ====================================================================
  // Background Theme Modal State & Handlers
  // ====================================================================
  const [isBgThemeModalOpen, setIsBgThemeModalOpen] = useState(false);
  const [activeThemeDevice, setActiveThemeDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [bgThemeForm, setBgThemeForm] = useState<BgThemeConfig>({
    desktop: {
      bg_type: 'default',
      bg_color: '#FDF0EC',
      gradient_to: '#FDF5F2',
      use_gradient: true,
      pattern_size: 55,
      pattern_opacity: 0.25,
      pattern_gap: 65,
      doodles: [],
    },
    mobile: {
      bg_type: 'default',
      bg_color: '#FDF0EC',
      gradient_to: '#FDF5F2',
      use_gradient: true,
      pattern_size: 40,
      pattern_opacity: 0.22,
      pattern_gap: 50,
      doodles: [],
    },
    updated_at: new Date().toISOString(),
  });
  const [bgThemeSubmitting, setBgThemeSubmitting] = useState(false);
  const [isUploadingDoodle, setIsUploadingDoodle] = useState(false);
  const [deletingDoodleUrl, setDeletingDoodleUrl] = useState<string | null>(null);
  const doodleFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenBgThemeModal = async () => {
    if (bgTheme) {
      setBgThemeForm(JSON.parse(JSON.stringify(bgTheme)));
    }
    setIsBgThemeModalOpen(true);
    const fresh = await refreshBgTheme(true);
    if (fresh) {
      setBgThemeForm(JSON.parse(JSON.stringify(fresh)));
    }
  };

  // Sync form when bgTheme from context updates
  useEffect(() => {
    if (bgTheme && !isBgThemeModalOpen) {
      setBgThemeForm(JSON.parse(JSON.stringify(bgTheme)));
    }
  }, [bgTheme, isBgThemeModalOpen]);

  const updateCurrentDeviceConfig = (updater: (prev: DeviceBgConfig) => DeviceBgConfig) => {
    setBgThemeForm((prev) => ({
      ...prev,
      [activeThemeDevice]: updater(prev[activeThemeDevice]),
      updated_at: new Date().toISOString(),
    }));
  };

  const handleToggleDoodleActive = (id: string) => {
    updateCurrentDeviceConfig((cur) => ({
      ...cur,
      doodles: cur.doodles.map((d) =>
        d.id === id ? { ...d, isActive: d.isActive === false ? true : false } : d
      ),
    }));
  };

  const handleToggleAllDoodles = (activate: boolean) => {
    updateCurrentDeviceConfig((cur) => ({
      ...cur,
      doodles: cur.doodles.map((d) => ({ ...d, isActive: activate })),
    }));
  };

  const handleDoodleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter((f) => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      toast.error('Please select valid image files (PNG, JPG, SVG, WebP)');
      return;
    }

    setIsUploadingDoodle(true);
    try {
      const res = await uploadDoodleImage(validFiles, activeThemeDevice);
      if (res.success && res.theme) {
        setBgThemeForm((prev) => ({
          ...prev,
          desktop: {
            ...prev.desktop,
            doodles: res.theme!.desktop.doodles,
          },
          mobile: {
            ...prev.mobile,
            doodles: res.theme!.mobile.doodles,
          },
          updated_at: res.theme!.updated_at,
        }));
      }
    } finally {
      setIsUploadingDoodle(false);
      if (doodleFileInputRef.current) {
        doodleFileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteDoodleItem = (url: string, name: string) => {
    setDeleteModal({
      isOpen: true,
      type: 'doodle',
      url,
      title: name,
      warningNote: 'This doodle pattern will be deleted from Cloud storage and background themes.',
    });
  };

  const handleSaveBgTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    setBgThemeSubmitting(true);
    const ok = await updateBgTheme(bgThemeForm);
    setBgThemeSubmitting(false);
    if (ok) {
      setIsBgThemeModalOpen(false);
    }
  };

  const handleCopyThemeSettings = (from: 'desktop' | 'mobile', to: 'desktop' | 'mobile') => {
    setBgThemeForm((prev) => ({
      ...prev,
      [to]: {
        ...JSON.parse(JSON.stringify(prev[from])),
        pattern_size: to === 'mobile' ? Math.max(25, prev[from].pattern_size - 15) : prev[from].pattern_size + 15,
        pattern_gap: to === 'mobile' ? Math.max(30, prev[from].pattern_gap - 15) : prev[from].pattern_gap + 15,
      },
      updated_at: new Date().toISOString(),
    }));
    toast.success(`Copied ${from === 'desktop' ? 'Big Screen' : 'Mobile'} theme to ${to === 'desktop' ? 'Big Screen' : 'Mobile'}!`);
  };

  const handleResetToDefaultBg = () => {
    updateCurrentDeviceConfig((cur) => ({
      ...cur,
      bg_type: 'default',
      bg_color: '#FDF0EC',
      gradient_to: '#FDF5F2',
      use_gradient: true,
      pattern_size: activeThemeDevice === 'desktop' ? 55 : 40,
      pattern_opacity: 0.22,
      pattern_gap: activeThemeDevice === 'desktop' ? 65 : 50,
    }));
    toast.info('Reset to default login background settings.');
  };

  // Refresh admin items on mount
  useEffect(() => {
    refreshAdminItems();
  }, [refreshAdminItems]);

  // Handle Add Header
  const handleCreateHeader = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = headerTitle.trim();
    if (!cleanTitle) return;

    setHeaderSubmitting(true);
    const ok = await createHeaderItem({
      title: cleanTitle,
      path: generateSlugPath(cleanTitle),
      order_index: adminItems.length + 1,
      image_url: headerImageUrl || null,
    });
    setHeaderSubmitting(false);

    if (ok) {
      setHeaderTitle('');
      setHeaderImageUrl(null);
      setIsHeaderModalOpen(false);
    }
  };

  // Handle Save Rename (Header or Dropdown Item)
  const handleSaveRename = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = editModal.title.trim();
    if (!cleanTitle) return;

    setEditSubmitting(true);
    if (editModal.type === 'header') {
      await updateHeaderItem(editModal.id, {
        title: cleanTitle,
        path: generateSlugPath(cleanTitle),
        image_url: editModal.image_url || null,
      });
    } else {
      const cleanSubHeading = editModal.sub_heading !== undefined
        ? (editModal.sub_heading.trim() || null)
        : undefined;

      await updateDropdownItem(editModal.id, {
        title: cleanTitle,
        sub_heading: cleanSubHeading,
        layout: editModal.layout || 'column',
        image_url: editModal.image_url || null,
        path: generateSlugPath(cleanTitle),
      });
    }
    setEditSubmitting(false);
    setEditModal({ isOpen: false, type: 'header', id: '', title: '', sub_heading: '', layout: 'column', image_url: null, headerId: '', headerTitle: '' });
  };

  // Handle Confirm Delete (Header, Dropdown Item, Banner Image, Doodle Pattern)
  const handleConfirmDelete = async () => {
    setDeleteSubmitting(true);
    try {
      if (deleteModal.type === 'header' && deleteModal.id) {
        await deleteHeaderItem(deleteModal.id);
      } else if (deleteModal.type === 'dropdown' && deleteModal.id) {
        await deleteDropdownItem(deleteModal.id);
      } else if (deleteModal.type === 'banner' && deleteModal.url) {
        const url = deleteModal.url;
        setDeletingImageUrl(url);
        try {
          const ok = await deleteBannerImage(url);
          if (ok) {
            setBannerForm((prev) => ({
              ...prev,
              image_url: prev.image_url === url ? DEFAULT_TEDDY_URL : prev.image_url,
              saved_images: prev.saved_images.filter(
                (img) => (typeof img === 'string' ? img : img.url) !== url
              ),
            }));
          }
        } finally {
          setDeletingImageUrl(null);
        }
      } else if (deleteModal.type === 'doodle' && deleteModal.url) {
        const url = deleteModal.url;
        setDeletingDoodleUrl(url);
        try {
          const res = await deleteDoodleImage(url, activeThemeDevice);
          if (res.success && res.theme) {
            setBgThemeForm((prev) => ({
              ...prev,
              desktop: {
                ...prev.desktop,
                doodles: res.theme!.desktop.doodles,
              },
              mobile: {
                ...prev.mobile,
                doodles: res.theme!.mobile.doodles,
              },
              updated_at: res.theme!.updated_at,
            }));
          } else {
            updateCurrentDeviceConfig((cur) => ({
              ...cur,
              doodles: cur.doodles.filter((d) => d.url !== url),
            }));
          }
        } finally {
          setDeletingDoodleUrl(null);
        }
      }
    } finally {
      setDeleteSubmitting(false);
      setDeleteModal({ isOpen: false, type: 'header', id: '', title: '', url: '' });
    }
  };

  // Handle Add Dropdown Item (Single or Multiple Items batch)
  const handleCreateDropdown = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addDropdownModal.headerId) return;

    const validItems = addDropdownModal.items
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (validItems.length === 0) {
      toast.error('Please enter at least one dropdown item name');
      return;
    }

    const cleanSubHeading = addDropdownModal.sub_heading ? addDropdownModal.sub_heading.trim() : null;

    setAddDropdownModal((prev) => ({ ...prev, loading: true }));
    const ok = await createDropdownItem(addDropdownModal.headerId, {
      items: validItems,
      sub_heading: cleanSubHeading,
      layout: addDropdownModal.layout,
      image_url: addDropdownModal.image_url || null,
    });
    setAddDropdownModal((prev) => ({ ...prev, loading: false }));

    if (ok) {
      setAddDropdownModal({
        isOpen: false,
        headerId: '',
        headerTitle: '',
        items: [''],
        sub_heading: '',
        layout: 'column',
        image_url: null,
        loading: false,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight">
            Header &amp; Dropdown Menu
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Add new header categories (e.g. <span className="font-semibold text-gray-700">Man bag</span>) and manage their dropdown menu items (e.g. <span className="font-semibold text-gray-700">school bag, trolly bag</span>) with add, rename, and delete options.
          </p>
        </div>

        {/* Action Buttons: Login Banner + Collapse/Expand + Add Header */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {/* Button to Manage Legal & Help Pages (Terms of Use, Privacy Policy, Get Help) */}
          <button
            type="button"
            onClick={() => handleOpenPagesModal('terms-of-use')}
            className="inline-flex items-center justify-center gap-2 bg-[#FFF7ED] hover:bg-[#FFEDD5] text-[#D26900] border border-[#FED7AA] px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold shadow-2xs transition-colors cursor-pointer shrink-0 group"
            title="Edit Heading Title & Description for Terms of Use, Privacy Policy & Get Help pages"
          >
            <svg className="w-4 h-4 text-[#D26900] shrink-0 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Legal &amp; Help Pages</span>
          </button>

          {/* Button to Customize Login Offer Banner as requested */}
          <button
            type="button"
            onClick={handleOpenBannerModal}
            className="inline-flex items-center justify-center gap-2 bg-[#FFF7ED] hover:bg-[#FFEDD5] text-[#D26900] border border-[#FED7AA] px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold shadow-2xs transition-colors cursor-pointer shrink-0 group"
            title="Configure Login Page Offer Banner, Image, Text & Coupon"
          >
            <svg className="w-4 h-4 text-[#D26900] shrink-0 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v3a2 2 0 01-2 2M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            <span>Login Offer Banner</span>
          </button>

          {/* Button to Customize Background Theme (Desktop & Mobile Cloud Doodles) */}
          <button
            type="button"
            onClick={handleOpenBgThemeModal}
            className="inline-flex items-center justify-center gap-2 bg-[#FFF7ED] hover:bg-[#FFEDD5] text-[#D26900] border border-[#FED7AA] px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold shadow-2xs transition-colors cursor-pointer shrink-0 group"
            title="Configure Background Theme for Big Screen and Mobile (Colors, Cloud Doodle Patterns, Sizes)"
          >
            <svg className="w-4 h-4 text-[#D26900] shrink-0 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4 4 4 0 014-4h10a4 4 0 014 4 4 4 0 01-4 4H7zM5 13V7a2 2 0 012-2h10a2 2 0 012 2v6" />
            </svg>
            <span>Bg Theme</span>
          </button>

          {/* Add Header Button */}
          <button
            type="button"
            onClick={() => {
              setHeaderTitle('');
              setIsHeaderModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 bg-[#D26900] hover:bg-[#B45309] text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            + Add Header
          </button>
        </div>
      </div>

      {/* Loading state */}
      {adminLoading && adminItems.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D26900]" />
        </div>
      ) : null}

      {/* Empty State */}
      {!adminLoading && adminItems.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-[#FFF7ED] text-[#D26900] flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            +
          </div>
          <h3 className="text-base font-bold text-[#111827]">No Header Items Added Yet</h3>
          <p className="text-sm text-[#6B7280] mt-1 max-w-md mx-auto">
            Click &quot;+ Add Header&quot; to create a new category (e.g. Toys, Soft Toys, Man bag).
          </p>
          <button
            onClick={() => setIsHeaderModalOpen(true)}
            className="mt-5 inline-flex items-center gap-2 bg-[#D26900] hover:bg-[#B45309] text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            + Add First Header
          </button>
        </div>
      ) : null}

      {/* 25% Width Grid Layout for Header Cards (xl:grid-cols-4 = 25% per card) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {adminItems.map((header) => (
          <motion.div
            key={header.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
          >
            {/* Card Header Top */}
            <div className="p-4 sm:p-5 border-b border-gray-100 bg-linear-to-b from-gray-50/70 to-white">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  {header.image_url ? (
                    <img
                      src={header.image_url}
                      alt={header.title}
                      className="w-9 h-9 rounded-xl object-cover border border-[#FED7AA] shrink-0 shadow-2xs"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-[#FFF7ED] text-[#D26900] border border-[#FED7AA] flex items-center justify-center font-bold text-sm shrink-0">
                      {header.title.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-bold text-base text-[#111827] truncate" title={header.title}>
                        {header.title}
                      </h3>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      {header.dropdown_items?.length || 0} dropdown items
                    </p>
                  </div>
                </div>

                {/* Header Actions: Rename & Delete */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setEditModal({
                        isOpen: true,
                        type: 'header',
                        id: header.id,
                        title: header.title,
                        image_url: header.image_url || null,
                      })
                    }
                    className="p-1.5 text-gray-500 hover:text-[#D26900] hover:bg-[#FFF7ED] rounded-lg transition-colors cursor-pointer"
                    title="Rename / Edit Header"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteModal({
                        isOpen: true,
                        type: 'header',
                        id: header.id,
                        title: header.title,
                      })
                    }
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Header"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Card Body: Dropdown Items List (Always visible, clean) */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Dropdown Items List ({header.dropdown_items?.length || 0})
                  </span>
                </div>

                {header.dropdown_items && header.dropdown_items.length > 0 ? (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-0.5">
                    {(() => {
                      const groupsMap = new Map<string, HeaderDropdownItem[]>();
                      const directItems: HeaderDropdownItem[] = [];

                      header.dropdown_items.forEach((sub: HeaderDropdownItem) => {
                        if (sub.sub_heading && sub.sub_heading.trim()) {
                          const key = sub.sub_heading.trim();
                          if (!groupsMap.has(key)) groupsMap.set(key, []);
                          groupsMap.get(key)!.push(sub);
                        } else {
                          directItems.push(sub);
                        }
                      });

                      return (
                        <>
                          {Array.from(groupsMap.entries()).map(([subHeadingName, items]) => {
                            const groupLayout = items.some((i) => i.layout === 'row') ? 'row' : 'column';
                            return (
                              <div
                                key={subHeadingName}
                                className="rounded-xl border border-orange-200/80 bg-orange-50/30 p-2.5 space-y-2"
                              >
                                {/* Sub-heading Header Banner */}
                                <div className="flex items-center justify-between gap-1.5 border-b border-orange-100 pb-1.5">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="w-2 h-2 rounded-full bg-[#D26900] shrink-0" />
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#D26900] truncate">
                                      {subHeadingName}
                                    </span>
                                    <span
                                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                                        groupLayout === 'row'
                                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                                          : 'bg-blue-50 text-blue-700 border-blue-200'
                                      }`}
                                      title={groupLayout === 'row' ? 'Display: Row-wise (Horizontal wrap pills)' : 'Display: Column-wise (Vertical stack list)'}
                                    >
                                      {groupLayout === 'row' ? '↔ Row-wise' : '↕ Column-wise'}
                                    </span>
                                  </div>

                                  {/* Add another item directly to this sub-heading */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setAddDropdownModal({
                                        isOpen: true,
                                        headerId: header.id,
                                        headerTitle: header.title,
                                        items: [''],
                                        sub_heading: subHeadingName,
                                        layout: groupLayout,
                                        loading: false,
                                      })
                                    }
                                    className="text-[10px] font-bold text-[#D26900] hover:text-[#B45309] hover:underline cursor-pointer shrink-0"
                                    title={`Add item to "${subHeadingName}"`}
                                  >
                                    + Add Item
                                  </button>
                                </div>

                                {/* Items under this sub-heading */}
                                <div className={groupLayout === 'row' ? 'flex flex-wrap gap-1.5' : 'space-y-1.5'}>
                                  {items.map((sub) => (
                                    <div
                                      key={sub.id}
                                      className={`p-1.5 rounded-lg bg-white border border-gray-100 flex items-center justify-between gap-1.5 group hover:border-orange-200 transition-colors ${
                                        groupLayout === 'row' ? 'text-xs' : ''
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 min-w-0 flex-1">
                                        {sub.image_url ? (
                                          <img
                                            src={sub.image_url}
                                            alt={sub.title}
                                            className="w-7 h-7 rounded-full object-cover border border-orange-200 shrink-0 shadow-2xs"
                                            onError={(e) => {
                                              (e.target as HTMLElement).style.display = 'none';
                                            }}
                                          />
                                        ) : (
                                          <div
                                            className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FFF9F5] to-[#FEE7D8] border border-[#FED7AA] flex items-center justify-center text-[#D26900] shrink-0 shadow-2xs"
                                            title="No image for mobile (Click edit to upload)"
                                          >
                                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                              <path d="M9.5 6V4a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v2" />
                                              <path d="M5 10c0-2.2 1.8-4 4-4h6c2.2 0 4 1.8 4 4v9a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-9z" fill="#D26900" fillOpacity={0.15} />
                                              <circle cx="12" cy="15.5" r="1.2" fill="#D26900" />
                                            </svg>
                                          </div>
                                        )}
                                        <span className="text-xs font-medium text-gray-800 truncate" title={sub.title}>
                                          {sub.title}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-0.5 shrink-0">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setEditModal({
                                              isOpen: true,
                                              type: 'dropdown',
                                              id: sub.id,
                                              title: sub.title,
                                              sub_heading: sub.sub_heading || '',
                                              layout: sub.layout === 'row' ? 'row' : 'column',
                                              image_url: sub.image_url || null,
                                              headerId: header.id,
                                              headerTitle: header.title,
                                            })
                                          }
                                          className="p-1 text-gray-400 hover:text-[#D26900] rounded transition-colors cursor-pointer"
                                          title="Edit Dropdown Item"
                                        >
                                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                          </svg>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setDeleteModal({
                                              isOpen: true,
                                              type: 'dropdown',
                                              id: sub.id,
                                              title: sub.title,
                                            })
                                          }
                                          className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                                          title="Delete Dropdown Item"
                                        >
                                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}

                          {/* Direct Items (no sub-heading) */}
                          {directItems.length > 0 && (
                            <div className="space-y-1.5">
                              {groupsMap.size > 0 && (
                                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1 pt-1">
                                  General Items
                                </div>
                              )}
                              {directItems.map((sub) => (
                                <div
                                  key={sub.id}
                                  className="p-2 rounded-lg bg-gray-50/80 hover:bg-[#FFF7ED]/50 border border-gray-100 flex items-center justify-between gap-2 group transition-colors"
                                >
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    {sub.image_url ? (
                                      <img
                                        src={sub.image_url}
                                        alt={sub.title}
                                        className="w-7 h-7 rounded-full object-cover border border-orange-200 shrink-0 shadow-2xs"
                                        onError={(e) => {
                                          (e.target as HTMLElement).style.display = 'none';
                                        }}
                                      />
                                    ) : (
                                      <div
                                        className="w-7 h-7 rounded-full bg-orange-50 border border-orange-200/60 flex items-center justify-center text-[10px] text-[#D26900] shrink-0"
                                        title="No image for mobile (Click edit to upload)"
                                      >
                                        🛍️
                                      </div>
                                    )}
                                    <span className="text-xs font-semibold text-[#111827] truncate" title={sub.title}>
                                      {sub.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setEditModal({
                                          isOpen: true,
                                          type: 'dropdown',
                                          id: sub.id,
                                          title: sub.title,
                                          sub_heading: '',
                                          layout: sub.layout === 'row' ? 'row' : 'column',
                                          image_url: sub.image_url || null,
                                          headerId: header.id,
                                          headerTitle: header.title,
                                        })
                                      }
                                      className="p-1 text-gray-400 hover:text-[#D26900] rounded transition-colors cursor-pointer"
                                      title="Edit Item"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                      </svg>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setDeleteModal({
                                          isOpen: true,
                                          type: 'dropdown',
                                          id: sub.id,
                                          title: sub.title,
                                        })
                                      }
                                      className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                                      title="Delete Item"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="py-4 text-center border border-dashed border-gray-200 rounded-lg bg-gray-50/40">
                    <p className="text-xs text-gray-400 font-medium">No dropdown items yet</p>
                  </div>
                )}
              </div>

              {/* Add Dropdown Item CTA Button at bottom of card */}
              <div className="pt-3 mt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() =>
                    setAddDropdownModal({
                      isOpen: true,
                      headerId: header.id,
                      headerTitle: header.title,
                      items: [''],
                      sub_heading: '',
                      layout: 'column',
                      loading: false,
                    })
                  }
                  className="w-full inline-flex items-center justify-center gap-1.5 bg-[#FFF7ED] hover:bg-[#FFEDD5] text-[#D26900] border border-[#FED7AA] py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4" />
                  </svg>
                  + Add Dropdown Items
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ======================================================== */}
      {/* CENTERED MODAL: Customize Login Offer Banner             */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isBannerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-xl p-6 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] text-[#D26900] flex items-center justify-center shrink-0 shadow-2xs">
                    <svg className="w-5 h-5 text-[#D26900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v3a2 2 0 01-2 2M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#111827]">Customize Login Offer Banner</h3>
                    <p className="text-xs text-[#6B7280]">
                      Changes will reflect immediately on the customer login page.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsBannerModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form Content with Live Preview */}
              <form onSubmit={handleSaveBanner} className="space-y-4 overflow-y-auto pr-1.5 mt-4 custom-cta-scrollbar">
                {/* Live Banner Preview with Compact Inline Display Toggle (No separate bulky card) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-[#D26900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>Live Banner Preview</span>
                    </label>

                    {/* Compact ON/OFF Display Switch */}
                    <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-2xs">
                      <span className="text-[11px] font-semibold text-gray-700">Display Banner:</span>
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                          bannerForm.is_active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {bannerForm.is_active ? 'ON' : 'OFF'}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={bannerForm.is_active}
                          onChange={(e) =>
                            setBannerForm((p) => ({ ...p, is_active: e.target.checked }))
                          }
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4.5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#D26900]" />
                      </label>
                    </div>
                  </div>

                  <div
                    className="relative w-full h-[140px] rounded-xl overflow-hidden flex items-stretch border border-gray-200 shadow-xs"
                    style={{ backgroundColor: bannerForm.bg_color || '#FEEFEA' }}
                  >
                    {/* Left preview content */}
                    <div className="w-[60%] p-3.5 flex flex-col justify-between z-10">
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-[#D26900] font-black text-xs uppercase">FLAT</span>
                          <span className="text-[#D26900] text-xs">✨</span>
                        </div>
                        <h4 className="text-xl font-black text-[#D26900] leading-none mt-0.5">
                          {bannerForm.heading || 'FLAT ₹300 OFF'}
                        </h4>
                        <p className="text-[10px] font-bold text-[#D26900] mt-1 leading-tight uppercase">
                          {bannerForm.subheading || 'ON YOUR 1ST ORDER + EXCITING OFFERS*'}
                        </p>
                      </div>

                      <div>
                        <div className="inline-flex items-center gap-1 bg-[#D26900] text-white px-2 py-0.5 rounded-sm text-[10px] font-bold">
                          <span>CODE:</span>
                          <span className="tracking-widest uppercase">{bannerForm.coupon_code || 'YTEDDY300'}</span>
                        </div>
                        <p className="text-[8px] text-gray-500 font-medium mt-0.5">
                          {bannerForm.terms_text || '*T&C Applied | Limited Time Offer'}
                        </p>
                      </div>
                    </div>

                    {/* Right preview image */}
                    <div className="w-[40%] relative overflow-hidden flex items-end justify-center">
                      <img
                        src={bannerForm.image_url || DEFAULT_TEDDY_URL}
                        alt="Preview"
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_TEDDY_URL;
                        }}
                      />
                      {bannerForm.badge_text && (
                        <div className="absolute top-0 right-0 bg-[#D26900] text-white px-2 py-0.5 text-[9px] font-bold rounded-bl">
                          {bannerForm.badge_text}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Banner Visual & Media Asset Card - Professional Cloud CDN */}
                <div className="p-4 bg-gradient-to-br from-[#FFFBF7] to-[#FFF5ED] rounded-xl border border-[#FDBA74]/80 space-y-3.5 shadow-2xs">
                  {/* Card Header with Professional Labels & Clean Badge */}
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-[#D26900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Banner Visual Asset</span>
                    </label>
                    <span className="text-[10px] bg-orange-100 text-[#D26900] font-bold px-2.5 py-0.5 rounded-full border border-orange-200 shadow-2xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D26900] animate-pulse"></span>
                      <span>High-Speed Cloud CDN</span>
                    </span>
                  </div>

                  {/* Media Gallery Dropdown (Full width, elegant, with original uploaded name & delete icon) */}
                  <div ref={galleryDropdownRef} className="relative">
                    <label className="block text-[11px] font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-[#D26900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span>Select Banner Image</span>
                      </span>
                      <span className="text-[10px] font-semibold text-[#D26900]">
                        ({availableBannerImages.length} available)
                      </span>
                    </label>

                    {/* Custom Trigger Button with Thumbnail & Brand Styling */}
                    <button
                      type="button"
                      onClick={() => setIsGalleryDropdownOpen((prev) => !prev)}
                      className={`w-full bg-white border ${
                        isGalleryDropdownOpen
                          ? 'border-[#D26900] ring-2 ring-[#D26900]/25 shadow-xs'
                          : 'border-[#FDBA74] hover:border-[#D26900]'
                      } rounded-lg px-3 py-2 flex items-center justify-between text-left transition-all cursor-pointer shadow-2xs min-h-[46px]`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden mr-2">
                        <img
                          src={selectedBannerItem.url}
                          alt="Current"
                          className="w-8 h-8 rounded-md object-cover border border-[#FDBA74] shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = DEFAULT_TEDDY_URL;
                          }}
                        />
                        <div className="truncate">
                          <span className="block text-xs font-bold text-gray-800 truncate leading-tight">
                            {selectedBannerItem.name}
                          </span>
                          <span className="block text-[10px] text-[#D26900] font-semibold leading-tight">
                            {selectedBannerItem.is_default ? 'System Default Theme' : 'Cloud Media Asset'}
                          </span>
                        </div>
                      </div>

                      <svg
                        className={`w-4 h-4 text-[#D26900] shrink-0 transition-transform duration-200 ${
                          isGalleryDropdownOpen ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Custom Animated / Styled Dropdown Menu */}
                    <AnimatePresence>
                      {isGalleryDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -4, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-xl border border-[#FDBA74] shadow-xl overflow-hidden py-1 max-h-64 overflow-y-auto divide-y divide-gray-100 custom-cta-scrollbar"
                        >
                          <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/60">
                            Available Banner Images
                          </div>

                          {availableBannerImages.map((img) => {
                            const isSelected = bannerForm.image_url === img.url;
                            const isDeleting = deletingImageUrl === img.url;

                            return (
                              <div
                                key={img.url}
                                onClick={() => {
                                  setBannerForm((p) => ({ ...p, image_url: img.url }));
                                  setIsGalleryDropdownOpen(false);
                                }}
                                className={`w-full px-3 py-2 flex items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-orange-50 text-[#D26900] font-bold border-l-4 border-[#D26900]'
                                    : 'hover:bg-orange-50/60 text-gray-800'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  <img
                                    src={img.url}
                                    alt="Thumb"
                                    className="w-9 h-9 rounded-lg object-cover border border-orange-200 shrink-0"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = DEFAULT_TEDDY_URL;
                                    }}
                                  />
                                  <div className="min-w-0 flex-1">
                                    <p className={`text-xs truncate ${isSelected ? 'font-black text-[#D26900]' : 'font-semibold text-gray-800'}`}>
                                      {img.name}
                                    </p>
                                    <span className="text-[10px] font-medium text-gray-400 block truncate">
                                      {img.is_default ? 'System Default' : 'Cloud CDN Asset'}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {isSelected && (
                                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#D26900] text-white shadow-2xs" title="Currently Selected">
                                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </span>
                                  )}

                                  {!img.is_default && (
                                    <button
                                      type="button"
                                      title="Delete image from Cloud CDN and Database"
                                      disabled={isDeleting}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteBannerImage(img.url, img.name);
                                      }}
                                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    >
                                      {isDeleting ? (
                                        <svg className="animate-spin w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="none">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                      ) : (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Actions Row: Upload New Image Button */}
                  <div className="pt-2 border-t border-[#FDBA74]/50">
                    <input
                      ref={bannerFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleBannerFileUpload}
                    />

                    <button
                      type="button"
                      disabled={uploadingBannerImage}
                      onClick={() => bannerFileInputRef.current?.click()}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#D26900] to-[#E65100] hover:from-[#B45309] hover:to-[#D26900] text-white text-xs font-bold rounded-lg cursor-pointer transition-all shadow-xs disabled:opacity-50"
                    >
                      {uploadingBannerImage ? (
                        <>
                          <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          <span>Uploading Media Asset...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span>Upload New Banner Image</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[10px] text-gray-500 text-center">
                    Images are securely optimized, delivered via High-Speed Cloud CDN, and synced with your database.
                  </p>
                </div>

                {/* Two-column layout for texts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#111827] mb-1">
                      Discount Heading *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. FLAT ₹300 OFF"
                      value={bannerForm.heading}
                      onChange={(e) => setBannerForm((p) => ({ ...p, heading: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:border-[#D26900] focus:ring-2 focus:ring-[#D26900]/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#111827] mb-1">
                      Coupon Code *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. YTEDDY300"
                      value={bannerForm.coupon_code}
                      onChange={(e) =>
                        setBannerForm((p) => ({ ...p, coupon_code: e.target.value.toUpperCase() }))
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:border-[#D26900] focus:ring-2 focus:ring-[#D26900]/20 outline-none font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#111827] mb-1">
                      Offer Sub-heading
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ON YOUR 1ST ORDER + EXCITING OFFERS*"
                      value={bannerForm.subheading}
                      onChange={(e) => setBannerForm((p) => ({ ...p, subheading: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:border-[#D26900] focus:ring-2 focus:ring-[#D26900]/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#111827] mb-1">
                      Corner Ribbon Tag
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ₹300 OFF or LIMITED"
                      value={bannerForm.badge_text}
                      onChange={(e) => setBannerForm((p) => ({ ...p, badge_text: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:border-[#D26900] focus:ring-2 focus:ring-[#D26900]/20 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#111827] mb-1">
                      Terms &amp; Conditions Note
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. *T&C Applied | Limited Time Offer"
                      value={bannerForm.terms_text}
                      onChange={(e) => setBannerForm((p) => ({ ...p, terms_text: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:border-[#D26900] focus:ring-2 focus:ring-[#D26900]/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#111827] mb-1">
                      Banner Background Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={bannerForm.bg_color}
                        onChange={(e) => setBannerForm((p) => ({ ...p, bg_color: e.target.value }))}
                        className="w-8 h-8 rounded border border-gray-200 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={bannerForm.bg_color}
                        onChange={(e) => setBannerForm((p) => ({ ...p, bg_color: e.target.value }))}
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsBannerModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bannerSubmitting}
                    className="px-6 py-2 bg-[#D26900] hover:bg-[#B45309] text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs transition-colors"
                  >
                    {bannerSubmitting ? 'Saving...' : 'Save Banner Offer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* CENTERED MODAL: Delete Confirmation Modal (CTA Theme)   */}
      {/* ======================================================== */}
      <AdminConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDelete}
        title={
          deleteModal.type === 'banner'
            ? 'Delete Banner Asset?'
            : deleteModal.type === 'doodle'
            ? 'Delete Doodle Pattern?'
            : deleteModal.type === 'header'
            ? 'Delete Header Category?'
            : 'Delete Dropdown Item?'
        }
        message={
          deleteModal.type === 'banner'
            ? 'Are you sure you want to delete this asset from Cloud CDN and Database?'
            : deleteModal.type === 'doodle'
            ? 'Delete this doodle from Cloud storage and background theme?'
            : deleteModal.type === 'header'
            ? 'Are you sure you want to delete this category header from navigation?'
            : 'Are you sure you want to delete this dropdown item from the menu?'
        }
        itemName={deleteModal.title}
        warningNote={
          deleteModal.type === 'header'
            ? 'All dropdown items inside this header will also be permanently deleted.'
            : deleteModal.warningNote
        }
        confirmText={
          deleteModal.type === 'banner'
            ? 'Yes, Delete Asset'
            : deleteModal.type === 'doodle'
            ? 'Yes, Delete Doodle'
            : deleteModal.type === 'header'
            ? 'Yes, Delete Header'
            : 'Yes, Delete Item'
        }
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteSubmitting}
      />

      {/* ======================================================== */}
      {/* CENTERED MODAL: Rename / Edit Modal                      */}
      {/* ======================================================== */}
      <AnimatePresence>
        {editModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md p-6 overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-bold text-[#111827]">
                    {editModal.type === 'header' ? 'Rename Header' : 'Edit Dropdown Item & Sub-Heading'}
                  </h3>
                  {editModal.type === 'dropdown' && editModal.headerTitle && (
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      Category: <span className="font-bold text-[#D26900]">{editModal.headerTitle}</span>
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setEditModal({ isOpen: false, type: 'header', id: '', title: '', sub_heading: '', headerId: '', headerTitle: '' })}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSaveRename} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1.5">
                    {editModal.type === 'header' ? 'Header Name *' : 'Dropdown Item Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Enter name..."
                    value={editModal.title}
                    onChange={(e) => setEditModal((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:border-[#D26900] focus:ring-2 focus:ring-[#D26900]/20 outline-none"
                  />
                </div>

                {editModal.type === 'dropdown' && (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-[#111827]">
                          Sub-Heading / Section <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        {editModal.sub_heading && (
                          <button
                            type="button"
                            onClick={() => setEditModal((prev) => ({ ...prev, sub_heading: '' }))}
                            className="text-[11px] font-semibold text-red-500 hover:text-red-700 hover:underline cursor-pointer"
                          >
                            ✕ Remove Sub-Heading
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Plush Collection, School Gear, By Age..."
                        value={editModal.sub_heading || ''}
                        onChange={(e) =>
                          setEditModal((prev) => ({ ...prev, sub_heading: e.target.value }))
                        }
                        className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:border-[#D26900] focus:ring-2 focus:ring-[#D26900]/20 outline-none"
                      />
                      <p className="text-[11px] text-[#6B7280] mt-1">
                        Assign, change, or remove the sub-heading under which this item appears in the dropdown.
                      </p>

                      {/* Quick Pick Suggestions */}
                      {editModal.headerId && (existingSubHeadings[editModal.headerId] || []).length > 0 && (
                        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-gray-500 font-medium">Quick Pick:</span>
                          {(existingSubHeadings[editModal.headerId] || []).map((sh) => (
                            <button
                              key={sh.name}
                              type="button"
                              onClick={() => setEditModal((prev) => ({ ...prev, sub_heading: sh.name, layout: sh.layout }))}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                                editModal.sub_heading === sh.name
                                  ? 'bg-[#D26900] text-white border-[#D26900]'
                                  : 'bg-orange-50/70 text-[#D26900] border-orange-200 hover:bg-orange-100'
                              }`}
                            >
                              {sh.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Display Layout: Row-wise vs Column-wise */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#111827]">
                        Sub-Heading Display Layout
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setEditModal((prev) => ({ ...prev, layout: 'column' }))}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2 ${
                            (editModal.layout || 'column') === 'column'
                              ? 'border-[#D26900] bg-[#FFF7ED] text-[#D26900] shadow-2xs ring-1 ring-[#D26900]/30'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                            (editModal.layout || 'column') === 'column' ? 'border-[#D26900] bg-[#D26900]' : 'border-gray-300'
                          }`}>
                            {(editModal.layout || 'column') === 'column' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <div>
                            <span className="block text-xs font-bold leading-tight">↕ Column-wise</span>
                            <span className="block text-[10px] text-gray-500 mt-0.5 leading-snug">
                              Vertical list (one below another)
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditModal((prev) => ({ ...prev, layout: 'row' }))}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2 ${
                            editModal.layout === 'row'
                              ? 'border-[#D26900] bg-[#FFF7ED] text-[#D26900] shadow-2xs ring-1 ring-[#D26900]/30'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                            editModal.layout === 'row' ? 'border-[#D26900] bg-[#D26900]' : 'border-gray-300'
                          }`}>
                            {editModal.layout === 'row' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <div>
                            <span className="block text-xs font-bold leading-tight">↔ Row-wise</span>
                            <span className="block text-[10px] text-gray-500 mt-0.5 leading-snug">
                              Horizontal wrap pills
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Mobile View Image Upload (Max 2MB) for both Header and Dropdown items */}
                <div className="space-y-1.5 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-[#111827]">
                      {editModal.type === 'header' ? 'Mobile Category Icon / Image' : 'Mobile Subcategory Image'}{' '}
                      <span className="text-gray-400 font-normal">(Optional, Max 2MB)</span>
                    </label>
                    {editModal.image_url && (
                      <button
                        type="button"
                        onClick={() => setEditModal((prev) => ({ ...prev, image_url: null }))}
                        className="text-[11px] font-semibold text-red-500 hover:text-red-700 hover:underline cursor-pointer"
                      >
                        ✕ Remove Image
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-[#6B7280]">
                    {editModal.type === 'header'
                      ? 'Displayed in the phone sidebar left column next to category title (never on desktop).'
                      : 'Displayed in the phone sidebar right grid next to this item name (never on desktop).'}
                  </p>

                  <div className="flex items-center gap-3 mt-2">
                    {editModal.image_url ? (
                      <div className="relative group w-14 h-14 rounded-full border-2 border-[#D26900]/40 overflow-hidden bg-orange-50 shrink-0 shadow-xs flex items-center justify-center">
                        <img
                          src={editModal.image_url}
                          alt="Mobile icon"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/images/placeholder.png';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-full border border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-400 shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[9px] font-medium mt-0.5">No image</span>
                      </div>
                    )}

                    <div className="flex-1 space-y-1">
                      <input
                        ref={editDropdownFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleEditDropdownImageUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={uploadingDropdownImage}
                        onClick={() => editDropdownFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-50 text-[#D26900] border border-orange-200 hover:bg-orange-100 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        {uploadingDropdownImage
                          ? 'Uploading to Cloud (Max 2MB)...'
                          : editModal.image_url
                          ? 'Change Mobile Image (Max 2MB)'
                          : 'Upload Mobile Image (Max 2MB)'}
                      </button>
                      <p className="text-[10px] text-gray-400">
                        Allowed formats: PNG, JPG, WebP, SVG. Max 2MB.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setEditModal({ isOpen: false, type: 'header', id: '', title: '', sub_heading: '', layout: 'column', headerId: '', headerTitle: '' })}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSubmitting}
                    className="px-5 py-2 bg-[#D26900] hover:bg-[#B45309] text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs transition-colors"
                  >
                    {editSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* CENTERED MODAL: Add Dropdown Items Modal                 */}
      {/* ======================================================== */}
      <AnimatePresence>
        {addDropdownModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg p-6 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-bold text-[#111827]">Add Dropdown Items</h3>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    For category: <span className="font-bold text-[#D26900]">{addDropdownModal.headerTitle}</span>
                  </p>
                </div>
                <button
                  onClick={() =>
                    setAddDropdownModal({
                      isOpen: false,
                      headerId: '',
                      headerTitle: '',
                      items: [''],
                      sub_heading: '',
                      layout: 'column',
                      loading: false,
                    })
                  }
                  className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateDropdown} className="space-y-4 overflow-y-auto pr-1 mt-4">
                {/* 1. Sub-Heading / Section (Optional) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#111827]">
                      Sub-Heading / Section <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    {addDropdownModal.sub_heading && (
                      <button
                        type="button"
                        onClick={() => setAddDropdownModal((prev) => ({ ...prev, sub_heading: '' }))}
                        className="text-[11px] font-semibold text-red-500 hover:text-red-700 hover:underline cursor-pointer"
                      >
                        ✕ Clear Sub-Heading
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Plush Collection, School Gear, By Age..."
                    value={addDropdownModal.sub_heading}
                    onChange={(e) =>
                      setAddDropdownModal((prev) => ({ ...prev, sub_heading: e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:border-[#D26900] focus:ring-2 focus:ring-[#D26900]/20 outline-none"
                  />
                  <p className="text-[11px] text-[#6B7280] mt-1">
                    Group these items under a Sub-Heading in the navbar dropdown menu. Leave empty for direct items.
                  </p>

                  {/* Existing category sub-headings */}
                  {addDropdownModal.headerId && (existingSubHeadings[addDropdownModal.headerId] || []).length > 0 && (
                    <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-gray-500 font-medium">Quick Pick:</span>
                      {(existingSubHeadings[addDropdownModal.headerId] || []).map((sh) => (
                        <button
                          key={sh.name}
                          type="button"
                          onClick={() => setAddDropdownModal((prev) => ({ ...prev, sub_heading: sh.name, layout: sh.layout }))}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                            addDropdownModal.sub_heading === sh.name
                              ? 'bg-[#D26900] text-white border-[#D26900]'
                              : 'bg-orange-50/70 text-[#D26900] border-orange-200 hover:bg-orange-100'
                          }`}
                        >
                          {sh.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Display Layout: Row-wise vs Column-wise */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#111827]">
                    Sub-Heading Display Layout
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setAddDropdownModal((prev) => ({ ...prev, layout: 'column' }))}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2 ${
                        addDropdownModal.layout === 'column'
                          ? 'border-[#D26900] bg-[#FFF7ED] text-[#D26900] shadow-2xs ring-1 ring-[#D26900]/30'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        addDropdownModal.layout === 'column' ? 'border-[#D26900] bg-[#D26900]' : 'border-gray-300'
                      }`}>
                        {addDropdownModal.layout === 'column' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <span className="block text-xs font-bold leading-tight">↕ Column-wise</span>
                        <span className="block text-[10px] text-gray-500 mt-0.5 leading-snug">
                          Vertical list (one below another)
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAddDropdownModal((prev) => ({ ...prev, layout: 'row' }))}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2 ${
                        addDropdownModal.layout === 'row'
                          ? 'border-[#D26900] bg-[#FFF7ED] text-[#D26900] shadow-2xs ring-1 ring-[#D26900]/30'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        addDropdownModal.layout === 'row' ? 'border-[#D26900] bg-[#D26900]' : 'border-gray-300'
                      }`}>
                        {addDropdownModal.layout === 'row' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <span className="block text-xs font-bold leading-tight">↔ Row-wise</span>
                        <span className="block text-[10px] text-gray-500 mt-0.5 leading-snug">
                          Horizontal wrap pills
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 3. Multiple Dropdown Items with Add & Remove */}
                <div className="space-y-2 pt-1 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#111827]">
                      Dropdown Item Names * ({addDropdownModal.items.filter((t) => t.trim()).length} added)
                    </label>
                    <button
                      type="button"
                      onClick={handleAddItemRow}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#D26900] hover:text-[#B45309] bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-lg border border-orange-200 transition-colors cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      + Add Item
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {addDropdownModal.items.map((val, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-orange-100 text-[#D26900] text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          required={idx === 0}
                          placeholder={
                            idx === 0
                              ? 'e.g. school bag'
                              : idx === 1
                              ? 'e.g. trolly bag'
                              : `e.g. item ${idx + 1}`
                          }
                          value={val}
                          onChange={(e) => handleItemChange(idx, e.target.value)}
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:border-[#D26900] focus:ring-2 focus:ring-[#D26900]/20 outline-none"
                        />
                        {addDropdownModal.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(idx)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                            title="Remove this item"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-[#6B7280]">
                    You can add one or multiple dropdown items under this sub-heading at once.
                  </p>
                </div>

                {/* 4. Mobile View Item Image (Optional, Max 2MB) */}
                <div className="space-y-1.5 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-[#111827]">
                      Mobile Sidebar Image <span className="text-gray-400 font-normal">(Optional, Max 2MB)</span>
                    </label>
                    {addDropdownModal.image_url && (
                      <button
                        type="button"
                        onClick={() => setAddDropdownModal((prev) => ({ ...prev, image_url: null }))}
                        className="text-[11px] font-semibold text-red-500 hover:text-red-700 hover:underline cursor-pointer"
                      >
                        ✕ Remove Image
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-[#6B7280]">
                    Image to show in phone sidebar for these items (Max 2MB, saved in Cloud &amp; DB).
                  </p>

                  <div className="flex items-center gap-3 mt-2">
                    {addDropdownModal.image_url ? (
                      <div className="relative group w-14 h-14 rounded-full border-2 border-[#D26900]/40 overflow-hidden bg-orange-50 shrink-0 shadow-xs flex items-center justify-center">
                        <img
                          src={addDropdownModal.image_url}
                          alt="Dropdown item mobile icon"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/images/placeholder.png';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-full border border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-400 shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[9px] font-medium mt-0.5">No image</span>
                      </div>
                    )}

                    <div className="flex-1 space-y-1">
                      <input
                        ref={addDropdownFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAddDropdownImageUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={uploadingDropdownImage}
                        onClick={() => addDropdownFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-50 text-[#D26900] border border-orange-200 hover:bg-orange-100 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        {uploadingDropdownImage
                          ? 'Uploading to Cloud (Max 2MB)...'
                          : addDropdownModal.image_url
                          ? 'Change Mobile Image (Max 2MB)'
                          : 'Upload Mobile Image (Max 2MB)'}
                      </button>
                      <p className="text-[10px] text-gray-400">
                        Allowed formats: PNG, JPG, WebP, SVG. Max 2MB.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() =>
                      setAddDropdownModal({
                        isOpen: false,
                        headerId: '',
                        headerTitle: '',
                        items: [''],
                        sub_heading: '',
                        layout: 'column',
                        image_url: null,
                        loading: false,
                      })
                    }
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addDropdownModal.loading}
                    className="px-5 py-2 bg-[#D26900] hover:bg-[#B45309] text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs transition-colors"
                  >
                    {addDropdownModal.loading
                      ? 'Saving...'
                      : `+ Add ${
                          addDropdownModal.items.filter((t) => t.trim()).length > 1
                            ? `${addDropdownModal.items.filter((t) => t.trim()).length} Items`
                            : 'Dropdown Item'
                        }`}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* CENTERED MODAL: Add Header (Only Title!)                 */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isHeaderModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md p-6 overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-lg font-bold text-[#111827]">Add New Header</h3>
                <button
                  onClick={() => setIsHeaderModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateHeader} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1.5">
                    Header Name *
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Man bag, Teddy Bags, School Bags..."
                    value={headerTitle}
                    onChange={(e) => setHeaderTitle(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:border-[#D26900] focus:ring-2 focus:ring-[#D26900]/20 outline-none"
                  />
                  <p className="text-[11px] text-[#6B7280] mt-1.5">
                    This category will appear beside the logo in the website header.
                  </p>
                </div>

                {/* Mobile View Image Upload for New Header (Max 2MB) */}
                <div className="space-y-1.5 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-[#111827]">
                      Mobile Category Icon / Image <span className="text-gray-400 font-normal">(Optional, Max 2MB)</span>
                    </label>
                    {headerImageUrl && (
                      <button
                        type="button"
                        onClick={() => setHeaderImageUrl(null)}
                        className="text-[11px] font-semibold text-red-500 hover:text-red-700 hover:underline cursor-pointer"
                      >
                        ✕ Remove Image
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-[#6B7280]">
                    Appears in the mobile phone sidebar drawer left column next to category title.
                  </p>

                  <div className="flex items-center gap-3 mt-2">
                    {headerImageUrl ? (
                      <div className="relative group w-14 h-14 rounded-full border-2 border-[#D26900]/40 overflow-hidden bg-orange-50 shrink-0 shadow-xs flex items-center justify-center">
                        <img
                          src={headerImageUrl}
                          alt="New header mobile icon"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/images/placeholder.png';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-full border border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-400 shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[9px] font-medium mt-0.5">No image</span>
                      </div>
                    )}

                    <div className="flex-1 space-y-1">
                      <input
                        ref={addHeaderFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAddHeaderImageUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={uploadingHeaderImage}
                        onClick={() => addHeaderFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-50 text-[#D26900] border border-orange-200 hover:bg-orange-100 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        {uploadingHeaderImage
                          ? 'Uploading to Cloud (Max 2MB)...'
                          : headerImageUrl
                          ? 'Change Category Image (Max 2MB)'
                          : 'Upload Category Image (Max 2MB)'}
                      </button>
                      <p className="text-[10px] text-gray-400">
                        Allowed formats: PNG, JPG, WebP, SVG. Max 2MB.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsHeaderModalOpen(false);
                      setHeaderImageUrl(null);
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={headerSubmitting}
                    className="px-5 py-2 bg-[#D26900] hover:bg-[#B45309] text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs transition-colors"
                  >
                    {headerSubmitting ? 'Creating...' : '+ Create Header'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* CENTERED MODAL: Edit Legal & Help Pages (Simple Title & Description) */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isPagesModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Modal Top Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-center text-[#D26900] shadow-xs">
                    {selectedPageSlug === 'terms-of-use' && (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                    {selectedPageSlug === 'privacy-policy' && (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    )}
                    {selectedPageSlug === 'get-help' && (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#111827]">
                      Manage Legal &amp; Help Pages
                    </h3>
                    <p className="text-xs text-[#6B7280]">
                      Edit Heading Title and Description for customer public pages. Saved in database.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPagesModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg hover:bg-gray-200/50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Page Selection Tabs */}
              <div className="p-3 bg-white border-b border-gray-100 flex items-center gap-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => handleSelectPageTab('terms-of-use')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedPageSlug === 'terms-of-use'
                      ? 'bg-[#D26900] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Terms of Use</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPageTab('privacy-policy')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedPageSlug === 'privacy-policy'
                      ? 'bg-[#D26900] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Privacy Policy</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPageTab('get-help')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedPageSlug === 'get-help'
                      ? 'bg-[#D26900] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>Get Help / Support</span>
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSavePage} className="p-5 overflow-y-auto space-y-4 flex-1">
                {/* Heading / Title */}
                <div>
                  <label className="block text-xs font-bold text-[#111827] mb-1.5 uppercase tracking-wider">
                    Heading Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={pageForm.title}
                    onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })}
                    placeholder="e.g. Terms of Use, Privacy Policy..."
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-gray-900 focus:border-[#D26900] focus:ring-2 focus:ring-[#D26900]/20 outline-none transition-all"
                  />
                  <p className="text-[11px] text-[#6B7280] mt-1">
                    This main heading title is displayed at the top of the public page.
                  </p>
                </div>

                {/* Description Content */}
                <div>
                  <label className="block text-xs font-bold text-[#111827] mb-1.5 uppercase tracking-wider">
                    Page Description / Content *
                  </label>
                  <textarea
                    rows={11}
                    required
                    value={pageForm.description}
                    onChange={(e) => setPageForm({ ...pageForm, description: e.target.value })}
                    placeholder="Enter the complete text description or terms content here. Separate paragraphs with an empty line..."
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 leading-relaxed font-sans focus:border-[#D26900] focus:ring-2 focus:ring-[#D26900]/20 outline-none transition-all resize-y"
                  />
                  <p className="text-[11px] text-[#6B7280] mt-1">
                    Tip: Separate paragraphs or numbered points with a blank line for clean formatting on the customer page.
                  </p>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsPagesModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={pageSubmitting}
                    className="px-6 py-2.5 bg-[#D26900] hover:bg-[#B45309] text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs transition-all flex items-center gap-2"
                  >
                    {pageSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving to Database...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Page Content
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* Background Theme & Cloud Doodle Customizer Modal (Centered)        */}
        {/* ==================================================================== */}
        {isBgThemeModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-200/90 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden"
            >
              {/* Modal Top Bar */}
              <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-50/50 via-white to-orange-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-center text-[#D26900] shadow-xs">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4 4 4 0 014-4h10a4 4 0 014 4 4 4 0 01-4 4H7zM5 13V7a2 2 0 012-2h10a2 2 0 012 2v6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#111827]">
                      Background Theme &amp; Cloud Doodle Patterns
                    </h3>
                    <p className="text-xs text-[#6B7280]">
                      Configure background colors, sizes, and cloud-saved doodle illustrations separately for Big Screen &amp; Mobile.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBgThemeModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Device Tabs: Big Screen vs Mobile */}
              <div className="px-4 py-2.5 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveThemeDevice('desktop')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeThemeDevice === 'desktop'
                        ? 'bg-[#D26900] text-white shadow-xs'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Big Screen (Desktop)</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      activeThemeDevice === 'desktop' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {bgThemeForm.desktop.doodles?.length || 0}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveThemeDevice('mobile')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeThemeDevice === 'mobile'
                        ? 'bg-[#D26900] text-white shadow-xs'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span>Mobile Screen</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      activeThemeDevice === 'mobile' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {bgThemeForm.mobile.doodles?.length || 0}
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyThemeSettings(
                        activeThemeDevice,
                        activeThemeDevice === 'desktop' ? 'mobile' : 'desktop'
                      )
                    }
                    className="text-[11px] font-semibold text-[#D26900] hover:text-[#B45309] hover:underline cursor-pointer flex items-center gap-1"
                    title={`Copy ${activeThemeDevice === 'desktop' ? 'Desktop' : 'Mobile'} theme to ${activeThemeDevice === 'desktop' ? 'Mobile' : 'Desktop'}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy to {activeThemeDevice === 'desktop' ? 'Mobile' : 'Big Screen'}</span>
                  </button>

                  <span className="text-gray-300">|</span>

                  <button
                    type="button"
                    onClick={handleResetToDefaultBg}
                    className="text-[11px] font-semibold text-gray-500 hover:text-gray-800 hover:underline cursor-pointer"
                    title="Reset to default Login soft peach gradient"
                  >
                    Reset Default BG
                  </button>
                </div>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handleSaveBgTheme} className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
                {/* 1. Real-time Live Screen Preview */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                      <span>Live Background Preview</span>
                      <span className="text-[10px] font-normal normal-case text-gray-500">
                        (Simulating {activeThemeDevice === 'desktop' ? 'Big Screen' : 'Mobile'} view)
                      </span>
                    </label>
                    <span className="text-[11px] text-[#D26900] font-semibold">
                      {(bgThemeForm[activeThemeDevice].doodles || []).filter((d) => d.isActive !== false).length} of {bgThemeForm[activeThemeDevice].doodles?.length || 0} Doodles Active
                    </span>
                  </div>

                  <div
                    className="relative w-full h-36 sm:h-40 rounded-xl border border-gray-200 shadow-inner overflow-hidden flex items-center justify-center p-3 transition-all"
                    style={{
                      background:
                        bgThemeForm[activeThemeDevice].bg_type === 'default'
                          ? 'linear-gradient(to bottom, rgba(253, 240, 236, 0.7) 0%, rgba(253, 245, 242, 0.5) 50%, rgba(253, 240, 236, 0.8) 100%)'
                          : bgThemeForm[activeThemeDevice].use_gradient
                          ? `linear-gradient(to bottom, ${bgThemeForm[activeThemeDevice].bg_color}, ${bgThemeForm[activeThemeDevice].gradient_to})`
                          : bgThemeForm[activeThemeDevice].bg_color,
                    }}
                  >
                    {/* SVG Repeating Doodle Pattern */}
                    {bgThemeForm[activeThemeDevice].doodles &&
                      bgThemeForm[activeThemeDevice].doodles.filter((d) => d.isActive !== false).length > 0 && (
                        <svg
                          aria-hidden="true"
                          className="absolute inset-0 w-full h-full pointer-events-none select-none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <defs>
                            <pattern
                              id="preview-bg-doodle-pattern"
                              x="0"
                              y="0"
                              width={(bgThemeForm[activeThemeDevice].pattern_size + bgThemeForm[activeThemeDevice].pattern_gap) * (bgThemeForm[activeThemeDevice].doodles.filter((d) => d.isActive !== false).length > 1 ? 2 : 1)}
                              height={(bgThemeForm[activeThemeDevice].pattern_size + bgThemeForm[activeThemeDevice].pattern_gap) * (bgThemeForm[activeThemeDevice].doodles.filter((d) => d.isActive !== false).length > 2 ? 2 : 1)}
                              patternUnits="userSpaceOnUse"
                            >
                              {bgThemeForm[activeThemeDevice].doodles
                                .filter((d) => d.isActive !== false)
                                .map((doodle, idx) => {
                                  const sz = bgThemeForm[activeThemeDevice].pattern_size;
                                  const gap = bgThemeForm[activeThemeDevice].pattern_gap;
                                  const step = sz + gap;
                                  const x = (idx % 2) * step + 10;
                                  const y = Math.floor(idx / 2) * step + 10;
                                  return (
                                    <image
                                      key={doodle.id || idx}
                                      href={doodle.url}
                                      xlinkHref={doodle.url}
                                      x={x}
                                      y={y}
                                      width={sz}
                                      height={sz}
                                      opacity={bgThemeForm[activeThemeDevice].pattern_opacity}
                                      preserveAspectRatio="xMidYMid meet"
                                    />
                                  );
                                })}
                            </pattern>
                          </defs>
                          <rect x="0" y="0" width="100%" height="100%" fill="url(#preview-bg-doodle-pattern)" />
                        </svg>
                      )}

                    {/* Mock Center Card */}
                    <div className="relative z-10 bg-white/95 backdrop-blur-xs px-4 py-2.5 rounded-lg shadow-sm border border-gray-200/80 text-center max-w-xs">
                      <div className="w-5 h-5 mx-auto rounded-full bg-[#D26900]/10 text-[#D26900] flex items-center justify-center font-bold text-[10px] mb-1">
                        Y
                      </div>
                      <p className="text-xs font-bold text-gray-800">Website &amp; Home Screen Background</p>
                      <p className="text-[10px] text-gray-500">Stickers &amp; doodles wallpaper repeating across entire site</p>
                    </div>
                  </div>
                </div>

                {/* 2. Login Page Display Option (Turn ON/OFF custom theme on login) */}
                <div className="bg-white p-3.5 rounded-xl border border-gray-200 flex items-center justify-between gap-4 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${
                      bgThemeForm[activeThemeDevice].apply_to_login
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : 'bg-orange-50 text-[#D26900] border border-orange-200'
                    }`}>
                      🔐
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-800">
                          Apply Theme to Login Page
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          bgThemeForm[activeThemeDevice].apply_to_login
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {bgThemeForm[activeThemeDevice].apply_to_login ? 'ON (Theme on Login)' : 'OFF (Original Clean Login BG)'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {bgThemeForm[activeThemeDevice].apply_to_login
                          ? 'Custom sticker doodles and background color will ALSO be applied on the Login page.'
                          : 'Login page retains its original default clean peach gradient. Theme stickers only show on customer website (Home, etc.).'}
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={Boolean(bgThemeForm[activeThemeDevice].apply_to_login)}
                      onChange={(e) =>
                        updateCurrentDeviceConfig((cur) => ({
                          ...cur,
                          apply_to_login: e.target.checked,
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D26900]"></div>
                  </label>
                </div>

                {/* 3. Background Color Settings */}
                <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                      Background Color &amp; Style
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-gray-700">
                        <input
                          type="radio"
                          name="bg_type"
                          checked={bgThemeForm[activeThemeDevice].bg_type === 'default'}
                          onChange={() => updateCurrentDeviceConfig((cur) => ({ ...cur, bg_type: 'default' }))}
                          className="text-[#D26900] focus:ring-[#D26900]"
                        />
                        <span>Default Login Gradient</span>
                      </label>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-gray-700">
                        <input
                          type="radio"
                          name="bg_type"
                          checked={bgThemeForm[activeThemeDevice].bg_type !== 'default'}
                          onChange={() => updateCurrentDeviceConfig((cur) => ({ ...cur, bg_type: 'color' }))}
                          className="text-[#D26900] focus:ring-[#D26900]"
                        />
                        <span>Custom Color / Gradient</span>
                      </label>
                    </div>
                  </div>

                  {bgThemeForm[activeThemeDevice].bg_type !== 'default' && (
                    <div className="space-y-3 pt-2 border-t border-gray-200">
                      {/* Color Presets */}
                      <div>
                        <span className="text-[11px] font-semibold text-gray-500 block mb-1.5">
                          Quick Color Palettes:
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          {[
                            { name: 'Peach (Default)', bg: '#FDF0EC', to: '#FDF5F2' },
                            { name: 'Warm Cream', bg: '#FFFBEB', to: '#FEF3C7' },
                            { name: 'Pure White', bg: '#FFFFFF', to: '#F9FAFB' },
                            { name: 'Soft Rose', bg: '#FFF1F2', to: '#FFE4E6' },
                            { name: 'Clean Mint', bg: '#F0FDF4', to: '#DCFCE7' },
                            { name: 'Lavender', bg: '#F5F3FF', to: '#EDE9FE' },
                          ].map((pal) => (
                            <button
                              key={pal.name}
                              type="button"
                              onClick={() =>
                                updateCurrentDeviceConfig((cur) => ({
                                  ...cur,
                                  bg_color: pal.bg,
                                  gradient_to: pal.to,
                                  use_gradient: true,
                                }))
                              }
                              className="px-2.5 py-1 text-xs rounded-md border border-gray-200 bg-white hover:border-[#D26900] transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                            >
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-gray-300"
                                style={{ background: `linear-gradient(135deg, ${pal.bg}, ${pal.to})` }}
                              />
                              <span className="text-gray-700 text-[11px] font-medium">{pal.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Color Pickers */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            Base Background Color
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={bgThemeForm[activeThemeDevice].bg_color || '#FDF0EC'}
                              onChange={(e) =>
                                updateCurrentDeviceConfig((cur) => ({ ...cur, bg_color: e.target.value }))
                              }
                              className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                            />
                            <input
                              type="text"
                              value={bgThemeForm[activeThemeDevice].bg_color || '#FDF0EC'}
                              onChange={(e) =>
                                updateCurrentDeviceConfig((cur) => ({ ...cur, bg_color: e.target.value }))
                              }
                              className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-mono uppercase text-gray-800"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-bold text-gray-700">
                              Gradient End Color
                            </label>
                            <label className="inline-flex items-center gap-1 text-[11px] text-gray-600 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={bgThemeForm[activeThemeDevice].use_gradient}
                                onChange={(e) =>
                                  updateCurrentDeviceConfig((cur) => ({ ...cur, use_gradient: e.target.checked }))
                                }
                                className="rounded text-[#D26900] focus:ring-[#D26900]"
                              />
                              <span>Enable Gradient</span>
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              disabled={!bgThemeForm[activeThemeDevice].use_gradient}
                              value={bgThemeForm[activeThemeDevice].gradient_to || '#FDF5F2'}
                              onChange={(e) =>
                                updateCurrentDeviceConfig((cur) => ({ ...cur, gradient_to: e.target.value }))
                              }
                              className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5 disabled:opacity-50"
                            />
                            <input
                              type="text"
                              disabled={!bgThemeForm[activeThemeDevice].use_gradient}
                              value={bgThemeForm[activeThemeDevice].gradient_to || '#FDF5F2'}
                              onChange={(e) =>
                                updateCurrentDeviceConfig((cur) => ({ ...cur, gradient_to: e.target.value }))
                              }
                              className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-mono uppercase text-gray-800 disabled:opacity-50"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Doodle Pattern Controls (Size Slider, Opacity, Spacing) */}
                <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-3">
                  <label className="text-xs font-bold text-[#111827] uppercase tracking-wider block">
                    Doodle Scale &amp; Appearance (Size Bada / Chhota)
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Size Slider */}
                    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-gray-700">Doodle Size</span>
                        <span className="text-xs font-mono font-bold text-[#D26900] bg-[#FFF7ED] px-2 py-0.5 rounded border border-[#FED7AA]">
                          {bgThemeForm[activeThemeDevice].pattern_size}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={15}
                        max={150}
                        step={1}
                        value={bgThemeForm[activeThemeDevice].pattern_size}
                        onChange={(e) =>
                          updateCurrentDeviceConfig((cur) => ({ ...cur, pattern_size: Number(e.target.value) }))
                        }
                        className="w-full accent-[#D26900] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                        <span>Small (15px)</span>
                        <span>Large (150px)</span>
                      </div>
                    </div>

                    {/* Opacity Slider */}
                    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-gray-700">Transparency</span>
                        <span className="text-xs font-mono font-bold text-[#D26900] bg-[#FFF7ED] px-2 py-0.5 rounded border border-[#FED7AA]">
                          {Math.round(bgThemeForm[activeThemeDevice].pattern_opacity * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={5}
                        max={100}
                        step={1}
                        value={Math.round(bgThemeForm[activeThemeDevice].pattern_opacity * 100)}
                        onChange={(e) =>
                          updateCurrentDeviceConfig((cur) => ({
                            ...cur,
                            pattern_opacity: Number(e.target.value) / 100,
                          }))
                        }
                        className="w-full accent-[#D26900] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                        <span>Subtle (5%)</span>
                        <span>Solid (100%)</span>
                      </div>
                    </div>

                    {/* Gap / Spacing Slider */}
                    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-gray-700">Doodle Spacing</span>
                        <span className="text-xs font-mono font-bold text-[#D26900] bg-[#FFF7ED] px-2 py-0.5 rounded border border-[#FED7AA]">
                          {bgThemeForm[activeThemeDevice].pattern_gap}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={20}
                        max={160}
                        step={2}
                        value={bgThemeForm[activeThemeDevice].pattern_gap}
                        onChange={(e) =>
                          updateCurrentDeviceConfig((cur) => ({ ...cur, pattern_gap: Number(e.target.value) }))
                        }
                        className="w-full accent-[#D26900] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                        <span>Dense (20px)</span>
                        <span>Spaced (160px)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Cloud Doodle PNGs Gallery & Upload */}
                <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-[#111827] uppercase tracking-wider block">
                          Cloud Doodle Illustrations ({bgThemeForm[activeThemeDevice].doodles?.length || 0})
                        </label>
                        {bgThemeForm[activeThemeDevice].doodles && bgThemeForm[activeThemeDevice].doodles.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleAllDoodles(true)}
                              className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded cursor-pointer transition-colors"
                            >
                              All In Use
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleAllDoodles(false)}
                              className="text-[10px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-2 py-0.5 rounded cursor-pointer transition-colors"
                            >
                              Pause All
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Select multiple transparent PNG doodles / sticker patterns to upload. Toggle &quot;In Use&quot; to choose which ones appear on the website background!
                      </p>
                    </div>

                    <div>
                      <input
                        ref={doodleFileInputRef}
                        type="file"
                        multiple
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        onChange={handleDoodleUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={isUploadingDoodle}
                        onClick={() => doodleFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#D26900] hover:bg-[#B45309] text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs transition-all disabled:opacity-50"
                      >
                        {isUploadingDoodle ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Uploading to Cloud...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Upload Doodles (Multiple Allowed)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Doodles Grid */}
                  {bgThemeForm[activeThemeDevice].doodles && bgThemeForm[activeThemeDevice].doodles.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
                      {bgThemeForm[activeThemeDevice].doodles.map((doodle) => (
                        <div
                          key={doodle.id}
                          className={`bg-white rounded-lg border p-2.5 flex flex-col items-center justify-between gap-2 shadow-2xs hover:shadow-xs transition-all relative group ${
                            doodle.isActive !== false ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-gray-200 opacity-75'
                          }`}
                        >
                          {/* Checkerboard square for transparent PNG display */}
                          <div
                            className="w-16 h-16 rounded-md border border-gray-100 flex items-center justify-center p-1.5 bg-gray-50 overflow-hidden"
                            style={{
                              backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
                              backgroundSize: '12px 12px',
                              backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
                            }}
                          >
                            <img
                              src={doodle.url}
                              alt={doodle.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>

                          <div className="w-full text-center">
                            <p className="text-[10px] font-semibold text-gray-700 truncate" title={doodle.name}>
                              {doodle.name}
                            </p>
                          </div>

                          {/* Toggle Active In Background Button ("use kr paw") */}
                          <button
                            type="button"
                            onClick={() => handleToggleDoodleActive(doodle.id)}
                            className={`w-full py-1 px-2 text-[10px] font-bold rounded flex items-center justify-center gap-1 cursor-pointer transition-all ${
                              doodle.isActive !== false
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-500 border border-gray-200'
                            }`}
                            title={doodle.isActive !== false ? 'Currently used in background. Click to disable.' : 'Currently disabled. Click to use.'}
                          >
                            {doodle.isActive !== false ? (
                              <>
                                <svg className="w-3 h-3 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>In Use</span>
                              </>
                            ) : (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                                <span>Disabled</span>
                              </>
                            )}
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            disabled={deletingDoodleUrl === doodle.url}
                            onClick={() => handleDeleteDoodleItem(doodle.url, doodle.name)}
                            className="w-full py-1 px-2 text-[10px] font-bold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 rounded transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                            title="Delete doodle from cloud storage"
                          >
                            {deletingDoodleUrl === doodle.url ? (
                              <div className="w-2.5 h-2.5 border border-red-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                            <span>Delete</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg border border-dashed border-gray-300 p-6 text-center">
                      <div className="w-10 h-10 rounded-full bg-orange-50 text-[#D26900] flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                        🎨
                      </div>
                      <p className="text-xs font-bold text-gray-800">No Custom Doodles Added Yet</p>
                      <p className="text-[11px] text-gray-500 max-w-sm mx-auto mt-0.5">
                        Click &quot;Upload Doodles (Multiple Allowed)&quot; above to add transparent illustrations (like doodle characters, shopping bags, or teddy art). You can pick multiple files at once!
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsBgThemeModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bgThemeSubmitting}
                    className="px-6 py-2.5 bg-[#D26900] hover:bg-[#B45309] text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {bgThemeSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving to Database...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save &amp; Apply Theme
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
