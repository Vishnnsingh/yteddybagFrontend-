import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState } from '../../redux/store';

export default function UserAccount() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return (
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 py-12 text-center">
        <h2 className="text-2xl font-bold text-[#111827]">Please sign in</h2>
        <p className="text-[#6B7280] mt-2 mb-6">You need to be logged in to view your account details.</p>
        <Link
          to="/login"
          className="inline-block px-6 py-2.5 bg-[#D26900] hover:bg-[#B45309] text-white font-medium rounded-md shadow-xs transition-colors"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 py-10">
      <div className="max-w-2xl bg-white border border-[#F3F4F6] rounded-xl shadow-xs overflow-hidden">
        <div className="bg-[#FFF7ED] p-6 border-b border-[#FED7AA] flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#D26900] flex items-center justify-center text-white font-bold text-xl shadow-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#111827]">{user?.name || 'Customer'}</h2>
            <p className="text-sm text-[#6B7280]">{user?.email}</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-[#6B7280]">Account Role</span>
            <span className="text-sm font-semibold text-[#111827]">{user?.role || 'Customer'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-[#6B7280]">Email Verified</span>
            <span className="text-sm font-semibold text-[#10B981]">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
