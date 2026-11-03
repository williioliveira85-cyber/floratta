import React from 'react';
import { Sparkles, ShoppingBag, Search, Mic, Shield, Smartphone, Heart, User, CheckCircle } from 'lucide-react';
import type { StoreSettings } from '../types';

interface NavbarProps {
  clientName: string;
  cartCount: number;
  favoritesCount: number;
  settings: StoreSettings;
  canInstallPwa: boolean;
  hasUnreadNotification?: boolean;
  onOpenCart: () => void;
  onOpenFavorites: () => void;
  onOpenAiSearch: () => void;
  onOpenAdmin: () => void;
  onInstallPwa: () => void;
  onOpenMyCarne: () => void;
  onOpenTracking?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  clientName,
  cartCount,
  favoritesCount,
  settings,
  canInstallPwa,
  hasUnreadNotification,
  onOpenCart,
  onOpenFavorites,
  onOpenAiSearch,
  onOpenAdmin,
  onInstallPwa,
  onOpenMyCarne,
  onOpenTracking
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-purple-500/20 px-3 sm:px-6 py-2.5 sm:py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-fuchsia-600 to-purple-600 p-0.5 shadow-[0_0_20px_rgba(217,70,239,0.5)]">
            <div className="w-full h-full rounded-2xl bg-black/80 flex items-center justify-center">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-fuchsia-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-base sm:text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-fuchsia-200 to-white">
                Floratta Cosmético
              </h1>
            </div>
            <p className="text-[10px] text-purple-300/70 hidden sm:block">
              Perfumaria fina & Cosméticos exclusivos no Carnê
            </p>
          </div>
        </div>

        {/* Center / Search bar trigger */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <button
            onClick={onOpenAiSearch}
            className="w-full px-4 py-2 rounded-2xl bg-purple-950/40 hover:bg-purple-900/40 border border-purple-500/30 text-purple-300/70 text-xs flex items-center justify-between transition cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <Search className="w-3.5 h-3.5 text-purple-400" />
              <span>Buscar perfumes, batons ou falar com a IA...</span>
            </div>
            <div className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-fuchsia-600/30 text-fuchsia-300 text-[10px] font-bold">
              <Mic className="w-3 h-3 text-fuchsia-400" />
              <span>Voz</span>
            </div>
          </button>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5">
          {/* Install PWA on Android button */}
          {canInstallPwa && (
            <button
              onClick={onInstallPwa}
              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] font-bold flex items-center space-x-1.5 shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer transition hover:scale-105"
              title="Instalar aplicativo no seu celular Android"
            >
              <Smartphone className="w-3.5 h-3.5 animate-bounce" />
              <span className="hidden sm:inline">Instalar App</span>
            </button>
          )}

          {/* AI Search Icon on mobile */}
          <button
            onClick={onOpenAiSearch}
            className="md:hidden w-8 h-8 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 text-purple-200 flex items-center justify-center transition cursor-pointer"
            title="Busca por IA e Voz"
          >
            <Sparkles className="w-4 h-4 text-fuchsia-400" />
          </button>

          {/* Favorites Button with Counter */}
          <button
            onClick={onOpenFavorites}
            className="relative p-2 sm:px-3 sm:py-2 rounded-xl bg-purple-950/60 hover:bg-rose-950/60 border border-purple-500/30 text-white flex items-center space-x-1.5 transition cursor-pointer"
            title="Meus Produtos Favoritos"
          >
            <Heart className={`w-4 h-4 ${favoritesCount > 0 ? 'text-rose-400 fill-rose-400' : 'text-purple-300'}`} />
            <span className="text-xs font-bold hidden sm:inline">Favoritos</span>
            {favoritesCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center shadow">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Cart Bag (Always Visible) */}
          <button
            onClick={onOpenCart}
            className="relative p-2 sm:px-3 sm:py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 text-white flex items-center space-x-1.5 transition cursor-pointer"
            title="Minha Sacola"
          >
            <ShoppingBag className="w-4 h-4 text-fuchsia-300" />
            <span className="text-xs font-bold hidden sm:inline">Sacola</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-extrabold text-[10px] flex items-center justify-center shadow-lg animate-pulse">
                {cartCount}
              </span>
            )}
          </button>

          {/* Admin Web Panel Trigger */}
          <button
            onClick={onOpenAdmin}
            className="px-2.5 py-1.5 rounded-xl bg-purple-900/30 hover:bg-purple-900/80 border border-purple-500/30 text-purple-200 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
            title="Área de Gestão do Administrador"
          >
            <Shield className="w-3.5 h-3.5 text-fuchsia-400" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
};
