import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  useAdminOrdersQuery,
  useAdminUpdateOrderStatusMutation,
  useAdminDeleteOrderMutation,
  useAdminCreateDelhiveryShipmentMutation,
  useAdminCancelDelhiveryShipmentMutation,
  useDelhiveryTrackingQuery,
  type OrderRecord,
  type EcommerceOrderStatus,
  type EcommercePaymentStatus,
} from '../../hooks/useOrdersQuery';
import { adminApiClient } from '../../Utils/apiClient';
import AdminConfirmModal from '../Components/AdminConfirmModal';

const ORDER_STAGES: Array<{ id: EcommerceOrderStatus; label: string; color: string; bg: string }> = [
  { id: 'Placed', label: 'Placed', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  { id: 'Confirmed', label: 'Confirmed', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
  { id: 'Packed', label: 'Packing', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  { id: 'Shipped', label: 'Shipped', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  { id: 'Out for Delivery', label: 'Out for Delivery', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  { id: 'Delivered', label: 'Delivered', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  { id: 'Cancelled', label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
];

export default function ManageOrders() {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeStatusTab, setActiveStatusTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeDropdownOrderId, setActiveDropdownOrderId] = useState<string | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClose = () => setActiveDropdownOrderId(null);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);

  // Debounce search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setCurrentPage(1);
    setDebouncedSearch(val);
  };

  // TanStack Query for Admin Orders (Exactly 10 items per page)
  const { data, isLoading, isError, refetch } = useAdminOrdersQuery({
    page: currentPage,
    limit: 10,
    status: activeStatusTab,
    search: debouncedSearch,
  });

  const updateStatusMutation = useAdminUpdateOrderStatusMutation();
  const deleteOrderMutation = useAdminDeleteOrderMutation();

  const orders = data?.orders || [];
  const pagination = data?.pagination || { totalCount: 0, totalPages: 1, currentPage: 1, limit: 10 };
  const statusCounts = data?.statusCounts || {
    total: 0,
    placed: 0,
    confirmed: 0,
    packed: 0,
    shipped: 0,
    outForDelivery: 0,
    delivered: 0,
    cancelled: 0,
  };

  // Modal State for Viewing / Editing Full Order Details
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [modalStatus, setModalStatus] = useState<EcommerceOrderStatus>('Placed');
  const [modalPaymentStatus, setModalPaymentStatus] = useState<EcommercePaymentStatus>('Pending');
  const [modalTracking, setModalTracking] = useState('');
  const [modalCourier, setModalCourier] = useState('');
  const [modalNotes, setModalNotes] = useState('');

  // Delhivery Logistics Mutations & Tracking State
  const createDelhiveryShipmentMutation = useAdminCreateDelhiveryShipmentMutation();
  const cancelDelhiveryShipmentMutation = useAdminCancelDelhiveryShipmentMutation();
  const [trackingModalWaybill, setTrackingModalWaybill] = useState<{
    waybill: string;
    orderNumber: string;
  } | null>(null);

  // Delete Confirmation Modal State
  const [orderToDelete, setOrderToDelete] = useState<OrderRecord | null>(null);

  const handleOpenDetails = (order: OrderRecord) => {
    setSelectedOrder(order);
    setModalStatus(order.orderStatus);
    setModalPaymentStatus(order.paymentStatus);
    setModalTracking(order.trackingNumber || '');
    setModalCourier(order.courierPartner || '');
    setModalNotes(order.notes || '');
  };

  const handleSaveModalUpdates = async () => {
    if (!selectedOrder) return;
    try {
      await updateStatusMutation.mutateAsync({
        id: selectedOrder.id,
        orderStatus: modalStatus,
        paymentStatus: modalPaymentStatus,
        trackingNumber: modalTracking,
        courierPartner: modalCourier,
        notes: modalNotes,
      });
      toast.success(`Order ${selectedOrder.orderNumber} updated to ${modalStatus}!`);
      setSelectedOrder(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update order');
    }
  };

  const handleQuickStatusChange = async (orderId: string, newStatus: EcommerceOrderStatus) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: orderId,
        orderStatus: newStatus,
      });
      toast.success(`Status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;
    try {
      await deleteOrderMutation.mutateAsync(orderToDelete.id);
      toast.success(`Order ${orderToDelete.orderNumber} deleted successfully`);
      setOrderToDelete(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete order');
    }
  };

  // Delhivery: 1-Click Manifest Shipment
  const handleManifestWithDelhivery = async () => {
    if (!selectedOrder) return;
    try {
      toast.loading('Manifesting package with Delhivery B2C Logistics...', { id: 'delhivery-manifest' });
      const result = await createDelhiveryShipmentMutation.mutateAsync({
        orderId: selectedOrder.id,
        weightGrams: 500, // Standard plush teddy bag weight
      });
      toast.dismiss('delhivery-manifest');
      toast.success(`Delhivery shipment manifested! AWB #${result.shipment.waybill}`);
      setSelectedOrder(result.order);
      setModalStatus('Packed');
      setModalTracking(result.shipment.waybill);
      setModalCourier(result.shipment.courierPartner);
    } catch (err: any) {
      toast.dismiss('delhivery-manifest');
      toast.error(err.response?.data?.message || 'Failed to manifest Delhivery shipment');
    }
  };

  // Delhivery: Print Packing Slip / Shipping Label
  const handlePrintShippingLabel = async (orderId: string) => {
    try {
      toast.loading('Fetching Delhivery shipping label...', { id: 'label-gen' });
      const res = await adminApiClient.get(`/orders/admin/${orderId}/shipping-label`);
      toast.dismiss('label-gen');
      if (res.data?.data?.labelUrl) {
        window.open(res.data.data.labelUrl, '_blank');
      } else {
        toast.error('Shipping label URL not available');
      }
    } catch (err: any) {
      toast.dismiss('label-gen');
      toast.error(err.response?.data?.message || 'Failed to generate shipping label');
    }
  };

  // Delhivery: Cancel Shipment
  const handleCancelDelhiveryShipment = async () => {
    if (!selectedOrder) return;
    try {
      toast.loading('Cancelling Delhivery shipment...', { id: 'delhivery-cancel' });
      const res = await cancelDelhiveryShipmentMutation.mutateAsync(selectedOrder.id);
      toast.dismiss('delhivery-cancel');
      toast.success(res.cancelResult?.message || 'Shipment cancelled');
      setSelectedOrder(res.order);
      setModalStatus('Cancelled');
    } catch (err: any) {
      toast.dismiss('delhivery-cancel');
      toast.error(err.response?.data?.message || 'Failed to cancel shipment');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Order Management</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Realtime customer orders, stage tracking (Packing, Shipped, Out for Delivery), and CRUD operations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 text-xs font-bold rounded-lg shadow-2xs transition-colors self-start cursor-pointer"
        >
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {[
          { label: 'All Orders', count: statusCounts.total, bg: 'bg-white', text: 'text-gray-900', border: 'border-gray-200' },
          { label: 'Placed / New', count: statusCounts.placed + statusCounts.confirmed, bg: 'bg-blue-50/50', text: 'text-blue-700', border: 'border-blue-200' },
          { label: 'Packing', count: statusCounts.packed, bg: 'bg-amber-50/50', text: 'text-amber-700', border: 'border-amber-200' },
          { label: 'In Transit', count: statusCounts.shipped + statusCounts.outForDelivery, bg: 'bg-purple-50/50', text: 'text-purple-700', border: 'border-purple-200' },
          { label: 'Delivered', count: statusCounts.delivered, bg: 'bg-emerald-50/50', text: 'text-emerald-700', border: 'border-emerald-200' },
          { label: 'Cancelled', count: statusCounts.cancelled, bg: 'bg-red-50/50', text: 'text-red-700', border: 'border-red-200' },
        ].map((m, idx) => (
          <div key={idx} className={`p-3.5 rounded-xl border ${m.border} ${m.bg} shadow-2xs space-y-1`}>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              {m.label}
            </span>
            <span className={`text-xl font-black ${m.text}`}>{m.count}</span>
          </div>
        ))}
      </div>

      {/* 3. Search and Status Tabs Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by Order ID, Name, Phone..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-hidden focus:border-[#D26900] focus:ring-1 focus:ring-[#D26900]"
            />
          </div>

          <div className="text-xs text-gray-500 font-medium">
            Showing <span className="font-bold text-gray-900">{orders.length}</span> of{' '}
            <span className="font-bold text-gray-900">{pagination.totalCount}</span> orders
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none">
          {[
            { id: 'All', label: 'All Orders', count: statusCounts.total },
            { id: 'Placed', label: 'Placed', count: statusCounts.placed },
            { id: 'Confirmed', label: 'Confirmed', count: statusCounts.confirmed },
            { id: 'Packed', label: 'Packing', count: statusCounts.packed },
            { id: 'Shipped', label: 'Shipped', count: statusCounts.shipped },
            { id: 'Out for Delivery', label: 'Out for Delivery', count: statusCounts.outForDelivery },
            { id: 'Delivered', label: 'Delivered', count: statusCounts.delivered },
            { id: 'Cancelled', label: 'Cancelled', count: statusCounts.cancelled },
          ].map((tab) => {
            const isActive = activeStatusTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveStatusTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#D26900] text-white shadow-2xs font-bold'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Orders Table (10 Orders per page) */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#D26900] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-gray-500">Loading orders from database...</p>
          </div>
        ) : isError ? (
          <div className="py-16 text-center space-y-3">
            <p className="text-sm font-bold text-red-600">Failed to load orders</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-2xl text-gray-400">
              📦
            </div>
            <h3 className="text-base font-bold text-gray-900">No orders found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {searchQuery || activeStatusTab !== 'All'
                ? 'Try adjusting your search query or status filter.'
                : 'Customer orders will appear here automatically when placed.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Items Ordered</th>
                  <th className="py-3 px-4">Payment & Total</th>
                  <th className="py-3 px-4">Delivery Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {orders.map((order) => {
                  const stageObj =
                    ORDER_STAGES.find((s) => s.id === order.orderStatus) || ORDER_STAGES[0];

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Order Number & Date */}
                      <td className="py-3.5 px-4 font-medium align-top">
                        <span className="font-mono font-bold text-[#282C3F] block">
                          {order.orderNumber}
                        </span>
                        <span className="text-[11px] text-gray-400 block mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {order.delhiveryWaybill && (
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                              <span>🚚</span>
                              <span>{order.delhiveryWaybill}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setTrackingModalWaybill({
                                  waybill: order.delhiveryWaybill!,
                                  orderNumber: order.orderNumber,
                                })
                              }
                              className="text-[10px] text-[#D26900] hover:text-[#B85800] hover:underline font-bold cursor-pointer"
                            >
                              Track
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Customer Details */}
                      <td className="py-3.5 px-4 align-top">
                        <span className="font-bold text-gray-900 block">{order.customerName}</span>
                        <span className="text-[11px] text-gray-600 block">📞 {order.customerPhone}</span>
                        <span className="text-[11px] text-gray-500 block truncate max-w-[180px]">
                          📍 {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                        </span>
                      </td>

                      {/* Items Preview */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1.5">
                          {order.items.slice(0, 2).map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                              {item.primaryImage ? (
                                <img
                                  src={item.primaryImage}
                                  alt={item.title}
                                  className="w-7 h-7 rounded-xs object-cover border border-gray-200 shrink-0"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-xs bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px]">
                                  🧸
                                </div>
                              )}
                              <div className="min-w-0">
                                <span className="text-[11px] font-semibold text-gray-800 line-clamp-1">
                                  {item.title}
                                </span>
                                <span className="text-[10px] text-gray-500">
                                  Qty: {item.quantity} • ₹{item.price}
                                </span>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <span className="text-[10px] font-bold text-[#D26900] block">
                              +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Payment & Total Amount */}
                      <td className="py-3.5 px-4 align-top">
                        <span className="text-sm font-black text-gray-900 block">
                          ₹{order.totalAmount.toLocaleString('en-IN')}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-2xs bg-gray-100 text-gray-700 uppercase">
                            {order.paymentMethod}
                          </span>
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-2xs ${
                              order.paymentStatus === 'Paid'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </div>
                      </td>

                      {/* Delivery Status Column (Allows Admin to update delivery status) */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1">
                          <select
                            value={order.orderStatus}
                            onChange={(e) =>
                              handleQuickStatusChange(order.id, e.target.value as EcommerceOrderStatus)
                            }
                            className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border cursor-pointer focus:outline-hidden transition-all shadow-2xs ${stageObj.bg} ${stageObj.color}`}
                          >
                            {ORDER_STAGES.map((st) => (
                              <option key={st.id} value={st.id} className="text-gray-900 bg-white font-medium">
                                {st.label}
                              </option>
                            ))}
                          </select>
                          {order.trackingNumber && (
                            <span className="text-[10px] text-gray-500 block font-mono">
                              Track: {order.trackingNumber}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions: Three-Dot Dropdown Menu (Matches user requirement) */}
                      <td className="py-3.5 px-4 align-top text-right relative">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdownOrderId(activeDropdownOrderId === order.id ? null : order.id);
                            }}
                            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                            title="Order Actions"
                          >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                              <circle cx="12" cy="5" r="1.75" />
                              <circle cx="12" cy="12" r="1.75" />
                              <circle cx="12" cy="19" r="1.75" />
                            </svg>
                          </button>

                          {/* Dropdown Menu */}
                          {activeDropdownOrderId === order.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-40 text-left divide-y divide-gray-100 animate-in fade-in zoom-in-95 duration-100"
                            >
                              {/* Section 1: Change Delivery Status */}
                              <div className="px-3 py-1.5">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                  Change Delivery Status
                                </span>
                                <div className="space-y-0.5">
                                  {[
                                    { id: 'Packed', label: 'Packing', icon: '📦', color: 'text-amber-700 hover:bg-amber-50' },
                                    { id: 'Shipped', label: 'Shipped', icon: '🚚', color: 'text-purple-700 hover:bg-purple-50' },
                                    { id: 'Out for Delivery', label: 'Out for Delivery', icon: '🛵', color: 'text-orange-700 hover:bg-orange-50' },
                                    { id: 'Delivered', label: 'Delivered', icon: '🏠', color: 'text-emerald-700 hover:bg-emerald-50' },
                                    { id: 'Cancelled', label: 'Cancelled', icon: '❌', color: 'text-red-700 hover:bg-red-50' },
                                  ].map((st) => (
                                    <button
                                      key={st.id}
                                      type="button"
                                      onClick={() => {
                                        handleQuickStatusChange(order.id, st.id as EcommerceOrderStatus);
                                        setActiveDropdownOrderId(null);
                                      }}
                                      className={`w-full text-left px-2 py-1.5 text-xs font-semibold rounded-md flex items-center justify-between transition-colors cursor-pointer ${st.color} ${
                                        order.orderStatus === st.id ? 'bg-gray-100 font-bold' : ''
                                      }`}
                                    >
                                      <span className="flex items-center gap-2">
                                        <span>{st.icon}</span>
                                        <span>{st.label}</span>
                                      </span>
                                      {order.orderStatus === st.id && (
                                        <span className="text-[10px] text-emerald-600 font-bold">✓</span>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Section 2: Order Management Actions */}
                              <div className="py-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveDropdownOrderId(null);
                                    handleOpenDetails(order);
                                  }}
                                  className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors cursor-pointer"
                                >
                                  <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  <span>View / Edit Details</span>
                                </button>

                                {order.delhiveryWaybill && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveDropdownOrderId(null);
                                      handlePrintShippingLabel(order.id);
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-50 flex items-center gap-2 transition-colors cursor-pointer"
                                  >
                                    <span>🏷️</span>
                                    <span>Print Shipping Label</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveDropdownOrderId(null);
                                    setOrderToDelete(order);
                                  }}
                                  className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                                >
                                  <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  <span>Delete Order</span>
                                </button>
                              </div>
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

        {/* 5. Pagination Bar (10 Orders per page) */}
        {!isLoading && orders.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-[#F9FAFB] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-gray-500">
              Page <span className="font-bold text-gray-900">{pagination.currentPage}</span> of{' '}
              <span className="font-bold text-gray-900">{pagination.totalPages}</span> (10 orders per page)
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-gray-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Previous
              </button>

              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-md font-bold transition-colors cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-[#D26900] text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={currentPage >= pagination.totalPages}
                className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-gray-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. Comprehensive Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div>
                  <span className="text-xs font-bold text-[#D26900] uppercase tracking-wider block">
                    Order Details
                  </span>
                  <h2 className="text-lg font-black text-gray-900 font-mono">
                    {selectedOrder.orderNumber}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-700 text-xl font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Status Update Control */}
              <div className="bg-[#FFF8F3] border border-[#FDE3CE] rounded-lg p-4 space-y-3">
                <span className="text-xs font-bold text-[#D26900] uppercase tracking-wider block">
                  Change Order Stage / Status
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                      Order Stage:
                    </label>
                    <select
                      value={modalStatus}
                      onChange={(e) => setModalStatus(e.target.value as EcommerceOrderStatus)}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md bg-white font-bold text-gray-900 focus:border-[#D26900]"
                    >
                      {ORDER_STAGES.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                      Payment Status:
                    </label>
                    <select
                      value={modalPaymentStatus}
                      onChange={(e) => setModalPaymentStatus(e.target.value as EcommercePaymentStatus)}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md bg-white font-bold text-gray-900 focus:border-[#D26900]"
                    >
                      <option value="Pending">Pending (Unpaid)</option>
                      <option value="Paid">Paid (Confirmed)</option>
                      <option value="Failed">Failed</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>
                </div>

                {/* Tracking & Courier Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                      Courier Partner:
                    </label>
                    <input
                      type="text"
                      value={modalCourier}
                      onChange={(e) => setModalCourier(e.target.value)}
                      placeholder="e.g. BlueDart, Delhivery, Express"
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                      Tracking Number / AWB:
                    </label>
                    <input
                      type="text"
                      value={modalTracking}
                      onChange={(e) => setModalTracking(e.target.value)}
                      placeholder="e.g. BD94829104IN"
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* ========================================================= */}
              {/* DELHIVERY B2C LOGISTICS CONTROL PANEL */}
              {/* ========================================================= */}
              <div className="border border-orange-200 bg-[#FFFDF9] rounded-xl p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#D26900] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      🚚
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">Delhivery B2C Logistics</h4>
                      <p className="text-[10px] text-gray-500">Official Third-Party Express Delivery Integration</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    selectedOrder.delhiveryWaybill
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {selectedOrder.delhiveryWaybill ? (selectedOrder.delhiveryStatus || 'Manifested') : 'Not Shipped'}
                  </span>
                </div>

                {!selectedOrder.delhiveryWaybill ? (
                  <div className="space-y-2.5 pt-1">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Manifest this order directly to Delhivery B2C courier to generate an automated 14-digit AWB tracking waybill and register pickup at your warehouse.
                    </p>
                    <button
                      type="button"
                      disabled={createDelhiveryShipmentMutation.isPending || selectedOrder.orderStatus === 'Cancelled'}
                      onClick={handleManifestWithDelhivery}
                      className="w-full sm:w-auto px-5 py-2.5 bg-[#D26900] hover:bg-[#B85800] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-2xs hover:shadow cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40"
                    >
                      <span>🚀</span>
                      <span>
                        {createDelhiveryShipmentMutation.isPending
                          ? 'Manifesting with Delhivery...'
                          : 'Manifest & Ship with Delhivery B2C'}
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-white p-3 rounded-lg border border-orange-100">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 block uppercase">AWB Waybill</span>
                        <span className="font-mono font-bold text-gray-900 text-xs">{selectedOrder.delhiveryWaybill}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 block uppercase">Courier</span>
                        <span className="font-semibold text-gray-800 text-xs">Delhivery B2C</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 block uppercase">Pickup Warehouse</span>
                        <span className="font-semibold text-gray-800 text-xs">{selectedOrder.pickupLocation || 'Warehouse Main'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 block uppercase">Est. Delivery</span>
                        <span className="font-semibold text-emerald-700 text-xs">{selectedOrder.estimatedDeliveryDate || '3-5 Days'}</span>
                      </div>
                    </div>

                    {/* Delhivery Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handlePrintShippingLabel(selectedOrder.id)}
                        className="px-3.5 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span>📄</span>
                        <span>Print Shipping Label</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setTrackingModalWaybill({
                            waybill: selectedOrder.delhiveryWaybill!,
                            orderNumber: selectedOrder.orderNumber,
                          })
                        }
                        className="px-3.5 py-1.5 bg-[#D26900] hover:bg-[#B85800] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span>📍</span>
                        <span>Track Live Status</span>
                      </button>

                      {selectedOrder.orderStatus !== 'Delivered' && selectedOrder.orderStatus !== 'Cancelled' && (
                        <button
                          type="button"
                          disabled={cancelDelhiveryShipmentMutation.isPending}
                          onClick={handleCancelDelhiveryShipment}
                          className="px-3 py-1.5 border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold rounded-lg transition-colors cursor-pointer ml-auto"
                        >
                          {cancelDelhiveryShipmentMutation.isPending ? 'Cancelling...' : 'Cancel Delhivery Shipment'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Shipping Address Card */}
              <div className="border border-gray-200 rounded-lg p-4 space-y-2 bg-gray-50/50">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  Delivery Address:
                </span>
                <div className="text-xs text-gray-800 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm">
                      {selectedOrder.shippingAddress?.name || selectedOrder.customerName}
                    </span>
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-gray-200 text-gray-700">
                      {selectedOrder.shippingAddress?.type || 'HOME'}
                    </span>
                  </div>
                  <p className="text-gray-600">
                    {selectedOrder.shippingAddress?.address}
                    {selectedOrder.shippingAddress?.locality ? `, ${selectedOrder.shippingAddress.locality}` : ''}
                  </p>
                  <p className="text-gray-600">
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} -{' '}
                    <span className="font-bold">{selectedOrder.shippingAddress?.pincode}</span>
                  </p>
                  <p className="text-gray-700 font-semibold pt-1">
                    Mobile: {selectedOrder.shippingAddress?.mobile || selectedOrder.customerPhone}
                  </p>
                </div>
              </div>

              {/* Ordered Products Breakdown */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 text-xs font-bold text-gray-700">
                  Items in this order ({selectedOrder.items.length})
                </div>
                <div className="divide-y divide-gray-100 p-2 space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2">
                      <div className="flex items-center gap-3">
                        {item.primaryImage ? (
                          <img
                            src={item.primaryImage}
                            alt={item.title}
                            className="w-12 h-12 rounded-md object-cover border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center text-lg">
                            🧸
                          </div>
                        )}
                        <div>
                          <span className="text-xs font-bold text-gray-900 block">{item.title}</span>
                          <span className="text-[11px] text-gray-500">
                            Qty: {item.quantity} {item.selectedSize ? `• Size: ${item.selectedSize}` : ''}{' '}
                            {item.selectedColor ? `• Color: ${item.selectedColor}` : ''}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-gray-900">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-gray-50 rounded-lg p-4 text-xs space-y-2 border border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Total MRP</span>
                  <span>₹{selectedOrder.totalMrp?.toLocaleString('en-IN') || selectedOrder.totalAmount}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount on MRP</span>
                    <span>- ₹{selectedOrder.discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {selectedOrder.couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Coupon Discount</span>
                    <span>- ₹{selectedOrder.couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 flex justify-between font-black text-sm text-gray-900">
                  <span>Total Paid</span>
                  <span>₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveModalUpdates}
                  disabled={updateStatusMutation.isPending}
                  className="px-6 py-2 bg-[#D26900] hover:bg-[#B85800] text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  {updateStatusMutation.isPending ? 'Saving...' : 'Save Order Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={Boolean(orderToDelete)}
        title="Delete Order"
        message={`Are you sure you want to permanently delete order ${orderToDelete?.orderNumber}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteOrderMutation.isPending}
        onConfirm={handleConfirmDelete}
        onClose={() => setOrderToDelete(null)}
      />
      {/* 8. Delhivery Live Tracking Modal */}
      <AnimatePresence>
        {trackingModalWaybill && (
          <DelhiveryLiveTrackModal
            waybill={trackingModalWaybill.waybill}
            orderNumber={trackingModalWaybill.orderNumber}
            onClose={() => setTrackingModalWaybill(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-component: Delhivery Live Tracking Modal
function DelhiveryLiveTrackModal({
  waybill,
  orderNumber,
  onClose,
}: {
  waybill: string;
  orderNumber: string;
  onClose: () => void;
}) {
  const { data: tracking, isLoading, isError, refetch } = useDelhiveryTrackingQuery(
    waybill,
    orderNumber
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-base font-bold text-gray-900">Delhivery Live Tracking</h3>
            </div>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              AWB: <strong className="text-gray-800">{waybill}</strong> • Order #{orderNumber}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#D26900] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-gray-500">Fetching live scans from Delhivery server...</p>
          </div>
        ) : isError || !tracking ? (
          <div className="py-8 text-center space-y-2">
            <p className="text-xs font-bold text-red-600">Unable to retrieve tracking details right now</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="text-xs font-bold text-[#D26900] underline cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Status card */}
            <div className="bg-[#FAF5F0] border border-orange-200/80 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-600 uppercase">Current Status</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#D26900] text-white">
                  {tracking.status}
                </span>
              </div>
              <div className="text-xs text-gray-700 space-y-0.5">
                <p>Location: <strong className="text-gray-900">{tracking.currentLocation || 'In Transit'}</strong></p>
                {tracking.expectedDeliveryDate && (
                  <p>Expected Delivery: <strong className="text-gray-900">{tracking.expectedDeliveryDate}</strong></p>
                )}
                <p className="text-[11px] text-gray-500">Logistics Partner: Delhivery B2C Express</p>
              </div>
            </div>

            {/* Scan Journey Timeline */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Tracking Milestones ({tracking.scans?.length || 0})
              </h4>
              <div className="relative border-l-2 border-orange-200 ml-3 pl-4 space-y-3 py-1">
                {(tracking.scans || []).map((scan, i) => (
                  <div key={i} className="relative text-xs">
                    <span className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-[#D26900] ring-4 ring-orange-100" />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">{scan.status}</span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {new Date(scan.dateTime).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-gray-600 text-[11px] mt-0.5">📍 {scan.location}</p>
                    {scan.instructions && (
                      <p className="text-gray-500 text-[10px] italic">{scan.instructions}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
