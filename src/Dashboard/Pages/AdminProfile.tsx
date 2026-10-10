import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { RootState } from '../../redux/store';

export default function AdminProfile() {
  const { admin } = useSelector((state: RootState) => state.admin);

  if (!admin) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  const details = [
    { label: 'Admin ID', value: admin.id || '—', copyable: true },
    { label: 'Full Name', value: admin.name || 'Admin', copyable: false },
    { label: 'Email Address', value: admin.email || 'admin@gmail.com', copyable: true },
    { label: 'System Role', value: admin.role?.toUpperCase() || 'ADMIN', badge: true },
    { label: 'Account Status', value: admin.isActive ? 'Active' : 'Inactive', statusBadge: true },
    { label: 'Created At', value: admin.createdAt ? new Date(admin.createdAt).toLocaleString() : '—', copyable: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl space-y-6"
    >
      {/* Top Breadcrumb / Back button */}
      <div className="flex items-center justify-between">
        <NavLink
          to="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#6B7280] hover:text-[#D26900] transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </NavLink>
        <span className="text-xs bg-[#FFF7ED] text-[#D26900] px-3 py-1 rounded-full font-medium border border-[#FED7AA]">
          Admin Profile
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        {/* Profile Banner */}
        <div className="bg-gradient-to-r from-gray-900 via-slate-800 to-[#111827] px-6 py-8 text-white relative">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-20 h-20 bg-[#D26900] rounded-2xl flex items-center justify-center text-white text-3xl font-extrabold shadow-xl">
              {admin.name ? admin.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-white text-2xl font-bold">{admin.name || 'Admin'}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                  Active
                </span>
              </div>
              <p className="text-gray-300 text-sm mt-1">{admin.email}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-[#D26900] text-white font-bold text-[11px] rounded-md shadow-xs">
                  {admin.role?.toUpperCase() || 'ADMIN'}
                </span>
                <span className="text-gray-400 text-xs">• YTeddybags Admin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Detailed Info */}
        <div className="p-6">
          <h3 className="text-[#111827] font-bold text-sm mb-4">Account Information</h3>
          <div className="divide-y divide-gray-100">
            {details.map((item) => (
              <div key={item.label} className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="text-[#6B7280] text-xs font-medium uppercase tracking-wider">{item.label}</span>
                <span className="text-[#111827] text-sm font-semibold">
                  {item.badge ? (
                    <span className="px-2.5 py-0.5 bg-[#FFF7ED] text-[#D26900] rounded-md border border-[#FED7AA] text-xs font-bold">
                      {item.value}
                    </span>
                  ) : item.statusBadge ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium text-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      {item.value}
                    </span>
                  ) : (
                    item.value
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
