import React, { useState } from 'react';
import { X, ShoppingBag, Share2, MessageCircle, Instagram, Facebook, Sparkles, Calculator, Check, ArrowRight } from 'lucide-react';
import type { Product, StoreSettings } from '../types';

interface ProductDetailModalProps {
  product: Product;
  settings: StoreSettings;
  onClose: () => void;
  onOpenSimulator: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  settings,
  onClose,
  onOpenSimulator,
  onAddToCart
}) => {
  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80'];

  const [activeImage, setActiveImage] = useState(images[0]);
  const [added, setAdded] = useState(false);

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `*Floratta Cosmético*\n🌸 *${product.name}*\nPreço: R$ ${product.price.toFixed(2).replace('.', ',')} (em até 12x no Carnê)\n\nVeja as fotos do produto:\n${images.join('\n')}\n\nConheça nosso aplicativo exclusivo!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleAddToCart = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl my-6 rounded-3xl glass-panel border border-fuchsia-500/35 overflow-hidden shadow-2xl">
        {/* Header close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/70 hover:bg-black/90 border border-purple-500/30 text-purple-200 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Gallery Column */}
          <div className="p-5 sm:p-6 bg-purple-950/30 border-b md:border-b-0 md:border-r border-purple-500/20 flex flex-col justify-between">
            <div className="relative h-72 sm:h-80 w-full rounded-2xl overflow-hidden bg-black/50 border border-purple-500/30 mb-3 shadow-inner">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300"
              />
              {product.isFeatured && (
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-xs font-bold text-white shadow-md flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Destaque</span>
                </div>
              )}
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div>
                <span className="text-[11px] text-purple-300/80 mb-1.5 block font-medium">
                  Galeria de Fotos ({images.length} fotos disponíveis):
                </span>
                <div className="flex space-x-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition cursor-pointer ${
                        activeImage === img
                          ? 'border-fuchsia-400 shadow-[0_0_12px_rgba(217,70,239,0.7)] scale-105'
                          : 'border-purple-500/30 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest">
                  {product.brand}
                </span>
                {product.volume && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-950/70 border border-purple-500/30 text-purple-300">
                    {product.volume}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2 leading-tight">
                {product.name}
              </h2>

              <p className="text-xs sm:text-sm text-purple-200/80 mb-4 leading-relaxed">
                {product.description}
              </p>

              {/* Notes / Formula details if available */}
              {product.notes && (
                <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/25 mb-4 text-xs">
                  <span className="text-fuchsia-300 font-semibold block mb-0.5">Pirâmide Olfativa / Detalhes:</span>
                  <span className="text-purple-200/90">{product.notes}</span>
                </div>
              )}

              {/* Price & Installment Button */}
              <div
                onClick={() => {
                  onClose();
                  onOpenSimulator(product);
                }}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-900/40 to-fuchsia-950/40 border border-fuchsia-500/30 hover:border-fuchsia-400 transition cursor-pointer mb-5"
                title="Clique para ver todas as opções no Carnê"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-purple-300">Preço à vista:</span>
                  <div className="flex items-center space-x-1 text-fuchsia-300 text-xs font-semibold">
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Ver parcelas</span>
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-fuchsia-200 to-white">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </div>
                <div className="text-xs text-fuchsia-300/90 mt-1 flex items-center justify-between">
                  <span>Ou até <strong>12x no Carnê</strong></span>
                  <span className="text-[11px] underline">Simular agora</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              <button
                onClick={handleAddToCart}
                className="w-full py-3.5 px-6 rounded-2xl btn-floating font-bold text-sm flex items-center justify-center space-x-2 cursor-pointer transition"
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Adicionado à Sacola!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Adicionar à Sacola</span>
                  </>
                )}
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="w-full py-2.5 px-4 rounded-2xl glass-card hover:bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 font-semibold text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Compartilhar fotos no WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
