import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { WishlistDrawer } from '@/components/wishlist/WishlistDrawer';

export const MainLayout = () => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Header onSearchOpen={() => setSearchOpen(true)} />
      <main className="flex-1">
        <Outlet context={{ searchOpen, setSearchOpen }} />
      </main>
      <Footer />

      {/* Drawers — rendered at root level so they overlay everything */}
      <CartDrawer />
      <WishlistDrawer />
    </div>
  );
};
