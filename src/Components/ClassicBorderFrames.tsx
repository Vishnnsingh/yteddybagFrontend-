import React from 'react';

export interface ClassicBorderOption {
  id: string;
  name: string;
  category: string;
  description: string;
}

export const CLASSIC_BORDER_OPTIONS: ClassicBorderOption[] = [
  { id: 'victorian-ornate', name: 'Victorian Ornate Flourish', category: 'Vintage Classic', description: 'Intricate Victorian floral corner flourishes with delicate inner border' },
  { id: 'royal-baroque', name: 'Royal Baroque Gold', category: 'Royal Luxury', description: 'Acanthus leaf & baroque golden swirl corner flourishes' },
  { id: 'vintage-filigree', name: 'Vintage Filigree Lace', category: 'Fine Decorative', description: 'Delicate filigree lace corner medallions and double inner rule' },
  { id: 'antique-crest', name: 'Antique Scrollwork Crest', category: 'Heritage Antique', description: 'Ornate antique scrollwork crest with top and bottom center accents' },
  { id: 'greek-key', name: 'Grecian Luxury Meander', category: 'Classical Geometric', description: 'Timeless Greek key meander geometric luxury border' },
  { id: 'art-deco-luxury', name: 'Art Deco Gatsby', category: 'Geometric Luxury', description: 'Stepped 1920s Art Deco corners with sleek linear gold framing' },
  { id: 'botanical-ivy', name: 'Botanical Ivy Spray', category: 'Nature & Floral', description: 'Handcrafted botanical leaves, ivy vines and floral corner sprays' },
  { id: 'french-rococo', name: 'French Rococo Ribbon', category: 'European Palace', description: 'French Rococo delicate ribbon swirls and shell corner motifs' },
  { id: 'classic-regency', name: 'Classic Regency Rosette', category: 'Traditional Fine', description: 'Regency symmetry frame with corner rosettes and double fine rules' },
  { id: 'vintage-certificate', name: 'Guilloche Banknote Frame', category: 'Vintage Engraving', description: 'Classic guilloche engraved banknote and certificate border' },
  { id: 'double-gold-flourish', name: 'Jeweler Double Gold Line', category: 'Minimal Luxury', description: 'Traditional luxury jeweler frame with curved corner brackets' },
  { id: 'minimal-antique', name: 'Understated Antique Brackets', category: 'Clean Vintage', description: 'Subtle antique corner bracket accents with clean borders' },
  { id: 'heritage-heraldic', name: 'Heraldic Crown & Emblems', category: 'Royal Heritage', description: 'Royal heraldic scrollwork with crown and emblem accents' },
  { id: 'floral-wreath', name: 'Delicate Floral Vine Spray', category: 'Romantic Flora', description: 'Romantic delicate floral vine corner sprays with fine border' },
];

interface ClassicBorderFrameProps {
  styleId?: string;
  color?: string;
  radius?: number;
  borderWidth?: number;
  className?: string;
}

export const ClassicBorderFrame: React.FC<ClassicBorderFrameProps> = ({
  styleId = 'victorian-ornate',
  color = '#D26900',
  radius = 16,
  borderWidth = 1,
  className = '',
}) => {
  const strokeColor = color || '#D26900';
  const sw = borderWidth || 1;

  // Render authentic SVG classic vintage decorative corner overlays and frames
  switch (styleId) {
    case 'victorian-ornate':
      return (
        <div
          className={`absolute inset-0 pointer-events-none overflow-hidden z-10 ${className}`}
          style={{ borderRadius: `${radius}px` }}
        >
          {/* Outer Border Line */}
          <div
            className="absolute inset-[3px] pointer-events-none"
            style={{
              border: `${sw}px solid ${strokeColor}55`,
              borderRadius: `${Math.max(0, radius - 3)}px`,
            }}
          />
          {/* Inner Pinstripe */}
          <div
            className="absolute inset-[7px] pointer-events-none"
            style={{
              border: `${Math.max(1, sw * 0.75)}px solid ${strokeColor}33`,
              borderRadius: `${Math.max(0, radius - 7)}px`,
            }}
          />
          {/* Top-Left Corner Flourish */}
          <svg className="absolute top-1 left-1 w-10 h-10" viewBox="0 0 40 40" fill="none">
            <path
              d="M4 18 C4 10 10 4 18 4 M8 22 C8 12 12 8 22 8 M4 28 C4 16 16 4 28 4 M6 6 C10 14 14 10 18 18 M2 2 L12 2 C7 7 7 7 2 12 Z"
              stroke={strokeColor}
              strokeWidth={sw * 1.1}
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="6" cy="6" r="1.5" fill={strokeColor} />
            <circle cx="16" cy="6" r="1" fill={strokeColor} />
            <circle cx="6" cy="16" r="1" fill={strokeColor} />
          </svg>
          {/* Top-Right Corner Flourish */}
          <svg className="absolute top-1 right-1 w-10 h-10" viewBox="0 0 40 40" fill="none" style={{ transform: 'scaleX(-1)' }}>
            <path
              d="M4 18 C4 10 10 4 18 4 M8 22 C8 12 12 8 22 8 M4 28 C4 16 16 4 28 4 M6 6 C10 14 14 10 18 18 M2 2 L12 2 C7 7 7 7 2 12 Z"
              stroke={strokeColor}
              strokeWidth={sw * 1.1}
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="6" cy="6" r="1.5" fill={strokeColor} />
            <circle cx="16" cy="6" r="1" fill={strokeColor} />
            <circle cx="6" cy="16" r="1" fill={strokeColor} />
          </svg>
          {/* Bottom-Left Corner Flourish */}
          <svg className="absolute bottom-1 left-1 w-10 h-10" viewBox="0 0 40 40" fill="none" style={{ transform: 'scaleY(-1)' }}>
            <path
              d="M4 18 C4 10 10 4 18 4 M8 22 C8 12 12 8 22 8 M4 28 C4 16 16 4 28 4 M6 6 C10 14 14 10 18 18 M2 2 L12 2 C7 7 7 7 2 12 Z"
              stroke={strokeColor}
              strokeWidth={sw * 1.1}
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="6" cy="6" r="1.5" fill={strokeColor} />
            <circle cx="16" cy="6" r="1" fill={strokeColor} />
            <circle cx="6" cy="16" r="1" fill={strokeColor} />
          </svg>
          {/* Bottom-Right Corner Flourish */}
          <svg className="absolute bottom-1 right-1 w-10 h-10" viewBox="0 0 40 40" fill="none" style={{ transform: 'scale(-1, -1)' }}>
            <path
              d="M4 18 C4 10 10 4 18 4 M8 22 C8 12 12 8 22 8 M4 28 C4 16 16 4 28 4 M6 6 C10 14 14 10 18 18 M2 2 L12 2 C7 7 7 7 2 12 Z"
              stroke={strokeColor}
              strokeWidth={sw * 1.1}
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="6" cy="6" r="1.5" fill={strokeColor} />
            <circle cx="16" cy="6" r="1" fill={strokeColor} />
            <circle cx="6" cy="16" r="1" fill={strokeColor} />
          </svg>
        </div>
      );

    case 'royal-baroque':
      return (
        <div
          className={`absolute inset-0 pointer-events-none overflow-hidden z-10 ${className}`}
          style={{ borderRadius: `${radius}px` }}
        >
          <div
            className="absolute inset-[4px] pointer-events-none"
            style={{
              border: `${sw * 1.5}px double ${strokeColor}88`,
              borderRadius: `${Math.max(0, radius - 4)}px`,
            }}
          />
          {/* Acanthus leaf / baroque corners */}
          {['top-1 left-1', 'top-1 right-1 -scale-x-100', 'bottom-1 left-1 -scale-y-100', 'bottom-1 right-1 -scale-100'].map((pos, i) => (
            <svg key={i} className={`absolute ${pos} w-12 h-12`} viewBox="0 0 48 48" fill="none">
              <path
                d="M4 28 C4 12 12 4 28 4 C24 8 20 12 20 20 C12 20 8 24 4 28 Z M10 10 C16 4 24 6 32 4 C28 10 24 16 26 24 M6 18 C12 12 18 14 22 8"
                stroke={strokeColor}
                strokeWidth={sw}
                fill={`${strokeColor}15`}
                strokeLinecap="round"
              />
              <path d="M2 2 C14 2 24 6 30 12 C18 18 10 24 2 34 Z" fill={`${strokeColor}22`} />
            </svg>
          ))}
        </div>
      );

    case 'vintage-filigree':
      return (
        <div
          className={`absolute inset-0 pointer-events-none overflow-hidden z-10 ${className}`}
          style={{ borderRadius: `${radius}px` }}
        >
          <div
            className="absolute inset-[5px] pointer-events-none"
            style={{
              border: `${sw}px dashed ${strokeColor}66`,
              borderRadius: `${Math.max(0, radius - 5)}px`,
            }}
          />
          <div
            className="absolute inset-[2px] pointer-events-none"
            style={{
              border: `${sw * 0.8}px solid ${strokeColor}44`,
              borderRadius: `${Math.max(0, radius - 2)}px`,
            }}
          />
          {/* Filigree corner medallions */}
          {['top-1 left-1', 'top-1 right-1 -scale-x-100', 'bottom-1 left-1 -scale-y-100', 'bottom-1 right-1 -scale-100'].map((pos, i) => (
            <svg key={i} className={`absolute ${pos} w-11 h-11`} viewBox="0 0 44 44" fill="none">
              <circle cx="12" cy="12" r="6" stroke={strokeColor} strokeWidth={sw} fill="none" />
              <path d="M12 2 C8 8 8 16 12 22 M2 12 C8 8 16 8 22 12" stroke={strokeColor} strokeWidth={sw} />
              <path d="M6 6 Q12 12 18 6 M6 18 Q12 12 18 18" stroke={strokeColor} strokeWidth={sw * 0.7} />
              <circle cx="12" cy="12" r="2" fill={strokeColor} />
            </svg>
          ))}
        </div>
      );

    case 'antique-crest':
      return (
        <div
          className={`absolute inset-0 pointer-events-none overflow-hidden z-10 ${className}`}
          style={{ borderRadius: `${radius}px` }}
        >
          <div
            className="absolute inset-[4px] pointer-events-none"
            style={{
              border: `${sw}px solid ${strokeColor}77`,
              borderRadius: `${Math.max(0, radius - 4)}px`,
            }}
          />
          {/* Top center scrollwork emblem */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 flex items-center justify-center">
            <svg className="w-24 h-5" viewBox="0 0 96 20" fill="none">
              <path
                d="M48 2 C44 8 36 12 24 10 C16 9 8 12 2 18 M48 2 C52 8 60 12 72 10 C80 9 88 12 94 18 M48 6 L44 14 L48 18 L52 14 Z"
                stroke={strokeColor}
                strokeWidth={sw * 1.1}
                fill={`${strokeColor}25`}
              />
              <circle cx="48" cy="10" r="2" fill={strokeColor} />
            </svg>
          </div>
          {/* Bottom center mirror emblem */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center justify-center rotate-180">
            <svg className="w-24 h-5" viewBox="0 0 96 20" fill="none">
              <path
                d="M48 2 C44 8 36 12 24 10 C16 9 8 12 2 18 M48 2 C52 8 60 12 72 10 C80 9 88 12 94 18 M48 6 L44 14 L48 18 L52 14 Z"
                stroke={strokeColor}
                strokeWidth={sw * 1.1}
                fill={`${strokeColor}25`}
              />
              <circle cx="48" cy="10" r="2" fill={strokeColor} />
            </svg>
          </div>
          {/* Corner flourish */}
          {['top-1 left-1', 'top-1 right-1 -scale-x-100', 'bottom-1 left-1 -scale-y-100', 'bottom-1 right-1 -scale-100'].map((pos, i) => (
            <svg key={i} className={`absolute ${pos} w-8 h-8`} viewBox="0 0 32 32" fill="none">
              <path d="M2 14 C2 7 7 2 14 2 M6 18 C6 10 10 6 18 6" stroke={strokeColor} strokeWidth={sw} strokeLinecap="round" />
            </svg>
          ))}
        </div>
      );

    case 'greek-key':
      return (
        <div
          className={`absolute inset-0 pointer-events-none overflow-hidden z-10 ${className}`}
          style={{ borderRadius: `${radius}px` }}
        >
          {/* Outer Frame */}
          <div
            className="absolute inset-[3px] pointer-events-none"
            style={{
              border: `${sw}px solid ${strokeColor}66`,
              borderRadius: `${Math.max(0, radius - 3)}px`,
            }}
          />
          {/* Greek Key Meander corners */}
          {['top-1 left-1', 'top-1 right-1 -scale-x-100', 'bottom-1 left-1 -scale-y-100', 'bottom-1 right-1 -scale-100'].map((pos, i) => (
            <svg key={i} className={`absolute ${pos} w-10 h-10`} viewBox="0 0 40 40" fill="none">
              <path
                d="M4 24 L4 4 L24 4 L24 16 L12 16 L12 8 L20 8 L20 12"
                stroke={strokeColor}
                strokeWidth={sw * 1.3}
                strokeLinecap="square"
                strokeLinejoin="miter"
              />
              <path
                d="M8 28 L8 36 L16 36 L16 32"
                stroke={strokeColor}
                strokeWidth={sw}
                strokeLinecap="square"
              />
            </svg>
          ))}
        </div>
      );

    case 'art-deco-luxury':
      return (
        <div
          className={`absolute inset-0 pointer-events-none overflow-hidden z-10 ${className}`}
          style={{ borderRadius: `${radius}px` }}
        >
          {/* Stepped Art Deco Frame */}
          <div
            className="absolute inset-[3px] pointer-events-none"
            style={{
              border: `${sw}px solid ${strokeColor}88`,
              borderRadius: `${Math.max(0, radius - 3)}px`,
            }}
          />
          <div
            className="absolute inset-[7px] pointer-events-none"
            style={{
              border: `${sw * 0.75}px solid ${strokeColor}44`,
              borderRadius: `${Math.max(0, radius - 7)}px`,
            }}
          />
          {/* Stepped corners */}
          {['top-1 left-1', 'top-1 right-1 -scale-x-100', 'bottom-1 left-1 -scale-y-100', 'bottom-1 right-1 -scale-100'].map((pos, i) => (
            <svg key={i} className={`absolute ${pos} w-10 h-10`} viewBox="0 0 40 40" fill="none">
              <path
                d="M2 18 L18 2 M2 12 L12 2 M2 6 L6 2 M2 24 L24 2 M2 2 L2 30 M2 2 L30 2"
                stroke={strokeColor}
                strokeWidth={sw}
                strokeLinecap="square"
              />
              <rect x="4" y="4" width="6" height="6" fill={`${strokeColor}33`} stroke={strokeColor} strokeWidth={sw * 0.8} />
            </svg>
          ))}
        </div>
      );

    case 'botanical-ivy':
      return (
        <div
          className={`absolute inset-0 pointer-events-none overflow-hidden z-10 ${className}`}
          style={{ borderRadius: `${radius}px` }}
        >
          <div
            className="absolute inset-[4px] pointer-events-none"
            style={{
              border: `${sw}px solid ${strokeColor}55`,
              borderRadius: `${Math.max(0, radius - 4)}px`,
            }}
          />
          {/* Botanical leaves / ivy corners */}
          {['top-1 left-1', 'top-1 right-1 -scale-x-100', 'bottom-1 left-1 -scale-y-100', 'bottom-1 right-1 -scale-100'].map((pos, i) => (
            <svg key={i} className={`absolute ${pos} w-12 h-12`} viewBox="0 0 48 48" fill="none">
              <path
                d="M4 32 C4 18 18 4 32 4 C28 12 24 16 16 16 C16 24 12 28 4 32 Z"
                stroke={strokeColor}
                strokeWidth={sw}
                fill={`${strokeColor}20`}
              />
              <path
                d="M8 8 C14 4 18 10 16 16 M12 24 C16 20 22 22 24 16 M24 12 C28 8 34 10 32 16"
                stroke={strokeColor}
                strokeWidth={sw * 0.9}
                strokeLinecap="round"
              />
              <circle cx="8" cy="8" r="1.5" fill={strokeColor} />
              <circle cx="16" cy="16" r="1.5" fill={strokeColor} />
            </svg>
          ))}
        </div>
      );

    case 'french-rococo':
      return (
        <div
          className={`absolute inset-0 pointer-events-none overflow-hidden z-10 ${className}`}
          style={{ borderRadius: `${radius}px` }}
        >
          <div
            className="absolute inset-[4px] pointer-events-none"
            style={{
              border: `${sw}px solid ${strokeColor}66`,
              borderRadius: `${Math.max(0, radius - 4)}px`,
            }}
          />
          {/* Rococo swirls */}
          {['top-1 left-1', 'top-1 right-1 -scale-x-100', 'bottom-1 left-1 -scale-y-100', 'bottom-1 right-1 -scale-100'].map((pos, i) => (
            <svg key={i} className={`absolute ${pos} w-11 h-11`} viewBox="0 0 44 44" fill="none">
              <path
                d="M4 22 C4 12 12 4 22 4 C18 10 14 14 14 20 C10 18 6 22 4 22 Z M10 8 C16 4 22 8 26 12 C20 14 16 16 14 20"
                stroke={strokeColor}
                strokeWidth={sw}
                fill={`${strokeColor}18`}
              />
              <circle cx="6" cy="6" r="2" fill={strokeColor} />
            </svg>
          ))}
        </div>
      );

    case 'classic-regency':
      return (
        <div
          className={`absolute inset-0 pointer-events-none overflow-hidden z-10 ${className}`}
          style={{ borderRadius: `${radius}px` }}
        >
          <div
            className="absolute inset-[3px] pointer-events-none"
            style={{
              border: `${sw}px solid ${strokeColor}88`,
              borderRadius: `${Math.max(0, radius - 3)}px`,
            }}
          />
          <div
            className="absolute inset-[8px] pointer-events-none"
            style={{
              border: `${sw * 0.7}px solid ${strokeColor}33`,
              borderRadius: `${Math.max(0, radius - 8)}px`,
            }}
          />
          {/* Regency rosettes */}
          {['top-1 left-1', 'top-1 right-1', 'bottom-1 left-1', 'bottom-1 right-1'].map((pos, i) => (
            <div key={i} className={`absolute ${pos} w-5 h-5 flex items-center justify-center`}>
              <svg className="w-full h-full" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="7" stroke={strokeColor} strokeWidth={sw} fill={`${strokeColor}15`} />
                <circle cx="10" cy="10" r="3" fill={strokeColor} />
                <path d="M10 2 L10 18 M2 10 L18 10" stroke={strokeColor} strokeWidth={sw * 0.75} />
              </svg>
            </div>
          ))}
        </div>
      );

    case 'vintage-certificate':
      return (
        <div
          className={`absolute inset-0 pointer-events-none overflow-hidden z-10 ${className}`}
          style={{ borderRadius: `${radius}px` }}
        >
          <div
            className="absolute inset-[4px] pointer-events-none"
            style={{
              border: `${sw * 1.5}px double ${strokeColor}99`,
              borderRadius: `${Math.max(0, radius - 4)}px`,
            }}
          />
          <div
            className="absolute inset-[8px] pointer-events-none"
            style={{
              border: `${sw}px dotted ${strokeColor}55`,
              borderRadius: `${Math.max(0, radius - 8)}px`,
            }}
          />
          {/* Guilloche corners */}
          {['top-1 left-1', 'top-1 right-1 -scale-x-100', 'bottom-1 left-1 -scale-y-100', 'bottom-1 right-1 -scale-100'].map((pos, i) => (
            <svg key={i} className={`absolute ${pos} w-8 h-8`} viewBox="0 0 32 32" fill="none">
              <rect x="3" y="3" width="10" height="10" stroke={strokeColor} strokeWidth={sw} fill="none" />
              <rect x="5" y="5" width="6" height="6" stroke={strokeColor} strokeWidth={sw * 0.6} fill={`${strokeColor}20`} />
              <path d="M13 3 L13 13 L3 13" stroke={strokeColor} strokeWidth={sw} />
            </svg>
          ))}
        </div>
      );

    case 'double-gold-flourish':
      return (
        <div
          className={`absolute inset-0 pointer-events-none overflow-hidden z-10 ${className}`}
          style={{ borderRadius: `${radius}px` }}
        >
          <div
            className="absolute inset-[3px] pointer-events-none"
            style={{
              border: `${sw}px solid ${strokeColor}99`,
              borderRadius: `${Math.max(0, radius - 3)}px`,
            }}
          />
          <div
            className="absolute inset-[7px] pointer-events-none"
            style={{
              border: `${sw * 0.8}px solid ${strokeColor}55`,
              borderRadius: `${Math.max(0, radius - 7)}px`,
            }}
          />
          {/* Gold flourish corners */}
          {['top-1 left-1', 'top-1 right-1 -scale-x-100', 'bottom-1 left-1 -scale-y-100', 'bottom-1 right-1 -scale-100'].map((pos, i) => (
            <svg key={i} className={`absolute ${pos} w-7 h-7`} viewBox="0 0 28 28" fill="none">
              <path d="M2 14 C2 7 7 2 14 2" stroke={strokeColor} strokeWidth={sw * 1.5} strokeLinecap="round" />
              <circle cx="5" cy="5" r="2" fill={strokeColor} />
            </svg>
          ))}
        </div>
      );

    case 'minimal-antique':
      return (
        <div
          className={`absolute inset-0 pointer-events-none overflow-hidden z-10 ${className}`}
          style={{ borderRadius: `${radius}px` }}
        >
          <div
            className="absolute inset-[3px] pointer-events-none"
            style={{
              border: `${sw}px solid ${strokeColor}77`,
              borderRadius: `${Math.max(0, radius - 3)}px`,
            }}
          />
          {/* Subtle brackets */}
          {['top-1 left-1', 'top-1 right-1 -scale-x-100', 'bottom-1 left-1 -scale-y-100', 'bottom-1 right-1 -scale-100'].map((pos, i) => (
            <svg key={i} className={`absolute ${pos} w-6 h-6`} viewBox="0 0 24 24" fill="none">
              <path d="M2 12 L2 2 L12 2" stroke={strokeColor} strokeWidth={sw * 1.8} strokeLinecap="square" />
            </svg>
          ))}
        </div>
      );

    case 'heritage-heraldic':
      return (
        <div
          className={`absolute inset-0 pointer-events-none overflow-hidden z-10 ${className}`}
          style={{ borderRadius: `${radius}px` }}
        >
          <div
            className="absolute inset-[4px] pointer-events-none"
            style={{
              border: `${sw}px solid ${strokeColor}88`,
              borderRadius: `${Math.max(0, radius - 4)}px`,
            }}
          />
          {/* Heraldic crown header */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 flex items-center justify-center">
            <svg className="w-16 h-4" viewBox="0 0 64 16" fill="none">
              <path
                d="M16 12 L24 4 L32 10 L40 4 L48 12 Z"
                stroke={strokeColor}
                strokeWidth={sw}
                fill={`${strokeColor}25`}
              />
              <circle cx="24" cy="3" r="1.5" fill={strokeColor} />
              <circle cx="32" cy="8" r="1.5" fill={strokeColor} />
              <circle cx="40" cy="3" r="1.5" fill={strokeColor} />
            </svg>
          </div>
          {/* Heraldic corners */}
          {['top-1 left-1', 'top-1 right-1 -scale-x-100', 'bottom-1 left-1 -scale-y-100', 'bottom-1 right-1 -scale-100'].map((pos, i) => (
            <svg key={i} className={`absolute ${pos} w-9 h-9`} viewBox="0 0 36 36" fill="none">
              <path d="M3 20 C3 10 10 3 20 3 M8 8 L16 16" stroke={strokeColor} strokeWidth={sw} strokeLinecap="round" />
            </svg>
          ))}
        </div>
      );

    case 'floral-wreath':
    default:
      return (
        <div
          className={`absolute inset-0 pointer-events-none overflow-hidden z-10 ${className}`}
          style={{ borderRadius: `${radius}px` }}
        >
          <div
            className="absolute inset-[3px] pointer-events-none"
            style={{
              border: `${sw}px solid ${strokeColor}66`,
              borderRadius: `${Math.max(0, radius - 3)}px`,
            }}
          />
          {/* Floral vine corner sprays */}
          {['top-1 left-1', 'top-1 right-1 -scale-x-100', 'bottom-1 left-1 -scale-y-100', 'bottom-1 right-1 -scale-100'].map((pos, i) => (
            <svg key={i} className={`absolute ${pos} w-10 h-10`} viewBox="0 0 40 40" fill="none">
              <path
                d="M4 24 C4 12 12 4 24 4 M6 8 C10 6 12 10 10 14 M8 16 C12 14 16 18 14 22"
                stroke={strokeColor}
                strokeWidth={sw * 1.1}
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="6" cy="6" r="1.5" fill={strokeColor} />
              <circle cx="14" cy="8" r="1" fill={strokeColor} />
              <circle cx="8" cy="14" r="1" fill={strokeColor} />
            </svg>
          ))}
        </div>
      );
  }
};

export default ClassicBorderFrame;
