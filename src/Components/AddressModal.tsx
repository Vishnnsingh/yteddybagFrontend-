import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import type { RootState } from '../redux/store';
import { useAccount, type UserAddress } from '../Context/AccountContext';

// Custom Checkbox matching My Account design
const CustomCheckbox = ({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <label htmlFor={id} className="flex items-center gap-2.5 cursor-pointer select-none group">
    <div
      className={`w-4 h-4 rounded-xs border flex items-center justify-center transition-colors shrink-0 ${
        checked
          ? 'bg-[#D26900] border-[#D26900] text-white'
          : 'border-gray-400 bg-white group-hover:border-[#D26900]'
      }`}
    >
      {checked && (
        <svg
          className="w-3 h-3"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.5 7.5L5.5 10.5L11.5 3.5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="sr-only"
    />
    <span className="text-xs sm:text-sm text-gray-700 font-medium">
      {label}
    </span>
  </label>
);

// Custom Radio button matching My Account brand styling
const CustomRadio = ({
  checked,
  onChange,
  label,
  name,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  name: string;
}) => (
  <label className="flex items-center gap-2.5 cursor-pointer select-none group">
    <div
      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
        checked
          ? 'border-[#D26900]'
          : 'border-gray-400 bg-white group-hover:border-[#D26900]'
      }`}
    >
      {checked && (
        <div className="w-2 h-2 rounded-full bg-[#D26900]" />
      )}
    </div>
    <input
      type="radio"
      name={name}
      checked={checked}
      onChange={onChange}
      className="sr-only"
    />
    <span className="text-xs sm:text-sm text-gray-800 font-medium">{label}</span>
  </label>
);

export interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAddress?: UserAddress | null;
  onSuccess?: (savedId?: string) => void;
}

export default function AddressModal({
  isOpen,
  onClose,
  editingAddress,
  onSuccess,
}: AddressModalProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const { addresses, addAddress, updateAddress, saving } = useAccount();

  const [addressForm, setAddressForm] = useState({
    name: '',
    mobile: '',
    pincode: '',
    state: '',
    houseNo: '',
    street: '',
    locality: '',
    city: '',
    type: 'HOME' as 'HOME' | 'OFFICE',
    openOnSaturday: false,
    openOnSunday: false,
    isDefault: false,
  });

  // Re-populate form whenever modal opens or editingAddress changes
  useEffect(() => {
    if (!isOpen) return;

    if (editingAddress) {
      const parts = editingAddress.address ? editingAddress.address.split(', ') : ['', ''];
      const houseNo = parts.length > 1 ? parts[0] : editingAddress.address || '';
      const street = parts.length > 1 ? parts.slice(1).join(', ') : '';

      setAddressForm({
        name: editingAddress.name || '',
        mobile: editingAddress.mobile || '',
        pincode: editingAddress.pincode || '',
        state: editingAddress.state || '',
        houseNo,
        street,
        locality: editingAddress.locality || '',
        city: editingAddress.city || '',
        type: editingAddress.type === 'OFFICE' || editingAddress.type === 'WORK' ? 'OFFICE' : 'HOME',
        openOnSaturday: Boolean(editingAddress.openOnSaturday),
        openOnSunday: Boolean(editingAddress.openOnSunday),
        isDefault: Boolean(editingAddress.isDefault),
      });
    } else {
      setAddressForm({
        name: user?.name || '',
        mobile: user?.phone || '',
        pincode: '',
        state: '',
        houseNo: '',
        street: '',
        locality: '',
        city: '',
        type: 'HOME',
        openOnSaturday: false,
        openOnSunday: false,
        isDefault: addresses.length === 0,
      });
    }
  }, [isOpen, editingAddress, user, addresses.length]);

  // Lock background body scroll while modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !addressForm.name.trim() ||
      !addressForm.mobile.trim() ||
      !addressForm.pincode.trim() ||
      !addressForm.state.trim() ||
      (!addressForm.houseNo.trim() && !addressForm.street.trim()) ||
      !addressForm.locality.trim() ||
      !addressForm.city.trim()
    ) {
      toast.error('Please fill in all address details');
      return;
    }

    if (!/^\d{10}$/.test(addressForm.mobile.replace(/\D/g, ''))) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!/^\d{6}$/.test(addressForm.pincode.trim())) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }

    const combinedAddress = [addressForm.houseNo.trim(), addressForm.street.trim()]
      .filter(Boolean)
      .join(', ') || addressForm.houseNo || addressForm.street;

    const payload = {
      name: addressForm.name.trim(),
      mobile: addressForm.mobile.trim(),
      pincode: addressForm.pincode.trim(),
      state: addressForm.state.trim(),
      address: combinedAddress,
      locality: addressForm.locality.trim(),
      city: addressForm.city.trim(),
      type: addressForm.type,
      openOnSaturday: addressForm.type === 'OFFICE' ? addressForm.openOnSaturday : false,
      openOnSunday: addressForm.type === 'OFFICE' ? addressForm.openOnSunday : false,
      isDefault: addressForm.isDefault,
    };

    if (editingAddress?.id) {
      const ok = await updateAddress(editingAddress.id, payload);
      if (ok) {
        onSuccess?.(editingAddress.id);
        onClose();
      }
    } else {
      const ok = await addAddress(payload);
      if (ok) {
        onSuccess?.();
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-lg shadow-2xl max-w-[460px] w-full overflow-hidden flex flex-col text-left animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 sm:px-7 py-4 border-b border-gray-200 bg-white">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#282C3F]">
            {editingAddress ? 'EDIT ADDRESS' : 'ADD NEW ADDRESS'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-lg font-bold cursor-pointer transition-colors p-1 leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSaveAddress} className="flex flex-col flex-1">
          <div className="px-6 sm:px-7 py-5 space-y-4 overflow-y-auto max-h-[72vh]">
            {/* Contact Details */}
            <div className="space-y-4">
              <div className="relative border-b border-gray-300 focus-within:border-[#D26900] transition-colors pb-0.5">
                <label className="text-[11px] sm:text-xs text-gray-500 font-medium block">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.name}
                  onChange={(e) =>
                    setAddressForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full bg-transparent text-sm font-medium text-gray-900 outline-none pt-1 pb-1.5"
                />
              </div>

              <div className="relative border-b border-gray-300 focus-within:border-[#D26900] transition-colors pb-0.5">
                <label className="text-[11px] sm:text-xs text-gray-500 font-medium block">
                  Mobile *
                </label>
                <input
                  type="tel"
                  required
                  value={addressForm.mobile}
                  onChange={(e) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      mobile: e.target.value.replace(/\D/g, '').slice(0, 10),
                    }))
                  }
                  className="w-full bg-transparent text-sm font-medium text-gray-900 outline-none pt-1 pb-1.5 font-mono"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                />
              </div>
            </div>

            {/* Section Separator Band (Thick Grey Strip matching reference) */}
            <div className="-mx-6 sm:-mx-7 h-2.5 bg-[#F5F5F6] border-y border-gray-200/70 my-3.5" />

            {/* Address Details */}
            <div className="space-y-4">
              {/* Pincode & State side-by-side */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative border-b border-gray-300 focus-within:border-[#D26900] transition-colors pb-0.5">
                  <label className="text-[11px] sm:text-xs text-gray-500 font-medium block">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.pincode}
                    onChange={(e) =>
                      setAddressForm((prev) => ({
                        ...prev,
                        pincode: e.target.value.replace(/\D/g, '').slice(0, 6),
                      }))
                    }
                    className="w-full bg-transparent text-sm font-medium text-gray-900 outline-none pt-1 pb-1.5 font-mono"
                    maxLength={6}
                  />
                </div>

                <div className="relative border-b border-gray-300 focus-within:border-[#D26900] transition-colors pb-0.5">
                  <label className="text-[11px] sm:text-xs text-gray-500 font-medium block">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) =>
                      setAddressForm((prev) => ({ ...prev, state: e.target.value }))
                    }
                    className="w-full bg-transparent text-sm font-medium text-gray-900 outline-none pt-1 pb-1.5"
                  />
                </div>
              </div>

              {/* House Number/Tower/Block * */}
              <div className="relative border-b border-gray-300 focus-within:border-[#D26900] transition-colors pb-0.5">
                <label className="text-[11px] sm:text-xs text-gray-500 font-medium block">
                  House Number/Tower/Block *
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.houseNo}
                  onChange={(e) =>
                    setAddressForm((prev) => ({ ...prev, houseNo: e.target.value }))
                  }
                  className="w-full bg-transparent text-sm font-medium text-gray-900 outline-none pt-1 pb-1.5"
                />
              </div>

              {/* Address (Building, Street, Area) * */}
              <div className="relative border-b border-gray-300 focus-within:border-[#D26900] transition-colors pb-0.5">
                <label className="text-[11px] sm:text-xs text-gray-500 font-medium block">
                  Address (Building, Street, Area) *
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.street}
                  onChange={(e) =>
                    setAddressForm((prev) => ({ ...prev, street: e.target.value }))
                  }
                  className="w-full bg-transparent text-sm font-medium text-gray-900 outline-none pt-1 pb-1.5"
                />
              </div>

              {/* Locality/ Town * */}
              <div className="relative border-b border-gray-300 focus-within:border-[#D26900] transition-colors pb-0.5">
                <label className="text-[11px] sm:text-xs text-gray-500 font-medium block">
                  Locality/ Town *
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.locality}
                  onChange={(e) =>
                    setAddressForm((prev) => ({ ...prev, locality: e.target.value }))
                  }
                  className="w-full bg-transparent text-sm font-medium text-gray-900 outline-none pt-1 pb-1.5"
                />
              </div>

              {/* City/ District * */}
              <div className="relative border-b border-gray-300 focus-within:border-[#D26900] transition-colors pb-0.5">
                <label className="text-[11px] sm:text-xs text-gray-500 font-medium block">
                  City/ District *
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.city}
                  onChange={(e) =>
                    setAddressForm((prev) => ({ ...prev, city: e.target.value }))
                  }
                  className="w-full bg-transparent text-sm font-medium text-gray-900 outline-none pt-1 pb-1.5"
                />
              </div>
            </div>

            {/* Section Separator Band */}
            <div className="-mx-6 sm:-mx-7 h-2.5 bg-[#F5F5F6] border-y border-gray-200/70 my-3.5" />

            {/* Type of Address */}
            <div className="space-y-4 pt-1">
              <div>
                <label className="text-[11px] sm:text-xs text-gray-500 font-medium block mb-2.5">
                  Type of Address *
                </label>
                <div className="flex items-center gap-7">
                  <CustomRadio
                    name="modalAddressType"
                    label="Home"
                    checked={addressForm.type === 'HOME'}
                    onChange={() =>
                      setAddressForm((prev) => ({
                        ...prev,
                        type: 'HOME',
                        openOnSaturday: false,
                        openOnSunday: false,
                      }))
                    }
                  />
                  <CustomRadio
                    name="modalAddressType"
                    label="Office"
                    checked={addressForm.type === 'OFFICE'}
                    onChange={() =>
                      setAddressForm((prev) => ({ ...prev, type: 'OFFICE' }))
                    }
                  />
                </div>
              </div>

              {/* Weekend Delivery options (Shown when Office is selected) */}
              {addressForm.type === 'OFFICE' && (
                <div className="space-y-2.5 pt-1 animate-in fade-in duration-150">
                  <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
                    Is your office open on weekends?
                  </p>
                  <div className="space-y-2 pl-0.5">
                    <CustomCheckbox
                      id="modalOpenSaturday"
                      label="Open on Saturday"
                      checked={addressForm.openOnSaturday}
                      onChange={(val) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          openOnSaturday: val,
                        }))
                      }
                    />
                    <CustomCheckbox
                      id="modalOpenSunday"
                      label="Open on Sunday"
                      checked={addressForm.openOnSunday}
                      onChange={(val) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          openOnSunday: val,
                        }))
                      }
                    />
                  </div>
                </div>
              )}

              {/* Divider line before default address option */}
              <div className="border-t border-gray-200/80 pt-3">
                <CustomCheckbox
                  id="modalMakeDefault"
                  label="Make this as my default address"
                  checked={addressForm.isDefault}
                  onChange={(val) =>
                    setAddressForm((prev) => ({ ...prev, isDefault: val }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Modal Split Footer CTA (Matches Reference with Brand Orange CTA) */}
          <div className="grid grid-cols-2 border-t border-gray-200 mt-auto shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="py-4 text-center font-bold text-xs uppercase tracking-wider text-gray-700 bg-white hover:bg-gray-50 transition-colors border-r border-gray-200 cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={saving}
              className="py-4 text-center font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-[#D26900] to-[#E65100] hover:from-[#B45309] hover:to-[#D26900] transition-all cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {saving ? 'SAVING...' : 'SAVE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
