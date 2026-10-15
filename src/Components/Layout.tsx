import { useRef, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../Pages/Header';
import CartHeader from './CartHeader';
import Footer from '../Pages/Footer';
import ThemeBackground from './ThemeBackground';

export default function Layout() {
    const location = useLocation();
    const isLoginPage = location.pathname.startsWith('/login');
    const isAccountPage =
        location.pathname.startsWith('/account') ||
        location.pathname.startsWith('/myaccount') ||
        location.pathname.startsWith('/my/account') ||
        location.pathname.startsWith('/profile') ||
        location.pathname.startsWith('/my/profile') ||
        location.pathname.startsWith('/orders') ||
        location.pathname.startsWith('/addresses') ||
        location.pathname.startsWith('/my/address');

    const isCartPage =
        location.pathname.startsWith('/cart') ||
        location.pathname.startsWith('/checkout') ||
        location.pathname.startsWith('/address') ||
        location.pathname.startsWith('/payment');

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to top when page path changes
    useEffect(() => {
        scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'instant' });
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [location.pathname]);

    return (
        <div className="h-screen w-full flex flex-col overflow-hidden relative">
            {/* Global Fixed Theme Background Wallpaper (Colors & Sticker Doodles across entire website) */}
            <ThemeBackground isFixed />

            {/* Header Navigation: CartHeader for Cart, Standard Header for all other pages */}
            {isCartPage ? (
                <div className="relative z-20 shrink-0">
                    <CartHeader />
                </div>
            ) : (
                <div className={`relative z-20 shrink-0 ${isAccountPage ? 'hidden lg:block' : ''}`}>
                    <Header />
                </div>
            )}

            {/* Main Scrollable Viewport */}
            <div
                ref={scrollContainerRef}
                id="app-scroll-container"
                className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative z-10"
            >
                <main className="flex-grow flex flex-col">
                    <Outlet />
                </main>
                {!isLoginPage && !isAccountPage && <Footer />}
                {isAccountPage && (
                    <div className="hidden lg:block">
                        <Footer />
                    </div>
                )}
            </div>
        </div>
    );
}
