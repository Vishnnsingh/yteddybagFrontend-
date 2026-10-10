import type { HomeSectionLayoutItem, HomeSectionType } from '../../Context/HomeBannerContext';

interface AdminSectionInstanceSelectorProps {
  sectionType: HomeSectionType;
  typeTitle: string;
  defaultLabel: string;
  icon: string;
  sections: HomeSectionLayoutItem[];
  activeSection: HomeSectionLayoutItem | null;
  onSelectSection: (sectionId: string) => void;
  onAddSection: () => void;
  onDuplicateSection: (sectionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onJumpToLayout?: () => void;
}

export default function AdminSectionInstanceSelector({
  typeTitle,
  defaultLabel,
  icon,
  sections,
  activeSection,
  onSelectSection,
  onAddSection,
  onDuplicateSection,
  onDeleteSection,
  onJumpToLayout,
}: AdminSectionInstanceSelectorProps) {
  const currentCount = sections.length;
  const currentId = activeSection?.id || (sections[0]?.id ?? '');

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200/80 shadow-xs space-y-3.5">
      {/* Top row: Section Context and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-10 h-10 rounded-xl bg-orange-50 text-[#D26900] flex items-center justify-center text-xl shrink-0 border border-orange-200/60 shadow-2xs">
            {icon}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black text-gray-900 tracking-tight">
                {typeTitle} Section Manager
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FFF7ED] text-[#D26900] border border-[#FED7AA]">
                {currentCount} {currentCount === 1 ? 'Instance' : 'Instances'} on Page
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-gray-500 truncate mt-0.5">
              Har section ka apna alag content, items, slides aur settings hoti hain. Ek me badlaav dusre ko prabhavit nahi karta.
            </p>
          </div>
        </div>

        {/* Action Buttons: Add Another Section & Duplicate */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={onAddSection}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-[#D26900] to-[#E65100] hover:from-[#B45309] hover:to-[#D26900] text-white shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            title={`Add another new independent ${typeTitle} section`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>+ Add Another {typeTitle}</span>
          </button>

          {activeSection && (
            <button
              type="button"
              onClick={() => onDuplicateSection(activeSection.id)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-50 hover:bg-amber-100 text-[#D26900] border border-amber-200 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
              title="Duplicate this section with its own copy of items"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Duplicate</span>
            </button>
          )}

          {currentCount > 1 && activeSection && (
            <button
              type="button"
              onClick={() => onDeleteSection(activeSection.id)}
              className="p-1.5 text-xs font-bold rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer"
              title="Remove this section from page layout"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}

          {onJumpToLayout && (
            <button
              type="button"
              onClick={onJumpToLayout}
              className="px-2.5 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition cursor-pointer"
              title="View full page section order & spacing"
            >
              Sections Layout ↗
            </button>
          )}
        </div>
      </div>

      {/* Section Instance Selector Pills */}
      <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0">
          Switch Section:
        </span>
        {sections.map((sec, idx) => {
          const isSelected = sec.id === currentId;
          const itemCount = Array.isArray(sec.items) ? sec.items.length : undefined;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => onSelectSection(sec.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                isSelected
                  ? 'bg-gradient-to-r from-[#D26900] to-[#E65100] text-white shadow-xs scale-102 ring-2 ring-[#D26900]/25'
                  : 'bg-gray-50 hover:bg-amber-50 text-gray-700 hover:text-[#D26900] border border-gray-200 hover:border-amber-300'
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                #{idx + 1}
              </span>
              <span className="truncate max-w-[160px] sm:max-w-[220px]">
                {sec.custom_label || `${defaultLabel} #${idx + 1}`}
              </span>
              {itemCount !== undefined && (
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  isSelected ? 'bg-black/20 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
              )}
              {!sec.is_enabled && (
                <span className={`text-[9px] uppercase font-bold px-1 rounded ${
                  isSelected ? 'bg-black/30 text-amber-200' : 'bg-gray-200 text-gray-500'
                }`}>
                  Hidden
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
