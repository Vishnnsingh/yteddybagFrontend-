import { useState, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../redux/store';
import {
  fetchAdminProducts,
  deleteProduct,
  toggleProductStatus,
} from '../../redux/slices/productSlice';
import type { ProductItem } from '../../redux/slices/productSlice';
import ProductModal from '../Components/ProductModal';
import AdminConfirmModal from '../Components/AdminConfirmModal';
import AdminCustomSelect from '../Components/AdminCustomSelect';
import { queryClient } from '../../lib/queryClient';
import { useHeaderNavigation } from '../../Context/HeaderNavigationContext';

export default function ManageProducts() {
  const dispatch = useDispatch<AppDispatch>();
  const { adminProducts, adminLoading } = useSelector((state: RootState) => state.products);
  const { adminItems } = useHeaderNavigation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHeaderFilter, setSelectedHeaderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Pagination state (10 items per page as requested)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 3-Dots Action Dropdown Menu state
  const [openActionDropdownId, setOpenActionDropdownId] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement | null>(null);

  // Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<ProductItem | null>(null);

  // Delete State
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    product: ProductItem | null;
  }>({
    isOpen: false,
    product: null,
  });

  useEffect(() => {
    dispatch(fetchAdminProducts());
  }, [dispatch]);

  // Close 3-dots action menu when clicking outside
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(e.target as Node)
      ) {
        setOpenActionDropdownId(null);
      }
    };
    if (openActionDropdownId) {
      document.addEventListener('mousedown', handleDocumentClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, [openActionDropdownId]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
    setOpenActionDropdownId(null);
  }, [searchTerm, selectedHeaderFilter, statusFilter]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return adminProducts.filter((prod) => {
      // Search
      const matchesSearch =
        !searchTerm.trim() ||
        prod.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prod.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prod.subtitle?.toLowerCase().includes(searchTerm.toLowerCase());

      // Header filter
      const matchesHeader =
        !selectedHeaderFilter || prod.target_header_id === selectedHeaderFilter;

      // Status filter
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && prod.is_active) ||
        (statusFilter === 'inactive' && !prod.is_active);

      return matchesSearch && matchesHeader && matchesStatus;
    });
  }, [adminProducts, searchTerm, selectedHeaderFilter, statusFilter]);

  // Pagination Calculations (10 per page)
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, startIndex, itemsPerPage]);

  // Statistics
  const totalCount = adminProducts.length;
  const activeCount = adminProducts.filter((p) => p.is_active).length;
  const inStockCount = adminProducts.filter((p) => p.in_stock && p.stock_quantity > 0).length;

  const handleOpenAddModal = () => {
    setProductToEdit(null);
    setIsProductModalOpen(true);
    setOpenActionDropdownId(null);
  };

  const handleOpenEditModal = (product: ProductItem) => {
    setProductToEdit(product);
    setIsProductModalOpen(true);
    setOpenActionDropdownId(null);
  };

  const handleToggleActive = async (id: string, currentTitle: string) => {
    try {
      await dispatch(toggleProductStatus(id)).unwrap();
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(`Updated status for "${currentTitle}"`);
    } catch (err: any) {
      toast.error(err || 'Failed to update status');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalState.product) return;
    try {
      await dispatch(deleteProduct(deleteModalState.product.id)).unwrap();
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(`Product "${deleteModalState.product.title}" deleted`);
      setDeleteModalState({ isOpen: false, product: null });
      setOpenActionDropdownId(null);
    } catch (err: any) {
      toast.error(err || 'Failed to delete product');
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-gray-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-gradient-to-br from-[#D26900] to-[#E65100] text-white rounded-xl shadow-xs text-sm">
              🧸
            </span>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Products Management</h1>
          </div>
          <p className="text-xs text-gray-500">
            Create, edit, cross-out MRP pricing, manage color swatches, sizes, dynamic specifications, and menu routes
          </p>
        </div>

        {/* Primary CTA + Add Product Button */}
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D26900] to-[#E65100] hover:from-[#B45309] hover:to-[#D26900] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 text-sm cursor-pointer"
        >
          <span className="text-lg leading-none">+</span>
          Add Product
        </button>
      </div>

      {/* KPI Stats Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 uppercase">Total Catalog</span>
          <div className="text-2xl font-black text-gray-900 mt-1">{totalCount}</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600 uppercase">Active on Store</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{activeCount}</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-semibold text-[#D26900] uppercase">In Stock Ready</span>
          <div className="text-2xl font-black text-[#D26900] mt-1">{inStockCount}</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-semibold text-blue-600 uppercase">Navigation Links</span>
          <div className="text-2xl font-black text-blue-600 mt-1">{adminItems.length} Menus</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex flex-1 items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search products by title, SKU, or tagline..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-[#D26900]"
            />
          </div>

          {/* Header Category Filter */}
          <AdminCustomSelect
            value={selectedHeaderFilter}
            onChange={(val) => setSelectedHeaderFilter(val)}
            options={[
              { value: '', label: 'All Categories', icon: '🏷️' },
              ...adminItems.map((h) => ({
                value: h.id,
                label: h.title,
                subtitle: h.path,
                icon: '📁',
              })),
            ]}
            placeholder="All Categories"
            className="min-w-[150px] sm:min-w-[170px]"
          />

          {/* Status Filter */}
          <AdminCustomSelect
            value={statusFilter}
            onChange={(val) => setStatusFilter(val as any)}
            options={[
              { value: 'all', label: 'All Status', icon: '📋' },
              { value: 'active', label: 'Active Only', icon: '🟢' },
              { value: 'inactive', label: 'Inactive Only', icon: '⚪' },
            ]}
            placeholder="All Status"
            className="min-w-[130px] sm:min-w-[145px]"
          />
        </div>

        <span className="text-xs text-gray-500 font-mono self-center">
          {totalCount > 0 ? `Showing ${startIndex + 1}-${endIndex} of ${totalCount} items` : '0 items'}
        </span>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-visible">
        {adminLoading && adminProducts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="w-8 h-8 border-3 border-[#D26900] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium">Checking products catalog in database...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-3">
            <span className="text-5xl">🛍️</span>
            <h3 className="text-base font-bold text-gray-800">
              {totalCount === 0 ? 'No Products in Database' : 'No products match your search/filter'}
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {totalCount === 0
                ? 'Your database table is currently empty. Click the "+ Add Product" button above to add your first product.'
                : 'Try adjusting your search terms or filters to see other products.'}
            </p>
            <button
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 bg-gradient-to-r from-[#D26900] to-[#E65100] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              + Add First Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  <th className="py-3 px-4">Product Info</th>
                  <th className="py-3 px-4">Price & MRP</th>
                  <th className="py-3 px-4">Colors & Sizes</th>
                  <th className="py-3 px-4">Menu Destination</th>
                  <th className="py-3 px-4">Stock & Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {paginatedProducts.map((prod) => {
                  const primaryImg =
                    prod.primary_image ||
                    prod.images?.find((i) => i.is_primary)?.url ||
                    prod.images?.[0]?.url ||
                    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=300';

                  // Generate custom URL for preview
                  const headerSlug = prod.header_title
                    ? prod.header_title.toLowerCase().replace(/\s+/g, '-')
                    : 'category';
                  const dropdownSlug = prod.dropdown_title
                    ? prod.dropdown_title.toLowerCase().replace(/\s+/g, '-')
                    : 'all';
                  const liveProductUrl = `/${headerSlug}/${dropdownSlug}/product/${prod.id}`;

                  const isMenuOpen = openActionDropdownId === prod.id;

                  return (
                    <tr
                      key={prod.id}
                      className="hover:bg-amber-50/20 transition-colors group"
                    >
                      {/* Product Thumbnail + Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={primaryImg}
                            alt={prod.title}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-200 bg-gray-50 flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=200';
                            }}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900 truncate max-w-xs block">
                                {prod.title}
                              </span>
                              {prod.badge_text && (
                                <span className="text-[10px] bg-amber-100 text-[#D26900] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                                  {prod.badge_text}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                              SKU: {prod.sku || 'N/A'} • ★ {prod.rating} ({prod.reviews_count})
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Pricing with crossed-out MRP */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-black text-gray-900 text-sm">₹{prod.price}</div>
                        <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                          <span className="text-gray-400 line-through">₹{prod.mrp}</span>
                          {prod.discount_percent > 0 && (
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                              {prod.discount_percent}% OFF
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Colors & Sizes Preview */}
                      <td className="py-3.5 px-4">
                        {/* Color Dots */}
                        <div className="flex items-center gap-1 mb-1">
                          {prod.colors?.slice(0, 4).map((c, i) => (
                            <span
                              key={i}
                              title={c.name}
                              className="w-3.5 h-3.5 rounded-full border border-gray-300 shadow-2xs"
                              style={{ backgroundColor: c.hex }}
                            />
                          ))}
                          {prod.colors?.length > 4 && (
                            <span className="text-[10px] text-gray-400">
                              +{prod.colors.length - 4}
                            </span>
                          )}
                        </div>
                        {/* Sizes */}
                        <div className="text-[11px] text-gray-600 truncate max-w-[150px]">
                          {prod.sizes?.join(', ') || 'No sizes'}
                        </div>
                      </td>

                      {/* Header & Dropdown Link */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {prod.header_title ? (
                          <div className="space-y-0.5">
                            <span className="inline-block text-[11px] font-semibold bg-gray-100 text-gray-800 px-2 py-0.5 rounded-md">
                              {prod.header_title}
                            </span>
                            {prod.dropdown_title && (
                              <div className="text-[10px] text-gray-500">
                                ↳ {prod.dropdown_title}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Stock & Active Switch */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(prod.id, prod.title)}
                            className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                              prod.is_active ? 'bg-emerald-500' : 'bg-gray-300'
                            }`}
                            title={prod.is_active ? 'Active (click to deactivate)' : 'Inactive'}
                          >
                            <span
                              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                                prod.is_active ? 'left-4.5' : 'left-0.5'
                              }`}
                            />
                          </button>
                          <span
                            className={`text-[11px] font-semibold ${
                              prod.is_active ? 'text-emerald-700' : 'text-gray-400'
                            }`}
                          >
                            {prod.is_active ? 'Active' : 'Hidden'}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1">
                          Stock: {prod.stock_quantity} units
                        </div>
                      </td>

                      {/* ACTIONS: 3-DOTS MENU AS REQUESTED */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap relative">
                        <div className="inline-block text-left">
                          {/* 3-Dots Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionDropdownId(isMenuOpen ? null : prod.id);
                            }}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                              isMenuOpen
                                ? 'bg-amber-100 text-[#D26900]'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                            title="Actions menu"
                            aria-label="Actions"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>

                          {/* 3-Dots Dropdown Popover */}
                          {isMenuOpen && (
                            <div
                              ref={actionMenuRef}
                              className="absolute right-4 mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-50 text-left animate-fadeIn"
                            >
                              {/* Option 1: View Live Page */}
                              <Link
                                to={liveProductUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setOpenActionDropdownId(null)}
                                className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-gray-700 hover:bg-amber-50 hover:text-[#D26900] transition-colors"
                              >
                                <span>👁️</span>
                                <span>View Live Page</span>
                              </Link>

                              {/* Option 2: Edit Product */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(prod)}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-gray-700 hover:bg-amber-50 hover:text-[#D26900] transition-colors text-left cursor-pointer"
                              >
                                <span>✏️</span>
                                <span>Edit Product</span>
                              </button>

                              <div className="my-1 border-t border-gray-100" />

                              {/* Option 3: Delete Product */}
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenActionDropdownId(null);
                                  setDeleteModalState({ isOpen: true, product: prod });
                                }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                              >
                                <span>🗑️</span>
                                <span>Delete Product</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION CONTROLS (10 items per page as requested) */}
        {totalItems > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/70 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-gray-600">
              Showing <span className="font-bold text-gray-900">{startIndex + 1}</span> to{' '}
              <span className="font-bold text-gray-900">{endIndex}</span> of{' '}
              <span className="font-bold text-gray-900">{totalItems}</span> products (10 per page)
            </span>

            {/* Page Buttons */}
            <div className="flex items-center gap-1.5">
              {/* Prev Button */}
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                ← Prev
              </button>

              {/* Number Buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    currentPage === pageNum
                      ? 'bg-gradient-to-r from-[#D26900] to-[#E65100] text-white shadow-xs'
                      : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              {/* Next Button */}
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Center Modal (Popup) */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        productToEdit={productToEdit}
        onSuccess={() => {
          dispatch(fetchAdminProducts());
        }}
      />

      {/* Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={deleteModalState.isOpen}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteModalState.product?.title}"? This cannot be undone.`}
        confirmText="Yes, Delete Product"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModalState({ isOpen: false, product: null })}
      />
    </div>
  );
}
