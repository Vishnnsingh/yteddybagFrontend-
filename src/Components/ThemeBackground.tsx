import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useHeaderNavigation } from '../Context/HeaderNavigationContext';

interface ThemeBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  minHeight?: string;
  isFixed?: boolean;
}

export default function ThemeBackground({
  children,
  className = '',
  contentClassName = '',
  minHeight = 'min-h-[calc(100vh-64px)]',
  isFixed = false,
}: ThemeBackgroundProps) {
  const { bgTheme } = useHeaderNavigation();
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );

  let isLoginPage = false;
  try {
    const location = useLocation();
    isLoginPage = location.pathname.startsWith('/login');
  } catch (_) {
    isLoginPage = typeof window !== 'undefined' ? window.location.pathname.startsWith('/login') : false;
  }

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine current active configuration (Mobile vs Desktop)
  const activeConfig = useMemo(() => {
    if (!bgTheme) return null;
    return isMobile ? bgTheme.mobile : bgTheme.desktop;
  }, [bgTheme, isMobile]);

  // If on login page and admin has NOT turned ON "apply_to_login", keep original default login background
  const shouldKeepOriginalOnLogin = isLoginPage && !activeConfig?.apply_to_login;

  const bgStyle = useMemo(() => {
    // When on login page and apply_to_login is OFF, or when bg_type is default
    if (shouldKeepOriginalOnLogin || !activeConfig || activeConfig.bg_type === 'default') {
      // Original Default YTeddybags Login Background Gradient
      return {
        background: 'linear-gradient(to bottom, rgba(253, 240, 236, 0.7) 0%, rgba(253, 245, 242, 0.5) 50%, rgba(253, 240, 236, 0.8) 100%)',
      };
    }

    if (activeConfig.use_gradient && activeConfig.gradient_to) {
      return {
        background: `linear-gradient(to bottom, ${activeConfig.bg_color || '#FDF0EC'}, ${activeConfig.gradient_to || '#FDF5F2'})`,
      };
    }

    return {
      backgroundColor: activeConfig.bg_color || '#FDF0EC',
    };
  }, [activeConfig, shouldKeepOriginalOnLogin]);

  // Compute repeating doodle pattern parameters
  const patternData = useMemo(() => {
    // If on login page and apply_to_login is OFF, do not show custom doodle pattern
    if (shouldKeepOriginalOnLogin) {
      return null;
    }

    if (!activeConfig || !activeConfig.doodles) return null;

    // Filter to only doodles marked active
    const activeDoodles = activeConfig.doodles.filter((d) => d.isActive !== false);
    if (activeDoodles.length === 0) {
      return null;
    }

    const size = Math.max(15, activeConfig.pattern_size || (isMobile ? 40 : 55));
    const gap = Math.max(20, activeConfig.pattern_gap || (isMobile ? 50 : 65));
    const opacity = Math.min(1, Math.max(0.02, activeConfig.pattern_opacity ?? 0.25));

    // Stagger layout in grid for natural scattered wallpaper look
    const cols = activeDoodles.length === 1 ? 2 : activeDoodles.length <= 4 ? 2 : 3;
    const rows = Math.max(2, Math.ceil(activeDoodles.length / cols));
    const cellWidth = size + gap;
    const cellHeight = size + gap;
    const totalWidth = cellWidth * cols;
    const totalHeight = cellHeight * rows;

    const items = activeDoodles.map((doodle, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      // Alternate offsets for cute scattered sticker wallpaper look
      const offsetX = col * cellWidth + (row % 2 === 1 ? gap * 0.35 : gap * 0.15);
      const offsetY = row * cellHeight + (col % 2 === 1 ? gap * 0.25 : gap * 0.1);

      return {
        id: doodle.id || `doodle-${index}`,
        url: doodle.url,
        x: offsetX,
        y: offsetY,
        width: size,
        height: size,
      };
    });

    // If only 1 doodle is uploaded, add a second offset instance to scatter it across the tile
    if (activeDoodles.length === 1) {
      const single = activeDoodles[0];
      items.push({
        id: `${single.id}-repeat`,
        url: single.url,
        x: cellWidth + gap * 0.3,
        y: cellHeight + gap * 0.2,
        width: size,
        height: size,
      });
    }

    return {
      patternWidth: totalWidth,
      patternHeight: totalHeight,
      opacity,
      items,
    };
  }, [activeConfig, isMobile, shouldKeepOriginalOnLogin]);

  // If used as a fixed background for whole site layout
  if (isFixed) {
    return (
      <div
        className={`fixed inset-0 w-full h-full pointer-events-none select-none -z-10 overflow-hidden transition-colors duration-300 ${className}`}
        style={bgStyle}
        aria-hidden="true"
      >
        {patternData && (
          <svg
            aria-hidden="true"
            className="absolute inset-0 w-full h-full pointer-events-none select-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="yteddy-global-bg-doodle-pattern"
                x="0"
                y="0"
                width={patternData.patternWidth}
                height={patternData.patternHeight}
                patternUnits="userSpaceOnUse"
              >
                {patternData.items.map((item) => (
                  <image
                    key={item.id}
                    href={item.url}
                    xlinkHref={item.url}
                    x={item.x}
                    y={item.y}
                    width={item.width}
                    height={item.height}
                    opacity={patternData.opacity}
                    preserveAspectRatio="xMidYMid meet"
                  />
                ))}
              </pattern>
            </defs>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="url(#yteddy-global-bg-doodle-pattern)"
            />
          </svg>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative w-full ${minHeight} flex flex-col transition-colors duration-300 ${className}`}
      style={bgStyle}
    >
      {/* Background Doodle Pattern Overlay */}
      {patternData && (
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none select-none z-0"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="yteddy-bg-doodle-pattern"
              x="0"
              y="0"
              width={patternData.patternWidth}
              height={patternData.patternHeight}
              patternUnits="userSpaceOnUse"
            >
              {patternData.items.map((item) => (
                <image
                  key={item.id}
                  href={item.url}
                  xlinkHref={item.url}
                  x={item.x}
                  y={item.y}
                  width={item.width}
                  height={item.height}
                  opacity={patternData.opacity}
                  preserveAspectRatio="xMidYMid meet"
                />
              ))}
            </pattern>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#yteddy-bg-doodle-pattern)"
          />
        </svg>
      )}

      {/* Main Foreground Content */}
      <div className={`relative z-10 w-full flex-1 flex flex-col ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
}
