import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../redux/store';
import {
  createProduct,
  updateProduct,
  uploadProductImages,
} from '../../redux/slices/productSlice';
import type {
  ProductItem,
  ProductColor,
  ProductImage,
  ProductSpecificationItem,
} from '../../redux/slices/productSlice';
import { queryClient } from '../../lib/queryClient';
import { useHeaderNavigation } from '../../Context/HeaderNavigationContext';
import AdminCustomSelect from './AdminCustomSelect';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: ProductItem | null;
  onSuccess?: () => void;
}

function getErrorMessage(err: any, fallback: string): string {
  if (typeof err === 'string' && err.trim().length > 0) return err;
  if (err?.response?.data?.message && typeof err.response.data.message === 'string') {
    return err.response.data.message;
  }
  if (err?.message && typeof err.message === 'string') return err.message;
  return fallback;
}

const PRESET_SPEC_KEYS = [
  'Material & Fabric',
  'Dimensions (H x W x D)',
  'Item Weight',
  'Recommended Age Group',
  'Washing & Care Instructions',
  'Capacity / Volume',
  'Closure Type',
  'Compartments',
  'Strap Type',
  'Country of Origin',
];

const PRESET_SIZES = [
  'Mini (25cm)',
  'Standard (35cm)',
  'Jumbo (45cm)',
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  'Free Size',
];

const PRESET_BADGES = [
  '',
  'Bestseller',
  'Trending',
  'New Arrival',
  'Limited Edition',
  'Hot Deal',
  '50% OFF',
];

export default function ProductModal({
  isOpen,
  onClose,
  productToEdit,
  onSuccess,
}: ProductModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { adminItems } = useHeaderNavigation();
  const { uploadingImages } = useSelector((state: RootState) => state.products);

  const [activeTab, setActiveTab] = useState<
    'basic' | 'variants' | 'nav_link' | 'details' | 'photos'
  >('basic');
  const [submitting, setSubmitting] = useState(false);

  // Form State - Blank clean default on add product
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [sku, setSku] = useState('');
  const [badgeText, setBadgeText] = useState('');
  const [badgeStyle, setBadgeStyle] = useState<'ribbon' | 'pill' | 'minimal' | 'glass' | 'energetic'>('ribbon');
  const [badgeColor, setBadgeColor] = useState('#D26900');
  const [mrp, setMrp] = useState<number | ''>('');
  const [price, setPrice] = useState<number | ''>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [rating, setRating] = useState<number>(5.0);
  const [reviewsCount, setReviewsCount] = useState<number>(0);
  const [stockQuantity, setStockQuantity] = useState<number | ''>('');
  const [inStock, setInStock] = useState(true);
  const [isActive, setIsActive] = useState(true);

  // Colors (Optional)
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#D26900');

  // Sizes (Optional)
  const [sizes, setSizes] = useState<string[]>([]);
  const [customSizeInput, setCustomSizeInput] = useState('');

  // Navigation Links
  const [targetHeaderId, setTargetHeaderId] = useState('');
  const [targetDropdownId, setTargetDropdownId] = useState('');

  // Details & Highlights - Starts blank for new products
  const [whyLoveIt, setWhyLoveIt] = useState<string[]>([]);
  const [newWhyPoint, setNewWhyPoint] = useState('');

  // Dynamic Specifications State - Starts blank for new products
  const [specifications, setSpecifications] = useState<ProductSpecificationItem[]>([]);

  const handleAddSpecification = (keyName = '', defaultValue = '') => {
    setSpecifications((prev) => [...prev, { key: keyName, value: defaultValue }]);
  };

  const handleUpdateSpecification = (index: number, field: 'key' | 'value', val: string) => {
    setSpecifications((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleRemoveSpecification = (index: number) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  };

  // Description - Starts blank for new products
  const [description, setDescription] = useState('');

  // Images (Starts empty - admin adds their own, no default bag)
  const [images, setImages] = useState<ProductImage[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Auto-calculate discount when MRP or Price changes
  const handlePriceChange = (newPrice: number | '', newMrp: number | '') => {
    if (typeof newPrice === 'number' && typeof newMrp === 'number' && newMrp > 0) {
      if (newPrice < newMrp) {
        const disc = Math.round(((newMrp - newPrice) / newMrp) * 100);
        setDiscountPercent(disc);
      } else {
        setDiscountPercent(0);
      }
    }
  };

  // Populate form if editing
  useEffect(() => {
    if (productToEdit) {
      setTitle(productToEdit.title || '');
      setSubtitle(productToEdit.subtitle || '');
      setSku(productToEdit.sku || '');
      setBadgeText(productToEdit.badge_text || '');
      setBadgeStyle((productToEdit.badge_style as any) || 'ribbon');
      setBadgeColor(productToEdit.badge_color || '#D26900');
      setMrp(productToEdit.mrp || '');
      setPrice(productToEdit.price || '');
      setDiscountPercent(productToEdit.discount_percent || 0);
      setRating(productToEdit.rating || 5.0);
      setReviewsCount(productToEdit.reviews_count || 0);
      setStockQuantity(productToEdit.stock_quantity ?? '');
      setInStock(productToEdit.in_stock ?? true);
      setIsActive(productToEdit.is_active ?? true);
      setColors(
        Array.isArray(productToEdit.colors)
          ? productToEdit.colors.map((c: any) =>
              typeof c === 'string'
                ? { name: c, hex: '#D26900' }
                : { name: String(c.name || ''), hex: String(c.hex || '#D26900') }
            )
          : []
      );
      setSizes(
        Array.isArray(productToEdit.sizes)
          ? productToEdit.sizes.map((s: any) => (typeof s === 'string' ? s : String(s?.size || s?.name || s)))
          : []
      );
      setTargetHeaderId(productToEdit.target_header_id || '');
      setTargetDropdownId(productToEdit.target_dropdown_id || '');
      setWhyLoveIt(
        productToEdit.why_love_it?.length
          ? [...productToEdit.why_love_it]
          : []
      );
      if (Array.isArray(productToEdit.specifications) && productToEdit.specifications.length > 0) {
        setSpecifications(
          productToEdit.specifications.map((s) => ({ key: s.key || '', value: s.value || '' }))
        );
      } else if (productToEdit.specifications && typeof productToEdit.specifications === 'object') {
        const converted = Object.entries(productToEdit.specifications).map(([k, v]) => ({
          key: k.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
          value: String(v),
        }));
        setSpecifications(converted);
      } else {
        setSpecifications([]);
      }
      setDescription(productToEdit.description || '');
      setImages(productToEdit.images?.length ? [...productToEdit.images] : []);
    } else {
      // Reset form for fresh product - completely clean blank state
      setTitle('');
      setSubtitle('');
      setSku('');
      setBadgeText('');
      setBadgeStyle('ribbon');
      setBadgeColor('#D26900');
      setMrp('');
      setPrice('');
      setDiscountPercent(0);
      setRating(5.0);
      setReviewsCount(0);
      setStockQuantity('');
      setInStock(true);
      setIsActive(true);
      setColors([]);
      setSizes([]);
      setTargetHeaderId('');
      setTargetDropdownId('');
      setWhyLoveIt([]);
      setSpecifications([]);
      setDescription('');
      setImages([]);
    }
    setActiveTab('basic');
  }, [productToEdit, isOpen]);

  // Find current header & dropdown for title & path metadata
  const selectedHeader = adminItems.find((h) => h.id === targetHeaderId);
  const dropdownOptions = selectedHeader?.dropdown_items || [];
  const selectedDropdown = dropdownOptions.find((d) => d.id === targetDropdownId);

  // Color handlers
  const handleAddColor = () => {
    if (!newColorName.trim()) {
      toast.error('Please enter a color name');
      return;
    }
    setColors((prev) => [...prev, { name: newColorName.trim(), hex: newColorHex }]);
    setNewColorName('');
  };

  const handleRemoveColor = (idx: number) => {
    setColors((prev) => prev.filter((_, i) => i !== idx));
  };

  // Size handlers
  const handleTogglePresetSize = (sz: string) => {
    if (sizes.includes(sz)) {
      setSizes((prev) => prev.filter((s) => s !== sz));
    } else {
      setSizes((prev) => [...prev, sz]);
    }
  };

  const handleAddCustomSize = () => {
    const val = customSizeInput.trim();
    if (!val) return;
    if (sizes.includes(val)) {
      toast.error('Size already added');
      return;
    }
    setSizes((prev) => [...prev, val]);
    setCustomSizeInput('');
  };

  const handleRemoveSize = (sz: string) => {
    setSizes((prev) => prev.filter((s) => s !== sz));
  };

  // Why Love It bullet handlers
  const handleAddWhyPoint = () => {
    if (!newWhyPoint.trim()) return;
    setWhyLoveIt((prev) => [...prev, newWhyPoint.trim()]);
    setNewWhyPoint('');
  };

  const handleRemoveWhyPoint = (idx: number) => {
    setWhyLoveIt((prev) => prev.filter((_, i) => i !== idx));
  };

  // Multi-image file upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const fileList = Array.from(files);
      const res = await dispatch(uploadProductImages(fileList)).unwrap();
      if (res && res.length > 0) {
        const newImgs: ProductImage[] = res.map((url, i) => ({
          id: `img-${Date.now()}-${i}`,
          url,
          is_primary: images.length === 0 && i === 0,
          alt: `${title || 'Product'} image`,
        }));
        setImages((prev) => {
          const updated = [...prev, ...newImgs];
          // Ensure at least one primary
          if (!updated.some((im) => im.is_primary) && updated.length > 0) {
            updated[0].is_primary = true;
          }
          return updated;
        });
        toast.success(`${res.length} photo(s) uploaded successfully!`);
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to upload images'));
    }
    e.target.value = '';
  };

  // Direct URL image add
  const handleAddUrlImage = () => {
    if (!customImageUrl.trim()) return;
    const newImg: ProductImage = {
      id: `img-${Date.now()}`,
      url: customImageUrl.trim(),
      is_primary: images.length === 0,
      alt: title || 'Product image',
    };
    setImages((prev) => [...prev, newImg]);
    setCustomImageUrl('');
    toast.success('Image URL added!');
  };

  const handleSetPrimaryImage = (id: string) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        is_primary: img.id === id,
      }))
    );
    toast.success('Primary photo updated!');
  };

  const handleSetImageColor = (id: string, colorName: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, color_name: colorName } : img))
    );
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      if (filtered.length > 0 && !filtered.some((img) => img.is_primary)) {
        filtered[0].is_primary = true;
      }
      return filtered;
    });
    toast.info('Photo removed. Save changes to update database.');
  };

  // Save / Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Product title is required');
      setActiveTab('basic');
      return;
    }

    if (!price || Number(price) <= 0) {
      toast.error('Please enter a valid selling price');
      setActiveTab('basic');
      return;
    }

    if (images.length === 0) {
      toast.error('Please upload or add at least one product photo');
      setActiveTab('photos');
      return;
    }

    setSubmitting(true);
    try {
      const payload: Partial<ProductItem> = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        sku: sku.trim(),
        badge_text: badgeText.trim(),
        badge_style: badgeStyle,
        badge_color: badgeColor,
        mrp: Number(mrp) || Number(price),
        price: Number(price),
        discount_percent: Number(discountPercent) || 0,
        rating: Number(rating) || 5.0,
        reviews_count: Number(reviewsCount) || 0,
        stock_quantity: Number(stockQuantity) || 0,
        in_stock: inStock,
        is_active: isActive,
        colors,
        sizes,
        target_header_id: targetHeaderId || null,
        target_dropdown_id: targetDropdownId || null,
        header_title: selectedHeader?.title || null,
        header_path: selectedHeader?.path || null,
        dropdown_title: selectedDropdown?.title || null,
        dropdown_path: selectedDropdown?.path || null,
        why_love_it: whyLoveIt.filter((p) => p.trim().length > 0),
        specifications: specifications
          .filter((s) => s.key.trim().length > 0 || s.value.trim().length > 0)
          .map((s) => ({ key: s.key.trim(), value: s.value.trim() })),
        description: description.trim(),
        images,
        primary_image:
          images.find((img) => img.is_primary)?.url || images[0]?.url || '',
      };

      if (productToEdit) {
        await dispatch(updateProduct({ id: productToEdit.id, data: payload })).unwrap();
        toast.success('Product updated successfully!');
      } else {
        await dispatch(createProduct(payload)).unwrap();
        toast.success('Product created successfully!');
      }

      // Invalidate TanStack Query products cache for instant updates across the store
      queryClient.invalidateQueries({ queryKey: ['products'] });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to save product'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col z-10 border border-amber-100 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50/50 via-white to-orange-50/30">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="p-2 bg-gradient-to-br from-[#D26900] to-[#E65100] text-white rounded-xl shadow-sm text-sm">
                  🛍️
                </span>
                {productToEdit ? 'Edit Product' : 'Add New Product'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Set product specifications, multi-images, pricing, sizing, and header links
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 px-6 border-b border-gray-100 bg-gray-50/70 overflow-x-auto text-xs sm:text-sm font-semibold select-none">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={`py-3 px-3.5 border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'basic'
                  ? 'border-[#D26900] text-[#D26900] font-bold bg-white shadow-2xs'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <svg className={`w-4 h-4 ${activeTab === 'basic' ? 'text-[#D26900]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span>Basic & Pricing</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('variants')}
              className={`py-3 px-3.5 border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'variants'
                  ? 'border-[#D26900] text-[#D26900] font-bold bg-white shadow-2xs'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <svg className={`w-4 h-4 ${activeTab === 'variants' ? 'text-[#D26900]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4 4 4 0 014-4h4a4 4 0 014 4 4 4 0 01-4 4H7zm0 0a4 4 0 01-4-4 4 4 0 014-4m14-8a4 4 0 11-8 0 4 4 0 018 0zm-8 4v8" />
              </svg>
              <span>Colors & Sizes</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('photos')}
              className={`py-3 px-3.5 border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'photos'
                  ? 'border-[#D26900] text-[#D26900] font-bold bg-white shadow-2xs'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <svg className={`w-4 h-4 ${activeTab === 'photos' ? 'text-[#D26900]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Photos ({images.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`py-3 px-3.5 border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'details'
                  ? 'border-[#D26900] text-[#D26900] font-bold bg-white shadow-2xs'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <svg className={`w-4 h-4 ${activeTab === 'details' ? 'text-[#D26900]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <span>Specs & Highlights</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('nav_link')}
              className={`py-3 px-3.5 border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'nav_link'
                  ? 'border-[#D26900] text-[#D26900] font-bold bg-white shadow-2xs'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <svg className={`w-4 h-4 ${activeTab === 'nav_link' ? 'text-[#D26900]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span>Menu & Category Link</span>
            </button>
          </div>

          {/* Form Body (Scrollable) */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* TAB 1: BASIC & PRICING */}
            {activeTab === 'basic' && (
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-[#D26900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span>Product Title / Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Vintage Honey Teddy Backpack"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D26900]/40 focus:border-[#D26900] text-sm text-gray-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-[#D26900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    <span>Subtitle / Tagline</span>
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. Handcrafted premium velvet companion for school & daily adventures"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D26900]/40 focus:border-[#D26900] text-sm text-gray-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-[#D26900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                      <span>SKU Code</span>
                    </label>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="e.g. YTB-TB-001"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm font-mono text-gray-800 focus:outline-none focus:border-[#D26900]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-[#D26900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span>Stock Quantity</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 50"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-[#D26900]"
                    />
                  </div>
                </div>

                {/* DEDICATED BADGE CUSTOMIZATION (5 DESIGNS + COLOR THEME + LIVE PREVIEW) */}
                <div className="p-4 bg-orange-50/40 rounded-2xl border border-orange-200/70 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-[#D26900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        <span>Product Card Badge & Theme Design</span>
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        Choose between 5 card badge designs and pick a brand color (defaults to website theme)
                      </p>
                    </div>

                    {/* Live Badge Preview Box */}
                    {badgeText.trim() && (
                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-orange-200 shadow-2xs self-start sm:self-auto">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Preview:</span>
                        {badgeStyle === 'ribbon' && (
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white rounded-r-md shadow-xs"
                            style={{ backgroundColor: badgeColor }}
                          >
                            {badgeText}
                          </span>
                        )}
                        {badgeStyle === 'pill' && (
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white rounded-full shadow-xs"
                            style={{ backgroundColor: badgeColor }}
                          >
                            {badgeText}
                          </span>
                        )}
                        {badgeStyle === 'minimal' && (
                          <span
                            className="inline-flex items-center px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white rounded-xs border border-white/60 shadow-xs"
                            style={{ backgroundColor: badgeColor }}
                          >
                            {badgeText}
                          </span>
                        )}
                        {badgeStyle === 'glass' && (
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white rounded-lg backdrop-blur-md border border-white/30 shadow-xs"
                            style={{ backgroundColor: `${badgeColor}E6` }}
                          >
                            {badgeText}
                          </span>
                        )}
                        {badgeStyle === 'energetic' && (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white rounded-md shadow-xs"
                            style={{ backgroundColor: badgeColor }}
                          >
                            <span>🔥</span>
                            <span>{badgeText}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Badge Text Input */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Badge Text
                      </label>
                      <input
                        type="text"
                        value={badgeText}
                        onChange={(e) => setBadgeText(e.target.value)}
                        placeholder="e.g. Bestseller, Trending, Hot Deal"
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-gray-800 focus:outline-none focus:border-[#D26900]"
                      />
                      {/* Quick Badge Text Chips */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {PRESET_BADGES.filter(Boolean).map((badge) => (
                          <button
                            key={badge}
                            type="button"
                            onClick={() => setBadgeText(badge)}
                            className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                              badgeText === badge
                                ? 'bg-amber-100 text-[#D26900] border-amber-300 font-semibold'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {badge}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Badge 5 Designs */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Badge Design (5 Styles)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                          { id: 'ribbon', name: 'Ribbon', desc: 'Left Pinned', icon: '🔖' },
                          { id: 'pill', name: 'Pill', desc: 'Floating', icon: '💊' },
                          { id: 'minimal', name: 'Minimal', desc: 'Clean Border', icon: '🏷️' },
                          { id: 'glass', name: 'Glass', desc: 'Frosted', icon: '🪟' },
                          { id: 'energetic', name: 'Energetic', desc: 'Flame Fire', icon: '🔥' },
                        ].map((style) => {
                          const isSelected = badgeStyle === style.id;
                          return (
                            <button
                              key={style.id}
                              type="button"
                              onClick={() => setBadgeStyle(style.id as any)}
                              className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                isSelected
                                  ? 'bg-amber-50 border-[#D26900] ring-1 ring-[#D26900] shadow-xs'
                                  : 'bg-white border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs">{style.icon}</span>
                                {isSelected && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#D26900]" />
                                )}
                              </div>
                              <div>
                                <p className={`text-[11px] font-bold ${isSelected ? 'text-[#D26900]' : 'text-gray-800'}`}>
                                  {style.name}
                                </p>
                                <p className="text-[9px] text-gray-400 leading-tight">
                                  {style.desc}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Badge Color Selection (Default Website Theme #D26900) */}
                  <div className="pt-2 border-t border-orange-200/60 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Badge Color:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={badgeColor}
                          onChange={(e) => setBadgeColor(e.target.value)}
                          className="w-8 h-8 rounded-lg border border-gray-300 cursor-pointer p-0.5"
                          title="Pick custom badge color"
                        />
                        <span className="text-xs font-mono text-gray-600 uppercase font-semibold">
                          {badgeColor}
                        </span>
                      </div>
                    </div>

                    {/* Color Presets */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-500 font-medium">Presets:</span>
                      {[
                        { name: 'Website Theme', hex: '#D26900' },
                        { name: 'Deep Orange', hex: '#E65100' },
                        { name: 'Myntra Pink', hex: '#FF3F6C' },
                        { name: 'Emerald', hex: '#059669' },
                        { name: 'Cobalt', hex: '#2563EB' },
                        { name: 'Charcoal', hex: '#111827' },
                      ].map((preset) => (
                        <button
                          key={preset.hex}
                          type="button"
                          onClick={() => setBadgeColor(preset.hex)}
                          title={`${preset.name} (${preset.hex})`}
                          className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                            badgeColor.toLowerCase() === preset.hex.toLowerCase()
                              ? 'scale-115 border-gray-900 shadow-xs ring-1 ring-[#D26900]'
                              : 'border-white hover:scale-105 shadow-2xs'
                          }`}
                          style={{ backgroundColor: preset.hex }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pricing Block with MRP Crossed-Out Calculation */}
                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/70 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      💰 Pricing & Discount (Crossed-Out MRP)
                    </span>
                    <span className="text-xs bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                      {discountPercent}% OFF Saved
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        MRP Price (Original / Cross Out) (₹) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-400 text-sm">₹</span>
                        <input
                          type="number"
                          min={0}
                          value={mrp}
                          onChange={(e) => {
                            const val = e.target.value === '' ? '' : Number(e.target.value);
                            setMrp(val);
                            handlePriceChange(price, val);
                          }}
                          className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-300 text-sm font-semibold line-through text-gray-500 focus:outline-none focus:border-[#D26900]"
                          placeholder="1999"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Selling Price (Customer Pays) (₹) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-[#D26900] font-bold text-sm">₹</span>
                        <input
                          type="number"
                          min={0}
                          required
                          value={price}
                          onChange={(e) => {
                            const val = e.target.value === '' ? '' : Number(e.target.value);
                            setPrice(val);
                            handlePriceChange(val, mrp);
                          }}
                          className="w-full pl-8 pr-3 py-2 rounded-xl border border-amber-300 text-sm font-bold text-[#D26900] focus:outline-none focus:ring-2 focus:ring-[#D26900]/30"
                          placeholder="1299"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Discount % (Auto-calculated)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={discountPercent}
                          onChange={(e) => setDiscountPercent(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-bold text-green-700 focus:outline-none focus:border-[#D26900]"
                        />
                        <span className="absolute right-3 top-2 text-green-600 font-bold text-sm">%</span>
                      </div>
                    </div>
                  </div>

                  {/* Live Price Preview Badge */}
                  <div className="flex items-center gap-3 pt-2 text-sm border-t border-amber-200/50">
                    <span className="text-xs text-gray-500">Live Customer Display:</span>
                    <span className="text-xl font-black text-gray-900">₹{price || 0}</span>
                    <span className="text-sm text-gray-400 line-through">MRP: ₹{mrp || 0}</span>
                    {discountPercent > 0 && (
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                        Save ₹{Math.max(0, (Number(mrp) || 0) - (Number(price) || 0))} ({discountPercent}% OFF)
                      </span>
                    )}
                  </div>
                </div>

                {/* Rating & Reviews */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Initial Rating (0 - 5.0)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-[#D26900]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Reviews Count Display
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={reviewsCount}
                      onChange={(e) => setReviewsCount(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-[#D26900]"
                    />
                  </div>
                </div>

                {/* Status Toggles */}
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={inStock}
                      onChange={(e) => setInStock(e.target.checked)}
                      className="w-4 h-4 text-[#D26900] rounded focus:ring-[#D26900]"
                    />
                    In Stock
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 text-[#D26900] rounded focus:ring-[#D26900]"
                    />
                    Active (Visible on Website)
                  </label>
                </div>
              </div>
            )}

            {/* TAB 2: VARIANTS (COLORS & SIZES + CUSTOM SIZES) */}
            {activeTab === 'variants' && (
              <div className="space-y-6 animate-fadeIn">
                {/* COLOR PALETTE */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Color Swatches</h4>
                      <p className="text-xs text-gray-500">
                        Add available color variations with color pickers and names
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">
                      {colors.length} color(s) added
                    </span>
                  </div>

                  {/* Existing Colors */}
                  <div className="flex flex-wrap gap-2.5">
                    {colors.map((c, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-xl shadow-xs"
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-gray-300 shadow-inner flex-shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="text-xs font-semibold text-gray-800">{c.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(idx)}
                          className="text-gray-400 hover:text-red-500 ml-1 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {colors.length === 0 && (
                      <span className="text-xs text-gray-400 italic">No colors added yet</span>
                    )}
                  </div>

                  {/* Add New Color Row */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-9 h-9 p-0.5 rounded-lg border border-gray-300 cursor-pointer"
                      title="Choose Color Hex"
                    />
                    <input
                      type="text"
                      placeholder="Color Name (e.g. Pastel Rose)"
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddColor();
                        }
                      }}
                      className="flex-1 px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:border-[#D26900]"
                    />
                    <button
                      type="button"
                      onClick={handleAddColor}
                      className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-colors"
                    >
                      + Add Color
                    </button>
                  </div>
                </div>

                {/* SIZES WITH CUSTOM SIZE INPUT */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Sizes & Dimensions</h4>
                      <p className="text-xs text-gray-500">
                        Choose preset bag/plush sizes or enter any custom size (e.g. 30L, 45cm)
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">
                      {sizes.length} size(s) active
                    </span>
                  </div>

                  {/* Quick Preset Toggles */}
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1.5 uppercase">
                      Quick Preset Toggles
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_SIZES.map((sz) => {
                        const isSelected = sizes.includes(sz);
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => handleTogglePresetSize(sz)}
                            className={`text-xs px-3 py-1 rounded-lg border font-medium transition-all ${
                              isSelected
                                ? 'bg-[#D26900] text-white border-[#D26900] shadow-sm'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Size Adder */}
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1.5 uppercase">
                      Add Custom Size / Capacity
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Type any custom size (e.g. 35 Litres, 60cm Jumbo, Standard Pack)"
                        value={customSizeInput}
                        onChange={(e) => setCustomSizeInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomSize();
                          }
                        }}
                        className="flex-1 px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:border-[#D26900]"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomSize}
                        className="px-4 py-2 bg-gradient-to-r from-[#D26900] to-[#E65100] text-white text-xs font-semibold rounded-xl shadow-xs hover:opacity-95 transition-opacity"
                      >
                        + Add Custom Size
                      </button>
                    </div>
                  </div>

                  {/* Active Selected Sizes List */}
                  <div className="pt-2 border-t border-gray-200">
                    <span className="text-xs text-gray-500 font-medium block mb-2">
                      Active Sizes Displayed on Store:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((sz) => (
                        <span
                          key={sz}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold"
                        >
                          {sz}
                          <button
                            type="button"
                            onClick={() => handleRemoveSize(sz)}
                            className="text-amber-500 hover:text-red-500 text-xs ml-0.5"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                      {sizes.length === 0 && (
                        <span className="text-xs text-gray-400 italic">
                          Optional — No sizes selected (leave blank if single-size product)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PHOTOS (MULTI-UPLOAD & PRIMARY SELECTION) */}
            {activeTab === 'photos' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Product Photo Gallery</h4>
                    <p className="text-xs text-gray-500">
                      Upload multiple high-resolution photos. Pick one as the primary thumbnail.
                    </p>
                  </div>
                  <span className="text-xs bg-amber-100 text-[#D26900] font-bold px-2.5 py-1 rounded-full">
                    {images.length} Image(s)
                  </span>
                </div>

                {/* Upload Action Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* File Upload Button */}
                  <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-[#D26900]/40 hover:border-[#D26900] bg-orange-50/20 rounded-2xl cursor-pointer hover:bg-orange-50/40 transition-all text-center">
                    <span className="text-2xl mb-1">📁</span>
                    <span className="text-xs font-bold text-[#D26900]">
                      {uploadingImages ? 'Uploading photos...' : '+ Upload Multiple Photos'}
                    </span>
                    <span className="text-[11px] text-gray-400 mt-0.5">
                      JPG, PNG, WebP up to 10MB each
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploadingImages}
                      className="hidden"
                    />
                  </label>

                  {/* Add Image by Direct URL */}
                  <div className="flex flex-col justify-center p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
                    <span className="text-xs font-semibold text-gray-700">Or Paste Image URL</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="https://example.com/photo.jpg"
                        value={customImageUrl}
                        onChange={(e) => setCustomImageUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddUrlImage();
                          }
                        }}
                        className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:border-[#D26900]"
                      />
                      <button
                        type="button"
                        onClick={handleAddUrlImage}
                        className="px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-xl hover:bg-black transition-colors"
                      >
                        + Add URL
                      </button>
                    </div>
                  </div>
                </div>

                {/* Image Grid with Thumbnail Cards */}
                {images.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                    <span className="text-3xl block mb-2">📸</span>
                    <p className="text-xs font-semibold text-gray-700">No photos added yet</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Upload from your device or paste an image URL above to display product previews.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                    {images.map((img, idx) => {
                      const assignedColor = colors.find((c) => c.name === img.color_name);
                      return (
                        <div
                          key={img.id}
                          className={`relative rounded-2xl overflow-hidden border-2 bg-white flex flex-col transition-all shadow-xs ${
                            img.is_primary
                              ? 'border-[#D26900] ring-2 ring-[#D26900]/30 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {/* Image preview area (clicking sets as primary, NEVER deletes) */}
                          <div
                            onClick={() => handleSetPrimaryImage(img.id)}
                            className="relative h-44 w-full bg-gray-100 cursor-pointer overflow-hidden group/img"
                            title="Click to set as primary thumbnail"
                          >
                            <img
                              src={img.url}
                              alt={img.alt || `Photo ${idx + 1}`}
                              className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=400';
                              }}
                            />

                            {/* Primary Badge */}
                            {img.is_primary ? (
                              <div className="absolute top-2.5 left-2.5 bg-[#D26900] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                                <span>★</span>
                                <span>Primary Thumbnail</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSetPrimaryImage(img.id);
                                }}
                                className="absolute top-2.5 left-2.5 bg-black/60 hover:bg-[#D26900] text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm transition-colors opacity-90 hover:opacity-100"
                              >
                                Set as Primary
                              </button>
                            )}

                            {/* Assigned Color Badge on Image if any */}
                            {assignedColor && (
                              <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-sm border border-gray-200 flex items-center gap-1.5 text-[11px] font-bold text-gray-800">
                                <span
                                  className="w-3 h-3 rounded-full border border-gray-300 shadow-inner"
                                  style={{ backgroundColor: assignedColor.hex }}
                                />
                                <span>{assignedColor.name}</span>
                              </div>
                            )}

                            <div className="absolute bottom-2 left-2 text-[10px] text-white/90 bg-black/50 px-2 py-0.5 rounded backdrop-blur-xs">
                              Click photo to set Primary
                            </div>
                          </div>

                          {/* Image Card Bottom Controls */}
                          <div className="p-3 bg-gray-50/80 border-t border-gray-100 space-y-2.5">
                            {/* Color Selector Dropdown */}
                            <div>
                              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-[#D26900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4 4 4 0 014-4h4a4 4 0 014 4 4 4 0 01-4 4H7zm0 0a4 4 0 01-4-4 4 4 0 014-4m14-8a4 4 0 11-8 0 4 4 0 018 0zm-8 4v8" />
                                </svg>
                                <span>Show for Color:</span>
                              </label>
                              <AdminCustomSelect
                                value={img.color_name || ''}
                                onChange={(val) => handleSetImageColor(img.id, val)}
                                options={[
                                  { value: '', label: '-- All Colors (Default) --', icon: '🌈' },
                                  ...colors.map((c) => ({
                                    value: c.name,
                                    label: `${c.name} (${c.hex})`,
                                    icon: (
                                      <span
                                        className="w-3 h-3 rounded-full border border-gray-300 inline-block shrink-0 shadow-2xs"
                                        style={{ backgroundColor: c.hex }}
                                      />
                                    ),
                                  })),
                                ]}
                                placeholder="-- All Colors (Default) --"
                                size="sm"
                                className="w-full"
                              />
                              {colors.length === 0 && (
                                <p className="text-[10px] text-amber-700 mt-1">
                                  💡 Tip: Add colors in "Colors & Sizes" tab to link photos to colors.
                                </p>
                              )}
                            </div>

                            {/* Dedicated Delete Button */}
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[11px] text-gray-400 font-mono">
                                Image #{idx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveImage(img.id);
                                }}
                                className="px-3 py-1.5 text-xs font-bold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 rounded-lg border border-red-200 hover:border-red-600 transition-colors flex items-center gap-1 cursor-pointer"
                                title="Delete this image from product"
                              >
                                <span>🗑️</span>
                                <span>Delete Photo</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: DETAILS & SPECIFICATIONS */}
            {activeTab === 'details' && (
              <div className="space-y-5 animate-fadeIn">
                {/* Full Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Product Full Description
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter thorough overview of the product, design philosophy, feel and comfort..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#D26900]"
                  />
                </div>

                {/* "Why You'll Love It" Bullet Points */}
                <div className="p-4 bg-orange-50/30 rounded-2xl border border-orange-200/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">
                        ✨ "Why You'll Love It" Highlights
                      </h4>
                      <p className="text-xs text-gray-500">
                        Bullet points prominently highlighted on customer product details page
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">{whyLoveIt.length} points</span>
                  </div>

                  <div className="space-y-1.5">
                    {whyLoveIt.map((pt, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs text-gray-800"
                      >
                        <span className="text-[#D26900] font-bold">✓</span>
                        <span className="flex-1">{pt}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveWhyPoint(idx)}
                          className="text-gray-400 hover:text-red-500 text-xs px-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {whyLoveIt.length === 0 && (
                      <div className="p-3.5 text-center text-xs text-gray-400 bg-white rounded-xl border border-dashed border-orange-200">
                        No highlights added yet. Type a bullet point below and click "+ Add Point".
                      </div>
                    )}
                  </div>

                  {/* Add Point Row */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Add highlight (e.g. Ergonomic padded straps, Korean plush velvet)"
                      value={newWhyPoint}
                      onChange={(e) => setNewWhyPoint(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddWhyPoint();
                        }
                      }}
                      className="flex-1 px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:border-[#D26900]"
                    />
                    <button
                      type="button"
                      onClick={handleAddWhyPoint}
                      className="px-4 py-2 bg-[#D26900] text-white text-xs font-semibold rounded-xl hover:bg-[#B45309]"
                    >
                      + Add Point
                    </button>
                  </div>
                </div>

                {/* Dynamic Technical Specifications */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                        <span>📋</span>
                        Technical Specifications (Dynamic Key - Value)
                      </h4>
                      <p className="text-xs text-gray-500">
                        Add, remove, or customize any product specification attributes
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddSpecification('', '')}
                      className="px-3.5 py-1.5 bg-[#D26900] hover:bg-[#B45309] text-white text-xs font-bold rounded-xl shadow-xs transition-all self-start sm:self-auto flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>+</span>
                      Add Custom Spec Field
                    </button>
                  </div>

                  {/* Quick Preset Attribute Chips */}
                  <div className="pt-1">
                    <span className="text-[11px] font-semibold text-gray-600 uppercase block mb-1.5">
                      Quick Preset Suggestions:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_SPEC_KEYS.map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => handleAddSpecification(k, '')}
                          className="text-[11px] px-2.5 py-1 bg-white hover:bg-amber-50 hover:text-[#D26900] hover:border-amber-300 text-gray-700 border border-gray-200 rounded-lg transition-colors font-medium shadow-2xs cursor-pointer"
                        >
                          + {k}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Specifications Rows */}
                  <div className="space-y-2.5 pt-2">
                    {specifications.map((spec, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 bg-white rounded-xl border border-gray-200 shadow-2xs group"
                      >
                        <span className="w-5 text-center text-xs font-mono font-bold text-gray-400 self-center hidden sm:block">
                          {idx + 1}
                        </span>

                        {/* Spec Key */}
                        <div className="flex-1 sm:max-w-[40%]">
                          <label className="text-[10px] font-bold text-gray-500 uppercase sm:hidden block mb-0.5">
                            Specification Name / Key
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Material & Fabric, Dimensions, Capacity"
                            value={spec.key}
                            onChange={(e) => handleUpdateSpecification(idx, 'key', e.target.value)}
                            className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:border-[#D26900]"
                          />
                        </div>

                        {/* Spec Value */}
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase sm:hidden block mb-0.5">
                            Specification Value
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 100% Premium Korean Velvet Plush, 35cm x 28cm x 14cm"
                            value={spec.value}
                            onChange={(e) => handleUpdateSpecification(idx, 'value', e.target.value)}
                            className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 text-gray-800 focus:outline-none focus:border-[#D26900]"
                          />
                        </div>

                        {/* Delete Row Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecification(idx)}
                          className="px-2.5 py-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors self-end sm:self-auto cursor-pointer"
                          title="Remove specification"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {specifications.length === 0 && (
                      <div className="p-6 text-center text-xs text-gray-400 border border-dashed border-gray-300 rounded-xl bg-white">
                        No specifications added. Click the preset buttons above or "+ Add Custom Spec Field".
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: NAVIGATION MENU LINK (NO DELIVERY) */}
            {activeTab === 'nav_link' && (
              <div className="space-y-6 animate-fadeIn">
                {/* HEADER & DROPDOWN MENU REDIRECT DESTINATION */}
                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
                      🔗 Header & Dropdown Category Destination
                    </h4>
                    <p className="text-xs text-amber-800/80 mt-0.5">
                      Link this product to your main website navigation headers & sub-dropdown
                      categories.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-[#D26900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <span>Select Main Header Category</span>
                      </label>
                      <AdminCustomSelect
                        value={targetHeaderId}
                        onChange={(val) => {
                          setTargetHeaderId(val);
                          setTargetDropdownId(''); // Reset sub-dropdown when header changes
                        }}
                        options={[
                          { value: '', label: '-- No specific header item --', icon: '✕' },
                          ...adminItems.map((h) => ({
                            value: h.id,
                            label: h.title,
                            subtitle: h.path,
                            icon: '📁',
                          })),
                        ]}
                        placeholder="-- No specific header item --"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-[#D26900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span>Select Dropdown Sub-Item</span>
                      </label>
                      <AdminCustomSelect
                        value={targetDropdownId}
                        onChange={(val) => setTargetDropdownId(val)}
                        disabled={!targetHeaderId || dropdownOptions.length === 0}
                        options={[
                          {
                            value: '',
                            label: targetHeaderId
                              ? dropdownOptions.length > 0
                                ? '-- Select Dropdown Sub-Category --'
                                : '-- No sub-items in this header --'
                              : '-- First select Header Category --',
                            icon: '↳',
                          },
                          ...dropdownOptions.map((sub) => ({
                            value: sub.id,
                            label: sub.title,
                            subtitle: sub.path,
                            icon: '🏷️',
                          })),
                        ]}
                        placeholder={
                          targetHeaderId
                            ? dropdownOptions.length > 0
                              ? '-- Select Dropdown Sub-Category --'
                              : '-- No sub-items in this header --'
                            : '-- First select Header Category --'
                        }
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Hierarchical Clean URL Preview */}
                  <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs text-gray-700">
                    <span className="font-semibold text-amber-900 block mb-1">
                      Hierarchical URL Routing Structure (Clean, No Random ID):
                    </span>
                    <code className="text-xs text-[#D26900] font-mono font-semibold bg-amber-50 px-2.5 py-1 rounded-lg inline-block">
                      /{selectedHeader?.title ? selectedHeader.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : ':header'}
                      /
                      {selectedDropdown?.title
                        ? selectedDropdown.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                        : ':subCategory'}
                      /{title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'product-name'}
                    </code>
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Sticky Modal Footer */}
          <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#D26900] to-[#E65100] hover:from-[#B45309] hover:to-[#D26900] rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {productToEdit ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
