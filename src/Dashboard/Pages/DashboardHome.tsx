import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import type { RootState } from '../../redux/store';
import {
  useAdminOrdersQuery,
  useCheckDelhiveryPincodeQuery,
  type EcommerceOrderStatus,
} from '../../hooks/useOrdersQuery';

const ORDER_STAGES: Array<{ id: EcommerceOrderStatus; label: string; color: string; bg: string }> = [
  { id: 'Placed', label: 'Placed', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  { id: 'Confirmed', label: 'Confirmed', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
  { id: 'Packed', label: 'Packing', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  { id: 'Shipped', label: 'Shipped', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  { id: 'Out for Delivery', label: 'Out for Delivery', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  { id: 'Delivered', label: 'Delivered', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  { id: 'Cancelled', label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
];

export default function DashboardHome() {
  const navigate = useNavigate();
  const { admin } = useSelector((state: RootState) => state.admin);

  // TanStack Query: Fetch recent orders & real-time counts
  const { data, isLoading, isError, refetch } = useAdminOrdersQuery({
    page: 1,
    limit: 8,
  });

  const orders = data?.orders || [];
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

  // Quick calculate total revenue from current page/data
  const totalRevenue = orders.reduce((sum, o) => {
    return o.orderStatus !== 'Cancelled' ? sum + (o.totalAmount || 0) : sum;
  }, 0);

  const pendingFulfillmentCount =
    statusCounts.placed + statusCounts.confirmed + statusCounts.packed;

  const delhiveryManifestedCount = orders.filter((o) => Boolean(o.delhiveryWaybill)).length;

  // Mini Delhivery Pincode Checker State for Admin verification
  const [adminPinTest, setAdminPinTest] = useState('110001');
  const [submittedPin, setSubmittedPin] = useState('110001');

  const { data: pinData, isLoading: isPinChecking } = useCheckDelhiveryPincodeQuery(
    submittedPin,
    { enabled: submittedPin.length === 6 }
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 font-sans">
      {/* 1. Executive Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-wider text-[#D26900] bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
              Store Command Center
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 tracking-tight mt-1">
            Welcome back, {admin?.name || 'Admin'}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Monitor real-time customer orders, sales revenue, and Delhivery B2C courier fulfillment.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/dashboard/orders"
            className="px-4 py-2.5 bg-[#D26900] hover:bg-[#B85800] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-2xs hover:shadow cursor-pointer flex items-center gap-1.5"
          >
            <span>📦</span>
            <span>Manage All Orders</span>
          </Link>
          <Link
            to="/dashboard/products"
            className="px-4 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
          >
            <span>➕</span>
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* 2. Top KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Metric 1: Total Orders */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => navigate('/dashboard/orders')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              📦
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-gray-900">
              {statusCounts.total}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                Live Data
              </span>
              <span className="text-[11px] text-gray-400">All channels</span>
            </div>
          </div>
        </motion.div>

        {/* Metric 2: Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Recent Sales
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
              💰
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-gray-900">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[11px] font-bold text-[#D26900] bg-orange-50 px-1.5 py-0.2 rounded">
                Active Batch
              </span>
              <span className="text-[11px] text-gray-400">Excl. cancelled</span>
            </div>
          </div>
        </motion.div>

        {/* Metric 3: Pending Fulfillment */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          onClick={() => navigate('/dashboard/orders?status=Placed')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200/90 shadow-2xs hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Pending Fulfillment
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              ⏳
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-amber-900">
              {pendingFulfillmentCount}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                Needs Action
              </span>
              <span className="text-[11px] text-gray-500">Placed / Packing</span>
            </div>
          </div>
        </motion.div>

        {/* Metric 4: Delhivery Courier */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          onClick={() => navigate('/dashboard/orders')}
          className="bg-gradient-to-br from-orange-50/80 to-white p-4 sm:p-5 rounded-2xl border border-orange-200 shadow-2xs hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#D26900] uppercase tracking-wider">
              Delhivery B2C
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#D26900] text-white flex items-center justify-center font-bold text-lg shadow-xs group-hover:scale-110 transition-transform">
              🚚
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-gray-900">
              {delhiveryManifestedCount}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded">
                API Connected
              </span>
              <span className="text-[11px] text-gray-500">Waybills active</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 3. Order Pipeline Status Breakdown Strip */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Order Fulfillment Pipeline
          </span>
          <Link
            to="/dashboard/orders"
            className="text-xs font-bold text-[#D26900] hover:underline"
          >
            View by stage →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {ORDER_STAGES.map((st) => {
            const count =
              st.id === 'Placed'
                ? statusCounts.placed
                : st.id === 'Confirmed'
                ? statusCounts.confirmed
                : st.id === 'Packed'
                ? statusCounts.packed
                : st.id === 'Shipped'
                ? statusCounts.shipped
                : st.id === 'Out for Delivery'
                ? statusCounts.outForDelivery
                : st.id === 'Delivered'
                ? statusCounts.delivered
                : statusCounts.cancelled;

            return (
              <button
                key={st.id}
                type="button"
                onClick={() => navigate(`/dashboard/orders?status=${st.id}`)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer hover:shadow-2xs ${st.bg}`}
              >
                <span className={`text-[11px] font-bold block ${st.color}`}>{st.label}</span>
                <span className="text-lg font-black text-gray-900 mt-1 block">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Recent Orders & Delhivery Quick Tool (Two Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Recent Orders Live Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900">Recent Customer Orders</h3>
                <p className="text-xs text-gray-500">Live order queue with Delhivery AWB integration</p>
              </div>
              <Link
                to="/dashboard/orders"
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg transition-colors"
              >
                View All ({statusCounts.total})
              </Link>
            </div>

            {isLoading ? (
              <div className="py-16 text-center space-y-2">
                <div className="w-6 h-6 border-2 border-[#D26900] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-gray-500">Loading recent orders...</p>
              </div>
            ) : isError ? (
              <div className="py-12 text-center text-xs text-red-600 font-semibold space-y-2">
                <p>Failed to load orders from database</p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="underline text-gray-900 font-bold"
                >
                  Retry
                </button>
              </div>
            ) : orders.length === 0 ? (
              <div className="py-14 text-center space-y-2 text-gray-400">
                <span className="text-3xl">🧸</span>
                <p className="text-xs font-medium text-gray-600">No customer orders placed yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50/70 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      <th className="py-2.5 px-4">Order ID</th>
                      <th className="py-2.5 px-4">Customer</th>
                      <th className="py-2.5 px-4">Total</th>
                      <th className="py-2.5 px-4">Stage</th>
                      <th className="py-2.5 px-4">Delhivery AWB</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {orders.slice(0, 6).map((order) => {
                      const stage =
                        ORDER_STAGES.find((s) => s.id === order.orderStatus) || ORDER_STAGES[0];

                      return (
                        <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-gray-900">
                            {order.orderNumber}
                            <span className="block text-[10px] font-sans font-normal text-gray-400">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-gray-900 block truncate max-w-[120px]">
                              {order.customerName}
                            </span>
                            <span className="text-[10px] text-gray-500 block">
                              {order.shippingAddress?.city || 'India'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-gray-900">
                            ₹{order.totalAmount.toLocaleString('en-IN')}
                            <span className="block text-[10px] font-normal text-gray-400">
                              {order.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${stage.bg} ${stage.color}`}
                            >
                              {stage.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px]">
                            {order.delhiveryWaybill ? (
                              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold inline-flex items-center gap-1">
                                <span>🚚</span>
                                <span>{order.delhiveryWaybill}</span>
                              </span>
                            ) : (
                              <span className="text-gray-400 italic">Not Shipped</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Link
                              to="/dashboard/orders"
                              className="px-2.5 py-1 bg-gray-100 hover:bg-[#D26900] hover:text-white rounded-md text-[11px] font-bold transition-colors inline-block"
                            >
                              Manage
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="p-3 bg-gray-50/60 border-t border-gray-100 text-center">
            <Link
              to="/dashboard/orders"
              className="text-xs font-bold text-[#D26900] hover:text-[#B85800] hover:underline"
            >
              Go to Full Orders Management →
            </Link>
          </div>
        </div>

        {/* Right 1 Column: Delhivery B2C Quick Logistics Panel */}
        <div className="space-y-4">
          <div className="bg-[#FFFDF9] border border-orange-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-orange-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#D26900] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  🚚
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900">Delhivery B2C Partner</h3>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    Live Production Ready
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-600 space-y-2">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-400">Environment</span>
                <span className="font-mono font-bold text-gray-800">prod (Live)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-400">Warehouse Hub</span>
                <span className="font-bold text-gray-800">YTEDYBAG B2C</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-400">Location</span>
                <span className="font-medium text-gray-700">Malyabag, Bihar</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-400">Courier Partner</span>
                <span className="font-bold text-gray-800">Delhivery B2C Express</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-400">All India Coverage</span>
                <span className="font-bold text-emerald-700">19,000+ PIN Codes</span>
              </div>
            </div>

            {/* Quick PIN Code Tester Tool */}
            <div className="pt-2 border-t border-orange-100 space-y-2">
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
                Quick Pincode Verification:
              </label>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (adminPinTest.trim().length === 6) {
                    setSubmittedPin(adminPinTest.trim());
                  }
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  maxLength={6}
                  value={adminPinTest}
                  onChange={(e) => setAdminPinTest(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="e.g. 110001"
                  className="w-full h-9 px-3 border border-gray-300 rounded-lg text-xs font-mono bg-white outline-none focus:border-[#D26900]"
                />
                <button
                  type="submit"
                  disabled={isPinChecking || adminPinTest.length !== 6}
                  className="h-9 px-3 bg-[#D26900] hover:bg-[#B85800] text-white text-xs font-bold rounded-lg uppercase cursor-pointer shrink-0 disabled:opacity-40"
                >
                  {isPinChecking ? '...' : 'Check'}
                </button>
              </form>

              {pinData && (
                <div className="p-2.5 rounded-lg bg-white border border-orange-200 text-[11px] text-gray-700 space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span>{pinData.city}, {pinData.state}</span>
                    <span className="text-emerald-700">✓ Serviceable</span>
                  </div>
                  <p className="text-[10px] text-gray-500">
                    COD: {pinData.codAvailable ? 'Available' : 'Prepaid only'} • Est: {pinData.estimatedDeliveryDate}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs space-y-2.5">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              Quick Shortcuts
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <Link
                to="/dashboard/orders"
                className="p-2.5 rounded-xl bg-orange-50/70 hover:bg-orange-100 text-[#D26900] border border-orange-200/60 text-center transition-colors block"
              >
                📦 Orders List
              </Link>
              <Link
                to="/dashboard/products"
                className="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 text-center transition-colors block"
              >
                🧸 Products
              </Link>
              <Link
                to="/dashboard/home-banner"
                className="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 text-center transition-colors block"
              >
                🖼️ Banners
              </Link>
              <Link
                to="/dashboard/header"
                className="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 text-center transition-colors block"
              >
                🧭 Nav Header
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
