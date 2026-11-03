import React from 'react';
import { Home, Grid, Sparkles, CreditCard, ShoppingBag, Heart, Truck } from 'lucide-react';

interface MobileNavProps {
  currentTab: string;
  cartCount: number;
  favoritesCount: number;
  hasActiveOrder?: boolean;
  onSelectTab: (tab: string) => void;
  onOpenAiSearch: () => void;
  onOpenCart: () => void;
  onOpenMyCarne: () => void;
  onOpenFavorites: () => void;
  onOpenTracking?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentTab,
  cartCount,
  favoritesCount,
  hasActiveOrder,
  onSelectTab,
  onOpenAiSearch,
  onOpenCart,
  onOpenMyCarne,
  onOpenFavorites,
  onOpenTracking
}) => {
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-purple-500/25 px-2 py-2 flex items-center justify-around pb-safe">
      <button
        onClick={() => onSelectTab('home')}
        className={`flex flex-col items-center justify-center p-1.5 transition ${
          currentTab === 'home' ? 'text-fuchsia-400 font-bold' : 'text-purple-300/70 hover:text-white'
        }`}
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Início</span>
      </button>

      <button
        onClick={() => onSelectTab('catalogo')}
        className={`flex flex-col items-center justify-center p-1.5 transition ${
          currentTab === 'catalogo' ? 'text-fuchsia-400 font-bold' : 'text-purple-300/70 hover:text-white'
        }`}
      >
        <Grid className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Catálogo</span>
      </button>

      {/* Floating Center AI / Voice Button */}
      <button
        onClick={onOpenAiSearch}
        className="flex flex-col items-center justify-center -mt-5 relative cursor-pointer"
      >
        <div className="w-12 h-12 rounded-full btn-floating flex items-center justify-center shadow-[0_0_20px_rgba(217,70,239,0.7)]">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <span className="text-[10px] font-bold text-fuchsia-300 mt-1">Busca IA</span>
      </button>

      {/* Favorites */}
      <button
        onClick={onOpenFavorites}
        className="flex flex-col items-center justify-center p-1.5 relative text-purple-300/70 hover:text-white transition"
      >
        <div className="relative">
          <Heart className={`w-5 h-5 mb-0.5 ${favoritesCount > 0 ? 'text-rose-400 fill-rose-400' : ''}`} />
          {favoritesCount > 0 && (
            <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center">
              {favoritesCount}
            </span>
          )}
        </div>
        <span className="text-[10px]">Favoritos</span>
      </button>

      {/* Entrega ou Meu Carnê */}
      <button
        onClick={onOpenTracking ? onOpenTracking : onOpenMyCarne}
        className={`flex flex-col items-center justify-center p-1.5 transition ${
          currentTab === 'carne' ? 'text-fuchsia-400 font-bold' : 'text-purple-300/70 hover:text-white'
        }`}
      >
        <Truck className="w-5 h-5 mb-0.5 text-fuchsia-400" />
        <span className="text-[10px]">Entrega</span>
      </button>

      {/* Sacola (Always visible) */}
      <button
        onClick={onOpenCart}
        className="flex flex-col items-center justify-center p-1.5 relative text-purple-300/70 hover:text-white transition"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5 mb-0.5 text-fuchsia-300" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-pink-500 text-white font-bold text-[9px] flex items-center justify-center animate-pulse">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px]">Sacola</span>
      </button>
    </nav>
  );
};
