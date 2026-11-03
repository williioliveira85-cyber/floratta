import React, { useState } from 'react';
import { ShoppingBag, Share2, Sparkles, ChevronRight, Eye, MessageCircle, Instagram, Facebook, Heart } from 'lucide-react';
import type { Product, StoreSettings } from '../types';

interface ProductCardProps {
  product: Product;
  settings: StoreSettings;
  isFavorite?: boolean;
  onOpenDetail: (product: Product) => void;
  onOpenSimulator: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleFavorite?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  settings,
  isFavorite,
  onOpenDetail,
  onOpenSimulator,
  onAddToCart,
  onToggleFavorite
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80'];

  const handleShareWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = encodeURIComponent(
      `*Floratta Cosmético*\n🌸 *${product.name}*\nPreço: R$ ${product.price.toFixed(2).replace('.', ',')} (em até 12x no Carnê)\n\nVeja as fotos do produto:\n${images.join('\n')}\n\nConheça nosso aplicativo exclusivo!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    setShowShareMenu(false);
  };

  const handleShareSocial = (platform: 'instagram' | 'facebook', e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Confira ${product.name} na Floratta Cosmético em até 12x no Carnê!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      if (platform === 'facebook') {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
      } else {
        navigator.clipboard.writeText(`${product.name} - Floratta Cosmético: ${images[0]}`);
        alert('Link e fotos do produto copiados para você postar nos seus Stories do Instagram!');
      }
    }
    setShowShareMenu(false);
  };

  return (
    <div className="relative group rounded-3xl glass-card glass-card-hover overflow-hidden flex flex-col border border-purple-500/20 transition-all duration-300">
      {/* Product Image Gallery with thumbnail dots */}
      <div
        onClick={() => onOpenDetail(product)}
        className="relative h-56 sm:h-64 w-full overflow-hidden bg-purple-950/40 cursor-pointer"
      >
        <img
          src={images[activeImageIndex]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12091c] via-transparent to-transparent opacity-80" />

        {/* Brand / Tag Badge */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-fuchsia-300 border border-fuchsia-500/30 uppercase tracking-wider">
            {product.brand}
          </span>
          {product.isFeatured && (
            <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-[10px] font-bold text-white shadow-md flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-yellow-300" />
              <span>Destaque</span>
            </span>
          )}
        </div>

        {/* Floating Heart & Share Buttons */}
        <div className="absolute top-3 right-3 z-20 flex items-center space-x-1.5">
          {/* Floating Heart Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(product);
            }}
            className={`w-8 h-8 rounded-full border transition flex items-center justify-center shadow-lg cursor-pointer ${
              isFavorite
                ? 'bg-rose-600 border-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.7)] scale-105'
                : 'bg-black/60 hover:bg-rose-950/80 border-purple-500/30 text-purple-200 hover:text-rose-400'
            }`}
            title={isFavorite ? 'Remover dos Favoritos' : 'Salvar nos Favoritos'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
          </button>

          {/* Share Button Trigger */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowShareMenu(!showShareMenu);
            }}
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-fuchsia-600 border border-purple-500/30 text-white flex items-center justify-center transition shadow-lg cursor-pointer"
            title="Compartilhar no WhatsApp, Instagram e Facebook"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          {/* Social Share Popover Menu */}
          {showShareMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-10 w-48 p-2 rounded-2xl glass-panel border border-fuchsia-500/40 shadow-2xl z-30 animate-fade-in space-y-1"
            >
              <button
                onClick={handleShareWhatsApp}
                className="w-full px-3 py-2 rounded-xl hover:bg-emerald-600/25 text-emerald-300 hover:text-emerald-200 text-xs font-semibold flex items-center space-x-2 transition cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp c/ Fotos</span>
              </button>
              <button
                onClick={(e) => handleShareSocial('instagram', e)}
                className="w-full px-3 py-2 rounded-xl hover:bg-pink-600/25 text-pink-300 hover:text-pink-200 text-xs font-semibold flex items-center space-x-2 transition cursor-pointer"
              >
                <Instagram className="w-4 h-4 text-pink-400" />
                <span>Instagram Stories</span>
              </button>
              <button
                onClick={(e) => handleShareSocial('facebook', e)}
                className="w-full px-3 py-2 rounded-xl hover:bg-blue-600/25 text-blue-300 hover:text-blue-200 text-xs font-semibold flex items-center space-x-2 transition cursor-pointer"
              >
                <Facebook className="w-4 h-4 text-blue-400" />
                <span>Facebook Feed</span>
              </button>
            </div>
          )}
        </div>

        {/* Multi-Photo Dots Selector if multiple images exist */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-1.5 z-10 pointer-events-auto">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  activeImageIndex === idx
                    ? 'w-6 bg-fuchsia-400 shadow-[0_0_8px_rgba(217,70,239,0.8)]'
                    : 'bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Ver foto ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Floating Quick Add to Cart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="absolute bottom-2.5 right-2.5 z-20 w-10 h-10 rounded-2xl btn-floating flex items-center justify-center shadow-[0_4px_20px_rgba(217,70,239,0.6)] cursor-pointer transition-transform hover:scale-110 active:scale-95"
          title="Adicionar à Sacola"
        >
          <ShoppingBag className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Card Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div onClick={() => onOpenDetail(product)} className="cursor-pointer">
          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-fuchsia-300 transition-colors line-clamp-1 mb-1">
            {product.name}
          </h3>
          <p className="text-xs text-purple-200/70 line-clamp-2 mb-3">
            {product.description}
          </p>
        </div>

        {/* Pricing button triggers simulator */}
        <div className="pt-2 border-t border-purple-500/15">
          <div
            onClick={() => onOpenSimulator(product)}
            className="p-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-fuchsia-500/20 hover:border-fuchsia-400/40 transition cursor-pointer mb-3"
            title="Clique para simular parcelamento em até 12x no carnê"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-purple-300 uppercase tracking-wider block">
                  À vista ou no Carnê:
                </span>
                <span className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-fuchsia-200 to-white">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="text-right flex items-center space-x-1 text-fuchsia-300 text-xs font-semibold">
                <span>Simular parcelas</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
            <span className="text-[11px] text-fuchsia-300/80 block mt-1">
              ou em até <strong>12x no Carnê</strong> próprio Floratta
            </span>
          </div>

          {/* Quick Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onOpenDetail(product)}
              className="py-2.5 px-3 rounded-xl glass-card hover:bg-purple-900/40 border border-purple-500/30 text-purple-200 hover:text-white text-xs font-semibold flex items-center justify-center space-x-1 flex-1 transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ver Fotos</span>
            </button>

            <button
              onClick={() => onAddToCart(product)}
              className="py-2.5 px-3 rounded-xl btn-floating text-xs font-bold flex items-center justify-center space-x-1.5 flex-1 cursor-pointer transition"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Comprar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
